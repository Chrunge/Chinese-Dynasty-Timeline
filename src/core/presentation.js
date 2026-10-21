(function(Zhou){
 'use strict';
 // Explicit, additive presentation contract. It never changes domain records or IDs.
 Zhou.Presentation={
  rulerLabel(r){return r.display?[r.display.shortTitle,r.display.personalName].filter(Boolean).join(' '):r.name;},
  // Shapes, not colour alone, distinguish the five source categories. Unknown
  // categories stay unknown; this adapter never reclassifies a historical event.
  eventIcon(kind){
   return ({
    '政治':{token:'politics',path:'M2 6L8 2L14 6M3 7H13M4 7V13M8 7V13M12 7V13M2 14H14'},
    '战争':{token:'war',path:'M3 2L13 12M2 4L4 2M10 14L14 10M13 2L3 12M12 2L14 4M2 10L6 14'},
    '改革':{token:'reform',path:'M2 4H14M5 2V6M2 8H14M11 6V10M2 12H14M7 10V14'},
    '外交':{token:'diplomacy',path:'M6 4H5A4 4 0 0 0 5 12H7M10 4H11A4 4 0 0 1 11 12H9M5 8H11'},
    '文化':{token:'culture',path:'M8 4C5 2 3 2 1 3V13C4 12 6 12 8 14C10 12 12 12 15 13V3C13 2 11 2 8 4V14'}
   })[kind]||{token:'other',path:'M8 2A6 6 0 1 0 8 14A6 6 0 1 0 8 2'};
  },
  eventKinds(events){return [...new Set(events.map(e=>e.kind).filter(Boolean))];},
  // A short label is only a prefix of the original title, never a guessed name.
  eventLabel(event,limit=10){const name=Array.from(event.name||'');return name.length>limit?name.slice(0,limit).join('')+'…':name.join('');},
  // Aggregate visible *rows*, while counting missing original polity IDs. Two
  // members of one succession row produce one dot, not invented separate lanes.
  eventLinks(events,rows,{position,rowPosition}){
   return events.filter(e=>new Set(e.states).size>1).map(event=>{
    const visible=new Set(),points=[];
    for(const row of rows){
     const states=row.members.filter(s=>event.states.includes(s.id)),y=rowPosition(row);
     if(!states.length||!Number.isFinite(y))continue;
     states.forEach(s=>visible.add(s.id));points.push({rowKey:row.key,states:states.map(s=>s.id),y});
    }
    const hidden=[...new Set(event.states)].filter(id=>!visible.has(id));
    return {event,left:position(event),points:points.sort((a,b)=>a.y-b.y),hidden};
   });
  },
  // Inclusive year precision: equality is an overlap, not permission to trim dates.
  pack(records,from,to,laneKey='displayLane'){
   const ends=[],items=[];
   for(const r of records.filter(r=>r.start>=to&&r.end<=from).sort((a,b)=>b.start-a.start||(a.lane||0)-(b.lane||0))){
    let lane=r.lane||0;while(ends[lane]!=null&&r.start>=ends[lane])lane++;
    ends[lane]=r.end;items.push({...r,[laneKey]:lane});
   }
   return {items,lanes:Math.max(1,ends.length)};
  },
  // Screen-space adapters never assign fractional historical years. Keep the
  // inclusive pack above intact; only short-year controls receive micro-slots.
  tenureSlots(records,{position,scale=1,measure=r=>(r.start-r.end+1)*scale,order=records,minWidth=14,gap=2,limit=Infinity}={}){
   const source=new Map(order.map((r,i)=>[r.id,i])),placed=[],drafts=[];
   for(const r of records){
    const anchor=position(r),rawWidth=Math.max(0,measure(r)),short=rawWidth<minWidth;
    const peers=short?order.filter(p=>p.stateId===r.stateId&&(p.start===r.start||p.end===r.start)):[];
    const sequence=[...peers].sort((a,b)=>(source.get(a.id)??0)-(source.get(b.id)??0)),ordinal=Math.max(0,sequence.findIndex(p=>p.id===r.id));
    const width=Math.max(minWidth,rawWidth),offset=short&&sequence.length>1?ordinal*(minWidth+gap):0;
    const left=Math.max(0,Math.min(anchor+offset,Math.max(0,limit-width)));
    drafts.push({...r,anchor,visualLeft:left,visualWidth:width,subyearSlot:short,slotOrder:ordinal+1,slotCount:sequence.length||1});
   }
   // Reserve unchanged long bars first. A short hit control may reuse a free
   // original lane, rather than displacing a later long reign and cascading rows.
   const baseLanes=Math.max(1,...records.map(r=>(r.displayLane||0)+1));
   for(const r of [...drafts.filter(r=>!r.subyearSlot),...drafts.filter(r=>r.subyearSlot)]){
    const clear=lane=>!placed.some(p=>p.displayLane===lane&&r.visualLeft<p.visualLeft+p.visualWidth&&r.visualLeft+r.visualWidth>p.visualLeft);
    const candidates=[r.displayLane||0,...Array.from({length:baseLanes},(_,i)=>i).filter(i=>i!==(r.displayLane||0))];
    let lane=candidates.find(clear);
    if(lane===undefined){lane=baseLanes;while(!clear(lane))lane++;}
    r.displayLane=lane;placed.push(r);
   }
   return {items:drafts,lanes:Math.max(1,...drafts.map(r=>r.displayLane+1))};
  },
  // Pixel-space event packing: spend available height before folding neighbours.
  // Obstacles are rendered tenure rectangles, not altered historical intervals.
  events(records,{position,measure,measureGroup,extent,top,bottom,focusedId,obstacles=[]}){
   const lanes=Math.max(1,Math.floor((bottom-top)/22)+1),groups=[];
   const widthFor=events=>{const span=events.length===1&&extent?.(events[0]);return Number.isFinite(span)&&span>0?Math.max(1,span):Math.max(18,Math.min(210,measureGroup?measureGroup(events):measure(events[0])));};
   const ordered=[...records].sort((a,b)=>position(a)-position(b)),focused=ordered.find(e=>e.id===focusedId);
   // Reserve the selected event before placing its neighbours, including earlier
   // years. With spare lanes it remains independently actionable.
   for(const ev of focused?[focused,...ordered.filter(e=>e!==focused)]:ordered){
    const left=position(ev),width=widthFor([ev]);
    const intersects=g=>left<g.left+g.width+8&&left+width+8>g.left;
    const lane=Array.from({length:lanes},(_,i)=>i).find(i=>!groups.some(g=>g.lane===i&&intersects(g))&&!obstacles.some(o=>left<o.right+2&&left+width>o.left-2&&bottom-i*22<o.bottom+1&&bottom-i*22+18>o.top-1));
    if(lane!==undefined){groups.push({events:[ev],left,width,top:bottom-lane*22,lane});continue;}
    // The caller reserves the bottom lane for events. When all usable slots are
    // occupied, fold into a neighbouring marker, preserving every event ID.
    const neighbours=groups.filter(intersects),ordinary=neighbours.filter(g=>!g.events.some(e=>e.id===focusedId));
    const group=(ordinary.length?ordinary:neighbours).at(-1);
    // The UI reserves an obstacle-free bottom slot. Impossible external
     // bands are flagged, but keep every original ID instead of crashing.
     if(!group){groups.push({events:[ev],left,width,top:bottom,lane:0,blocked:true});continue;}
     group.events.push(ev);group.events.sort((a,b)=>position(a)-position(b));group.left=position(group.events[0]);
     if(measureGroup||extent)group.width=widthFor(group.events);
   }
   if(measureGroup||extent){
     // A compact singleton can grow when its cluster gains categories/counts.
     // Recheck actual widths against peers and tenure obstacles. Every retry
     // merges two groups, so dates stay anchored and the process terminates.
     const overlap=(a,b)=>a.left<b.left+b.width+8&&a.left+a.width+8>b.left;
     let retry=true;
     while(retry){
      retry=false;const placed=[];
      const order=[...groups].sort((a,b)=>Number(b.events.some(e=>e.id===focusedId))-Number(a.events.some(e=>e.id===focusedId))||a.left-b.left||a.lane-b.lane);
      for(const group of order){
       const candidates=[group.lane,...Array.from({length:lanes},(_,i)=>i).filter(i=>i!==group.lane)];
       const lane=candidates.find(i=>!placed.some(other=>other.lane===i&&overlap(group,other))&&!obstacles.some(o=>group.left<o.right+2&&group.left+group.width>o.left-2&&bottom-i*22<o.bottom+1&&bottom-i*22+18>o.top-1));
       if(lane!==undefined){group.lane=lane;group.top=bottom-lane*22;delete group.blocked;placed.push(group);continue;}
       const neighbours=placed.filter(other=>overlap(group,other)),ordinary=neighbours.filter(other=>!other.events.some(e=>e.id===focusedId)),target=(ordinary.length?ordinary:neighbours).at(-1);
       if(!target){group.blocked=true;placed.push(group);continue;}
       target.events.push(...group.events);target.events.sort((a,b)=>position(a)-position(b));target.left=position(target.events[0]);target.width=widthFor(target.events);
       groups.splice(groups.indexOf(group),1);retry=true;break;
      }
     }
    }
    return {groups:groups.sort((a,b)=>a.left-b.left||a.lane-b.lane),lanes};
  },
  rows(states,presentation,pins=new Set()){
   const definitions=presentation?.version===1?presentation.rowGroups||[]:[],rows=[],seen=new Set();
   for(const s of states){
    const group=definitions.find(g=>g.stateIds.includes(s.id)),key=group?'group:'+group.id:'state:'+s.id;
    if(seen.has(key))continue;seen.add(key);
    const members=group?states.filter(v=>group.stateIds.includes(v.id)):[s];
    rows.push({key,name:group?.name||s.name,note:group?.note||'',grouped:Boolean(group),members,pinned:members.some(v=>pins.has(v.id))});
   }
   return [...rows.filter(r=>r.pinned),...rows.filter(r=>!r.pinned)];
  }
 };
})(globalThis.Zhou ||= {});
