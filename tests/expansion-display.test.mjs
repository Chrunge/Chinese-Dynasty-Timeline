import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {annotateExpansionDisplay} from '../lib/expansion-display.mjs';
import {toAxis} from '../lib/time.mjs';

const datasets = [['xia-shang',53,5],['five-dynasties',59,11],['yuan',25,11],['qing',19,6]];
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
// Independent fixtures test the annotation without coupling it to intake fixes.
const project = input => {
  const data = projectDates(input);
  return {...data,states:data.polities.map(state => ({...structuredClone(state),
    rulers:data.tenures.filter(t => t.polityId === state.id).map(t => ({...structuredClone(t),stateId:state.id}))
  }))};
};
const fresh = id => project(readInput(id));
const annotate = id => annotateExpansionDisplay(fresh(id),id);
const strip = data => {
  const copy = structuredClone(data);
  delete copy.presentation;
  for (const t of [...copy.tenures,...copy.states.flatMap(s => s.rulers)]) delete t.display;
  for (const p of [...copy.states,...copy.polities]) delete p.display;
  return copy;
};
const context = vm.createContext({});
vm.runInContext(readFileSync(new URL('../src/core/presentation.js',import.meta.url),'utf8'),context);
const P = context.Zhou.Presentation;
const rowOf = (data,id) => P.rows(data.states,data.presentation).find(row => row.members.some(s => s.id === id));
const tenure = (data,id) => data.tenures.find(t => t.id === id);
const packed = (data,records) => P.pack(records,data.timeline.start,data.timeline.end);

for (const [id,count,rowCount] of datasets) {
  test(`${id}: all tenure IDs and ruler copies get explicit display; original information is unchanged`,() => {
    const input = freeze(readInput(id)),original = JSON.stringify(input),data = project(input),before = structuredClone(data);
    assert.equal(annotateExpansionDisplay(data,id),data);
    assert.deepEqual(strip(data),before);
    assert.equal(JSON.stringify(input),original);
    assert.equal(data.tenures.length,count);
    const copies = data.states.flatMap(s => s.rulers);
    assert.equal(copies.length,count);
    for (const t of data.tenures) {
      assert.equal(typeof t.display.shortTitle,'string',t.id);
      assert(t.display.personalName.length,t.id);
      assert(input.people.find(p => p.id === t.personId).name.includes(t.display.personalName),t.id);
      const copy = copies.find(r => r.id === t.id);
      assert.deepEqual(copy.display,t.display,t.id);
      assert.notEqual(copy.display,t.display);
      assert.equal(P.rulerLabel(t),[t.display.shortTitle,t.display.personalName].filter(Boolean).join(' '));
    }
    assert.equal(P.rows(data.states,data.presentation).length,rowCount);
  });

  test(`${id}: grouping retains every entity, has disjoint explicit members, and keeps lane counts bounded`,() => {
    const data = annotate(id),seen = new Set(),rows = P.rows(data.states,data.presentation);
    assert.equal(data.presentation.version,1);
    for (const group of data.presentation.rowGroups) {
      assert(group.name && group.note.includes('实体ID不变'));
      for (const member of group.stateIds) {
        assert(data.states.some(s => s.id === member),member);
        assert(!seen.has(member),member);
        seen.add(member);
      }
    }
    assert.deepEqual(Array.from(rows.flatMap(r => r.members.map(s => s.id))).sort(),data.states.map(s => s.id).sort());
    for (const row of rows.filter(row => row.grouped)) {
      const rulers = row.members.flatMap(s => s.rulers);
      const statePack = packed(data,row.members),rulerPack = packed(data,rulers);
      assert(statePack.lanes <= 2,row.key);
      assert(rulerPack.lanes <= 3,row.key);
      assert.equal(statePack.items.length,row.members.length);
      assert.equal(rulerPack.items.length,rulers.length);
    }
  });

  test(`${id}: deterministic idempotent annotations have independent mutable display objects`,() => {
    const data = annotate(id),before = structuredClone(data);
    assert.deepEqual(annotateExpansionDisplay(data,id),before);
    assert.deepEqual(annotate(id),before);
    data.presentation.rowGroups.push({id:'caller-only',stateIds:[]});
    if (data.presentation.rowGroups[0].stateIds.length) data.presentation.rowGroups[0].stateIds.push('caller-only');
    data.tenures[0].display.personalName = 'caller-only';
    assert.deepEqual(annotate(id),before);
  });

  test(`${id}: actual intake and compileAtlas projection preserves identity and accepts annotation`,async () => {
    const {compileAtlas} = await import('../lib/atlas.mjs');
    const {prepareExpansionProduction} = await import('../lib/expansion-annotations.mjs');
    const input = freeze(readInput(id)),original = JSON.stringify(input);
    const data = compileAtlas(prepareExpansionProduction(input,id)),before = structuredClone(data);
    annotateExpansionDisplay(data,id);
    assert.deepEqual(strip(data),before);
    assert.equal(JSON.stringify(input),original);
    assert.equal(data.tenures.length,count);
    assert.equal(data.states.flatMap(s => s.rulers).length,count);
    assert.equal(P.rows(data.states,data.presentation).length,rowCount);
    for (const t of data.tenures) assert.deepEqual(t.display,tenure(annotate(id),t.id).display);
  });
}

test('All 41 polity entries have explicit source-supported short names on both projections',() => {
  const expected = {
    'xia-shang':['夏','有穷','商','古蜀','鬼方','周'],
    'five-dynasties':['后梁','后唐','后晋','后汉','后周','杨吴','吴越','前蜀','马楚','闽','南汉','荆南','后蜀','南唐','北汉','辽','北宋'],
    yuan:['元','西夏','金','大理','南宋','徐宋','张周','韩宋','陈汉','明夏','明'],
    qing:['清','明','大顺','南明','吴周','准噶尔','太平天国']
  };
  let total = 0;
  for (const [id] of datasets) {
    const input = freeze(readInput(id)),snapshot = JSON.stringify(input),data = project(input);
    annotateExpansionDisplay(data,id);
    assert.deepEqual(data.polities.map(p => p.display.shortName),expected[id]);
    for (const p of data.polities) {
      total++;
      const state = data.states.find(s => s.id === p.id),source = input.polities.find(s => s.id === p.id);
      assert.equal(state.display.shortName,p.display.shortName);
      assert(source.name.includes(p.display.shortName),`${id}/${p.id}: ${p.display.shortName}`);
      assert.match(p.display.shortName,/^[\u4e00-\u9fff]{1,4}$/u);
      assert.notEqual(state,p);
      assert.notEqual(state.display,p.display);
      assert.equal(state.name,source.name);
      assert.equal(p.name,source.name);
    }
    assert.equal(JSON.stringify(input),snapshot);
  }
  assert.equal(total,41);
});

test('Polity ID bindings ignore names and traversal order; aliased projections never share display objects',() => {
  for (const [id] of datasets) {
    const data = fresh(id),expected = annotate(id);
    // Simulate projection aliases, including nested pre-existing display metadata.
    data.polities = data.states;
    for (const p of data.states) {p.name = '同名政权';p.display = {custom:{value:'retained'}};}
    data.states.reverse();
    annotateExpansionDisplay(data,id);
    for (const state of data.states) {
      const p = data.polities.find(p => p.id === state.id);
      assert.equal(state.display.shortName,expected.states.find(s => s.id === state.id).display.shortName);
      assert.equal(state.name,'同名政权');
      assert.notEqual(state,p);
      assert.notEqual(state.display,p.display);
      assert.notEqual(state.display.custom,p.display.custom);
      state.display.custom.value = 'caller-only';
      assert.equal(p.display.custom.value,'retained');
    }
    assert.notEqual(data.states,data.polities);
  }
});

test('Unknown polity IDs in either projection fail atomically before any tenure or display write',() => {
  for (const collection of ['states','polities']) {
    const data = fresh('qing');
    data[collection].push({...data[collection][0],id:'unmapped-polity'});
    const before = structuredClone(data),states = data.states,polities = data.polities;
    assert.throws(() => annotateExpansionDisplay(data,'qing'),/Missing explicit expansion polity display: unmapped-polity/);
    assert.deepEqual(data,before);
    assert.equal(data.states,states);
    assert.equal(data.polities,polities);
  }
  const wrongVolume = fresh('xia-shang');
  wrongVolume.polities.push({id:'wu-zhou',name:'吴周'});
  const before = structuredClone(wrongVolume);
  assert.throws(() => annotateExpansionDisplay(wrongVolume,'xia-shang'),/Missing explicit expansion polity display: wu-zhou/);
  assert.deepEqual(wrongVolume,before,'known ID from another volume is not a name fallback');
});

test('Summer/Shang disputed names use attested source forms rather than fabricated imperial titles',() => {
  const data = annotate('xia-shang');
  for (const t of data.tenures.filter(t => ['xia','shang','youqiong-han'].includes(t.polityId))) {
    assert.equal(t.display.shortTitle,'',t.id);
    assert(!P.rulerLabel(t).includes('皇帝'),t.id);
  }
  assert.equal(tenure(data,'xs-tenure-xia-07-zhu').display.personalName,'予');
  assert.equal(tenure(data,'xs-tenure-shang-28-wending').display.personalName,'文丁');
  assert.equal(rowOf(data,'xia').key,rowOf(data,'shang').key);
  assert.equal(packed(data,rowOf(data,'xia').members).lanes,2,'1600 BCE inclusive boundary remains overlap');
  for (const id of ['youqiong-han','ancient-shu','guifang-qiang','zhou']) assert.equal(rowOf(data,id).grouped,false,id);
  const source = readInput('xia-shang');
  assert.deepEqual(strip(data).events,projectDates(source.events),'all dating alternatives and source notes remain exact');
  assert.deepEqual(strip(data).tenures,projectDates(source.tenures));
});

test('Five Dynasties main succession does not absorb the Ten Kingdoms or Liao',() => {
  const data = annotate('five-dynasties'),main = rowOf(data,'later-liang');
  assert.deepEqual(Array.from(main.members,s => s.id),['later-liang','later-tang','later-jin','later-han','later-zhou','northern-song']);
  assert.equal(rowOf(data,'wu-yang').key,rowOf(data,'southern-tang').key);
  assert.notEqual(rowOf(data,'wu-yang').key,main.key);
  for (const id of ['wuyue','former-shu','later-shu','ma-chu','min','southern-han','jingnan','northern-han','liao']) assert.equal(rowOf(data,id).grouped,false,id);
  const min = data.states.find(s => s.id === 'min');
  const rulers = packed(data,min.rulers).items;
  assert.notEqual(rulers.find(t => t.id === 'wd-tenure-min-yanxi').displayLane,rulers.find(t => t.id === 'wd-tenure-min-yanzheng').displayLane);
  for (const id of ['wd-tenure-chu-maxisheng','wd-tenure-chu-maxichong','wd-tenure-jn-gaobaoxu','wd-tenure-jn-gaojichong']) assert.equal(tenure(data,id).display.shortTitle,'');
});

test('Yuan restoration and regencies retain independent IDs, roles, dates and original overlaps',() => {
  const data = annotate('yuan');
  assert.deepEqual(data.presentation.rowGroups,[]);
  const first = tenure(data,'yuan-tenure-wenzong-1'),second = tenure(data,'yuan-tenure-wenzong-2');
  assert.equal(first.personId,second.personId);
  assert.notEqual(first.id,second.id);
  assert.equal(first.display.shortTitle,'元文宗（初任）');
  assert.equal(second.display.shortTitle,'元文宗（复辟）');
  const rulers = packed(data,data.states.find(s => s.id === 'mongol-yuan').rulers).items;
  const middle = rulers.find(t => t.id === 'yuan-tenure-kusala');
  assert.notEqual(rulers.find(t => t.id === first.id).displayLane,middle.displayLane);
  assert.notEqual(rulers.find(t => t.id === second.id).displayLane,middle.displayLane);
  for (const [id,title,role] of [['yuan-tenure-tolui','监国','监国'],['yuan-tenure-toregene','称制皇后','称制皇后'],['yuan-tenure-qaimish','称制皇后','称制皇后']]) {
    const t = tenure(data,id);
    assert.equal(t.display.shortTitle,title);
    assert.equal(t.role,role);
    assert(!P.rulerLabel(t).includes('帝'));
  }
  assert.equal(tenure(data,'yuan-tenure-zhuyuanzhang-wu').display.shortTitle,'','do not pick an emperor title for a mixed-office tenure');
});

test('Qing parallel claimants stay independent; regents are not manufactured as emperor tenures',() => {
  const data = annotate('qing'),source = readInput('qing');
  assert.equal(rowOf(data,'ming').key,rowOf(data,'southern-ming').key);
  for (const id of ['later-jin-qing','dashun','wu-zhou','dzungar','taiping']) assert.equal(rowOf(data,id).grouped,false,id);
  assert.deepEqual(data.tenures.map(t => t.id),source.tenures.map(t => t.id));
  assert.equal(data.tenures.filter(t => t.polityId === 'later-jin-qing').length,12);
  assert(tenure(data,'ymq-tenure-qing-shunzhi').name.includes('多尔衮摄政'));
  assert(tenure(data,'ymq-tenure-qing-tongzhi').name.includes('两宫太后垂帘'));
  assert(tenure(data,'ymq-tenure-qing-xuantong').name.includes('载沣摄政'));
  assert.equal(tenure(data,'qing-tenure-wuzhou-wusangui').display.shortTitle,'');
  assert.equal(tenure(data,'qing-tenure-dzungar-galdan').display.shortTitle,'');
  assert.equal(tenure(data,'qing-tenure-taiping-hongxiuquan').display.shortTitle,'天王');
});

test('ID binding is unaffected by names, person IDs or traversal order',() => {
  for (const [id] of datasets) {
    const data = fresh(id),expected = annotate(id);
    for (const p of data.people) p.name = '同名人物';
    for (const t of [...data.tenures,...data.states.flatMap(s => s.rulers)]) {
      t.name = '同名任期';
      t.personId = 'same-person-for-all';
    }
    data.tenures.reverse();data.states.reverse();data.states.forEach(s => s.rulers.reverse());
    annotateExpansionDisplay(data,id);
    for (const t of [...data.tenures,...data.states.flatMap(s => s.rulers)]) assert.deepEqual(t.display,tenure(expected,t.id).display);
  }
});

test('Nonempty short titles are supported by this volume, with restoration suffixes display-only',() => {
  for (const [id] of datasets) {
    const source = readInput(id),data = annotate(id);
    for (const record of data.tenures) {
      const title = record.display.shortTitle.replace(/（(?:初任|复辟)）$/u,'');
      if (!title) continue;
      const t = source.tenures.find(t => t.id === record.id),person = source.people.find(p => p.id === t.personId);
      assert([t.name,t.role,JSON.stringify(person)].some(text => text.includes(title)),`${id}/${t.id}: ${title}`);
    }
  }
});

test('Shared IDs use current-volume source names, never an imported historical alias',() => {
  const data = annotate('xia-shang');
  assert.equal(tenure(data,'zhou-r0').display.personalName,'姬发');
  const five = annotate('five-dynasties');
  assert.equal(tenure(five,'sl-tenure-liang-taizu').display.personalName,'朱温');
  assert.equal(tenure(five,'sl-tenure-nsong-taizong').display.personalName,'赵光义');
  assert.equal(tenure(annotate('qing'),'ming-tenure-zheng-chenggong').display.personalName,'郑成功');
});

test('Display grouping changes no filtered member, pin, detail or export entity identity',() => {
  const data = annotate('five-dynasties'),states = data.states.filter(s => ['later-tang','liao'].includes(s.id));
  const rows = P.rows(states,data.presentation,new Set(['later-tang']));
  assert.equal(rows.length,2);
  assert.equal(rows[0].key,'group:five-dynasties-song-succession');
  assert.deepEqual(Array.from(rows[0].members,s => s.id),['later-tang']);
  assert.equal(rows[0].members[0],states[0]);
  const exported = JSON.parse(JSON.stringify({states,tenures:data.tenures.filter(t => states.some(s => s.id === t.polityId))}));
  assert.deepEqual(exported.states.map(s => s.id),states.map(s => s.id));
  assert(exported.tenures.every(t => ['later-tang','liao'].includes(t.polityId) && t.id && t.name && t.sourceIds.length));
});

test('Unknown tenure IDs fail atomically, even with an existing same-name person',() => {
  for (const inCopies of [false,true]) {
    const data = fresh('yuan');
    (inCopies ? data.states[0].rulers : data.tenures).push({...data.tenures[0],id:'unmapped-tenure'});
    const before = structuredClone(data);
    assert.throws(() => annotateExpansionDisplay(data,'yuan'),/Missing explicit expansion tenure display: unmapped-tenure/);
    assert.deepEqual(data,before);
  }
});

test('Unsupported topics are untouched and unrelated projection annotations survive',() => {
  const unsupported = {states:[]};
  assert.equal(annotateExpansionDisplay(unsupported,'zhou'),unsupported);
  assert.deepEqual(unsupported,{states:[]});
  const data = fresh('qing');
  data.presentation = {custom:'retained'};
  data.tenures[0].display = {custom:'retained'};
  annotateExpansionDisplay(data,'qing');
  assert.equal(data.presentation.custom,'retained');
  assert.equal(data.tenures[0].display.custom,'retained');
});
