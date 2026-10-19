const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
async function comparison(){
 const {compileAtlas}=await import('../lib/atlas.mjs'),ctx=vm.createContext({});
 for(const file of ['time','history','export-layout'])vm.runInContext(fs.readFileSync(path.join(root,'src/core/'+file+'.js'),'utf8'),ctx);
 const data=compileAtlas(JSON.parse(fs.readFileSync(path.join(root,'data/atlas.json'),'utf8')));
 return {model:ctx.Zhou.createHistory(data).comparison({states:['qi'],from:355,to:355,cursor:355}),layout:ctx.Zhou.buildExportPlan};
}

test('图形导出的范围、君主条带和基础来源保持一致，排版不修改JSON快照',async()=>{
 const {model,layout}=await comparison(),before=JSON.stringify(model),plan=layout(model,{span:150},text=>text.length*18);
 const charts=plan.pages.filter(p=>p.type==='chart');assert.equal(charts.length,1);
 assert.equal(charts[0].from,355);assert.equal(charts[0].to,355);assert.equal(charts[0].rows[0].rulers[0].id,'qi-r31');
 assert.equal(plan.events.length,0);assert(plan.sources.some(s=>s.url===model.states[0].rulers[0].source));
 assert.equal(JSON.stringify(model),before);
});

test('齐威王的纪年与异说来源完整进入图形索引，正文对应实际来源编号',async()=>{
 const {model,layout}=await comparison(),r=model.states[0].rulers[0],before=JSON.stringify(model),plan=layout(model,{span:150},text=>text.length*18);
 const urls=[r.source,...r.chronology.sources.map(s=>s.url),...r.dating.alternatives.flatMap(a=>a.sources.map(s=>s.url))];
 for(const url of urls)assert(plan.sources.some(s=>s.url===url));
 assert(plan.sources.some(s=>s.url==='https://www.fdgwz.org.cn/Web/Show/3072'));
 const text=plan.pages.filter(p=>p.type==='index').flatMap(p=>p.lines).map(l=>l.text).join('');
 for(const a of r.dating.alternatives){assert(text.includes(a.label));assert(text.includes(a.explanation));const refs=a.sources.map(s=>'['+(plan.sources.findIndex(ref=>ref.url===s.url)+1)+']').join('');assert(text.includes('来源'+refs));}
 assert.equal(new Set(plan.sources.map(s=>s.url)).size,plan.sources.length);assert.equal(JSON.stringify(model),before);
});

test('长异说和共享来源正确分页，事件异说亦保留独立来源',async()=>{
 const {model,layout}=await comparison(),r=model.states[0].rulers[0],source={title:'独立事件异说来源',url:'https://example.com/event-alternative'};
 r.dating.alternatives[0].explanation='长篇异说校核说明。'.repeat(600);
 model.events=[{id:'test-event',year:355,name:'测试事件',states:['qi'],description:'仅为分页与引用测试',sources:[source,source],dating:{level:'disputed',alternatives:[{label:'事件另说',year:354,explanation:'该说使用独立文献。',sources:[source]}]}}];
 const before=JSON.stringify(model),plan=layout(model,{span:150},text=>text.length*18);
 assert.equal(plan.sources.filter(s=>s.url===source.url).length,1);assert.equal(plan.events[0].refs.length,1);
 assert.equal(plan.events[0].alternatives[0].refs[0],plan.events[0].refs[0]);
 const pages=plan.pages.filter(p=>p.type==='index');assert(pages.length>2);assert(pages.every(p=>p.lines.reduce((n,l)=>n+l.height,0)<=630));
 assert(pages.flatMap(p=>p.lines).map(l=>l.text).join('').includes('该说使用独立文献。'));assert.equal(JSON.stringify(model),before);
});
