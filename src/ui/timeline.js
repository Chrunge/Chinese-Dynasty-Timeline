function setPeriod(name){
 document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',b.dataset.period===name));
 const width=vp.clientWidth-labelWidth()-65;
 const period=timelinePeriods.find(p=>p.id===name);if(name!=='all'&&!period)return;const a=period?Math.min(timelineBounds.start,period.start):timelineBounds.start,b=period&&!period.extendToViewEnd?Math.max(appState.conditions.end,period.end):appState.conditions.end;if(a<b)return;
 appState.layout.px=Math.max(.8,Math.min(24,width/(a-b+1)));render();vp.scrollLeft=Math.max(0,x(a));setCursor(a,false);
}
function packRulers(s){const packed=Zhou.Presentation.pack(historyService.rulersInRange(s,timelineBounds.start,appState.conditions.end),timelineBounds.start,appState.conditions.end);return {rulers:packed.items,lanes:packed.lanes};}
function stateRowLabel(s){const pinned=appState.layout.pinned.has(s.id);return '<div class="memberLabel"><button class="stateName" data-action="state" data-id="'+s.id+'" style="color:'+s.color+'" title="'+escapeHTML(s.name)+'" aria-label="查看'+escapeHTML(s.name)+'的历史">'+escapeHTML(s.display?.shortName||s.name)+'</button><button class="pinState '+(pinned?'isPinned':'')+'" data-action="pin" data-id="'+s.id+'" aria-pressed="'+pinned+'" aria-label="'+(pinned?'取消固定':'固定')+escapeHTML(s.name)+'" title="'+(pinned?'取消固定':'固定到上方，接续分段共用主行')+'">钉</button></div>';}
const reconcileTimeline=Zhou.createTimelineDOM(chart,document),timelineRows=new Map();
let timelineAxis={signature:null,html:''};
function render(){
 const oldScroll=vp.scrollLeft,w=(timelineBounds.start-appState.conditions.end+1)*appState.layout.px+160,level=densityLevel(),focused=activeEvent();
 const ordered=appState.layout.stateOrder.map(byId).filter(Boolean);
 // Domain selection remains polity IDs. A display group is never a query identity.
 appState.session.visibleStates=[...ordered.filter(s=>appState.layout.pinned.has(s.id)),...ordered.filter(s=>!appState.layout.pinned.has(s.id)&&(appState.search.query&&appState.search.searchScope==='all'||appState.conditions.selected.has(s.id))&&matches(s))];
 const rows=Zhou.Presentation.rows(appState.session.visibleStates,D.presentation,appState.layout.pinned);
 appState.session.visibleRows=rows;
 const fitHeight=Math.max(36,Math.min(160,Math.floor(((vp.clientHeight||appState.layout.viewHeight)-64)/Math.max(1,rows.length))));
 $('#rowHeightValue').textContent=(appState.layout.fitRows?fitHeight:appState.layout.rowHeight)+'px';
 chart.style.width=(w+labelWidth())+'px';chart.className=(appState.layout.mode==='overview'?'overview ':'')+'density-'+level+(focused?' hasFocus':'');
 $('#densityHint').textContent=(level==='overview'?'远景：兴亡与关键事件':level==='standard'?'中景：君主姓名与事件摘要':'近景：君主姓名、在位年份与具体事件')+(D.presentation?.rowGroups.length?' · 秦汉分段共用主行，同年重叠分层；并存政权另行。':'');
 const descriptors=[],axisSignature=appState.conditions.end+':'+appState.layout.px;
 const step=appState.layout.px>=12?5:appState.layout.px>=5?10:appState.layout.px>=2?25:50;
 if(timelineAxis.signature!==axisSignature){
  const eras=timelinePeriods.map(p=>({...p,a:Math.min(timelineBounds.start,p.start),b:Math.max(appState.conditions.end,p.end)})).filter(p=>p.a>=p.b);
  let html='<div class="axis"><div class="corner">国家 / 年代</div><div class="axisTrack" style="width:'+w+'px">';
  for(const era of eras)html+='<div class="era" style="left:'+x(era.a)+'px;width:'+((era.a-era.b+1)*appState.layout.px)+'px;background:'+era.color+'">'+escapeHTML(era.name)+'</div>';
  for(let year=Math.floor(timelineBounds.start/step)*step;year>=appState.conditions.end;year-=step)html+='<div class="tick" style="left:'+x(year)+'px">'+fmt(year).replace(/年$/,'')+'</div>';
  html+='</div></div>';timelineAxis={signature:axisSignature,html};
 }
 descriptors.push({key:'axis',html:timelineAxis.html});
 appState.session.rowLayouts=new Map();let pinTop=64,rowOffset=0;
 const rowSignature=JSON.stringify([appState.conditions.end,appState.layout.px,level,appState.layout.mode,appState.conditions.category,appState.search.query,appState.search.searchDescriptions,appState.search.searchTarget,appState.session.activeEventId]);
 let events;
 for(const row of rows){
  const members=row.members,grouped=row.grouped,isPinned=row.pinned,related=members.some(s=>focused?.states.includes(s.id));
  const requested=Math.max(...members.map(s=>Number(appState.layout.rowHeights[s.id])||(appState.layout.fitRows?fitHeight:appState.layout.rowHeight)));
  const signature=rowSignature+JSON.stringify([members.map(s=>s.id),requested,isPinned,isPinned?pinTop:0,members.map(s=>appState.layout.pinned.has(s.id))]),cached=timelineRows.get(row.key);
  if(cached?.signature===signature){for(const s of members)appState.session.rowLayouts.set(s.id,{...cached.layout,offset:rowOffset});rowOffset+=cached.layout.height;descriptors.push({key:row.key,html:cached.html});if(isPinned)pinTop+=cached.layout.height;continue;}
  const records=members.flatMap(s=>historyService.rulersInRange(s,timelineBounds.start,appState.conditions.end).map(r=>({...r,stateId:s.id})));
  const single=grouped?null:packRulers(members[0]);
  const packed=grouped?Zhou.Presentation.pack(records,timelineBounds.start,appState.conditions.end):{lanes:single.lanes,items:single.rulers.map(r=>({...r,stateId:members[0].id}))},segments=Zhou.Presentation.pack(members,timelineBounds.start,appState.conditions.end);
  const rulerVisible=level!=='overview'&&(appState.layout.mode==='both'||appState.layout.mode==='rulers'),eventVisible=appState.layout.mode==='both'||appState.layout.mode==='events'||level==='overview'&&appState.layout.mode!=='overview';
  const lanes=rulerVisible?packed.lanes:1,rulerTop=grouped?segments.lanes*22+6:6;
  const minBarHeight=packed.items.some(r=>r.polityAssociation==='contextual'||r.dating?.level==='disputed')?4:2;
  const height=Math.max(36,Math.min(160,requested),rulerVisible?rulerTop+lanes*(minBarHeight+1)+(eventVisible?21:6):0,grouped?Math.max(38+members.length*23,rulerTop+(rulerVisible?lanes*19:0)+(eventVisible?27:12)):0);
  const bandHeight=Math.max(8,height-rulerTop-(eventVisible?21:6)),barHeight=Math.max(.5,Math.min(44,bandHeight/lanes-1)),eventTop=height-21;
  const eventAreaTop=Math.min(eventTop,grouped?rulerTop:26),rulerObstacles=[];
  const layout={height,eventTop,eventAreaTop,lanes,barHeight,level,pinned:isPinned,rowKey:row.key,offset:rowOffset};
  for(const s of members)appState.session.rowLayouts.set(s.id,layout);
  rowOffset+=height;
  let html='<div class="stateRow '+(grouped?'groupedRow ':'')+(isPinned?'pinnedRow ':'')+(related?'eventRelated ':focused?'eventDim ':'')+'" data-state="'+members[0].id+'" data-row="'+row.key+'" style="height:'+height+'px;min-height:0;'+(isPinned?'position:sticky;top:'+pinTop+'px;z-index:10;':'')+'"><div class="stateLabel">'+(grouped?'<strong class="rowGroupTitle" title="'+escapeHTML(row.note)+'">'+row.name+'<small>重叠分层</small></strong>':'')+members.map(stateRowLabel).join('')+'</div><div class="track" style="width:'+w+'px;height:'+height+'px;min-height:0;background-size:'+(step*appState.layout.px)+'px 100%;background-position:'+x(Math.floor(timelineBounds.start/step)*step)+'px 0">';
  if(isPinned)pinTop+=height;
  if(grouped){
   for(const s of segments.items){const start=Math.min(timelineBounds.start,s.start),end=Math.max(s.end,appState.conditions.end);html+='<button class="politySegment" data-action="state" data-id="'+s.id+'" style="left:'+x(start)+'px;width:'+Math.max(2,(start-end+1)*appState.layout.px)+'px;top:'+(s.displayLane*22+3)+'px;background:'+s.color+'" title="'+escapeHTML(s.name+' · '+range(s.start,s.end))+'" aria-label="'+escapeHTML(s.name+'，'+range(s.start,s.end))+'">'+escapeHTML(s.display?.shortName||s.name)+'</button>';}
  }else{
   const s=members[0];let life=[{start:s.start,end:Math.max(s.end,appState.conditions.end)}];
   for(const gap of s.interruptions)life=life.flatMap(seg=>gap.start<=seg.start&&gap.end>=seg.end?[{start:seg.start,end:gap.start+1},{start:gap.end-1,end:seg.end}]:[seg]);
   for(const seg of life){if(seg.start<appState.conditions.end)continue;html+='<div class="lifeline '+(s.approxStart?'uncertainLife':'')+'" style="left:'+x(seg.start)+'px;width:'+Math.max(0,(seg.start-seg.end+1)*appState.layout.px)+'px;background:'+s.color+'"></div>';}
   if(level==='overview'||appState.layout.mode==='overview'){if(s.start>=appState.conditions.end)html+='<button class="lifeStart" data-action="state" data-id="'+s.id+'" style="left:'+x(s.start)+'px" title="'+escapeHTML(s.name+'起点 '+range(s.start,s.start,s.approxStart))+'">'+(s.approxStart?'约 ':'')+fmt(s.start).replace(/年$/,'')+' '+escapeHTML(s.startLabel||'起点')+'</button>';}
  }
  if(related)html+='<div class="eventYearShade" style="left:'+(x(focused.year)-4)+'px;width:'+Math.max(9,appState.layout.px)+'px" aria-hidden="true"></div>';
  if(rulerVisible){
   for(const r of packed.items){
    const s=byId(r.stateId);if(s.interruptions.some(g=>r.start<=g.start&&r.end>=g.end))continue;
    const width=Math.max(2,(r.start-Math.max(r.end,appState.conditions.end)+1)*appState.layout.px),isCurrent=related&&rulersAt(s,focused.year).some(v=>v.id===r.id);
    // CSS border-box cannot shrink below padding + borders, even on short reigns.
    const borderSize=r.polityAssociation==='contextual'||r.dating?.level==='disputed'?4:2;
    rulerObstacles.push({left:x(r.start),right:x(r.start)+Math.max(10+borderSize,width),top:rulerTop+r.displayLane*(barHeight+1),bottom:rulerTop+r.displayLane*(barHeight+1)+Math.max(borderSize,barHeight)});
    const label=Zhou.Presentation.rulerLabel(r),labelNeeded=(label.length+(r.dating?.level!=='certain'?1:0))*14+14;
    let text='';
    if(width>=labelNeeded&&barHeight>=14){text='<span class="rulerName">'+escapeHTML(label)+(r.dating?.level!=='certain'?' · '+certaintyShort[r.dating?.level||'inferred']:'')+'</span>';if(level==='detail'&&width>=110&&barHeight>=30)text+='<small class="rulerYears">'+range(r.start,r.end,r.approx)+'</small>';else if(level==='detail'&&width>=labelNeeded+145)text+='<small class="rulerYears inlineYears">'+range(r.start,r.end,r.approx)+'</small>';}
    const accessible=[r.name,r.role,range(r.start,r.end,r.approx),r.associationNote,'生平与来源见点击详情',certaintyLabel[r.dating?.level||'inferred']].filter(Boolean).join(' · ');
    html+='<button class="ruler '+(r.polityAssociation==='contextual'?'contextualTenure ':'')+(r.approx?'approx ':'')+(r.dating?.level==='disputed'?'disputedBar ':'')+(appState.search.searchTarget==='ruler:'+r.id||appState.search.query&&matchRuler(r)?'match ':'')+(isCurrent?'eventRuler':'')+'" data-action="ruler" data-id="'+r.id+'" data-state-id="'+s.id+'" style="left:'+x(r.start)+'px;width:'+width+'px;top:'+(rulerTop+r.displayLane*(barHeight+1))+'px;height:'+barHeight+'px;line-height:'+Math.min(18,barHeight)+'px;background-color:'+s.color+';opacity:'+(appState.search.query&&!matchRuler(r)&&appState.search.searchTarget!=='ruler:'+r.id?'.35':'.94')+'" title="'+escapeHTML(accessible)+'" aria-label="'+escapeHTML(accessible)+'">'+text+'</button>';
   }
   if(!grouped){const s=members[0],first=packed.items.reduce((a,r)=>Math.max(a,r.start),-Infinity);if(Number.isFinite(first)&&first<s.start&&x(first)-x(s.start)>90)html+='<button class="event gap" data-action="state" data-id="'+s.id+'" style="left:'+(x(s.start)+8)+'px;top:6px">早期纪年待考</button>';}
  }
  if(eventVisible){
   events??=historyService.eventsInRange({from:timelineBounds.start,to:appState.conditions.end,states:appState.session.visibleStates.map(state=>state.id),category:appState.conditions.category});
   const es=events.filter(e=>members.some(s=>e.states.includes(s.id))).filter(e=>(level!=='overview'||e.key||e.id===appState.session.activeEventId||appState.search.query&&matchEvent(e))&&(e.id===appState.session.activeEventId||!appState.search.query||matchEvent(e)||members.some(s=>containsSearch(countryAliases(s))))).sort((a,b)=>b.year-a.year);
   const eventLayout=Zhou.Presentation.events(es,{position:e=>x(e.year),measure:e=>(e.name.length+(e.dating?.level!=='certain'?3:0))*(level==='detail'?14:12)+35,top:eventAreaTop,bottom:eventTop,focusedId:appState.session.activeEventId,obstacles:rulerObstacles});
   layout.eventLanes=eventLayout.lanes;
   for(const marker of eventLayout.groups){
    const group=marker.events,ev=group[0],highlight=group.some(e=>e.id===appState.session.activeEventId);
    const label=(ev.dating?.level!=='certain'?certaintyShort[ev.dating?.level||'inferred']+' · ':'')+ev.name+(group.length>1?' · '+group.length:'');
    const title=group.map(e=>fmt(e.year)+' · '+e.name+' · '+certaintyLabel[e.dating?.level||'inferred']).join('；');
    html+='<button class="event date-'+(ev.dating?.level||'inferred')+' '+(group.length>1?'cluster ':'')+(highlight?'linkedEvent ':'')+'" data-action="'+(group.length>1?'cluster':'event')+'" data-id="'+group.map(e=>e.id).join(',')+'" data-event-lane="'+marker.lane+'" style="left:'+marker.left+'px;top:'+marker.top+'px;max-width:'+marker.width+'px" title="'+escapeHTML(title)+'"><i></i><span>'+escapeHTML(label)+'</span></button>';
   }
  }
  if(!grouped){const s=members[0];if(s.end>=appState.conditions.end)html+='<button class="event termination" data-action="state" data-id="'+s.id+'" style="left:'+x(s.end)+'px;top:6px;height:'+Math.max(20,height-12)+'px">'+(s.approxEnd?'约 ':'')+fmt(s.end).replace(/年$/,'')+' '+escapeHTML(s.endLabel||'终止')+'</button>';else if(s.continuationNote&&appState.conditions.end===timelineBounds.end)html+='<div class="gap" style="left:'+(x(timelineBounds.end)+8)+'px">'+escapeHTML(s.continuationNote)+'</div>';}
  html+='</div></div>';
  timelineRows.set(row.key,{signature,html,layout});descriptors.push({key:row.key,html});
 }
 if(!appState.session.visibleStates.length)descriptors.push({key:'empty',html:'<div class="empty">没有匹配的国家、君主或事件。请修改关键词或国家筛选。</div>'});
 descriptors.push({key:'cursor',html:'<div class="cursorline"><span class="cursorBadge"></span></div>',update:line=>{line.style.left=(x(appState.conditions.cursor)+labelWidth())+'px';line.firstChild.textContent=fmt(appState.conditions.cursor).replace(/年$/,'');}});
 reconcileTimeline(descriptors);vp.scrollLeft=oldScroll;$('#zoomLabel').textContent=Number(appState.layout.px.toFixed(1))+' px / 年';$('#filterCount').textContent=new Set([...appState.conditions.selected,...appState.layout.pinned]).size;
 $('#stats').innerHTML=[[D.states.length,'国家与王室'],[D.states.reduce((n,s)=>n+s.rulers.length,0),'在位区间'],[D.events.length,'精选事件']].map(([n,t])=>'<div class="number"><b>'+n+'</b><span>'+t+'</span></div>').join('');
 updateRange();pageEffects.renderPanels();notifyViewChanged();
}
function updateRange(){const left=Math.min(timelineBounds.start,Math.max(appState.conditions.end,timelineBounds.start-Math.floor(vp.scrollLeft/appState.layout.px)));const right=Math.max(appState.conditions.end,timelineBounds.start-Math.floor((vp.scrollLeft+vp.clientWidth-labelWidth())/appState.layout.px));$('#visibleRange').textContent='可见：'+range(left,right)+' · '+(appState.session.visibleRows?.length||0)+'行';notifyViewChanged();}
function setCursor(y,scroll=false){appState.conditions.cursor=Math.round(Math.min(timelineBounds.start,Math.max(appState.conditions.end,y)));$('#cursorYear').value=0-appState.conditions.cursor;$('#cursorOutput').textContent=fmt(appState.conditions.cursor);$('#selectionYear').textContent='年份参考线：'+fmt(appState.conditions.cursor);$('#compareTitle').textContent=fmt(appState.conditions.cursor)+'的列国';const line=$('.cursorline');if(line){line.style.left=(x(appState.conditions.cursor)+labelWidth())+'px';line.firstChild.textContent=fmt(appState.conditions.cursor).replace(/年$/,'');}updateCompare();if(scroll)vp.scrollLeft=Math.max(0,x(appState.conditions.cursor)-(vp.clientWidth-labelWidth())/2);notifyViewChanged();}
function updateCompare(){
 $('#compare').innerHTML=historyService.compareYear(appState.conditions.cursor,appState.session.visibleStates.map(s=>s.id)).map(({state:s,interruption:gap,rulers,events:es})=>{
  return '<button class="comparecard '+(activeEvent()?.states.includes(s.id)?'eventRelated':'')+'" data-action="state" data-id="'+s.id+'" style="--statecolor:'+s.color+'"><strong>'+s.name+'</strong><span>'+ (gap?escapeHTML(gap.note):rulers.length?rulers.map(r=>(r.approx?'约 · ':'')+escapeHTML(r.name)).join(' / '):'君主纪年待考')+'</span><small>'+ (es.length?escapeHTML(es.map(e=>e.name).join('；')):'该年无已收录大事')+'</small></button>';
 }).join('')||'<p class="notice">该年没有符合当前筛选的国家。</p>';
}
