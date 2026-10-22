(function(Zhou){
 'use strict';
 // A topic-local, read-only view. Visual row groups and current checkboxes are
 // deliberately absent: neither is an historical polity or a query boundary.
 Zhou.createTimeSliceModel=function({data,history,time=Zhou.Time}){
  function regnal(ruler,year){
   const start=ruler.chronology?.regnalStart;
   if(!time.isYear(start))return {status:'unknown',number:null,label:'元年未详'};
   if(year>start)return {status:'before',number:null,label:'元年前（尚未进入采用的元年）'};
   const number=start-year+1;
   if(!Number.isSafeInteger(number)||number<1)return {status:'unknown',number:null,label:'元年未详'};
   return {status:'year',number,label:number===1?'元年':'第'+number+'年'};
  }
  function at(year){
   if(!time.isYear(year))throw new TypeError('同年横截面需要有效的年份坐标。');
   const states=data.states.filter(state=>history.existsAt(state,year)).map(state=>({
    state,interruption:history.interruptionAt(state,year)||null,
    rulers:history.rulersAt(state,year).map(ruler=>({ruler,regnal:regnal(ruler,year)}))
   }));
   const events=history.eventsInRange({from:year,to:year,states:data.states.map(state=>state.id)});
   // Scattered journey records, birth/death dates and office associations never
   // establish a continuous active interval. Keep only explicitly dated records.
   const people=(data.people||[]).map(person=>({person,activities:Zhou.PersonActivities.at(person,year),label:'当年有活动记载'})).filter(item=>item.activities.length);
   return {year,label:time.format(year),states,events,people};
  }
  return Object.freeze({at});
 };
})(globalThis.Zhou ||= {});
