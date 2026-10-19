// Formal user inputs remain byte-for-byte intact in data/. Presentation annotations
// resolve structural ambiguities without changing dates, facts, IDs or relationships.
import {compileAtlas} from './atlas.mjs';
import {annotateDisplay} from './production-display.mjs';
export const catalog = [
  {id:'zhou',name:'周朝',page:'index.html',file:'atlas.json'},
  {id:'qin-han',name:'秦汉',page:'qin-han.html',file:'qin-han.json'},
  {id:'three-kingdoms',name:'三国',page:'three-kingdoms.html',file:'three-kingdoms.json'}
];
export function prepareProduction(input, id) {
  const a=structuredClone(input);
  if(id==='qin-han') {
    const edge=a.relations.eventPeople.find(e=>e.eventId==='qh-event-12-julu'&&e.personId==='qh-person-xiang-yu');
    if(edge){edge.affiliationScope='contextual';edge.affiliationNote='原始资料关联西楚身份；不据此把西楚列为前207年参战政权。';}
  }
  if(id==='three-kingdoms') {
    for(const t of a.tenures.filter(t=>['tk-tenure-liubei-hanzhong','tk-tenure-sunquan-early','tk-tenure-caocao-foundation'].includes(t.id))) {
      t.polityAssociation='contextual';
      t.associationNote='汉末任职 / 执政阶段关联，非东汉皇帝在位；阶段可能延续至东汉终结之后。';
    }
  }
  return a;
}
export function compileProduction(input,id){
  const result=compileAtlas(prepareProduction(input,id));
  // Keep Zhou's published projection byte-compatible with serializeAtlas().
  return id==='zhou'?result:annotateDisplay({...result,datasetId:id,catalog:catalog.map(({id,name,page})=>({id,name,page}))},id);
}
