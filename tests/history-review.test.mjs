import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {compileAtlas} from '../lib/atlas.mjs';

const atlas = JSON.parse(readFileSync(new URL('../data/atlas.json', import.meta.url), 'utf8'));
const data = compileAtlas(atlas);
const context = {Zhou: {}};
runInNewContext(readFileSync(new URL('../src/core/history.js', import.meta.url), 'utf8'), context);
const history = context.Zhou.createHistory(data);

test('非子封秦与秦起点同步，跨国对照落入孝王时期并保留旧推定', () => {
  const event = history.event('e4');
  const qin = history.state('qin');
  const feizi = qin.rulers.find(r => r.id === 'qin-r0');
  assert.equal(qin.start, event.year);
  assert.equal(feizi.start, event.year);
  assert.equal(feizi.chronology.regnalStart, event.year);
  assert(history.rulersAt('zhou', event.year).some(r => r.id === 'zhou-r7'));
  assert(!history.rulersAt('zhou', event.year).some(r => r.id === 'zhou-r5'));
  assert(history.rulersAt('qin', event.year).some(r => r.id === feizi.id));
  for (const item of [event, qin, feizi]) {
    assert.equal(item.dating.level, 'disputed');
    assert.equal(item.dating.reviewStatus, 'partial');
    assert(item.dating.alternatives.some(v => v.year === 900));
  }
  assert(event.approx && qin.approxStart && feizi.approx);
  const gong = history.state('zhou').rulers.find(r => r.id === 'zhou-r5');
  assert(!gong.biography.summary.includes('这一时期的国家记载包括非子'));
});

test('马陵的校订年、旧表年和月份异文不混成单一确年', () => {
  const event = history.event('e73');
  assert.equal(event.year, 342);
  assert.equal(event.dating.level, 'disputed');
  const adopted = event.dating.alternatives.find(v => v.year === event.year);
  const oldTable = event.dating.alternatives.find(v => v.year === 341);
  assert(adopted.sources.some(s => s.url.includes('fdgwz.org.cn')));
  assert(oldTable.sources.some(s => s.url.endsWith('/卷015')));
  assert(event.dating.alternatives.some(v => v.year === null && v.explanation.includes('十二月')));
  assert.notEqual(event.dating.reviewStatus, 'reviewed');
});

test('314年齐燕对照使用保留的校订区间，另说不覆盖采用年表', () => {
  for (const [id, start, end, oldStart] of [
    ['qi-r31',356,320,378], ['qi-r32',319,301,342], ['qi-r33',300,284,323]
  ]) {
    const ruler = history.state('qi').rulers.find(r => r.id === id);
    assert.deepEqual([ruler.start,ruler.end],[start,end]);
    assert.equal(ruler.dating.level,'disputed');
    assert(ruler.dating.alternatives.some(v => v.year === oldStart));
  }
  assert(history.rulersAt('qi', history.event('e80').year).some(r => r.id === 'qi-r32'));
  assert(!history.rulersAt('qi', 314).some(r => r.id === 'qi-r33'));
  const kuai = history.state('yan').rulers.find(r => r.id === 'yan-r28');
  assert(kuai.dating.alternatives.some(v => v.year === 316));
  assert.equal(kuai.chronology.abdication,null);
});

test('魏惠王元年不冒充确定承位年，称王及五国名单保持校勘边界', () => {
  const hui = history.state('liang').rulers.find(r => r.id === 'liang-r1');
  assert.deepEqual([hui.start,hui.end],[369,319]);
  assert.equal(hui.chronology.accession,null);
  assert.equal(hui.dating.level,'disputed');
  assert(hui.dating.alternatives.some(v => v.year === 370));
  assert(hui.note.includes('争议'));
  assert(!data.states.flatMap(s => s.rulers).some(r => r.name === '魏哀王'));
  const five = history.event('e77');
  assert.equal(five.dating.reviewStatus,'partial');
  assert(five.dating.alternatives.some(v => v.year === null && v.explanation.includes('赵')));
  assert.equal(data.events.length,105);
});
