const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {boot,attachStudy}=require('./helpers/browser.cjs');
const root=path.resolve(__dirname,'..'),plain=x=>JSON.parse(JSON.stringify(x));
const topics=['wei-jin-nan-bei','sui-tang','liao-jin-song','ming'];
const raw=id=>JSON.parse(fs.readFileSync(path.join(root,'data',id+'.json'),'utf8'));
const start=(id,store={},width=1200)=>boot(store,width,undefined,`data-${id}.js`);
for(const id of topics)for(const width of [1200,390])test(`新专题完整实体、分期、检索、同年对照和全范围导出 ${id}/${width}`,()=>{
 const app=start(id,{},width),input=raw(id),data=app.run('D');
 assert.equal(data.datasetId,id);assert.equal(data.states.length,input.polities.length);
 assert.equal(app.run('appState.conditions.end'),1-input.timeline.defaultEnd.year);
 for(const s of data.states){app.run(`showState(${JSON.stringify(s.id)})`);for(const t of s.rulers)app.run(`showRuler(${JSON.stringify(t.id)})`);}
 for(const e of data.events)app.run(`showEvent(${JSON.stringify(e.id)})`);
 for(const p of data.people)app.run(`showPerson(${JSON.stringify(p.id)})`);
 for(const p of data.periods.filter(p=>p.display!==false&&p.button!==false))app.run(`setPeriod(${JSON.stringify(p.id)})`);
 app.run(`updateSearch(${JSON.stringify(data.people[0].name)})`);assert(app.run('searchMatches().length')>0);
 app.run("updateSearch('');setCursor(timelineBounds.cursor)");assert.match(app.el('#compare').innerHTML,/comparecard/);
 assert.doesNotMatch(app.el('#chart').innerHTML,/undefined|NaN|前0年/);
 assert.doesNotMatch(app.el('.intro p').textContent,/汉末任职/);
 const model=app.run('historyService.comparison({states:D.states.map(s=>s.id),from:timelineBounds.start,to:timelineBounds.end,cursor:timelineBounds.cursor})');
 assert.equal(model.datasetId,id);assert.equal(model.events.length,input.events.length);
 assert.deepEqual(plain(model.states.map(s=>s.id)),plain(data.states.map(s=>s.id)));
 for(const polity of input.polities)assert.equal(app.run(`historyService.polity(${JSON.stringify(polity.id)}).end`),1-polity.end.year,'真实政权终点不被专题窗口截断');
 vm.runInContext(fs.readFileSync(path.join(root,'dist/export.js'),'utf8'),app.ctx);
 const before=JSON.stringify(model),plan=app.run(`Zhou.buildExportPlan(historyService.comparison({states:D.states.map(s=>s.id),from:timelineBounds.start,to:timelineBounds.end,cursor:timelineBounds.cursor}),{},(text,size)=>String(text).length*size*.6)`);
 assert.equal(JSON.stringify(model),before);assert(plan.pages.some(p=>p.type==='chart'));assert(plan.pages.some(p=>p.type==='index'));assert(plan.sources.length>0);
 const index=plan.pages.filter(p=>p.type==='index').flatMap(p=>p.lines.map(l=>l.text)).join('\n');assert.doesNotMatch(index,/undefined|NaN|公元0年/);
});
test('四新专题阅读/布局/组合分别持久化，共享政权ID也不串卷',()=>{
 const store={},records=[];
 for(const id of topics){const app=attachStudy(start(id,store));app.run('setCursor(timelineBounds.cursor);saveReadingPosition()');records.push({id,cursor:app.run('cursor')});}
 for(const {id,cursor} of records)assert.equal(attachStudy(start(id,store)).run('cursor'),cursor);
 assert.equal(Object.keys(store).filter(k=>k.endsWith('zhou-reading-v4')).length,4);
});
test('四新专题分享和组合保留各卷ID且拒绝跨卷误读',()=>{
 for(const id of topics){const app=start(id);app.ctx.URLSearchParams=URLSearchParams;
  const hash=app.run('Zhou.createViewLinkCodec(D,searchService).encode({view:captureDetailFrame().view,pinned:[],order:D.states.map(s=>s.id)})');
  assert.match(hash,new RegExp('dataset='+id));assert(app.run(`Zhou.createViewLinkCodec(D,searchService).parse(${JSON.stringify(hash)})`));
  const combo=app.run("captureCombo('测试当前专题')");assert.equal(combo.datasetId,id);
  const other=start(topics.find(x=>x!==id));other.ctx.URLSearchParams=URLSearchParams;
  assert.equal(other.run(`Zhou.createViewLinkCodec(D,searchService).parse(${JSON.stringify(hash)})`),null);
  assert.equal(other.run(`normalizeCombo(${JSON.stringify(combo)})`),null);
 }
});
test('七个发布入口导航一致，资源与跨专题索引同一版本',async()=>{
 const {catalog}=await import('../lib/production.mjs'),release=JSON.parse(fs.readFileSync(path.join(root,'dist/release.json'),'utf8'));
 assert.equal(catalog.length,7);assert.equal(release.datasets.length,7);assert(release.assets['corpus.json']);
 for(const topic of catalog){const html=fs.readFileSync(path.join(root,'dist',topic.page),'utf8');for(const t of catalog)assert(html.includes(`href="${t.page}" data-topic="${t.id}"`));assert(html.includes((topic.id==='zhou'?'data.js':`data-${topic.id}.js`)+'?v='));assert(!html.includes('<!-- topic-navigation -->'));}
});
