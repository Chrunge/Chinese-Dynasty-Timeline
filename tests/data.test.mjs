import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileAtlas, validateAtlas, serializeAtlas} from '../lib/atlas.mjs';
const fresh = () => JSON.parse(readFileSync(new URL('../data/atlas.json', import.meta.url), 'utf8'));
const freeze = value => { if(value && typeof value === 'object'){Object.freeze(value);for(const item of Object.values(value))freeze(item);} return value; };

test('完整迁移：覆盖数量、活动、正文和君臣关系保留', () => {
 const d=compileAtlas(fresh());
 assert.deepEqual([d.states.length,d.states.flatMap(s=>s.rulers).length,d.people.length,d.events.length],[18,465,116,105]);
 assert.equal(d.states.reduce((n,s)=>n+s.undated.length,0),80);
 assert.equal(d.people.reduce((n,p)=>n+(p.journey?.length||0),0),62);
 assert.equal(d.peopleCoverage.detailedRulerIntervals,129);
 assert.equal(d.peopleCoverage.rulerIntervalsWithMinisters,78);
 assert.equal(d.researchCoverage.journeys,12);
 assert.equal(d.events.filter(e=>e.participants.length).length,20);
});
test('构建不修改源数据，冻结输入可用且结果确定', () => {
 const a=freeze(fresh()), before=JSON.stringify(a);
 assert.equal(serializeAtlas(a),serializeAtlas(a));
 assert.equal(JSON.stringify(a),before);
 assert.equal(serializeAtlas(a),readFileSync(new URL('../dist/data.js',import.meta.url),'utf8'));
});
test('孟子的齐国活动不传播到孟子见梁惠王事件；新增活动亦不改变事件', () => {
 const a=fresh(),p=a.people.find(p=>p.name==='孟子');
 a.activities.push({id:'regression-stage',personId:p.id,stateId:'chu',sequence:99,label:'测试',text:'仅为回归测试的活动',kind:'activity',kindLabel:'活动',year:null,approx:true,sourceIds:p.sourceIds});
 const d=compileAtlas(a),person=d.people.find(v=>v.id===p.id),event=d.events.find(e=>e.id==='e78');
 assert(person.states.includes('qi'));assert(person.states.includes('chu'));
 assert.deepEqual(event.states,['liang']);
 person.states.push('lu');assert.deepEqual(event.states,['liang']);
});
test('五国相王明确关联魏，异说不被误当成确定称王年', () => {
 const d=compileAtlas(fresh()),e=d.events.find(e=>e.id==='e77');
 assert.deepEqual(new Set(e.states),new Set(['han','zhao','yan','liang']));
 assert.equal(e.dating.level,'disputed');assert.equal(e.dating.reviewStatus,'partial');
 assert(e.dating.alternatives.some(a=>a.year===null && a.explanation.includes('赵')));
});
test('孔子出生的两种系年与来源可展开，活动日期继承事件', () => {
 const a=fresh(),e=a.events.find(e=>e.id==='e35');
 assert.deepEqual(e.dating.alternatives.map(v=>v.year),[551,552]);
 assert(e.dating.alternatives.every(v=>v.sourceIds.length));
 e.year=552;const d=compileAtlas(a);
 const birth=d.people.find(p=>p.name==='孔子').journey.find(j=>j.event==='e35');
 assert.equal(birth.year,552);assert.equal(birth.dating.level,'disputed');assert(birth.approx);
});
test('晋悼公实际即位与条带起点分别维护，事件引用实际即位', () => {
 const a=fresh(),r=a.rulers.find(r=>r.id==='jin-r24');
 assert.equal(r.chronology.accession,573);assert.equal(r.start,572);
 assert.equal(compileAtlas(a).events.find(e=>e.id==='e34').year,573);
 r.chronology.accession=574;
 assert.equal(compileAtlas(a).events.find(e=>e.id==='e34').year,574);
});
test('人物更名不破坏 ID 关联；卡片内容均来自独立人物记录', () => {
 const a=fresh(),p=a.people.find(p=>p.name==='白起');p.name='白起（测试名）';p.summary='独立人物资料更新';
 const d=compileAtlas(a),cards=[...d.events.flatMap(e=>e.participants),...d.states.flatMap(s=>s.rulers.flatMap(r=>r.ministers))].filter(v=>v.id===p.id);
 assert(cards.length>1);assert(cards.every(v=>v.name===p.name));
 assert(d.people.find(v=>v.id===p.id).relatedEvents.includes('e91'));
});
const brokenCases = [
 ['重复实体 ID',a=>a.people.push({...a.people[0]}),/重复 ID/],
 ['悬空来源',a=>a.events[0].sourceIds.push('missing-source'),/未知 sources/],
 ['悬空国家',a=>a.relations.eventStates[0].stateId='missing-state',/未知 states/],
 ['悬空人物',a=>a.relations.rulerPeople[0].personId='missing-person',/未知 people/],
 ['悬空前后事件',a=>a.events[0].narrative.related.push('missing-event'),/未知 events/],
 ['重复关系',a=>a.relations.eventStates.push({...a.relations.eventStates[0]}),/重复关联/],
 ['事件参与者国家缺失',a=>a.relations.eventPeople.find(v=>v.kind==='participant').stateId='wei',/参与者所属国家/],
 ['双重事件日期来源',a=>a.events.find(e=>e.yearRef).year=573,/year 或 yearRef/],
 ['未核实日期被引用',a=>a.events.find(e=>e.id==='e34').yearRef.field='abdication',/尚未核实/],
 ['双重活动日期来源',a=>a.activities.find(v=>v.yearFromEvent).year=551,/year 或 yearFromEvent/],
 ['区间倒置',a=>a.rulers[0].end=2000,/君主区间倒置/],
 ['年表起点不一致',a=>a.rulers[0].chronology.regnalStart=999,/图示起点与区间不一致/],
 ['异说空列表',a=>a.events.find(e=>e.id==='e35').dating.alternatives=[],/异说须列明/],
 ['重复来源 URL',a=>a.sources.push({...a.sources[0],id:'duplicate-source'}),/重复来源 URL/],
 ['人物内嵌国家',a=>a.people[0].states=['qin'],/人物关系应通过 ID/]
];
for(const [name,mutate,message] of brokenCases)test('校验拒绝：'+name,()=>{const a=fresh();mutate(a);assert.throws(()=>validateAtlas(a),message);});
