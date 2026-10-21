'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),helper=path.join(root,'tests/helpers/browser.cjs');
// Read the same source order as production, without a build or any dist writes.
const bundle=fs.readFileSync(path.join(root,'build.mjs'),'utf8').match(/'app\.js':\s*\[([^\]]+)\]/)[1];
const source=[...bundle.matchAll(/'([^']+)'/g)].map(m=>fs.readFileSync(path.join(root,m[1]),'utf8')).join('\n');
const plain=value=>JSON.parse(JSON.stringify(value));
const text=html=>html.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
let cached;
async function data(){
 if(!cached){const {compileAtlas}=await import('../lib/atlas.mjs');cached=compileAtlas(JSON.parse(fs.readFileSync(path.join(root,'data/atlas.json'),'utf8')));}
 return plain(cached);
}
function bootSource(data,store={},width=1200){
 const actualRequire=createRequire(helper),module={exports:{}},replacement={...fs,readFileSync(file,...args){
  const name=String(file).replaceAll('\\','/');
  if(name.endsWith('/dist/data.js'))return 'window.ZHOU_DATA='+JSON.stringify(data)+';';
  if(name.endsWith('/dist/app.js'))return source;
  if(name.endsWith('/dist/study.js'))return fs.readFileSync(path.join(root,'src/study.js'),'utf8');
  return fs.readFileSync(file,...args);
 }};
 vm.runInNewContext(fs.readFileSync(helper,'utf8'),{require:id=>id==='node:fs'?replacement:actualRequire(id),module,exports:module.exports,__dirname:path.dirname(helper),console,AbortController,Blob,TextEncoder,Uint8Array,DataView,Date,Math},{filename:helper});
 const app=module.exports.boot(store,width);app.attachStudy=()=>module.exports.attachStudy(app);return app;
}

test('异说日期支持单年/区间、BCE/CE边界与公元1年的零坐标，不解析文字补造年份',async()=>{
 const app=bootSource(await data());
 for(const [opinion,expected] of [
  [{year:1},'前1年'],[{year:0},'公元1年'],[{year:-1},'公元2年'],
  [{start:3,end:1},'前3—1年'],[{start:0,end:-2},'公元1—3年'],
  [{start:1,end:0},'前1年—公元1年'],[{start:0},'公元1年—终点未定'],
  [{end:0},'起点未定—公元1年'],[{explanation:'约前900年'},'未列出可定位的年份或区间']
 ])assert.equal(app.run(`chronologyOpinionDate(${JSON.stringify(opinion)})`),expected);
});

test('采用区间与所有原异说分卡，保留说明/来源并转义HTML；旧资料不制造第二说',async()=>{
 const app=bootSource(await data()),record={start:1,end:0,dating:{level:'disputed',reason:'原说明 <核查>',reviewStatus:'legacy',alternatives:[{label:'仅有的旧说 <A>',year:0,explanation:'原文 <script> 不足以补另一项',sources:[{title:'原始来源',url:'https://example.test/source'}]}]}};
 const before=JSON.stringify(record);
 app.run(`globalThis.chronologyFixture=${before};Object.freeze(chronologyFixture.dating.alternatives[0].sources);Object.freeze(chronologyFixture.dating.alternatives[0]);Object.freeze(chronologyFixture.dating.alternatives);Object.freeze(chronologyFixture.dating);Object.freeze(chronologyFixture);`);
 const html=app.run('chronologyDatingDetails(chronologyFixture)');
 assert.equal(app.run('JSON.stringify(chronologyFixture)'),before);assert.match(html,/本图采用的图示定位/);assert.match(html,/前1年—公元1年/);assert.match(html,/旧资料尚不足双口径对照/);
 assert.equal((html.match(/class="chronologyAlternative"/g)||[]).length,1);
 assert.match(html,/仅有的旧说 &lt;A&gt;/);assert.match(html,/原说明 &lt;核查&gt;/);assert.doesNotMatch(html,/<script>/);
 assert.match(html,/<a href="https:\/\/example.test\/source" target="_blank" rel="noopener noreferrer">原始来源/);
 record.dating.alternatives.push({label:'已提供的范围',start:1,end:0,explanation:'范围原说明',sources:[]});
 const full=app.run(`chronologyDatingDetails(${JSON.stringify(record)})`);
 assert.equal((full.match(/class="chronologyAlternative"/g)||[]).length,2);assert.doesNotMatch(full,/尚不足双口径/);
});

test('实际君主、事件、政权详情均保留所有原异说与史源，并具备章节入口',async()=>{
 const model=await data(),app=bootSource(model);
 for(const [kind,id,record] of [
  ['ruler','liang-r2',model.states.flatMap(s=>s.rulers).find(r=>r.id==='liang-r2')],
  ['event','e77',model.events.find(e=>e.id==='e77')],
  ['state','qin',model.states.find(s=>s.id==='qin')]
 ]){
  app.run(`show${kind[0].toUpperCase()+kind.slice(1)}(${JSON.stringify(id)})`);
  const html=app.el('#detailBody').innerHTML;
  for(const target of ['detail-dating','detail-sources']){
   assert.match(html,new RegExp('id="'+target+'" tabindex="-1"'));
   assert.match(html,new RegExp('type="button" id="jump-'+target+'"[^>]*data-detail-section="'+target+'"'));
  }
  for(const alt of record.dating.alternatives){
   assert(html.includes(app.run(`escapeHTML(${JSON.stringify(alt.label)})`)));
   assert(html.includes(app.run(`escapeHTML(${JSON.stringify(alt.explanation)})`)));
   for(const s of alt.sources||[])assert(html.includes(app.run(`escapeHTML(${JSON.stringify(s.url)})`)));
  }
 }
});

test('周朝原典措辞和既有长平事件全文基线不变，跳转文案为可见原生按钮值',async()=>{
 const app=bootSource(await data()),fixture=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/zhou-baseline.json'),'utf8'));
 app.run("showEvent('e91')");const html=app.el('#detailBody').innerHTML;
 assert.equal(text(html),fixture.expected.shares[1].detailText);
 assert.match(html,/原典提供记载，公元前年份由纪年表换算；有异说时分别列明。/);
 assert.match(html,/value="纪年与异说"/);assert.match(html,/value="史源核查"/);
 assert.match(html,/aria-label="跳至史源核查"/);assert.doesNotMatch(html,/type="hidden"/);
});

test('原生秦汉事件在公元1年仍按零坐标显示采用与跨公元异说',async()=>{
 const {compileAtlas}=await import('../lib/atlas.mjs');
 const model=compileAtlas(JSON.parse(fs.readFileSync(path.join(root,'data/examples/qin-han.json'),'utf8')));
 const event=model.events.find(e=>e.id==='exqh-event-ping-accession');event.year=0;
 event.dating={level:'disputed',reason:'测试展示边界，不修订史实',reviewStatus:'legacy',alternatives:[{label:'已有范围',start:1,end:0,explanation:'跨公元范围展示',sources:event.sources}]};
 const app=bootSource(model);app.run("showEvent('exqh-event-ping-accession')");const html=app.el('#detailBody').innerHTML;
 assert.match(html,/class="chronologyDate">公元1年/);assert.match(html,/前1年—公元1年/);assert.doesNotMatch(html,/公元前年份由纪年表换算|前0年|公元0年/);
 assert.match(html,/年代由采用的纪年表换算/);assert.equal(app.run('appState.conditions.cursor'),0);
 for(const s of event.sources)assert(html.includes(app.run(`escapeHTML(${JSON.stringify(s.url)})`)));
});

test('未定年链条保持原序/稳定ID和既有详情路由，序号不是定年位置',async()=>{
 const model=await data(),app=bootSource(model),state=model.states.find(s=>s.id==='jin'),before=JSON.stringify(state.undated);
 app.run("showState('jin')");const html=app.el('#detailBody').innerHTML;
 assert.match(html,/id="undated-lineage" tabindex="-1"/);assert.match(html,/序号不是定年位置/);
 const ids=[...html.matchAll(/data-undated-id="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(ids,state.undated.map(r=>r.id));
 for(const r of state.undated){assert(html.includes('data-id="undated:'+r.id+'"'));assert(html.includes(r.name));}
 assert.equal(JSON.stringify(state.undated),before);
 const first=state.undated[0];app.el('#detail').scrollTop=725;
 app.action('searchHit','undated:'+first.id);assert(app.el('#detailBody').innerHTML.includes(first.name));
 assert.equal(app.run('navigation.key'),'undated:'+first.id);app.run('backDetail()');
 assert.equal(app.el('#detailBody').innerHTML,html);assert.equal(app.el('#detail').scrollTop,725);
 app.run("showState('zhou')");assert.doesNotMatch(app.el('#detailBody').innerHTML,/id="undated-lineage"/);
});

test('章节跳转只聚焦白名单内目标，不新增路由；原返回/关闭/阅读滚动仍恢复',async()=>{
 for(const width of [390,1200]){
  const app=bootSource(await data(),{},width);app.attachStudy();app.run("showState('jin')");
  const sections={};for(const id of ['detail-dating','detail-sources','undated-lineage'])sections['#'+id]={focus(options){app.ctx.document.activeElement=this;this.options=options;},scrollIntoView(options){this.scrollOptions=options;}};
  app.el('#detailBody').querySelector=selector=>sections[selector]||null;
  const count=app.run('navigation.frames.length'),key=app.run('navigation.key');app.el('#detail').scrollTop=380;
  const control={dataset:{detailSection:'detail-sources'}};
  app.el('#detailBody').click({target:{closest:()=>control}});
  assert.equal(app.ctx.document.activeElement,sections['#detail-sources']);assert.equal(sections['#detail-sources'].options.preventScroll,true);
  assert.equal(sections['#detail-sources'].scrollOptions.block,'start');assert.equal(app.run('navigation.frames.length'),count);assert.equal(app.run('navigation.key'),key);
  assert.equal(app.run("focusDetailSection('not-an-id')"),false);delete sections['#undated-lineage'];assert.equal(app.run("focusDetailSection('undated-lineage')"),false);
  const parent=app.el('#detailBody').innerHTML;app.el('#detail').scrollTop=654;app.el('#detailBody').scrollTop=37;
  app.run("showRuler('jin-r1')");app.el('#detail').scrollTop=200;app.run('backDetail()');
  assert.equal(app.el('#detailBody').innerHTML,parent);assert.equal(app.el('#detail').scrollTop,654);assert.equal(app.el('#detailBody').scrollTop,37);
  app.run('saveReadingPosition()');const visit=JSON.parse(app.store['zhou-visits-v4']).find(v=>v.key==='country:jin');assert.equal(visit.top,654);
  app.run('closeDetail()');assert.equal(app.el('#detail').open,false);
 }
});

test('新增样式局限详情，响应式单列/可见焦点/44px史源与章节命中目标',()=>{
 const css=fs.readFileSync(path.join(root,'src/ui/chronology.css'),'utf8');
 assert.match(css,/#detail \.chronologyComparison/);assert.match(css,/@media \(max-width: 767px\)/);
 assert.match(css,/grid-template-columns: minmax\(0, 1fr\)/);assert.match(css,/:focus-visible/);
 assert.match(css,/#detail \.sourceLinks a \{[^}]*min-height: 44px/);assert.match(css,/prefers-reduced-motion: reduce/);
 assert.doesNotMatch(css,/overflow-y\s*:/); // no replacement scroll container
});
