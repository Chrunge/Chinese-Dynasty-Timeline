const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const text=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
function load(ctx,file){vm.runInContext(text(file),ctx,{filename:file});}
function fixture(){return {datasetId:'example-cross-era',title:'跨元专题（示例）',timeline:{start:10,end:-10,defaultEnd:-10,cursor:1},states:[{id:'a',name:'甲政权',start:10,end:-10},{id:'b',name:'乙政权',start:2,end:-10}],events:[],combinations:[{id:'preset',name:'不应借用的研究组合名',states:['a'],from:10,to:1}]};}
function shared(){return {timeEncoding:'bce-axis',view:{timeEncoding:'bce-axis',cursor:0,end:-10,selected:['a'],px:4,category:'all',mode:'both',density:'auto',searchScope:'all',query:'',searchDescriptions:false,activeEventId:null,searchTarget:null},pinned:['b'],order:['b','a'],range:{from:1.2,to:-1.2,width:9.6},item:null};}
const pure=vm.createContext({URLSearchParams});for(const file of ['src/core/time.js','src/core/view-link.js','src/core/share-summary.js'])load(pure,file);

test('摘要用真实专题与所选/置顶政权组合，不借用过期研究组合名',()=>{
 const data=fixture(),value=shared(),before=JSON.stringify({data,value});
 const summary=pure.Zhou.describeSharedView(data,value);
 assert.match(summary,/跨元专题（示例）/);assert.match(summary,/甲政权、乙政权/);assert.doesNotMatch(summary,/不应借用的研究组合名/);
 assert.match(summary,/前1年—公元2年/);assert.match(summary,/参考年份：公元1年/);assert.equal(JSON.stringify({data,value}),before);
});
test('视窗浮点仅人读取整，hash编码和往返值保持既有codec不变',()=>{
 const data=fixture(),value=shared(),search={index:[],normalizeKey:key=>key},codec=pure.Zhou.createViewLinkCodec(data,search);
 const hash=codec.encode(value),before=JSON.stringify(value);pure.Zhou.describeSharedView(data,value);
 assert.equal(codec.encode(value),hash);assert.equal(JSON.stringify(value),before);assert.match(hash,/v=2/);assert.match(hash,/time=bce-axis/);
 const result=codec.parse(hash);assert.equal(result.range.from,1.2);assert.equal(result.range.to,-1.2);assert.equal(result.view.cursor,0);
 value.view.cursor=5;value.view.end=1;value.range={from:7.8,to:2.2,width:22.4};assert.match(codec.encode(value),/^#v=1&/);assert.doesNotMatch(codec.encode(value),/time=/);
 assert.match(pure.Zhou.describeSharedView(data,value),/前8—2年/);
});
test('全公元和跨界负零四舍五入没有公元零年，未知年份/反向视窗不补造',()=>{
 const data=fixture(),value=shared();value.range={from:-.1,to:-3.6};value.view.cursor=-2;
 const summary=pure.Zhou.describeSharedView(data,value);assert.match(summary,/公元1—5年/);assert.match(summary,/参考年份：公元3年/);assert.doesNotMatch(summary,/公元0年|前0年|前-\d/);
 value.range={from:null,to:-2};value.view.cursor=null;assert.match(pure.Zhou.describeSharedView(data,value),/范围未定；参考年份：年份未定/);
 value.range={from:.1,to:.2};assert.match(pure.Zhou.describeSharedView(data,value),/范围未定/);
});
test('筛选文案揭示类别与搜索范围，空选择不伪称默认政权',()=>{
 const data=fixture(),value=shared();value.view.selected=['invalid'];value.pinned=[];value.view.category='战争';value.view.query='  待考\n记载  ';value.view.searchScope='selected';value.view.searchDescriptions=true;
 const summary=pure.Zhou.describeSharedView(data,value);assert.match(summary,/所选政权组合：未选择/);assert.match(summary,/事件类别：战争/);assert.match(summary,/搜索：待考 记载（所选政权，含正文）/);
});

function browser({reject=false,clipboard=true,legacy=false}={}){
 const elements=new Map(),copies=[],data=fixture(),value=shared();let active=null;
 const $=selector=>{if(legacy&&['#shareText','#copyShareText'].includes(selector))return null;if(!elements.has(selector))elements.set(selector,{value:'',textContent:'',open:false,selected:false,showModal(){this.open=true;},close(){this.open=false;},focus(){active=selector;},select(){this.selected=true;}});return elements.get(selector);};
 const location={href:'https://example.test/topic.html',hash:'',pathname:'/topic.html',search:'',protocol:'https:'};
 const history={state:null,replaceState(state,title,url){location.href='https://example.test'+url;location.hash=url.includes('#')?'#'+url.split('#')[1]:'';}};
 const ctx=vm.createContext({D:data,URLSearchParams,viewAdapter:{capture:()=>({...value.view})},timelineBounds:data.timeline,vp:{scrollLeft:35.2,clientWidth:20},labelWidth:()=>4,appState:{layout:{pinned:new Set(value.pinned),stateOrder:value.order}},navigation:{key:null},searchService:{index:[],normalizeKey:key=>key},pageEffects:{},window:{location,history,addEventListener(){}},document:{hidden:false,addEventListener(){}},navigator:clipboard?{clipboard:{async writeText(value){if(reject)throw new Error('denied');copies.push(value);}}}:{},$: $,setTimeout:()=>1,clearTimeout(){},openDetailKey(){},closeDetail(){},restoreDetailView(){}});
 for(const file of ['src/core/time.js','src/core/view-link.js','src/core/share-summary.js','src/share.js'])load(ctx,file);
 return {ctx,$,copies,location,get active(){return active;}};
}
test('复制链接保持纯link；新按钮复制完整摘要+换行+相同link',async()=>{
 const app=browser();app.$('#shareView').onclick();const link=app.$('#shareLink').value,full=app.$('#shareText').value;
 assert.match(full,/跨元专题/);assert(full.endsWith('\n'+link));assert.match(link,/^https:\/\/example.test\/topic.html#v=2&/);
 await app.$('#copyShare').onclick();assert.deepEqual(app.copies,[link]);assert.equal(app.$('#shareNotice').textContent,'链接已复制。');
 await app.$('#copyShareText').onclick();assert.deepEqual(app.copies,[link,full]);assert.equal(app.$('#shareNotice').textContent,'摘要及链接已复制。');assert.equal(app.$('#shareLink').value,link);
});
test('clipboard拒绝或不可用时可选中完整文本，纯link回退仍是link',async()=>{
 for(const options of [{reject:true},{clipboard:false}]){
  const app=browser(options);app.$('#shareDetail').onclick();const full=app.$('#shareText').value;
  await app.$('#copyShareText').onclick();assert.equal(app.active,'#shareText');assert.equal(app.$('#shareText').selected,true);assert.equal(app.$('#shareText').value,full);assert.match(app.$('#shareNotice').textContent,/完整摘要及链接/);
  await app.$('#copyShare').onclick();assert.equal(app.active,'#shareLink');assert.equal(app.$('#shareLink').selected,true);assert.equal(app.copies.length,0);
 }
});
test('旧模板缺少可选摘要控件仍可开分享和复制旧链接',async()=>{
 const app=browser({legacy:true});assert.doesNotThrow(()=>app.$('#shareView').onclick());await app.$('#copyShare').onclick();assert.equal(app.copies.length,1);assert.equal(app.copies[0],app.$('#shareLink').value);
});
