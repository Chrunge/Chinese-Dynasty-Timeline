const test=require('node:test'),assert=require('node:assert/strict');
const {boot,attachStudy}=require('./helpers/browser.cjs');
const plain=value=>JSON.parse(JSON.stringify(value));

test('视图状态可以脱离浏览器采集与应用，临时状态不进入快照',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ctx=vm.createContext({});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/core/state.js'),'utf8'),ctx);
 const state=ctx.Zhou.createApplicationState({states:[{id:'qin'},{id:'qi'}]}),view=ctx.Zhou.captureViewState(state);
 assert.deepEqual(plain(view.selected),['qin','qi']);assert(!('savedCombos' in view));assert(!('rowLayouts' in view));
 view.selected.push('chu');assert.equal(state.conditions.selected.size,2);
 ctx.Zhou.applyViewState(state,{...view,px:7,cursor:632});assert.equal(state.layout.px,7);assert.equal(state.conditions.cursor,632);
 const layout=ctx.Zhou.captureLayoutState(state);ctx.Zhou.applyLayoutState(state,{...layout,pins:['qin'],order:['qi','qin']});
 assert.deepEqual(plain(ctx.Zhou.captureLayoutState(state).pins),['qin']);
});

for(const width of [1200,390])test('视图字段、控件与阅读位置往返保持一致：'+width,()=>{
 const app=attachStudy(boot({},width));
 app.run("applyCombo('builtin-reform');togglePin('qin');setPeriod('spring');px=3;cursor=600;category='文化';mode='events';density='full';query='孔子';searchScope='selected';searchDescriptions=true;searchLimit=18;searchTarget='person:person-001';render();setCursor(600)");
 app.el('#viewport').scrollLeft=123;app.el('#viewport').scrollTop=45;app.el('#searchPanel').scrollTop=23;app.ctx.window.scrollTo(0,90);
 const before=plain(app.run('captureDetailFrame().view'));
 app.run("showEvent('e91')");app.ctx.savedView=before;app.run('restoreDetailView(savedView)');
 assert.deepEqual(plain(app.run('captureDetailFrame().view')),before);
 assert.equal(app.el('#category').value,'文化');assert.equal(app.el('#mode').value,'events');assert.equal(app.el('#search').value,'孔子');
 app.run('saveReadingPosition()');assert.deepEqual(JSON.parse(app.store['zhou-reading-v4']).view,before);
});
