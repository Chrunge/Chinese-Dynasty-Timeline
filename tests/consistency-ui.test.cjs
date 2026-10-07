const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {boot}=require('./helpers/browser.cjs');
const app=boot(),{run,el,action}=app;
action('event','e78');assert(!el('#eventFocus').innerHTML.includes('<b>齐</b>'));assert(el('#eventFocus').innerHTML.includes('<b>魏</b>'));
action('person','孟子');assert(el('#detailBody').innerHTML.includes('在齐'));
action('event','e77');assert(el('#eventFocus').innerHTML.includes('<b>魏</b>'));assert(el('#detailBody').innerHTML.includes('部分校核'));
for(const id of ['e35','e72','e77']){action('event',id);assert(el('#detailBody').innerHTML.includes('class="dateOpinions"'));assert(el('#detailBody').innerHTML.includes('存在异说'));assert(!el('#detailBody').innerHTML.includes('undefined'));}
action('event','e34');assert(el('#eventFocus').innerHTML.includes('晋悼公'));assert(el('#detailBody').innerHTML.includes('data-id="jin-r24"'));assert(run("rulersAt(byId('jin'),573).some(r=>r.id==='jin-r24')"));
assert(/class="ruler [^"]*eventRuler" data-action="ruler" data-id="jin-r24"/.test(el('#chart').innerHTML));
action('ruler','jin-r24');assert(el('#detailBody').innerHTML.includes('前573年'));assert(el('#detailBody').innerHTML.includes('前572年'));assert(el('#detailBody').innerHTML.includes('data-id="e34"'));
// Export consumes the same compiled data; text measurement is stubbed here (no visual QA).
vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../dist/export.js'),'utf8'),app.ctx);
app.ctx.measure={measureText:s=>({width:s.length*18})};
const plan=run("buildExportPlan({from:580,to:300,span:150,states:['jin','lu','liang','qi','han','zhao','yan'],cursor:573,category:'all'},measure)");
assert.deepEqual(Array.from(plan.events.find(v=>v.e.id==='e78').e.states),['liang']);
assert(plan.events.find(v=>v.e.id==='e77').e.states.includes('liang'));
assert(plan.events.find(v=>v.e.id==='e34').e.year===573);
assert(plan.sources.some(s=>s.url.includes('穀梁')));
console.log('PASS consistency: 国家/人物关联分离、异说、即位联动与导出共用资料。');
