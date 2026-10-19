import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {compileAtlas} from '../lib/atlas.mjs';
const require=createRequire(import.meta.url);
const {boot,attachStudy}=require('./helpers/browser.cjs');
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
const freeze=value=>{if(value&&typeof value==='object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value;};
function core(){
 const context=vm.createContext({});
 for(const file of ['time','history','search','state','navigation','reading'])vm.runInContext(read('src/core/'+file+'.js'),context);
 const data=freeze(compileAtlas(JSON.parse(read('data/atlas.json'))));
 return {Zhou:context.Zhou,data,history:context.Zhou.createHistory(data)};
}
test('历史查询独立运行；即位年、中断、条带口径明确分离',()=>{
 const {history,data}=core();
 assert(history.rulersAt('jin',573).some(r=>r.id==='jin-r24'));
 const chen=data.states.find(s=>s.id==='chen'),gap=chen.interruptions[0];
 assert(gap);assert.equal(history.rulersAt('chen',gap.start).length,0);assert.equal(history.rulersAt('chen',gap.end).length,0);
 assert.equal(history.compareYear(gap.start,['chen'])[0].interruption.note,gap.note);
 const model=history.comparison({states:['jin'],from:573,to:573});
 assert(!model.states[0].rulers.some(r=>r.id==='jin-r24'));
 assert.equal(model.chronology.bars,'adopted-table');assert.equal(model.chronology.yearQueries,'verified-accession-and-interruptions');
});
test('对照快照保留版本、关系与来源；输出之间互不影响',()=>{
 const {history,data}=core(),options={states:['zhao','qin','zhao'],from:270,to:250,category:'战争',cursor:260};
 const first=history.comparison(options),second=history.comparison(options);
 assert.deepEqual(plain(first.states.map(s=>s.id)),['zhao','qin']);assert(first.events.some(e=>e.id==='e91'));
 assert.equal(first.version,data.version);assert(first.sources.length);assert.equal(first.stateNames.chu,'楚');
 first.states[0].name='changed';first.events[0].states.push('changed');
 assert.notEqual(second.states[0].name,'changed');assert(!second.events[0].states.includes('changed'));assert.notEqual(data.states.find(s=>s.id==='zhao').name,'changed');
 assert.throws(()=>history.comparison({states:['qin'],from:221,to:500}),/有效范围/);
});
test('搜索按人物ID关联，同名不合并，更名不破坏路由',()=>{
 const {Zhou,data}=core(),changed=plain(data),first=changed.people[0],second=changed.people[1];
 first.name='同名测试';second.name='同名测试';
 const search=Zhou.createSearch(changed),hits=search.search('同名测试').filter(h=>h.entry.type==='person');
 assert.equal(hits.length,2);assert.notEqual(hits[0].entry.key,hits[1].entry.key);
 assert.equal(search.normalizeKey('person:同名测试'),'person:同名测试');
 assert.equal(search.normalizeKey('person:'+first.id),'person:'+first.id);
 first.name='改名测试';const renamed=Zhou.createSearch(changed);assert.equal(renamed.search('改名测试')[0].entry.key,'person:'+first.id);
});
test('浏览器工具与页面同年对照共用即位和中断规则',()=>{
 let tool;const app=boot({},1200,{registerTool(value){tool=value;}});
 let result=tool.execute({year_bce:573});assert(result.states.find(s=>s.state==='晋').rulers.includes('晋悼公'));assert(app.el('#compare').innerHTML.includes('晋悼公'));
 const gap=app.ctx.window.ZHOU_DATA.states.find(s=>s.id==='chen').interruptions[0];result=tool.execute({year_bce:gap.start});assert.equal(result.states.find(s=>s.state==='陈').rulers.length,0);assert(app.el('#compare').innerHTML.includes(gap.note));
});
test('旧姓名阅读记录及搜索目标迁移到ID，仍能返回与续读',()=>{
 const initial=boot(),view=plain(initial.run('captureDetailFrame().view')),person=initial.ctx.window.ZHOU_DATA.people.find(p=>p.name==='商鞅');
 view.searchTarget='person:商鞅';
 const app=attachStudy(boot({'zhou-visits-v4':JSON.stringify([{key:'person:商鞅',view,top:180,at:1}]),'zhou-reading-v4':JSON.stringify({version:4,view,layout:{}})}));
 assert.equal(app.run('searchTarget'),'person:'+person.id);app.el('#lastRead').onclick();assert.equal(app.run('currentDetailKey'),'person:'+person.id);assert.equal(app.el('#detail').scrollTop,180);
 app.run('saveReadingPosition()');assert.equal(JSON.parse(app.store['zhou-visits-v4'])[0].key,'person:'+person.id);
});
test('损坏的布局和阅读字段不阻止页面启动',()=>{
 for(const rowHeights of ['bad',{qin:{toString:null}}]){
  const app=attachStudy(boot({'zhou-layout-v2':JSON.stringify({rowHeight:{toString:null},rowHeights}),'zhou-visits-v4':JSON.stringify([{key:'event:e91',view:{selected:[],px:{toString:null}}}])}));
  assert.equal(app.run('rowHeight'),64);assert.equal(app.run('Object.keys(rowHeights).length'),0);assert(app.el('#chart').innerHTML.includes('stateRow'));
 }
});
test('阅读自动保存使用绑定到浏览器全局的定时器',()=>{
 const app=boot();app.ctx.timerOwner=true;
 app.ctx.setTimeout=function(){assert.equal(this.timerOwner,true,'browser timer must keep its global receiver');return 1;};
 app.ctx.clearTimeout=function(){assert.equal(this.timerOwner,true,'browser timer must keep its global receiver');};
 attachStudy(app);app.run("updateSearch('长平之战');setCursor(260);saveReadingPosition()");
 assert.equal(app.run('cursor'),260);assert.equal(JSON.parse(app.store['zhou-reading-v4']).view.cursor,260);
});
test('结构化导出不依赖Canvas，保留对照顺序和出处',async()=>{
 const app=boot();vm.runInContext(read('dist/export.js'),app.ctx);
 app.el('#exportDownload').appendChild=child=>{app.download=child;};
 app.run("applyCombo('builtin-reform')");app.el('#exportCompare').onclick();app.el('#exportFormat').value='json';
 app.el('#exportFrom').value='400';app.el('#exportTo').value='300';await app.run('createComparisonExport()');
 assert(app.download.download.endsWith('.json'));const result=JSON.parse(await app.ctx.exportedBlob.text());
 assert.deepEqual(result.states.map(s=>s.id),['qin','liang']);assert.equal(result.schemaVersion,1);assert(result.events.length);assert(result.sources.length);
});
