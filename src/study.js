'use strict';
(function(root){
 const Zhou=root.Zhou||(root.Zhou={});
 // The controller owns persistence and UI wiring; the bridge owns application state.
 Zhou.createStudyController=function(b){
  const model=Zhou.createReadingModel(b),storage=b.storage,$=b.$,bounds=Zhou.Time.bounds(b.data);
  const readingKey='zhou-reading-v4',visitsKey='zhou-visits-v4';
  let ready=false,timer=null,visits=[];
  function publish(){b.onVisits?.(visits);}
  function rememberDetailProgress(){const item=visits.find(v=>v.key===b.getDetailKey());if(item&&$('#detail').open)item.top=$('#detail').scrollTop;}
  function scheduleReadingSave(){if(!ready)return;b.clearTimeout(timer);timer=b.setTimeout(saveReadingPosition,400);}
  function saveReadingPosition(){
   if(!ready)return;rememberDetailProgress();
   const view=b.getRootView()||b.getView(),width=b.getWidth(),from=Math.min(bounds.start,Math.max(view.end,bounds.start-view.left/view.px)),to=Math.max(view.end,from-(width-b.labelWidth())/view.px);
   const data={version:4,timeEncoding:'bce-axis',view:{...view,timeEncoding:'bce-axis'},range:{from,to},width,layout:b.getLayout(),at:b.now()};
   const savedReading=storage.write(readingKey,data),savedVisits=storage.write(visitsKey,visits);
   $('#readingStatus').textContent=savedReading&&savedVisits?'阅读位置已记住':'浏览器未允许保存阅读位置';
  }
  function recordStudyVisit(value){
   const key=model.canonical(value);if(!ready||!model.validKey(key))return;
   const entry=b.searchIndex.find(e=>e.key===key);
   visits=[{key,timeEncoding:'bce-axis',title:entry?.title||'密集事件列表',view:{...b.getView(),timeEncoding:'bce-axis'},top:0,at:b.now()},...visits.filter(v=>v.key!==key)].slice(0,50);
   publish();updateStudyControls();scheduleReadingSave();
  }
  function updateStudyControls(){const previous=visits.find(v=>v.key!==b.getDetailKey());$('#lastRead').disabled=!previous;$('#lastRead').textContent=b.getDetailKey()?'上一条阅读':'继续上次详情';$('#historyCount').textContent=visits.length;}
  function renderStudyHistory(){
   const labels={country:'国家',ruler:'君主',person:'人物',event:'事件',undated:'君主',cluster:'事件组'};
   $('#historyList').innerHTML=visits.length?visits.map((v,i)=>'<button class="listitem" data-study-index="'+i+'"><span>'+labels[v.key.split(':')[0]]+' · '+b.escapeHTML(v.title)+'</span><small>'+new Date(v.at).toLocaleString('zh-CN')+' · '+b.fmt(v.view.cursor)+'</small></button>').join(''):'<p class="notice">查看国家、君主、人物或事件后，会出现在这里。</p>';
  }
  function openStudyVisit(index){
   const item=visits[index];if(!item)return;rememberDetailProgress();const key=item.key,top=item.top;
   $('#history').close();b.prepareDetailNavigation();const view=model.sanitizeReading(item.view);if(view)b.restoreView(view);
   b.openDetail(key);$('#detail').scrollTop=top;rememberDetailProgress();scheduleReadingSave();
  }
  function restoreSavedReading(data){const result=model.restoreReading(data,{width:b.getWidth(),labelWidth:b.labelWidth(),layout:b.getLayout()});if(!result)return false;b.setLayout(result.layout);b.applyLayout();b.restoreView(result.view);return true;}
  visits=model.sanitizeVisits(storage.read(visitsKey,[]));publish();
  if(restoreSavedReading(storage.read(readingKey,null)))$('#readingStatus').textContent='已恢复上次阅读位置';
  ready=true;updateStudyControls();
  $('#browseHistory').onclick=()=>{rememberDetailProgress();renderStudyHistory();$('#history').showModal();};$('#closeHistory').onclick=()=>$('#history').close();
  $('#lastRead').onclick=()=>{const index=visits.findIndex(v=>v.key!==b.getDetailKey());if(index>=0)openStudyVisit(index);};
  $('#historyList').addEventListener('click',e=>{const button=e.target.closest('[data-study-index]');if(button)openStudyVisit(Number(button.dataset.studyIndex));});
  $('#clearHistory').onclick=()=>{visits=[];publish();renderStudyHistory();updateStudyControls();saveReadingPosition();};
  $('#detail').addEventListener('scroll',scheduleReadingSave,{passive:true});$('#searchPanel').addEventListener('scroll',scheduleReadingSave,{passive:true});
  b.window.addEventListener('pagehide',saveReadingPosition);b.document.addEventListener('visibilitychange',()=>{if(b.document.hidden)saveReadingPosition();});b.window.addEventListener('scroll',scheduleReadingSave,{passive:true});
  return {rememberDetailProgress,scheduleReadingSave,saveReadingPosition,recordStudyVisit,updateStudyControls,renderStudyHistory,openStudyVisit,restoreSavedReading,sanitizeReading:model.sanitizeReading,validStudyKey:model.validKey,studyNumber:model.number,getVisits:()=>visits};
 };
})(globalThis);

// Compatibility entry points used by application navigation and existing integrations.
let studyController,studyVisits=[];
function rememberDetailProgress(){studyController?.rememberDetailProgress();}
function scheduleReadingSave(){studyController?.scheduleReadingSave();}
function saveReadingPosition(){studyController?.saveReadingPosition();}
function recordStudyVisit(key){studyController?.recordStudyVisit(key);}
function updateStudyControls(){studyController?.updateStudyControls();}
function renderStudyHistory(){studyController?.renderStudyHistory();}
function openStudyVisit(index){studyController?.openStudyVisit(index);}
function restoreSavedReading(value){return studyController?.restoreSavedReading(value);}
function sanitizeReading(value){return studyController?.sanitizeReading(value);}
function validStudyKey(value){return studyController?.validStudyKey(value);}
function studyNumber(...args){return studyController?.studyNumber(...args);}
studyController=Zhou.createStudyController({
 data:D,searchIndex,normalizeDetailKey:typeof normalizeDetailKey==='function'?normalizeDetailKey:key=>key,
 storage:Zhou.createStorage(()=>localStorage,D.datasetId&&D.datasetId!=='zhou'?D.datasetId:''),$,window,document,clearTimeout:clearTimeout.bind(globalThis),setTimeout:setTimeout.bind(globalThis),now:()=>Date.now(),
 getView:()=>viewAdapter.capture(),getRootView:()=>navigation.frames[0]?.view,getDetailKey:()=>navigation.key,getWidth:()=>vp.clientWidth,labelWidth,
 getLayout:viewAdapter.getLayout,setLayout:viewAdapter.setLayout,
 applyLayout,restoreView:restoreDetailView,prepareDetailNavigation,escapeHTML,fmt,onVisits:visits=>{studyVisits=visits;},
 openDetail:openDetailKey
});

Object.assign(pageEffects,{persist:scheduleReadingSave,rememberDetail:rememberDetailProgress,recordVisit:recordStudyVisit,updateStudy:updateStudyControls});
