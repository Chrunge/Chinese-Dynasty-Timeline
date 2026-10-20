// A provenance index, not a historical adjudicator. Shared IDs resolve to all
// authored appearances; differing descriptions/dates are never silently merged.
import {createHash} from 'node:crypto';
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const signature=value=>JSON.stringify(canonical(value));
const hash=value=>createHash('sha256').update(signature(value)).digest('hex');
const collections=['polities','people','tenures','periods','events','activities','sources'];
export function buildCorpus(entries){
 const indexes=Object.fromEntries(collections.map(k=>[k,new Map()])),topics=[];
 const seen=new Set();
 for(const {id,name,file,sourceSha256,atlas} of entries){
  if(seen.has(id))throw new Error('Duplicate corpus dataset: '+id);seen.add(id);
  const counts={};
  for(const kind of collections){
   const field=kind==='polities'&&!atlas.polities?'states':kind==='tenures'&&!atlas.tenures?'rulers':kind;
   const records=atlas[field]||[];counts[kind]=records.length;
   const local=new Set();
   for(const [index,record] of records.entries()){
    if(typeof record.id!=='string'||local.has(record.id))throw new Error('Invalid corpus identity: '+id+'/'+kind+'/'+record.id);
    local.add(record.id);
    let entity=indexes[kind].get(record.id);
    if(!entity){entity={id:record.id,appearances:[],records:[]};indexes[kind].set(record.id,entity);}
    entity.appearances.push({datasetId:id,path:`/${field}/${index}`,sha256:hash(record)});entity.records.push(record);
   }
  }
  topics.push({id,name,file,sourceSha256,schemaVersion:atlas.schemaVersion,title:atlas.metadata?.title,timeline:atlas.timeline,counts,relationCounts:Object.fromEntries(Object.entries(atlas.relations||{}).map(([k,v])=>[k,v.length]))});
 }
 const entities=Object.fromEntries(collections.map(kind=>[kind,[...indexes[kind].values()].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0).map(({id,appearances,records})=>({id,appearances,differingFields:[...new Set(records.flatMap(r=>Object.keys(r)))].sort().filter(key=>new Set(records.map(r=>signature(r[key])??'__absent__')).size>1)}))]));
 return {schemaVersion:1,purpose:'跨专题稳定ID与原始资料出处索引；差异仅表示输入字段不同，不表示史实判定，不进行联网校验。',topics,entityCounts:Object.fromEntries(collections.map(k=>[k,entities[k].length])),sharedEntityCounts:Object.fromEntries(collections.map(k=>[k,entities[k].filter(e=>e.appearances.length>1).length])),entities};
}
