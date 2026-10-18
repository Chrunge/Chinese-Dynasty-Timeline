'use strict';
// Connect page modules only after every implementation has been loaded.
viewAdapter=Zhou.createViewAdapter({state:appState,viewport:vp,$,window,document,render,setCursor,updateRange});
pageEffects.renderPanels=()=>{updateCompare();renderEventFocus();renderSearchResults();};
renderCombos();applyLayout();
render();setCursor(770);vp.scrollLeft=Math.max(0,x(770)-40);
// Browser agents use the same navigation and search state as the visible controls.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'compare_zhou_year',title:'对照列国年份',description:'移动年份参考线并展示该年的列国君主与事件；year_bce 为公元前年份。',inputSchema:{type:'object',properties:{year_bce:{type:'integer',minimum:221,maximum:1046}},required:['year_bce'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!Number.isInteger(input.year_bce)||input.year_bce<221||input.year_bce>1046)throw new Error('年份必须是221至1046之间的整数');if(input.year_bce<appState.conditions.end){$('#extend').checked=true;setExtension(true);}setCursor(input.year_bce,true);return {year_bce:appState.conditions.cursor,states:historyService.compareYear(appState.conditions.cursor,appState.session.visibleStates.map(s=>s.id)).map(({state,rulers})=>({state:state.name,rulers:rulers.map(r=>r.name)}))};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
