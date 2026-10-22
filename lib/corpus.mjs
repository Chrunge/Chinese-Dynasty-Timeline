// A provenance index, not a historical adjudicator. Shared IDs resolve to all
// authored appearances; differing descriptions/dates are never silently merged.
import {createHash} from 'node:crypto';
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const signature=value=>JSON.stringify(canonical(value));
const hash=value=>createHash('sha256').update(signature(value)).digest('hex');
const collections=['polities','people','tenures','periods','events','activities','sources'];
// Explicit intake findings, not a name/date heuristic. Original IDs remain intact.
const collisions=[
 {collection:'polities',id:'later-liang',reason:'魏晋南北朝卷的后凉（386—403）与五代十国卷的后梁（907—923）复用了同ID，必须用专题＋ID区分。'},
 {collection:'polities',id:'wu-zhou',reason:'隋唐卷的武周（690—705）与清朝卷的吴周（1673—1681）复用了同ID，必须用专题＋ID区分。'}
];
export function buildCorpus(entries){
 const indexes=Object.fromEntries(collections.map(k=>[k,new Map()])),topics=[];
 const add=(kind,id,record,appearance)=>{
  if(typeof record.id!=='string'||!record.id)throw new Error('Invalid corpus identity: '+id+'/'+kind);
  let entity=indexes[kind].get(record.id);
  if(!entity){entity={id:record.id,appearances:[],records:[]};indexes[kind].set(record.id,entity);}
  entity.appearances.push({datasetId:id,...appearance,sha256:hash(record)});entity.records.push(record);
 };
 const seen=new Set();
 for(const {id,name,file,sourceSha256,atlas,supplements=[]} of entries){
  if(seen.has(id))throw new Error('Duplicate corpus dataset: '+id);seen.add(id);
  const counts={};
  for(const kind of collections){
   const field=kind==='polities'&&!atlas.polities?'states':kind==='tenures'&&!atlas.tenures?'rulers':kind;
   const records=atlas[field]||[];counts[kind]=records.length;
   const local=new Set();
   for(const [index,record] of records.entries()){
    if(typeof record.id!=='string'||local.has(record.id))throw new Error('Invalid corpus identity: '+id+'/'+kind+'/'+record.id);
    local.add(record.id);
    add(kind,id,record,{path:`/${field}/${index}`});
   }
  }
  for(const source of supplements)for(const kind of collections)for(const {record,path} of source.records[kind]||[])add(kind,id,record,{file:source.file,sourceSha256:source.sourceSha256,path});
  topics.push({...(supplements.length?{supplements:supplements.map(s=>({file:s.file,sourceSha256:s.sourceSha256,counts:Object.fromEntries(collections.map(k=>[k,(s.records[k]||[]).length]))}))}:{}),id,name,file,sourceSha256,schemaVersion:atlas.schemaVersion,title:atlas.metadata?.title,timeline:atlas.timeline,counts,relationCounts:Object.fromEntries(Object.entries(atlas.relations||{}).map(([k,v])=>[k,v.length]))});
 }
 const entities=Object.fromEntries(collections.map(kind=>[kind,[...indexes[kind].values()].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0).map(({id,appearances,records})=>({id,appearances,differingFields:[...new Set(records.flatMap(r=>Object.keys(r)))].sort().filter(key=>new Set(records.map(r=>signature(r[key])??'__absent__')).size>1)}))]));
 const identityConflicts=[];
 for(const kind of collections)for(const entity of entities[kind]){
  const collision=collisions.find(c=>c.collection===kind&&c.id===entity.id);
  entity.identityScope=collision?'dataset':'stable-id';
  entity.identityKeys=collision?entity.appearances.map(a=>a.datasetId+'/'+entity.id):[entity.id];
  if(collision)identityConflicts.push({...collision,identityKeys:entity.identityKeys});
 }
 return {schemaVersion:1,purpose:'跨专题原始ID与出处索引，不是合并后的事实库。字段差异不裁决；已知异实体ID碰撞必须按identityScope及专题＋ID取值。不进行联网史实校验。',topics,
  // entityCounts counts original ID keys; scopedEntityCounts separates known collisions.
  entityCounts:Object.fromEntries(collections.map(k=>[k,entities[k].length])),
  scopedEntityCounts:Object.fromEntries(collections.map(k=>[k,entities[k].reduce((n,e)=>n+e.identityKeys.length,0)])),
  sharedEntityCounts:Object.fromEntries(collections.map(k=>[k,entities[k].filter(e=>e.identityScope==='stable-id'&&new Set(e.appearances.map(a=>a.datasetId)).size>1).length])),
  identityConflicts,entities};
}
