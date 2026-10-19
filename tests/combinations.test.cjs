const test=require('node:test'),assert=require('node:assert/strict');
const {boot}=require('./helpers/browser.cjs');
const plain=value=>JSON.parse(JSON.stringify(value));

test('组合规范化可以不加载页面、历史查询或浏览器存储而独立运行',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ctx=vm.createContext({});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/core/time.js'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/core/combinations.js'),'utf8'),ctx);
 const normalize=ctx.Zhou.createCombinationModel({timeline:{start:1046,end:221,defaultEnd:256,cursor:770},states:[{id:'qin'},{id:'qi'}]}).normalize;
 const input={id:'saved-pure',name:'纯组合',states:['qin',{id:'qi'}],order:['qi'],pins:['qin'],from:600,to:300};
 const before=JSON.stringify(input),result=normalize(input);
 assert.equal(JSON.stringify(input),before);assert.deepEqual(plain(result.states),['qin']);assert.deepEqual(plain(result.order),['qi','qin']);
});

test('合法组合的字段、国家顺序、导入与刷新保持一致',async()=>{
 const app=boot();
 const input={id:'saved-characterization',name:'  合法组合  ',states:['qin','qi','qin','unknown'],order:['qi','qin'],pins:['qi'],from:600,to:300,end:256,cursor:450,rowHeight:56,viewHeight:640,fitRows:true,rowHeights:{qin:96},density:'full',mode:'rulers',category:'战争'};
 const normalized=plain(app.run('normalizeCombo('+JSON.stringify(input)+')'));
 assert.deepEqual(normalized,{...input,timeEncoding:'bce-axis',name:'合法组合',states:['qin','qi'],order:['qi','qin',...app.ctx.window.ZHOU_DATA.states.map(s=>s.id).filter(id=>!['qi','qin'].includes(id))]});
 await app.el('#importCombos').onchange({target:{files:[{size:100,text:async()=>JSON.stringify({format:'zhou-comparisons-v3',combinations:[input]})}],value:'file'}});
 assert.equal(app.el('#comboNotice').textContent,'已导入1个有效组合。');
 const id=app.run('savedCombos[0].id');app.run('applyCombo('+JSON.stringify(id)+')');
 assert.deepEqual(plain(app.run('[...selected]')),['qin','qi']);assert.deepEqual(plain(app.run('[...pinned]')),['qi']);
 assert.equal(app.run('rowHeights.qin'),96);assert.equal(app.run('cursor'),450);
 const reloaded=boot({...app.store});reloaded.run('applyCombo('+JSON.stringify(id)+')');
 assert.deepEqual(plain(reloaded.run('savedCombos[0]')),plain(app.run('savedCombos[0]')));
});

test('组合只接受已知字符串国家ID，导入错误顺序后仍能应用',async()=>{
 const app=boot();
 assert.equal(app.run("normalizeCombo({name:'无效',states:[{},1,true,null,{id:'qin'}]})"),null);
 const input={name:'混合输入',states:['qin',{},null,1,true,'unknown'],order:[{id:'qin'},null,1,true,'qi'],pins:[{},'qin']};
 await app.el('#importCombos').onchange({target:{files:[{size:100,text:async()=>JSON.stringify({format:'zhou-comparisons-v3',combinations:[input]})}],value:'file'}});
 assert.equal(app.el('#comboNotice').textContent,'已导入1个有效组合。');
 assert.deepEqual(plain(app.run('savedCombos[0].states')),['qin']);
 assert(app.run('savedCombos[0].order.every(id=>typeof id==="string"&&D.states.some(s=>s.id===id))'));
 assert.doesNotThrow(()=>app.run('applyCombo(savedCombos[0].id)'));
 assert.equal(app.run('visibleStates.length'),1);
});
