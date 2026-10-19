const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/core/time.js'),'utf8'),ctx);
const T=ctx.Zhou.Time,plain=value=>JSON.parse(JSON.stringify(value));

test('BCE轴连续跨越公元：1=前1年、0=公元1年、-1=公元2年；未知仅null',()=>{
 for(const [date,coord] of [[{era:'BCE',year:1046},1046],[{era:'BCE',year:1},1],[{era:'CE',year:1},0],[{era:'CE',year:2},-1],[{era:'CE',year:2026},-2025]]){
  assert.equal(T.encode(date),coord);assert.deepEqual(plain(T.decode(coord)),date);assert.equal(T.isYear(coord),true);
 }
 assert.equal(T.encode({era:'BCE',year:1})-T.encode({era:'CE',year:1}),1);
 for(const value of [null,undefined,false,true,'0',NaN,Infinity,1.2,{},[]]){assert.equal(T.isYear(value),false);assert.equal(T.decode(value),null);}
 for(const value of [null,0,1,{era:'BCE',year:0},{era:'CE',year:-1},{era:'CE',year:1.5},{era:'CE',year:'1'},{era:'AD',year:1}])assert.equal(T.encode(value),null);
});

test('格式保持旧BCE输出，CE和跨公元范围不产生公元零年',()=>{
 assert.equal(T.format(632),'前632年');assert.equal(T.format(0),'公元1年');assert.equal(T.format(-2025),'公元2026年');assert.equal(T.format(null),'年份未定');
 assert.equal(T.range(1046,256),'前1046—256年');assert.equal(T.range(1,1,true),'约 前1年');
 assert.equal(T.range(1,0),'前1年—公元1年');assert.equal(T.range(0,-10,true),'约 公元1—11年');assert.equal(T.range(0,0),'公元1年');
 assert.equal(T.range(null,null),'年份未定');
});

test('overlaps包括0及负坐标且拒绝未知或反向区间',()=>{
 assert.equal(T.overlaps(2,-3,1,0),true);assert.equal(T.overlaps(0,0,0,0),true);assert.equal(T.overlaps(-2,-5,-4,-8),true);
 assert.equal(T.overlaps(1,0,-1,-3),false);assert.equal(T.overlaps(null,0,1,-1),false);assert.equal(T.overlaps(1,0,null,-1),false);
 assert.equal(T.overlaps(0,1,2,-2),false);assert.equal(T.overlaps(2,-3,-2,1),false);assert.equal(T.overlaps(1,0,.5,-.5),true);
});

test('bounds显式配置优先，旧资料由states推导，不回退周朝魔数',()=>{
 const states=[{start:1200,end:300},{start:800,end:-20},{start:null,end:null}];
 assert.deepEqual(plain(T.bounds({states})),{start:1200,end:-20,defaultEnd:-20,cursor:1200});
 assert.deepEqual(plain(T.bounds({states,timeline:{start:1046,end:221,defaultEnd:256,cursor:770}})),{start:1046,end:221,defaultEnd:256,cursor:770});
 assert.deepEqual(plain(T.bounds({states:[],timeline:{start:3,end:-3,defaultEnd:0,cursor:0}})),{start:3,end:-3,defaultEnd:0,cursor:0});
 assert.deepEqual(plain(T.bounds({states:[{start:{era:'BCE',year:2},end:{era:'CE',year:3}}]})),{start:2,end:-2,defaultEnd:-2,cursor:2});
 assert.throws(()=>T.bounds({states:[{id:'empty'}]}),/时间范围缺少有效/);assert.throws(()=>T.bounds({timeline:{start:0,end:2}}),/start 必须/);
});

test('recordYear只在显式encoding下读取CE，旧BCE正整数不重解释',()=>{
 assert.equal(T.recordYear(221),221);assert.equal(T.recordYear('221'),221);
 assert.equal(T.recordYear(0),null);assert.equal(T.recordYear(-1),null);
 assert.equal(T.recordYear(0,'bce-axis'),0);assert.equal(T.recordYear(-1,'bce-axis'),-1);
 for(const value of [null,false,true,'',[],{},1.2])assert.equal(T.recordYear(value,'bce-axis'),null);
 assert.equal(T.recordYear(221,'astronomical'),null);
});
