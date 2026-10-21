'use strict';
let viewLinkController = null;
function scheduleShareSync(){viewLinkController?.schedule();}
function readSharedView(){
 const view=viewAdapter.capture(),from=Math.min(timelineBounds.start,Math.max(view.end,timelineBounds.start-vp.scrollLeft/view.px)),width=Math.max(1,vp.clientWidth-labelWidth()),to=Math.max(view.end,from-width/view.px);
 return {timeEncoding:'bce-axis',view:{...view,timeEncoding:'bce-axis'},pinned:[...appState.layout.pinned],order:[...appState.layout.stateOrder],range:{from,to,width},item:navigation.key};
}
function openSharedItem(key){openDetailKey(key);}
function applySharedView(shared){
 closeDetail(false);
 const view={...viewAdapter.capture(),...shared.view,searchLimit:6,top:0,searchTop:0,periods:[]};
 view.cursor=Math.max(view.end,Math.min(timelineBounds.start,view.cursor));
 if(shared.pinned)appState.layout.pinned=new Set(shared.pinned);
 if(shared.order)appState.layout.stateOrder=[...new Set([...shared.order,...D.states.map(s=>s.id)])];
 const range=shared.range,width=Math.max(1,vp.clientWidth-labelWidth());
 if(range){
  if(range.to!==undefined&&range.width&&Math.abs(range.width-width)>20)view.px=Math.min(24,Math.max(.8,width/Math.max(1,range.from-range.to)));
  view.left=Math.max(0,(timelineBounds.start-range.from)*view.px);
 }else if(shared.view.cursor!==undefined)view.left=Math.max(0,(timelineBounds.start-view.cursor)*view.px-width/2);
 restoreDetailView(view);
 if(shared.item){
  if(shared.version==='1')appState.session.legacyShareV1=true;
  openSharedItem(shared.item);
  appState.session.legacyShareV1=false;
  restoreDetailView(view);
 }
}
if(window.location&&window.history){
 viewLinkController=Zhou.createViewLinkController({codec:Zhou.createViewLinkCodec(D,searchService),location:window.location,history:window.history,read:readSharedView,apply:applySharedView,setTimeout:setTimeout.bind(globalThis),clearTimeout:clearTimeout.bind(globalThis)});
 pageEffects.share=scheduleShareSync;
 viewLinkController.start();
 window.addEventListener('hashchange',()=>viewLinkController.restore());
 window.addEventListener('popstate',()=>viewLinkController.restore());
 window.addEventListener('pagehide',()=>viewLinkController.flush());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)viewLinkController.flush();});
 const shareText=$('#shareText'),copyShareText=$('#copyShareText');
 const showShare=()=>{
  const link=viewLinkController.flush();$('#shareLink').value=link;
  if(shareText&&typeof Zhou.describeSharedView==='function')shareText.value=Zhou.describeSharedView(D,readSharedView())+'\n'+link;
  $('#shareNotice').textContent=window.location.protocol==='file:'?'此链接用于当前文件；在线分享请使用网站地址。':'可复制纯链接，或复制带专题、政权组合与年份的摘要及链接。';
  $('#shareDialog').showModal();$('#shareLink').focus();$('#shareLink').select();
 };
 $('#shareView').onclick=showShare;
 $('#shareDetail').onclick=showShare;
 $('#closeShare').onclick=()=>$('#shareDialog').close();
 $('#copyShare').onclick=async()=>{
  try{if(!navigator.clipboard?.writeText)throw new Error('clipboard');await navigator.clipboard.writeText($('#shareLink').value);$('#shareNotice').textContent='链接已复制。';}
  catch{$('#shareLink').focus();$('#shareLink').select();$('#shareNotice').textContent='请复制上方已选中的链接。';}
 };
 if(copyShareText&&shareText)copyShareText.onclick=async()=>{
  try{if(!navigator.clipboard?.writeText)throw new Error('clipboard');await navigator.clipboard.writeText(shareText.value);$('#shareNotice').textContent='摘要及链接已复制。';}
  catch{shareText.focus();shareText.select();$('#shareNotice').textContent='浏览器未允许复制，请手动复制上方已选中的完整摘要及链接。';}
 };
}
