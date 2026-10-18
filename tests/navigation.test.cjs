const fs=require('node:fs');
const base=require('node:path').resolve(__dirname,'..')+'/';
const assert=require('node:assert');
const {boot}=require('./helpers/browser.cjs');
function view(app){return JSON.parse(app.run('JSON.stringify(captureDetailFrame().view)'));}
function body(app){return app.el('#detailBody').innerHTML;}
for(const width of [1200,390]){
 const app=boot({},width),{run,el,action}=app;
 run("applyCombo('builtin-seven');px=4;end=256;cursor=430;category='改革';mode='rulers';density='overview';render();vp.scrollLeft=910;vp.scrollTop=220;window.scrollY=480");
 el('war').classList.add('active');const root=view(app);
 action('state','qin');assert.equal(el('#detailBack').textContent,'返回时间线');assert.equal(el('#detail').scrollTop,0);assert.equal(run('detailHistory.length'),1);
 el('#detail').scrollTop=710;const stateHTML=body(app);const stateView=view(app);
 const focused={focus(){this.focused=true}};el('#detailBody').controls=[focused];app.ctx.document.activeElement=focused;
 action('ruler','qin-r35');assert.equal(el('#detailBack').textContent,'返回上一级');assert.equal(el('#detail').scrollTop,0);
 el('#detail').scrollTop=460;const rulerHTML=body(app),rulerView=view(app);
 action('event','e91');assert.equal(run('cursor'),260);assert.equal(run('density'),'auto');const eventHTML=body(app),eventView=view(app);el('#detail').scrollTop=280;
 action('participant','e91:2');assert(body(app).includes('王龁'));assert.equal(el('#detail').scrollTop,0);
 el('#detailBack').onclick();assert.equal(body(app),eventHTML);assert.equal(el('#detail').scrollTop,280);assert.deepEqual(view(app),eventView);
 el('#detail').cancel({preventDefault(){this.prevented=true}});assert.equal(body(app),rulerHTML);assert.equal(el('#detail').scrollTop,460);assert.deepEqual(view(app),rulerView);
 el('#detailBack').onclick();assert.equal(body(app),stateHTML);assert.equal(el('#detail').scrollTop,710);assert.deepEqual(view(app),stateView);assert(focused.focused);
 el('#detailBack').onclick();assert.equal(el('#detail').open,false);assert.equal(run('detailHistory.length'),0);assert.deepEqual(view(app),root);
 // Search result navigation restores its original scope, list length, target and scroll.
 run("selected=new Set(['liang']);px=2;end=256;category='文化';mode='events';density='overview';searchScope='all';searchDescriptions=true;updateSearch('孙膑');searchLimit=18;render();vp.scrollLeft=730;vp.scrollTop=120;$('#searchPanel').scrollTop=130");
 const searchRoot=view(app),results=el('#searchResults').innerHTML;
 action('searchHit','person:person-015');assert.equal(el('#detailBack').textContent,'返回搜索结果');el('#detail').scrollTop=270;const personHTML=body(app);
 const firstRuler=run("searchIndex.find(e=>e.key==='person:person-015').data.rulerKeys[0]");assert(firstRuler);
 action('ruler',firstRuler.slice(6));el('#detailBack').onclick();assert.equal(body(app),personHTML);assert.equal(el('#detail').scrollTop,270);
 action('event','e73');assert.equal(run('query'),'');el('#detailBack').onclick();assert.equal(body(app),personHTML);assert.equal(run('query'),'孙膑');
 el('#detailBack').onclick();assert.equal(el('#detail').open,false);assert.deepEqual(view(app),searchRoot);assert.equal(el('#searchResults').innerHTML,results);assert.equal(el('#searchPanel').scrollTop,130);
 // Closing any nested detail returns directly to the initial view and resets navigation.
 action('state','qi');action('ruler','qi-r1');action('event','e91');el('#close').onclick();assert.deepEqual(view(app),searchRoot);assert.equal(run('detailHistory.length'),0);assert.equal(el('#detail').open,false);
 action('state','lu');assert.equal(run('detailHistory.length'),1);el('#detail').click({target:el('#detail'),clientX:-1,clientY:-1});assert.deepEqual(view(app),searchRoot);assert.equal(el('#detail').open,false);
 // A grouped event list returns intact, including expanded details markup.
 run("updateSearch('');category='all';mode='both';density='auto';render()");action('cluster','e91,e73');el('#detail').scrollTop=185;el('#detailBody').innerHTML+='<details open><summary>已展开</summary></details>';const clusterHTML=body(app);
 action('event','e91');el('#detailBack').onclick();assert.equal(body(app),clusterHTML);assert.equal(el('#detail').scrollTop,185);el('#close').onclick();
 // A single search transition creates one frame even when event focus changes view.
 run("updateSearch('秦灭楚');end=256;render()");const extensionRoot=view(app);const eventKey=run('searchMatches()[0].entry.key');action('searchHit',eventKey);assert.equal(run('detailHistory.length'),1);assert.equal(run('end'),221);el('#detailBack').onclick();assert.deepEqual(view(app),extensionRoot);assert.equal(el('#extend').checked,false);
 run("updateSearch('唐叔虞')");action('searchHit',run('searchMatches()[0].entry.key'));const undatedHTML=body(app);action('state','jin');el('#detailBack').onclick();assert.equal(body(app),undatedHTML);el('#detailBack').onclick();assert.equal(run('query'),'唐叔虞');
 // Explicit chart actions keep the chosen location rather than restoring the entry view.
 action('event','e91');action('eventChart','e91');assert.equal(el('#detail').open,false);assert.equal(run('cursor'),260);assert.equal(run('activeEventId'),'e91');assert.equal(run('detailHistory.length'),0);
 action('ruler','qin-r35');action('locate','247');assert.equal(el('#detail').open,false);assert.equal(run('cursor'),247);assert.equal(run('end'),221);assert.equal(run('detailHistory.length'),0);
 // Escape returns one level, then returns to the timeline; a fresh session starts cleanly.
 action('state','qin');const escapeParent=body(app);action('ruler','qin-r35');const cancel={preventDefault(){this.prevented=true}};el('#detail').cancel(cancel);assert(cancel.prevented);assert.equal(body(app),escapeParent);el('#detail').cancel(cancel);assert.equal(el('#detail').open,false);assert.equal(run('pendingDetailFrame'),null);
}
const html=fs.readFileSync(base+'dist/index.html','utf8'),css=fs.readFileSync(base+'dist/style.css','utf8');assert(html.includes('id="detailBack"'));assert(css.includes('#detail>.dialogHead{position:sticky'));assert(css.includes('#detailBack{font-size:14px'));
console.log('PASS navigation: 多级详情返回、详情阅读位置与展开状态、搜索列表/筛选/缩放/时间范围/参考线/页面滚动恢复、关闭与Esc、事件簇、独立人物、未定位君主、主动图上定位、1200/390px逻辑。');
