'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');const root=path.resolve(__dirname,'..'),helper=path.join(root,'tests/helpers/browser.cjs'),plain=v=>JSON.parse(JSON.stringify(v));
function presentation(){const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'src/core/presentation.js'),'utf8'),ctx);return ctx.Zhou.Presentation;}
async function dataset(id='zhou'){const {catalog,compileProduction}=await import('../lib/production.mjs');const topic=catalog.find(t=>t.id===id);return compileProduction(JSON.parse(fs.readFileSync(path.join(root,'data',topic.file),'utf8')),id);}
function bootSource(data){const bundle=fs.readFileSync(path.join(root,'build.mjs'),'utf8').match(/'app\.js':\s*\[([^\]]+)\]/)[1],source=[...bundle.matchAll(/'([^']+)'/g)].map(m=>fs.readFileSync(path.join(root,m[1]),'utf8')).join('\n'),actualRequire=createRequire(helper),module={exports:{}},replacement={...fs,readFileSync(file,...args){const name=String(file).replaceAll('\\','/');if(name.endsWith('/dist/data.js'))return 'window.ZHOU_DATA='+JSON.stringify(data);if(name.endsWith('/dist/app.js'))return source;return fs.readFileSync(file,...args);}};vm.runInNewContext(fs.readFileSync(helper,'utf8'),{require:id=>id==='node:fs'?replacement:actualRequire(id),module,exports:module.exports,__dirname:path.dirname(helper),console,AbortController,Blob,TextEncoder,Uint8Array,DataView,Date,Math});return module.exports.boot();}
test('短祚纯像素微槽保留冻结数组次序、0坐标、独立任期及inclusive pack',()=>{
 const p=presentation(),records=['z-last','a-first','m-middle'].map(id=>Object.freeze({id,stateId:'a',start:0,end:0,personId:'same',lane:0}));Object.freeze(records);const before=JSON.stringify(records),base=p.pack(records,3,-3),result=p.tenureSlots(base.items,{position:r=>6-r.start*2,scale:2,order:records,limit:100});
 assert.deepEqual(plain(result.items.map(r=>[r.id,r.start,r.end,r.slotOrder,r.slotCount])),[['z-last',0,0,1,3],['a-first',0,0,2,3],['m-middle',0,0,3,3]]);assert(result.items.every(r=>r.visualWidth>=14&&r.anchor===6));assert.deepEqual(plain(result.items.map(r=>r.visualLeft)),[6,22,38]);assert.equal(base.lanes,3);assert.equal(JSON.stringify(records),before);
 for(const a of result.items)for(const b of result.items)if(a!==b&&a.displayLane===b.displayLane)assert(a.visualLeft+a.visualWidth<=b.visualLeft||b.visualLeft+b.visualWidth<=a.visualLeft);
});
test('像素微槽不将不同政权或邻年接续误排为同年继承，拥挤时保留纵向分层',()=>{
 const p=presentation(),records=[{id:'long',stateId:'a',start:2,end:0},{id:'tiny',stateId:'a',start:0,end:0},{id:'next',stateId:'a',start:-1,end:-2},{id:'foreign',stateId:'b',start:0,end:0}],packed=p.pack(records,3,-3),result=p.tenureSlots(packed.items,{position:r=>(3-r.start),scale:1,order:records,limit:18});
 assert.equal(result.items.find(r=>r.id==='tiny').slotCount,2);assert.equal(result.items.find(r=>r.id==='foreign').slotCount,1);assert.equal(result.items.find(r=>r.id==='next').slotCount,1);assert(result.items.every(r=>r.visualLeft>=0&&r.visualWidth>=14));for(const a of result.items)for(const b of result.items)if(a!==b&&a.displayLane===b.displayLane)assert(a.visualLeft+a.visualWidth<=b.visualLeft||b.visualLeft+b.visualWidth<=a.visualLeft);
});
test('短槽预留后续长条的原车道，不把相邻长任期层层挤开',()=>{
 const p=presentation(),records=Object.freeze([Object.freeze({id:'tiny',stateId:'a',start:0,end:0,displayLane:0}),Object.freeze({id:'long',stateId:'a',start:-1,end:-40,displayLane:0})]),result=p.tenureSlots(records,{position:r=>-r.start,scale:1,order:records});
 const long=result.items.find(r=>r.id==='long'),tiny=result.items.find(r=>r.id==='tiny');assert.equal(long.displayLane,0);assert.equal(long.visualLeft,1);assert.equal(long.visualWidth,40);assert.equal(tiny.displayLane,1);assert.equal(records[0].end,0);
});
test('区间的完整显示跨度不受210px标签上限截断，折叠仍保留全部原ID',()=>{
 const p=presentation(),records=Object.freeze([Object.freeze({id:'long',year:10,endYear:-10}),Object.freeze({id:'point',year:0})]);const alone=p.events([records[0]],{position:()=>0,measure:()=>36,extent:()=>2000,top:0,bottom:0});assert.equal(alone.groups[0].width,2000);
 const packed=p.events(records,{position:e=>(10-e.year)*100,measure:()=>36,measureGroup:()=>80,extent:e=>e.endYear===undefined?null:2000,top:0,bottom:0});assert.deepEqual(plain(packed.groups.flatMap(g=>g.events.map(e=>e.id)).sort()),['long','point']);assert.equal(records[0].endYear,-10);
});
test('低倍短区间不借君主控件的14px下限扩大历史跨度',()=>{
 const p=presentation(),event={id:'narrow',year:0,endYear:-1},result=p.events([event],{position:()=>0,measure:()=>36,extent:()=>1.6,top:0,bottom:0});assert.equal(result.groups[0].width,1.6);assert.equal(event.endYear,-1);
});
test('源UI渲染独立短祚控件、完整提示和同年任期列表，点击仍指向原ID',async()=>{
 const data=await dataset(),state=data.states.find(s=>s.id==='qin'),base=state.rulers[0];state.rulers=['z-last','a-first','m-middle'].map((id,i)=>({...base,id,name:'短祚'+i,start:500,end:500,lane:0,chronology:{accession:500,regnalStart:500,abdication:null,death:null}}));data.events=[];const app=bootSource(data);app.run("selected=new Set(['qin']);px=1;mode='rulers';density='full';rowHeight=160;fitRows=false;render()");const html=app.el('#chart').innerHTML;
 for(const r of state.rulers){assert(html.includes('data-id="'+r.id+'"'));}assert.equal((html.match(/data-slot-count="3"/g)||[]).length,3);assert.match(html,/仅像素微槽/);app.run("showRuler('a-first')");assert.match(app.el('#detailBody').innerHTML,/同一人物复位仍保留独立任期/);assert.match(app.el('#detailBody').innerHTML,/data-id="z-last"/);assert.equal(app.run('navigation.key'),'ruler:a-first');
});
test('紧凑齐国四条微槽车道保留实体边框、18px胶囊与事件底部空间',async()=>{
 const app=bootSource(await dataset()),before=app.run('JSON.stringify(D)');app.run("selected=new Set(['qi']);mode='both';density='full';rowHeight=36;px=.8;fitRows=false;render()");const layout=app.run("rowLayouts.get('qi')"),html=app.el('#chart').innerHTML;
 assert(layout.height<=64&&layout.barHeight>=4);const capsule=html.match(/class="event undatedCapsule"[^>]*style="[^"]*top:([\d.]+)px/);assert(capsule);const tops=[...html.matchAll(/class="ruler [^"]*"[^>]*style="[^"]*top:([\d.]+)px/g)].map(m=>Number(m[1]));assert(tops.length);assert(Math.min(...tops)>=Number(capsule[1])+18);assert(Math.max(...tops)+layout.barHeight<layout.eventTop);assert(layout.eventTop+18<=layout.height);assert.equal(app.run('JSON.stringify(D)'),before);
});
test('区间UI、中年看板与详情保留CE0及完整起讫，不将人物活动扩为全程',async()=>{
 const data=await dataset('qin-han'),state=data.states.find(s=>s.start>=0&&s.end<=-4),event={...data.events[0],id:'interval-ui',year:0,endYear:-4,states:[state.id],participants:[],name:'跨年区间示例',key:true};data.events=[event];data.timeline={...data.timeline,start:10,end:-10,defaultEnd:-10,cursor:-2};const app=bootSource(data);app.run(`selected=new Set([${JSON.stringify(state.id)}]);mode='events';density='full';rowHeight=160;fitRows=false;px=7;render();setCursor(-2);showEvent('interval-ui')`);
 assert.match(app.el('#chart').innerHTML,/intervalEvent/);assert.match(app.el('#chart').innerHTML,/data-interval-start="0" data-interval-end="-4"/);assert.equal(app.run('cursor'),-2);assert.match(app.el('#detailBody').innerHTML,/公元1—5年/);assert.match(app.el('#detailBody').innerHTML,/不表示其贯穿整个事件区间/);assert.equal(app.run("historyService.compareYear(-2).some(row=>row.events.some(e=>e.id==='interval-ui'))"),true);assert.equal(app.run("searchService.index.find(e=>e.key==='event:interval-ui').until"),-4);
});
