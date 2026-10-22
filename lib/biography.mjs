// Compile supplemental biographies before statistics, navigation and publication.
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {projectBiographyBook} from './biography-data.mjs';
import {toAxis} from './time.mjs';
export const biographySource='data/中国历代非君主人物传记全书.json';
export function createBiographyCompiler(book){
 const projected=projectBiographyBook(book),files=new Set();
 for(const dynasty of projected.dynasties){
  if(typeof dynasty.datasetFile!=='string'||files.has(dynasty.datasetFile))throw new Error('传记专题重复或缺少文件名');
  files.add(dynasty.datasetFile);const ids=new Set();
  for(const figure of dynasty.figures){
   if(typeof figure.id!=='string'||!figure.id||ids.has(figure.id)||typeof figure.name!=='string'||!figure.name)throw new Error('传记人物 ID 缺失或重复');
   ids.add(figure.id);
   for(const source of figure.sources)if(typeof source.id!=='string'||!source.id)throw new Error('传记来源缺少 ID');
   for(const stage of [...(figure.biographyPlan?.chapters||[]),...figure.stageActivities]){
    if(stage.year==null)continue;
    if(typeof stage.year==='number'){if(!Number.isSafeInteger(stage.year))throw new Error('传记活动年份无效');}
    else toAxis(stage.year);
   }
  }
 }
 const context={Zhou:{BiographyData:projected}};
 runInNewContext(readFileSync(new URL('../src/core/biography.js',import.meta.url),'utf8'),context);
 const find=topicId=>book.dynasties.findIndex(d=>d.datasetFile===projected.topicToFile[topicId]);
 function enrich(data){const output=structuredClone(data);context.Zhou.Biography.enrichDataset(output);return structuredClone(output);}
 function provenance(topicId,sourceSha256){
  const index=find(topicId);if(index<0)return [];
  const figures=book.dynasties[index].figures,prefix='/dynasties/'+index+'/figures/';
  return [{file:biographySource,sourceSha256,records:{
   people:figures.map((record,i)=>({record,path:prefix+i})),
   sources:figures.flatMap((figure,i)=>(figure.sources||[]).map((record,j)=>({record,path:prefix+i+'/sources/'+j})))
  }}];
 }
 function inspectReferences(data,topicId,datasets=new Map()){
  const index=find(topicId),issues=[],externalReferences=[],unindexedReferences=[];if(index<0)return {issues,externalReferences,unindexedReferences};
  const events=new Set(data.events.map(x=>x.id)),polities=new Set(data.states.map(x=>x.id)),tenures=new Set((data.tenures||data.states.flatMap(s=>s.rulers||[])).map(x=>x.id));
  for(const [i,figure] of book.dynasties[index].figures.entries()){
   const sources=new Set([...(data.sources||[]),...(data.people.find(p=>p.id===figure.id)?.sources||[]),...(figure.sources||[])].map(x=>x.id));
   const prefix='/dynasties/'+index+'/figures/'+i;
   const check=(value,known,path,kind,record={})=>{
    if(value==null)return;
    const targetDatasetId=record[kind+'DatasetId'];
    const reference={datasetId:topicId,personId:figure.id,file:biographySource,path,kind,id:value};
    if(targetDatasetId&&targetDatasetId!==topicId){
     const target=datasets.get(targetDatasetId),collection=kind==='event'?target?.events:kind==='polity'?target?.states:target?.tenures;
     if(collection?.some(item=>item.id===value)){externalReferences.push({...reference,targetDatasetId,status:'external'});return;}
     issues.push({...reference,targetDatasetId,status:'unresolved'});return;
    }
    if(!known.has(value))issues.push({...reference,status:'unresolved'});
   };
   for(const [j,r] of (figure.servedMonarchs||[]).entries())check(r.tenureId,tenures,prefix+'/servedMonarchs/'+j+'/tenureId','tenure');
   for(const [j,r] of (figure.associatedPolities||[]).entries())check(r.polityId,polities,prefix+'/associatedPolities/'+j+'/polityId','polity');
   for(const field of ['chapters','stageActivities']){
    const records=field==='chapters'?figure.biographyPlan?.chapters||[]:figure.stageActivities||[];
    const fieldPath=field==='chapters'?'/biographyPlan/chapters/':'/stageActivities/';
    for(const [j,r] of records.entries()){
     const path=prefix+fieldPath+j;
     check(r.eventId,events,path+'/eventId','event',r);check(r.polityId,polities,path+'/polityId','polity',r);
     if(r.eventReference){
      const reference=r.eventReference;
      if(r.eventId!=null||reference.status!=='unindexed'||typeof reference.originalId!=='string'||!reference.originalId||typeof reference.reason!=='string'||!reference.reason.trim())throw new Error('未收录事件声明无效：'+path);
      unindexedReferences.push({datasetId:topicId,personId:figure.id,file:biographySource,path:path+'/eventReference',...reference});
     }
     for(const [k,id] of (r.sourceIds||[]).entries())check(id,sources,path+'/sourceIds/'+k,'source');
    }
   }
  }
  return {issues,externalReferences,unindexedReferences};
 }
 return Object.freeze({enrich,provenance,inspectReferences,diagnose:(data,topicId,datasets)=>inspectReferences(data,topicId,datasets).issues});
}
