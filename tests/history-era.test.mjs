import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {compileAtlas} from '../lib/atlas.mjs';
const read = path => fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
function services() {
  const ctx=vm.createContext({Date});
  for(const path of ['src/core/time.js','src/core/history.js','src/core/export-layout.js','src/outputs/canvas.js']) vm.runInContext(read(path),ctx);
  return ctx.Zhou;
}
const Z=services();
const load = name => compileAtlas(JSON.parse(read('data/examples/'+name+'.json')));

test('原生领域查询按ID查任期/人物/时期，两个专题不复制政权或改写真实终点',()=>{
  const data=load('qin-han'),h=Z.createHistory(data),periodsBefore=JSON.stringify(data.periods);
  const person=data.people.find(p=>p.name==='嬴政');
  const tenures=h.tenuresForPerson(person.id);
  assert.equal(tenures.length,2);
  assert.equal(new Set(tenures.map(t=>t.polityId)).size,1);
  assert.equal(new Set(tenures.map(t=>t.personId)).size,1);
  const polity=h.polity(tenures[0].polityId);
  assert.equal(polity.end,206);
  const windows=data.periods.filter(p=>p.polityIds.includes(polity.id));
  assert(windows.length>=2);
  for(const period of windows) assert.equal(h.period(period.id),period);
  const snapshot=h.comparison({states:[polity.id],from:221,to:221,cursor:221});
  assert.equal(snapshot.polities[0].end,206);
  assert.equal(snapshot.states[0].end,206);
  assert.equal(snapshot.timeEncoding,'bce-axis');
  assert(snapshot.people.some(p=>p.id===person.id));
  snapshot.polities[0].end=999;snapshot.people[0].name='MUTATED';snapshot.periods[0].name='MUTATED';
  assert.equal(h.polity(polity.id).end,206);
  assert.equal(h.person(person.id).name,'嬴政');
  assert.equal(JSON.stringify(data.periods),periodsBefore);
});

test('公元1年事件/即位/中断使用0而非未知，导出保持跨元与原生任期来源',()=>{
  const data=load('qin-han');
  const tenure=data.tenures.find(t=>t.name==='汉平帝'),id=tenure.polityId;
  const event={...plain(data.events[0]),id:'test-ce-one',year:0,name:'公元元年测试节点',states:[id],kind:'政治',description:'只验证计算，不作史实',participants:[],dating:{level:'disputed',alternatives:[{label:'元年测试异说',year:0,explanation:'0是公元1年的运行时坐标',sources:[data.sources[0]]}]}};
  data.events.push(event);
  const h=Z.createHistory(data),before=JSON.stringify(data);
  assert(h.rulersAt(id,0).some(t=>t.id===tenure.id));
  assert.equal(h.existsAt(id,null),false);
  assert(h.eventsInRange({states:[id],from:1,to:-1}).some(e=>e.id===event.id));
  const model=h.comparison({states:[id],from:1,to:-5,cursor:0,category:'政治'}),modelBefore=JSON.stringify(model);
  assert.equal(model.cursor,0);assert.equal(model.events.find(e=>e.id===event.id).year,0);
  const plan=Z.buildExportPlan(model,{span:50},text=>text.length*18);
  const text=plan.pages.filter(p=>p.type==='index').flatMap(p=>p.lines).map(l=>l.text).join('\n');
  assert(text.includes('前1年—公元6年'));
  assert(text.includes('异说：元年测试异说 公元1年'));
  for(const source of tenure.sources) assert(plan.sources.some(s=>s.url===source.url));
  assert(!text.includes('[null]'));
  const drawn=[];
  const canvas={measureText:t=>({width:t.length*14}),fillText:t=>drawn.push(t),fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},stroke(){},fill(){},strokeRect(){},setLineDash(){}};
  plan.pages.forEach((page,index)=>Z.drawExportPage(canvas,page,plan,index));
  assert(drawn.some(t=>t.includes('公元1年')));
  assert(!drawn.some(t=>/前0|前-\d|公元0年/.test(t)));
  assert.equal(JSON.stringify(model),modelBefore);assert.equal(JSON.stringify(data),before);
  assert.throws(()=>h.comparison({states:[id],from:1,to:null}),/有效范围/);
  assert.throws(()=>h.comparison({states:[id],from:1,to:-5,cursor:null}),/参考年份/);
  const interrupted=plain(data);interrupted.states.find(s=>s.id===id).interruptions=[{start:0,end:-1,note:'测试中断'}];
  const gap=Z.createHistory(interrupted);assert.equal(gap.rulersAt(id,0).length,0);assert(gap.interruptionAt(id,0));
});

test('全公元样例查询与导出不被周朝边界拦截',()=>{
  const data=load('three-kingdoms'),h=Z.createHistory(data),ids=data.states.map(s=>s.id);
  assert.equal(h.compareYear(1-223,ids).length,3);
  const model=h.comparison({states:ids});
  const plan=Z.buildExportPlan(model,{span:100},text=>text.length*18);
  assert.equal(plan.from,1-220);assert.equal(plan.to,1-280);
  assert(plan.title.includes('三国'));
  const indexText=plan.pages.filter(p=>p.type==='index').flatMap(p=>p.lines).map(l=>l.text).join('\n');
  assert(!indexText.includes('秦称帝')&&!indexText.includes('前841'));
  assert(indexText.includes('资料标记的阶段边界'));
  assert(plan.sources.length>0);
  assert.equal(h.compareYear(1-219,ids).length,0);
});
