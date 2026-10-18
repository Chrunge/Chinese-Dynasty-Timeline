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
