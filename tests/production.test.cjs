const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {boot,attachStudy}=require('./helpers/browser.cjs');
const root=path.resolve(__dirname,'..'),plain=x=>JSON.parse(JSON.stringify(x));
const inputs={
 'qin-han':{sha:'472c34323d4595b549c4a5beaf16cb02cc0954c96666464b7f52c35f6fe369b2',counts:[8,78,74,7,32,19,79]},
 'three-kingdoms':{sha:'123db0ae57aea7a0319d540cc52313acd455575d7e6d07b644898ce16ead4fa2',counts:[5,51,17,5,23,19,32]}
};
const raw=id=>JSON.parse(fs.readFileSync(path.join(root,'data',id+'.json'),'utf8'));
const start=(id,store={},width=1200)=>boot(store,width,undefined,id==='zhou'?'data.js':`data-${id}.js`);
for(const [id,expected] of Object.entries(inputs)){
 test(`正式资料完整收录、输入散列锁定且不修改输入：${id}`,async()=>{
  const bytes=fs.readFileSync(path.join(root,'data',id+'.json'));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),expected.sha);
  const input=raw(id),before=JSON.stringify(input),{compileProduction}=await import('../lib/production.mjs');
  assert.deepEqual(['polities','people','tenures','periods','events','activities','sources'].map(k=>input[k].length),expected.counts);
  const data=compileProduction(input,id);assert.equal(JSON.stringify(input),before);assert.equal(data.datasetId,id);
  for(const type of ['polities','people','tenures','periods','events'])assert.deepEqual(data[type].map(x=>x.id),input[type].map(x=>x.id));
  assert(!data.tenures.some(t=>t.id.startsWith('exqh-')||t.id.startsWith('ex3k-')));
   assert(data.events.every(e=>typeof e.description==='string'&&e.description.length>0));
 });
 for(const width of [1200,390])test(`正式页面可搜索、打开全部实体、分期及结构导出：${id}/${width}`,()=>{
  const app=start(id,{},width),data=app.run('D');
  for(const s of data.states){app.run(`showState(${JSON.stringify(s.id)})`);for(const r of s.rulers)app.run(`showRuler(${JSON.stringify(r.id)})`);}
  for(const e of data.events)app.run(`showEvent(${JSON.stringify(e.id)})`);
  for(const p of data.people)app.run(`showPerson(${JSON.stringify(p.id)})`);
  for(const p of data.periods.filter(p=>p.display!==false&&p.button!==false))app.run(`setPeriod(${JSON.stringify(p.id)})`);
  app.run(`updateSearch(${JSON.stringify(data.people[0].name)})`);assert(app.run('searchMatches().length')>0);
  assert.doesNotMatch(app.el('#chart').innerHTML,/undefined|NaN|前0年/);
  const snap=app.run('historyService.comparison({states:D.states.map(s=>s.id),from:timelineBounds.start,to:timelineBounds.end,cursor:timelineBounds.cursor})');
  assert.equal(snap.datasetId,id);assert.equal(snap.tenures.length,data.tenures.filter(t=>t.start>=data.timeline.end&&t.end<=data.timeline.start).length);assert.equal(snap.events.length,data.events.length);
 });
}
test('正式资料图形导出分页保留出处、完整跨元区间和上下文身份说明',()=>{
 for(const id of Object.keys(inputs)){
  const app=start(id);require('node:vm').runInContext(fs.readFileSync(path.join(root,'dist/export.js'),'utf8'),app.ctx);
  const plan=app.run(`Zhou.buildExportPlan(historyService.comparison({states:D.states.map(s=>s.id),from:timelineBounds.start,to:timelineBounds.end,cursor:timelineBounds.cursor}),{},(text,size)=>String(text).length*size*.6)`);
  assert(plan.pages.some(p=>p.type==='chart'));assert(plan.pages.some(p=>p.type==='index'));assert(plan.sources.length>0);
  const text=plan.pages.filter(p=>p.type==='index').flatMap(p=>p.lines.map(l=>l.text)).join('\n');assert(!text.includes('undefined'));if(id==='three-kingdoms')assert.match(text,/任期身份说明/);
 }
});
test('正式跨公元承位和元年分别保留；汉末执政不冒充东汉皇帝',()=>{
 const qh=start('qin-han');qh.run('setCursor(0)');assert.match(qh.el('#compare').innerHTML,/汉平帝/);
 assert.equal(qh.run("historyService.tenure('qh-tenure-han-pingdi').start"),1);
 assert.equal(qh.run("historyService.tenure('qh-tenure-han-pingdi').chronology.regnalStart"),0);
 assert.equal(qh.run("historyService.tenure('qin-r35').start"),247);
 assert.equal(qh.run("historyService.tenure('qin-r35').chronology.regnalStart"),246);
  qh.run("showRuler('qh-tenure-han-pingdi')");assert.match(qh.el('#detailBody').innerHTML,/人物档案/);assert(qh.el('#detailBody').innerHTML.includes(qh.run("historyService.person('qh-person-liu-kan').summary")));
 const tk=start('three-kingdoms');assert.deepEqual(plain(tk.run("historyService.rulersAt('eastern-han',1-215).map(r=>r.id)")),['qh-tenure-han-xiandi']);
 assert.equal(tk.run("historyService.tenure('tk-tenure-liubei-hanzhong').end"),1-221);
 assert.equal(tk.run("historyService.polity('eastern-han').end"),1-220);
 assert.equal(tk.run("historyService.rulersAt('cao-wei',1-230)[0].id"),'tk-tenure-cao-rui');
});
test('上下文身份保留但不反向增加巨鹿事件参战政权',()=>{
 const app=start('qin-han');assert(!app.run("historyService.event('qh-event-12-julu').states.includes('western-chu')"));
 assert.equal(app.run("historyService.event('qh-event-12-julu').participants.find(p=>p.id==='qh-person-xiang-yu').affiliationScope"),'contextual');
});
test('三个专题阅读、布局与组合独立；周朝旧存储键不变',()=>{
 const store={},zhou=attachStudy(start('zhou',store));zhou.run('setCursor(300);saveReadingPosition()');const old=store['zhou-reading-v4'];assert(old);
 const qh=attachStudy(start('qin-han',store));qh.run('setCursor(0);saveReadingPosition();togglePin("qin")');assert.equal(store['zhou-reading-v4'],old);
 const tk=attachStudy(start('three-kingdoms',store));tk.run('setCursor(-229);saveReadingPosition()');
 assert.equal(attachStudy(start('qin-han',store)).run('cursor'),0);assert.equal(attachStudy(start('three-kingdoms',store)).run('cursor'),-229);assert.equal(attachStudy(start('zhou',store)).run('cursor'),300);
 assert.equal(start('qin-han',store).run('appState.layout.pinned.has("qin")'),true);assert.equal(start('zhou',store).run('appState.layout.pinned.has("qin")'),false);
});
test('正式分享链接和组合带专题标记，拒绝跨专题误读',()=>{
 const qh=start('qin-han'),tk=start('three-kingdoms'),zhou=start('zhou');
 qh.ctx.URLSearchParams=URLSearchParams;
 const hash=qh.run('Zhou.createViewLinkCodec(D,searchService).encode({view:captureView(),pinned:[],order:D.states.map(s=>s.id)})'.replace('captureView()','captureDetailFrame().view'));
 assert.match(hash,/dataset=qin-han/);tk.ctx.URLSearchParams=URLSearchParams;zhou.ctx.URLSearchParams=URLSearchParams;
 assert.equal(tk.run(`Zhou.createViewLinkCodec(D,searchService).parse(${JSON.stringify(hash)})`),null);assert.equal(zhou.run(`Zhou.createViewLinkCodec(D,searchService).parse(${JSON.stringify(hash)})`),null);
 const combo=qh.run("captureCombo('正式秦汉')");assert.equal(combo.datasetId,'qin-han');assert.equal(tk.run(`normalizeCombo(${JSON.stringify(combo)})`),null);
});
test('显式上下文关联仍须附说明且与政权相交，不可任意绕过结构校验',async()=>{
 const {prepareProduction}=await import('../lib/production.mjs'),{validateAtlas}=await import('../lib/atlas.mjs');
 for(const mutation of [t=>{delete t.associationNote;},t=>{t.start={era:'CE',year:300};t.end={era:'CE',year:301};t.chronology.accession=t.start;t.chronology.regnalStart=t.start;}]){
  const data=prepareProduction(raw('three-kingdoms'),'three-kingdoms');mutation(data.tenures.find(t=>t.id==='tk-tenure-liubei-hanzhong'));assert.throws(()=>validateAtlas(data),/任职阶段/);
 }
});
test('三个静态入口都包含导航、正确数据资源与同一共享程序',()=>{
 for(const [id,page] of [['zhou','index.html'],['qin-han','qin-han.html'],['three-kingdoms','three-kingdoms.html']]){
  const html=fs.readFileSync(path.join(root,'dist',page),'utf8');for(const link of ['index.html','qin-han.html','three-kingdoms.html'])assert(html.includes(`href="${link}"`));
  assert(html.includes((id==='zhou'?'data.js':`data-${id}.js`)+'?v='));assert.match(html,/app\.js\?v=/);
 }
});
