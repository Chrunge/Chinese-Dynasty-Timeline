import {readFileSync,writeFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('./dist/history.json',import.meta.url),'utf8'));
const ids=new Set(data.states.map(s=>s.id));
for(const s of data.states){for(const r of s.rulers){if(r.start<r.end)throw new Error('倒置区间：'+r.name);}}
for(const e of data.events){if(e.states.some(id=>!ids.has(id)))throw new Error('未知国家：'+e.name);}
writeFileSync(new URL('./dist/data.js',import.meta.url),'window.ZHOU_DATA = '+JSON.stringify(data)+';\n');
console.log('数据同步完成：'+data.states.length+'行，'+data.events.length+'条事件。');
