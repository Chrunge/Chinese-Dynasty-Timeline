'use strict';
// Connect page modules only after every implementation has been loaded.
if($('#eventKindLegend')?.innerHTML!==undefined)$('#eventKindLegend').innerHTML=['政治','战争','改革','外交','文化'].map(kind=>'<span class="eventLegendItem">'+Zhou.EventSemantics.glyph(kind)+' '+kind+'</span>').join('');
$('.periods').innerHTML='<button data-period="all" class="active">全览</button>'+timelinePeriods.filter(p=>p.button!==false).map(p=>'<button data-period="'+escapeHTML(p.id)+'">'+escapeHTML(p.name)+'</button>').join('');
document.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>setPeriod(b.dataset.period));
$('#extensionLabel').textContent=isZhouTopic?'延伸至秦统一':'延伸至'+fmt(timelineBounds.end);
const initialDate=Zhou.Time.decode(timelineBounds.cursor);
$('#yearEra').value=initialDate.era;$('#year').value=initialDate.year;$('#year').min=1;
if(!isZhouTopic){
 document.title=D.title||'历史对照图';$('.brand h1').textContent=document.title;$('.brand .seal').textContent='史';$('.brand .smallcaps').textContent=range(timelineBounds.start,timelineBounds.end);
 $('.intro p').textContent='用户正式资料导入；点击任期、人物与事件阅读详情。'+(D.datasetId==='three-kingdoms'?'虚线纹理表示汉末任职阶段，不等于东汉皇帝在位。':'接续共行仅是排版分组，并存与同年更替仍按原资料分层；本次未联网核验史实。');
 $('.intro .eyebrow').textContent=timelinePeriods.map(p=>p.name).join(' · ');$('.intro h2').textContent='同一时刻，政权之间。';$('.workspace').setAttribute?.('aria-label',document.title+'时间线');
 $('.searchHelp').textContent='按名称匹配，点击结果查看详情并定位；简介中的提及会单独标注。全站搜索包含当前未选政权及完整资料范围。';
 $('#filters > p').textContent='已固定的政权始终参与对比，取消固定后可隐藏。';
}
document.querySelectorAll('[data-topic]').forEach(a=>{if(a.dataset.topic===(D.datasetId||'zhou'))a.setAttribute?.('aria-current','page');});
detailSheet=Zhou.createDetailSheet({dialog:$('#detail'),body:$('#detailBody'),onDismiss:()=>closeDetail(),window,document});
const interfaceExperience=Zhou.createInterfaceExperience({document,window,storage:Zhou.createStorage(()=>localStorage),datasetId:D.datasetId||'zhou'});
const accessibility=Zhou.createAccessibility({document,window});
const timeSlice=Zhou.createTimeSlice({container:$('#timeSlice'),trigger:$('#timeSliceToggle'),data:D,history:historyService,document,onOpen:key=>openDetailKey(key)});
globalThis.ZhouExperienceHooks={cursorChanged(year){timeSlice.update(year);accessibility.cursorChanged(year);}};
$('#exportCompare').setAttribute?.('aria-keyshortcuts','Alt+E');
document.addEventListener('keydown',e=>{if(!e.altKey||e.ctrlKey||e.metaKey||document.querySelector('dialog[open]'))return;if(e.code==='KeyY'){e.preventDefault();$('.cursorHandle')?.focus({preventScroll:true});}else if(e.code==='KeyE'){e.preventDefault();$('#exportCompare').click();}});
viewAdapter=Zhou.createViewAdapter({state:appState,viewport:vp,$,window,document,render,setCursor,updateRange,bounds:timelineBounds});
viewAdapter.syncControls();
pageEffects.renderPanels=()=>{updateCompare();renderEventFocus();renderSearchResults();};
renderCombos();applyLayout();
render();setCursor(timelineBounds.cursor);vp.scrollLeft=Math.max(0,x(timelineBounds.cursor)-40);
// Browser agents use the same navigation and search state as the visible controls.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 const compare=y=>{if(!Zhou.Time.isYear(y)||y<timelineBounds.end||y>timelineBounds.start)throw new Error('年份须位于'+range(timelineBounds.start,timelineBounds.end));if(y<appState.conditions.end)setExtension(true);setCursor(y,true);return {date:Zhou.Time.decode(appState.conditions.cursor),timeEncoding:'bce-axis',coordinate:appState.conditions.cursor,states:historyService.compareYear(appState.conditions.cursor,appState.session.visibleStates.map(s=>s.id)).map(({state,rulers})=>({state:state.name,rulers:rulers.map(r=>r.name)}))};};
 register({name:'compare_history_year',title:'对照历史年份',description:'选择BCE（公元前）或CE（公元）及正整数年份，移动参考线并展示政权任期与事件。',inputSchema:{type:'object',properties:{era:{type:'string',enum:['BCE','CE']},year:{type:'integer',minimum:1}},required:['era','year'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){return compare(Zhou.Time.encode(input));}});
 // Keep the original BCE integration name for existing clients where applicable.
 if(timelineBounds.start>0)register({name:'compare_zhou_year',title:'对照列国年份',description:'移动年份参考线；year_bce 为公元前年份。',inputSchema:{type:'object',properties:{year_bce:{type:'integer',minimum:Math.max(1,timelineBounds.end),maximum:timelineBounds.start}},required:['year_bce'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){const result=compare(Zhou.Time.encode({era:'BCE',year:input?.year_bce}));return {...result,year_bce:result.coordinate};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
