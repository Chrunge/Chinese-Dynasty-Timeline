'use strict';
// Persist only data and stable item keys; never store rendered detail HTML.
let readingReady=false,readingTimer=null,studyVisits=[];
const readingKey='zhou-reading-v4',visitsKey='zhou-visits-v4';
function validStudyKey(key){return typeof key==='string'&&(searchIndex.some(e=>e.key===key)||key.startsWith('cluster:')&&key.slice(8).split(',').every(id=>D.events.some(e=>e.id===id)));}
function studyNumber(value,min,max,fallback){return Number.isFinite(Number(value))?Math.min(max,Math.max(min,Number(value))):fallback;}
function sanitizeReading(v){
 if(!v||typeof v!=='object'||!Array.isArray(v.selected))return null;
 const base=captureDetailFrame().view,e=v.end===221?221:256;
 return {...base,px:studyNumber(v.px,.8,24,4),end:e,selected:[...new Set(v.selected.filter(id=>byId(id)))],query:typeof v.query==='string'?v.query.slice(0,100):'',mode:['both','rulers','events','overview'].includes(v.mode)?v.mode:'both',category:['all','政治','战争','改革','外交','文化'].includes(v.category)?v.category:'all',cursor:Math.round(studyNumber(v.cursor,e,1046,770)),density:['auto','full','overview'].includes(v.density)?v.density:'auto',activeEventId:D.events.some(x=>x.id===v.activeEventId)?v.activeEventId:null,searchScope:v.searchScope==='selected'?'selected':'all',searchDescriptions:Boolean(v.searchDescriptions),searchLimit:Math.round(studyNumber(v.searchLimit,6,200,6)),searchTarget:searchIndex.some(x=>x.key===v.searchTarget)?v.searchTarget:null,left:studyNumber(v.left,0,21000,0),top:studyNumber(v.top,0,20000,0),searchTop:studyNumber(v.searchTop,0,20000,0),pageX:0,pageY:studyNumber(v.pageY,0,20000,0),periods:Array.isArray(v.periods)?v.periods.filter(p=>['all','west','spring','war'].includes(p)):[]};
}
function rememberDetailProgress(){
 const item=studyVisits.find(v=>v.key===currentDetailKey);if(item&&$('#detail').open)item.top=$('#detail').scrollTop;
}
function scheduleReadingSave(){if(!readingReady)return;clearTimeout(readingTimer);readingTimer=setTimeout(saveReadingPosition,400);}
function saveReadingPosition(){
 if(!readingReady)return;rememberDetailProgress();
 const view=detailHistory[0]?.view||captureDetailFrame().view;
 const from=Math.min(1046,Math.max(view.end,1046-view.left/view.px)),to=Math.max(view.end,from-(vp.clientWidth-labelWidth())/view.px);
 const data={version:4,view,range:{from,to},width:vp.clientWidth,layout:{order:stateOrder,pins:[...pinned],rowHeight,viewHeight,fitRows,rowHeights},at:Date.now()};
 try{localStorage.setItem(readingKey,JSON.stringify(data));localStorage.setItem(visitsKey,JSON.stringify(studyVisits));$('#readingStatus').textContent='阅读位置已记住';}catch{$('#readingStatus').textContent='浏览器未允许保存阅读位置';}
}
function recordStudyVisit(key){
 if(!readingReady||!validStudyKey(key))return;
 const entry=searchIndex.find(e=>e.key===key),title=entry?.title||'密集事件列表';
 studyVisits=[{key,title,view:captureDetailFrame().view,top:0,at:Date.now()},...studyVisits.filter(v=>v.key!==key)].slice(0,50);
 updateStudyControls();scheduleReadingSave();
}
function updateStudyControls(){const previous=studyVisits.find(v=>v.key!==currentDetailKey);$('#lastRead').disabled=!previous;$('#lastRead').textContent=currentDetailKey?'上一条阅读':'继续上次详情';$('#historyCount').textContent=studyVisits.length;}
function renderStudyHistory(){
 const labels={country:'国家',ruler:'君主',person:'人物',event:'事件',undated:'君主',cluster:'事件组'};
 $('#historyList').innerHTML=studyVisits.length?studyVisits.map((v,i)=>'<button class="listitem" data-study-index="'+i+'"><span>'+labels[v.key.split(':')[0]]+' · '+escapeHTML(v.title)+'</span><small>'+new Date(v.at).toLocaleString('zh-CN')+' · '+fmt(v.view.cursor)+'</small></button>').join(''):'<p class="notice">查看国家、君主、人物或事件后，会出现在这里。</p>';
}
function openStudyVisit(index){
 const item=studyVisits[index];if(!item)return;rememberDetailProgress();const key=item.key,top=item.top;
 $('#history').close();prepareDetailNavigation();const v=sanitizeReading(item.view);if(v)restoreDetailView(v);
 if(key.startsWith('person:'))showPerson(key.slice(7));else if(key.startsWith('ruler:'))showRuler(key.slice(6));else if(key.startsWith('event:'))showEvent(key.slice(6));else if(key.startsWith('country:'))showState(key.slice(8));else if(key.startsWith('cluster:')){const es=key.slice(8).split(',').map(id=>D.events.find(e=>e.id===id));show('密集事件 · 按年代展开','<h3 class="detailTitle">'+es.length+'条事件</h3>'+eventList(es),key);}else openSearchResult(key);
 $('#detail').scrollTop=top;rememberDetailProgress();scheduleReadingSave();
}
function restoreSavedReading(data){
 const v=sanitizeReading(data?.view);if(!v)return false;
 const l=data.layout||{};if(Array.isArray(l.order))stateOrder=[...new Set([...l.order.filter(id=>byId(id)),...D.states.map(s=>s.id)])];if(Array.isArray(l.pins))pinned=new Set(l.pins.filter(id=>byId(id)));
 rowHeight=studyNumber(l.rowHeight,36,160,rowHeight);viewHeight=studyNumber(l.viewHeight,320,1000,viewHeight);fitRows=Boolean(l.fitRows);rowHeights={};for(const [id,h] of Object.entries(l.rowHeights||{}))if(byId(id)&&[40,56,64,96,128,160].includes(h))rowHeights[id]=h;
 if(Math.abs((Number(data.width)||vp.clientWidth)-vp.clientWidth)>20&&data.range){const from=studyNumber(data.range.from,v.end,1046,1046),to=studyNumber(data.range.to,v.end,from,v.end);v.px=Math.min(24,Math.max(.8,(vp.clientWidth-labelWidth())/Math.max(1,from-to)));v.left=(1046-from)*v.px;}
 applyLayout();restoreDetailView(v);return true;
}
try{const visits=JSON.parse(localStorage.getItem(visitsKey)||'[]');if(Array.isArray(visits))studyVisits=visits.slice(0,50).filter(v=>validStudyKey(v?.key)&&sanitizeReading(v.view)).map(v=>({key:v.key,title:searchIndex.find(e=>e.key===v.key)?.title||'密集事件列表',view:sanitizeReading(v.view),top:studyNumber(v.top,0,20000,0),at:studyNumber(v.at,0,Date.now(),Date.now())}));const saved=JSON.parse(localStorage.getItem(readingKey)||'null');if(restoreSavedReading(saved))$('#readingStatus').textContent='已恢复上次阅读位置';}catch{}
readingReady=true;updateStudyControls();
$('#browseHistory').onclick=()=>{rememberDetailProgress();renderStudyHistory();$('#history').showModal();};$('#closeHistory').onclick=()=>$('#history').close();
$('#lastRead').onclick=()=>{const index=studyVisits.findIndex(v=>v.key!==currentDetailKey);if(index>=0)openStudyVisit(index);};
$('#historyList').addEventListener('click',e=>{const b=e.target.closest('[data-study-index]');if(b)openStudyVisit(Number(b.dataset.studyIndex));});
$('#clearHistory').onclick=()=>{studyVisits=[];renderStudyHistory();updateStudyControls();saveReadingPosition();};
$('#detail').addEventListener('scroll',scheduleReadingSave,{passive:true});$('#searchPanel').addEventListener('scroll',scheduleReadingSave,{passive:true});
window.addEventListener('pagehide',saveReadingPosition);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveReadingPosition();});window.addEventListener('scroll',scheduleReadingSave,{passive:true});
