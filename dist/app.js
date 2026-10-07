'use strict';
const D=window.ZHOU_DATA,$=s=>document.querySelector(s),byId=id=>D.states.find(s=>s.id===id);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=y=>'前'+y+'年',range=(a,b,approx=false)=>(approx?'约 ':'')+(a===b?fmt(a):'前'+a+'—'+b+'年');
const links=arr=>'<div class="sourceLinks">'+arr.map(s=>'<a href="'+escapeHTML(s.url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(s.title)+' ↗</a>').join('')+'</div>';
let stateOrder=D.states.map(s=>s.id),rowHeight=64,fitRows=false,viewHeight=560,expanded=false,rowHeights={};
try{const saved=JSON.parse(localStorage.getItem('zhou-layout-v2')||'null');if(saved){const ids=new Set(D.states.map(s=>s.id));if(Array.isArray(saved.order)){stateOrder=[...new Set(saved.order.filter(id=>ids.has(id))),...D.states.map(s=>s.id).filter(id=>!saved.order.includes(id))];}rowHeight=Math.max(36,Math.min(160,Number(saved.rowHeight)||64));viewHeight=Math.max(320,Math.min(1000,Number(saved.viewHeight)||560));fitRows=Boolean(saved.fitRows);rowHeights=saved.rowHeights||{};}}catch{}
function saveLayout(){try{localStorage.setItem('zhou-layout-v2',JSON.stringify({order:stateOrder,rowHeight,viewHeight,fitRows,rowHeights}));}catch{}}
let px=4,end=256,selected=new Set(D.states.map(s=>s.id)),query='',mode='both',category='all',cursor=770,visibleStates=[],rowLayouts=new Map();
let density='auto',pinned=new Set(),activeEventId=null,savedCombos=[];
const builtInCombos=[
 {id:'builtin-seven',name:'战国七雄',states:['qin','qi','chu','yan','han','zhao','liang'],from:475,to:221},
 {id:'builtin-reform',name:'秦—魏变法',states:['qin','liang'],from:453,to:300},
 {id:'builtin-hegemony',name:'晋—楚争霸',states:['jin','chu'],from:700,to:500},
 {id:'builtin-confucius',name:'鲁—卫—齐',states:['lu','wei','qi'],from:600,to:450}
];
try{const p=JSON.parse(localStorage.getItem('zhou-pins-v3')||'[]');if(Array.isArray(p))pinned=new Set(p.filter(id=>byId(id)));const c=JSON.parse(localStorage.getItem('zhou-comparisons-v3')||'[]');if(Array.isArray(c))savedCombos=c.map(normalizeCombo).filter(Boolean).slice(0,30);}catch{}
const vp=$('#viewport'),chart=$('#chart');
const labelWidth=()=>window.matchMedia('(max-width:680px)').matches?88:124;
const x=y=>(1046-y)*px;
const includedEvents=s=>D.events.filter(e=>e.states.includes(s.id)&&e.year>=end&&(category==='all'||e.kind===category));
const matchRuler=(r,q=query)=>[r.name,r.person,r.role,r.description,r.biography?.summary,...(r.ministers||[]).map(m=>m.name+' '+m.summary)].some(t=>String(t??'').includes(q));
const matches=s=>!query||[s.name,s.region].some(t=>t.includes(query))||s.rulers.some(r=>matchRuler(r))||s.undated.some(r=>matchRuler(r))||includedEvents(s).some(e=>[e.name,e.description].some(t=>t.includes(query)));
const densityLevel=()=>density==='overview'?'overview':density==='full'?'detail':px<2.4?'overview':px<7?'standard':'detail';
const activeEvent=()=>D.events.find(e=>e.id===activeEventId);
const certaintyLabel={certain:'较确定',inferred:'推定',disputed:'存在异说'};
const certaintyShort={certain:'定',inferred:'推',disputed:'异'};
function certaintyBadge(d,short=false){const level=d?.level||'inferred';return '<span class="certainty '+level+'" title="'+escapeHTML(d?.reason||'尚待校勘')+'">'+(short?certaintyShort[level]:certaintyLabel[level])+'</span>';}
function datingDetails(d){return '<div class="datingBlock">'+certaintyBadge(d)+'<p class="notice">'+escapeHTML(d?.reason||'纪年依据尚待补充')+'</p>'+(d?.alternatives?.length?'<details class="dateOpinions"><summary>展开不同纪年与口径 · '+d.alternatives.length+'项</summary>'+d.alternatives.map(a=>'<article><b>'+escapeHTML(a.label)+(a.year?' · '+fmt(a.year):'')+'</b><p>'+escapeHTML(a.explanation)+'</p>'+links(a.sources||[])+'</article>').join('')+'</details>':'')+'</div>';}
function chronologyDetails(r){const c=r.chronology||{};return '<div class="chronologyGrid">'+[['实际即位 / 承位',c.accession],['元年 / 图示起点',c.regnalStart??r.start],['退位 / 传位',c.abdication],['去世',c.death]].map(([name,year])=>'<div><span>'+name+'</span><strong>'+(year?fmt(year):'尚未核实 / 未收录')+'</strong></div>').join('')+'</div><p>图示终点：'+fmt(r.end)+' · '+escapeHTML(c.endKind||'具体性质待核实')+'</p>'+(c.changes||[]).map(m=>'<p>'+fmt(m.year)+' · '+escapeHTML(m.label)+'</p>').join('')+(c.note?'<p class="notice">'+escapeHTML(c.note)+'</p>':'')+'<p class="notice">元年是所采用年表的纪年起点；空缺日期不会由图示区间自动推算。去世日期可在本图范围之外。</p>'+links(c.sources||[]);}
function rulersAt(s,year){return s.interruptions.some(g=>year<=g.start&&year>=g.end)?[]:s.rulers.filter(r=>r.start>=year&&r.end<=year);}
function participantCard(p){return '<article class="ministerCard eventPerson"><h5>'+escapeHTML(p.name)+' <span>'+escapeHTML(byId(p.state)?.name||'')+'</span></h5><p class="relation">'+escapeHTML(p.relation)+'</p><p>'+escapeHTML(p.summary)+'</p>'+links(p.sources||[])+'</article>';}
function setPeriod(name){
 document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',b.dataset.period===name));
 const width=vp.clientWidth-labelWidth()-65;
 const spans={all:[1046,end],west:[1046,771],spring:[770,476],war:[475,end]};const [a,b]=spans[name];
 px=Math.max(.8,Math.min(24,width/(a-b+1)));render();vp.scrollLeft=Math.max(0,x(a));setCursor(a,false);
}
function packRulers(s){
 const result=[],ends=[];
 const ordered=s.rulers.filter(r=>r.start>=end&&r.end<=1046).sort((a,b)=>b.start-a.start||a.lane-b.lane);
 for(const r of ordered){let lane=r.lane||0;while(ends[lane]!=null&&r.start>=ends[lane])lane++;ends[lane]=r.end;result.push({...r,displayLane:lane});}
 return {rulers:result,lanes:Math.max(1,ends.length)};
}
function render(){
 const oldScroll=vp.scrollLeft,w=(1046-end+1)*px+160,level=densityLevel(),focused=activeEvent();
 const ordered=stateOrder.map(byId).filter(Boolean);
 visibleStates=[...ordered.filter(s=>pinned.has(s.id)),...ordered.filter(s=>!pinned.has(s.id)&&selected.has(s.id)&&matches(s))];
 const fitHeight=Math.max(36,Math.min(160,Math.floor(((vp.clientHeight||viewHeight)-64)/Math.max(1,visibleStates.length))));
 $('#rowHeightValue').textContent=(fitRows?fitHeight:rowHeight)+'px';
 chart.style.width=(w+labelWidth())+'px';chart.className=(mode==='overview'?'overview ':'')+'density-'+level+(focused?' hasFocus':'');
 $('#densityHint').textContent=level==='overview'?'远景：兴亡与关键事件':level==='standard'?'中景：君主姓名与事件摘要':'近景：君主姓名、在位年份与具体事件';
 const eras=[{a:1046,b:771,name:'西周',color:'#64796d'},{a:770,b:476,name:'春秋',color:'#355e68'},{a:475,b:256,name:'战国',color:'#8d734c'}];
 if(end===221)eras.push({a:255,b:221,name:'周亡后 · 秦统一',color:'#79696a'});
 let html='<div class="axis"><div class="corner">国家 / 年代</div><div class="axisTrack" style="width:'+w+'px">';
 for(const era of eras)html+='<div class="era" style="left:'+x(era.a)+'px;width:'+((era.a-era.b+1)*px)+'px;background:'+era.color+'">'+era.name+'</div>';
 const step=px>=12?5:px>=5?10:px>=2?25:50;
 for(let year=1050;year>=end;year-=step){if(year<=1046)html+='<div class="tick" style="left:'+x(year)+'px">前'+year+'</div>';}
 html+='</div></div>';
 rowLayouts=new Map();let pinTop=64;
 for(const s of visibleStates){
  const packed=packRulers(s),rulerVisible=level!=='overview'&&(mode==='both'||mode==='rulers'),eventVisible=mode==='both'||mode==='events'||level==='overview'&&mode!=='overview';
  const height=Math.max(36,Math.min(160,Number(rowHeights[s.id])||(fitRows?fitHeight:rowHeight))),isPinned=pinned.has(s.id),related=focused?.states.includes(s.id);
  const lanes=rulerVisible?packed.lanes:1,rulerTop=6,bandHeight=Math.max(8,height-(eventVisible?27:12)),barHeight=Math.max(.5,Math.min(44,bandHeight/lanes-1)),eventTop=height-21;
  rowLayouts.set(s.id,{height,eventTop,lanes,barHeight,level,pinned:isPinned});
  html+='<div class="stateRow '+(isPinned?'pinnedRow ':'')+(related?'eventRelated ':focused?'eventDim ':'')+'" data-state="'+s.id+'" style="height:'+height+'px;min-height:0;'+(isPinned?'position:sticky;top:'+pinTop+'px;z-index:10;':'')+'"><div class="stateLabel"><button class="stateName" data-action="state" data-id="'+s.id+'" style="color:'+s.color+'" aria-label="查看'+s.name+'的历史">'+s.name+'</button><button class="pinState '+(isPinned?'isPinned':'')+'" data-action="pin" data-id="'+s.id+'" aria-pressed="'+isPinned+'" aria-label="'+(isPinned?'取消固定':'固定')+s.name+'" title="'+(isPinned?'取消固定':'固定到上方，滚动时保持可见')+'">钉</button></div><div class="track" style="width:'+w+'px;height:'+height+'px;min-height:0;background-size:'+(step*px)+'px 100%;background-position:'+x(Math.floor(1046/step)*step)+'px 0">';
  if(isPinned)pinTop+=height;
  let segments=[{start:s.start,end:Math.max(s.end,end)}];
  for(const gap of s.interruptions)segments=segments.flatMap(seg=>gap.start<=seg.start&&gap.end>=seg.end?[{start:seg.start,end:gap.start+1},{start:gap.end-1,end:seg.end}]:[seg]);
  for(const seg of segments){if(seg.start<end)continue;html+='<div class="lifeline '+(s.approxStart?'uncertainLife':'')+'" style="left:'+x(seg.start)+'px;width:'+Math.max(0,(seg.start-seg.end+1)*px)+'px;background:'+s.color+'"></div>';}
  if(level==='overview'||mode==='overview'){
   if(s.start>=end)html+='<button class="lifeStart" data-action="state" data-id="'+s.id+'" style="left:'+x(s.start)+'px" title="'+escapeHTML(s.name+'起点 '+range(s.start,s.start,s.approxStart))+'">'+(s.approxStart?'约 ':'')+'前'+s.start+' '+(s.id==='yue'?'起源示意':'起点')+'</button>';
  }
  if(related)html+='<div class="eventYearShade" style="left:'+(x(focused.year)-4)+'px;width:'+Math.max(9,px)+'px" aria-hidden="true"></div>';
  if(rulerVisible){
   for(const r of packed.rulers){
    if(s.interruptions.some(g=>r.start<=g.start&&r.end>=g.end))continue;
    const width=Math.max(2,(r.start-Math.max(r.end,end)+1)*px),isCurrent=related&&r.start>=focused.year&&r.end<=focused.year;
    const labelNeeded=(r.name.length+(r.dating?.level!=='certain'?1:0))*14+14;
    let text='';
    if(width>=labelNeeded&&barHeight>=14){text='<span class="rulerName">'+escapeHTML(r.name)+(r.dating?.level!=='certain'?' · '+certaintyShort[r.dating?.level||'inferred']:'')+'</span>';if(level==='detail'&&width>=110&&barHeight>=30)text+='<small class="rulerYears">'+range(r.start,r.end,r.approx)+'</small>';else if(level==='detail'&&width>=labelNeeded+145)text+='<small class="rulerYears inlineYears">'+range(r.start,r.end,r.approx)+'</small>';}
    html+='<button class="ruler '+(r.approx?'approx ':'')+(r.dating?.level==='disputed'?'disputedBar ':'')+(query&&matchRuler(r)?'match ':'')+(isCurrent?'eventRuler':'')+'" data-action="ruler" data-id="'+r.id+'" style="left:'+x(r.start)+'px;width:'+width+'px;top:'+(rulerTop+r.displayLane*(barHeight+1))+'px;height:'+barHeight+'px;line-height:'+Math.min(18,barHeight)+'px;background-color:'+s.color+';opacity:'+(query&&!matchRuler(r)?'.35':'.94')+'" title="'+escapeHTML(r.name+' '+range(r.start,r.end,r.approx)+' · '+certaintyLabel[r.dating?.level||'inferred'])+'" aria-label="'+escapeHTML(r.name+'，'+range(r.start,r.end,r.approx))+'">'+text+'</button>';
   }
   const first=packed.rulers.reduce((a,r)=>Math.max(a,r.start),0);
   if(first<s.start&&x(first)-x(s.start)>90)html+='<button class="event gap" data-action="state" data-id="'+s.id+'" style="left:'+(x(s.start)+8)+'px;top:6px">早期纪年待考</button>';
  }
  if(eventVisible){
   const es=includedEvents(s).filter(e=>(level!=='overview'||e.key||e.id===activeEventId)&&(e.id===activeEventId||!query||e.name.includes(query)||e.description.includes(query)||s.name.includes(query))).sort((a,b)=>b.year-a.year);
   const groups=[];
   for(const ev of es){const last=groups.at(-1),previous=last?.[0];const need=previous?Math.min(210,previous.name.length*(level==='detail'?14:12)+35):0;if(last&&ev.id!==activeEventId&&!last.some(e=>e.id===activeEventId)&&x(ev.year)-x(previous.year)<need+8)last.push(ev);else groups.push([ev]);}
   for(let i=0;i<groups.length;i++){
    const group=groups[i],ev=group[0],maxWidth=Math.max(18,Math.min(210,(groups[i+1]?x(groups[i+1][0].year)-x(ev.year)-8:210))),highlight=group.some(e=>e.id===activeEventId);
    const label=(ev.dating?.level!=='certain'?certaintyShort[ev.dating?.level||'inferred']+' · ':'')+ev.name+(group.length>1?' · '+group.length:'');
    html+='<button class="event date-'+(ev.dating?.level||'inferred')+' '+(group.length>1?'cluster ':'')+(highlight?'linkedEvent ':'')+'" data-action="'+(group.length>1?'cluster':'event')+'" data-id="'+(group.length>1?group.map(e=>e.id).join(','):ev.id)+'" style="left:'+x(ev.year)+'px;top:'+eventTop+'px;max-width:'+maxWidth+'px" title="'+escapeHTML(fmt(ev.year)+' · '+label+' · '+certaintyLabel[ev.dating?.level||'inferred'])+'"><i></i><span>'+escapeHTML(label)+'</span></button>';
   }
  }
  if(s.end>=end)html+='<button class="event termination" data-action="state" data-id="'+s.id+'" style="left:'+x(s.end)+'px;top:6px;height:'+Math.max(20,height-12)+'px">'+(s.approxEnd?'约 ':'')+'前'+s.end+' '+(s.id==='qin'?'称帝':s.id==='jin'?'终结争议':s.id==='yue'?'中心瓦解':'终止')+'</button>';
  else if(end===221&&s.id==='wei')html+='<div class="gap" style="left:'+(x(221)+8)+'px">延续至前209年</div>';
  html+='</div></div>';
 }
 if(!visibleStates.length)html+='<div class="empty">没有匹配的国家、君主或事件。请修改关键词或国家筛选。</div>';
 html+='<div class="cursorline" style="left:'+(x(cursor)+labelWidth())+'px"><span class="cursorBadge">前'+cursor+'</span></div>';
 chart.innerHTML=html;vp.scrollLeft=oldScroll;$('#zoomLabel').textContent=Number(px.toFixed(1))+' px / 年';$('#filterCount').textContent=new Set([...selected,...pinned]).size;
 $('#stats').innerHTML=[['18','国家与王室'],[D.states.reduce((n,s)=>n+s.rulers.length,0),'在位区间'],[D.events.length,'精选事件']].map(([n,t])=>'<div class="number"><b>'+n+'</b><span>'+t+'</span></div>').join('');
 updateRange();updateCompare();renderEventFocus();
}
function updateRange(){const left=Math.min(1046,Math.max(end,1046-Math.floor(vp.scrollLeft/px)));const right=Math.max(end,1046-Math.floor((vp.scrollLeft+vp.clientWidth-labelWidth())/px));$('#visibleRange').textContent='可见：前'+left+'—'+right+'年 · '+visibleStates.length+'行';}
function setCursor(y,scroll=false){cursor=Math.round(Math.min(1046,Math.max(end,y)));$('#cursorYear').value=-cursor;$('#cursorOutput').textContent=fmt(cursor);$('#selectionYear').textContent='年份参考线：'+fmt(cursor);$('#compareTitle').textContent=fmt(cursor)+'的列国';const line=$('.cursorline');if(line){line.style.left=(x(cursor)+labelWidth())+'px';line.firstChild.textContent='前'+cursor;}updateCompare();if(scroll)vp.scrollLeft=Math.max(0,x(cursor)-(vp.clientWidth-labelWidth())/2);}
function updateCompare(){
 $('#compare').innerHTML=visibleStates.filter(s=>s.start>=cursor&&s.end<=cursor).map(s=>{
  const gap=s.interruptions.find(g=>cursor<=g.start&&cursor>=g.end);const rulers=rulersAt(s,cursor);
  const es=D.events.filter(e=>e.year===cursor&&e.states.includes(s.id));
  return '<button class="comparecard '+(activeEvent()?.states.includes(s.id)?'eventRelated':'')+'" data-action="state" data-id="'+s.id+'" style="--statecolor:'+s.color+'"><strong>'+s.name+'</strong><span>'+ (gap?escapeHTML(gap.note):rulers.length?rulers.map(r=>(r.approx?'约 · ':'')+escapeHTML(r.name)).join(' / '):'君主纪年待考')+'</span><small>'+ (es.length?escapeHTML(es.map(e=>e.name).join('；')):'该年无已收录大事')+'</small></button>';
 }).join('')||'<p class="notice">该年没有符合当前筛选的国家。</p>';
}
function show(tag,html){$('#detailTag').textContent=tag;$('#detailBody').innerHTML=html;if(!$('#detail').open)$('#detail').showModal();}
function showRuler(id){
 const s=D.states.find(s=>s.rulers.some(r=>r.id===id));if(!s)return;const r=s.rulers.find(r=>r.id===id);
 const es=D.events.filter(e=>e.states.includes(s.id)&&e.year<=r.start&&e.year>=r.end);
 const bio=r.biography||{summary:r.description||'个人生平记载尚待补充。',sources:[]};
 const ministers=(r.ministers||[]).map(m=>'<article class="ministerCard"><h5>'+escapeHTML(m.name)+' <span>'+escapeHTML(m.role)+'</span></h5><p class="relation">'+escapeHTML(m.relation||'')+'</p><p>'+escapeHTML(m.summary)+'</p>'+links(m.sources||[])+'</article>').join('');
 const sources=[{title:r.source.includes('wikisource')?'《史记》相关年表':'采用的君主纪年表（汇编，待逐条校勘）',url:r.source},...(bio.sources||[])].filter((v,i,a)=>a.findIndex(w=>w.url===v.url)===i);
 show(s.name+' · '+r.role,'<h3 class="detailTitle">'+escapeHTML(r.name)+'</h3><span class="datebadge">'+range(r.start,r.end,r.approx)+'</span>'+(r.person?'<p class="notice">本名 / 记载名：'+escapeHTML(r.person)+'</p>':'')+'<div class="detailSection"><h4>简要生平</h4><p class="bioScope">'+escapeHTML(bio.detailLevel||'记载摘要')+'</p><p>'+escapeHTML(bio.summary)+'</p>'+(bio.note?'<p class="notice">'+escapeHTML(bio.note)+'</p>':'')+'</div><div class="detailSection"><h4>关键臣子与将领</h4>'+ (ministers||'<p class="notice">'+escapeHTML(r.ministerCoverage||'尚未收录可靠的相关人物资料。')+'</p>')+'</div><div class="detailSection"><h4>纪年可信度与不同说法</h4>'+datingDetails(r.dating)+'</div><div class="detailSection"><h4>即位、元年与结局</h4>'+chronologyDetails(r)+(r.note?'<p>'+escapeHTML(r.note)+'</p>':'')+'</div><div class="warning">'+(r.approx?'此区间含推定或争议年代。':'采用年级精度；同年更替不表示两人全年同时在位。')+' 多数区间采用元年纪年，实际即位可能在前一年。'+escapeHTML(s.note)+'</div><div class="detailSection"><h4>期间已收录事件 · '+es.length+'</h4>'+eventList(es)+'</div><div class="detailSection"><h4>核查来源</h4>'+links(sources)+'</div><div class="related"><button data-action="state" data-id="'+s.id+'">查看'+s.name+'全部世系</button><button data-action="locate" data-id="'+r.start+'">定位在位起点</button></div>');
}
const eventList=es=>es.length?es.sort((a,b)=>b.year-a.year).map(e=>'<button class="listitem" data-action="event" data-id="'+e.id+'">'+range(e.year,e.year,e.approx)+' · '+escapeHTML(e.name)+'<small>'+e.kind+' · '+e.states.map(id=>byId(id).name).join('、')+'</small></button>').join(''):'<p class="notice">这一时期的重大事件尚未收录。</p>';
function focusEvent(id){const e=D.events.find(e=>e.id===id);if(!e)return;activeEventId=id;if(density==='overview'){density='auto';$('#density').value='auto';}query='';$('#search').value='';category='all';$('#category').value='all';mode='both';$('#mode').value='both';for(const state of e.states)selected.add(state);if(e.year<end){end=221;$('#extend').checked=true;$('#cursorYear').max=-221;}px=Math.max(7,px);setCursor(e.year);render();setCursor(e.year,true);}
function renderEventFocus(){const e=activeEvent(),box=$('#eventFocus');box.hidden=!e;if(!e){box.innerHTML='';return;}box.innerHTML='<div class="focusHeading"><strong>'+fmt(e.year)+' · '+escapeHTML(e.name)+'</strong>'+certaintyBadge(e.dating)+'<button data-action="relatedOnly" data-id="'+e.id+'">仅比较相关国家</button><button data-action="event" data-id="'+e.id+'">事件详情</button><button data-action="clearEvent" aria-label="清除事件联动">清除联动</button></div><div class="focusCountries">'+e.states.map(id=>{const state=byId(id),rulers=rulersAt(state,e.year);return '<span class="focusCountry"><b>'+state.name+'</b> '+(rulers.length?rulers.map(r=>'<button data-action="ruler" data-id="'+r.id+'">'+escapeHTML(r.name)+'</button>').join(' / '):'君主纪年待考')+'</span>';}).join('')+'</div><div class="focusPeople">'+(e.participants.length?'<span>相关人物</span>'+e.participants.map((p,i)=>'<button class="personChip" data-action="participant" data-id="'+e.id+':'+i+'" title="'+escapeHTML(p.relation)+'">'+escapeHTML(p.name)+' · '+byId(p.state).name+'</button>').join(''):'<span class="notice">'+escapeHTML(e.participantCoverage)+'</span>')+'</div>';}
function showEvent(id){const e=D.events.find(e=>e.id===id);if(!e)return;focusEvent(id);
 const contemporaries=e.states.map(id=>{const state=byId(id);return '<article class="contemporary"><b>'+state.name+'</b><div>'+ (rulersAt(state,e.year).map(r=>'<button data-action="ruler" data-id="'+r.id+'">'+escapeHTML(r.name)+' · '+range(r.start,r.end,r.approx)+'</button>').join('')||'<p class="notice">君主纪年待考</p>')+'</div></article>';}).join('');
 show(e.kind+' · 列国事件','<h3 class="detailTitle">'+escapeHTML(e.name)+'</h3><span class="datebadge">'+range(e.year,e.year,e.approx)+'</span>'+datingDetails(e.dating)+'<p>'+escapeHTML(e.description)+'</p><div class="detailSection"><h4>当年在位君主</h4><p class="notice">用于同年对照；在位不等于亲自参战或参与此事。</p>'+contemporaries+'</div><div class="detailSection"><h4>已收录的相关人物</h4><p class="notice">'+escapeHTML(e.participantCoverage)+'</p>'+e.participants.map(participantCard).join('')+'</div><div class="detailSection"><h4>原典与纪年核查</h4><p class="notice">原典提供记载，公元前年份由纪年表换算；有异说时分别列明。</p>'+links(e.sources)+'</div><div class="related"><button data-action="eventChart" data-id="'+e.id+'">查看图上联动</button></div>');
}
function showState(id){const s=byId(id);if(!s)return;
 show(s.id==='zhou'?'周王室 · 参照':'列国 · '+s.region,'<h3 class="detailTitle">'+s.name+'</h3><span class="datebadge">'+range(s.start,s.end,s.approxStart||s.approxEnd)+'</span>'+datingDetails(s.dating)+'<p>'+escapeHTML(s.ending)+'</p><div class="warning">'+escapeHTML(s.note)+' 起点为约年时，线段左端仅为示意。</div><div class="detailSection"><h4>君主 / 领袖 · '+s.rulers.length+'个在位区间</h4>'+s.rulers.map(r=>'<button class="listitem" data-action="ruler" data-id="'+r.id+'">'+escapeHTML(r.name)+(r.person?' · '+escapeHTML(r.person):'')+'<small>'+range(r.start,r.end,r.approx)+' · '+r.role+'</small></button>').join('')+'</div>'+(s.undated.length?'<div class="detailSection"><h4>未定位的君主与前期领袖</h4>'+s.undated.map(r=>'<p class="notice">'+escapeHTML(r.name)+'：'+escapeHTML(r.known||'在位起讫不详')+'</p>').join('')+'</div>':'')+'<div class="detailSection"><h4>重大事件</h4>'+eventList(D.events.filter(e=>e.states.includes(s.id)))+'</div>'+links([D.sources[2],D.sources[3]]));
}
function showAbout(){show('资料与纪年','<h3 class="detailTitle">如何读这张对照图</h3><p>横向是共同年代，纵向是国家。相同年份上下对照；君主条是所采用年表的在位区间，菱形是精选事件，红色端点表示终结或身份转变。</p><div class="warning">这是可继续校勘的资料集。君主起讫以检索汇编为底表，重大事件参照《史记》相关篇目。君主结局尚未逐条核实，详情会明确标注。</div><div class="detailSection"><h4>范围与分期</h4><p>覆盖周王室与17个主要诸侯国；从约前1046年到前256年，可延伸到前221年。春秋段从前770年起，战国段从前475年起；前453年、前403年也是不同研究中的战国起点。本图分区是阅读约定。</p><p>西周前841年以前的精确年代多属推定。斜线君主条与虚线存续线表示约年、传统推定或争议。</p></div><div class="detailSection"><h4>即位、元年、同年更替</h4><p>元年常在实际即位的次年，不能把年表的第一年一概理解为即位日期。图按整年绘制，同年发生的短期君主分层显示，未尝试推断月份。</p></div><div class="detailSection"><h4>灭亡与复国</h4><p>陈、蔡的复国显示为线段中断；齐的姜氏与田氏、晋与曲沃分别分层。晋终结、越瓦解采用一系口径并标争议。赵、燕保留残余政权直到前222年。卫延续到前209年，超出图范围时显示延续标记。</p></div><div class="detailSection"><h4>人物简介</h4><p>君主详情提供简要生平与关联臣子、将领的介绍，并标明任职或关联身份。已补充'+D.peopleCoverage.detailedRulerIntervals+'个在位区间的生平简介，'+D.peopleCoverage.ministerProfiles+'位臣子与将领；其他区间提供纪年与记载摘要。未收录人物不表示没有辅臣。</p></div><div class="detailSection"><h4>覆盖情况</h4><p>'+D.states.reduce((n,s)=>n+s.rulers.length,0)+'个有起讫的在位区间，'+D.states.reduce((n,s)=>n+s.undated.length,0)+'项未定位君主 / 前期领袖，'+D.events.length+'条精选重大事件。空白与无事件提示表示未收录，不是历史空白。</p></div><div class="detailSection"><h4>缩放、事件与研究组合</h4><p>自动密度分为远景、常规、细节：缩小时保留国家兴亡与精选关键事件，放大后逐步显示君主姓名、年份与具体事件。点击事件会联动相关国家、当年君主与已核实的人物；在位不等于亲自参与。</p><p>国家旁的“钉”固定该行到上方，滚动时保持可见。研究组合保存选择、顺序、固定行、行高与时间范围，默认保存在当前浏览器，可导出、导入以跨设备使用。</p><p>可信度指图示年代：较确定表示年表定位较稳定，推定表示约年或传统推算，存在异说表示已有不同纪年或口径。人物结局的核实程度另列。</p></div><div class="detailSection"><h4>来源</h4>'+links(D.sources)+'</div><p class="notice">资料整理：'+D.updated+' · '+D.version+'</p>');}
document.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(!target)return;const {action,id}=target.dataset;
 if(action==='pin'){togglePin(id);}else if(action==='clearEvent'){activeEventId=null;render();}else if(action==='relatedOnly'){selected=new Set(activeEvent()?.states||[]);for(const state of pinned)selected.add(state);render();}else if(action==='eventChart'){if(id!==activeEventId)focusEvent(id);$('#detail').close();setCursor(activeEvent().year,true);}else if(action==='participant'){const [eid,index]=id.split(':');const e=D.events.find(e=>e.id===eid),p=e?.participants[Number(index)];if(p)show(e.name+' · 相关人物',participantCard(p)+'<button data-action="event" data-id="'+e.id+'">返回事件</button>');}else if(action==='comboApply'){applyCombo(id);$('#combinations').close();}else if(action==='comboDelete'){savedCombos=savedCombos.filter(c=>c.id!==id);saveCombos();renderCombos();}else if(action==='state')showState(id);else if(action==='ruler')showRuler(id);else if(action==='event')showEvent(id);else if(action==='cluster'){const es=id.split(',').map(id=>D.events.find(e=>e.id===id));show('密集事件 · 按年代展开','<h3 class="detailTitle">'+es.length+'条事件</h3>'+eventList(es));}else if(action==='locate'){if(Number(id)<end){$('#extend').checked=true;setExtension(true);}if(!selected.size)selected=new Set(D.states.map(s=>s.id));setCursor(Number(id),true);$('#detail').close();}
});
$('#close').onclick=()=>$('#detail').close();$('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#about').onclick=showAbout;$('#sources').onclick=showAbout;
document.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>setPeriod(b.dataset.period));
function zoom(factor){const year=1046-(vp.scrollLeft+(vp.clientWidth-labelWidth())/2)/px;px=Math.max(.8,Math.min(24,px*factor));render();vp.scrollLeft=Math.max(0,x(year)-(vp.clientWidth-labelWidth())/2);}
$('#plus').onclick=()=>zoom(1.6);$('#minus').onclick=()=>zoom(1/1.6);
$('#mode').onchange=e=>{mode=e.target.value;render();};$('#category').onchange=e=>{category=e.target.value;render();};
function setExtension(value){end=value?221:256;$('#cursorYear').max=-end;$('#year').min=221;if(cursor<end)setCursor(end);render();}
$('#extend').onchange=e=>setExtension(e.target.checked);
$('#jump').onsubmit=e=>{e.preventDefault();const y=Number($('#year').value);if(!Number.isFinite(y)||y<221||y>1046)return;if(y<end){$('#extend').checked=true;setExtension(true);}setCursor(y,true);};
$('#cursorYear').oninput=e=>setCursor(-Number(e.target.value));
$('#search').oninput=e=>{query=e.target.value.trim();render();if(query){const r=D.states.flatMap(s=>selected.has(s.id)?s.rulers.filter(r=>matchRuler(r)).map(r=>r.start):[]);const es=D.events.filter(e=>e.year>=end&&(e.name.includes(query)||e.description.includes(query))).map(e=>e.year);const year=r[0]??es[0];if(year)setCursor(year,true);}};
$('#filter').onclick=()=>{const checked=new Set(selected);$('#stateChecks').innerHTML=D.states.map(s=>'<label><input type="checkbox" value="'+s.id+'" '+(checked.has(s.id)?'checked':'')+'>'+s.name+'</label>').join('');$('#filters').showModal();};
$('#closeFilters').onclick=()=>$('#filters').close();$('#allStates').onclick=()=>document.querySelectorAll('#stateChecks input').forEach(c=>c.checked=true);$('#seven').onclick=()=>document.querySelectorAll('#stateChecks input').forEach(c=>c.checked=['zhou','qin','qi','chu','yan','han','zhao','liang'].includes(c.value));$('#applyFilters').onclick=()=>{selected=new Set([...document.querySelectorAll('#stateChecks input:checked')].map(c=>c.value));render();$('#filters').close();};
vp.addEventListener('scroll',updateRange,{passive:true});
let dragging=null,moved=false;
vp.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button,input'))return;dragging={x:e.clientX,y:e.clientY,left:vp.scrollLeft,top:vp.scrollTop};moved=false;vp.setPointerCapture(e.pointerId);});
vp.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;if(Math.abs(dx)+Math.abs(dy)>5){moved=true;vp.classList.add('dragging');}if(moved){vp.scrollLeft=dragging.left-dx;vp.scrollTop=dragging.top-dy;}});
vp.addEventListener('pointerup',e=>{if(dragging&&!moved&&!e.target.closest('button')&&e.clientY>vp.getBoundingClientRect().top+64)setCursor(1046-(e.clientX-vp.getBoundingClientRect().left+vp.scrollLeft-labelWidth())/px);dragging=null;vp.classList.remove('dragging');});vp.addEventListener('pointercancel',()=>{dragging=null;vp.classList.remove('dragging');});
window.addEventListener('resize',()=>{render();});

function togglePin(id){if(!byId(id))return;if(pinned.has(id))pinned.delete(id);else{pinned.add(id);selected.add(id);}try{localStorage.setItem('zhou-pins-v3',JSON.stringify([...pinned]));}catch{}render();renderOrder();}
function normalizeCombo(c){
 if(!c||typeof c!=='object'||typeof c.name!=='string'||!c.name.trim()||!Array.isArray(c.states))return null;
 const states=[...new Set(c.states.filter(id=>byId(id)))];if(!states.length)return null;
 const number=(v,low,high,fallback)=>Number.isFinite(Number(v))?Math.max(low,Math.min(high,Number(v))):fallback;
 const order=[...new Set((Array.isArray(c.order)?c.order:states).filter(id=>byId(id))),...D.states.map(s=>s.id)].filter((id,i,a)=>a.indexOf(id)===i);
 const from=Math.round(number(c.from,221,1046,1046)),to=Math.round(number(c.to,221,1046,256));if(from<to)return null;
 const sizes={};for(const id of states){const h=c.rowHeights?.[id];if([40,56,64,96,128,160].includes(h))sizes[id]=h;}
 return {id:typeof c.id==='string'&&/^saved-[\w-]{1,90}$/.test(c.id)?c.id:'saved-'+Date.now()+'-'+Math.random().toString(36).slice(2,9),name:c.name.trim().slice(0,40),states,order,pins:Array.isArray(c.pins)?[...new Set(c.pins.filter(id=>states.includes(id)))]:[],from,to,end:c.end===221||to<256?221:256,cursor:Math.round(number(c.cursor,221,1046,from)),rowHeight:number(c.rowHeight,36,160,64),viewHeight:number(c.viewHeight,320,1000,560),fitRows:Boolean(c.fitRows),rowHeights:sizes,density:['auto','full','overview'].includes(c.density)?c.density:'auto',mode:['both','rulers','events','overview'].includes(c.mode)?c.mode:'both',category:['all','战争','政治','改革','外交','文化'].includes(c.category)?c.category:'all'};
}
function saveCombos(){try{localStorage.setItem('zhou-comparisons-v3',JSON.stringify(savedCombos));$('#comboNotice').textContent='已保存在当前浏览器。';}catch{$('#comboNotice').textContent='浏览器未允许保存；可导出组合文件以保留。';}}
function renderCombos(){
 $('#comboSelect').innerHTML='<option value="">选择组合…</option>'+builtInCombos.map(c=>'<option value="'+c.id+'">'+c.name+'</option>').join('')+(savedCombos.length?'<optgroup label="我的组合">'+savedCombos.map(c=>'<option value="'+escapeHTML(c.id)+'">'+escapeHTML(c.name)+'</option>').join('')+'</optgroup>':'');
 $('#comboList').innerHTML='<h4>预设组合</h4>'+builtInCombos.map(c=>'<div class="comboRow"><div><strong>'+c.name+'</strong><small>'+c.states.map(id=>byId(id).name).join('、')+' · '+range(c.from,c.to)+'</small></div><button data-action="comboApply" data-id="'+c.id+'">使用</button></div>').join('')+'<h4>我的组合 · '+savedCombos.length+'</h4>'+(savedCombos.map(c=>'<div class="comboRow"><div><strong>'+escapeHTML(c.name)+'</strong><small>'+c.states.map(id=>byId(id).name).join('、')+' · '+range(c.from,c.to)+(c.pins.length?' · 固定 '+c.pins.map(id=>byId(id).name).join('、'):'')+'</small></div><button data-action="comboApply" data-id="'+escapeHTML(c.id)+'">使用</button><button data-action="comboDelete" data-id="'+escapeHTML(c.id)+'">删除</button></div>').join('')||'<p class="notice">先筛选国家、调整时间范围，再保存当前组合。</p>');
}
function captureCombo(name){const from=Math.round(Math.min(1046,Math.max(end,1046-vp.scrollLeft/px))),to=Math.round(Math.max(end,from-(vp.clientWidth-labelWidth())/px));return normalizeCombo({name,states:[...new Set([...selected,...pinned])],order:stateOrder,pins:[...pinned],from,to,end,cursor,rowHeight,viewHeight,fitRows,rowHeights,density,mode,category});}
function applyCombo(id){
 const preset=builtInCombos.find(c=>c.id===id),saved=savedCombos.find(c=>c.id===id);if(!preset&&!saved)return;
 const c=saved||{...preset,order:preset.states,pins:[],rowHeight:64,viewHeight,fitRows:true,rowHeights:{},end:preset.to<256?221:256,cursor:preset.id==='builtin-seven'?300:preset.from,density:'auto',mode:'both',category:'all'};
 selected=new Set(c.states);pinned=new Set(c.pins);stateOrder=[...c.order,...D.states.map(s=>s.id)].filter((id,i,a)=>a.indexOf(id)===i);rowHeight=c.rowHeight;viewHeight=c.viewHeight;fitRows=c.fitRows;rowHeights={...c.rowHeights};density=c.density;mode=c.mode;category=c.category;end=c.end;query='';activeEventId=null;
 $('#search').value='';$('#mode').value=mode;$('#category').value=category;$('#density').value=density;$('#extend').checked=end===221;$('#cursorYear').max=-end;cursor=Math.max(end,Math.min(1046,c.cursor));
 px=Math.max(.8,Math.min(24,(vp.clientWidth-labelWidth()-18)/Math.max(1,c.from-c.to+1)));applyLayout();vp.scrollLeft=Math.max(0,x(c.from));vp.scrollTop=0;setCursor(cursor);document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',false));$('#comboSelect').value=id;
 try{localStorage.setItem('zhou-pins-v3',JSON.stringify([...pinned]));}catch{}
}
$('#density').onchange=e=>{density=e.target.value;render();};
$('#manageCombos').onclick=()=>{renderCombos();$('#comboNotice').textContent='';$('#combinations').showModal();};$('#closeCombos').onclick=()=>$('#combinations').close();$('#comboSelect').onchange=e=>{if(e.target.value)applyCombo(e.target.value);};
$('#saveComboForm').onsubmit=e=>{e.preventDefault();if(savedCombos.length>=30&&!savedCombos.some(c=>c.name===$('#comboName').value.trim())){$('#comboNotice').textContent='最多保存30个组合，请删除不用的组合后再保存。';return;}const c=captureCombo($('#comboName').value);if(!c){$('#comboNotice').textContent='请填写名称并至少选择一个国家。';return;}const old=savedCombos.findIndex(v=>v.name===c.name);if(old>=0){c.id=savedCombos[old].id;savedCombos[old]=c;}else savedCombos.push(c);saveCombos();renderCombos();$('#comboName').value='';$('#comboSelect').value=c.id;};
$('#exportCombos').onclick=()=>{const blob=new Blob([JSON.stringify({format:'zhou-comparisons-v3',combinations:savedCombos},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='zhou-research-combinations.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#importCombos').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>1048576)throw new Error('too large');const data=JSON.parse(await file.text());if(data.format!=='zhou-comparisons-v3'||!Array.isArray(data.combinations))throw new Error('format');let added=0;for(const item of data.combinations){if(savedCombos.length>=30)break;const c=normalizeCombo(item);if(c){c.id='saved-'+Date.now()+'-'+Math.random().toString(36).slice(2,9);savedCombos.push(c);added++;}}saveCombos();renderCombos();$('#comboNotice').textContent='已导入'+added+'个有效组合。';}catch{$('#comboNotice').textContent='无法导入，请选择本网站导出的组合 JSON 文件（不超过1MB）。';}finally{e.target.value='';}};

function applyLayout(){vp.style.height=viewHeight+'px';vp.style.maxHeight='none';$('#rowHeight').value=rowHeight;$('#viewHeight').value=viewHeight;$('#viewHeightValue').textContent=viewHeight+'px';$('#fitRows').checked=fitRows;render();saveLayout();}
$('#rowHeight').oninput=e=>{rowHeight=Math.max(36,Math.min(160,Number(e.target.value)));fitRows=false;$('#fitRows').checked=false;applyLayout();};
$('#viewHeight').oninput=e=>{viewHeight=Math.max(320,Math.min(1000,Number(e.target.value)));applyLayout();};
$('#fitRows').onchange=e=>{fitRows=e.target.checked;rowHeights={};applyLayout();};
$('#sevenView').onclick=()=>applyCombo('builtin-seven');
$('#maximize').onclick=()=>{expanded=!expanded;$('.workspace').classList.toggle('expanded',expanded);$('#maximize').textContent=expanded?'收起对比':'展开对比';document.body.classList.toggle('chartExpanded',expanded);requestAnimationFrame(()=>render());};
function moveState(id,delta){const i=stateOrder.indexOf(id),j=i+delta;if(i<0||j<0||j>=stateOrder.length)return;[stateOrder[i],stateOrder[j]]=[stateOrder[j],stateOrder[i]];render();saveLayout();renderOrder();}
function renderOrder(){const chosen=stateOrder.filter(id=>selected.has(id)||pinned.has(id)),shown=[...chosen.filter(id=>pinned.has(id)),...chosen.filter(id=>!pinned.has(id))];$('#orderList').innerHTML=shown.map((id,i)=>{const s=byId(id);return '<div class="orderRow" draggable="true" data-order-id="'+id+'"><span class="dragGrip" aria-hidden="true">⠿</span><strong style="color:'+s.color+'">'+s.name+'</strong><button data-action="pin" data-id="'+id+'" aria-pressed="'+pinned.has(id)+'">'+(pinned.has(id)?'已固定':'固定')+'</button><label>行高 <select data-row-size="'+id+'" aria-label="'+s.name+'行高">'+[0,40,56,64,96,128,160].map(h=>'<option value="'+h+'" '+(Number(rowHeights[id]||0)===h?'selected':'')+'>'+(h?h+'px':'跟随全局')+'</option>').join('')+'</select></label><button data-move="up" data-id="'+id+'" '+(i===0||pinned.has(shown[i-1])!==pinned.has(id)?'disabled':'')+' aria-label="上移'+s.name+'">上移</button><button data-move="down" data-id="'+id+'" '+(i===shown.length-1||pinned.has(shown[i+1])!==pinned.has(id)?'disabled':'')+' aria-label="下移'+s.name+'">下移</button></div>';}).join('');}
$('#orderStates').onclick=()=>{renderOrder();$('#ordering').showModal();};$('#closeOrder').onclick=()=>$('#ordering').close();$('#doneOrder').onclick=()=>$('#ordering').close();$('#resetOrder').onclick=()=>{stateOrder=D.states.map(s=>s.id);rowHeights={};renderOrder();render();saveLayout();};
$('#orderList').addEventListener('click',e=>{const b=e.target.closest('[data-move]');if(!b)return;const chosen=stateOrder.filter(id=>(selected.has(id)||pinned.has(id))&&pinned.has(id)===pinned.has(b.dataset.id)),shown=chosen,i=shown.indexOf(b.dataset.id),other=shown[i+(b.dataset.move==='up'?-1:1)];if(!other)return;const a=stateOrder.indexOf(b.dataset.id),z=stateOrder.indexOf(other);[stateOrder[a],stateOrder[z]]=[stateOrder[z],stateOrder[a]];renderOrder();render();saveLayout();});
$('#orderList').addEventListener('change',e=>{const id=e.target.dataset.rowSize;if(!id)return;const h=Number(e.target.value);if(![0,40,56,64,96,128,160].includes(h))return;if(h)rowHeights[id]=h;else delete rowHeights[id];render();saveLayout();});
let draggingState=null;$('#orderList').addEventListener('dragstart',e=>{const row=e.target.closest('[data-order-id]');if(!row)return;draggingState=row.dataset.orderId;e.dataTransfer.setData('text/plain',draggingState);e.dataTransfer.effectAllowed='move';});
$('#orderList').addEventListener('dragover',e=>{if(e.target.closest('[data-order-id]'))e.preventDefault();});
$('#orderList').addEventListener('drop',e=>{e.preventDefault();const target=e.target.closest('[data-order-id]')?.dataset.orderId;if(!target||!draggingState||target===draggingState)return;stateOrder=stateOrder.filter(id=>id!==draggingState);stateOrder.splice(stateOrder.indexOf(target),0,draggingState);draggingState=null;renderOrder();render();saveLayout();});
renderCombos();applyLayout();
render();setCursor(770);vp.scrollLeft=Math.max(0,x(770)-40);
// Browser agents use the same navigation and search state as the visible controls.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'compare_zhou_year',title:'对照列国年份',description:'移动年份参考线并展示该年的列国君主与事件；year_bce 为公元前年份。',inputSchema:{type:'object',properties:{year_bce:{type:'integer',minimum:221,maximum:1046}},required:['year_bce'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!Number.isInteger(input.year_bce)||input.year_bce<221||input.year_bce>1046)throw new Error('年份必须是221至1046之间的整数');if(input.year_bce<end){$('#extend').checked=true;setExtension(true);}setCursor(input.year_bce,true);return {year_bce:cursor,states:visibleStates.filter(s=>s.start>=cursor&&s.end<=cursor).map(s=>({state:s.name,rulers:s.rulers.filter(r=>r.start>=cursor&&r.end<=cursor).map(r=>r.name)}))};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
