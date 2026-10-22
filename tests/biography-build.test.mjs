import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {catalog,compileProduction} from '../lib/production.mjs';
import {buildCorpus} from '../lib/corpus.mjs';
import {createBiographyCompiler,biographySource} from '../lib/biography.mjs';
const bytes=readFileSync(biographySource,'utf8'),book=JSON.parse(bytes),compiler=createBiographyCompiler(book);
const digest=value=>createHash('sha256').update(value).digest('hex');
const signature=value=>digest(JSON.stringify(value));
const baseline=JSON.parse(readFileSync('tests/fixtures/biography-projections.json','utf8'));
const resolvePath=(value,path)=>path.split('/').slice(1).reduce((v,k)=>v[k],value);

test('AR01: published data already contains each characterized runtime biography',()=>{
 for(const topic of catalog){
  const base=compileProduction(JSON.parse(readFileSync('data/'+topic.file,'utf8')),topic.id),before=JSON.stringify(base);
  const data=compiler.enrich(base);assert.equal(JSON.stringify(base),before);
  assert.equal(signature(data),baseline[topic.id].sha256,topic.id);
  const ctx={};runInNewContext(readFileSync('dist/'+(topic.id==='zhou'?'data.js':'data-'+topic.id+'.js'),'utf8'),{window:ctx});
  assert.equal(signature(ctx.ZHOU_DATA),signature(data));
  const release=JSON.parse(readFileSync('dist/release.json','utf8'));
  assert.equal(release.datasets.find(t=>t.id===topic.id).counts.people,data.people.length);
 }
 assert(!readFileSync('src/app.js','utf8').includes('enrichDataset'));
});
test('AR01: supplemental provenance resolves to exact authored figures and sources',()=>{
 const corpus=JSON.parse(readFileSync('dist/corpus.json','utf8'));
 for(const topic of catalog){
  const provenance=compiler.provenance(topic.id,digest(bytes));assert.equal(provenance.length,1);
  for(const [kind,records] of Object.entries(provenance[0].records))for(const {record,path} of records){
   assert.deepEqual(resolvePath(book,path),record);
   assert(corpus.entities[kind].find(e=>e.id===record.id).appearances.some(a=>a.datasetId===topic.id&&a.file===biographySource&&a.path===path));
  }
 }
 const counts=buildCorpus([{id:'a',atlas:{people:[{id:'p'}]},supplements:[{file:'book.json',records:{people:[{record:{id:'p'},path:'/figures/0'}]}}]}]);
 assert.equal(counts.sharedEntityCounts.people,0,'two sources in one topic are not cross-topic sharing');
});
test('AR01: all authored reference states are explicit and verified',()=>{
 const diagnostics=JSON.parse(readFileSync('dist/biography-diagnostics.json','utf8'));
 const data=new Map(catalog.map(topic=>[topic.id,compiler.enrich(compileProduction(JSON.parse(readFileSync('data/'+topic.file,'utf8')),topic.id))]));
 const reports=catalog.map(topic=>compiler.inspectReferences(data.get(topic.id),topic.id,data));
 assert.deepEqual(diagnostics.issues,reports.flatMap(r=>r.issues));assert.deepEqual(diagnostics.issues,[]);
 assert.deepEqual(diagnostics.externalReferences,reports.flatMap(r=>r.externalReferences));
 assert.deepEqual(diagnostics.unindexedReferences,reports.flatMap(r=>r.unindexedReferences));
 assert.equal(diagnostics.externalReferences.length,7);assert.equal(diagnostics.unindexedReferences.length,2);
 for(const reference of diagnostics.externalReferences)assert.equal(resolvePath(book,reference.path),reference.id);
 for(const reference of diagnostics.unindexedReferences)assert.equal(resolvePath(book,reference.path).originalId,reference.originalId);
});
test('AR01: duplicate figures and invalid dates fail before publishing',()=>{
 const duplicate=structuredClone(book);duplicate.dynasties[0].figures.push(duplicate.dynasties[0].figures[0]);
 assert.throws(()=>createBiographyCompiler(duplicate),/ID/);
 const invalid=structuredClone(book);invalid.dynasties[0].figures[0].biographyPlan.chapters[0].year={era:'CE',year:0};
 assert.throws(()=>createBiographyCompiler(invalid),/年份/);
 const first=compiler.enrich(compileProduction(JSON.parse(readFileSync('data/atlas.json','utf8')),'zhou'));
 first.people.find(p=>p.biographyPlan).biographyPlan.chapters[0].title='mutated';
 const second=compiler.enrich(compileProduction(JSON.parse(readFileSync('data/atlas.json','utf8')),'zhou'));
 assert.equal(signature(second),baseline.zhou.sha256,'compiled datasets never share mutable biography records');
});

test('AR01: publication corpus exactly rebuilds from authored topic and biography sources',()=>{
 const entries=catalog.map(topic=>{
  const source=readFileSync('data/'+topic.file,'utf8');
  return {...topic,file:'data/'+topic.file,sourceSha256:digest(source),atlas:JSON.parse(source),supplements:compiler.provenance(topic.id,digest(bytes))};
 });
 assert.deepEqual(JSON.parse(readFileSync('dist/corpus.json','utf8')),buildCorpus(entries));
});
