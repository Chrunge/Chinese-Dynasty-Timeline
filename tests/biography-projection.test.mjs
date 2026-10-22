import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createContext,runInContext} from 'node:vm';
import {catalog,compileProduction} from '../lib/production.mjs';
const ctx=createContext({});
for(const file of ['src/core/time.js','src/core/person-activities.js','src/core/biography-data.js','src/core/biography.js'])runInContext(readFileSync(file,'utf8'),ctx);
const bio=ctx.Zhou.Biography,plain=value=>JSON.parse(JSON.stringify(value));
const baseline=JSON.parse(readFileSync('tests/fixtures/biography-projections.json','utf8'));

test('AR03: all eleven effective topic projections retain their characterized data',()=>{
 for(const topic of catalog){
  const input=JSON.parse(readFileSync('data/'+topic.file,'utf8')),before=JSON.stringify(input);
  const data=compileProduction(input,topic.id);bio.enrichDataset(data);
  assert.equal(JSON.stringify(input),before,topic.id+' source is immutable');
  assert.equal(data.people.length,baseline[topic.id].people,topic.id);
  assert.equal(createHash('sha256').update(JSON.stringify(data)).digest('hex'),baseline[topic.id].sha256,topic.id);
 }
});
test('AR03: trajectory retains journey fallback, coordinates and input immutability',()=>{
 const person={journey:[{year:356,state:'qin',label:'变法',kind:'改革',text:'明确活动'}]},before=JSON.stringify(person);
 const points=bio.getTrajectoryPoints(person,new Map([['qin',{offset:10,height:20}]]),year=>year*2,100);
 assert.deepEqual(plain(points),[{seq:1,year:356,polityId:'qin',x:812,y:20,label:'变法',kindLabel:'改革',text:'明确活动'}]);
 assert.equal(JSON.stringify(person),before);assert.equal(bio.buildTrajectoryPath(points),'');
});
test('AR03: trajectories prefer explicit stages, then chapters, without inventing dates',()=>{
 const layouts=new Map([['song',{offset:20,height:40}]]),journey=[{year:-1068,state:'song'}];
 const chapter={chapterNo:2,year:{era:'CE',year:1070},polityId:'song',title:'章节'};
 const fromChapter=bio.getTrajectoryPoints({journey,biographyPlan:{chapters:[chapter]}},layouts,y=>y,0);
 assert.equal(fromChapter.length,1);assert.equal(fromChapter[0].year,-1069);
 const stages=[{sequence:1,year:null,polityId:'song'},{sequence:2,year:{era:'CE',year:1071},polityId:'song'}];
 const fromStages=bio.getTrajectoryPoints({journey,biographyPlan:{chapters:[chapter]},stageActivities:stages},layouts,y=>y,0);
 assert.equal(fromStages.length,1);assert.equal(fromStages[0].year,-1070);
 assert.deepEqual(plain(bio.getTrajectoryPoints({journey:[{year:null,state:'song'}]},layouts,y=>y,0)),[]);
});

test('AR03: generated data is fresh and generation excludes runtime algorithms',async()=>{
 const {renderBiographyData}=await import('../lib/biography-data.mjs');
 const book=JSON.parse(readFileSync('data/中国历代非君主人物传记全书.json','utf8'));
 assert.equal(readFileSync('src/core/biography-data.js','utf8'),renderBiographyData(book));
 assert(!renderBiographyData(book).includes('getTrajectoryPoints'));
});
