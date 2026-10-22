(function(Zhou){
 'use strict';
 const fields=person=>[
  ['stageActivities',person?.stageActivities||[]],
  ['chapters',person?.biographyPlan?.chapters||[]],
  ['journey',person?.journey||[]]
 ];
 function normalize(record,index){
  const year=typeof record.year==='object'?Zhou.Time.encode(record.year):record.year;
  const stateId=record.polityId||record.stateId||record.state;
  return {...record,year:Zhou.Time.isYear(year)?year:null,stateId,polityId:stateId,state:stateId,
   sequence:record.sequence??record.chapterNo??index+1,eventId:record.eventId||record.event,
   label:record.label||record.title||'',text:record.text||record.summary||'',kindLabel:record.kindLabel||record.kind||'',
   sourceIds:[...(record.sourceIds||[])],sources:[...(record.sources||[])]};
 }
 function records(person){
  const result=[],aliases=new Map();
  for(const [field,items] of fields(person))for(const [index,record] of items.entries()){
   const value=normalize(record,index),scope=JSON.stringify([value.year,value.stateId||null]);
   const keys=[];
   if(record.id)keys.push(scope+'/id/'+record.id);
   if(value.eventId)keys.push(scope+'/event/'+value.eventId);
   if(field!=='journey')keys.push(scope+'/chapter/'+value.sequence);
   if(value.label||value.text)keys.push(scope+'/text/'+JSON.stringify([value.label,value.text]));
   let target=keys.map(key=>aliases.get(key)).find(Boolean);
   if(!target){target={...value,provenance:[]};result.push(target);}
   target.provenance.push({field,index,record});
   target.sourceIds=[...new Set([...target.sourceIds,...value.sourceIds])];
   for(const source of value.sources)if(!target.sources.some(s=>JSON.stringify(s)===JSON.stringify(source)))target.sources.push(source);
   for(const key of keys)aliases.set(key,target);
  }
  return result;
 }
 function narrative(person){
  const preferred=fields(person).find(([,items])=>items.length)?.[0];
  return records(person).filter(record=>record.provenance.some(source=>source.field===preferred));
 }
 function at(person,year){return records(person).filter(record=>Zhou.Time.isYear(record.year)&&record.year===year);}
 Zhou.PersonActivities=Object.freeze({records,narrative,at});
})(globalThis.Zhou ||= {});
