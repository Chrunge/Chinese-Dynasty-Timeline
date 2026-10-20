import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalog} from '../lib/production.mjs';
import {buildCorpus} from '../lib/corpus.mjs';
test('出处索引明确区分后凉/后梁和武周/吴周的原ID碰撞，不计作共享实体',()=>{
 const input=catalog.map(t=>({...t,sourceSha256:'test',atlas:JSON.parse(fs.readFileSync(new URL('../data/'+t.file,import.meta.url)))}));
 const before=JSON.stringify(input),corpus=buildCorpus(input);
 assert.equal(JSON.stringify(input),before);
 assert.equal(corpus.identityConflicts.length,2);
 for(const [id,topics] of [['later-liang',['wei-jin-nan-bei','five-dynasties']],['wu-zhou',['sui-tang','qing']]]){
  const entity=corpus.entities.polities.find(e=>e.id===id);
  assert.equal(entity.identityScope,'dataset');
  assert.deepEqual(new Set(entity.identityKeys),new Set(topics.map(t=>t+'/'+id)));
  assert.equal(entity.appearances.length,2,'不抹去原出处');
  assert.equal(corpus.identityConflicts.find(e=>e.id===id).collection,'polities');
 }
 assert.equal(corpus.scopedEntityCounts.polities,corpus.entityCounts.polities+2);
 assert.equal(corpus.sharedEntityCounts.polities,corpus.entities.polities.filter(e=>e.appearances.length>1).length-2);
 const zhou=corpus.entities.polities.find(e=>e.id==='zhou');
 assert.equal(zhou.identityScope,'stable-id','原卷的周朝前期/王朝阶段不是两个不同国家');
 assert(zhou.differingFields.includes('start'));
});
