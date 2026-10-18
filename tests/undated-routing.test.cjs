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
