import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {validateAtlas, compileAtlas} from '../lib/atlas.mjs';
import {prepareAdditionalProduction} from '../lib/production-annotations.mjs';
import {compileProduction} from '../lib/production.mjs';

const collections = ['polities','tenures','people','periods','events','activities','sources'];
const relationTypes = ['eventPolities','eventPeople','tenurePeople','personPolities'];
const inputs = {
  'wei-jin-nan-bei': {sha:'8370c8c485f318f750323dca1df2f1386925004edc06bbf442aba128aeb6bbef',bytes:346234,counts:[28,99,140,5,21,19,86],relations:[48,47,107,151],changes:298},
  'sui-tang': {sha:'5d6acd4b917f24ea2bc1da9aef93149580ae5a8b6b9eda1882bc76ceec94633c',bytes:187345,counts:[10,36,67,6,16,17,48],relations:[29,42,51,79],changes:146},
  'liao-jin-song': {sha:'5e589da17934c7db2adc8ceadf61fb110d79820af3da1dda282071146ecac45e',bytes:213697,counts:[8,58,97,5,12,10,37],relations:[30,52,77,100],changes:196},
  ming: {sha:'1e7b5bf0995d32e4cb46e79afe98a631a48782418f42c6958a8001ea86052b72',bytes:143724,counts:[6,31,54,5,9,10,31],relations:[21,33,47,56],changes:115}
};
const raw = id => JSON.parse(fs.readFileSync(new URL(`../data/${id}.json`, import.meta.url),'utf8'));
const sorted = array => array.map(value=>JSON.stringify(value)).sort();
for (const [id, expected] of Object.entries(inputs)) {
  test(`${id}: original bytes, counts and unmodified input are locked`, () => {
    const bytes=fs.readFileSync(new URL(`../data/${id}.json`,import.meta.url));
    assert.equal(bytes.length,expected.bytes);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),expected.sha);
    const input=raw(id), before=structuredClone(input);
    assert.deepEqual(collections.map(k=>input[k].length),expected.counts);
    assert.deepEqual(relationTypes.map(k=>input.relations[k].length),expected.relations);
    assert.throws(()=>validateAtlas(input),/未知活动类别/);
    const prepared=prepareAdditionalProduction(input,id);
    assert.deepEqual(input,before);
    assert.notEqual(prepared,input);
    assert.deepEqual(prepareAdditionalProduction(prepared,id),prepared);
    assert.equal(prepared.metadata.importNotes[0].changes.length,expected.changes);
  });
  test(`${id}: full validation and compilation preserve every entity, date and relation claim`, () => {
    const input=raw(id), prepared=prepareAdditionalProduction(input,id);
    validateAtlas(prepared);
    const compiled=compileAtlas(prepared);
    for(const k of collections) assert.deepEqual(prepared[k].map(x=>x.id),input[k].map(x=>x.id));
    assert.equal(compiled.events.length,input.events.length);
    assert.equal(compiled.tenures.length,input.tenures.length);
    assert.equal(compiled.people.length,input.people.length);
    const integrated=compileProduction(input,id);
    assert.equal(integrated.datasetId,id);
    assert.equal(integrated.events.length,input.events.length);
    const restored=structuredClone(prepared);
    delete restored.metadata.importNotes;
    for(const k of ['events','activities']) for(const x of restored[k]) if(x.sourceKind){x.kind=x.sourceKind;delete x.sourceKind;}
    for(const p of restored.periods) if(p.sourceStructure){p.structure=p.sourceStructure;delete p.sourceStructure;}
    for(const k of relationTypes){
      restored.relations[k]=restored.relations[k].flatMap(x=>x.sourceEdges || [x]);
      for(const x of restored.relations[k]) if(x.sourceKind){x.kind=x.sourceKind;delete x.sourceKind;}
      assert.deepEqual(sorted(restored.relations[k]),sorted(input.relations[k]));
      restored.relations[k]=input.relations[k]; // Exact source order is recorded by source indices, not inferred.
    }
    assert.deepEqual(restored,input);
  });
}
test('Ming duplicate is one logical pair with both original founded/ended claims retained',()=>{
  const input=raw('ming'), match=e=>e.eventId==='ming-event-09-southern-ming-zheng-taiwan'&&e.polityId==='southern-ming';
  const original=input.relations.eventPolities.filter(match);
  assert.deepEqual(original.map(e=>e.kind),['founded','ended']);
  const output=prepareAdditionalProduction(input,'ming');
  assert.equal(output.relations.eventPolities.length,20);
  const projected=output.relations.eventPolities.filter(match);
  assert.equal(projected.length,1);
  assert.equal(projected[0].kind,'involved');
  assert.deepEqual(projected[0].sourceEdges,original);
  assert.equal(projected[0].sourceKind,undefined);
});
test('Old and unknown IDs are identity no-ops',()=>{
  const input={untouched:true};
  for(const id of ['zhou','qin-han','three-kingdoms','unknown',undefined]) assert.equal(prepareAdditionalProduction(input,id),input);
});
test('Unknown kinds, unrelated duplicate pairs and invalid dates still fail baseline validation',()=>{
  const unknown=raw('sui-tang');unknown.activities[0].kind='unapproved-kind';
  assert.throws(()=>validateAtlas(prepareAdditionalProduction(unknown,'sui-tang')),/未知活动类别/);
  const duplicate=raw('ming');duplicate.relations.eventPolities.push(structuredClone(duplicate.relations.eventPolities[0]));
  assert.throws(()=>validateAtlas(prepareAdditionalProduction(duplicate,'ming')),/重复关联/);
  const badDate=raw('liao-jin-song');badDate.events[0].year={era:'CE',year:0};
  assert.throws(()=>validateAtlas(prepareAdditionalProduction(badDate,'liao-jin-song')),/年份/);
});
test('Original shared Three Kingdoms IDs remain separate, with dates and descriptions unmerged',()=>{
  const old=raw('three-kingdoms'), newer=raw('wei-jin-nan-bei');
  const shared=collections.flatMap(k=>newer[k].filter(x=>old[k].some(y=>y.id===x.id)).map(x=>[k,x.id]));
  assert.equal(shared.length,9);
  assert.deepEqual(shared.filter(([k])=>k==='people').map(([,id])=>id),['tk-person-sima-yan','tk-person-yang-hu','tk-person-du-yu']);
  const oldPerson=old.people.find(x=>x.id==='tk-person-sima-yan');
  const newPerson=newer.people.find(x=>x.id===oldPerson.id);
  assert.notEqual(oldPerson.summary,newPerson.summary);
  assert.deepEqual(prepareAdditionalProduction(newer,'wei-jin-nan-bei').people.find(x=>x.id===oldPerson.id),newPerson);
});
