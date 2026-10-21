const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx=vm.createContext({Date});
for(const file of ['src/core/time.js','src/core/history.js','src/core/presentation.js','src/core/export-layout.js','src/outputs/canvas.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const {Time,createHistory,buildExportPlan,drawExportPage}=ctx.Zhou,plain=value=>JSON.parse(JSON.stringify(value));
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
// Standalone authoring -> runtime fixture: intentionally independent of the
// domain validator/compiler workstream. Schema 2 uses the public Time codec.
function fixture(schemaVersion=2){
 const date=n=>schemaVersion===1?n:n>0?{era:'BCE',year:n}:{era:'CE',year:1-n};
 const authoring={schemaVersion,timeline:{start:date(150),end:date(schemaVersion===1?1:-150),defaultEnd:date(schemaVersion===1?1:-150),cursor:date(schemaVersion===1?100:0)},states:['a','b'].map(id=>({id,name:id==='a'?'甲':'乙',start:date(150),end:date(schemaVersion===1?1:-150),color:'#123456',interruptions:[],rulers:[]})),events:schemaVersion===1?[{id:'old-interval',year:date(130),endYear:date(70),states:['a'],kind:'战争'},{id:'old-point',year:date(100),states:['a'],kind:'政治'}]:[{id:'long',year:date(120),endYear:date(-120),states:['a','b'],kind:'战争'},{id:'early',year:date(100),states:['a'],kind:'政治'},{id:'cross',year:date(1),endYear:date(-1),states:['a'],kind:'战争'},{id:'point',year:date(0),states:['a'],kind:'政治'},{id:'equal',year:date(0),endYear:date(0),states:['a'],kind:'战争'}]};
 const project=value=>schemaVersion===1?value:Time.encode(value),data={title:'合成区间专题',version:1,updated:'2026-10-21',timeline:Object.fromEntries(Object.entries(authoring.timeline).map(([k,v])=>[k,project(v)])),states:authoring.states.map(s=>({...s,start:project(s.start),end:project(s.end)})),people:[],periods:[],sources:[{title:'测试出处',url:'https://example.test/source'}],events:authoring.events.map(e=>({...e,year:project(e.year),...(Object.hasOwn(e,'endYear')?{endYear:project(e.endYear)}:{}),name:e.id+'完整事件',description:e.id+'完整正文',sources:[{title:'测试出处',url:'https://example.test/source'}],dating:{level:'certain',alternatives:[]}}))};
 return {authoring:freeze(authoring),data:freeze(data)};
}
const measure=text=>text.length*12,indexText=plan=>plan.pages.filter(page=>page.type==='index').flatMap(page=>page.lines).map(line=>line.text).join('');
function recorder(){
 const paths=[],texts=[],calls=[];let active=[];
 const canvas={paths,texts,calls,measureText:text=>({width:text.length*14}),fillText(text,x,y){texts.push({text,x,y});calls.push(['text',text,x,y]);},fillRect(...v){calls.push(['rect',...v]);},strokeRect(...v){calls.push(['strokeRect',...v]);},beginPath(){active=[];},moveTo(...v){active.push(['move',...v]);},lineTo(...v){active.push(['line',...v]);},quadraticCurveTo(...v){active.push(['curve',...v]);},closePath(){active.push(['close']);},fill(){paths.push({style:this.fillStyle,points:active.map(v=>v.slice())});},stroke(){},setLineDash(){}};return canvas;
}

test('Time.eventRange只接受有效闭区间；0/负有效，显式未知不退化为单点',()=>{
 for(const [event,expected] of [[{year:3},{start:3,end:3}],[{year:0},{start:0,end:0}],[{year:2,endYear:-2},{start:2,end:-2}],[{year:-1,endYear:-3},{start:-1,end:-3}],[{year:0,endYear:0},{start:0,end:0}]])assert.deepEqual(plain(Time.eventRange(freeze(event))),expected);
 for(const event of [null,undefined,0,{}, {year:null},{year:'2'},{year:1.5},{year:1,endYear:null},{year:1,endYear:undefined},{year:1,endYear:2},{year:0,endYear:1},{year:1,endYear:NaN},{year:1,endYear:Infinity},{year:1,endYear:'0'},{year:1,endYear:-Number.MAX_SAFE_INTEGER}])assert.equal(Time.eventRange(event),null);
 const inherited=Object.assign(Object.create({endYear:-3}),{year:2});assert.deepEqual(plain(Time.eventRange(inherited)),{start:2,end:2});
});

test('schema1/2合成投影：按中段与两端闭区间命中，政权/类别和旧point稳定顺序不变',()=>{
 for(const version of [1,2]){
  const {data,authoring}=fixture(version),before=JSON.stringify({data,authoring}),history=createHistory(data),interval=data.events[0];
  for(const year of [interval.year,version===1?100:0,interval.endYear])assert(history.eventsInRange({from:year,to:year,states:['a']}).some(e=>e===interval));
  for(const year of [interval.year+1,interval.endYear-1])assert(!history.eventsInRange({from:year,to:year}).some(e=>e.id===interval.id));
  const results=history.eventsInRange({from:version===1?100:0,to:version===1?100:0,states:['a'],category:'政治'});assert.deepEqual(plain(results.map(e=>e.id)),[version===1?'old-point':'point']);
  assert.equal(history.eventsInRange({states:['missing']}).length,0);assert.equal(JSON.stringify({data,authoring}),before);
 }
 const {data}=fixture(),history=createHistory(data);assert.deepEqual(plain(history.eventsInRange().map(e=>e.id)),['long','early','cross','point','equal']);
 assert.deepEqual(plain(history.eventsInRange({from:0,to:0,states:['b']}).map(e=>e.id)),['long']);
 assert.deepEqual(plain(history.compareYear(-1,['a'])[0].events.map(e=>e.id)),['long','cross']);
 assert.equal(history.eventsInRange({from:1,to:-1}).filter(e=>e.id==='long').length,1);
});

test('非法区间在查询/导出跳过，未知不推日期，comparison保留完整原日期和字段',()=>{
 const {data}=fixture(),bad=[{id:'null-end',year:3,endYear:null},{id:'reverse',year:1,endYear:2},{id:'unknown',year:null}].map(e=>({...e,states:['a'],kind:'战争',name:e.id,description:'不应伪造',sources:[]}));
 const invalidData=freeze({...data,events:[...data.events,...bad]}),before=JSON.stringify(invalidData),history=createHistory(invalidData),model=history.comparison({states:['a'],from:1,to:-1,cursor:0});
 assert.deepEqual(plain(model.events.map(e=>e.id)),['long','cross','point','equal']);assert.equal(model.events[0].year,120);assert.equal(model.events[0].endYear,-120);assert.equal(model.events[0].description,'long完整正文');assert.equal(model.events[2].endYear,undefined);
 model.events[0].endYear=0;assert.equal(data.events[0].endYear,-120);assert.equal(JSON.stringify(invalidData),before);
 const plan=buildExportPlan({...model,events:bad},{},measure);assert.equal(plan.events.length,0);assert.doesNotMatch(indexText(plan),/不应伪造/);
});

test('跨CE区间分页裁剪含端点年份，中页不造端点，索引完整起讫仅一遍且E编号一致',()=>{
 const {data}=fixture(),model=freeze(createHistory(data).comparison({states:['a','b'],from:150,to:-150,cursor:0})),before=JSON.stringify(model),plan=buildExportPlan(model,{span:100},measure),charts=plan.pages.filter(page=>page.type==='chart');
 assert.equal(plan.hasIntervals,true);assert.deepEqual(plain(charts.map(page=>[page.from,page.to])),[[150,51],[50,-49],[-50,-149],[-150,-150]]);
 const segments=charts.flatMap(page=>page.rows.filter(row=>row.s.id==='a').flatMap(row=>(row.intervalEvents||[]).filter(v=>v.event.e.id==='long')));
 assert.deepEqual(plain(segments.map(v=>[v.from,v.to,v.startClipped,v.endClipped])),[[120,51,false,true],[50,-49,true,true],[-50,-120,true,false]]);
 assert(segments.every(segment=>segment.event===plan.events[0]));assert.equal(charts[3].rows.some(row=>row.intervalEvents),false);
 for(const page of charts.slice(0,3)){const a=page.rows[0].intervalEvents.find(v=>v.event.e.id==='long'),b=page.rows[1].intervalEvents.find(v=>v.event.e.id==='long');assert.equal(a.event.number,b.event.number);}
 const text=indexText(plan);assert.equal(text.split('E1 · 前120年—公元121年 · long完整事件').length-1,1);assert.equal(text.split('long完整正文').length-1,1);assert.match(text,/E3 · 前1年—公元2年 · cross完整事件/);assert.match(text,/E4 · 公元1年 · point完整事件/);assert.match(text,/平切端及续接线/);
 assert.equal(plan.sources.length,1);assert.equal(plan.events[0].e,model.events[0]);assert.equal(JSON.stringify(model),before);
});

test('只导出区间中段，原始起讫不被视窗替换；Canvas胶囊宽度及端帽符合裁页',()=>{
 const {data}=fixture(),model=freeze(createHistory(data).comparison({states:['b'],from:50,to:-49,cursor:0})),plan=freeze(buildExportPlan(model,{span:100},measure)),page=plan.pages[0],segment=page.rows[0].intervalEvents[0],before=JSON.stringify(plan),canvas=recorder();
 assert.equal(model.events[0].year,120);assert.equal(model.events[0].endYear,-120);assert.equal(segment.from,50);assert.equal(segment.to,-49);assert(segment.startClipped&&segment.endClipped);
 drawExportPage(canvas,page,plan,0);const capsule=canvas.paths.find(p=>p.style==='#b68c47');assert(capsule);assert.equal(capsule.points.some(p=>p[0]==='curve'),false);
 const xs=capsule.points.filter(p=>p[0]==='move'||p[0]==='line').map(p=>p[1]);assert.equal(Math.min(...xs),132);assert.equal(Math.max(...xs),1155);assert.equal(Math.max(...xs)-Math.min(...xs),(50-(-49)+1)*(1023/100));
 assert(canvas.texts.some(t=>t.text==='E1'));assert(canvas.texts.some(t=>t.text.includes('胶囊E＝区间')));assert.match(indexText(plan),/前120年—公元121年/);assert.equal(JSON.stringify(plan),before);
});

test('真实起讫保留圆帽；跨页胶囊不溢出，E号重复引用而索引不重复',()=>{
 const {data}=fixture(),model=createHistory(data).comparison({states:['b'],from:150,to:-150,cursor:0}),plan=buildExportPlan(model,{span:100},measure),charts=plan.pages.filter(page=>page.type==='chart');
 const curveCounts=[];for(let i=0;i<charts.length;i++){const canvas=recorder();drawExportPage(canvas,charts[i],plan,i);const capsules=canvas.paths.filter(p=>p.style==='#b68c47');curveCounts.push(capsules.reduce((n,p)=>n+p.points.filter(v=>v[0]==='curve').length,0));for(const capsule of capsules)for(const command of capsule.points){if(command[0]==='move'||command[0]==='line')assert(command[1]>=132&&command[1]<=1155);if(command[0]==='curve'){assert(command[1]>=132&&command[1]<=1155);assert(command[3]>=132&&command[3]<=1155);}}if(i<3)assert(canvas.texts.some(t=>t.text==='E1'));}
 assert.deepEqual(curveCounts,[2,0,2,0]);
});

test('恰在分页首尾的区间端点只属对应年份页；endYear=0不当作缺失',()=>{
 const {data}=fixture(),model=createHistory(data).comparison({states:['b'],from:150,to:-150,cursor:0});model.events=[{...model.events[0],year:51,endYear:-50},{...model.events[0],id:'exact-page',year:50,endYear:-49},{...model.events[0],id:'zero-end',year:2,endYear:0}];
 const plan=buildExportPlan(freeze(model),{span:100},measure),charts=plan.pages.filter(page=>page.type==='chart'),segments=charts.flatMap(page=>(page.rows[0].intervalEvents||[]).filter(v=>v.event.number===1));
 assert.deepEqual(plain(segments.map(v=>[v.from,v.to,v.startClipped,v.endClipped])),[[51,51,false,true],[50,-49,true,true],[-50,-50,true,false]]);
 const exact=charts.flatMap(page=>(page.rows[0].intervalEvents||[]).filter(v=>v.event.number===2));assert.equal(exact.length,1);assert.deepEqual(plain([exact[0].from,exact[0].to,exact[0].startClipped,exact[0].endClipped]),[50,-49,false,false]);
 const zero=charts[1].rows[0].intervalEvents.find(v=>v.event.number===3);assert.equal(zero.to,0);assert.equal(zero.endClipped,false);assert.match(indexText(plan),/E3 · 前2年—公元1年/);
 const canvas=recorder();drawExportPage(canvas,charts[1],JSON.parse(JSON.stringify(plan)),1);assert(canvas.paths.some(p=>p.points.some(v=>v[0]==='curve')),'serialized plans render by E number, not wrapper reference identity');
});

test('旧单点图元、E编号/文字/图例保持；显式相等终点仍是同一菱形',()=>{
 const {data}=fixture(),base=createHistory(data).comparison({states:['a'],from:1,to:-1,cursor:0});base.events=base.events.filter(e=>e.id==='point');
 const before=JSON.stringify(base),plan=buildExportPlan(freeze(base),{},measure),page=plan.pages[0],canvas=recorder();drawExportPage(canvas,page,plan,0);
 assert.equal(plan.hasIntervals,undefined);assert.equal(page.rows[0].intervalEvents,undefined);assert.equal(plan.events[0].interval,undefined);assert.deepEqual(Object.keys(plan.events[0]),['e','number','refs','alternatives']);
 const xx=132+341,yy=212+102-29,diamond=canvas.paths.find(p=>p.style==='#b68c47');assert.deepEqual(diamond.points,[['move',xx,yy-6],['line',xx+6,yy],['line',xx,yy+6],['line',xx-6,yy],['close']]);
 assert.match(indexText(plan),/E1 · 公元1年 · point完整事件 · 甲 · 较确定 · 来源\[1\]/);assert.doesNotMatch(indexText(plan),/区间事件：/);assert(canvas.texts.some(t=>t.text==='彩条＝君主　细线＝国家存续　菱形E编号＝同一事件　红线＝终止 / 称帝　金线＝参考年份'));assert.equal(JSON.stringify(base),before);
 const explicit={...base,events:[{...base.events[0],endYear:0}]},otherPlan=buildExportPlan(explicit,{},measure),otherCanvas=recorder();drawExportPage(otherCanvas,otherPlan.pages[0],otherPlan,0);assert.deepEqual(otherCanvas.calls,canvas.calls);assert.deepEqual(otherCanvas.paths,canvas.paths);assert.equal(indexText(otherPlan),indexText(plan));
});
