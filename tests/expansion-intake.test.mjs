import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {validateAtlas} from '../lib/atlas.mjs';
import {prepareExpansionProduction} from '../lib/expansion-annotations.mjs';

const collections=['polities','tenures','people','periods','events','activities','sources'];
const relations=['eventPolities','eventPeople','tenurePeople','personPolities'];
const expected={
  'xia-shang':{bytes:179704,sha:'496c80210607fcb70fbbaaa3aa38bd360f1ebfa26dd3938f9578ab9dac2ebfdb',counts:[6,53,67,5,13,10,14],relations:[25,44,66,69],coalesced:1,changes:183},
  'five-dynasties':{bytes:182004,sha:'943aa7f457f3cab0df171ff4b20be74c89798aa74ead5408b4b8abe35bd492d6',counts:[17,59,69,5,7,10,25],relations:[36,29,68,74],coalesced:2,changes:184},
  yuan:{bytes:124499,sha:'10f88ae6bc41956afa746e9cd6db85494e06e747415245561965fcec71422d37',counts:[11,25,39,5,8,10,21],relations:[24,31,38,42],coalesced:4,changes:107},
  qing:{bytes:123589,sha:'78067278fb6b4adfb7b73b70f9766556a065cb22822e75b10a6e4aac53ea6661',counts:[7,19,39,5,9,10,23],relations:[22,36,38,43],coalesced:3,changes:101}
};
const raw=id=>JSON.parse(fs.readFileSync(new URL(`../data/${id==='zhou'?'atlas':id}.json`,import.meta.url),'utf8'));
const sorted=values=>values.map(v=>JSON.stringify(v)).sort();
for(const[id,lock]of Object.entries(expected)){
  test(`${id}: bytes, SHA256, counts, pure idempotent projection`,()=>{
    const bytes=fs.readFileSync(new URL(`../data/${id}.json`,import.meta.url));
    assert.equal(bytes.length,lock.bytes);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),lock.sha);
    const input=raw(id),before=structuredClone(input);
    assert.deepEqual(collections.map(k=>input[k].length),lock.counts);
    assert.deepEqual(relations.map(k=>input.relations[k].length),lock.relations);
    assert.throws(()=>validateAtlas(input),id==='xia-shang'?/重复来源 URL/:/未知活动类别/);
    const out=prepareExpansionProduction(input,id);
    assert.notEqual(out,input);
    assert.deepEqual(input,before);
    assert.deepEqual(prepareExpansionProduction(out,id),out);
    assert.equal(out.metadata.importNotes.at(-1).changes.length,lock.changes);
    validateAtlas(out);
  });
  test(`${id}: entity order is unchanged; all original dates, text and relation claims are recoverable`,()=>{
    const input=raw(id),out=prepareExpansionProduction(input,id);
    const restored=structuredClone(out);
    delete restored.metadata.importNotes;
    for(const k of collections){
      assert.deepEqual(out[k].map(v=>v.id),input[k].map(v=>v.id));
      for(const r of restored[k]){
        if(r.sourceKind){r.kind=r.sourceKind;delete r.sourceKind;}
        if(r.sourceStructure){r.structure=r.sourceStructure;delete r.sourceStructure;}
        if(r.sourceDating){r.dating=r.sourceDating;delete r.sourceDating;}
        if(r.sourceUrl){r.url=r.sourceUrl;delete r.sourceUrl;delete r.urlProjectionNote;}
      }
    }
    for(const k of relations){
      restored.relations[k]=restored.relations[k].flatMap(r=>r.sourceEdges || [r]);
      for(const r of restored.relations[k]){
        if(r.sourceKind){r.kind=r.sourceKind;delete r.sourceKind;}
        if(r.affiliationScope){delete r.affiliationScope;delete r.affiliationNote;}
      }
      assert.deepEqual(sorted(restored.relations[k]),sorted(input.relations[k]));
      // Original indexed relation order remains present in immutable source input.
      restored.relations[k]=input.relations[k];
    }
    assert.deepEqual(restored,input);
    assert.equal(out.relations.eventPolities.length,input.relations.eventPolities.length-lock.coalesced);
    const merged=out.relations.eventPolities.filter(e=>e.sourceEdges);
    assert.equal(merged.length,lock.coalesced);
    for(const edge of merged){
      assert.equal(edge.kind,'involved');
      assert.deepEqual(edge.sourceEdges,input.relations.eventPolities.filter(e=>e.eventId===edge.eventId&&e.polityId===edge.polityId));
      assert.deepEqual(edge.sourceEdges.map(e=>e.kind),['founded','ended']);
    }
  });
}
const datingIds=[
  'xia','shang','xs-period-late-shang-yin','xs-tenure-xia-01-yu','xs-tenure-xia-17-jie','xs-tenure-shang-01-tang',
  'xs-tenure-shang-19-pangeng','xs-tenure-shang-22-wuding','xs-tenure-shang-27-wuyi','xs-tenure-shang-28-wending',
  'xs-tenure-shang-29-diyi','xs-tenure-shang-30-dixin','zhou-r0','xs-event-01-yu-flood-founding-xia',
  'xs-event-05-mingtiao-tang-founding-shang','xs-event-08-pangeng-move-to-yin','xs-event-09-wuding-fuhao-golden-age','xs-event-11-zhou-danfu-jili-rise'
];
test('Xia-Shang: only eighteen exact dating records inherit legacy; none claims new independent alternatives',()=>{
  const input=raw('xia-shang'),out=prepareExpansionProduction(input,'xia-shang');
  const original=collections.flatMap(k=>input[k]),records=collections.flatMap(k=>out[k]);
  const changed=records.filter(r=>r.sourceDating);
  assert.deepEqual(changed.map(r=>r.id).sort(),[...datingIds].sort());
  assert.equal(changed.filter(r=>r.sourceDating.alternatives.length===0).length,14);
  for(const r of changed){
    const source=original.find(x=>x.id===r.id);
    assert.deepEqual(r.sourceDating,source.dating);
    assert.equal(r.dating.level,'disputed');
    assert.equal(r.dating.reviewStatus,'legacy');
    assert.equal(r.dating.reason,source.dating.reason);
    if(source.dating.alternatives.length){assert.deepEqual(r.dating.alternatives,source.dating.alternatives);continue;}
    assert.deepEqual(r.dating.alternatives,[{label:'原作者采用口径（非新增独立异说）',year:source.start||source.year,explanation:source.dating.reason,sourceIds:source.sourceIds}]);
  }
  for(const r of records.filter(r=>r.dating&&!r.sourceDating)) assert.deepEqual(r.dating,original.find(x=>x.id===r.id).dating);
});
test('Xia-Shang: changed evidence or unknown IDs never receive invented dating repairs',()=>{
  for(const edit of [r=>r.dating.reason+=' EDIT',r=>r.start.year++,r=>r.sourceIds.reverse()]){
    const input=raw('xia-shang'),r=input.tenures[0];edit(r);
    assert.throws(()=>validateAtlas(prepareExpansionProduction(input,'xia-shang')),/异说须列明口径/);
  }
  const input=raw('xia-shang');input.tenures.push({...structuredClone(input.tenures[0]),id:'unknown-new-tenure'});
  assert.throws(()=>validateAtlas(prepareExpansionProduction(input,'xia-shang')),/异说须列明口径/);
});
test('Xia-Shang: unique documented source fragment is technical, not an asserted chapter anchor',()=>{
  const input=raw('xia-shang'),out=prepareExpansionProduction(input,'xia-shang');
  assert.equal(out.sources.length,14);
  const source=input.sources.find(s=>s.id==='xs-source-shangshu-mushi');
  const projected=out.sources.find(s=>s.id===source.id);
  assert.equal(projected.sourceUrl,source.url);
  assert.equal(projected.url,source.url+'#atlas-source-xs-source-shangshu-mushi');
  assert.match(projected.urlProjectionNote,/不声称网页存在/);
  assert.deepEqual({...projected,url:source.url,sourceUrl:undefined,urlProjectionNote:undefined},{...source,sourceUrl:undefined,urlProjectionNote:undefined});
  assert.deepEqual(out.sources.find(s=>s.id==='xs-source-shangshu-pangeng'),input.sources.find(s=>s.id==='xs-source-shangshu-pangeng'));
  for(const k of collections)assert.deepEqual(out[k].map(r=>r.sourceIds),input[k].map(r=>r.sourceIds));
  const unknown=raw('xia-shang');unknown.sources.push({...structuredClone(source),id:'unknown-source-duplicate'});
  assert.throws(()=>validateAtlas(prepareExpansionProduction(unknown,'xia-shang')),/重复来源 URL/);
});
test('Xia-Shang: Xie affiliation is contextual, never a new event-polity claim',()=>{
  const input=raw('xia-shang'),out=prepareExpansionProduction(input,'xia-shang');
  const edge=out.relations.eventPeople.find(e=>e.personId==='xs-person-xie-shang'&&e.eventId==='xs-event-01-yu-flood-founding-xia');
  assert.equal(edge.polityId,'shang');assert.equal(edge.affiliationScope,'contextual');
  assert.equal(out.relations.eventPolities.some(e=>e.eventId===edge.eventId&&e.polityId==='shang'),false);
});
test('Native politics/diplomacy remain untouched; unknown categories, duplicate pairs and zero year still fail',()=>{
  const input=raw('five-dynasties'),out=prepareExpansionProduction(input,'five-dynasties');
  for(const activity of input.activities.filter(a=>['politics','diplomacy'].includes(a.kind)))assert.deepEqual(out.activities.find(a=>a.id===activity.id),activity);
  const unknown=raw('qing');unknown.activities[0].kind='unapproved-kind';
  assert.throws(()=>validateAtlas(prepareExpansionProduction(unknown,'qing')),/未知活动类别/);
  const duplicate=raw('yuan');duplicate.relations.eventPolities.push(structuredClone(duplicate.relations.eventPolities[0]));
  assert.throws(()=>validateAtlas(prepareExpansionProduction(duplicate,'yuan')),/重复关联/);
  const zero=raw('qing');zero.events[0].year={era:'CE',year:0};
  assert.throws(()=>validateAtlas(prepareExpansionProduction(zero,'qing')),/年份/);
});
test('Old and unknown dataset IDs are identity no-ops',()=>{
  const input={untouched:true};for(const id of ['zhou','qin-han','three-kingdoms','wei-jin-nan-bei','sui-tang','liao-jin-song','ming','unknown',undefined])assert.equal(prepareExpansionProduction(input,id),input);
});
test('All 28 comparisons with seven previous topics retain exact shared-ID records without merging',()=>{
  const oldIds=['zhou','qin-han','three-kingdoms','wei-jin-nan-bei','sui-tang','liao-jin-song','ming'];
  const totals={};
  for(const id of Object.keys(expected)){
    const input=raw(id),out=prepareExpansionProduction(input,id);totals[id]=0;
    for(const other of oldIds){const old=raw(other);
      for(const k of collections){const prev=old[k]||(k==='polities'?old.states:k==='tenures'?old.rulers:[])||[];
        for(const record of input[k].filter(r=>prev.some(v=>v.id===r.id))){
          totals[id]++;const projected=out[k].find(r=>r.id===record.id);
          for(const field of ['id','name','summary','start','end','chronology','sourceIds','note'])assert.deepEqual(projected[field],record[field]);
        }
      }
    }
  }
  assert.deepEqual(totals,{'xia-shang':11,'five-dynasties':15,yuan:23,qing:18});
  const liang=raw('five-dynasties').polities.find(p=>p.id==='later-liang'),oldLiang=raw('wei-jin-nan-bei').polities.find(p=>p.id===liang.id);
  assert.equal(liang.name,'后梁');assert.equal(oldLiang.name,'后凉');assert.equal(liang.start.year,907);assert.equal(oldLiang.start.year,386);
  const wu=raw('qing').polities.find(p=>p.id==='wu-zhou'),oldWu=raw('sui-tang').polities.find(p=>p.id===wu.id);
  assert.equal(wu.start.year,1673);assert.equal(oldWu.start.year,690);
});
