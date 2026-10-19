const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),helper=path.join(__dirname,'helpers/browser.cjs');
const sourceFiles=['core/time.js','core/presentation.js','core/history.js','core/search.js','core/state.js','core/combinations.js','core/navigation.js','core/reading.js','core/view-link.js','adapters/storage.js','adapters/timeline-dom.js','ui/view.js','app.js','ui/search-details.js','ui/timeline.js','ui/navigation-details.js','ui/controls.js','startup.js'];
const source=sourceFiles.map(file=>fs.readFileSync(path.join(root,'src',file),'utf8')).join('\n');
const plain=value=>JSON.parse(JSON.stringify(value));
async function dataset(name='qin-han'){
 const {compileAtlas}=await import('../lib/atlas.mjs');
 return compileAtlas(JSON.parse(fs.readFileSync(path.join(root,name==='zhou'?'data/atlas.json':`data/examples/${name}.json`),'utf8')));
}
function bootSource(data,store={}){
 // Reuse the original browser boundary unchanged, but supply current sources in
 // memory. No dist rebuild and no writes outside this test's declared scope.
 const actualRequire=createRequire(helper),module={exports:{}},replacement={...fs,readFileSync(file,...args){
  const normalized=String(file).replaceAll('\\','/');
  if(normalized.endsWith('/dist/data.js'))return 'window.ZHOU_DATA='+JSON.stringify(data)+';';
  if(normalized.endsWith('/dist/app.js'))return source;
  if(normalized.endsWith('/dist/study.js'))return fs.readFileSync(path.join(root,'src/study.js'),'utf8');
  return fs.readFileSync(file,...args);
 }};
 vm.runInNewContext(fs.readFileSync(helper,'utf8'),{require:id=>id==='node:fs'?replacement:actualRequire(id),module,exports:module.exports,__dirname:path.dirname(helper),console,AbortController,Blob,TextEncoder,Uint8Array,DataView,Date,Math},{filename:helper});
 const app=module.exports.boot(store);app.ctx.URLSearchParams=URLSearchParams;app.attachStudy=()=>module.exports.attachStudy(app);return app;
}
function jump(app,era,year){app.el('#yearEra').value=era;app.el('#year').value=String(year);app.el('#jump').onsubmit({preventDefault(){}});}
function addDatedEvent(data,year=0){
 data.events.push({...plain(data.events[0]),id:'test-ce-event',name:'公元测试事件',year,states:[data.states[1].id],participants:[]});
 return data;
}
test('周朝初始范围、四个配置组合及分期保持兼容',async()=>{
 const app=bootSource(await dataset('zhou'));
 assert.deepEqual(plain(app.run('timelineBounds')),{start:1046,end:221,defaultEnd:256,cursor:770});
 assert.equal(app.run('builtInCombos.length'),4);assert.equal(app.run('builtInCombos[0].id'),'builtin-seven');
 assert.match(app.el('#chart').innerHTML,/西周/);assert.match(app.el('#chart').innerHTML,/春秋/);assert.match(app.el('#chart').innerHTML,/战国/);
 assert.equal(app.el('#yearEra').value,'BCE');assert.equal(app.el('#year').value,770);
 app.run("applyCombo('builtin-seven')");assert.equal(app.run('cursor'),300);assert.equal(app.run('end'),221);
});
test('秦汉跨公元资料可使用旧browser helper启动，0明确显示公元1年',async()=>{
 const data=await dataset(),app=bootSource(data);
 assert.equal(app.run('cursor'),0);assert.equal(app.el('#cursorOutput').textContent,'公元1年');
 assert.equal(app.el('#yearEra').value,'CE');assert.equal(app.el('#year').value,1);
 assert.equal(app.el('#cursorYear').min,0-data.timeline.start);assert.equal(app.el('#cursorYear').max,0-data.timeline.defaultEnd);
 assert.match(app.el('#compare').innerHTML,/汉平帝/);assert.match(app.el('#chart').innerHTML,/公元/);
 assert.match(app.el('.periods').innerHTML,/西汉/);assert.doesNotMatch(app.el('.periods').innerHTML,/西周|春秋|战国/);
 assert.equal(app.run('builtInCombos.length'),0);assert.equal(app.el('#seven').hidden,true);
 assert.equal(app.run('x(0)-x(1)'),4);assert.equal(app.run('x(-1)-x(0)'),4);
 app.run('showAbout()');assert.doesNotMatch(app.el('#detailBody').innerHTML,/周王室|17个|前1046/);
 for(const s of data.states)app.run(`showState(${JSON.stringify(s.id)})`);
 for(const s of data.states)for(const r of s.rulers)app.run(`showRuler(${JSON.stringify(r.id)})`);
 for(const e of data.events)app.run(`showEvent(${JSON.stringify(e.id)})`);
});
test('BCE/CE输入显式区分并保留默认BCE，slider负坐标跨越公元无零年',async()=>{
 const app=bootSource(await dataset());
 jump(app,'BCE',1);assert.equal(app.run('cursor'),1);assert.equal(app.el('#cursorOutput').textContent,'前1年');
 jump(app,'CE',1);assert.equal(app.run('cursor'),0);jump(app,'CE',2);assert.equal(app.run('cursor'),-1);
 jump(app,'CE',0);assert.equal(app.run('cursor'),-1);jump(app,'BCE',0);assert.equal(app.run('cursor'),-1);jump(app,'CE',1.5);assert.equal(app.run('cursor'),-1);
 app.el('#cursorYear').oninput({target:{value:'0'}});assert.equal(app.el('#cursorOutput').textContent,'公元1年');
 app.el('#cursorYear').oninput({target:{value:'1'}});assert.equal(app.el('#cursorOutput').textContent,'公元2年');
 const html=fs.readFileSync(path.join(root,'src/index.html'),'utf8');assert.match(html,/id="yearEra"[^]*?value="BCE"[^]*?value="CE"/);assert.match(html,/id="exportFromEra"/);assert.match(html,/id="exportToEra"/);
});
test('公元零坐标搜索、人物活动、事件详情和延伸视窗不被truthiness吞掉',async()=>{
 const data=addDatedEvent(await dataset(),-1);data.timeline.defaultEnd=0;data.timeline.cursor=1;
 const person=data.people.find(p=>p.id==='exqh-person-liu-kan');person.journey[0].year=0;data.events.find(e=>e.id==='exqh-event-ping-accession').year=0;
 const app=bootSource(data);app.run("openSearchResult('person:exqh-person-liu-kan')");assert.equal(app.run('cursor'),0);assert.match(app.el('#detailBody').innerHTML,/公元1年/);
 app.run("showEvent('test-ce-event')");assert.equal(app.run('cursor'),-1);assert.equal(app.run('end'),-219);assert.equal(app.el('#extend').checked,true);
 assert.match(app.el('#detailBody').innerHTML,/公元2年/);app.run('setExtension(false)');assert.equal(app.run('end'),0);assert.equal(app.run('cursor'),0);assert.equal(app.el('#cursorYear').max,0);
 app.run("setPeriod('exqh-period-eastern-han')");assert.equal(app.run('cursor'),0);
});
test('全公元三国资料按配置范围与分期绘图，不注入周朝组合或标签',async()=>{
 const data=await dataset('three-kingdoms'),app=bootSource(data),bounds=app.run('timelineBounds');
 assert(bounds.start<=0);assert.equal(app.el('#cursorYear').min,-bounds.start);assert.equal(app.el('#cursorYear').max,-bounds.defaultEnd);
 assert.equal(app.el('#yearEra').value,'CE');assert.equal(app.run('builtInCombos.length'),0);
 assert.doesNotMatch(app.el('#chart').innerHTML,/西周|春秋|战国|前0年/);assert.match(app.el('#chart').innerHTML,/公元/);
 const p=data.periods.find(p=>p.display!==false&&p.button!==false);app.run(`setPeriod(${JSON.stringify(p.id)})`);assert.equal(app.run('cursor'),Math.min(bounds.start,p.start));
});
test('原生任期sources数组保留原典名称并去重，缺少旧source单URL不崩溃',async()=>{
 const data=await dataset('three-kingdoms'),ruler=data.states.flatMap(s=>s.rulers)[0],native={title:'《三国志》原典入口',url:'https://zh.wikisource.org/wiki/三國志'};
 delete ruler.source;ruler.sources=[native,null,{title:'无URL'},native];ruler.biography={summary:'原生任期来源边界',sources:[native]};
 const app=bootSource(data);app.run(`showRuler(${JSON.stringify(ruler.id)})`);
 const sources=app.el('#detailBody').innerHTML.split('<h4>核查来源</h4>')[1].split('<div class="related">')[0];
 assert.match(sources,/《三国志》原典入口/);assert.doesNotMatch(sources,/《史记》|无URL|href="undefined"/);assert.equal((sources.match(/<a /g)||[]).length,1);
});
test('view/新组合/阅读位置/访问记录写timeEncoding并可恢复CE零负坐标',async()=>{
 const data=await dataset(),app=bootSource(data);app.attachStudy();jump(app,'CE',2);
 assert.equal(app.run('captureDetailFrame().view.timeEncoding'),'bce-axis');
 const combo=app.run("captureCombo('跨公元')");assert.equal(combo.timeEncoding,'bce-axis');assert.equal(combo.cursor,-1);
 app.run("showEvent('exqh-event-ping-accession');closeDetail(false);setCursor(0);saveReadingPosition()");
 const reading=JSON.parse(app.store['zhou-reading-v4']),visits=JSON.parse(app.store['zhou-visits-v4']);
 assert.equal(reading.timeEncoding,'bce-axis');assert.equal(reading.view.timeEncoding,'bce-axis');assert.equal(reading.view.cursor,0);assert.equal(visits[0].timeEncoding,'bce-axis');assert.equal(visits[0].view.timeEncoding,'bce-axis');
 const restored=bootSource(data,{...app.store});restored.attachStudy();assert.equal(restored.run('cursor'),0);assert.equal(restored.run('end'),data.timeline.defaultEnd);
 restored.run('setCursor(-1);saveReadingPosition()');const again=bootSource(data,{...restored.store});again.attachStudy();assert.equal(again.run('cursor'),-1);
});
test('分享快照携带bce-axis标记，公元零坐标与负范围可编解码',async()=>{
 const data=await dataset(),app=bootSource(data);vm.runInContext(fs.readFileSync(path.join(root,'src/share.js'),'utf8'),app.ctx);
 const snapshot=app.run('readSharedView()');assert.equal(snapshot.timeEncoding,'bce-axis');assert.equal(snapshot.view.timeEncoding,'bce-axis');assert.equal(snapshot.view.cursor,0);
 const decoded=app.run("Zhou.createViewLinkCodec(D,searchService).parse(Zhou.createViewLinkCodec(D,searchService).encode(readSharedView()))");
 assert.equal(decoded.view.cursor,0);assert.equal(decoded.view.end,-219);
});
