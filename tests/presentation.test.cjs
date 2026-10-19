const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {boot,attachStudy}=require('./helpers/browser.cjs');
const start=(id,width=1200,store={})=>boot(store,width,undefined,id==='zhou'?'data.js':`data-${id}.js`),plain=x=>JSON.parse(JSON.stringify(x));
for(const width of [1200,390]){
 test(`秦汉接续共行、三国并行，政权与同年重叠不被改写 ${width}`,()=>{
  const app=start('qin-han',width),before=app.run('JSON.stringify(D)');
  assert.equal(app.run('appState.session.visibleRows.length'),4);
  assert.deepEqual(plain(app.run('appState.session.visibleRows.find(r=>r.grouped).members.map(s=>s.id)')),['qin','western-han','xin','gengshi-han','eastern-han']);
  assert.equal((app.el('#chart').innerHTML.match(/class="politySegment"/g)||[]).length,5);
  const segments=app.run('Zhou.Presentation.pack(appState.session.visibleRows.find(r=>r.grouped).members,timelineBounds.start,appState.conditions.end)');
  assert(segments.lanes>1,'inclusive overlapping dynasty boundaries need separate lanes');
  const packed=app.run('Zhou.Presentation.pack(appState.session.visibleRows.find(r=>r.grouped).members.flatMap(s=>s.rulers),timelineBounds.start,appState.conditions.end)');
  for(let i=0;i<packed.items.length;i++)for(let j=i+1;j<packed.items.length;j++){const a=packed.items[i],b=packed.items[j];if(a.start>=b.end&&a.end<=b.start)assert.notEqual(a.displayLane,b.displayLane,`${a.id}/${b.id}`);}
  assert.equal(app.run('JSON.stringify(D)'),before);
  const tk=start('three-kingdoms',width);assert.equal(tk.run('appState.session.visibleRows.length'),5);assert(!tk.run('appState.session.visibleRows.some(r=>r.grouped)'));
 });
 test(`条带短名层级、放大显示年份，完整称谓身份和生平保留 ${width}`,()=>{
  const app=start('three-kingdoms',width);app.run("density='auto';px=6;rowHeight=128;fitRows=false;render()");
  const html=app.el('#chart').innerHTML;
  assert(html.includes('曹操</span>'));assert(!html.includes('基础期</span>'));assert(!html.includes('class="rulerYears'));
  assert(html.includes('aria-label="'+app.run("historyService.tenure('tk-tenure-caocao-foundation').name")));
  app.run("density='full';px=24;render()");assert(app.el('#chart').innerHTML.includes('class="rulerYears'));
  for(const id of ['tk-tenure-liubei-hanzhong','tk-tenure-liu-bei']){app.action('ruler',id);assert.equal(app.run('navigation.key'),'ruler:'+id);assert(app.el('#detailBody').innerHTML.includes(app.run(`historyService.tenure('${id}').name`)));assert(app.el('#detailBody').innerHTML.includes('简要生平'));}
  app.run("updateSearch('刘备')");assert(app.run("searchMatches().filter(h=>h.entry.type==='ruler'&&h.entry.data.personId===historyService.tenure('tk-tenure-liu-bei').personId).length")>=2);
 });
}
test('显示契约逐任期显式标注，不按姓名合并；周朝回退原名',()=>{
 for(const id of ['qin-han','three-kingdoms']){const app=start(id);assert(app.run('D.tenures.filter(t=>t.personId).every(t=>t.display&&Object.hasOwn(t.display,"shortTitle")&&Object.hasOwn(t.display,"personalName"))'));for(const r of app.run('D.tenures.filter(t=>t.personId)')){assert(!app.run(`Zhou.Presentation.rulerLabel(historyService.tenure(${JSON.stringify(r.id)}))`).match(/[（(／/]|基础期|执政|在位|任职/));}}
 const app=start('zhou');assert.equal(app.run('appState.session.visibleRows.length'),18);assert.equal(app.run("Zhou.Presentation.rulerLabel(historyService.tenure('qin-r35'))"),'秦王政');
});
test('显示投影仅增加元数据，全部原名称、日期、ID、关系与来源不变',async()=>{
 const {compileAtlas}=await import('../lib/atlas.mjs'),{compileProduction,prepareProduction}=await import('../lib/production.mjs');
 for(const id of ['qin-han','three-kingdoms']){
  const input=JSON.parse(fs.readFileSync('data/'+id+'.json','utf8')),before=JSON.stringify(input),expected=compileAtlas(prepareProduction(input,id)),actual=compileProduction(input,id);
  delete actual.presentation;delete actual.datasetId;delete actual.catalog;
  for(const r of [...actual.tenures,...actual.polities,...actual.states,...actual.states.flatMap(s=>s.rulers)])delete r.display;
  assert.deepEqual(actual,expected);assert.equal(JSON.stringify(input),before);
 }
});
test('分组下筛选、固定、排序、搜索定位、分享与阅读恢复保留政权身份',()=>{
 const store={},app=attachStudy(start('qin-han',1200,store));app.ctx.URLSearchParams=URLSearchParams;
 app.run("selected=new Set(['western-han','eastern-han','western-chu']);stateOrder=['western-chu','eastern-han','western-han',...D.states.map(s=>s.id).filter(id=>!['western-chu','eastern-han','western-han'].includes(id))];render();togglePin('western-han')");
 assert.equal(app.run('appState.session.visibleRows[0].key'),'group:qin-han-succession');assert.deepEqual(plain(app.run('appState.session.visibleRows[0].members.map(s=>s.id)')),['western-han','eastern-han']);
 assert.deepEqual(plain(app.run('[...pinned]')),['western-han']);
 app.run("pinned.clear();render();scrollToSearchState('western-han')");assert.equal(app.el('#viewport').scrollTop,app.run('appState.session.rowLayouts.get("western-han").offset'));
 app.run("setCursor(-24);showRuler('qh-tenure-han-guangwudi');saveReadingPosition()");
 const hash=app.run('Zhou.createViewLinkCodec(D,searchService).encode({view:captureDetailFrame().view,pinned:[...pinned],order:stateOrder,detail:navigation.key})');
 assert(hash.includes('western-han'));assert(!hash.includes('group%3A'));
 const restored=attachStudy(start('qin-han',1200,store));assert.equal(restored.run('cursor'),-24);assert(restored.run("selected.has('western-han')"));
});
test('结构与图形导出保持原政权/任期ID、全文、来源；图上只使用短标签',()=>{
 const app=start('three-kingdoms');vm.runInContext(fs.readFileSync('dist/export.js','utf8'),app.ctx);
 const snapshot=app.run("historyService.comparison({states:['eastern-han','shu-han'],from:timelineBounds.start,to:timelineBounds.end,cursor:timelineBounds.cursor})");
 const before=JSON.stringify(snapshot);app.ctx.snapshot=snapshot;
 const plan=app.run('Zhou.buildExportPlan(snapshot,{span:100},(text,size)=>String(text).length*size*.6)');assert.equal(JSON.stringify(snapshot),before);
 assert(plan.states.some(s=>s.id==='eastern-han'));assert(plan.states.some(s=>s.id==='shu-han'));assert(snapshot.tenures.some(t=>t.id==='tk-tenure-liubei-hanzhong'));assert(snapshot.tenures.some(t=>t.id==='tk-tenure-liu-bei'));
 const text=plan.pages.filter(p=>p.type==='index').flatMap(p=>p.lines.map(l=>l.text)).join('');assert(text.includes('任期身份说明'));assert(text.includes('https://'));
 const drawn=[],ctx={measureText:t=>({width:t.length*7}),fillText:t=>drawn.push(t),fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},stroke(){},fill(){},setLineDash(){}};app.ctx.drawing=ctx;app.ctx.plan=plan;app.run("plan.pages.filter(p=>p.type==='chart').forEach((p,i)=>Zhou.drawExportPage(drawing,p,plan,i))");assert(drawn.includes('刘备'));assert(!drawn.includes(app.run("historyService.tenure('tk-tenure-liubei-hanzhong').name")));
});
