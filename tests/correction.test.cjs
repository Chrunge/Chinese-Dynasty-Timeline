const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function core(extra={URLSearchParams}){
 const ctx=vm.createContext(extra);
 for(const file of ['time','search','navigation','correction'])vm.runInContext(read('src/core/'+file+'.js'),ctx);
 return ctx;
}
const parse=value=>new URL(value);
const make=(ctx,overrides={})=>ctx.Zhou.createCorrectionLink({topic:'zhou',id:'qin-r35',name:'秦王政',year:221,...overrides});

test('纠错纯函数与11专题目录逐一对应，稳定原始ID不加路由或显示分组前缀',async()=>{
 const {catalog,compileProduction}=await import('../lib/production.mjs');
 const ctx=core();assert.equal(catalog.length,11);
 for(const topic of catalog){
  const data=compileProduction(JSON.parse(read('data/'+topic.file)),topic.id);
  const entries=ctx.Zhou.createSearch(data).index;
  for(const type of ['country','ruler','person','event']){
   const entry=entries.find(e=>e.type===type);assert(entry,topic.id+':'+type);
   const options=Object.freeze({topic:topic.id,id:entry.data.id,name:entry.data.name,year:data.timeline.cursor});
   const value=ctx.Zhou.createCorrectionLink(options),url=parse(value);
   assert.equal(url.origin,'https://github.com');assert.equal(url.pathname,'/Chrunge/Chinese-Dynasty-Timeline/issues/new');
   assert.equal(url.searchParams.get('template'),'data-correction.yml');
   assert.equal(url.searchParams.get('topic'),topic.id==='liao-jin-song'?'宋辽金':topic.name);
   assert.equal(url.searchParams.get('record_id'),entry.data.id);
   assert.equal(url.searchParams.get('record_name'),entry.data.name);
   assert.equal(url.searchParams.get('reference_year'),ctx.Zhou.Time.format(options.year));
   assert.equal(ctx.Zhou.createCorrectionLink(options),value,'same immutable input produces the same URL');
  }
 }
});

test('参考线公元/公元前与未知年份复用Zhou.Time，不制造0年或条目日期',()=>{
 const ctx=core();
 for(const [year,label] of [[221,'前221年'],[1,'前1年'],[0,'公元1年'],[-1,'公元2年'],[-220,'公元221年'],[null,'年份未定'],[undefined,'年份未定'],[NaN,'年份未定'],[Infinity,'年份未定'],['221','年份未定']]){
  assert.equal(parse(make(ctx,{year})).searchParams.get('reference_year'),label);
 }
});

test('URLSearchParams单次编码特殊字符/换行/引号/恶意参数，不允许更换repo或插入提交参数',()=>{
 const ctx=core(),id='raw:&id=# +/%?\n汉字',name='"\'><img src=x onerror=alert(1)> &template=evil.yml&assignees=attacker#hash\n';
 const url=parse(make(ctx,{id,name,repo:'https://attacker.invalid',template:'evil.yml'}));
 assert.equal(url.hostname,'github.com');assert.equal(url.hash,'');
 assert.equal(url.searchParams.get('record_id'),id);assert.equal(url.searchParams.get('record_name'),name);
 assert.equal(url.searchParams.get('template'),'data-correction.yml');assert.equal(url.searchParams.has('assignees'),false);
 assert.deepEqual([...url.searchParams.keys()],['template','topic','record_id','record_name','reference_year']);
 assert(!url.href.includes('<img'));assert(!url.href.includes('\n'));
});

test('未知专题/空身份安全拒绝，不从名称或group键猜测ID；旧VM无URLSearchParams不报错',()=>{
 const ctx=core();
 for(const topic of ['unknown','group:qin-han-succession','__proto__','constructor',null,{},''])assert.equal(make(ctx,{topic}),null);
 for(const key of ['id','name'])for(const value of ['', '  ',null,undefined,42,{}])assert.equal(make(ctx,{[key]:value}),null);
 for(const value of [undefined,null,{},[],false])assert.equal(ctx.Zhou.createCorrectionLink(value),null);
 assert.equal(make(core({})),null);
});

test('Issue Form字段ID严格匹配预填query，问题和来源保留给用户填写并手动提交',()=>{
 const text=read('.github/ISSUE_TEMPLATE/data-correction.yml');
 const ids=[...text.matchAll(/^    id: ([a-z_]+)$/gm)].map(match=>match[1]);
 assert.deepEqual(ids,['topic','record_id','record_name','reference_year','correction','sources']);
 assert.equal(new Set(ids).size,ids.length);
 const url=parse(make(core()));
 assert.deepEqual([...url.searchParams.keys()].filter(key=>key!=='template'),ids.slice(0,4));
 assert.equal(url.searchParams.get('template'),'data-correction.yml');
 assert.match(text,/^name: 资料纠错$/m);assert.match(text,/^description: /m);
 assert.match(text,/由详情页预填/);assert.match(text,/再自行提交/);assert.match(text,/不是条目的在位、生卒或事件日期/);
 assert.equal((text.match(/^      required: true$/gm)||[]).length,6);
});

// Source-only navigation fixture: no dist rebuild, network, window.open or Issue
// submission. It parses only the correction anchor, leaving historical HTML
// otherwise untouched. The shared VM harness is intentionally not modified.
function detailFixture(data){
 const ctx=core(),els=new Map();let markup='',anchor=null;
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const unescape=value=>value.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
 function element(id){
  if(els.has(id))return els.get(id);
  const handlers=new Map(),node={id,scrollTop:0,open:false,textContent:'',innerHTML:'',dataset:{},isConnected:true,
   addEventListener(type,fn){if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push(fn);},
   emit(type,event){for(const fn of handlers.get(type)||[])fn(event);},
   focus(){ctx.document.activeElement=this;},showModal(){this.open=true;},close(){this.open=false;},
   querySelectorAll(){return this.controls||[];}};
  els.set(id,node);return node;
 }
 const body=element('#detailBody');
 Object.defineProperty(body,'innerHTML',{get:()=>markup,set:value=>{
  markup=value;anchor=null;
  const tag=markup.match(/<a data-correction-link="true"[^>]*>/)?.[0];
  if(tag){
   const attributes=Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],unescape(m[2])]));
   anchor={attributes,setAttribute(name,value){this.attributes[name]=value;},getAttribute(name){return this.attributes[name];},
    closest(selector){return selector==='[data-correction-link]'?this:null;},focus(){ctx.document.activeElement=this;}};
  }
 }});
 body.querySelector=selector=>selector==='[data-correction-link]'?anchor:null;
 body.querySelectorAll=()=>anchor?[anchor]:[];
 Object.assign(ctx,{$:element,D:data,searchIndex:ctx.Zhou.createSearch(data).index,escapeHTML:escape,
  normalizeDetailKey:ctx.Zhou.createSearch(data).normalizeKey,navigation:ctx.Zhou.createNavigation(),
  appState:{conditions:{cursor:430}},document:{activeElement:null,querySelectorAll:()=>[],getElementById:id=>element('#'+id)},
  detailSheet:{sync(){}},pageEffects:{rememberDetail(){},recordVisit(){},share(){},updateStudy(){}},
  viewAdapter:{capture:()=>({cursor:ctx.appState.conditions.cursor}),restore:view=>{ctx.appState.conditions.cursor=view.cursor;}}});
 vm.runInContext(read('src/ui/navigation-details.js'),ctx);
 return {ctx,body,el:element,run:code=>vm.runInContext(code,ctx),anchor:()=>anchor,
  activate(type='click'){
   const event={target:anchor,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;}};body.emit(type,event);return event;
  }};
}
async function zhou(){const {compileProduction}=await import('../lib/production.mjs');return compileProduction(JSON.parse(read('data/atlas.json')),'zhou');}

test('君主/事件/人物/未定年/国家共用详情底部入口，原名称原ID与新窗口安全属性保持',async()=>{
 const f=detailFixture(await zhou());
 for(const key of ['ruler:qin-r35','event:e91','person:person-015','undated:chen:0','country:qin']){
  f.ctx.currentKey=key;f.run("show('test','<h3 id=original>原详情</h3>',currentKey)");
  const entry=f.ctx.searchIndex.find(e=>e.key===f.ctx.normalizeDetailKey(key));
  assert.equal(parse(f.anchor().getAttribute('href')).searchParams.get('record_id'),entry.data.id);
  assert.equal(parse(f.anchor().getAttribute('href')).searchParams.get('record_name'),entry.data.name);
  assert.equal(f.anchor().getAttribute('target'),'_blank');assert.equal(f.anchor().getAttribute('rel'),'noopener noreferrer');
  assert(f.body.innerHTML.startsWith('<h3 id=original>原详情</h3>'));assert.equal((f.body.innerHTML.match(/data-correction-link=/g)||[]).length,1);
 }
 // The old ordinal is canonicalized to the stable undated source ID.
 f.ctx.currentKey='undated:chen:0';f.run('detailCorrectionURL(currentKey)');
 const raw=parse(f.run('detailCorrectionURL(currentKey)')).searchParams.get('record_id');assert.notEqual(raw,'chen:0');assert.equal(raw,f.ctx.D.states.find(s=>s.id==='chen').undated[0].id);
 for(const key of [null,'cluster:e91,e73','group:qin-han-succession','ruler:missing','country:missing']){
  f.ctx.currentKey=key;f.run("show('help','<h3>原帮助或聚类</h3>',currentKey)");assert.equal(f.anchor(),null);assert.equal(f.body.innerHTML,'<h3>原帮助或聚类</h3>');
 }
});

test('历史缓存恢复后与click/键盘激活/中键/右键时刷新参考线，不改导航scrollTop/焦点或自动提交',async()=>{
 const f=detailFixture(await zhou());
 f.run("show('ruler','<h3>君主</h3>','ruler:qin-r35')");
 f.el('#detail').scrollTop=690;f.body.scrollTop=35;f.anchor().focus();
 f.run("show('event','<h3>事件</h3>','event:e91')");
 const frame=f.ctx.navigation.frames.at(-1);assert(frame.detail.html.includes('data-correction-link'));
 // Simulate cached markup from a different reading year. Restore must use the
 // restored current view, rather than its stale HTML's original href.
 frame.view.cursor=-24;f.run('backDetail()');
 assert.equal(parse(f.anchor().getAttribute('href')).searchParams.get('reference_year'),'公元25年');
 assert.equal(f.el('#detail').scrollTop,690);assert.equal(f.body.scrollTop,35);assert.equal(f.ctx.document.activeElement,f.anchor());
 assert.equal(f.ctx.navigation.key,'ruler:qin-r35');
 for(const [type,year,label] of [['click',0,'公元1年'],['focusin',221,'前221年'],['auxclick',-1,'公元2年'],['contextmenu',null,'年份未定']]){
  f.ctx.appState.conditions.cursor=year;const before=f.ctx.navigation.frames.length;
  assert.equal(f.activate(type).defaultPrevented,false);
  assert.equal(parse(f.anchor().getAttribute('href')).searchParams.get('reference_year'),label);
  assert.equal(f.ctx.navigation.frames.length,before);assert.equal(f.el('#detail').scrollTop,690);assert.equal(f.body.scrollTop,35);
 }
 // Synthetic/malicious source text remains URL data, never a new HTML attribute.
 const entry=f.ctx.searchIndex.find(e=>e.key==='ruler:qin-r35');entry.data.name='" onmouseover="alert(1) <script>bad</script>';
 f.run("show('test','<h3>安全详情</h3>','ruler:qin-r35')");
 assert(!f.body.innerHTML.includes('<script>'));assert(!f.body.innerHTML.includes('onmouseover='));
 assert.equal(parse(f.anchor().getAttribute('href')).searchParams.get('record_name'),entry.data.name);
 f.ctx.navigation.key='cluster:e91';assert.equal(f.activate().defaultPrevented,true);
});
