const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const fresh=()=>JSON.parse(fs.readFileSync(path.join(root,'data/atlas.json'),'utf8'));
async function services(atlas=fresh()){
 const {compileAtlas}=await import('../lib/atlas.mjs');
 const data=compileAtlas(atlas),ctx=vm.createContext({URLSearchParams});
 for(const file of ['search','reading','view-link'])vm.runInContext(fs.readFileSync(path.join(root,'src/core/'+file+'.js'),'utf8'),ctx);
 const search=ctx.Zhou.createSearch(data);
 return {data,search,codec:ctx.Zhou.createViewLinkCodec(data,search),reading:ctx.Zhou.createReadingModel({data,searchIndex:search.index,normalizeDetailKey:search.normalizeKey})};
}

test('既有未定位君主链接和阅读记录解析到原人物',async()=>{
 const {search,codec,reading}=await services();
 for(const [key,name] of [['undated:chen:0','陈胡公'],['undated:jin:0','唐叔虞'],['undated:wu:0','吴泰伯']]){
  const item=codec.parse('#v=1&item='+encodeURIComponent(key)).item;
  assert.equal(search.index.find(e=>e.key===item).data.name,name);
  assert(reading.validKey(key));assert.equal(search.index.find(e=>e.key===reading.canonical(key)).data.name,name);
 }
 assert.equal(search.index.filter(e=>e.undated).length,80);
});

test('排序、插入和改名不改变旧链接或稳定ID，阅读记录迁移并去重',async()=>{
 const atlas=fresh(),chen=atlas.states.find(s=>s.id==='chen'),first=chen.undated[0],stable='undated:'+first.id;
 [chen.undated[0],chen.undated[1]]=[chen.undated[1],chen.undated[0]];
 first.name='陈胡公（测试改名）';chen.undated.unshift({id:'undated-test-new',legacyKeys:[],name:'新增测试人物',known:''});
 const {search,codec,reading}=await services(atlas);
 assert.equal(search.normalizeKey('undated:chen:0'),stable);
 for(const key of ['undated:chen:0',stable])assert.equal(search.index.find(e=>e.key===codec.parse('#item='+encodeURIComponent(key)).item).data.name,first.name);
 const visits=reading.sanitizeVisits([{key:'undated:chen:0',view:{selected:['chen']},top:123},{key:stable,view:{selected:['chen']}}]);
 assert.equal(visits.length,1);assert.equal(visits[0].key,stable);assert.equal(visits[0].top,123);
 assert.equal(reading.sanitizeReading({selected:['chen'],searchTarget:'undated:chen:0'}).searchTarget,stable);
 assert.equal(codec.parse('#target=undated%3Achen%3A0').view.searchTarget,stable);
});

test('全部旧序号固定映射，重复稳定ID或旧路由在构建时拒绝',async()=>{
 const atlas=fresh(),{search}=await services(atlas);
 for(const state of atlas.states)for(const ruler of state.undated)for(const key of ruler.legacyKeys)assert.equal(search.normalizeKey(key),'undated:'+ruler.id);
 const {validateAtlas}=await import('../lib/atlas.mjs');
 const chen=atlas.states.find(s=>s.id==='chen');chen.undated[1].id=chen.undated[0].id;
 assert.throws(()=>validateAtlas(atlas),/重复 ID/);
 const duplicate=fresh(),rulers=duplicate.states.find(s=>s.id==='chen').undated;rulers[1].legacyKeys=[...rulers[0].legacyKeys];
 assert.throws(()=>validateAtlas(duplicate),/旧路由重复/);
});
