function setPeriod(name){
 document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',b.dataset.period===name));
 const width=vp.clientWidth-labelWidth()-65;
 const spans={all:[1046,appState.conditions.end],west:[1046,771],spring:[770,476],war:[475,appState.conditions.end]};const [a,b]=spans[name];
 appState.layout.px=Math.max(.8,Math.min(24,width/(a-b+1)));render();vp.scrollLeft=Math.max(0,x(a));setCursor(a,false);
}
function packRulers(s){
 const result=[],ends=[];
 const ordered=historyService.rulersInRange(s,1046,appState.conditions.end).sort((a,b)=>b.start-a.start||a.lane-b.lane);
 for(const r of ordered){let lane=r.lane||0;while(ends[lane]!=null&&r.start>=ends[lane])lane++;ends[lane]=r.end;result.push({...r,displayLane:lane});}
 return {rulers:result,lanes:Math.max(1,ends.length)};
}
function render(){
 const oldScroll=vp.scrollLeft,w=(1046-appState.conditions.end+1)*appState.layout.px+160,level=densityLevel(),focused=activeEvent();
 const ordered=appState.layout.stateOrder.map(byId).filter(Boolean);
 appState.session.visibleStates=[...ordered.filter(s=>appState.layout.pinned.has(s.id)),...ordered.filter(s=>!appState.layout.pinned.has(s.id)&&(appState.search.query&&appState.search.searchScope==='all'||appState.conditions.selected.has(s.id))&&matches(s))];
 const fitHeight=Math.max(36,Math.min(160,Math.floor(((vp.clientHeight||appState.layout.viewHeight)-64)/Math.max(1,appState.session.visibleStates.length))));
 $('#rowHeightValue').textContent=(appState.layout.fitRows?fitHeight:appState.layout.rowHeight)+'px';
 chart.style.width=(w+labelWidth())+'px';chart.className=(appState.layout.mode==='overview'?'overview ':'')+'density-'+level+(focused?' hasFocus':'');
 $('#densityHint').textContent=level==='overview'?'远景：兴亡与关键事件':level==='standard'?'中景：君主姓名与事件摘要':'近景：君主姓名、在位年份与具体事件';
 const eras=[{a:1046,b:771,name:'西周',color:'#64796d'},{a:770,b:476,name:'春秋',color:'#355e68'},{a:475,b:256,name:'战国',color:'#8d734c'}];
 if(appState.conditions.end===221)eras.push({a:255,b:221,name:'周亡后 · 秦统一',color:'#79696a'});
 let html='<div class="axis"><div class="corner">国家 / 年代</div><div class="axisTrack" style="width:'+w+'px">';
 for(const era of eras)html+='<div class="era" style="left:'+x(era.a)+'px;width:'+((era.a-era.b+1)*appState.layout.px)+'px;background:'+era.color+'">'+era.name+'</div>';
 const step=appState.layout.px>=12?5:appState.layout.px>=5?10:appState.layout.px>=2?25:50;
 for(let year=1050;year>=appState.conditions.end;year-=step){if(year<=1046)html+='<div class="tick" style="left:'+x(year)+'px">前'+year+'</div>';}
 html+='</div></div>';
 appState.session.rowLayouts=new Map();let pinTop=64;
 const content=historyService.comparison({from:1046,to:appState.conditions.end,states:appState.session.visibleStates.map(s=>s.id),category:appState.conditions.category,cursor:appState.conditions.cursor});
 for(const s of content.states){
  const packed=packRulers(s),rulerVisible=level!=='overview'&&(appState.layout.mode==='both'||appState.layout.mode==='rulers'),eventVisible=appState.layout.mode==='both'||appState.layout.mode==='events'||level==='overview'&&appState.layout.mode!=='overview';
  const height=Math.max(36,Math.min(160,Number(appState.layout.rowHeights[s.id])||(appState.layout.fitRows?fitHeight:appState.layout.rowHeight))),isPinned=appState.layout.pinned.has(s.id),related=focused?.states.includes(s.id);
  const lanes=rulerVisible?packed.lanes:1,rulerTop=6,bandHeight=Math.max(8,height-(eventVisible?27:12)),barHeight=Math.max(.5,Math.min(44,bandHeight/lanes-1)),eventTop=height-21;
  appState.session.rowLayouts.set(s.id,{height,eventTop,lanes,barHeight,level,pinned:isPinned});
  html+='<div class="stateRow '+(isPinned?'pinnedRow ':'')+(related?'eventRelated ':focused?'eventDim ':'')+'" data-state="'+s.id+'" style="height:'+height+'px;min-height:0;'+(isPinned?'position:sticky;top:'+pinTop+'px;z-index:10;':'')+'"><div class="stateLabel"><button class="stateName" data-action="state" data-id="'+s.id+'" style="color:'+s.color+'" aria-label="查看'+s.name+'的历史">'+s.name+'</button><button class="pinState '+(isPinned?'isPinned':'')+'" data-action="pin" data-id="'+s.id+'" aria-pressed="'+isPinned+'" aria-label="'+(isPinned?'取消固定':'固定')+s.name+'" title="'+(isPinned?'取消固定':'固定到上方，滚动时保持可见')+'">钉</button></div><div class="track" style="width:'+w+'px;height:'+height+'px;min-height:0;background-size:'+(step*appState.layout.px)+'px 100%;background-position:'+x(Math.floor(1046/step)*step)+'px 0">';
  if(isPinned)pinTop+=height;
  let segments=[{start:s.start,end:Math.max(s.end,appState.conditions.end)}];
  for(const gap of s.interruptions)segments=segments.flatMap(seg=>gap.start<=seg.start&&gap.end>=seg.end?[{start:seg.start,end:gap.start+1},{start:gap.end-1,end:seg.end}]:[seg]);
  for(const seg of segments){if(seg.start<appState.conditions.end)continue;html+='<div class="lifeline '+(s.approxStart?'uncertainLife':'')+'" style="left:'+x(seg.start)+'px;width:'+Math.max(0,(seg.start-seg.end+1)*appState.layout.px)+'px;background:'+s.color+'"></div>';}
  if(level==='overview'||appState.layout.mode==='overview'){
   if(s.start>=appState.conditions.end)html+='<button class="lifeStart" data-action="state" data-id="'+s.id+'" style="left:'+x(s.start)+'px" title="'+escapeHTML(s.name+'起点 '+range(s.start,s.start,s.approxStart))+'">'+(s.approxStart?'约 ':'')+'前'+s.start+' '+(s.id==='yue'?'起源示意':'起点')+'</button>';
  }
  if(related)html+='<div class="eventYearShade" style="left:'+(x(focused.year)-4)+'px;width:'+Math.max(9,appState.layout.px)+'px" aria-hidden="true"></div>';
  if(rulerVisible){
   for(const r of packed.rulers){
    if(s.interruptions.some(g=>r.start<=g.start&&r.end>=g.end))continue;
    const width=Math.max(2,(r.start-Math.max(r.end,appState.conditions.end)+1)*appState.layout.px),isCurrent=related&&rulersAt(s,focused.year).some(v=>v.id===r.id);
    const labelNeeded=(r.name.length+(r.dating?.level!=='certain'?1:0))*14+14;
    let text='';
    if(width>=labelNeeded&&barHeight>=14){text='<span class="rulerName">'+escapeHTML(r.name)+(r.dating?.level!=='certain'?' · '+certaintyShort[r.dating?.level||'inferred']:'')+'</span>';if(level==='detail'&&width>=110&&barHeight>=30)text+='<small class="rulerYears">'+range(r.start,r.end,r.approx)+'</small>';else if(level==='detail'&&width>=labelNeeded+145)text+='<small class="rulerYears inlineYears">'+range(r.start,r.end,r.approx)+'</small>';}
    html+='<button class="ruler '+(r.approx?'approx ':'')+(r.dating?.level==='disputed'?'disputedBar ':'')+(appState.search.searchTarget==='ruler:'+r.id||appState.search.query&&matchRuler(r)?'match ':'')+(isCurrent?'eventRuler':'')+'" data-action="ruler" data-id="'+r.id+'" style="left:'+x(r.start)+'px;width:'+width+'px;top:'+(rulerTop+r.displayLane*(barHeight+1))+'px;height:'+barHeight+'px;line-height:'+Math.min(18,barHeight)+'px;background-color:'+s.color+';opacity:'+(appState.search.query&&!matchRuler(r)&&appState.search.searchTarget!=='ruler:'+r.id?'.35':'.94')+'" title="'+escapeHTML(r.name+' '+range(r.start,r.end,r.approx)+' · '+certaintyLabel[r.dating?.level||'inferred'])+'" aria-label="'+escapeHTML(r.name+'，'+range(r.start,r.end,r.approx))+'">'+text+'</button>';
   }
   const first=packed.rulers.reduce((a,r)=>Math.max(a,r.start),0);
   if(first<s.start&&x(first)-x(s.start)>90)html+='<button class="event gap" data-action="state" data-id="'+s.id+'" style="left:'+(x(s.start)+8)+'px;top:6px">早期纪年待考</button>';
  }
  if(eventVisible){
   const es=content.events.filter(e=>e.states.includes(s.id)).filter(e=>(level!=='overview'||e.key||e.id===appState.session.activeEventId||appState.search.query&&matchEvent(e))&&(e.id===appState.session.activeEventId||!appState.search.query||matchEvent(e)||containsSearch(countryAliases(s)))).sort((a,b)=>b.year-a.year);
   const groups=[];
   for(const ev of es){const last=groups.at(-1),previous=last?.[0];const need=previous?Math.min(210,previous.name.length*(level==='detail'?14:12)+35):0;if(last&&ev.id!==appState.session.activeEventId&&!last.some(e=>e.id===appState.session.activeEventId)&&x(ev.year)-x(previous.year)<need+8)last.push(ev);else groups.push([ev]);}
   for(let i=0;i<groups.length;i++){
    const group=groups[i],ev=group[0],maxWidth=Math.max(18,Math.min(210,(groups[i+1]?x(groups[i+1][0].year)-x(ev.year)-8:210))),highlight=group.some(e=>e.id===appState.session.activeEventId);
    const label=(ev.dating?.level!=='certain'?certaintyShort[ev.dating?.level||'inferred']+' · ':'')+ev.name+(group.length>1?' · '+group.length:'');
    html+='<button class="event date-'+(ev.dating?.level||'inferred')+' '+(group.length>1?'cluster ':'')+(highlight?'linkedEvent ':'')+'" data-action="'+(group.length>1?'cluster':'event')+'" data-id="'+(group.length>1?group.map(e=>e.id).join(','):ev.id)+'" style="left:'+x(ev.year)+'px;top:'+eventTop+'px;max-width:'+maxWidth+'px" title="'+escapeHTML(fmt(ev.year)+' · '+label+' · '+certaintyLabel[ev.dating?.level||'inferred'])+'"><i></i><span>'+escapeHTML(label)+'</span></button>';
   }
  }
  if(s.end>=appState.conditions.end)html+='<button class="event termination" data-action="state" data-id="'+s.id+'" style="left:'+x(s.end)+'px;top:6px;height:'+Math.max(20,height-12)+'px">'+(s.approxEnd?'约 ':'')+'前'+s.end+' '+(s.id==='qin'?'称帝':s.id==='jin'?'终结争议':s.id==='yue'?'中心瓦解':'终止')+'</button>';
  else if(appState.conditions.end===221&&s.id==='wei')html+='<div class="gap" style="left:'+(x(221)+8)+'px">延续至前209年</div>';
  html+='</div></div>';
 }
 if(!appState.session.visibleStates.length)html+='<div class="empty">没有匹配的国家、君主或事件。请修改关键词或国家筛选。</div>';
 html+='<div class="cursorline" style="left:'+(x(appState.conditions.cursor)+labelWidth())+'px"><span class="cursorBadge">前'+appState.conditions.cursor+'</span></div>';
 chart.innerHTML=html;vp.scrollLeft=oldScroll;$('#zoomLabel').textContent=Number(appState.layout.px.toFixed(1))+' px / 年';$('#filterCount').textContent=new Set([...appState.conditions.selected,...appState.layout.pinned]).size;
 $('#stats').innerHTML=[['18','国家与王室'],[D.states.reduce((n,s)=>n+s.rulers.length,0),'在位区间'],[D.events.length,'精选事件']].map(([n,t])=>'<div class="number"><b>'+n+'</b><span>'+t+'</span></div>').join('');
 updateRange();updateCompare();renderEventFocus();renderSearchResults();if(typeof scheduleReadingSave==='function')scheduleReadingSave();
}
function updateRange(){const left=Math.min(1046,Math.max(appState.conditions.end,1046-Math.floor(vp.scrollLeft/appState.layout.px)));const right=Math.max(appState.conditions.end,1046-Math.floor((vp.scrollLeft+vp.clientWidth-labelWidth())/appState.layout.px));$('#visibleRange').textContent='可见：前'+left+'—'+right+'年 · '+appState.session.visibleStates.length+'行';if(typeof scheduleReadingSave==='function')scheduleReadingSave();}
function setCursor(y,scroll=false){appState.conditions.cursor=Math.round(Math.min(1046,Math.max(appState.conditions.end,y)));$('#cursorYear').value=-appState.conditions.cursor;$('#cursorOutput').textContent=fmt(appState.conditions.cursor);$('#selectionYear').textContent='年份参考线：'+fmt(appState.conditions.cursor);$('#compareTitle').textContent=fmt(appState.conditions.cursor)+'的列国';const line=$('.cursorline');if(line){line.style.left=(x(appState.conditions.cursor)+labelWidth())+'px';line.firstChild.textContent='前'+appState.conditions.cursor;}updateCompare();if(scroll)vp.scrollLeft=Math.max(0,x(appState.conditions.cursor)-(vp.clientWidth-labelWidth())/2);if(typeof scheduleReadingSave==='function')scheduleReadingSave();}
function updateCompare(){
 $('#compare').innerHTML=historyService.compareYear(appState.conditions.cursor,appState.session.visibleStates.map(s=>s.id)).map(({state:s,interruption:gap,rulers,events:es})=>{
  return '<button class="comparecard '+(activeEvent()?.states.includes(s.id)?'eventRelated':'')+'" data-action="state" data-id="'+s.id+'" style="--statecolor:'+s.color+'"><strong>'+s.name+'</strong><span>'+ (gap?escapeHTML(gap.note):rulers.length?rulers.map(r=>(r.approx?'约 · ':'')+escapeHTML(r.name)).join(' / '):'君主纪年待考')+'</span><small>'+ (es.length?escapeHTML(es.map(e=>e.name).join('；')):'该年无已收录大事')+'</small></button>';
 }).join('')||'<p class="notice">该年没有符合当前筛选的国家。</p>';
}
