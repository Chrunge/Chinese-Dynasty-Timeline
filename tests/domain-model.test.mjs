import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {compileAtlas, validateAtlas} from '../lib/atlas.mjs';
import {toAxis, fromAxis} from '../lib/time.mjs';
const load = name => JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const qinHan = () => load('examples/qin-han.json');
const threeKingdoms = () => load('examples/three-kingdoms.json');
const freeze = value => {if(value && typeof value === 'object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value;};

test('作者日期无零年，运行时公元1年为0且前1年至公元1年连续', () => {
  for(const [date,axis] of [[{era:'BCE',year:1046},1046],[{era:'BCE',year:1},1],[{era:'CE',year:1},0],[{era:'CE',year:2},-1],[{era:'CE',year:280},-279]]) {
    assert.equal(toAxis(date),axis);assert.deepEqual(fromAxis(axis),date);
  }
  assert.throws(()=>fromAxis(Number.MIN_SAFE_INTEGER),/安全整数/);
  assert.deepEqual(fromAxis(1-Number.MAX_SAFE_INTEGER),{era:'CE',year:Number.MAX_SAFE_INTEGER});
  for(const date of [0,-1,1,{era:'CE',year:0},{era:'BCE',year:-2},{era:'AD',year:1},{era:'CE',year:1,extra:true},{era:'CE',year:1.5}]) assert.throws(()=>toAxis(date),/年份/);
});

test('schema1原资料及ID不变；分离模型不从同名猜测人物', () => {
  const a=load('atlas.json'),before=JSON.stringify(a),d=compileAtlas(freeze(a));
  assert.equal(JSON.stringify(a),before);assert.equal(d.timeEncoding,'bce-axis');
  assert.deepEqual([d.polities.length,d.tenures.length,d.people.length],[18,465,116]);
  assert.deepEqual(d.polities.map(p=>p.id),a.states.map(p=>p.id));
  assert.deepEqual(d.tenures.map(t=>t.id),a.rulers.map(t=>t.id));
  assert(d.tenures.every(t=>t.personId===null));
  assert(d.polities.every(p=>!Object.hasOwn(p,'rulers')));
  assert.deepEqual(d.timeline,{start:1046,end:221,defaultEnd:256,cursor:770,topic:'zhou'});
  assert.deepEqual(a.rulers.map(r=>[r.start,r.end]),d.tenures.map(r=>[r.start,r.end]));
  assert.equal(d.title,'周代列国');assert.equal(d.combinations.length,4);
});

test('schema1显式人物连接保持稳定，不合并同名人物', () => {
  const a=load('atlas.json');a.people[0].name=a.people[1].name;
  a.rulers[0].personId=a.people[1].id;
  const d=compileAtlas(a);assert.equal(d.tenures[0].personId,a.people[1].id);
  assert.equal(d.people.length,116);assert.equal(d.tenures[1].personId,null);
});

for(const name of ['examples/three-kingdoms.json','examples/qin-han.json']) test('schema2完整样例可校验投影且不修改冻结输入：'+name, () => {
  const a=freeze(load(name)),before=JSON.stringify(a);
  assert.doesNotThrow(()=>validateAtlas(a));const d=compileAtlas(a);
  assert.equal(JSON.stringify(a),before);assert.equal(d.timeEncoding,'bce-axis');
  assert.deepEqual(d.states.map(s=>s.id),d.polities.map(p=>p.id));
  assert.equal(d.states.flatMap(s=>s.rulers).length,d.tenures.length);
  assert(d.tenures.every(t=>d.people.some(p=>p.id===t.personId)));
  assert(d.periods.every(p=>p.polityIds.every(id=>d.polities.some(s=>s.id===id))));
  assert(d.events.every(e=>e.sources.length&&e.states.length));
  assert(d.sources.every(s=>s.reviewStatus==='pending'));
  assert(d.peopleCoverage && d.researchCoverage && d.metadata);
  assert(!d.polities.some(p=>['wei','jin','wu','han','liang'].includes(p.id)));
  assert.deepEqual(compileAtlas(a),d);
});

test('三国并存可按相同公元年查询，政权寿命不由时期覆盖', () => {
  const d=compileAtlas(threeKingdoms()),at=year=>d.polities.filter(p=>p.start>=year&&p.end<=year);
  assert.equal(at(toAxis({era:'CE',year:230})).length,3);
  assert.deepEqual(at(toAxis({era:'CE',year:270})).map(p=>p.name),['孙吴']);
  const e=d.events[0];assert.equal(e.year,-219);assert.equal(e.participants[0].id,'ex3k-person-cao-pi');
  assert.deepEqual(d.people.find(p=>p.id==='ex3k-person-liu-bei').states,['ex3k-polity-shu-han']);
});

test('秦汉帝国跨公元任期、事件引用和活动继承投影一致', () => {
  const d=compileAtlas(qinHan()),t=d.tenures.find(t=>t.id==='exqh-tenure-liu-kan');
  assert.equal(t.start,1);assert.equal(t.end,-5);assert.equal(t.chronology.accession,1);
  assert.equal(d.timeline.cursor,0);assert(d.periods.some(p=>p.start>0&&p.end<0));
  const e=d.events.find(e=>e.id==='exqh-event-ping-accession');assert.equal(e.year,1);
  assert.equal(d.people.find(p=>p.id===t.personId).journey[0].year,1);
  const a=qinHan();a.tenures.find(t=>t.id==='exqh-tenure-liu-kan').chronology.accession={era:'CE',year:1};
  const changed=compileAtlas(a);assert.equal(changed.events.find(v=>v.id==='exqh-event-qin-imperial').year,221);
  assert.equal(changed.events.find(v=>v.id===e.id).year,0);
  assert.equal(changed.people.find(p=>p.id===t.personId).journey[0].year,0);
});

test('两例可直接接入现有历史查询与对照快照', () => {
  const context=vm.createContext({});
  for(const name of ['time','history']) vm.runInContext(readFileSync(new URL('../src/core/'+name+'.js',import.meta.url),'utf8'),context);
  const three=context.Zhou.createHistory(compileAtlas(threeKingdoms()));
  assert.equal(three.compareYear(toAxis({era:'CE',year:230})).length,3);
  assert.equal(three.eventsInRange({category:'政治'}).length,1);
  const qh=context.Zhou.createHistory(compileAtlas(qinHan()));
  assert.equal(qh.eventsInRange({category:'政治'}).length,2);
  assert.equal(qh.tenuresForPerson('exqh-person-ying-zheng').length,2);
  assert.equal(qh.rulersAt('exqh-polity-western-han',0)[0].personId,'exqh-person-liu-kan');
  const snapshot=qh.comparison({states:['exqh-polity-qin'],from:247,to:210,cursor:221,category:'政治'});
  assert.equal(snapshot.tenures.length,2);assert.equal(snapshot.people.length,1);assert.equal(snapshot.events.length,1);
  assert.equal(snapshot.timeEncoding,'bce-axis');assert.equal(snapshot.schemaVersion,1);
});

test('schema2事件category别名明确转换为旧kind并拒绝矛盾类别', () => {
  const a=threeKingdoms();a.events[0].category=a.events[0].kind;delete a.events[0].kind;
  assert.equal(compileAtlas(a).events[0].kind,'政治');
  a.events[0].kind='战争';assert.throws(()=>validateAtlas(a),/类别冲突/);
  a.events[0].kind='unknown';delete a.events[0].category;assert.throws(()=>validateAtlas(a),/类别/);
});

test('同一秦政权和嬴政人物跨专题复用，两种身份连接独立任期', () => {
  const d=compileAtlas(qinHan()),p=d.polities.find(p=>p.id==='exqh-polity-qin');
  assert.equal(p.start,890);assert.equal(p.end,206);
  const periods=d.periods.filter(p=>['exqh-period-qin-kingdom','exqh-period-qin'].includes(p.id));
  assert.equal(periods.length,2);assert(periods.every(period=>period.polityIds.includes(p.id)));
  const terms=d.tenures.filter(t=>t.personId==='exqh-person-ying-zheng');
  assert.equal(terms.length,2);assert(terms.every(t=>t.polityId===p.id));
  assert.deepEqual(terms.map(t=>t.role),['秦王','皇帝']);
  assert.equal(d.people.filter(p=>p.id==='exqh-person-ying-zheng').length,1);
});

test('独立实体和兼容投影之间不共享可变数组', () => {
  const a=qinHan();a.sources[0].tags=['pending'];
  const d=compileAtlas(a),p=d.polities[0],state=d.states.find(s=>s.id===p.id);
  p.sources[0].tags.push('changed');assert.deepEqual(state.sources[0].tags,['pending']);assert.deepEqual(a.sources[0].tags,['pending']);
  p.sources.push({title:'changed'});assert.notDeepEqual(p.sources,state.sources);
  d.tenures[0].chronology.regnalStart=999;assert.notEqual(state.rulers[0].chronology.regnalStart,999);
  d.people[0].states.push('changed');assert(!d.events[0].states.includes('changed'));
});

const invalid = [
  ['schema2禁止作者运行时负数',a=>a.tenures[0].start=-220,/年份/],
  ['schema2禁止作者公元前年份裸数',a=>a.events[0].year=221,/年份/],
  ['schema2禁止公元零年',a=>a.timeline.cursor={era:'CE',year:0},/年份/],
  ['schema2拒绝重复任期',a=>a.tenures.push({...a.tenures[0]}),/重复 ID/],
  ['schema2拒绝悬空人物',a=>a.tenures[0].personId='missing-person',/未知 people/],
  ['schema2人物未知须显式null',a=>delete a.tenures[0].personId,/personId/],
  ['schema2拒绝悬空任期政权',a=>a.tenures[0].polityId='missing-polity',/未知 states/],
  ['schema2拒绝悬空时期政权',a=>a.periods[0].polityIds.push('missing-polity'),/未知 polities/],
  ['schema2拒绝重复时期政权',a=>a.periods[0].polityIds.push(a.periods[0].polityIds[0]),/去重数组/],
  ['schema2拒绝时期循环',a=>a.periods[0].parentId=a.periods[1].id,/子时期超出|循环/],
  ['schema2拒绝悬空时期父级',a=>a.periods[0].parentId='missing-period',/未知 periods/],
  ['schema2拒绝时期纪年缺失',a=>delete a.periods[0].dating,/时期缺少/],
  ['schema2拒绝无来源时期',a=>a.periods[0].sourceIds=[],/时期缺少/],
  ['schema2拒绝倒置任期',a=>a.tenures.find(t=>t.id==='exqh-tenure-liu-kan').end={era:'BCE',year:2},/区间倒置/],
  ['schema2拒绝超出政权的任期',a=>a.tenures[0].end={era:'CE',year:1},/任期超出/],
  ['schema2拒绝悬空来源',a=>a.people[0].sourceIds.push('missing-source'),/未知 sources/],
  ['schema2拒绝裸事件参与人物',a=>a.events[0].participants=[],/事件关系应在关系表/],
  ['schema2拒绝事件同时有直接日期和引用',a=>a.events[1].year={era:'CE',year:1},/year 或 yearRef/],
  ['schema2拒绝悬空事件任期引用',a=>a.events[1].yearRef.tenureId='missing-tenure',/未知 rulers/],
  ['schema2拒绝未核实的事件节点引用',a=>a.events[1].yearRef.field='death',/尚未核实/],
  ['schema2拒绝事件参与者非涉及政权',a=>a.relations.eventPeople[0].polityId='exqh-polity-western-han',/参与者所属国家/],
  ['schema2拒绝缺失原生关系表',a=>delete a.relations.tenurePeople,/缺少关系表/],
  ['schema2拒绝时间线默认值越界',a=>a.timeline.cursor={era:'CE',year:500},/默认值越界/]
];
for(const [name,mutate,message] of invalid) test(name,()=>{const a=qinHan();mutate(a);assert.throws(()=>validateAtlas(a),message);});
