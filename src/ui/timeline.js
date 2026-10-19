function setPeriod(name){
 document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',b.dataset.period===name));
 const width=vp.clientWidth-labelWidth()-65;
 const period=timelinePeriods.find(p=>p.id===name);if(name!=='all'&&!period)return;const a=period?Math.min(timelineBounds.start,period.start):timelineBounds.start,b=period&&!period.extendToViewEnd?Math.max(appState.conditions.end,period.end):appState.conditions.end;if(a<b)return;
 appState.layout.px=Math.max(.8,Math.min(24,width/(a-b+1)));render();vp.scrollLeft=Math.max(0,x(a));setCursor(a,false);
}
function packRulers(s){
 const result=[],ends=[];
 const ordered=historyService.rulersInRange(s,timelineBounds.start,appState.conditions.end).sort((a,b)=>b.start-a.start||a.lane-b.lane);
 for(const r of ordered){let lane=r.lane||0;while(ends[lane]!=null&&r.start>=ends[lane])lane++;ends[lane]=r.end;result.push({...r,displayLane:lane});}
 return {rulers:result,lanes:Math.max(1,ends.length)};
}
const reconcileTimeline=Zhou.createTimelineDOM(chart,document),timelineRows=new Map();
let timelineAxis={signature:null,html:''};
function render(){
 const oldScroll=vp.scrollLeft,w=(timelineBounds.start-appState.conditions.end+1)*appState.layout.px+160,level=densityLevel(),focused=activeEvent();
 const ordered=appState.layout.stateOrder.map(byId).filter(Boolean);
 appState.session.visibleStates=[...ordered.filter(s=>appState.layout.pinned.has(s.id)),...ordered.filter(s=>!appState.layout.pinned.has(s.id)&&(appState.search.query&&appState.search.searchScope==='all'||appState.conditions.selected.has(s.id))&&matches(s))];
 const fitHeight=Math.max(36,Math.min(160,Math.floor(((vp.clientHeight||appState.layout.viewHeight)-64)/Math.max(1,appState.session.visibleStates.length))));
 $('#rowHeightValue').textContent=(appState.layout.fitRows?fitHeight:appState.layout.rowHeight)+'px';
 chart.style.width=(w+labelWidth())+'px';chart.className=(appState.layout.mode==='overview'?'overview ':'')+'density-'+level+(focused?' hasFocus':'');
 $('#densityHint').textContent=level==='overview'?'远景：兴亡与关键事件':level==='standard'?'中景：君主姓名与事件摘要':'近景：君主姓名、在位年份与具体事件';
 const descriptors=[],axisSignature=appState.conditions.end+':'+appState.layout.px;
 const step=appState.layout.px>=12?5:appState.layout.px>=5?10:appState.layout.px>=2?25:50;
 if(timelineAxis.signature!==axisSignature){
 const eras=timelinePeriods.map(p=>({...p,a:Math.min(timelineBounds.start,p.start),b:Math.max(appState.conditions.end,p.end)})).filter(p=>p.a>=p.b);
 let html='<div class="axis"><div class="corner">国家 / 年代</div><div class="axisTrack" style="width:'+w+'px">';
 for(const era of eras)html+='<div class="era" style="left:'+x(era.a)+'px;width:'+((era.a-era.b+1)*appState.layout.px)+'px;background:'+era.color+'">'+escapeHTML(era.name)+'</div>';
 for(let year=Math.floor(timelineBounds.start/step)*step;year>=appState.conditions.end;year-=step)html+='<div class="tick" style="left:'+x(year)+'px">'+fmt(year).replace(/年$/,'')+'</div>';
 html+='</div></div>';
 timelineAxis={signature:axisSignature,html};
 }
 descriptors.push({key:'axis',html:timelineAxis.html});
 appState.session.rowLayouts=new Map();let pinTop=64;
 // Only rendering inputs belong in this signature. Cursor and search-list paging
 // update their own UI without regenerating the chart's historical content.
 const rowSignature=JSON.stringify([appState.conditions.end,appState.layout.px,level,appState.layout.mode,appState.conditions.category,appState.search.query,appState.search.searchDescriptions,appState.search.searchTarget,appState.session.activeEventId]);
 let events;
 for(const s of appState.session.visibleStates){
  const height=Math.max(36,Math.min(160,Number(appState.layout.rowHeights[s.id])||(appState.layout.fitRows?fitHeight:appState.layout.rowHeight))),isPinned=appState.layout.pinned.has(s.id),related=focused?.states.includes(s.id);
  const signature=rowSignature+':'+height+':'+isPinned+':'+(isPinned?pinTop:0),cached=timelineRows.get(s.id);
  if(cached?.signature===signature){appState.session.rowLayouts.set(s.id,cached.layout);descriptors.push({key:'state:'+s.id,html:cached.html});if(isPinned)pinTop+=height;continue;}
  let html='';
  const packed=packRulers(s),rulerVisible=level!=='overview'&&(appState.layout.mode==='both'||appState.layout.mode==='rulers'),eventVisible=appState.layout.mode==='both'||appState.layout.mode==='events'||level==='overview'&&appState.layout.mode!=='overview';
  const lanes=rulerVisible?packed.lanes:1,rulerTop=6,bandHeight=Math.max(8,height-(eventVisible?27:12)),barHeight=Math.max(.5,Math.min(44,bandHeight/lanes-1)),eventTop=height-21;
  appState.session.rowLayouts.set(s.id,{height,eventTop,lanes,barHeight,level,pinned:isPinned});
  html+='<div class="stateRow '+(isPinned?'pinnedRow ':'')+(related?'eventRelated ':focused?'eventDim ':'')+'" data-state="'+s.id+'" style="height:'+height+'px;min-height:0;'+(isPinned?'position:sticky;top:'+pinTop+'px;z-index:10;':'')+'"><div class="stateLabel"><button class="stateName" data-action="state" data-id="'+s.id+'" style="color:'+s.color+'" aria-label="查看'+s.name+'的历史">'+s.name+'</button><button class="pinState '+(isPinned?'isPinned':'')+'" data-action="pin" data-id="'+s.id+'" aria-pressed="'+isPinned+'" aria-label="'+(isPinned?'取消固定':'固定')+s.name+'" title="'+(isPinned?'取消固定':'固定到上方，滚动时保持可见')+'">钉</button></div><div class="track" style="width:'+w+'px;height:'+height+'px;min-height:0;background-size:'+(step*appState.layout.px)+'px 100%;background-position:'+x(Math.floor(timelineBounds.start/step)*step)+'px 0">';
  if(isPinned)pinTop+=height;
  let segments=[{start:s.start,end:Math.max(s.end,appState.conditions.end)}];
  for(const gap of s.interruptions)segments=segments.flatMap(seg=>gap.start<=seg.start&&gap.end>=seg.end?[{start:seg.start,end:gap.start+1},{start:gap.end-1,end:seg.end}]:[seg]);
  for(const seg of segments){if(seg.start<appState.conditions.end)continue;html+='<div class="lifeline '+(s.approxStart?'uncertainLife':'')+'" style="left:'+x(seg.start)+'px;width:'+Math.max(0,(seg.start-seg.end+1)*appState.layout.px)+'px;background:'+s.color+'"></div>';}
  if(level==='overview'||appState.layout.mode==='overview'){
   if(s.start>=appState.conditions.end)html+='<button class="lifeStart" data-action="state" data-id="'+s.id+'" style="left:'+x(s.start)+'px" title="'+escapeHTML(s.name+'起点 '+range(s.start,s.start,s.approxStart))+'">'+(s.approxStart?'约 ':'')+fmt(s.start).replace(/年$/,'')+' '+escapeHTML(s.startLabel||'起点')+'</button>';
  }
  if(related)html+='<div class="eventYearShade" style="left:'+(x(focused.year)-4)+'px;width:'+Math.max(9,appState.layout.px)+'px" aria-hidden="true"></div>';
  if(rulerVisible){
   for(const r of packed.rulers){
    if(s.interruptions.some(g=>r.start<=g.start&&r.end>=g.end))continue;
    const width=Math.max(2,(r.start-Math.max(r.end,appState.conditions.end)+1)*appState.layout.px),isCurrent=related&&rulersAt(s,focused.year).some(v=>v.id===r.id);
    const labelNeeded=(r.name.length+(r.dating?.level!=='certain'?1:0))*14+14;
    let text='';
    if(width>=labelNeeded&&barHeight>=14){text='<span class="rulerName">'+escapeHTML(r.name)+(r.dating?.level!=='certain'?' · '+certaintyShort[r.dating?.level||'inferred']:'')+'</span>';if(level==='detail'&&width>=110&&barHeight>=30)text+='<small class="rulerYears">'+range(r.start,r.end,r.approx)+'</small>';else if(level==='detail'&&width>=labelNeeded+145)text+='<small class="rulerYears inlineYears">'+range(r.start,r.end,r.approx)+'</small>';}
    html+='<button class="ruler '+(r.polityAssociation==='contextual'?'contextualTenure ':'')+(r.approx?'approx ':'')+(r.dating?.level==='disputed'?'disputedBar ':'')+(appState.search.searchTarget==='ruler:'+r.id||appState.search.query&&matchRuler(r)?'match ':'')+(isCurrent?'eventRuler':'')+'" data-action="ruler" data-id="'+r.id+'" style="left:'+x(r.start)+'px;width:'+width+'px;top:'+(rulerTop+r.displayLane*(barHeight+1))+'px;height:'+barHeight+'px;line-height:'+Math.min(18,barHeight)+'px;background-color:'+s.color+';opacity:'+(appState.search.query&&!matchRuler(r)&&appState.search.searchTarget!=='ruler:'+r.id?'.35':'.94')+'" title="'+escapeHTML(r.name+' '+range(r.start,r.end,r.approx)+(r.associationNote?' · '+r.associationNote:'')+' · '+certaintyLabel[r.dating?.level||'inferred'])+'" aria-label="'+escapeHTML(r.name+'，'+range(r.start,r.end,r.approx))+'">'+text+'</button>';
   }
   const first=packed.rulers.reduce((a,r)=>Math.max(a,r.start),-Infinity);
   if(Number.isFinite(first)&&first<s.start&&x(first)-x(s.start)>90)html+='<button class="event gap" data-action="state" data-id="'+s.id+'" style="left:'+(x(s.start)+8)+'px;top:6px">早期纪年待考</button>';
  }
  if(eventVisible){
   events??=historyService.eventsInRange({from:timelineBounds.start,to:appState.conditions.end,states:appState.session.visibleStates.map(state=>state.id),category:appState.conditions.category});
   const es=events.filter(e=>e.states.includes(s.id)).filter(e=>(level!=='overview'||e.key||e.id===appState.session.activeEventId||appState.search.query&&matchEvent(e))&&(e.id===appState.session.activeEventId||!appState.search.query||matchEvent(e)||containsSearch(countryAliases(s)))).sort((a,b)=>b.year-a.year);
   const groups=[];
   for(const ev of es){const last=groups.at(-1),previous=last?.[0];const need=previous?Math.min(210,previous.name.length*(level==='detail'?14:12)+35):0;if(last&&ev.id!==appState.session.activeEventId&&!last.some(e=>e.id===appState.session.activeEventId)&&x(ev.year)-x(previous.year)<need+8)last.push(ev);else groups.push([ev]);}
   for(let i=0;i<groups.length;i++){
    const group=groups[i],ev=group[0],maxWidth=Math.max(18,Math.min(210,(groups[i+1]?x(groups[i+1][0].year)-x(ev.year)-8:210))),highlight=group.some(e=>e.id===appState.session.activeEventId);
    const label=(ev.dating?.level!=='certain'?certaintyShort[ev.dating?.level||'inferred']+' · ':'')+ev.name+(group.length>1?' · '+group.length:'');
    html+='<button class="event date-'+(ev.dating?.level||'inferred')+' '+(group.length>1?'cluster ':'')+(highlight?'linkedEvent ':'')+'" data-action="'+(group.length>1?'cluster':'event')+'" data-id="'+(group.length>1?group.map(e=>e.id).join(','):ev.id)+'" style="left:'+x(ev.year)+'px;top:'+eventTop+'px;max-width:'+maxWidth+'px" title="'+escapeHTML(fmt(ev.year)+' · '+label+' · '+certaintyLabel[ev.dating?.level||'inferred'])+'"><i></i><span>'+escapeHTML(label)+'</span></button>';
   }
  }
  if(s.end>=appState.conditions.end)html+='<button class="event termination" data-action="state" data-id="'+s.id+'" style="left:'+x(s.end)+'px;top:6px;height:'+Math.max(20,height-12)+'px">'+(s.approxEnd?'约 ':'')+fmt(s.end).replace(/年$/,'')+' '+escapeHTML(s.endLabel||'终止')+'</button>';
  else if(s.continuationNote&&appState.conditions.end===timelineBounds.end)html+='<div class="gap" style="left:'+(x(timelineBounds.end)+8)+'px">'+escapeHTML(s.continuationNote)+'</div>';
  html+='</div></div>';
  timelineRows.set(s.id,{signature,html,layout:appState.session.rowLayouts.get(s.id)});
  descriptors.push({key:'state:'+s.id,html});
 }
 if(!appState.session.visibleStates.length)descriptors.push({key:'empty',html:'<div class="empty">没有匹配的国家、君主或事件。请修改关键词或国家筛选。</div>'});
 descriptors.push({key:'cursor',html:'<div class="cursorline"><span class="cursorBadge"></span></div>',update:line=>{line.style.left=(x(appState.conditions.cursor)+labelWidth())+'px';line.firstChild.textContent=fmt(appState.conditions.cursor).replace(/年$/,'');}});
 reconcileTimeline(descriptors);vp.scrollLeft=oldScroll;$('#zoomLabel').textContent=Number(appState.layout.px.toFixed(1))+' px / 年';$('#filterCount').textContent=new Set([...appState.conditions.selected,...appState.layout.pinned]).size;
 $('#stats').innerHTML=[[D.states.length,'国家与王室'],[D.states.reduce((n,s)=>n+s.rulers.length,0),'在位区间'],[D.events.length,'精选事件']].map(([n,t])=>'<div class="number"><b>'+n+'</b><span>'+t+'</span></div>').join('');
 updateRange();pageEffects.renderPanels();notifyViewChanged();
}
function updateRange(){const left=Math.min(timelineBounds.start,Math.max(appState.conditions.end,timelineBounds.start-Math.floor(vp.scrollLeft/appState.layout.px)));const right=Math.max(appState.conditions.end,timelineBounds.start-Math.floor((vp.scrollLeft+vp.clientWidth-labelWidth())/appState.layout.px));$('#visibleRange').textContent='可见：'+range(left,right)+' · '+appState.session.visibleStates.length+'行';notifyViewChanged();}
function setCursor(y,scroll=false){appState.conditions.cursor=Math.round(Math.min(timelineBounds.start,Math.max(appState.conditions.end,y)));$('#cursorYear').value=0-appState.conditions.cursor;$('#cursorOutput').textContent=fmt(appState.conditions.cursor);$('#selectionYear').textContent='年份参考线：'+fmt(appState.conditions.cursor);$('#compareTitle').textContent=fmt(appState.conditions.cursor)+'的列国';const line=$('.cursorline');if(line){line.style.left=(x(appState.conditions.cursor)+labelWidth())+'px';line.firstChild.textContent=fmt(appState.conditions.cursor).replace(/年$/,'');}updateCompare();if(scroll)vp.scrollLeft=Math.max(0,x(appState.conditions.cursor)-(vp.clientWidth-labelWidth())/2);notifyViewChanged();}
function updateCompare(){
 $('#compare').innerHTML=historyService.compareYear(appState.conditions.cursor,appState.session.visibleStates.map(s=>s.id)).map(({state:s,interruption:gap,rulers,events:es})=>{
  return '<button class="comparecard '+(activeEvent()?.states.includes(s.id)?'eventRelated':'')+'" data-action="state" data-id="'+s.id+'" style="--statecolor:'+s.color+'"><strong>'+s.name+'</strong><span>'+ (gap?escapeHTML(gap.note):rulers.length?rulers.map(r=>(r.approx?'约 · ':'')+escapeHTML(r.name)).join(' / '):'君主纪年待考')+'</span><small>'+ (es.length?escapeHTML(es.map(e=>e.name).join('；')):'该年无已收录大事')+'</small></button>';
 }).join('')||'<p class="notice">该年没有符合当前筛选的国家。</p>';
}
