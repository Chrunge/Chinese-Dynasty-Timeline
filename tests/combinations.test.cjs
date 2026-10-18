const test=require('node:test'),assert=require('node:assert/strict');
const {boot}=require('./helpers/browser.cjs');
const plain=value=>JSON.parse(JSON.stringify(value));

test('合法组合的字段、国家顺序、导入与刷新保持一致',async()=>{
 const app=boot();
 const input={id:'saved-characterization',name:'  合法组合  ',states:['qin','qi','qin','unknown'],order:['qi','qin'],pins:['qi'],from:600,to:300,end:256,cursor:450,rowHeight:56,viewHeight:640,fitRows:true,rowHeights:{qin:96},density:'full',mode:'rulers',category:'战争'};
 const normalized=plain(app.run('normalizeCombo('+JSON.stringify(input)+')'));
 assert.deepEqual(normalized,{...input,name:'合法组合',states:['qin','qi'],order:['qi','qin',...app.ctx.window.ZHOU_DATA.states.map(s=>s.id).filter(id=>!['qi','qin'].includes(id))]});
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
