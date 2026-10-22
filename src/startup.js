'use strict';
// Connect page modules only after every implementation has been loaded.
if($('#eventKindLegend')?.innerHTML!==undefined)$('#eventKindLegend').innerHTML=['政治','战争','改革','外交','文化'].map(kind=>'<span class="eventLegendItem">'+Zhou.EventSemantics.glyph(kind)+' '+kind+'</span>').join('');
$('.periods').innerHTML='<button data-period="all" class="active">全景</button>'+timelinePeriods.filter(p=>p.button!==false).map(p=>'<button data-period="'+escapeHTML(p.id)+'">'+escapeHTML(p.name)+'</button>').join('');
 document.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>setPeriod(b.dataset.period));
 $('#extensionLabel').textContent=isZhouTopic?'延伸至秦统一':'延伸至'+fmt(timelineBounds.end);
 const initialDate=Zhou.Time.decode(timelineBounds.cursor);
 $('#yearEra').value=initialDate.era;$('#year').value=initialDate.year;$('#year').min=1;
 const topicId=D.datasetId||D.timeline?.topic||'zhou';
 const brand=Zhou.Branding?.resolve(D,topicId)||{logoChar:isZhouTopic?'周':'史',title:D.title||'历史对照图',subtitle:timelinePeriods.map(p=>p.name).join(' · '),slogan:'同一时刻，政权之间。',intro:'点击君主、人物与事件阅读生平和史源。',statusLabel:'ⓘ 资料状态：原典与年表整理 · 异说可展开核对'};
 document.title=brand.title;
 for(const [selector,text] of [['#logoChar',brand.logoChar],['#siteTitle',brand.title],['#siteSubtitle',brand.subtitle],['#siteSlogan',brand.slogan],['#siteIntro',brand.intro],['#dataStatusLabel',brand.statusLabel]]){const node=$(selector);if(node)node.textContent=text;}
 $('.brand h1').textContent=brand.title;$('.intro p').textContent=brand.intro;
 $('.workspace').setAttribute?.('aria-label',brand.title+'时间线');
 $('.searchHelp').textContent='按名称匹配，↑/↓ 选择结果，Enter 打开详情；全站范围包含本专题未选政权。简介中的提及会单独标注。';
 if($('#reportDataError')&&typeof URLSearchParams==='function'){
  const topicName=D.catalog?.find(t=>t.id===topicId)?.name||({'zhou':'周朝'}[topicId])||topicId;
  const params=new URLSearchParams({template:'data-correction.yml',topic:topicName,reference_year:fmt(timelineBounds.cursor)});
  $('#reportDataError').href='https://github.com/Chrunge/Zhou-Dynasty-Timeline/issues/new?'+params.toString();
 }
 document.querySelectorAll('[data-topic]').forEach(a=>{if(a.dataset.topic===(D.datasetId||'zhou'))a.setAttribute?.('aria-current','page');});
detailSheet=Zhou.createDetailSheet({dialog:$('#detail'),body:$('#detailBody'),onDismiss:()=>closeDetail(),window,document});
const interfaceExperience=Zhou.createInterfaceExperience({document,window,storage:Zhou.createStorage(()=>localStorage),datasetId:D.datasetId||'zhou',onSettingsOpen:()=>{topbar?.gallery?.close();topbar?.closeYear();},onCanvasBlank:()=>{topbar?.gallery?.close();topbar?.closeYear();}});
const accessibility=Zhou.createAccessibility({document,window});
const timeSlice=Zhou.createTimeSlice({container:$('#timeSlice'),trigger:$('#timeSliceToggle'),data:D,history:historyService,document,onOpen:key=>openDetailKey(key)});
globalThis.ZhouExperienceHooks={cursorChanged(year){timeSlice.update(year);accessibility.cursorChanged(year);}};
$('#exportCompare').setAttribute?.('aria-keyshortcuts','Alt+E');
document.addEventListener('keydown',e=>{if(!e.altKey||e.ctrlKey||e.metaKey||document.querySelector('dialog[open]'))return;if(e.code==='KeyY'){e.preventDefault();$('.cursorHandle')?.focus({preventScroll:true});}else if(e.code==='KeyE'){e.preventDefault();$('#exportCompare').click();}});
viewAdapter=Zhou.createViewAdapter({state:appState,viewport:vp,$,window,document,render,setCursor,updateRange,bounds:timelineBounds});
viewAdapter.syncControls();
 topbar=Zhou.createTopbar?.({document,window,data:D,state:appState,viewport:vp,bounds:timelineBounds,$,render,setCursor,scrollToState:scrollToSearchState,showPerson,syncControls:syncViewControls,interfaceExperience,storage:Zhou.createStorage(()=>localStorage),onThemeChanged:()=>accessibility.refresh()});
pageEffects.renderPanels=()=>{updateCompare();renderEventFocus();renderSearchResults();topbar?.refresh();};
renderCombos();applyLayout();
render();setCursor(timelineBounds.cursor, true);
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
