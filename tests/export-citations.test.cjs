const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
async function comparison(){
 const {compileAtlas}=await import('../lib/atlas.mjs'),ctx=vm.createContext({});
 for(const file of ['history','export-layout'])vm.runInContext(fs.readFileSync(path.join(root,'src/core/'+file+'.js'),'utf8'),ctx);
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
