'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {createHash}=require('node:crypto');
const {boot}=require('./helpers/browser.cjs');
const baseline=JSON.parse(fs.readFileSync('tests/fixtures/seven-topic-projections.json','utf8'));
test('七专题投影散列锁定（阶段A仅批准隋唐分组/武周显示注解变化，catalog除外）',()=>{
 for(const [id,expected] of Object.entries(baseline.sha256)){
  const context={window:{}};
  vm.runInNewContext(fs.readFileSync('dist/'+(id==='zhou'?'data.js':'data-'+id+'.js'),'utf8'),context);
  const data=context.window.ZHOU_DATA;delete data.catalog;
  assert.equal(createHash('sha256').update(JSON.stringify(data)).digest('hex'),expected,id);
 }
});
for(const [a,b,id,nameA,nameB] of [
 ['wei-jin-nan-bei','five-dynasties','later-liang','后凉','后梁'],
 ['sui-tang','qing','wu-zhou','武周','吴周']
])test('异实体同ID按专题严格隔离：'+id,()=>{
 const first=boot({},1200,null,'data-'+a+'.js'),second=boot({},1200,null,'data-'+b+'.js');
 for(const app of [first,second]){app.ctx.URLSearchParams=URLSearchParams;app.run(`appState.conditions.selected=new Set([${JSON.stringify(id)}])`);}
 assert.match(first.run(`byId(${JSON.stringify(id)}).name`),new RegExp(nameA));
 assert.match(second.run(`byId(${JSON.stringify(id)}).name`),new RegExp(nameB));
 assert.notEqual(first.run(`byId(${JSON.stringify(id)}).start`),second.run(`byId(${JSON.stringify(id)}).start`));
 const hash=first.run(`Zhou.createViewLinkCodec(D,searchService).encode({view:{...captureDetailFrame().view,selected:[${JSON.stringify(id)}]},pinned:[],order:D.states.map(s=>s.id),detail:'state:'+${JSON.stringify(id)}})`);
 assert.match(hash,new RegExp('dataset='+a));
 assert.equal(second.run(`Zhou.createViewLinkCodec(D,searchService).parse(${JSON.stringify(hash)})`),null,'同ID也不得跨卷解码');
 const combo=first.run("JSON.stringify(captureCombo('碰撞验证'))");
 assert.equal(second.run(`normalizeCombo(JSON.parse(${JSON.stringify(combo)}))`),null,'不能误导入同ID异实体');
});
