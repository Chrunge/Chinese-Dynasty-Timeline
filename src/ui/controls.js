function highlightPolityRow(id){
 const row=document.querySelector(`.row[data-row="${id}"]`)||document.querySelector(`[data-action="state"][data-id="${id}"]`)?.closest('.row');
 if(row){
  row.classList.remove('rowPolityHighlight');
  void row.offsetWidth;
  row.classList.add('rowPolityHighlight');
  setTimeout(()=>row.classList.remove('rowPolityHighlight'),2000);
 }
}
function setMotif(motif){
 appState.session.figureHighlight=null;
 appState.conditions.motif=motif;
 if($('#motifFilter'))$('#motifFilter').value=motif;
 document.querySelectorAll('.motifChip').forEach(chip=>chip.classList.toggle('active',chip.dataset.motif===motif));
 render();
}
document.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(!target)return;const {action,id}=target.dataset;
 if(action==='person'){showPerson(id);}else if(action==='detailBack'){backDetail();}else if(action==='searchHit'){openSearchResult(id);}else if(action==='moreSearch'){appState.search.searchLimit+=12;renderSearchResults();}else if(action==='pin'){togglePin(id);}else if(action==='clearEvent'){appState.session.activeEventId=null;render();}else if(action==='relatedOnly'){appState.conditions.selected=new Set(activeEvent()?.states||[]);for(const state of appState.layout.pinned)appState.conditions.selected.add(state);render();}else if(action==='eventChart'){if(id!==appState.session.activeEventId)focusEvent(id);closeDetail(false);setCursor(activeEvent().year,true);}else if(action==='participant'){const [eid,index]=id.split(':');const e=D.events.find(e=>e.id===eid),p=e?.participants[Number(index)];if(p)showPerson(p.id);}else if(action==='comboApply'){applyCombo(id);$('#combinations').close();}else if(action==='comboDelete'){appState.session.savedCombos=appState.session.savedCombos.filter(c=>c.id!==id);saveCombos();renderCombos();}else if(action==='state')showState(id);else if(action==='ruler')showRuler(id);else if(action==='event')showEvent(id);else if(action==='bioChapter'){let y=Number(target.dataset.year),polityId=target.dataset.polityId,chNo=target.dataset.chapterNo;if(!Number.isFinite(y)&&id){const parts=String(id).split(':');y=Number(parts[0]);if(parts[1])polityId=parts[1];if(parts[2])chNo=parts[2];}if(polityId)appState.conditions.selected.add(polityId);if(Number.isFinite(y)){if(y<appState.conditions.end){$('#extend').checked=true;setExtension(true);}setCursor(y,true);}if(polityId){scrollToSearchState(polityId);highlightPolityRow(polityId);}document.querySelectorAll('.bioChapterCard').forEach(c=>c.classList.toggle('activeChapter',c.dataset.chapterNo===String(chNo)));render();}else if(action==='focusRuler'||action==='focus-ruler'){const r=historyService.tenure(id)||D.states.flatMap(s=>s.rulers).find(x=>x.id===id);if(r){const sId=r.stateId||r.polityId;if(sId){appState.conditions.selected.add(sId);scrollToSearchState(sId);highlightPolityRow(sId);}if(r.start<appState.conditions.end){$('#extend').checked=true;setExtension(true);}appState.search.searchTarget='ruler:'+r.id;setCursor(r.start,true);render();}}else if(action==='motifChip'){setMotif(target.dataset.motif||'none');}else if(action==='cluster'){const es=id.split(',').map(id=>D.events.find(e=>e.id===id));show('密集事件 · 按年代展开','<h3 class="detailTitle">'+es.length+'条事件</h3>'+eventList(es),'cluster:'+id);}else if(action==='toggleMinors'){toggleMinorStates();}else if(action==='locate'){if(Number(id)<appState.conditions.end){$('#extend').checked=true;setExtension(true);}if(!appState.conditions.selected.size)appState.conditions.selected=new Set(D.states.map(s=>s.id));setCursor(Number(id),true);closeDetail(false);}
});
$('#detailBack').onclick=backDetail;$('#close').onclick=()=>closeDetail();$('#detail').addEventListener('cancel',e=>{e.preventDefault();backDetail();});$('#detail').addEventListener('close',()=>{if(!$('#detail').open){navigation.frames=[];navigation.pending=null;}});$('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetail();}});
$('#about').onclick=showAbout;$('#sources').onclick=showAbout;
document.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>setPeriod(b.dataset.period));
function zoomAt(scale,clientX){const offset=clientX-vp.getBoundingClientRect().left-labelWidth(),year=timelineBounds.start-(vp.scrollLeft+offset)/appState.layout.px;appState.layout.px=Math.max(.8,Math.min(24,scale));render();vp.scrollLeft=Math.max(0,x(year)-offset);updateRange();}
function zoom(factor){zoomAt(appState.layout.px*factor,vp.getBoundingClientRect().left+labelWidth()+(vp.clientWidth-labelWidth())/2);}
$('#plus').onclick=()=>zoom(1.6);$('#minus').onclick=()=>zoom(1/1.6);$('#resetZoom').onclick=()=>setPeriod('all');
$('#mode').onchange=e=>{appState.layout.mode=e.target.value;render();};$('#category').onchange=e=>{appState.conditions.category=e.target.value;render();};if($('#motifFilter'))$('#motifFilter').onchange=e=>setMotif(e.target.value);
function setExtension(value){appState.conditions.end=value?timelineBounds.end:timelineBounds.defaultEnd;syncViewControls();if(appState.conditions.cursor<appState.conditions.end)setCursor(appState.conditions.end);render();}
$('#extend').onchange=e=>setExtension(e.target.checked);
$('#jump').onsubmit=e=>{e.preventDefault();const y=Zhou.Time.encode({era:$('#yearEra').value||'BCE',year:Number($('#year').value)});if(!Zhou.Time.isYear(y)||y<timelineBounds.end||y>timelineBounds.start)return;if(y<appState.conditions.end){$('#extend').checked=true;setExtension(true);}setCursor(y,true);};
$('#cursorYear').oninput=e=>setCursor(0-Number(e.target.value));
$('#search').oninput=e=>updateSearch(e.target.value);
$('#search').onkeydown=e=>{if(e.isComposing)return;if(e.key==='Escape'){$('#search').value='';updateSearch('');}else if(e.key==='Enter'){const hit=searchMatches()[0];if(hit){e.preventDefault();openSearchResult(hit.entry.key);}}};
$('#clearSearch').onclick=()=>{$('#search').value='';updateSearch('');};
$('#searchScope').onchange=e=>{appState.search.searchScope=e.target.value;appState.search.searchLimit=6;appState.search.searchTarget=null;render();};
$('#searchDescriptions').onchange=e=>{appState.search.searchDescriptions=e.target.checked;appState.search.searchLimit=6;appState.search.searchTarget=null;render();};
let filterPresetMode='auto';
function updateFilterSummary(){
 const policy=Zhou.Presentation.topic(D);
 const boxes=Array.from(document.querySelectorAll('#stateChecks input'));
 const checked=new Set(boxes.filter(c=>c.checked).map(c=>c.value));
 for(const p of appState.layout.pinned)checked.add(p);
 const total=D.states.length;
 const active=new Set([...checked].filter(id=>byId(id))).size;
 if($('#filterSummary'))$('#filterSummary').textContent='已显示 '+active+'/'+total+' 个政权（应用后生效）';
 const coreSet=new Set([...policy.coreIds,...appState.layout.pinned]);
 const isCore=checked.size===coreSet.size&&[...coreSet].every(id=>checked.has(id));
 const isAll=active===total;
 const mode=filterPresetMode==='custom'?'custom':filterPresetMode==='all'&&isAll?'all':isCore?'main':isAll?'all':'custom';
 for(const [id,value] of [['mainStates','main'],['allStates','all'],['customStates','custom']]){const b=$('#'+id);if(b){b.classList.toggle('active',mode===value);b.setAttribute?.('aria-pressed',String(mode===value));}}


 if($('#seven'))$('#seven').classList.toggle('active',isZhouTopic&&checked.size===8&&['zhou','qin','qi','chu','yan','han','zhao','liang'].every(id=>checked.has(id)));
}

$('#filter').onclick=()=>{
 const policy=Zhou.Presentation.topic(D);
 filterPresetMode='auto';
 const selected=new Set(appState.conditions.selected);
 $('#stateChecks').innerHTML=policy.order.map(id=>{
  const s=byId(id);if(!s)return '';
  const isCore=policy.coreIds.includes(id);
  const isPinned=appState.layout.pinned.has(id);
  const checked=selected.has(id)||isPinned;
  const dateText=range(s.start,s.end,s.approxStart||s.approxEnd);
  const note=s.display?.shortName&&s.display.shortName!==s.name?s.display.shortName:'';
  const minorNote=(!isCore&&policy.minorInfo[id])?policy.minorInfo[id]:'';
  return '<label class="stateCheckItem '+(isCore?'coreState':'minorState')+(isPinned?' isPinned':'')+'"><input type="checkbox" value="'+s.id+'" '+(checked?'checked':'')+(isPinned?' data-pinned="true"':'')+'> <span>'+escapeHTML(s.name)+'</span>'+(note?' <small class="stateShortName">['+escapeHTML(note)+']</small>':'')+' <small class="stateCheckDates">'+escapeHTML(dateText)+'</small>'+(minorNote?' <small class="stateCheckNote">'+escapeHTML(minorNote)+'</small>':'')+(isPinned?' <small class="statePinnedHint">（已固定）</small>':'')+'</label>';
 }).join('');
 updateFilterSummary();
 $('#filters').showModal();
};
$('#closeFilters').onclick=()=>$('#filters').close();
$('#allStates').onclick=()=>{filterPresetMode='all';document.querySelectorAll('#stateChecks input').forEach(c=>c.checked=true);updateFilterSummary();};
if($('#mainStates'))$('#mainStates').onclick=()=>{filterPresetMode='main';const policy=Zhou.Presentation.topic(D);document.querySelectorAll('#stateChecks input').forEach(c=>c.checked=policy.coreIds.includes(c.value)||appState.layout.pinned.has(c.value));updateFilterSummary();};
if($('#customStates'))$('#customStates').onclick=()=>{filterPresetMode='custom';updateFilterSummary();document.querySelector('#stateChecks input')?.focus?.();};
$('#seven').hidden=!isZhouTopic;
$('#seven').onclick=()=>{if(isZhouTopic){document.querySelectorAll('#stateChecks input').forEach(c=>c.checked=['zhou','qin','qi','chu','yan','han','zhao','liang'].includes(c.value)||appState.layout.pinned.has(c.value));updateFilterSummary();}};
$('#stateChecks').onchange=e=>{filterPresetMode='custom';if(e.target.dataset.pinned==='true')e.target.checked=true;updateFilterSummary();};
$('#applyFilters').onclick=()=>{const checked=new Set([...document.querySelectorAll('#stateChecks input:checked')].map(c=>c.value));for(const p of appState.layout.pinned)checked.add(p);appState.conditions.selected=checked;render();$('#filters').close();};
vp.addEventListener('scroll',updateRange,{passive:true});
const timelineGestures=Zhou.createTimelineGestures({viewport:vp,chart,getScale:()=>appState.layout.px,onZoom:zoomAt,onCursor:clientX=>setCursor(timelineBounds.start-(clientX-vp.getBoundingClientRect().left+vp.scrollLeft-labelWidth())/appState.layout.px),labelWidth});
chart.addEventListener('keydown',e=>{if(!e.target.closest('.cursorHandle')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?timelineBounds.start:e.key==='End'?appState.conditions.end:appState.conditions.cursor+(e.key==='ArrowLeft'?1:-1)*(e.shiftKey?10:1);setCursor(next);});
window.addEventListener('resize',()=>{render();});

function togglePin(id){if(!byId(id))return;if(appState.layout.pinned.has(id))appState.layout.pinned.delete(id);else{appState.layout.pinned.add(id);appState.conditions.selected.add(id);}try{storage.write('zhou-pins-v3',[...appState.layout.pinned]);}catch{}render();renderOrder();}
function saveCombos(){$('#comboNotice').textContent=storage.write('zhou-comparisons-v3',appState.session.savedCombos)?'已保存在当前浏览器。':'浏览器未允许保存；可导出组合文件以保留。';}
function renderCombos(){
 $('#comboSelect').innerHTML='<option value="">选择组合…</option>'+builtInCombos.map(c=>'<option value="'+c.id+'">'+c.name+'</option>').join('')+(appState.session.savedCombos.length?'<optgroup label="我的组合">'+appState.session.savedCombos.map(c=>'<option value="'+escapeHTML(c.id)+'">'+escapeHTML(c.name)+'</option>').join('')+'</optgroup>':'');
 $('#comboList').innerHTML='<h4>预设组合</h4>'+builtInCombos.map(c=>'<div class="comboRow"><div><strong>'+c.name+'</strong><small>'+c.states.map(id=>byId(id).name).join('、')+' · '+range(c.from,c.to)+'</small></div><button data-action="comboApply" data-id="'+c.id+'">使用</button></div>').join('')+'<h4>我的组合 · '+appState.session.savedCombos.length+'</h4>'+(appState.session.savedCombos.map(c=>'<div class="comboRow"><div><strong>'+escapeHTML(c.name)+'</strong><small>'+c.states.map(id=>byId(id).name).join('、')+' · '+range(c.from,c.to)+(c.pins.length?' · 固定 '+c.pins.map(id=>byId(id).name).join('、'):'')+'</small></div><button data-action="comboApply" data-id="'+escapeHTML(c.id)+'">使用</button><button data-action="comboDelete" data-id="'+escapeHTML(c.id)+'">删除</button></div>').join('')||'<p class="notice">先筛选国家、调整时间范围，再保存当前组合。</p>');
}
function captureCombo(name){const from=Math.round(Math.min(timelineBounds.start,Math.max(appState.conditions.end,timelineBounds.start-vp.scrollLeft/appState.layout.px))),to=Math.round(Math.max(appState.conditions.end,from-(vp.clientWidth-labelWidth())/appState.layout.px));return normalizeCombo({timeEncoding:'bce-axis',name,states:[...new Set([...appState.conditions.selected,...appState.layout.pinned])],order:appState.layout.stateOrder,pins:[...appState.layout.pinned],from,to,end:appState.conditions.end,cursor:appState.conditions.cursor,rowHeight:appState.layout.rowHeight,viewHeight:appState.layout.viewHeight,fitRows:appState.layout.fitRows,rowHeights:appState.layout.rowHeights,density:appState.layout.density,mode:appState.layout.mode,category:appState.conditions.category});}
function applyCombo(id){
 const preset=builtInCombos.find(c=>c.id===id),saved=appState.session.savedCombos.find(c=>c.id===id);if(!preset&&!saved)return;
 const c=saved||{...preset,viewHeight:appState.layout.viewHeight,fitRows:true};
 appState.conditions.selected=new Set(c.states);appState.layout.pinned=new Set(c.pins);appState.layout.stateOrder=[...c.order,...D.states.map(s=>s.id)].filter((id,i,a)=>a.indexOf(id)===i);appState.layout.rowHeight=c.rowHeight;appState.layout.viewHeight=c.viewHeight;appState.layout.fitRows=c.fitRows;appState.layout.rowHeights={...c.rowHeights};appState.layout.density=c.density;appState.layout.mode=c.mode;appState.conditions.category=c.category;appState.conditions.end=c.end;appState.search.query='';appState.search.searchTarget=null;appState.session.activeEventId=null;
 syncViewControls();appState.conditions.cursor=Math.max(appState.conditions.end,Math.min(timelineBounds.start,c.cursor));
 appState.layout.px=Math.max(.8,Math.min(24,(vp.clientWidth-labelWidth()-18)/Math.max(1,c.from-c.to+1)));applyLayout();vp.scrollLeft=Math.max(0,x(c.from));vp.scrollTop=0;setCursor(appState.conditions.cursor);document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',false));$('#comboSelect').value=id;
 try{storage.write('zhou-pins-v3',[...appState.layout.pinned]);}catch{}
}
$('#density').onchange=e=>{appState.layout.density=e.target.value;render();};
$('#manageCombos').onclick=()=>{renderCombos();$('#comboNotice').textContent='';$('#combinations').showModal();};$('#closeCombos').onclick=()=>$('#combinations').close();$('#comboSelect').onchange=e=>{if(e.target.value)applyCombo(e.target.value);};
$('#saveComboForm').onsubmit=e=>{e.preventDefault();if(appState.session.savedCombos.length>=30&&!appState.session.savedCombos.some(c=>c.name===$('#comboName').value.trim())){$('#comboNotice').textContent='最多保存30个组合，请删除不用的组合后再保存。';return;}const c=captureCombo($('#comboName').value);if(!c){$('#comboNotice').textContent='请填写名称并至少选择一个国家。';return;}const old=appState.session.savedCombos.findIndex(v=>v.name===c.name);if(old>=0){c.id=appState.session.savedCombos[old].id;appState.session.savedCombos[old]=c;}else appState.session.savedCombos.push(c);saveCombos();renderCombos();$('#comboName').value='';$('#comboSelect').value=c.id;};
$('#exportCombos').onclick=()=>{const blob=new Blob([JSON.stringify({format:'zhou-comparisons-v3',datasetId:D.datasetId||'zhou',timeEncoding:'bce-axis',combinations:appState.session.savedCombos},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='zhou-research-combinations.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#importCombos').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>1048576)throw new Error('too large');const data=JSON.parse(await file.text());if(data.format!=='zhou-comparisons-v3'||(data.datasetId||'zhou')!==(D.datasetId||'zhou')||!Array.isArray(data.combinations))throw new Error('format');let added=0;for(const item of data.combinations){if(appState.session.savedCombos.length>=30)break;const c=normalizeCombo(item);if(c){c.id='saved-'+Date.now()+'-'+Math.random().toString(36).slice(2,9);appState.session.savedCombos.push(c);added++;}}saveCombos();renderCombos();$('#comboNotice').textContent='已导入'+added+'个有效组合。';}catch{$('#comboNotice').textContent='无法导入，请选择本网站导出的组合 JSON 文件（不超过1MB）。';}finally{e.target.value='';}};

function applyLayout(){vp.style.height=appState.layout.viewHeight+'px';vp.style.maxHeight='none';$('#rowHeight').value=appState.layout.rowHeight;$('#viewHeight').value=appState.layout.viewHeight;$('#viewHeightValue').textContent=appState.layout.viewHeight+'px';$('#fitRows').checked=appState.layout.fitRows;render();saveLayout();}
$('#rowHeight').oninput=e=>{appState.layout.rowHeight=Math.max(36,Math.min(160,Number(e.target.value)));appState.layout.fitRows=false;$('#fitRows').checked=false;applyLayout();};
$('#viewHeight').oninput=e=>{appState.layout.viewHeight=Math.max(320,Math.min(1000,Number(e.target.value)));applyLayout();};
$('#fitRows').onchange=e=>{appState.layout.fitRows=e.target.checked;appState.layout.rowHeights={};applyLayout();};
$('#maximize').onclick=()=>{appState.layout.expanded=!appState.layout.expanded;$('.workspace').classList.toggle('expanded',appState.layout.expanded);$('#maximize').textContent=appState.layout.expanded?'收起对比':'展开对比';document.body.classList.toggle('chartExpanded',appState.layout.expanded);requestAnimationFrame(()=>render());};
function renderOrder(){const chosen=appState.layout.stateOrder.filter(id=>appState.conditions.selected.has(id)||appState.layout.pinned.has(id)),shown=[...chosen.filter(id=>appState.layout.pinned.has(id)),...chosen.filter(id=>!appState.layout.pinned.has(id))];$('#orderList').innerHTML=shown.map((id,i)=>{const s=byId(id);return '<div class="orderRow" draggable="true" data-order-id="'+id+'"><span class="dragGrip" aria-hidden="true">⠿</span><strong style="color:'+s.color+'">'+s.name+'</strong><button data-action="pin" data-id="'+id+'" aria-pressed="'+appState.layout.pinned.has(id)+'">'+(appState.layout.pinned.has(id)?'已固定':'固定')+'</button><label>行高 <select data-row-size="'+id+'" aria-label="'+s.name+'行高">'+[0,40,56,64,96,128,160].map(h=>'<option value="'+h+'" '+(Number(appState.layout.rowHeights[id]||0)===h?'selected':'')+'>'+(h?h+'px':'跟随全局')+'</option>').join('')+'</select></label><button data-move="up" data-id="'+id+'" '+(i===0||appState.layout.pinned.has(shown[i-1])!==appState.layout.pinned.has(id)?'disabled':'')+' aria-label="上移'+s.name+'">上移</button><button data-move="down" data-id="'+id+'" '+(i===shown.length-1||appState.layout.pinned.has(shown[i+1])!==appState.layout.pinned.has(id)?'disabled':'')+' aria-label="下移'+s.name+'">下移</button></div>';}).join('');}
$('#orderStates').onclick=()=>{renderOrder();$('#ordering').showModal();};$('#closeOrder').onclick=()=>$('#ordering').close();$('#doneOrder').onclick=()=>$('#ordering').close();$('#resetOrder').onclick=()=>{const policy=Zhou.Presentation.topic(D);appState.layout.stateOrder=[...policy.order];appState.layout.rowHeights={};renderOrder();render();saveLayout();};
$('#orderList').addEventListener('click',e=>{const b=e.target.closest('[data-move]');if(!b)return;const chosen=appState.layout.stateOrder.filter(id=>(appState.conditions.selected.has(id)||appState.layout.pinned.has(id))&&appState.layout.pinned.has(id)===appState.layout.pinned.has(b.dataset.id)),shown=chosen,i=shown.indexOf(b.dataset.id),other=shown[i+(b.dataset.move==='up'?-1:1)];if(!other)return;const a=appState.layout.stateOrder.indexOf(b.dataset.id),z=appState.layout.stateOrder.indexOf(other);[appState.layout.stateOrder[a],appState.layout.stateOrder[z]]=[appState.layout.stateOrder[z],appState.layout.stateOrder[a]];renderOrder();render();saveLayout();});
$('#orderList').addEventListener('change',e=>{const id=e.target.dataset.rowSize;if(!id)return;const h=Number(e.target.value);if(![0,40,56,64,96,128,160].includes(h))return;if(h)appState.layout.rowHeights[id]=h;else delete appState.layout.rowHeights[id];render();saveLayout();});
let draggingState=null;$('#orderList').addEventListener('dragstart',e=>{const row=e.target.closest('[data-order-id]');if(!row)return;draggingState=row.dataset.orderId;e.dataTransfer.setData('text/plain',draggingState);e.dataTransfer.effectAllowed='move';});
$('#orderList').addEventListener('dragover',e=>{if(e.target.closest('[data-order-id]'))e.preventDefault();});
$('#orderList').addEventListener('drop',e=>{e.preventDefault();const target=e.target.closest('[data-order-id]')?.dataset.orderId;if(!target||!draggingState||target===draggingState)return;appState.layout.stateOrder=appState.layout.stateOrder.filter(id=>id!==draggingState);appState.layout.stateOrder.splice(appState.layout.stateOrder.indexOf(target),0,draggingState);draggingState=null;renderOrder();render();saveLayout();});

function applyPolityPreset(preset){
 const policy=Zhou.Presentation.topic(D);
 if(preset==='main'||preset==='default'||preset==='core'){
  appState.conditions.selected=new Set([...policy.coreIds,...appState.layout.pinned]);
 }else if(preset==='all'){
  appState.conditions.selected=new Set(D.states.map(s=>s.id));
 }else if(preset==='seven'&&isZhouTopic){
  appState.conditions.selected=new Set(['zhou','qin','qi','chu','yan','han','zhao','liang',...appState.layout.pinned]);
 }
 render();
}
function toggleMinorStates(forceExpand){
 const policy=Zhou.Presentation.topic(D);
 const minorIds=policy.order.filter(id=>!policy.coreIds.includes(id));
 if(!minorIds.length)return;
 const unselectedMinors=minorIds.filter(id=>!appState.conditions.selected.has(id)&&!appState.layout.pinned.has(id));
 const shouldExpand=typeof forceExpand==='boolean'?forceExpand:unselectedMinors.length>0;
 if(shouldExpand){
  for(const id of unselectedMinors)appState.conditions.selected.add(id);
 }else{
  for(const id of minorIds){
   if(!appState.layout.pinned.has(id))appState.conditions.selected.delete(id);
  }
 }
 render();
}
Zhou.applyPolityPreset=applyPolityPreset;
Zhou.toggleMinorStates=toggleMinorStates;
if(typeof window!=='undefined'){
 window.applyPolityPreset=applyPolityPreset;
 window.toggleMinorStates=toggleMinorStates;
}
