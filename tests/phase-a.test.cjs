'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {boot,attachStudy}=require('./helpers/browser.cjs');
const plain=value=>JSON.parse(JSON.stringify(value));
const freeze=value=>{if(value&&typeof value==='object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value;};
const specs=[
 {id:'xia-shang',order:['xia','shang','zhou'],all:true,year:1600,rows:5},
 {id:'zhou',order:['zhou','qi','jin','qin','chu','yan','lu','wu','yue','han','zhao','liang'],year:770,rows:12},
 {id:'qin-han',order:['qin','western-han','xin','gengshi-han','eastern-han'],all:true,year:140,rows:4},
 {id:'three-kingdoms',order:['cao-wei','shu-han','sun-wu','eastern-han','western-jin'],all:true,year:-228,rows:5},
 {id:'wei-jin-nan-bei',order:['western-jin','eastern-jin','liu-song','southern-qi','southern-liang-dynasty','southern-chen','northern-wei','eastern-wei','northern-qi','western-wei','northern-zhou','former-qin'],year:-382,rows:5},
 {id:'sui-tang',order:['sui','tang','wu-zhou'],year:-617,rows:2},
 {id:'five-dynasties',order:['later-liang','later-tang','later-jin','later-han','later-zhou','northern-song'],year:-922,rows:1},
 {id:'liao-jin-song',order:['northern-song','southern-song','liao','jin-jurchen','western-xia'],year:-959,rows:4},
 {id:'yuan',order:['mongol-yuan','southern-song','jin-jurchen','ming'],year:-1270,rows:4},
 {id:'ming',order:['ming','southern-ming','later-jin-qing'],year:-1367,rows:2},
 {id:'qing',order:['later-jin-qing','ming'],year:-1643,rows:2}
];
const start=(id,width=1200,store={})=>boot(store,width,undefined,id==='zhou'?'data.js':`data-${id}.js`);
function core(){const ctx=vm.createContext({});for(const name of ['time','presentation','state'])vm.runInContext(fs.readFileSync(`src/core/${name}.js`,'utf8'),ctx);return ctx.Zhou;}
async function data(id){const {compileProduction,catalog}=await import('../lib/production.mjs');return compileProduction(JSON.parse(fs.readFileSync('data/'+catalog.find(t=>t.id===id).file,'utf8')),id);}
for(const spec of specs){
 test(`阶段A策略纯函数：${spec.id} 默认排序、核心集合与轴坐标，原数据不变`,async()=>{
  const Zhou=core(),d=freeze(await data(spec.id)),before=JSON.stringify(d),policy=Zhou.Presentation.topic(d),ids=d.states.map(s=>s.id);
  assert.deepEqual(plain(policy.order.slice(0,spec.order.length)),spec.order);
  assert.deepEqual([...policy.order].sort(),[...ids].sort());assert.equal(new Set(policy.order).size,ids.length);
  assert.deepEqual([...policy.coreIds].sort(),[...(spec.all?ids:spec.order)].sort());
  assert.equal(policy.cursor,spec.year);assert.equal(JSON.stringify(d),before);
  const state=Zhou.createApplicationState(d);
  assert.deepEqual(plain(state.layout.stateOrder),plain(policy.order));
  assert.deepEqual([...state.conditions.selected].sort(),[...policy.coreIds].sort());
  assert.equal(state.conditions.cursor,spec.year);
  policy.order.reverse();policy.coreIds.length=0;policy.minorInfo.injected='caller only';
  const next=Zhou.Presentation.topic(d);assert.deepEqual(plain(next.order.slice(0,spec.order.length)),spec.order);
  assert(next.coreIds.length>0);assert(!Object.hasOwn(next.minorInfo,'injected'));
 });
 for(const width of [1200,390])test(`阶段A首屏：${spec.id}/${width} 默认行数、高光年、计数及居中`,()=>{
  const app=start(spec.id,width),p=app.run('Zhou.Presentation.topic(D)');
  assert.equal(app.run('appState.session.visibleRows.length'),spec.rows);
  assert.deepEqual(plain(app.run('stateOrder.slice(0,'+spec.order.length+')')),spec.order);
  assert.equal(app.run('cursor'),spec.year);assert.equal(app.run('timelineBounds.cursor'),spec.year);
  assert.equal(app.el('#viewport').scrollLeft,app.run('Math.max(0,x(cursor)-(vp.clientWidth-labelWidth())/2)'));
  assert(app.el('#filterCount').textContent.includes(p.coreIds.length+'/'+app.run('D.states.length')));
  assert.doesNotMatch(app.el('#chart').innerHTML,/undefined|NaN|公元0年|前0年/);
  const left=app.el('#viewport').scrollLeft;app.run('render();render()');assert.equal(app.el('#viewport').scrollLeft,left);
 });
}
test('未知与示例专题回退原配置，不把正式专题规则强加给合成数据',()=>{
 const Z=core(),d={datasetId:'unknown',timeline:{start:100,end:-100,defaultEnd:-100,cursor:25,topic:'qin-han'},states:[{id:'b',start:100,end:-100},{id:'a',start:80,end:0}]};
 for(const value of [d,{...d,datasetId:undefined}]){
  const p=Z.Presentation.topic(freeze(value));assert.deepEqual(plain(p.order),['b','a']);assert.deepEqual(plain(p.coreIds),['b','a']);assert.equal(p.cursor,25);
 }
});
test('空正式投影不凭策略补造政权ID，策略列表始终是资料中真实成员',()=>{
 const Z=core();
 for(const id of ['zhou','sui-tang','liao-jin-song']){
  const p=Z.Presentation.topic({datasetId:id,timeline:{start:100,end:-100,cursor:20},states:[]});
  assert.deepEqual(plain(p.order),[]);assert.deepEqual(plain(p.coreIds),[]);
 }
});
test('辽金宋两宋首行，隋唐两行与明清两行，全部展开仍保留每个原实体',()=>{
 for(const id of ['liao-jin-song','sui-tang','ming','qing']){
  const a=start(id),rows=plain(a.run('appState.session.visibleRows.map(r=>r.members.map(s=>s.id))'));
  if(id==='liao-jin-song')assert.deepEqual(rows,[['northern-song','southern-song'],['liao'],['jin-jurchen'],['western-xia']]);
  if(id==='sui-tang')assert.deepEqual(rows,[['sui'],['tang','wu-zhou']]);
  if(id==='ming')assert.deepEqual(rows,[['ming','southern-ming'],['later-jin-qing']]);
  if(id==='qing')assert.deepEqual(rows,[['later-jin-qing'],['ming']]);
  a.run('selected=new Set(D.states.map(s=>s.id));render()');
  assert.deepEqual(plain(a.run('appState.session.visibleRows.flatMap(r=>r.members.map(s=>s.id)).sort()')),plain(a.run('D.states.map(s=>s.id).sort()')));
 }
});
test('武周标识在唐主行、完整原任期详情和690—705国号说明保留；清卷吴周不串色',()=>{
 const a=start('sui-tang'),html=a.el('#chart').innerHTML;
 assert(html.includes('武周 · 武则天'));assert.match(html,/wuZhouBar/);
 const wu=a.run("historyService.tenure('st-tenure-wuzhou-wuzetian')");
 assert.equal(wu.polityId,'wu-zhou');assert.equal(wu.display.shortTitle,'圣神皇帝');
 a.action('ruler',wu.id);assert.equal(a.run('navigation.key'),'ruler:'+wu.id);
 assert(a.el('#detailBody').innerHTML.includes(wu.name));assert.match(a.el('#detailBody').innerHTML,/690|天授/);assert.match(a.el('#detailBody').innerHTML,/705|神龙/);assert.match(a.el('#detailBody').innerHTML,/周/);
 const q=start('qing');q.run('selected=new Set(D.states.map(s=>s.id));render()');assert.doesNotMatch(q.el('#chart').innerHTML,/wuZhouBar/);
});
test('默认策略不会覆盖显式阅读选择、顺序、光标和视窗，跨专题存储不串卷',()=>{
 for(const id of ['zhou','sui-tang','liao-jin-song','qing']){
  const a=attachStudy(start(id)),order=plain(a.run('D.states.map(s=>s.id).reverse()'));
  a.ctx.savedOrder=order;a.run('selected=new Set(D.states.map(s=>s.id));stateOrder=[...savedOrder];setCursor(timelineBounds.start-10);vp.scrollLeft=80;vp.scrollTop=15;saveReadingPosition()');
  const before=plain(a.run('({selected:[...selected],order:[...stateOrder],cursor,left:vp.scrollLeft,top:vp.scrollTop})'));
  const b=attachStudy(start(id,1200,{...a.store}));
  assert.deepEqual(plain(b.run('({selected:[...selected],order:[...stateOrder],cursor,left:vp.scrollLeft,top:vp.scrollTop})')),before);
 }
});
test('展开/收起只处理次要政权，保留自定义核心取消项、固定政权、年份与横向位置',()=>{
 for(const spec of specs.filter(s=>!s.all)){
  const a=start(spec.id),policy=a.run('Zhou.Presentation.topic(D)'),minor=policy.order.find(id=>!policy.coreIds.includes(id)),removed=policy.coreIds[0];
  a.ctx.minorId=minor;a.ctx.removedId=removed;
  a.run('selected.delete(removedId);togglePin(minorId);vp.scrollLeft=43;setCursor(timelineBounds.start-5);toggleMinorStates(true)');
  assert(!a.run('selected.has(removedId)'));assert.equal(a.run('selected.size'),a.run('D.states.length')-1);
  const year=a.run('cursor');a.run('toggleMinorStates(false)');
  assert(!a.run('selected.has(removedId)'));assert(a.run('selected.has(minorId)&&pinned.has(minorId)'));
  assert.equal(a.run('selected.size'),policy.coreIds.length);assert.equal(a.run('cursor'),year);assert.equal(a.el('#viewport').scrollLeft,43);
  a.run("applyPolityPreset('main')");assert.equal(a.run('selected.size'),policy.coreIds.length+1);
  assert(a.el('#filterCount').textContent.includes((policy.coreIds.length+1)+'/'+a.run('D.states.length')));
  a.run("applyPolityPreset('all')");assert.equal(a.run('selected.size'),a.run('D.states.length'));
 }
});
test('政权弹窗支持预设、取消、实时计数与自定义勾选，并保留固定项',()=>{
 const a=start('liao-jin-song'),policy=a.run('Zhou.Presentation.topic(D)'),before=plain(a.run('[...selected]'));
 const boxes=policy.order.map(id=>({value:id,checked:policy.coreIds.includes(id),dataset:{},focus(){}}));
 const original=a.ctx.document.querySelectorAll;
 a.ctx.document.querySelectorAll=selector=>selector==='#stateChecks input'?boxes:selector==='#stateChecks input:checked'?boxes.filter(c=>c.checked):original(selector);
 a.el('#filter').onclick();assert.match(a.el('#filterSummary').textContent,/已显示\s*5\s*\/\s*8/);
 a.el('#allStates').onclick();assert(boxes.every(c=>c.checked));assert.match(a.el('#filterSummary').textContent,/8\s*\/\s*8/);
 a.el('#closeFilters').onclick();assert.deepEqual(plain(a.run('[...selected]')),before,'cancel must not apply a draft');
 a.el('#filter').onclick();a.el('#mainStates').onclick();assert.deepEqual(plain(boxes.filter(c=>c.checked).map(c=>c.value)),plain(policy.coreIds));
 assert.equal(typeof a.el('#customStates').onclick,'function');a.el('#customStates').onclick();
 assert(a.el('#customStates').classList.contains('active'));
 const c=boxes.find(c=>c.value==='dali');c.checked=true;a.el('#stateChecks').onchange({target:c});
 assert.match(a.el('#filterSummary').textContent,/6\s*\/\s*8/);a.el('#applyFilters').onclick();assert(a.run("selected.has('dali')"));
 a.run("togglePin('western-liao')");const pinnedBox=boxes.find(c=>c.value==='western-liao');pinnedBox.dataset.pinned='true';pinnedBox.checked=false;
 a.el('#stateChecks').onchange({target:pinnedBox});assert(pinnedBox.checked);
});
test('主动排序不会被普通渲染覆盖，恢复默认顺序使用专题策略且不重置年份视窗',()=>{
 for(const spec of specs){
  const a=start(spec.id),reversed=plain(a.run('stateOrder.reverse();render();[...stateOrder]'));
  a.run('vp.scrollLeft=43;setCursor(timelineBounds.start-5);render()');
  assert.deepEqual(plain(a.run('[...stateOrder]')),reversed);
  const year=a.run('cursor');a.el('#resetOrder').onclick();
  assert.deepEqual(plain(a.run('stateOrder.slice(0,'+spec.order.length+')')),spec.order);
  assert.equal(a.run('cursor'),year);assert.equal(a.el('#viewport').scrollLeft,43);
 }
});
test('模板提供选择政权、主要/全部/自定义及计数，样式标识武周而不改变史料',()=>{
 const html=fs.readFileSync('src/index.html','utf8'),css=fs.readFileSync('src/style.css','utf8');
 assert.match(html,/选择政权/);assert.doesNotMatch(html,/选择对照的国家/);
 for(const text of ['主要（默认）','全部','自定义'])assert(html.includes(text));
 for(const id of ['filter','filterCount','filters','stateChecks','allStates','seven'])assert(html.includes('id="'+id+'"'));
 assert.match(css,/\.wuZhouBar/);
});


test('宋辽金：旧默认布局与旧阅读顺序迁移，已标记和其他自定义顺序保持',()=>{
 const initial=start('liao-jin-song'),former=plain(initial.run('D.states.map(s=>s.id)')),policy=plain(initial.run('Zhou.Presentation.topic(D).order'));
 assert.notDeepEqual(former,policy);
 const key='liao-jin-song:zhou-layout-v2';
 const migrated=start('liao-jin-song',1200,{[key]:JSON.stringify({order:former})});
 assert.deepEqual(plain(migrated.run('stateOrder')),policy);
 const explicit=start('liao-jin-song',1200,{[key]:JSON.stringify({order:former,orderVersion:1})});
 assert.deepEqual(plain(explicit.run('stateOrder')),former);
 const custom=[...former].reverse(),customApp=start('liao-jin-song',1200,{[key]:JSON.stringify({order:custom})});
 assert.deepEqual(plain(customApp.run('stateOrder')),custom);
 const reading=attachStudy(initial);reading.run('saveReadingPosition()');
 const store={...reading.store},readingKey='liao-jin-song:zhou-reading-v4',saved=JSON.parse(store[readingKey]);
 saved.layout.order=former;delete saved.layout.orderVersion;store[readingKey]=JSON.stringify(saved);
 assert.deepEqual(plain(attachStudy(start('liao-jin-song',1200,store)).run('stateOrder')),policy);
 saved.layout.orderVersion=1;store[readingKey]=JSON.stringify(saved);
 assert.deepEqual(plain(attachStudy(start('liao-jin-song',1200,store)).run('stateOrder')),former);
});

test('宋辽金：展示名称一致、原网址和数据身份不变；分组左列不显示实现文案',()=>{
 const app=start('liao-jin-song');
 assert.equal(app.run('D.datasetId'),'liao-jin-song');
 assert.equal(app.run('Zhou.Branding.topicName({id:"liao-jin-song",name:"辽金宋"})'),'宋辽金');
 assert.equal(app.run('document.title'),'宋辽金夏 · 中国朝代时间线');
 const html=fs.readFileSync('dist/liao-jin-song.html','utf8');
 assert.match(html,/>宋辽金<\/a>/);assert.match(html,/liao-jin-song\.html/);
 for(const id of ['qin-han','five-dynasties','liao-jin-song']){
  const current=start(id);assert.doesNotMatch(current.el('#chart').innerHTML,/重叠分层/);assert.doesNotMatch(current.el('#densityHint').textContent,/重叠分层/);
 }
});


test('宋辽金：跨专题详情入口也采用展示名，内部目录与稳定链接保留',()=>{
 const app=start('five-dynasties');app.ctx.URLSearchParams=URLSearchParams;
 vm.runInContext(fs.readFileSync('dist/entity-links.js','utf8'),app.ctx);
 app.action('state','northern-song');
 assert.match(app.el('#detailBody').innerHTML,/前往【宋辽金】/);
 assert.doesNotMatch(app.el('#detailBody').innerHTML,/前往【辽金宋】/);
 assert.match(app.el('#detailBody').innerHTML,/liao-jin-song\.html/);
});
