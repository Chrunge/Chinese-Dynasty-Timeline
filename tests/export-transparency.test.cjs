const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const text=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8'),plain=value=>JSON.parse(JSON.stringify(value));
function dataFixture(){
 const source={id:'book',title:'资料总来源',url:'https://example.test/book'},rulerSource={title:'任期原注',url:'https://example.test/tenure'},eventSource={title:'事件异说来源',url:'https://example.test/alternative'};
 const ruler={id:'ra',polityId:'a',personId:'pa',name:'完整任期',start:8,end:-8,role:'君主',description:'完整任期正文。'.repeat(2000),biography:{summary:'完整生平正文。'.repeat(2000)},chronology:{accession:null,regnalStart:8,abdication:null,death:null,sources:[rulerSource]},sources:[rulerSource],dating:{level:'disputed',reason:'日期尚有异说',alternatives:[{label:'待考日期',year:null,explanation:'未知不是公元元年',sources:[eventSource]}]}};
 return {datasetId:'transparency-fixture',title:'跨元完整记录专题',version:17,updated:'2026-10-21',timeline:{start:10,end:-10,defaultEnd:-10,cursor:0},scopeNote:'仅为导出测试，不作史实',
 states:[{id:'a',name:'甲',start:10,end:-10,rulers:[ruler,{id:'unknown-tenure',name:'未系年任期',start:null,end:null}]},{id:'b',name:'乙',start:10,end:-10,rulers:[]}],tenures:[ruler],
 people:[{id:'pa',name:'关联人物',states:['a'],summary:'人物完整正文。'.repeat(2000),birth:null,death:null,journey:[{year:null,summary:'未系年活动'},{year:-8,summary:'范围外活动仍属完整人物记录'}],sources:[rulerSource]}],
 events:[{id:'war',name:'当年战争',year:0,states:['a','b'],kind:'战争',description:'完整事件正文。'.repeat(2000),participants:[{id:'pa',name:'关联人物'}],sources:[source],dating:{level:'disputed',alternatives:[{label:'未系年异说',year:null,explanation:'不补造日期',sources:[eventSource]}]}},{id:'politics',name:'同年政治',year:0,states:['a'],kind:'政治'},{id:'outside',name:'范围外战争',year:-8,states:['a'],kind:'战争'},{id:'undated',name:'未系年战争',year:null,states:['a'],kind:'战争'}],periods:[],sources:[source]};
}
function setup(){
 const data=dataFixture(),elements=new Map(),blobs=[];
 const $=selector=>{if(!elements.has(selector))elements.set(selector,{value:'',textContent:'',innerHTML:'',disabled:false,children:[],appendChild(item){this.children.push(item);},showModal(){this.open=true;},close(){this.open=false;}});return elements.get(selector);};
 const ctx=vm.createContext({Blob,URL:{createObjectURL(blob){blobs.push(blob);return 'blob:test';},revokeObjectURL(){}},$: $,window:{addEventListener(){}},document:{querySelectorAll:()=>[],createElement:tag=>({tagName:tag.toUpperCase()})},appState:{conditions:{cursor:0,category:'战争',end:-10},search:{query:'不会裁剪正文的搜索词',searchScope:'selected',searchDescriptions:true},layout:{px:4,mode:'rulers',density:'overview'},session:{visibleStates:[data.states[0]]}},vp:{scrollLeft:36,clientWidth:12},labelWidth:()=>4,byId:id=>data.states.find(state=>state.id===id)});
 for(const file of ['src/core/time.js','src/core/history.js'])vm.runInContext(text(file),ctx,{filename:file});ctx.historyService=ctx.Zhou.createHistory(data);ctx.range=ctx.Zhou.Time.range;vm.runInContext(text('src/export.js'),ctx,{filename:'src/export.js'});
 return {ctx,data,$,blobs};
}
function options(){return {states:['a'],from:1,to:-1,cursor:0,category:'战争',query:'不会裁剪正文的搜索词',searchScope:'selected',searchDescriptions:true,mode:'rulers',density:'overview'};}

test('JSON新增exportContext而原snapshot schemaVersion1所有字段和值不变',()=>{
 const {ctx,data}=setup(),selected=options(),before=JSON.stringify(data),original=ctx.historyService.comparison(selected),snapshot=ctx.buildComparisonSnapshot(selected);
 assert.equal(snapshot.schemaVersion,1);assert.equal(snapshot.timeEncoding,'bce-axis');assert.equal(snapshot.version,17);assert.equal(snapshot.datasetId,data.datasetId);
 const {exportContext,...legacy}=plain(snapshot);assert.deepEqual(legacy,plain(original));assert.equal(JSON.stringify(data),before);
 assert.equal(exportContext.kind,'comparison-snapshot');assert.equal(exportContext.reimportableAsAtlas,false);assert.match(exportContext.note,/不是可重新导入 Atlas/);
 assert.deepEqual(exportContext.filters,{stateIds:['a'],from:1,to:-1,eventCategory:'战争'});assert.equal(exportContext.referenceYear,0);
 assert.deepEqual(exportContext.search,{query:'不会裁剪正文的搜索词',scope:'selected',descriptions:true,effect:'state-selection-only',filtersRecords:false});assert.equal(exportContext.display.filtersRecords,false);assert.equal(exportContext.records.pixelClipping,false);
});
test('范围/政权/事件类别按真实query，完整记录不按像素、模式、搜索正文裁剪',()=>{
 const {ctx,data}=setup(),selected=options(),snapshot=ctx.buildComparisonSnapshot(selected);
 assert.deepEqual(plain(snapshot.states.map(state=>state.id)),['a']);assert.deepEqual(plain(snapshot.events.map(event=>event.id)),['war']);
 const ruler=snapshot.states[0].rulers[0];assert.equal(ruler.start,8);assert.equal(ruler.end,-8);assert.equal(ruler.description,data.states[0].rulers[0].description);assert.equal(ruler.biography.summary,data.states[0].rulers[0].biography.summary);
 assert.equal(snapshot.tenures[0].start,8);assert.equal(snapshot.tenures[0].end,-8);assert.equal(snapshot.events[0].description,data.events[0].description);
 assert.equal(snapshot.people[0].summary,data.people[0].summary);assert.equal(snapshot.people[0].journey[1].year,-8);
 assert.deepEqual(plain(snapshot.sources),data.sources);assert.deepEqual(plain(ruler.chronology.sources),data.states[0].rulers[0].chronology.sources);assert.deepEqual(plain(snapshot.events[0].dating.alternatives[0].sources),data.events[0].dating.alternatives[0].sources);
 // Native polity records keep their existing complete contents; the projection's
 // rulers and tenures remain range-filtered, without changing the v1 schema.
 assert.equal(snapshot.polities[0].rulers.length,2);assert.equal(snapshot.states[0].rulers.length,1);
 const political=ctx.buildComparisonSnapshot({...selected,category:'政治'});assert.deepEqual(plain(political.events.map(event=>event.id)),['politics']);
});
test('未知日期保持null且不由区间补造，0始终公元1年，输出与输入互不改写',()=>{
 const {ctx,data}=setup(),snapshot=ctx.buildComparisonSnapshot(options());
 assert.equal(snapshot.cursor,0);assert.equal(snapshot.events[0].year,0);assert.equal(snapshot.people[0].birth,null);assert.equal(snapshot.people[0].death,null);assert.equal(snapshot.people[0].journey[0].year,null);
 assert.equal(snapshot.states[0].rulers[0].chronology.accession,null);assert.equal(snapshot.states[0].rulers[0].chronology.death,null);assert.equal(snapshot.events[0].dating.alternatives[0].year,null);
 assert.equal(snapshot.exportContext.records.unknownDates,'not-inferred');assert.equal(snapshot.events.some(event=>event.id==='undated'),false);
 snapshot.people[0].journey[0].year=0;snapshot.events[0].description='changed';assert.equal(data.people[0].journey[0].year,null);assert.notEqual(data.events[0].description,'changed');
 assert.throws(()=>ctx.buildComparisonSnapshot({...options(),states:[]}),/没有显示的国家/);assert.throws(()=>ctx.buildComparisonSnapshot({...options(),from:null}),/有效范围/);
});
test('实际JSON下载使用透明快照，复制/类别条件保留且无Canvas依赖',async()=>{
 const {ctx,$,blobs}=setup();$('#exportFormat').value='json';$('#exportSpan').value='150';$('#exportCompare').onclick();
 assert.equal($('#exportFromEra').value,'BCE');assert.equal($('#exportFrom').value,1);assert.equal($('#exportToEra').value,'CE');assert.equal($('#exportTo').value,2);
 await ctx.createComparisonExport();assert.equal(blobs.length,1);assert.equal(blobs[0].type,'application/json');const downloaded=JSON.parse(await blobs[0].text());
 assert.equal(downloaded.from,1);assert.equal(downloaded.to,-1);assert.equal(downloaded.cursor,0);assert.equal(downloaded.category,'战争');assert.equal(downloaded.exportContext.search.scope,'selected');assert.equal(downloaded.exportContext.display.mode,'rulers');assert(downloaded.events[0].description.length>10000);
 assert.match($('#exportStatus').textContent,/完整记录对照快照/);assert.match($('#exportStatus').textContent,/不是 Atlas 史料导入文件/);assert.equal($('#exportDownload').children[0].download,'zhou-comparison-1--1.json');assert.equal($('#createExport').disabled,false);
});
