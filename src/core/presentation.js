(function(Zhou){
 'use strict';
 // Explicit, additive presentation contract. It never changes domain records or IDs.
 Zhou.Presentation={
  rulerLabel(r){return r.display?[r.display.shortTitle,r.display.personalName].filter(Boolean).join(' '):r.name;},
  // Inclusive year precision: equality is an overlap, not permission to trim dates.
  pack(records,from,to,laneKey='displayLane'){
   const ends=[],items=[];
   for(const r of records.filter(r=>r.start>=to&&r.end<=from).sort((a,b)=>b.start-a.start||(a.lane||0)-(b.lane||0))){
    let lane=r.lane||0;while(ends[lane]!=null&&r.start>=ends[lane])lane++;
    ends[lane]=r.end;items.push({...r,[laneKey]:lane});
   }
   return {items,lanes:Math.max(1,ends.length)};
  },
  // Pixel-space event packing: spend available height before folding neighbours.
  // Obstacles are rendered tenure rectangles, not altered historical intervals.
  events(records,{position,measure,top,bottom,focusedId,obstacles=[]}){
   const lanes=Math.max(1,Math.floor((bottom-top)/22)+1),groups=[];
   const ordered=[...records].sort((a,b)=>position(a)-position(b)),focused=ordered.find(e=>e.id===focusedId);
   // Reserve the selected event before placing its neighbours, including earlier
   // years. With spare lanes it remains independently actionable.
   for(const ev of focused?[focused,...ordered.filter(e=>e!==focused)]:ordered){
    const left=position(ev),width=Math.max(18,Math.min(210,measure(ev)));
    const intersects=g=>left<g.left+g.width+8&&left+width+8>g.left;
    const lane=Array.from({length:lanes},(_,i)=>i).find(i=>!groups.some(g=>g.lane===i&&intersects(g))&&!obstacles.some(o=>left<o.right+2&&left+width>o.left-2&&bottom-i*22<o.bottom+1&&bottom-i*22+18>o.top-1));
    if(lane!==undefined){groups.push({events:[ev],left,width,top:bottom-lane*22,lane});continue;}
    // The caller reserves the bottom lane for events. When all usable slots are
    // occupied, fold into a neighbouring marker, preserving every event ID.
    const neighbours=groups.filter(intersects),ordinary=neighbours.filter(g=>!g.events.some(e=>e.id===focusedId));
    const group=(ordinary.length?ordinary:neighbours).at(-1);
    group.events.push(ev);group.events.sort((a,b)=>position(a)-position(b));group.left=position(group.events[0]);
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
