'use strict';
// Fixed expected values were captured from the user's pre-rebuild dist, not
// calculated from the application under test. See docs/COMPATIBILITY-BASELINE.md.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {boot,attachStudy}=require('./helpers/browser.cjs');
const root=path.resolve(__dirname,'..');
const plain=value=>JSON.parse(JSON.stringify(value));
const pick=(value,keys)=>Object.fromEntries(keys.filter(key=>value?.[key]!==undefined).map(key=>[key,plain(value[key])]));
const source=value=>pick(value,['id','title','url']);
// Additive metadata is compatible. Existing array members/order and scalar
// values still have to match; missing fields are never silently filled in.
function knownFields(actual,expected){
 if(Array.isArray(expected))return Array.isArray(actual)?actual.map((value,i)=>i<expected.length?knownFields(value,expected[i]):value):actual;
 if(expected&&typeof expected==='object'&&actual&&typeof actual==='object')return Object.fromEntries(Object.keys(expected).filter(key=>Object.hasOwn(actual,key)).map(key=>[key,knownFields(actual[key],expected[key])]));
 return actual;
}
const stableDrawText=text=>text.replace(/ · 导出 .+$/u,' · 导出 <DATE>');
function dating(value){
 if(!value)return null;
 return {...pick(value,['level','reason','reviewStatus']),sources:(value.sources||[]).map(source),alternatives:(value.alternatives||[]).map(a=>({...pick(a,['label','year','explanation']),sources:(a.sources||[]).map(source)}))};
}
function ruler(value){return {...pick(value,['id','name','person','start','end','lane','role','source','description','exit']),dating:dating(value.dating),chronology:value.chronology?{...pick(value.chronology,['accession','regnalStart','abdication','death','changes','endKind','note']),sources:(value.chronology.sources||[]).map(source)}:null};}
function event(value){return {...pick(value,['id','name','year','states','kind','description']),sources:(value.sources||[]).map(source),dating:dating(value.dating)};}
function snapshot(value){return {...pick(value,['schemaVersion','version','updated','from','to','category','cursor','chronology']),states:value.states.map(s=>({...pick(s,['id','name','start','end','interruptions','endLabel','endNote']),dating:dating(s.dating),rulers:s.rulers.map(ruler)})),events:value.events.map(event),stateNames:plain(value.stateNames),sources:value.sources.map(source)};}
function load(app,name){vm.runInContext(fs.readFileSync(path.join(root,'dist',name+'.js'),'utf8'),app.ctx,{filename:'dist/'+name+'.js'});}
function mountShare(app,hash){
 const current=new URL('https://example.com/timeline/'+hash),listeners={};
 const location={};
 for(const key of ['href','hash','pathname','search','protocol'])Object.defineProperty(location,key,{get:()=>current[key]});
 app.ctx.window.location=location;
 app.ctx.window.history={state:null,replaceState(state,title,url){current.href=new URL(url,current).href;}};
 app.ctx.window.addEventListener=(name,fn)=>(listeners[name]||=[]).push(fn);
 app.ctx.URLSearchParams=URLSearchParams;
 // Queued share saves must not execute synchronously inside their own callback.
 app.ctx.setTimeout=()=>1;app.ctx.clearTimeout=()=>{};
 app.el('#shareLink').select=()=>{};
 load(app,'share');return app;
}
function readingView(app){return plain(app.run(`({view:captureDetailFrame().view,layout:viewAdapter.getLayout(),detail:currentDetailKey,detailOpen:!!$('#detail').open,detailTop:$('#detail').scrollTop,visits:studyVisits.map(v=>({key:v.key,title:v.title,top:v.top}))})`));}
function shareView(app){return plain(app.run(`({view:captureDetailFrame().view,pinned:[...pinned],order:[...stateOrder],item:currentDetailKey,detailOpen:!!$('#detail').open})`));}
const queries=['齐桓公','長平之戰','长平之战','秦灭楚','嬴政','秦始皇','商鞅','孫臏','赵成子',' 周 赧 王 ','唐叔虞','陶朱公','完全不存在的姓名XYZ'];
const years=[['qin',251],['qin',250],['qin',249],['qin',247],['qin',246],['qin',222],['qin',221],['qin',220],['jin',574],['jin',573],['jin',572],['qi',356],['qi',355],['yan',314],['yan',313],['yan',312],['chen',535],['chen',534],['chen',530],['chen',529],['cai',532],['cai',531],['cai',530],['cai',529]];
const exportsOptions=[{states:['qi'],from:355,to:355,cursor:355,category:'all',span:150},{states:['qin'],from:260,to:221,cursor:221,category:'all',span:100},{states:['jin'],from:580,to:570,cursor:573,category:'all',span:150},{states:['cai','chen'],from:535,to:529,cursor:530,category:'all',span:150}];
async function observe(inputs){
 const result={},app=boot(),{run}=app;
 result.queries=Object.fromEntries(queries.map(q=>[q,plain(run(`searchMatches(${JSON.stringify(q)}).map(h=>({key:h.entry.key,title:h.entry.title,reason:h.reason}))`))]));
 run("selected=new Set(['qin']);searchScope='selected'");result.selectedQuery=plain(run("searchMatches('齐桓公').map(h=>h.entry.key)"));
 result.years=years.map(([id,year])=>({id,year,...plain(run(`({exists:historyService.existsAt('${id}',${year}),interruption:historyService.interruptionAt('${id}',${year})||null,actual:historyService.rulersAt('${id}',${year}).map(r=>r.id),bars:historyService.rulersInRange('${id}',${year},${year}).map(r=>r.id),events:historyService.eventsInRange({states:['${id}'],from:${year},to:${year}}).map(e=>e.id)})`))}));
 result.qinPhase=ruler(run("historyService.state('qin').rulers.find(r=>r.id==='qin-r35')"));
 result.eventOpinions=['e35','e72','e77'].map(id=>event(run(`historyService.event('${id}')`)));
 result.shares=[];
 for(const hash of inputs.hashes){
  const shared=mountShare(attachStudy(boot({},1200)),hash);
  const codec=shared.run('Zhou.createViewLinkCodec(D,searchService)');
  result.shares.push({hash,parsed:plain(codec.parse(hash)),view:shareView(shared),detailText:shared.el('#detailBody').innerHTML.replace(/<p class="notice" data-correction-entry="true">[\s\S]*?<\/p>/g,'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim()});
  assert.equal(plain(codec.parse(codec.encode(codec.parse(hash)))).item,plain(codec.parse(hash)).item,'v1 detail key survives codec round trip');
 }
 result.reading={};
 for(const width of [1200,390]){
  const restored=attachStudy(boot({...inputs.legacyStore},width));
  const before=JSON.stringify(inputs.legacyStore);
  const rootView=readingView(restored);restored.el('#lastRead').onclick();
  const detail=readingView(restored);restored.el('#close').onclick();
  result.reading[width]={root:rootView,detail,closed:readingView(restored)};
  assert.equal(JSON.stringify(inputs.legacyStore),before,'restore must not mutate caller legacy fixture');
 }
 load(app,'export');result.exports=[];
 for(const options of exportsOptions){
  app.ctx.baselineOptions=options;
  const model=run('historyService.comparison(baselineOptions)'),before=JSON.stringify(model);
  const plan=app.ctx.Zhou.buildExportPlan(model,options,(text,size)=>text.length*size);
  const planBefore=JSON.stringify(plan),drawn=[];
  const canvas={measureText:text=>({width:text.length*14}),fillText:text=>drawn.push(String(text)),fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},stroke(){},fill(){},strokeRect(){},setLineDash(){}};
  plan.pages.forEach((page,i)=>app.ctx.Zhou.drawExportPage(canvas,page,plan,i));
  assert.equal(JSON.stringify(model),before,'layout must not mutate detached JSON export');
  assert.equal(JSON.stringify(plan),planBefore,'canvas must not mutate export plan');
  const projected=snapshot(model);
  result.exports.push({options,json:projected,pages:plan.pages.map(p=>p.type==='chart'?{type:p.type,from:p.from,to:p.to,rows:p.rows.map(r=>({id:r.s.id,lanes:r.lanes,rulers:r.rulers.map(v=>({id:v.id,start:v.start,end:v.end,lane:v.exportLane}))}))}:{type:p.type,lines:p.lines.map(l=>pick(l,['text','kind','height']))}),events:plan.events.map(v=>({id:v.e.id,number:v.number,refs:plain(v.refs),alternatives:v.alternatives.map(a=>({label:a.a.label,refs:plain(a.refs)}))})),sources:plan.sources.map(source),drawn:drawn.map(stableDrawText)});
  model.states[0].name='MUTATED';model.states[0].rulers[0].name='MUTATED';model.sources[0].title='MUTATED';
  const nested=model.states[0].rulers[0];
  if(nested.chronology?.sources?.[0])nested.chronology.sources[0].title='MUTATED';
  if(nested.dating?.alternatives?.[0]){nested.dating.alternatives[0].label='MUTATED';nested.dating.alternatives[0].sources[0].url='https://invalid.example/mutated';}
  if(model.events[0]){model.events[0].name='MUTATED';model.events[0].sources[0].title='MUTATED';}
  assert.deepEqual(snapshot(run('historyService.comparison(baselineOptions)')),projected,'JSON export is detached from source and subsequent exports');
 }
 // Exercise the actual JSON download wrapper, not only its underlying service.
 const download=boot();load(download,'export');download.el('#exportDownload').appendChild=node=>{download.downloadName=node.download;};
 download.run("selected=new Set(['qin']);query='';end=221;render()");download.el('#exportCompare').onclick();
 for(const [id,value] of Object.entries({exportFrom:'260',exportTo:'221',exportSpan:'100',exportFormat:'json'}))download.el('#'+id).value=value;
 await download.run('createComparisonExport()');
 assert(download.ctx.exportedBlob,'JSON wrapper must create a downloadable Blob');
 result.download={name:download.downloadName,type:download.ctx.exportedBlob.type,json:snapshot(JSON.parse(await download.ctx.exportedBlob.text()))};
 return plain(result);
}
module.exports={observe};
{
 const test=require('node:test');
 test('周朝固定兼容基线：旧查询、即位/条带、中断复国、秦221、v1详情链接、旧阅读恢复、JSON与图页来源异说',async()=>{
  const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/zhou-baseline.json'),'utf8'));
  const actual=await observe(fixture.inputs);
  for(const key of Object.keys(fixture.expected))assert.deepEqual(knownFields(actual[key],fixture.expected[key]),fixture.expected[key],key+' differs from pre-rebuild Zhou baseline');
 });
}
