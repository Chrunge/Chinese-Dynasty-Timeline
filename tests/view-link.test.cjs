const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {boot,attachStudy}=require('./helpers/browser.cjs');
const base=require('node:path').resolve(__dirname,'..');
const plain=value=>JSON.parse(JSON.stringify(value));
function share(app,url='https://chrunge.github.io/Zhou-Dynasty-Timeline/'){
 let current=new URL(url),index=0,replacements=0,timerId=0;const stack=[current.href],listeners={},timers=new Map(),location={};
 const fire=type=>(listeners[type]||[]).forEach(fn=>fn());
 for(const key of ['href','pathname','search','protocol'])Object.defineProperty(location,key,{get:()=>current[key]});
 Object.defineProperty(location,'hash',{get:()=>current.hash,set:value=>{current.hash=value;stack.splice(++index);stack.push(current.href);fire('hashchange');}});
 app.ctx.window.location=location;
 app.ctx.window.history={state:null,replaceState(state,title,value){current=new URL(value,current);stack[index]=current.href;this.state=state;replacements++;},go(delta){index=Math.min(stack.length-1,Math.max(0,index+delta));current=new URL(stack[index]);fire('popstate');fire('hashchange');}};
 app.ctx.window.addEventListener=(name,fn)=>(listeners[name]||=[]).push(fn);
 app.ctx.URLSearchParams=URLSearchParams;
 app.ctx.navigator={clipboard:{async writeText(value){app.copied=value;}}};
 app.ctx.setTimeout=fn=>{timers.set(++timerId,fn);return timerId;};app.ctx.clearTimeout=id=>timers.delete(id);
 app.el('#shareLink').select=()=>{app.selectedLink=true;};
 vm.runInContext(fs.readFileSync(base+'/dist/share.js','utf8'),app.ctx);
 return Object.assign(app,{location,fire,flush(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());},replacements:()=>replacements,historyLength:()=>stack.length});
}
test('链接显式条件覆盖阅读记录，初始化不抢先写回URL',()=>{
 const initial=attachStudy(boot());initial.run("applyCombo('builtin-reform');cursor=350;px=2;render();saveReadingPosition()");
 const app=share(attachStudy(boot({...initial.store})),'https://chrunge.github.io/Zhou-Dynasty-Timeline/#year=632&states=jin,chu&pinned=jin&zoom=3&category=战争&from=650&to=600&width=1076');
 assert.equal(app.run('cursor'),632);assert.equal(app.run('px'),3);assert.deepEqual(plain(app.run('[...selected]')),['jin','chu']);assert.deepEqual(plain(app.run('[...pinned]')),['jin']);assert.equal(app.run('category'),'战争');assert.equal(app.el('#viewport').scrollLeft,(1046-650)*3);assert.equal(app.replacements(),0);
});
test('同步合并连续更新，replaceState不堆积浏览器历史，复制含最新条件',async()=>{
 const app=share(attachStudy(boot()));
 app.run('setCursor(632);setCursor(631);setCursor(630)');assert.equal(app.replacements(),0);app.flush();assert.equal(app.replacements(),1);assert.equal(app.historyLength(),1);assert.equal(new URLSearchParams(app.location.hash.slice(1)).get('year'),'630');
 app.run("applyCombo('builtin-hegemony');togglePin('jin');setCursor(632,true)");app.el('#shareView').onclick();
 assert(app.el('#shareDialog').open);const params=new URL(app.el('#shareLink').value).searchParams; // Fragment remains separate from query.
 assert.equal(params.size,0);const hash=new URLSearchParams(new URL(app.el('#shareLink').value).hash.slice(1));assert.equal(hash.get('year'),'632');assert.equal(hash.get('states'),'jin,chu');assert.equal(hash.get('pinned'),'jin');
 await app.el('#copyShare').onclick();assert.equal(app.copied,app.el('#shareLink').value);
});
test('手改Hash与浏览器前进后退恢复年份、筛选、国家及固定状态',()=>{
 const app=share(attachStudy(boot()));app.run("applyCombo('builtin-reform');setCursor(350)");app.flush();
 app.location.hash='#year=632&states=jin,chu&pinned=chu&category=战争&zoom=3';assert.equal(app.run('cursor'),632);assert.equal(app.run('category'),'战争');
 app.location.hash='#year=221&states=qin&pinned=&category=all&zoom=4';assert.equal(app.run('end'),221);assert.equal(app.run('pinned.size'),0);
 app.ctx.window.history.go(-1);assert.equal(app.run('cursor'),632);assert.deepEqual(plain(app.run('[...selected]')),['jin','chu']);assert.equal(app.run('pinned.has("chu")'),true);
 app.ctx.window.history.go(-1);assert.equal(app.run('cursor'),350);assert.deepEqual(plain(app.run('[...selected]')),['qin','liang']);
 app.ctx.window.history.go(1);assert.equal(app.run('cursor'),632);app.flush();assert.equal(app.historyLength(),3);
});
test('事件、人物详情可直接分享，关闭后恢复分享视图，旧人物名转ID',()=>{
 for(const [item,title] of [['event:e91','长平之战'],['person:商鞅','商鞅']]){
  const app=share(attachStudy(boot()),'https://example.com/timeline/#year=400&states=qin,liang&pinned=&zoom=3&category=改革&item='+encodeURIComponent(item));
  assert(app.el('#detailBody').innerHTML.includes(title));assert.equal(app.run('cursor'),400);assert.equal(app.run('category'),'改革');
  app.el('#shareDetail').onclick();const key=new URLSearchParams(new URL(app.el('#shareLink').value).hash.slice(1)).get('item');assert(key.startsWith(item.startsWith('person:')?'person:person-':'event:'));
  app.el('#close').onclick();assert.equal(app.run('cursor'),400);assert.equal(app.run('category'),'改革');app.flush();assert(!new URLSearchParams(app.location.hash.slice(1)).has('item'));
 }
});
test('详情弹窗内有可操作的分享入口',()=>{
 const html=fs.readFileSync(base+'/dist/index.html','utf8');
 const detail=html.slice(html.indexOf('<dialog id="detail"'),html.indexOf('</dialog>',html.indexOf('<dialog id="detail"')));
 assert(detail.includes('id="shareDetail"'));
});
test('无Hash保留上次阅读位置，跨屏幕链接按范围适配',()=>{
 const initial=attachStudy(boot());initial.run('vp.scrollTop=88;vp.scrollLeft=1100;saveReadingPosition()');
 const app=share(attachStudy(boot({...initial.store})));assert.equal(app.el('#viewport').scrollTop,88);assert.equal(app.el('#viewport').scrollLeft,1100);
 const narrow=share(attachStudy(boot({},390)),'https://example.com/#year=632&states=jin,chu&pinned=&from=650&to=600&zoom=3&width=1076');
 assert.equal(narrow.run('px'),(390-88)/50);assert.equal(narrow.el('#viewport').scrollLeft,(1046-650)*((390-88)/50));
});
test('非法字段被忽略，空国家列表有效，不允许未知详情或任意HTML',()=>{
 const app=share(attachStudy(boot()),'https://example.com/#year=NaN&states=bad&pinned=bad&zoom=Infinity&category=<script>&item=event:bad');
 assert.equal(app.run('cursor'),770);assert.equal(app.run('px'),4);assert.equal(app.run('selected.size'),18);assert(!app.el('#detail').open);
 const codec=app.run('Zhou.createViewLinkCodec(D,searchService)');assert.equal(codec.parse('#v=900&year=632'),null);assert.equal(codec.parse('#unknown=1'),null);assert.equal(codec.parse('#'+'x'.repeat(10001)),null);
 app.location.hash='#states=&pinned=&year=632';assert.equal(app.run('visibleStates.length'),0);
});
test('本地文件保留Hash分享且剪贴板不可用时提供可选链接',async()=>{
 const app=share(attachStudy(boot()),'file:///D:/timeline/dist/index.html');app.ctx.navigator.clipboard=undefined;
 app.el('#shareView').onclick();assert(app.el('#shareNotice').textContent.includes('当前文件'));await app.el('#copyShare').onclick();assert(app.selectedLink);assert(app.el('#shareNotice').textContent.includes('请复制'));
});
