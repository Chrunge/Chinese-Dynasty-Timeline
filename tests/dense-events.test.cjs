'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {boot}=require('./helpers/browser.cjs');

// Pure layout tests deliberately load source, not yesterday's compiled bundle.
// Browser integration cases should run only after the owner rebuilds dist.
function presentation(){
 const ctx=vm.createContext({});
 vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../src/core/presentation.js'),'utf8'),ctx,{filename:'src/core/presentation.js'});
 assert.equal(typeof ctx.Zhou.Presentation.events,'function');
 return ctx.Zhou.Presentation.events;
}
const ids=groups=>Array.from(groups).flatMap(group=>Array.from(group.events,event=>event.id)).sort();
const options=(extra={})=>({position:event=>event.x,measure:event=>event.width,top:6,bottom:6,...extra});
function records(count,x=40,width=100){return Array.from({length:count},(_,i)=>({id:'event-'+i,year:230,name:'同年事件'+i,x,width,states:['state']}));}
function preserved(result,input){
 assert.deepEqual(ids(result.groups),input.map(event=>event.id).sort(),'every input ID must appear exactly once');
 for(const group of result.groups){
  assert(group.events.length>0);
  for(const event of group.events)assert.strictEqual(event,input.find(original=>original.id===event.id),'groups retain original records, not replacement domain objects');
 }
}
function geometry(result,{top,bottom}){
 assert(Number.isInteger(result.lanes)&&result.lanes>=1);
 for(const group of result.groups){
  for(const key of ['left','width','top','lane'])assert(Number.isFinite(group[key]),key+' must be numeric');
  assert(group.width>0);assert(Number.isInteger(group.lane));
  assert(group.lane>=0&&group.lane<result.lanes);
  assert(group.top>=top&&group.top<=bottom,'button top stays within the caller-provided event band');
 }
 for(let i=0;i<result.groups.length;i++)for(let j=i+1;j<result.groups.length;j++){
  const a=result.groups[i],b=result.groups[j];
  if(a.lane===b.lane){
   assert.equal(a.top,b.top);
   assert(a.left+a.width<=b.left||b.left+b.width<=a.left,'same-lane button bounds must not overlap');
  }else assert.equal(Math.abs(a.top-b.top),Math.abs(a.lane-b.lane)*22,'lane pitch is 22px');
 }
}

test('纯展示：同年事件有空间时全部展开且使用不同 lane',()=>{
 const input=records(4),opts=options({top:9,bottom:75});
 const result=presentation()(input,opts);
 preserved(result,input);geometry(result,opts);
 assert.equal(result.groups.length,4);assert(result.groups.every(group=>group.events.length===1));
 assert.equal(new Set(Array.from(result.groups,group=>group.lane)).size,4);
 assert.equal(result.lanes,4);
});

test('纯展示：最大允许 top 的 21/22px 边界决定是否增加一行',()=>{
 const layout=presentation(),input=records(2);
 for(const [bottom,singletons] of [[6,false],[27,false],[28,true]]){
  const opts=options({bottom}),result=layout(input,opts);
  preserved(result,input);geometry(result,opts);
  assert.equal(result.groups.length,singletons?2:1,'bottom='+bottom);
  if(!singletons)assert.equal(result.groups[0].events.length,2);
 }
});

test('纯展示：按 measure 的宽度判断水平空间，而非仅按年份距离',()=>{
 const layout=presentation(),input=[{id:'wide-a',x:0,width:120},{id:'wide-b',x:80,width:120}];
 const wide=layout(input,options());preserved(wide,input);geometry(wide,options());
 assert.equal(wide.groups.length,1,'120px labels at 80px separation still cluster in one lane');
 const narrowOptions=options({measure:()=>32}),narrow=layout(input,narrowOptions);
 preserved(narrow,input);geometry(narrow,narrowOptions);
 assert.equal(narrow.groups.length,2,'32px labels with ample separation need no cluster');
 assert(narrow.groups.every(group=>group.events.length===1&&group.width>=32));
 const tallOptions=options({bottom:28}),tall=layout(input,tallOptions);
 preserved(tall,input);geometry(tall,tallOptions);assert.equal(tall.groups.length,2);
});

test('纯展示：空间不足仍聚合，未排序输入及很长标题不丢失任何 ID',()=>{
 const input=records(17).reverse();input[3]={...input[3],name:'长标题'.repeat(100),width:900};
 const opts=options({top:0,bottom:44}),result=presentation()(input,opts);
 preserved(result,input);geometry(result,opts);
 assert(result.groups.some(group=>group.events.length>1));assert(result.groups.length<17);
 assert(result.lanes<=3,'44px of top-coordinate range fits at most three lanes');
});

test('纯展示：不排序或改写冻结的记录、嵌套关系和输入数组',()=>{
 const input=records(4).reverse();
 for(const event of input){Object.freeze(event.states);Object.freeze(event);}Object.freeze(input);
 const before=JSON.stringify(input),layout=presentation(),opts=Object.freeze(options({bottom:72}));
 const first=layout(input,opts),second=layout(input,opts);
 preserved(first,input);preserved(second,input);assert.equal(JSON.stringify(input),before);
 assert.deepEqual(JSON.parse(JSON.stringify(first)),JSON.parse(JSON.stringify(second)),'same inputs have deterministic presentation');
});

test('纯展示：focused 尽力独立，无独立空间时保留在 cluster 内',()=>{
 const layout=presentation(),input=records(5),focusedId='event-3';
 const roomyOptions=options({bottom:28,focusedId}),roomy=layout(input,roomyOptions);
 preserved(roomy,input);geometry(roomy,roomyOptions);
 const focusGroup=roomy.groups.find(group=>group.events.some(event=>event.id===focusedId));
 assert.equal(focusGroup.events.length,1,'two lanes can reserve one for the focused event');
 assert(roomy.groups.some(group=>group.events.length>1));
 const tightOptions=options({focusedId}),tight=layout(input,tightOptions);
 preserved(tight,input);geometry(tight,tightOptions);
 assert.equal(tight.groups.length,1);assert(tight.groups[0].events.some(event=>event.id===focusedId));
});

test('纯展示：利用条带旁空白分层，但避开真实条带矩形',()=>{
 const input=records(3,10,80),obstacle={left:0,right:120,top:20,bottom:60};
 const opts=options({top:0,bottom:66,obstacles:[obstacle]}),result=presentation()(input,opts);
 preserved(result,input);geometry(result,opts);assert.equal(result.groups.length,2);
 for(const g of result.groups)assert(g.top+18<obstacle.top||g.top>obstacle.bottom);
 assert(result.groups.some(g=>g.top===0),'空白上层可用，而不是只看整行最低条带');
});

test('纯展示：晚年聚焦事件预留位置，不被更早的密集事件吞并',()=>{
 const input=[{id:'earlier-a',x:0,width:120},{id:'earlier-b',x:10,width:120},{id:'focused',x:60,width:120}];
 const opts=options({bottom:28,focusedId:'focused'}),result=presentation()(input,opts);
 preserved(result,input);geometry(result,opts);
 assert.equal(result.groups.find(g=>g.events.some(e=>e.id==='focused')).events.length,1);
});

test('纯展示：空输入不造事件；未知 focusedId 不影响正常布局',()=>{
 const layout=presentation();assert.equal(layout([],options()).groups.length,0);
 const input=records(2),opts=options({bottom:28,focusedId:'missing'}),result=layout(input,opts);
 preserved(result,input);geometry(result,opts);assert.equal(result.groups.length,2);
});

// The DOM boundary intentionally leaves row contents opaque. Parse only event
// buttons, excluding termination/gap buttons which also use the event CSS class.
function buttons(row){
 assert(row,'expected a visible state row');
 return [...row.outerHTML.matchAll(/<button\b([^>]*)>[\s\S]*?<\/button>/g)].map(match=>{
  const attributes=Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(value=>[value[1],value[2]]));
  const style=Object.fromEntries((attributes.style||'').split(';').filter(Boolean).map(value=>{const at=value.indexOf(':');return [value.slice(0,at),value.slice(at+1)];}));
  return {action:attributes['data-action'],id:attributes['data-id'],lane:Number(attributes['data-event-lane']),hasLane:Object.hasOwn(attributes,'data-event-lane'),top:parseFloat(style.top),left:parseFloat(style.left),width:parseFloat(style.width||style['max-width']),classes:(attributes.class||'').split(/\s+/)};
 }).filter(button=>button.action==='event'||button.action==='cluster');
}
const row=(app,id)=>app.el('#chart').children.find(node=>node.dataset.state===id);
const buttonIds=list=>list.flatMap(button=>button.id.split(',')).sort();
function checkButtons(app,id,expected){
 const list=buttons(row(app,id)),height=app.run(`rowLayouts.get(${JSON.stringify(id)}).height`);
 assert.deepEqual(buttonIds(list),[...expected].sort(),'rendered event/cluster IDs must match the filtered row exactly once');
 for(const button of list){
  assert(button.hasLane&&Number.isInteger(button.lane)&&button.lane>=0,'every event button exposes a numeric data-event-lane');
  assert(Number.isFinite(button.top)&&button.top>=0&&button.top+18<=height,'18px button fits inside its state row');
 }
 for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
  const a=list[i],b=list[j];
  assert.equal(Math.abs(a.top-b.top),Math.abs(a.lane-b.lane)*22,'rendered top follows the declared 22px lane pitch');
 }
 return list;
}
function expectedIds(app,id,category='all'){
 return Array.from(app.run(`historyService.eventsInRange({from:timelineBounds.start,to:end,states:[${JSON.stringify(id)}],category:${JSON.stringify(category)}}).map(event=>event.id)`));
}
function setup(asset,width,mode){
 const app=boot({},width,undefined,asset);
 app.run(`density='full';mode=${JSON.stringify(mode)};px=.8;fitRows=false;rowHeights={};rowHeight=36;category='all';query='';activeEventId=null;render()`);
 // Avoid the Qin/Han succession row's historical minimum height when checking
 // global 36/64/160px. That grouped row is covered separately below.
 const id=app.run(`appState.session.visibleRows.filter(row=>!row.grouped).map(row=>({id:row.members[0].id,count:historyService.eventsInRange({from:timelineBounds.start,to:end,states:[row.members[0].id]}).length,lanes:packRulers(row.members[0]).lanes})).sort((a,b)=>b.count-a.count||a.lanes-b.lanes)[0].id`);
 app.run(`selected=new Set([${JSON.stringify(id)}]);render()`);
 assert(expectedIds(app,id).length>1,'fixture must actually contain dense events');
 return {app,id};
}
function globalHeight(app,height){app.el('#rowHeight').oninput({target:{value:String(height)}});}
function overrideHeight(app,id,height){app.el('#orderList').change({target:{dataset:{rowSize:id},value:String(height)}});}

for(const width of [1200,390])for(const asset of ['data.js','data-qin-han.js','data-three-kingdoms.js'])for(const mode of ['events','both']){
 test(`实际渲染：${asset} ${width}px ${mode} 随全局行高展开并可还原聚合`,()=>{
  const {app,id}=setup(asset,width,mode),before=app.run('JSON.stringify(D)'),expected=expectedIds(app,id);
  const counts=[];
  for(const height of [36,64,160]){
   globalHeight(app,height);
   const actualHeight=app.run(`rowLayouts.get(${JSON.stringify(id)}).height`);
   if(height===36)assert(actualHeight>=36&&actualHeight<=64,'compact rows may grow just enough to preserve physical ruler borders');else assert.equal(actualHeight,height);
   counts.push(checkButtons(app,id,expected).length);
  }
  assert(counts[1]>=counts[0],'64px cannot show fewer groups than 36px');
  assert(counts[2]>counts[0],'160px uses otherwise empty vertical space to expand dense events');
  assert(buttons(row(app,id)).some(button=>button.lane>0),'tall rows visibly use multiple lanes');
  globalHeight(app,36);assert.equal(checkButtons(app,id,expected).length,counts[0],'shrinking the row restores aggregation');
  assert.equal(app.run('JSON.stringify(D)'),before,'rendering is presentation-only');
 });
}

for(const width of [1200,390])for(const mode of ['events','both']){
 test(`单行覆盖：${width}px ${mode} 覆盖全局行高，清除后重新聚合`,()=>{
  const {app,id}=setup('data-three-kingdoms.js',width,mode),expected=expectedIds(app,id);
  const small=checkButtons(app,id,expected).length;
  overrideHeight(app,id,160);const large=checkButtons(app,id,expected).length;assert(large>small);
  globalHeight(app,64);assert.equal(app.run(`rowLayouts.get(${JSON.stringify(id)}).height`),160);
  assert.equal(checkButtons(app,id,expected).length,large,'global change does not erase the explicit row override');
  overrideHeight(app,id,0);assert.equal(app.run(`rowLayouts.get(${JSON.stringify(id)}).height`),64);
  globalHeight(app,160);overrideHeight(app,id,40);
  assert.equal(app.run(`rowLayouts.get(${JSON.stringify(id)}).height`),40);
  assert(checkButtons(app,id,expected).length<large,'a short row override still clusters despite a tall global setting');
  overrideHeight(app,id,0);assert.equal(checkButtons(app,id,expected).length,large);
 });
 test(`筛选与点击：${width}px ${mode} cluster 及展开事件均可打开详情`,()=>{
  const {app,id}=setup('data-three-kingdoms.js',width,mode),all=expectedIds(app,id);
  const cluster=checkButtons(app,id,all).find(button=>button.action==='cluster');assert(cluster,'compact fixture must have a cluster');
  app.action(cluster.action,cluster.id);
  assert.equal(app.run('navigation.key'),'cluster:'+cluster.id);assert(app.el('#detail').open);
  for(const eventId of cluster.id.split(','))assert(app.el('#detailBody').innerHTML.includes('data-id="'+eventId+'"'));
  const detailEventId=cluster.id.split(',')[0];app.action('event',detailEventId);
  assert.equal(app.run('navigation.key'),'event:'+detailEventId);assert(app.el('#detail').open);
  assert(app.el('#detailBody').innerHTML.includes(app.run(`historyService.event(${JSON.stringify(detailEventId)}).name`)));
  app.run(`closeDetail(false);activeEventId=null;mode=${JSON.stringify(mode)};px=.8;rowHeight=160;render()`);
  const singleton=checkButtons(app,id,all).find(button=>button.action==='event');assert(singleton,'a tall row exposes independently clickable events');
  app.action('event',singleton.id);assert.equal(app.run('navigation.key'),'event:'+singleton.id);assert(app.el('#detail').open);
  app.run(`closeDetail(false);activeEventId=null;mode=${JSON.stringify(mode)};px=.8;render()`);
  const kind=app.run(`historyService.event(${JSON.stringify(singleton.id)}).kind`);
  app.el('#category').onchange({target:{value:kind}});
  const filtered=expectedIds(app,id,kind);assert(filtered.length>0);checkButtons(app,id,filtered);
  app.el('#category').onchange({target:{value:'all'}});checkButtons(app,id,all);
  // Exact event-name search must not retain unrelated cluster members.
  const name=app.run(`historyService.event(${JSON.stringify(singleton.id)}).name`);
  app.run(`searchScope='selected';updateSearch(${JSON.stringify(name)})`);
  const searched=Array.from(app.run(`historyService.eventsInRange({from:timelineBounds.start,to:end,states:[${JSON.stringify(id)}]}).filter(event=>matchEvent(event)).map(event=>event.id)`));
  checkButtons(app,id,searched);assert(searched.includes(singleton.id));
  app.run("updateSearch('')");checkButtons(app,id,all);
 });
 test(`focused 实际高亮：${width}px ${mode} 无空间时也不丢 ID`,()=>{
  const {app,id}=setup('data-three-kingdoms.js',width,mode),expected=expectedIds(app,id),focus=expected.at(-1);
  app.run(`activeEventId=${JSON.stringify(focus)};render()`);
  let list=checkButtons(app,id,expected),focused=list.find(button=>button.id.split(',').includes(focus));
  assert(focused.classes.includes('linkedEvent'),'focused singleton or cluster is highlighted');
  globalHeight(app,160);list=checkButtons(app,id,expected);focused=list.find(button=>button.id.split(',').includes(focus));
  assert(focused.classes.includes('linkedEvent'));assert.equal(focused.action,'event','tall row gives the focused event an independent button');
 });
}

for(const width of [1200,390])test(`秦汉接续共行：${width}px 全部成员事件只出现一次且按钮不越界`,()=>{
 const app=boot({},width,undefined,'data-qin-han.js');
 app.run("density='full';mode='events';px=.8;fitRows=false;rowHeight=160;render()");
 const stateId=app.run('appState.session.visibleRows.find(row=>row.grouped).members[0].id');
 const expected=Array.from(app.run('historyService.eventsInRange({from:timelineBounds.start,to:end,states:appState.session.visibleRows.find(row=>row.grouped).members.map(state=>state.id)}).map(event=>event.id)'));
 assert(expected.length>1);checkButtons(app,stateId,expected);
 assert(app.run('appState.session.visibleRows.find(row=>row.grouped).members.length')>1);
});
