// Generate biography data only; never overwrite hand-maintained runtime algorithms.
import {readFileSync,writeFileSync} from 'node:fs';
import {renderBiographyData} from '../lib/biography-data.mjs';
const book=JSON.parse(readFileSync(new URL('../data/中国历代非君主人物传记全书.json',import.meta.url),'utf8'));
const output=new URL('../src/core/biography-data.js',import.meta.url),source=renderBiographyData(book);
if(process.argv.includes('--check')){
 if(readFileSync(output,'utf8')!==source)throw new Error('传记数据已过期，请运行 node tools/build-biography-core.mjs');
 console.log('传记数据与原件一致。');
}else{
 writeFileSync(output,source);
 console.log('已生成 src/core/biography-data.js；手写传记逻辑不变。');
}
