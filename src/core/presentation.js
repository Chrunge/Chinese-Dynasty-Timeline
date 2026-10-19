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
