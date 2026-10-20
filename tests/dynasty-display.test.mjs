import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {annotateDynastyDisplay} from '../lib/dynasty-display.mjs';
import {toAxis} from '../lib/time.mjs';

const datasets = [
  ['wei-jin-nan-bei',99,20],['sui-tang',36,9],['liao-jin-song',58,7],['ming',31,5]
];
const readInput = id => JSON.parse(readFileSync(new URL(`../data/${id}.json`,import.meta.url),'utf8'));
const freeze = value => {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const item of Object.values(value)) freeze(item);
  }
  return value;
};
const projectDates = value => {
  if (Array.isArray(value)) return value.map(projectDates);
  if (!value || typeof value !== 'object') return value;
  if (value.era) return toAxis(value);
  return Object.fromEntries(Object.entries(value).map(([key,item]) => [key,projectDates(item)]));
};
// Minimal independent projection fixture: isolate additive display from the production
// normalizer. Integration below separately exercises the actual compilation path.
const project = input => {
  const data = projectDates(input);
  return {...data,states:data.polities.map(state => ({...structuredClone(state),
    rulers:data.tenures.filter(t => t.polityId === state.id).map(t => ({...structuredClone(t),stateId:state.id}))
  }))};
};
const fresh = id => project(readInput(id));
const annotate = id => annotateDynastyDisplay(fresh(id),id);
const stripAnnotations = data => {
  const copy = structuredClone(data);
  delete copy.presentation;
  for (const tenure of [...copy.tenures,...copy.states.flatMap(s => s.rulers)]) delete tenure.display;
  return copy;
};
const context = vm.createContext({});
vm.runInContext(readFileSync(new URL('../src/core/presentation.js',import.meta.url),'utf8'),context);
const P = context.Zhou.Presentation;
const plain = value => JSON.parse(JSON.stringify(value));
const rowOf = (data,id) => P.rows(data.states,data.presentation).find(row => row.members.some(s => s.id === id));
const ruler = (data,id) => data.tenures.find(t => t.id === id);
const lanes = (data,records) => P.pack(records,data.timeline.start,data.timeline.end);

for (const [id,count,rowCount] of datasets) {
  test(`${id}: every tenure and ruler copy has an explicit ID-bound display; original records are intact`,() => {
    const input = freeze(readInput(id)),original = JSON.stringify(input),projection = project(input);
    const before = structuredClone(projection);
    assert.equal(annotateDynastyDisplay(projection,id),projection);
    assert.equal(projection.tenures.length,count);
    assert.deepEqual(stripAnnotations(projection),before);
    assert.equal(JSON.stringify(input),original);
    const copies = projection.states.flatMap(s => s.rulers);
    assert.equal(copies.length,count);
    for (const t of projection.tenures) {
      assert.equal(typeof t.display.shortTitle,'string',t.id);
      assert(t.display.personalName.length,t.id);
      assert(input.people.find(p => p.id === t.personId).name.includes(t.display.personalName),t.id);
      const copy = copies.find(r => r.id === t.id);
      assert.deepEqual(copy.display,t.display,t.id);
      assert.notEqual(copy.display,t.display,'copies must not share mutable display objects');
      assert.equal(P.rulerLabel(t),[t.display.shortTitle,t.display.personalName].filter(Boolean).join(' '));
    }
    assert.equal(P.rows(projection.states,projection.presentation).length,rowCount);
  });

  test(`${id}: valid disjoint groups keep chronology lane counts small and preserve every polity/tenure`,() => {
    const data = annotate(id),seen = new Set();
    assert.equal(data.presentation.version,1);
    for (const group of data.presentation.rowGroups) {
      assert(group.name && group.note.includes('实体ID不变'));
      assert(group.stateIds.length >= 2 && group.stateIds.length <= 4);
      for (const stateId of group.stateIds) {
        assert(data.states.some(state => state.id === stateId),stateId);
        assert(!seen.has(stateId),'a polity must not be assigned to multiple rows: '+stateId);
        seen.add(stateId);
      }
    }
    const rows = P.rows(data.states,data.presentation);
    assert.deepEqual(Array.from(rows.flatMap(row => row.members.map(s => s.id))).sort(),data.states.map(s => s.id).sort());
    for (const row of rows.filter(row => row.grouped)) {
      const statePack = lanes(data,row.members),tenurePack = lanes(data,row.members.flatMap(s => s.rulers));
      assert(statePack.lanes <= 2,'overlarge polity group: '+row.key);
      assert(tenurePack.lanes <= 3,'overlarge tenure group: '+row.key);
      assert.equal(statePack.items.length,row.members.length);
      assert.equal(tenurePack.items.length,row.members.flatMap(s => s.rulers).length);
    }
  });

  test(`${id}: annotation is deterministic, idempotent, and has no shared group mutations`,() => {
    const first = annotate(id),snapshot = structuredClone(first);
    assert.deepEqual(annotate(id),snapshot);
    assert.deepEqual(annotateDynastyDisplay(first,id),snapshot);
    first.presentation.rowGroups[0].stateIds.push('not-a-polity');
    first.presentation.rowGroups[0].name = 'changed by caller';
    assert.deepEqual(annotate(id),snapshot);
  });

  test(`${id}: production integration retains identities and leaves source input unchanged`,async () => {
    const {compileProduction,prepareProduction} = await import('../lib/production.mjs');
    const {compileAtlas} = await import('../lib/atlas.mjs');
    const input = freeze(readInput(id)),before = JSON.stringify(input);
    const data = compileProduction(input,id),baseline = compileAtlas(prepareProduction(input,id));
    const withoutDisplay = stripAnnotations(data);
    delete withoutDisplay.datasetId;
    delete withoutDisplay.catalog;
    assert.deepEqual(withoutDisplay,baseline);
    assert.equal(JSON.stringify(input),before);
    assert.equal(data.tenures.length,count);
    assert(data.tenures.every(t => t.display && t.name && t.sources.length));
    assert(data.states.flatMap(s => s.rulers).every(r => r.display));
  });
}

test('ID binding never depends on person or ruler names, traversal order, or a single record per person',() => {
  const data = fresh('sui-tang'),expected = annotate('sui-tang');
  data.people.forEach(p => {p.name = '同名人物';});
  for (const t of [...data.tenures,...data.states.flatMap(s => s.rulers)]) t.name = '同名任期';
  data.tenures.reverse();data.states.reverse();data.states.forEach(s => s.rulers.reverse());
  annotateDynastyDisplay(data,'sui-tang');
  for (const t of data.tenures) assert.deepEqual(t.display,ruler(expected,t.id).display);
  for (const [a,b,name] of [
    ['st-tenure-tang-zhongzong-1','st-tenure-tang-zhongzong-2','李显'],
    ['st-tenure-tang-ruizong-1','st-tenure-tang-ruizong-2','李旦'],
    ['st-tenure-tang-wuhou-regency','st-tenure-wuzhou-wuzetian','武则天']
  ]) {
    const first = ruler(data,a),second = ruler(data,b);
    assert.equal(first.personId,second.personId);
    assert.equal(first.display.personalName,name);
    assert.equal(second.display.personalName,name);
    assert.notEqual(first.display.shortTitle,second.display.shortTitle);
    assert.notEqual(first.id,second.id);
    assert.notEqual(first.start,second.start);
  }
});

test('Every nonempty short title has explicit local source wording; restoration suffixes are only display markers',() => {
  for (const [id] of datasets) {
    const input = readInput(id),data = annotate(id);
    for (const record of data.tenures) {
      const title = record.display.shortTitle.replace(/（(?:初任|复位)）$/u,'');
      if (!title) continue;
      const original = input.tenures.find(t => t.id === record.id);
      const person = input.people.find(p => p.id === original.personId);
      assert([original.name,original.role,JSON.stringify(person)].some(text => text.includes(title)),`${id}/${record.id}: ${title}`);
    }
  }
  const tang = readInput('sui-tang');
  for (const id of ['st-tenure-tang-zhongzong-1','st-tenure-tang-ruizong-1']) assert.match(tang.tenures.find(t => t.id === id).name,/首次在位/);
  assert.match(tang.tenures.find(t => t.id === 'st-tenure-tang-zhongzong-2').name,/神龙复辟/);
  assert.match(tang.tenures.find(t => t.id === 'st-tenure-tang-ruizong-2').name,/二次在位/);
});

test('Zhu Qizhen restoration retains two reigns; regents are not relabelled as emperors',() => {
  const ming = annotate('ming'),wj = annotate('wei-jin-nan-bei');
  const early = ruler(ming,'ymq-tenure-ming-zhengtong'),late = ruler(ming,'ymq-tenure-ming-tianshun');
  assert.equal(early.personId,late.personId);
  assert.deepEqual([early.display.shortTitle,late.display.shortTitle],['正统帝','天顺帝']);
  assert.equal(early.display.personalName,'朱祁镇');
  for (const [id,name] of [['wj-tenure-ewei-gaohuan','高欢'],['wj-tenure-wwei-yuwentai','宇文泰'],['wj-tenure-wei-fengtaihou','冯太后']]) {
    const record = ruler(wj,id);
    assert.deepEqual(record.display,{shortTitle:'',personalName:name});
    assert.equal(P.rulerLabel(record),name);
    assert(record.role && record.name && record.sourceIds.length);
  }
  assert.equal(ruler(annotate('sui-tang'),'st-tenure-tang-wuhou-regency').display.shortTitle,'武太后');
});

test('Wei/Jin branches and the sixteen contemporaneous polities are not turned into one dynasty',() => {
  const data = annotate('wei-jin-nan-bei');
  assert.equal(rowOf(data,'western-jin').key,rowOf(data,'eastern-jin').key);
  assert.equal(rowOf(data,'liu-song').key,rowOf(data,'southern-chen').key);
  assert.equal(rowOf(data,'northern-wei').key,rowOf(data,'northern-qi').key);
  assert.equal(rowOf(data,'western-wei').key,rowOf(data,'sui').key);
  assert.notEqual(rowOf(data,'eastern-wei').key,rowOf(data,'western-wei').key);
  assert.notEqual(rowOf(data,'northern-qi').key,rowOf(data,'northern-zhou').key);
  assert.notEqual(rowOf(data,'eastern-jin').key,rowOf(data,'liu-song').key,'avoid one giant Jin-to-Chen row');
  for (const id of ['former-liang','cheng-han','han-zhao','later-zhao','former-yan','former-qin','later-yan','later-qin','western-qin','later-liang','southern-liang','northern-liang','southern-yan','western-liang','hu-xia','northern-yan']) {
    assert.equal(rowOf(data,id).grouped,false,id);
  }
  const north = rowOf(data,'northern-wei'),pack = lanes(data,north.members.flatMap(s => s.rulers));
  const regent = pack.items.find(t => t.id === 'wj-tenure-wei-fengtaihou');
  const emperor = pack.items.find(t => t.id === 'wj-tenure-wei-xiaowendi');
  assert.notEqual(regent.displayLane,emperor.displayLane,'regency and emperor remain simultaneous');
});

test('Sui/Tang succession preserves Wu Zhou and Tang overlap on independent rows',() => {
  const data = annotate('sui-tang'),tang = data.states.find(s => s.id === 'tang');
  const wu = data.states.find(s => s.id === 'wu-zhou');
  assert.equal(rowOf(data,'sui').key,rowOf(data,'tang').key);
  assert.notEqual(rowOf(data,'tang').key,rowOf(data,'wu-zhou').key);
  assert.equal(rowOf(data,'wu-zhou').grouped,false);
  assert(tang.start >= wu.start && tang.end <= wu.end);
  const both = P.rows(data.states.filter(s => s.start >= toAxis({era:'CE',year:700}) && s.end <= toAxis({era:'CE',year:700})),data.presentation);
  assert(both.some(row => row.members.some(s => s.id === 'tang')));
  assert(both.some(row => row.members.some(s => s.id === 'wu-zhou')));
  for (const id of ['southern-chen','wagang-wei','xia-dou','zheng-wang','tufan','yan-an-shi','qi-huang-chao']) assert.equal(rowOf(data,id).grouped,false,id);
});

test('Liao, Western Liao, Jin, Xia and Song remain parallel; only the two Song polities share a row',() => {
  const data = annotate('liao-jin-song');
  assert.deepEqual(data.presentation.rowGroups[0].stateIds,['northern-song','southern-song']);
  for (const id of ['liao','western-liao','dali','western-xia','jin-jurchen','mongol-yuan']) assert.equal(rowOf(data,id).grouped,false,id);
  assert.notEqual(rowOf(data,'liao').key,rowOf(data,'western-liao').key,'1124–1125 overlap must not be called succession');
  assert.equal(lanes(data,rowOf(data,'northern-song').members).lanes,2,'1127 inclusive boundary is an overlap, not a date edit');
});

test('Ming/Nanming succession preserves the original Nanming/Zheng polity and simultaneous tenures',() => {
  const data = annotate('ming'),row = rowOf(data,'ming');
  assert.equal(row.key,rowOf(data,'southern-ming').key);
  assert.deepEqual(Array.from(row.members,s => s.id),['ming','southern-ming']);
  for (const id of ['northern-yuan','dashun','daxi','later-jin-qing']) assert.equal(rowOf(data,id).grouped,false,id);
  const pack = lanes(data,row.members.flatMap(s => s.rulers));
  const ids = ['ming-tenure-sming-longwu','ming-tenure-sming-luwang','ymq-tenure-sming-yongli','ming-tenure-zheng-chenggong'];
  assert(ids.every(id => pack.items.some(t => t.id === id)));
  const luwang = pack.items.find(t => t.id === ids[1]),yongli = pack.items.find(t => t.id === ids[2]);
  assert.notEqual(luwang.displayLane,yongli.displayLane);
  assert.equal(ruler(data,'ming-tenure-zheng-chenggong').polityId,'southern-ming');
});

test('Grouping preserves original members for filters, pins, details, source lookup and export identity',() => {
  const data = annotate('liao-jin-song');
  const selected = data.states.filter(s => ['southern-song','jin-jurchen'].includes(s.id));
  const rows = P.rows(selected,data.presentation,new Set(['southern-song']));
  assert.equal(rows.length,2);
  assert.equal(rows[0].key,'group:song-succession');
  assert.deepEqual(Array.from(rows[0].members,s => s.id),['southern-song'],'filter must not add northern Song');
  assert.equal(rows[0].members[0],selected[1]);
  const exported = JSON.parse(JSON.stringify({states:selected,tenures:data.tenures.filter(t => selected.some(s => s.id === t.polityId))}));
  assert.deepEqual(exported.states.map(s => s.id),selected.map(s => s.id));
  assert(exported.tenures.every(t => t.polityId === 'southern-song' || t.polityId === 'jin-jurchen'));
  assert(exported.tenures.every(t => t.id && t.name && t.sourceIds.length && !t.id.startsWith('group:')));
  assert.deepEqual(plain(P.rows(selected.slice().reverse(),data.presentation).map(r => r.members[0].id)),['southern-song','jin-jurchen']);
});

test('Missing explicit tenure IDs fail before writing either collection; names and personId are not fallbacks',() => {
  for (const inRulerCopies of [false,true]) {
    const data = fresh('ming');
    const collection = inRulerCopies ? data.states[0].rulers : data.tenures;
    collection.push({...data.tenures[0],id:'unknown-tenure-id',personId:null});
    const before = structuredClone(data);
    assert.throws(() => annotateDynastyDisplay(data,'ming'),/Missing explicit dynasty tenure display: unknown-tenure-id/);
    assert.deepEqual(data,before);
  }
});

test('Unsupported datasets are untouched; pre-existing unrelated projection annotations survive',() => {
  const old = {schemaVersion:1,states:[]};
  assert.equal(annotateDynastyDisplay(old,'zhou'),old);
  assert.deepEqual(old,{schemaVersion:1,states:[]});
  const data = fresh('ming');
  data.presentation = {custom:'retained'};
  data.tenures[0].display = {custom:'retained'};
  annotateDynastyDisplay(data,'ming');
  assert.equal(data.presentation.custom,'retained');
  assert.equal(data.tenures[0].display.custom,'retained');
});
