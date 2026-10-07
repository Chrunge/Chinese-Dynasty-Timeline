import {readFileSync, writeFileSync} from 'node:fs';
import {serializeAtlas} from './lib/atlas.mjs';
const input = new URL('./data/atlas.json', import.meta.url);
const output = new URL('./dist/data.js', import.meta.url);
const atlas = JSON.parse(readFileSync(input, 'utf8'));
const compiled = serializeAtlas(atlas);
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== compiled) throw new Error('dist/data.js 已过期，请运行 node sync-data.mjs');
  console.log('资料校验通过，浏览器数据与唯一资料源一致。');
} else {
  writeFileSync(output, compiled);
  console.log(`资料生成完成：${atlas.states.length} 行，${atlas.rulers.length} 个君主区间，${atlas.people.length} 人，${atlas.events.length} 条事件。`);
}
