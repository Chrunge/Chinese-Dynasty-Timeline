function setPeriod(name){
 document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',b.dataset.period===name));
 const width=vp.clientWidth-labelWidth()-65;
 const period=timelinePeriods.find(p=>p.id===name);if(name!=='all'&&!period)return;const a=period?Math.min(timelineBounds.start,period.start):timelineBounds.start,b=period&&!period.extendToViewEnd?Math.max(appState.conditions.end,period.end):appState.conditions.end;if(a<b)return;
 appState.layout.px=Math.max(.8,Math.min(24,width/(a-b+1)));render();vp.scrollLeft=Math.max(0,x(a));setCursor(a,false);
}
function isIntervalEvent(e){return Zhou.Time.isYear(e?.endYear)&&e.endYear!==e.year&&e.year>=e.endYear;}
function eventDateLabel(e){return isIntervalEvent(e)?range(e.year,e.endYear):fmt(e.year);}
function eventReferenceYear(e){return isIntervalEvent(e)&&e.year>=appState.conditions.cursor&&appState.conditions.cursor>=e.endYear?appState.conditions.cursor:e.year;}
function packRulers(s){const packed=Zhou.Presentation.pack(historyService.rulersInRange(s,timelineBounds.start,appState.conditions.end),timelineBounds.start,appState.conditions.end);return {rulers:packed.items,lanes:packed.lanes};}
function stateRowLabel(s){const pinned=appState.layout.pinned.has(s.id);return '<div class="memberLabel"><button class="stateName" data-action="state" data-id="'+s.id+'" style="color:'+s.color+'" title="'+escapeHTML(s.name)+'" aria-label="'+escapeHTML(s.display?.shortName||s.name)+' · 查看'+escapeHTML(s.name)+'的历史">'+escapeHTML(s.display?.shortName||s.name)+'</button><button class="pinState '+(pinned?'isPinned':'')+'" data-action="pin" data-id="'+s.id+'" aria-pressed="'+pinned+'" aria-label="钉 · '+(pinned?'取消固定':'固定')+escapeHTML(s.name)+'" title="'+(pinned?'取消固定':'固定到上方，接续分段共用主行')+'">钉</button></div>';}
Zhou.EventSemantics={glyph(kind){const icon=Zhou.Presentation.eventIcon(kind);return '<svg class="eventKindIcon eventKind-'+icon.token+'" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="'+icon.path+'"></path></svg>';}};
function eventMarkerWidth(group,level){
 const event=group.find(e=>e.key)||group.find(e=>e.id===appState.session.activeEventId)||group[0],expanded=level==='detail'||group.some(e=>e.key),kinds=Zhou.Presentation.eventKinds(group).length;
 const icons=kinds*12+Math.max(0,kinds-1),count=group.length>1?String(group.length).length*7+5:0,label=expanded?Array.from(Zhou.Presentation.eventLabel(event)).length*(level==='detail'?14:12)+3:0;
 return Math.max(36,Math.min(210,icons+12+11+count+label));
}
const reconcileTimeline=Zhou.createTimelineDOM(chart,document),timelineRows=new Map();
let timelineAxis={signature:null,html:''};
const eventInterest={hover:null,focus:null};
function eventRelationHTML(){
 const ids=(eventInterest.focus||eventInterest.hover||appState.session.activeEventId||'').split(',');
 const selected=ids.map(id=>D.events.find(e=>e.id===id)).filter(e=>e&&Zhou.Time.isYear(e.year));
 const viewportRect=vp.getBoundingClientRect?.(),chartRect=chart.getBoundingClientRect?.();
 const nodes=new Map(Array.from(chart.children||[]).filter(n=>n.dataset?.row).map(n=>[n.dataset.row,n]));
 const links=Zhou.Presentation.eventLinks(selected,appState.session.visibleRows||[],{position:e=>x(Math.min(timelineBounds.start,Math.max(appState.conditions.end,eventReferenceYear(e))))+labelWidth(),rowPosition:row=>{
  const layout=appState.session.rowLayouts.get(row.members[0].id),rect=nodes.get(row.key)?.getBoundingClientRect?.();
  if(rect&&viewportRect&&chartRect){const top=Math.max(rect.top,viewportRect.top+64),bottom=Math.min(rect.bottom,viewportRect.bottom);return bottom>top?(top+bottom)/2-chartRect.top:null;}
  if(!layout)return null;const top=64+layout.offset,bottom=top+layout.height,viewTop=vp.scrollTop+64,viewBottom=vp.scrollTop+(vp.clientHeight||appState.layout.viewHeight);
  return bottom>viewTop&&top<viewBottom?(Math.max(top,viewTop)+Math.min(bottom,viewBottom))/2:null;
 }});
 return links.filter(link=>link.points.length).map(link=>{
  const first=link.points[0].y,last=link.points.at(-1).y,summary=link.event.name+' · '+link.points.flatMap(p=>p.states.map(id=>byId(id)?.name||id)).join('、')+(link.hidden.length?' · '+link.hidden.length+'个相关政权未显示':' · 相关政权均已显示');
  return '<div class="eventRelation" data-event-id="'+escapeHTML(link.event.id)+'" data-hidden-count="'+link.hidden.length+'">'+(last>first?'<span class="eventRelationStem" aria-hidden="true" style="left:'+link.left+'px;top:'+first+'px;height:'+(last-first)+'px"></span>':'')+link.points.map(p=>'<span class="eventRelationDot" aria-hidden="true" style="left:'+link.left+'px;top:'+p.y+'px"></span>').join('')+'<span class="eventRelationHint" style="left:'+(link.left+7)+'px;top:'+Math.max(64,first-21)+'px">'+escapeHTML(summary)+'</span></div>';
 }).join('');
}
function syncEventRelations(){const layer=chart.querySelector?.('.eventRelations')||document.querySelector('.eventRelations');if(layer){layer.style.left=(0-x(appState.conditions.cursor)-labelWidth())+'px';layer.style.width=chart.style.width;const html=eventRelationHTML();if(layer.innerHTML!==html)layer.innerHTML=html;}}
function interestTarget(target){return target?.closest?.('[data-event-ids]');}
chart.addEventListener('pointerover',event=>{const marker=interestTarget(event.target);if(marker){eventInterest.hover=marker.dataset.eventIds;syncEventRelations();}});
chart.addEventListener('pointerout',event=>{const marker=interestTarget(event.target);if(marker&&marker!==interestTarget(event.relatedTarget)){eventInterest.hover=interestTarget(event.relatedTarget)?.dataset.eventIds||null;syncEventRelations();}});
chart.addEventListener('focusin',event=>{const marker=interestTarget(event.target);if(marker){eventInterest.focus=marker.dataset.eventIds;syncEventRelations();}});
chart.addEventListener('focusout',event=>{const marker=interestTarget(event.target);if(marker&&marker!==interestTarget(event.relatedTarget)){eventInterest.focus=interestTarget(event.relatedTarget)?.dataset.eventIds||null;syncEventRelations();}});
chart.addEventListener('click',event=>{const capsule=event.target?.closest?.('[data-undated-state]');if(!capsule)return;event.preventDefault();showState(capsule.dataset.undatedState);const section=document.getElementById?.('undated-lineage');section?.focus?.({preventScroll:true});section?.scrollIntoView?.({block:'center'});});
vp.addEventListener('scroll',syncEventRelations,{passive:true});
function renderTrajectoryLayer(){
 const activeId=appState.session.activePersonId;
 if(!activeId)return '';
 const p=historyService.person(activeId)||(D.people||[]).find(x=>x.id===activeId);
 if(!p)return '';
 const pts=Zhou.Biography?.getTrajectoryPoints(p,appState.session.rowLayouts,x,labelWidth())||[];
 if(!pts.length)return '';

 const pathD=Zhou.Biography.buildTrajectoryPath(pts);
 const w=Math.max(chart.clientWidth||0,Math.round((timelineBounds.start-appState.conditions.end+1)*appState.layout.px+labelWidth()+160));
 const h=chart.clientHeight||800;

 let svg='';
 if(pathD){
  svg='<svg class="trajectorySvg" viewBox="0 0 '+w+' '+h+'" style="position:absolute;left:0;top:0;width:'+w+'px;height:'+h+'px;pointer-events:none;z-index:3;" aria-hidden="true">'+
   '<path d="'+pathD+'" class="trajectoryGlowPath" />'+
   '<path d="'+pathD+'" class="trajectoryPath" />'+
   '</svg>';
 }

 const badges=pts.map(pt=>{
  const symbol=['①','②','③','④','⑤','⑥'][pt.seq-1]||String(pt.seq);
  return '<button type="button" class="trajectoryBadge" data-action="bioChapter" data-id="'+pt.year+':'+escapeHTML(pt.polityId)+':'+pt.seq+'" data-year="'+pt.year+'" data-polity-id="'+escapeHTML(pt.polityId)+'" data-chapter-no="'+pt.seq+'" style="left:'+pt.x+'px;top:'+pt.y+'px" title="'+escapeHTML('第'+pt.seq+'阶段 · '+pt.label+'（'+fmt(pt.year)+'）')+'" aria-label="'+escapeHTML('第'+pt.seq+'阶段 · '+pt.label)+'">'+
   '<span class="trajectoryNum">'+symbol+'</span>'+
   '<span class="trajectoryLabel">'+escapeHTML(pt.kindLabel||pt.label)+'</span>'+
   '</button>';
 }).join('');

 return '<div class="trajectoryLayer" style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:3;">'+svg+badges+'</div>';
}
function render(){
 const oldScroll=vp.scrollLeft,w=(timelineBounds.start-appState.conditions.end+1)*appState.layout.px+160,level=densityLevel(),focused=activeEvent();
 const motifEntities=Zhou.Biography?.getMatchingEntities(appState.conditions.motif,D)||{active:false};
 const ordered=appState.layout.stateOrder.map(byId).filter(Boolean);
 // Domain selection remains polity IDs. A display group is never a query identity.
 appState.session.visibleStates=[...ordered.filter(s=>appState.layout.pinned.has(s.id)),...ordered.filter(s=>!appState.layout.pinned.has(s.id)&&(appState.search.query&&appState.search.searchScope==='all'||appState.conditions.selected.has(s.id))&&matches(s))];
 const rows=Zhou.Presentation.rows(appState.session.visibleStates,D.presentation,appState.layout.pinned);
 appState.session.visibleRows=rows;
 const fitHeight=Math.max(36,Math.min(160,Math.floor(((vp.clientHeight||appState.layout.viewHeight)-64)/Math.max(1,rows.length))));
 $('#rowHeightValue').textContent=(appState.layout.fitRows?fitHeight:appState.layout.rowHeight)+'px';
 chart.style.width=(w+labelWidth())+'px';chart.className=(appState.layout.mode==='overview'?'overview ':'')+'density-'+level+(focused?' hasFocus':'');
 $('#densityHint').textContent=(level==='overview'?'远景：兴亡与关键事件':level==='standard'?'中景：君主姓名与事件摘要':'近景：君主姓名、在位年份与具体事件')+(D.presentation?.rowGroups?.length?' · 接续政权分段共用主行，同年重叠分层；并存政权另行。':'');
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
 const rowSignature=JSON.stringify([appState.conditions.end,appState.layout.px,level,appState.layout.mode,appState.conditions.category,appState.search.query,appState.search.searchDescriptions,appState.search.searchTarget,appState.session.activeEventId,appState.conditions.motif]);
 let events;
 for(const row of rows){
  const members=row.members,grouped=row.grouped,isPinned=row.pinned,related=members.some(s=>focused?.states.includes(s.id));
  const requested=Math.max(...members.map(s=>Number(appState.layout.rowHeights[s.id])||(appState.layout.fitRows?fitHeight:appState.layout.rowHeight)));
  const signature=rowSignature+JSON.stringify([members.map(s=>s.id),requested,isPinned,isPinned?pinTop:0,members.map(s=>appState.layout.pinned.has(s.id))]),cached=timelineRows.get(row.key);
  if(cached?.signature===signature){for(const s of members)appState.session.rowLayouts.set(s.id,{...cached.layout,offset:rowOffset});rowOffset+=cached.layout.height;descriptors.push({key:row.key,html:cached.html});if(isPinned)pinTop+=cached.layout.height;continue;}
  const records=members.flatMap(s=>historyService.rulersInRange(s,timelineBounds.start,appState.conditions.end).map(r=>({...r,stateId:s.id})));
  const single=grouped?null:packRulers(members[0]);
  const basePacked=grouped?Zhou.Presentation.pack(records,timelineBounds.start,appState.conditions.end):{lanes:single.lanes,items:single.rulers.map(r=>({...r,stateId:members[0].id}))},segments=Zhou.Presentation.pack(members,timelineBounds.start,appState.conditions.end);
   const packed=Zhou.Presentation.tenureSlots(basePacked.items,{order:records,position:r=>x(Math.min(timelineBounds.start,r.start)),scale:appState.layout.px,measure:r=>(Math.min(timelineBounds.start,r.start)-Math.max(r.end,appState.conditions.end)+1)*appState.layout.px,limit:w});
  const rulerVisible=level!=='overview'&&(appState.layout.mode==='both'||appState.layout.mode==='rulers'),eventVisible=appState.layout.mode==='both'||appState.layout.mode==='events'||level==='overview'&&appState.layout.mode!=='overview';
  const undatedMembers=members.filter(s=>s.undated?.length&&s.start>=appState.conditions.end&&s.start<=timelineBounds.start);
   // Extra micro-slots may reuse the compact row's unused 4px top inset;
   // the 18px capsule and physical ruler borders still never overlap.
   const compactSlots=!grouped&&rulerVisible&&undatedMembers.length&&packed.lanes>basePacked.lanes&&requested<=64;
   const capsuleBase=grouped?segments.lanes*22+6:undatedMembers.length&&(level==='overview'||appState.layout.mode==='overview')?26:compactSlots?2:6,lanes=rulerVisible?packed.lanes:1,rulerTop=capsuleBase+undatedMembers.length*22;
  const eventReserve=packed.lanes>basePacked.lanes?20:21;
   const minBarHeight=packed.items.some(r=>r.polityAssociation==='contextual'||r.dating?.level==='disputed')?4:2;
  const height=Math.max(36,Math.min(160,requested),undatedMembers.length?rulerTop+(eventVisible?eventReserve:0):0,rulerVisible?rulerTop+Math.max(8,lanes*(minBarHeight+1))+(eventVisible?eventReserve:6):0,grouped?Math.max(38+members.length*23,rulerTop+(rulerVisible?lanes*19:0)+(eventVisible?27:12)):0);
  const bandHeight=Math.max(8,height-rulerTop-(eventVisible?eventReserve:6)),barHeight=Math.max(.5,Math.min(44,bandHeight/lanes-1)),eventTop=height-eventReserve;
  const eventAreaTop=Math.min(eventTop,Math.max(grouped?rulerTop:26,rulerTop)),rulerObstacles=[];
  const layout={height,eventTop,eventAreaTop,lanes,barHeight,level,pinned:isPinned,rowKey:row.key,offset:rowOffset};
  for(const s of members)appState.session.rowLayouts.set(s.id,layout);
  rowOffset+=height;
  let html='<div class="stateRow '+(grouped?'groupedRow ':'')+(isPinned?'pinnedRow ':'')+(related?'eventRelated ':focused?'eventDim ':'')+'" data-state="'+members[0].id+'" data-row="'+row.key+'" style="height:'+height+'px;min-height:0;'+(isPinned?'position:sticky;top:'+pinTop+'px;z-index:10;':'')+'"><div class="stateLabel">'+(grouped?'<strong class="rowGroupTitle" title="'+escapeHTML(row.note)+'">'+row.name+'<small>重叠分层</small></strong>':'')+members.map(stateRowLabel).join('')+'</div><div class="track" style="width:'+w+'px;height:'+height+'px;min-height:0;background-size:'+(step*appState.layout.px)+'px 100%;background-position:'+x(Math.floor(timelineBounds.start/step)*step)+'px 0">';
  if(isPinned)pinTop+=height;
  if(grouped){
   for(const s of segments.items){const start=Math.min(timelineBounds.start,s.start),end=Math.max(s.end,appState.conditions.end);html+='<button class="politySegment" data-action="state" data-id="'+s.id+'" style="left:'+x(start)+'px;width:'+Math.max(2,(start-end+1)*appState.layout.px)+'px;top:'+(s.displayLane*22+3)+'px;background:'+s.color+'" title="'+escapeHTML(s.name+' · '+range(s.start,s.end))+'" aria-label="'+escapeHTML((s.display?.shortName||s.name)+' · '+s.name+'，'+range(s.start,s.end))+'">'+escapeHTML(s.display?.shortName||s.name)+'</button>';}
  }else{
   const s=members[0];let life=[{start:s.start,end:Math.max(s.end,appState.conditions.end)}];
   for(const gap of s.interruptions)life=life.flatMap(seg=>gap.start<=seg.start&&gap.end>=seg.end?[{start:seg.start,end:gap.start+1},{start:gap.end-1,end:seg.end}]:[seg]);
   for(const seg of life){if(seg.start<appState.conditions.end)continue;html+='<div class="lifeline '+(s.approxStart?'uncertainLife':'')+'" style="left:'+x(seg.start)+'px;width:'+Math.max(0,(seg.start-seg.end+1)*appState.layout.px)+'px;background:'+s.color+'"></div>';}
   if(level==='overview'||appState.layout.mode==='overview'){if(s.start>=appState.conditions.end)html+='<button class="lifeStart" data-action="state" data-id="'+s.id+'" style="left:'+x(s.start)+'px" title="'+escapeHTML(s.name+'起点 '+range(s.start,s.start,s.approxStart))+'">'+(s.approxStart?'约 ':'')+fmt(s.start).replace(/年$/,'')+' '+escapeHTML(s.startLabel||'起点')+'</button>';}
  }
  undatedMembers.forEach((s,index)=>{html+='<button type="button" class="event undatedCapsule" data-action="undated" data-id="'+s.id+'" data-undated-state="'+s.id+'" style="left:'+(x(s.start)+8)+'px;top:'+(capsuleBase+index*22)+'px" title="'+escapeHTML(s.name+' · '+s.undated.length+'项未定年君主或前期领袖，非定年条带；打开世系区')+'" aria-label="'+escapeHTML('未定年世系 · '+s.undated.length+' · '+s.name+' · 查看'+s.undated.length+'项未定年世系')+'">未定年世系 · '+s.undated.length+'</button>';});
   if(related)html+='<div class="eventYearShade" style="left:'+(x(eventReferenceYear(focused))-4)+'px;width:'+Math.max(9,appState.layout.px)+'px" aria-hidden="true"></div>';
  if(rulerVisible){
   for(const r of packed.items){
    const s=byId(r.stateId);if(s.interruptions.some(g=>r.start<=g.start&&r.end>=g.end))continue;
    const width=r.visualWidth,left=r.visualLeft,isCurrent=related&&rulersAt(s,eventReferenceYear(focused)).some(v=>v.id===r.id),slotNote=r.subyearSlot?'同年展示次序 '+r.slotOrder+'/'+r.slotCount+'；仅像素微槽，未推定年内月日或继承关系。':'';
    // CSS border-box cannot shrink below padding + borders, even on short reigns.
    const borderSize=r.polityAssociation==='contextual'||r.dating?.level==='disputed'?4:2;
    rulerObstacles.push({left,right:left+Math.max(10+borderSize,width),top:rulerTop+r.displayLane*(barHeight+1),bottom:rulerTop+r.displayLane*(barHeight+1)+Math.max(borderSize,barHeight)});
    const label=Zhou.Presentation.rulerLabel(r),labelNeeded=(label.length+(r.dating?.level!=='certain'?1:0))*14+14;
    let text='';
    if(width>=labelNeeded&&barHeight>=14){text='<span class="rulerName">'+escapeHTML(label)+(r.dating?.level!=='certain'?' · '+certaintyShort[r.dating?.level||'inferred']:'')+'</span>';if(level==='detail'&&width>=110&&barHeight>=30)text+=' <small class="rulerYears">'+range(r.start,r.end,r.approx)+'</small>';else if(level==='detail'&&width>=labelNeeded+145)text+=' <small class="rulerYears inlineYears">'+range(r.start,r.end,r.approx)+'</small>';}
    if(r.subyearSlot&&barHeight>=10&&!text)text='<span class="slotNumber">'+r.slotOrder+'</span>';
     const visibleText=r.subyearSlot&&text.includes('slotNumber')?String(r.slotOrder):text?label+(r.dating?.level!=='certain'?' · '+certaintyShort[r.dating?.level||'inferred']:'')+(text.includes('rulerYears')?' '+range(r.start,r.end,r.approx):''):'';
     const accessible=[visibleText,r.name,r.role,range(r.start,r.end,r.approx),r.associationNote,slotNote,'生平与来源见点击详情',certaintyLabel[r.dating?.level||'inferred']].filter(Boolean).join(' · ');
    if(r.subyearSlot&&left!==r.anchor)html+='<span class="tenureSlotConnector" aria-hidden="true" style="left:'+Math.min(left,r.anchor)+'px;top:'+(rulerTop+r.displayLane*(barHeight+1)+barHeight/2)+'px;width:'+Math.abs(left-r.anchor)+'px"></span>';
     const isMotifRuler=motifEntities.active&&motifEntities.tenureIds.has(r.id);
     const rulerMatchesSearch=appState.search.query&&matchRuler(r);
     const rulerIsTarget=appState.search.searchTarget==='ruler:'+r.id;
     const isRulerDimmed=(appState.search.query&&!rulerMatchesSearch&&!rulerIsTarget)||(motifEntities.active&&!isMotifRuler&&!rulerMatchesSearch&&!rulerIsTarget);
     const rulerOpacity=isRulerDimmed?'.35':'.94';
     html+='<button class="ruler '+(r.subyearSlot?'subyearSlot ':'')+(r.polityAssociation==='contextual'?'contextualTenure ':'')+(r.approx?'approx ':'')+(r.dating?.level==='inferred'?'inferredBar ':'')+(r.dating?.level==='disputed'?'disputedBar ':'')+(rulerIsTarget||rulerMatchesSearch?'match ':'')+(isMotifRuler?'motifMatch ':'')+(isCurrent?'eventRuler':'')+'" data-action="ruler" data-id="'+r.id+'" data-state-id="'+s.id+'"'+(r.subyearSlot?' data-slot-order="'+r.slotOrder+'" data-slot-count="'+r.slotCount+'" data-anchor="'+r.anchor+'"':'')+' style="left:'+left+'px;width:'+width+'px;top:'+(rulerTop+r.displayLane*(barHeight+1))+'px;height:'+barHeight+'px;line-height:'+Math.min(18,barHeight)+'px;background-color:'+s.color+';opacity:'+rulerOpacity+'" title="'+escapeHTML(accessible)+'" aria-label="'+escapeHTML(accessible)+'">'+text+'</button>';
   }
   if(!grouped){const s=members[0],first=packed.items.reduce((a,r)=>Math.max(a,r.start),-Infinity);if(!s.undated?.length&&Number.isFinite(first)&&first<s.start&&x(first)-x(s.start)>90)html+='<button class="event gap" data-action="state" data-id="'+s.id+'" style="left:'+(x(s.start)+8)+'px;top:6px">早期纪年待考</button>';}
  }
  if(eventVisible){
   events??=historyService.eventsInRange({from:timelineBounds.start,to:appState.conditions.end,states:appState.session.visibleStates.map(state=>state.id),category:appState.conditions.category});
   const es=events.filter(e=>members.some(s=>e.states.includes(s.id))).filter(e=>(level!=='overview'||e.key||e.id===appState.session.activeEventId||appState.search.query&&matchEvent(e))&&(e.id===appState.session.activeEventId||!appState.search.query||matchEvent(e)||members.some(s=>containsSearch(countryAliases(s))))).sort((a,b)=>b.year-a.year);
   const eventLayout=Zhou.Presentation.events(es,{position:e=>x(Math.min(timelineBounds.start,e.year)),extent:e=>isIntervalEvent(e)?(Math.min(timelineBounds.start,e.year)-Math.max(appState.conditions.end,e.endYear)+1)*appState.layout.px:null,measure:e=>eventMarkerWidth([e],level),measureGroup:group=>eventMarkerWidth(group,level),top:eventAreaTop,bottom:eventTop,focusedId:appState.session.activeEventId,obstacles:rulerObstacles});
   layout.eventLanes=eventLayout.lanes;
   for(const marker of eventLayout.groups){
    const group=marker.events,ev=group.find(e=>e.key)||group.find(e=>e.id===appState.session.activeEventId)||group[0],highlight=group.some(e=>e.id===appState.session.activeEventId),kinds=Zhou.Presentation.eventKinds(group),key=group.some(e=>e.key),interval=group.length===1&&isIntervalEvent(ev),expanded=level==='detail'||key||interval&&marker.width>=90,ids=group.map(e=>e.id).join(',');
    const certainty=certaintyShort[ev.dating?.level||'inferred'],label=Zhou.Presentation.eventLabel(ev),visibleLabel=[certainty,expanded?label:'',group.length>1?String(group.length):''].filter(Boolean).join(' ');
    const title=group.map(e=>eventDateLabel(e)+(isIntervalEvent(e)?' · 区间事件':'')+' · '+e.kind+' · '+e.name+' · '+certaintyLabel[e.dating?.level||'inferred']).join('；');
    const isMotifEvent=motifEntities.active&&group.some(e=>motifEntities.eventIds.has(e.id));
    const isEventDimmed=(appState.search.query&&!matchEvent(ev))||(motifEntities.active&&!isMotifEvent);
    const eventOpacityStyle=isEventDimmed?'opacity:.35;':'';
    html+='<button class="event semanticEvent '+(interval?'intervalEvent '+(ev.year>timelineBounds.start?'intervalClippedStart ':'')+(ev.endYear<appState.conditions.end?'intervalClippedEnd ':''):'')+'date-'+(ev.dating?.level||'inferred')+' '+(group.length>1?'cluster ':'')+(key?'keyEvent ':'')+(!expanded?'compactEvent ':'')+(highlight?'linkedEvent ':'')+(isMotifEvent?'motifEvent ':'')+'" data-action="'+(group.length>1?'cluster':'event')+'" data-id="'+ids+'" data-event-ids="'+ids+'" data-event-kinds="'+kinds.map(kind=>Zhou.Presentation.eventIcon(kind).token).join(' ')+'" data-event-lane="'+marker.lane+'"'+(interval?' data-interval-start="'+ev.year+'" data-interval-end="'+ev.endYear+'"':'')+' style="left:'+marker.left+'px;top:'+marker.top+'px;width:'+marker.width+'px;max-width:'+marker.width+'px;'+eventOpacityStyle+'" title="'+escapeHTML(title)+'" aria-label="'+escapeHTML(visibleLabel+' · '+(group.length>1?group.length+'条事件，':'')+'类别：'+kinds.join('、')+'；'+title)+'"><span class="eventKindIcons" aria-hidden="true">'+kinds.map(kind=>Zhou.EventSemantics.glyph(kind)).join('')+'</span><span class="eventCertainty">'+certainty+' </span>'+(expanded?'<span class="eventShortTitle">'+escapeHTML(label)+' </span>':'')+(group.length>1?'<span class="eventCount">'+group.length+'</span>':'')+'</button>';
   }
  }
  if(!grouped){const s=members[0];if(s.end>=appState.conditions.end)html+='<button class="event termination" data-action="state" data-id="'+s.id+'" style="left:'+x(s.end)+'px;top:6px;height:'+Math.max(20,height-12)+'px">'+(s.approxEnd?'约 ':'')+fmt(s.end).replace(/年$/,'')+' '+escapeHTML(s.endLabel||'终止')+'</button>';else if(s.continuationNote&&appState.conditions.end===timelineBounds.end)html+='<div class="gap" style="left:'+(x(timelineBounds.end)+8)+'px">'+escapeHTML(s.continuationNote)+'</div>';}
  html+='</div></div>';
  timelineRows.set(row.key,{signature,html,layout});descriptors.push({key:row.key,html});
 }
 if(!appState.session.visibleStates.length)descriptors.push({key:'empty',html:'<div class="empty">没有匹配的国家、君主或事件。请修改关键词或国家筛选。</div>'});
 const trajHtml=renderTrajectoryLayer();
 if(trajHtml)descriptors.push({key:'trajectory',html:trajHtml});
 descriptors.push({key:'cursor',html:'<div class="cursorline"><button type="button" class="cursorHandle" aria-label="拖动年份参考线，可用左右方向键逐年调整"></button><div class="eventRelations" aria-live="polite" aria-atomic="true"></div></div>',update:line=>{line.style.left=(x(appState.conditions.cursor)+labelWidth())+'px';line.firstChild.textContent=fmt(appState.conditions.cursor).replace(/年$/,'');line.firstChild.setAttribute?.('data-year',line.firstChild.textContent);line.firstChild.setAttribute?.('aria-label',line.firstChild.textContent+' · 拖动年份参考线，可用左右方向键逐年调整');}});
 reconcileTimeline(descriptors);vp.scrollLeft=oldScroll;syncEventRelations();$('#zoomLabel').textContent=Number(appState.layout.px.toFixed(1))+' px / 年';$('#filterCount').textContent=new Set([...appState.conditions.selected,...appState.layout.pinned]).size;
 $('#stats').innerHTML=[[D.states.length,'国家与王室'],[D.states.reduce((n,s)=>n+s.rulers.length,0),'在位区间'],[D.events.length,'精选事件']].map(([n,t])=>'<div class="number"><b>'+n+'</b><span>'+t+'</span></div>').join('');
 updateRange();pageEffects.renderPanels();notifyViewChanged();
}
function updateRange(){const left=Math.min(timelineBounds.start,Math.max(appState.conditions.end,timelineBounds.start-Math.floor(vp.scrollLeft/appState.layout.px)));const right=Math.max(appState.conditions.end,timelineBounds.start-Math.floor((vp.scrollLeft+vp.clientWidth-labelWidth())/appState.layout.px));$('#visibleRange').textContent='可见：'+range(left,right)+' · '+(appState.session.visibleRows?.length||0)+'行';notifyViewChanged();}
function setCursor(y,scroll=false){appState.conditions.cursor=Math.round(Math.min(timelineBounds.start,Math.max(appState.conditions.end,y)));$('#cursorYear').value=0-appState.conditions.cursor;$('#cursorOutput').textContent=fmt(appState.conditions.cursor);$('#toolbarCursor').textContent='参考线：'+fmt(appState.conditions.cursor);$('#selectionYear').textContent='年份参考线：'+fmt(appState.conditions.cursor);$('#compareTitle').textContent=fmt(appState.conditions.cursor)+'的列国';const line=$('.cursorline');if(line){line.style.left=(x(appState.conditions.cursor)+labelWidth())+'px';line.firstChild.textContent=fmt(appState.conditions.cursor).replace(/年$/,'');line.firstChild.setAttribute?.('data-year',line.firstChild.textContent);line.firstChild.setAttribute?.('aria-label',line.firstChild.textContent+' · 拖动年份参考线，可用左右方向键逐年调整');}updateCompare();if(scroll)vp.scrollLeft=Math.max(0,x(appState.conditions.cursor)-(vp.clientWidth-labelWidth())/2);notifyViewChanged();syncEventRelations();globalThis.ZhouExperienceHooks?.cursorChanged?.(appState.conditions.cursor);}
function updateCompare(){
 $('#compare').innerHTML=historyService.compareYear(appState.conditions.cursor,appState.session.visibleStates.map(s=>s.id)).map(({state:s,interruption:gap,rulers,events:es})=>{
  return '<button class="comparecard '+(activeEvent()?.states.includes(s.id)?'eventRelated':'')+'" data-action="state" data-id="'+s.id+'" style="--statecolor:'+s.color+'"><strong>'+s.name+'</strong><span>'+ (gap?escapeHTML(gap.note):rulers.length?rulers.map(r=>(r.approx?'约 · ':'')+escapeHTML(r.name)).join(' / '):'君主纪年待考')+'</span><small>'+ (es.length?escapeHTML(es.map(e=>e.name).join('；')):'该年无已收录大事')+'</small></button>';
 }).join('')||'<p class="notice">该年没有符合当前筛选的国家。</p>';
}
