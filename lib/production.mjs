// Formal user inputs remain byte-for-byte intact in data/. Presentation annotations
// resolve structural ambiguities without changing dates, facts, IDs or relationships.
import {compileAtlas} from './atlas.mjs';
import {annotateDisplay} from './production-display.mjs';
import {prepareAdditionalProduction} from './production-annotations.mjs';
import {annotateDynastyDisplay} from './dynasty-display.mjs';
import {prepareExpansionProduction} from './expansion-annotations.mjs';
import {annotateExpansionDisplay} from './expansion-display.mjs';
export const catalog = [
  {id:'xia-shang',name:'夏商',page:'xia-shang.html',file:'xia-shang.json'},
  {id:'zhou',name:'周朝',page:'index.html',file:'atlas.json'},
  {id:'qin-han',name:'秦汉',page:'qin-han.html',file:'qin-han.json'},
  {id:'three-kingdoms',name:'三国',page:'three-kingdoms.html',file:'three-kingdoms.json'},
  {id:'wei-jin-nan-bei',name:'魏晋南北朝',page:'wei-jin-nan-bei.html',file:'wei-jin-nan-bei.json'},
  {id:'sui-tang',name:'隋唐',page:'sui-tang.html',file:'sui-tang.json'},
  {id:'five-dynasties',name:'五代十国',page:'five-dynasties.html',file:'five-dynasties.json'},
  {id:'liao-jin-song',name:'辽金宋',page:'liao-jin-song.html',file:'liao-jin-song.json'},
  {id:'yuan',name:'元朝',page:'yuan.html',file:'yuan.json'},
  {id:'ming',name:'明朝',page:'ming.html',file:'ming.json'},
  {id:'qing',name:'清朝',page:'qing.html',file:'qing.json'}
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
  return prepareExpansionProduction(prepareAdditionalProduction(a,id),id);
}
export function compileProduction(input,id){
  const result=compileAtlas(prepareProduction(input,id));
  // Keep Zhou's published projection byte-compatible with serializeAtlas().
  if(id==='zhou')return result;
  const data={...result,datasetId:id,catalog:catalog.map(({id,name,page})=>({id,name,page}))};
  if(['qin-han','three-kingdoms'].includes(id))return annotateDisplay(data,id);
  if(['xia-shang','five-dynasties','yuan','qing'].includes(id))return annotateExpansionDisplay(data,id);
  return annotateDynastyDisplay(data,id);
}
