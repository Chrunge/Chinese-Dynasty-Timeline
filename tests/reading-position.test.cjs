const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({});
for(const file of ['time','reading'])vm.runInContext(fs.readFileSync('src/core/'+file+'.js','utf8'),ctx);
const data={timeline:{start:2070,end:1046},states:[{id:'shang'}],events:[]};
const model=ctx.Zhou.createReadingModel({data,searchIndex:[]});
const view={timeEncoding:'bce-axis',selected:['shang'],end:1046,px:24,left:23500};

test('AR04: same-width Xia-Shang restoration retains late high-zoom reading position',()=>{
 const input={view,width:1200,range:{from:2070-23500/24,to:1046}};
 const before=JSON.stringify(input),restored=model.restoreReading(input,{width:1200,labelWidth:100,layout:{}});
 assert.equal(restored.view.left,23500);assert.equal(restored.view.px,24);
 assert.equal(JSON.stringify(input),before);
});
test('AR04: reading offsets are bounded by the selected end year and zoom',()=>{
 assert.equal(model.sanitizeReading({...view,left:Number.MAX_VALUE}).left,1025*24);
 assert.equal(model.sanitizeReading({...view,end:2000,px:2,left:23500}).left,71*2);
 for(const left of [-1,Infinity,NaN,null,{}])assert.equal(model.sanitizeReading({...view,left}).left,0);
 assert.equal(model.sanitizeReading({...view,left:'23500'}).left,23500);
});
test('AR04: changing viewport preserves the saved year range',()=>{
 const restored=model.restoreReading({view,width:1200,range:{from:1100,to:1050}},{width:400,labelWidth:100,layout:{}});
 assert.equal(restored.view.px,6);assert.equal(restored.view.left,(2070-1100)*6);
});
test('AR04: actual persisted Xia-Shang position survives reopening',()=>{
 const {boot,attachStudy}=require('./helpers/browser.cjs');
 const first=attachStudy(boot({},1200,undefined,'data-xia-shang.js'));
 first.run('px=24;setCursor(timelineBounds.end);vp.scrollLeft=23500;saveReadingPosition()');
 const second=attachStudy(boot({...first.store},1200,undefined,'data-xia-shang.js'));
 assert.equal(second.run('vp.scrollLeft'),23500);assert.equal(second.run('px'),24);
});
