import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateAtlas, compileAtlas } from '../lib/atlas.mjs';

const a1 = JSON.parse(readFileSync(new URL('../data/atlas.json', import.meta.url), 'utf8'));
const a2 = JSON.parse(readFileSync(new URL('../data/西周春秋战国.json', import.meta.url), 'utf8'));

test('阶段五：两份数据集静态校验 validateAtlas 全量通过', () => {
  assert.ok(validateAtlas(a1), 'atlas.json Schema 1 校验通过');
  assert.ok(validateAtlas(a2), '西周春秋战国.json Schema 2 校验通过');
});

test('任务 1.1：卫国泳道重叠修复（wei-r14 与 wei-r15）', () => {
  const r14 = a1.rulers.find(r => r.id === 'wei-r14');
  const r15 = a1.rulers.find(r => r.id === 'wei-r15');
  assert.equal(r14.lane, 0, '卫成公处于主泳道 0');
  assert.equal(r15.lane, 1, '卫君瑕处于辅泳道 1');
  assert.ok(r14.chronology.changes.some(c => c.year === 632 && c.label.includes('出奔')), '卫成公补齐前632年出奔楚陈及复归节点');
  assert.ok(r15.note.includes('辅泳道'), '卫君瑕具有辅泳道说明');
});

test('任务 1.2：晋国前 677 年主泳道并轨与消除断口说明（jin-r11、jin-r14、jin-r15）', () => {
  const r11 = a1.rulers.find(r => r.id === 'jin-r11');
  const r14 = a1.rulers.find(r => r.id === 'jin-r14');
  const r15 = a1.rulers.find(r => r.id === 'jin-r15');
  assert.equal(r11.end, 678);
  assert.equal(r14.start, 715);
  assert.equal(r14.end, 677);
  assert.equal(r15.start, 676);
  assert.ok(r14.chronology.changes.some(c => c.year === 678 && c.label.includes('命为晋君')), '曲沃武公补齐前678年灭晋侯緡受周僖王命为晋君');
  assert.ok(r14.chronology.changes.some(c => c.year === 677 && c.label.includes('消除主泳道断档')), '曲沃武公补齐前677年接续正统与消除断档标记');
  assert.ok(r14.note.includes('消除主泳道前677年视觉断口'), '曲沃武公泳道说明详备');
});

test('任务 1.3：燕国子之之乱与前 313 年断档关联补全（yan-r28 与 yan-r29）', () => {
  const yan = a1.states.find(s => s.id === 'yan');
  assert.ok(yan.interruptions.some(g => g.start === 313 && g.end === 313));
  const rp = a1.relations.rulerPeople.filter(r => r.rulerId === 'yan-r28' && r.personId === 'person-062');
  assert.ok(rp.length >= 1, 'yan-r28 与 person-062 建立 rulerPeople 关联');
  const ep80 = a1.relations.eventPeople.filter(r => r.eventId === 'e80' && r.personId === 'person-062');
  assert.ok(ep80.length >= 1, 'e80（齐破燕）与 person-062 建立关联');
  const ep81 = a1.relations.eventPeople.filter(r => r.eventId === 'e81' && r.personId === 'person-062');
  assert.ok(ep81.length >= 1, 'e81（燕昭王立）与 person-062 建立关联');
});

test('任务 1 拓扑验证：全列国主泳道 lane: 0 不存在非预期多年度计算重叠', () => {
  for (const s of a1.states) {
    const rulers = a1.rulers.filter(r => r.stateId === s.id && (r.lane === 0 || r.lane == null));
    for (let i = 0; i < rulers.length; i++) {
      for (let j = i + 1; j < rulers.length; j++) {
        const r1 = rulers[i], r2 = rulers[j];
        if (r1.start >= r2.end && r2.start >= r1.end) {
          const overlapSpan = Math.min(r1.start, r2.start) - Math.max(r1.end, r2.end);
          assert.equal(overlapSpan, 0, `政权 ${s.id} 君主 ${r1.id}(${r1.name}) 与 ${r2.id}(${r2.name}) 在主泳道存在非预期多年重叠 (跨度 ${overlapSpan} 年)`);
        }
      }
    }
  }
});

test('任务 2：补齐 periods.polityIds 列国覆盖', () => {
  const pAll = a1.periods.find(p => p.id === 'all');
  const pWest = a1.periods.find(p => p.id === 'west');
  const pSpring = a1.periods.find(p => p.id === 'spring');
  assert.equal(pAll.polityIds.length, 18, 'all 覆盖全部 18 个政权');
  const expected15 = ['zhou', 'lu', 'qi', 'jin', 'qin', 'chu', 'song', 'wei', 'chen', 'cai', 'cao', 'yan', 'wu', 'yue', 'zheng'];
  for (const id of expected15) {
    assert.ok(pWest.polityIds.includes(id), `西周时期包含 ${id}`);
    assert.ok(pSpring.polityIds.includes(id), `春秋时期包含 ${id}`);
  }
});

test('任务 3.1：晋国七名臣（及狐偃、先轸）具备君主与事件关联', () => {
  const jinMinisters = ['person-021', 'person-023', 'person-024', 'person-025', 'person-026', 'person-027', 'person-028'];
  for (const pid of jinMinisters) {
    const rp = a1.relations.rulerPeople.filter(r => r.personId === pid);
    const ep = a1.relations.eventPeople.filter(r => r.personId === pid);
    assert.ok(rp.length >= 1, `晋名臣 ${pid} 必须具备至少一个君主关联`);
    assert.ok(ep.length >= 1, `晋名臣 ${pid} 必须具备至少一个事件关联`);
  }
  // 覆盖晋文公、襄公、灵公、成公、景公、厉公、悼公、平公
  const expectedRulers = ['jin-r18', 'jin-r19', 'jin-r20', 'jin-r21', 'jin-r22', 'jin-r23', 'jin-r24', 'jin-r25'];
  for (const rid of expectedRulers) {
    assert.ok(a1.relations.rulerPeople.some(r => r.rulerId === rid && jinMinisters.concat(['person-020', 'person-022']).includes(r.personId)), `君主 ${rid} 具备名臣关联`);
  }
  // 覆盖城濮之战、邲之战、鄢陵之战
  assert.ok(a1.relations.eventPeople.some(e => e.eventId === 'e25' && jinMinisters.concat(['person-020', 'person-022']).includes(e.personId)), '城濮之战关联晋名臣');
  assert.ok(a1.relations.eventPeople.some(e => e.eventId === 'e31' && jinMinisters.includes(e.personId)), '邲之战关联晋名臣');
  assert.ok(a1.relations.eventPeople.some(e => e.eventId === 'e33' && jinMinisters.includes(e.personId)), '鄢陵之战关联晋名臣');
});

test('任务 3.2：战国核心人物与四公子具备 3—4 段 activities', () => {
  const figures = [
    'person-017', // 孟尝君田文
    'person-073', // 平原君赵胜
    'person-086', // 信陵君魏无忌
    'person-056', // 春申君黄歇
    'person-039', // 白起
    'person-044', // 王翦
    'person-070', // 廉颇
    'person-071', // 蔺相如
    'person-076', // 李牧
    'person-102', // 子产
    'person-010', // 晏婴
    'person-106', // 孙武
    'person-094'  // 韩非
  ];
  for (const pid of figures) {
    const acts = a1.activities.filter(a => a.personId === pid);
    assert.ok(acts.length >= 3 && acts.length <= 4, `人物 ${pid} 具备 3-4 段 activities (实际: ${acts.length})`);
    // 验证活动序列号为连续正整数
    const seqs = acts.map(a => a.sequence).sort((x, y) => x - y);
    for (let i = 0; i < seqs.length; i++) {
      assert.equal(seqs[i], i + 1, `人物 ${pid} 活动 sequence 必须连续从 1 开始`);
    }
  }
});
