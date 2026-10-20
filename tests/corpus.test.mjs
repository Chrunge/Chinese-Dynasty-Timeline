import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildCorpus} from '../lib/corpus.mjs';
import {catalog} from '../lib/production.mjs';
const entries=()=>catalog.map(t=>{const bytes=fs.readFileSync(new URL('../data/'+t.file,import.meta.url));return {...t,file:'data/'+t.file,sourceSha256:createHash('sha256').update(bytes).digest('hex'),atlas:JSON.parse(bytes)};});
test('资料索引保留稳定ID、原始出处、同ID多卷差异，不按名字合并',()=>{
 const input=entries(),before=JSON.stringify(input),corpus=buildCorpus(input);
 assert.equal(JSON.stringify(input),before);assert.equal(corpus.topics.length,11);
 const jin=corpus.entities.polities.find(p=>p.id==='western-jin');assert.equal(jin.appearances.length,2);assert(jin.differingFields.length>0);
 const wendi=corpus.entities.tenures.find(p=>p.id==='st-tenure-sui-wendi');assert.equal(wendi.appearances.length,2);
 for(const collection of Object.values(corpus.entities))for(const entity of collection){
  for(const appearance of entity.appearances){const source=input.find(x=>x.id===appearance.datasetId),[,field,index]=appearance.path.split('/');assert.equal(source.atlas[field][Number(index)].id,entity.id);assert.match(appearance.sha256,/^[a-f0-9]{64}$/);}
 }
 const rendered=JSON.parse(fs.readFileSync(new URL('../dist/corpus.json',import.meta.url)));assert.deepEqual(rendered,corpus);
});
test('索引以类型和ID分离身份、内容比较不受对象字段顺序影响且拒绝卷内重复ID',()=>{
 const mk=(id,people)=>({id,name:id,file:id+'.json',sourceSha256:'test',atlas:{schemaVersion:2,people}});
 const corpus=buildCorpus([mk('a',[{id:'p',name:'同名'},{id:'q',name:'同名'}]),mk('b',[{name:'同名',id:'p'}])]);
 assert.equal(corpus.entityCounts.people,2);assert.equal(corpus.sharedEntityCounts.people,1);assert.deepEqual(corpus.entities.people[0].differingFields,[]);
 assert.equal(corpus.entities.people[0].appearances[0].sha256,corpus.entities.people[0].appearances[1].sha256);
 assert.throws(()=>buildCorpus([mk('a',[{id:'p'},{id:'p'}])]),/Invalid corpus identity/);
 assert.throws(()=>buildCorpus([mk('a',[]),mk('a',[])]),/Duplicate corpus dataset/);
});
