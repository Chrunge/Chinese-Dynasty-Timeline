// Compile supplemental biographies before statistics, navigation and publication.
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
 function enrichDataset(D){
      if (!D || !Array.isArray(D.people)) return;
      const topicId = D.datasetId || D.timeline?.topic || 'zhou';
      const file=projected.topicToFile[topicId]||(topicId+'.json');
      const figures=projected.dynasties.find(d=>d.datasetFile===file)?.figures||[];
      const peopleMap = new Map((D.people || []).map(p => [p.id, p]));

      for (const fig of figures) {
        let p = peopleMap.get(fig.id);
        if (p) {
          p.biographyPlan = fig.biographyPlan;
          p.servedMonarchs = fig.servedMonarchs;
          p.associatedPolities = fig.associatedPolities;
          p.stageActivities = fig.stageActivities;
          if (!p.role || p.role === '已收录人物') p.role = fig.role;
          if (!p.sources || !p.sources.length) {
            p.sources = Array.isArray(fig.sources) ? fig.sources.slice() : [];
          }
        } else {
          const newPerson = {
            id: fig.id,
            name: fig.name,
            role: fig.role,
            summary: fig.summary,
            sourceIds: (fig.sources || []).map(s => s.id),
            sources: fig.sources || [],
            states: (fig.associatedPolities || []).map(ap => ap.polityId),
            relatedEvents: (fig.biographyPlan?.chapters || []).map(c => c.eventId).filter(Boolean),
            eventIds: (fig.biographyPlan?.chapters || []).map(c => c.eventId).filter(Boolean),
            rulerKeys: (fig.servedMonarchs || []).map(m => 'ruler:' + m.tenureId),
            biographyPlan: fig.biographyPlan,
            servedMonarchs: fig.servedMonarchs,
            associatedPolities: fig.associatedPolities,
            stageActivities: fig.stageActivities,
            journey: (fig.stageActivities || []).map(sa => ({
              id: sa.id,
              label: sa.label,
              text: sa.text,
              kind: sa.kindLabel,
              kindCode: sa.kind,
              state: sa.polityId,
              year: sa.year==null?null:typeof sa.year==='number'?sa.year:toAxis(sa.year),
              approx: sa.approx || false
            }))
          };
          D.people.push(newPerson);
          peopleMap.set(fig.id, newPerson);
        }
      }
 }
 const find=topicId=>book.dynasties.findIndex(d=>d.datasetFile===projected.topicToFile[topicId]);
 function enrich(data){const output=structuredClone(data);enrichDataset(output);return structuredClone(output);}
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
