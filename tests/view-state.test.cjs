const test=require('node:test'),assert=require('node:assert/strict');
const {boot,attachStudy}=require('./helpers/browser.cjs');
const plain=value=>JSON.parse(JSON.stringify(value));

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
