const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx=vm.createContext({URLSearchParams});
for(const file of ['time','view-link','reading','combinations'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/core/'+file+'.js'),'utf8'),ctx);
const Z=ctx.Zhou,plain=value=>JSON.parse(JSON.stringify(value));
const states=[{id:'a',start:10,end:-10},{id:'b',start:5,end:0}],events=[{id:'e1'}],data={states,events,timeline:{start:10,end:-10,defaultEnd:0,cursor:1}};
const searchIndex=[{key:'event:e1',title:'跨元事件'}],search={index:searchIndex,normalizeKey:key=>typeof key==='string'?key:null};
const codec=Z.createViewLinkCodec(data,search),reading=Z.createReadingModel({data,searchIndex,now:()=>1000}),combo=Z.createCombinationModel(data);
const snapshot=cursor=>({view:{cursor,end:0,selected:['a'],px:4,category:'all',mode:'both',density:'auto',searchScope:'all',query:'',searchDescriptions:false},pinned:[],order:['a','b']});

test('分享v2带显式axis支持0和负年份，纯BCE保留v1',()=>{
 for(const cursor of [0,-2]){
  const value={...snapshot(cursor),range:{from:2,to:-5,width:600}},hash=codec.encode(value),params=new URLSearchParams(hash.slice(1));
  assert.equal(params.get('v'),'2');assert.equal(params.get('time'),'bce-axis');
  const parsed=codec.parse(hash);assert.equal(parsed.view.cursor,cursor);assert.equal(parsed.view.end,-10);assert.deepEqual(plain(parsed.range),value.range);
 }
 const value=snapshot(5);value.view.end=1;const params=new URLSearchParams(codec.encode(value).slice(1));assert.equal(params.get('v'),'1');assert.equal(params.has('time'),false);assert.equal(codec.parse(codec.encode(value)).view.cursor,5);
 assert.equal(codec.parse('#v=2&time=bce-axis&year=0&end=0').view.cursor,0);
 assert.equal(codec.parse('#v=2&time=bce-axis&year=-5&end=-7').view.end,-7);
});

test('分享拒绝未知encoding与不明确CE，兼容v1正BCE',()=>{
 for(const hash of ['#v=3&year=1','#v=2&year=0','#v=2&time=astronomical&year=0','#v=1&time=unknown&year=1'])assert.equal(codec.parse(hash),null);
 assert.equal(codec.parse('#year=0'),null);assert.equal(codec.parse('#v=1&year=-1'),null);assert.equal(codec.parse('#v=1&year=5').view.cursor,5);
 assert.equal(codec.parse('#v=2&time=bce-axis&year=-100'),null);
 assert.equal(codec.parse('#v=2&time=bce-axis&year=1.2'),null);
 assert.equal(codec.parse('#v=2&time=bce-axis&from=-3&to=2'),null);
});

test('阅读/访问带axis可保留0和负坐标，旧非正值按缺失回退而非CE',()=>{
 for(const cursor of [0,-3]){
  const value={...snapshot(cursor).view,timeEncoding:'bce-axis',end:-10};
  const before=JSON.stringify(value),result=reading.sanitizeReading(value);assert.equal(JSON.stringify(value),before);assert.equal(result.cursor,cursor);assert.equal(result.end,-10);assert.equal(result.timeEncoding,'bce-axis');
  const visit=reading.sanitizeVisits([{timeEncoding:'bce-axis',key:'event:e1',view:{...value,timeEncoding:undefined}}])[0];assert.equal(visit.view.cursor,cursor);assert.equal(visit.timeEncoding,'bce-axis');
 }
 for(const cursor of [0,-3,null,false])assert.equal(reading.sanitizeReading({...snapshot(cursor).view,end:-10}).cursor,1);
 assert.equal(reading.sanitizeReading({...snapshot(1).view,timeEncoding:'unknown'}),null);
 assert.equal(reading.sanitizeVisits([{key:'event:e1',timeEncoding:'unknown',view:snapshot(1).view}]).length,0);
 assert.equal(reading.sanitizeReading({...snapshot(5).view,end:2}).cursor,5);
});

test('跨元专题period id从资料配置读取并经阅读/访问记录往返保留',()=>{
 const model=Z.createReadingModel({data:{...data,periods:[{id:'before-common',start:10,end:1},{id:'common',start:0,end:-10}]},searchIndex});
 const view=model.sanitizeReading({...snapshot(0).view,timeEncoding:'bce-axis',periods:['all','before-common','common','west','unknown']});
 assert.deepEqual(plain(view.periods),['all','before-common','common']);
 const restored=model.restoreReading(JSON.parse(JSON.stringify({timeEncoding:'bce-axis',view,width:400})),{width:400,labelWidth:100,layout:{}});
 assert.deepEqual(plain(restored.view.periods),['all','before-common','common']);
 const visits=model.sanitizeVisits(JSON.parse(JSON.stringify([{key:'event:e1',view:restored.view}])));
 assert.deepEqual(plain(visits[0].view.periods),['all','before-common','common']);assert.equal(visits[0].view.cursor,0);
});

test('跨屏阅读恢复由bounds起点计算，外层axis标记支持跨元小数范围',()=>{
 const saved={timeEncoding:'bce-axis',view:{...snapshot(-2).view,end:-10},width:1200,range:{from:1.5,to:-3.5},layout:{}};
 const result=reading.restoreReading(saved,{width:400,labelWidth:100,layout:{}});
 assert.equal(result.view.cursor,-2);assert.equal(result.view.px,24);assert.equal(result.view.left,(10-1.5)*24);
 const zero=reading.restoreReading({...saved,range:{from:0,to:-10}},{width:200,labelWidth:100,layout:{}});assert.equal(zero.view.px,10);assert.equal(zero.view.left,100);
 assert.equal(reading.restoreReading({...saved,timeEncoding:'unknown'},{width:400,labelWidth:100,layout:{}}),null);
});

test('组合兼容BCE记录并为新坐标记录加encoding；无标记0/-数不解释为CE',()=>{
 const base={id:'saved-axis',name:'跨元',states:['a'],from:2,to:-4,end:-10,cursor:0,timeEncoding:'bce-axis'};
 const before=JSON.stringify(base),result=combo.normalize(base);assert.equal(JSON.stringify(base),before);
 assert.equal(result.from,2);assert.equal(result.to,-4);assert.equal(result.cursor,0);assert.equal(result.end,-10);assert.equal(result.timeEncoding,'bce-axis');
 assert.equal(combo.normalize({...base,cursor:-3}).cursor,-3);
 assert.equal(combo.normalize({...base,timeEncoding:undefined}).to,0);assert.equal(combo.normalize({...base,timeEncoding:undefined}).cursor,2);
 assert.equal(combo.normalize({...base,timeEncoding:'unknown'}),null);assert.equal(combo.normalize({...base,from:-5,to:2}),null);
 assert.equal(combo.normalize({...base,from:0,to:0,cursor:0}).from,0);
});

test('周朝显式bounds保持既有BCE分享与阅读默认行为',()=>{
 const zhou={states:[{id:'qin',start:900,end:221}],events:[],timeline:{start:1046,end:221,defaultEnd:256,cursor:770}};
 const links=Z.createViewLinkCodec(zhou,{index:[],normalizeKey:key=>key}),model=Z.createReadingModel({data:zhou,searchIndex:[]});
 assert.equal(links.parse('#year=221').view.end,221);assert.equal(links.parse('#year=632').view.cursor,632);assert.equal(links.parse('#year=200'),null);
 const view=model.sanitizeReading({selected:['qin']});assert.equal(view.cursor,770);assert.equal(view.end,256);
 const restored=model.restoreReading({view:{selected:['qin'],cursor:350,end:221},width:1200,range:{from:800,to:600}},{width:400,labelWidth:100,layout:{}});assert.equal(restored.view.left,369);assert.equal(restored.view.px,1.5);
 const normalized=Z.createCombinationModel(zhou).normalize({name:'旧组合',states:['qin'],from:600,to:300,cursor:450});assert.equal(normalized.from,600);assert.equal(normalized.to,300);assert.equal(normalized.end,256);assert.equal(normalized.cursor,450);
});
