const fs=require('node:fs');
const base=require('node:path').resolve(__dirname,'..')+'/';
const assert=require('node:assert');
const {boot,attachStudy}=require('./helpers/browser.cjs');
const app=boot(),{el,run,action}=app;
function input(q){el('#search').value=q;el('#search').oninput({target:{value:q}});}
function keys(q){return JSON.parse(run(`JSON.stringify(searchMatches(${JSON.stringify(q)}).map(h=>h.entry.key))`));}
assert(!fs.readFileSync(base+'dist/index.html','utf8').includes('id="sevenView"'));
assert(!fs.readFileSync(base+'dist/app.js','utf8').includes("$('#sevenView')"));
el('#comboSelect').onchange({target:{value:'builtin-seven'}});assert.equal(run('visibleStates.length'),7);
run("selected=new Set(['qin']);query='';pinned=new Set();end=256;category='政治';mode='overview';density='overview';px=1;render()");
input('齐桓公');assert(keys('齐桓公').some(k=>k.startsWith('ruler:qi-')));const huans=keys('齐桓公').filter(k=>k.startsWith('ruler:'));assert.equal(huans.length,2);assert(el('#searchResults').innerHTML.includes('前685'));assert(el('#searchResults').innerHTML.includes('前374'));
assert(run('visibleStates.some(s=>s.id==="qi")'));assert(!run('selected.has("qi")'));
el('#searchScope').onchange({target:{value:'selected'}});assert.equal(keys('齐桓公').length,0);assert(el('#searchResults').innerHTML.includes('没有匹配结果'));
el('#searchScope').onchange({target:{value:'all'}});
input('长平之战');assert.deepEqual(keys('长平之战'),['event:e91']);assert(el('#searchResults').innerHTML.includes('长平之战'));assert.equal(run('cursor'),300); // typing never jumps to a biography mention
const oldCursor=run('cursor');input('長平之戰');assert.deepEqual(keys('長平之戰'),['event:e91']);assert.equal(run('cursor'),oldCursor);
action('searchHit','event:e91');assert(el('#detailBody').innerHTML.includes('当年在位君主'));assert(el('#chart').innerHTML.includes('linkedEvent'));assert.equal(run('cursor'),260);assert.equal(run('mode'),'both');assert.equal(run('density'),'auto');assert.equal(run('category'),'all');assert.equal(run('query'),'長平之戰');
input('秦灭楚');assert(keys('秦灭楚').includes('event:e102'));run('end=256;render()');action('searchHit','event:e102');assert.equal(run('end'),221);assert.equal(run('cursor'),223);assert(el('#detailBody').innerHTML.includes('秦灭楚'));
input('嬴政');assert.equal(keys('嬴政')[0],'ruler:qin-r35');action('searchHit','ruler:qin-r35');assert(el('#detailBody').innerHTML.includes('秦王政'));assert(el('#detailBody').innerHTML.includes('前247年'));assert(el('#chart').innerHTML.includes('data-id="qin-r35"'));
input('商鞅');assert.equal(keys('商鞅')[0],'person:商鞅');assert(!keys('商鞅').includes('ruler:qin-r29'));action('searchHit','person:商鞅');assert(el('#detailBody').innerHTML.includes('商鞅'));assert(el('#detailBody').innerHTML.includes('秦孝公'));assert(el('#detailBody').innerHTML.includes('全程任职'));assert(el('#detailBody').innerHTML.includes('商鞅第一次变法'));
el('#searchDescriptions').onchange({target:{checked:true}});assert(keys('商鞅').includes('ruler:qin-r29'));assert(el('#searchResults').innerHTML.includes('简介中提及'));
el('#searchDescriptions').onchange({target:{checked:false}});
input('孫臏');assert.equal(keys('孫臏')[0],'person:孙膑');action('searchHit','person:孙膑');assert(el('#detailBody').innerHTML.includes('孙膑'));assert(el('#detailBody').innerHTML.includes('桂陵之战'));
input('孟子');assert.equal(keys('孟子')[0],'person:孟子');action('searchHit','person:孟子');assert(el('#detailBody').innerHTML.includes('孟子见梁惠王'));assert(!el('#detailBody').innerHTML.includes('始终任职'));
input('赵成子');assert.equal(keys('赵成子')[0],'person:赵衰');action('searchHit','person:赵衰');assert(el('#detailBody').innerHTML.includes('赵衰'));assert(run('visibleStates.some(s=>s.id==="jin")'));
input('秦');assert.equal(keys('秦')[0],'country:qin');assert.equal(run('visibleStates.filter(s=>!pinned.has(s.id)).length'),1);assert.equal(run('visibleStates[0].id'),'qin');action('searchHit','country:qin');assert(el('#detailBody').innerHTML.includes('秦王政'));
input('唐叔虞');const undated=keys('唐叔虞').find(k=>k.startsWith('undated:'));assert(undated);action('searchHit',undated);assert(el('#detailBody').innerHTML.includes('未可靠')||el('#detailBody').innerHTML.includes('不完整年份'));assert(el('#detailBody').innerHTML.includes('唐叔虞'));
input(' 周 赧 王 ');assert(keys(' 周 赧 王 ').some(k=>k.startsWith('ruler:zhou-')));
input('完全不存在的姓名XYZ');assert.equal(keys('完全不存在的姓名XYZ').length,0);assert(el('#searchResults').innerHTML.includes('没有匹配结果'));
input('<img src=x onerror=alert(1)>');assert(!el('#searchResults').innerHTML.includes('<img'));
input('王');const before=el('#searchResults').innerHTML;action('moreSearch');assert(el('#searchResults').innerHTML.length>before.length);
input('秦始皇');el('#search').onkeydown({key:'Enter',preventDefault(){}});assert(el('#detailBody').innerHTML.includes('秦王政'));
el('#search').onkeydown({key:'Escape'});assert.equal(run('query'),'');assert.equal(el('#searchPanel').hidden,true);
input('孔子');el('#clearSearch').onclick();assert.equal(run('query'),'');assert.equal(el('#searchResults').innerHTML,'');
const mobile=boot({},390);mobile.el('#search').oninput({target:{value:'齐桓公'}});assert(mobile.el('#searchResults').innerHTML.includes('前685'));mobile.action('searchHit',huans[0]);assert(mobile.el('#detailBody').innerHTML.includes('齐桓公'));
console.log('PASS search: 七雄仅快速切换、全站/当前国家范围、同名君主区分、名称与全文分离、未选国家、简介误命中、简繁与别称、人物独立详情、秦统一时期、未定位君主、Enter/Escape、清除、更多结果、390px宽度逻辑。');
