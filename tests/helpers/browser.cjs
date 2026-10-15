const fs=require('node:fs'),vm=require('node:vm');
const base=require('node:path').resolve(__dirname,'../..')+'/';
function boot(store={},width=1200,modelContext){
 const elements=new Map(),listeners={};
 const el=id=>{if(!elements.has(id))elements.set(id,{id,style:{},classList:{values:new Set(),toggle(k,value){if(value??!this.values.has(k))this.values.add(k);else this.values.delete(k)},add(k){this.values.add(k)},remove(k){this.values.delete(k)},contains(k){return this.values.has(k)}},firstChild:{textContent:''},dataset:{},innerHTML:'',textContent:'',value:'',scrollLeft:0,scrollTop:0,clientWidth:width,clientHeight:560,hidden:false,addEventListener(name,f){if(name==='close')this.onclose=f;else this[name]=f},showModal(){this.open=true},close(){this.open=false;this.onclose?.()},focus(){ctx.document.activeElement=this},querySelectorAll(){return this.controls||[]},isConnected:true,setPointerCapture(){},getBoundingClientRect(){return {top:0,left:0,right:width,bottom:800}},click(){}});return elements.get(id)};
 const periods=['all','west','spring','war'].map(p=>{let e=el(p);e.dataset.period=p;return e});
 const ctx={window:{scrollX:0,scrollY:0,scrollTo(x,y){this.scrollX=x;this.scrollY=y},matchMedia:()=>({matches:width<680}),addEventListener(){}},document:{querySelector:el,querySelectorAll:s=>s==='[data-period]'?periods:[],addEventListener(name,f){listeners[name]=f},getElementById:el,body:el('body'),createElement:()=>el('a')},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},requestAnimationFrame:f=>f(),console,Date,Math,Blob,TextEncoder,Uint8Array,DataView,URL:{createObjectURL(blob){ctx.exportedBlob=blob;return 'blob:test'},revokeObjectURL(){}},clearTimeout(){},setTimeout:f=>f()};
 ctx.AbortController=AbortController;ctx.document.modelContext=modelContext;
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(base+'dist/data.js','utf8'),ctx);vm.runInContext(fs.readFileSync(base+'dist/app.js','utf8'),ctx);
 const run=s=>vm.runInContext(s,ctx);
 for(const [name,path] of Object.entries(require('./state-aliases.cjs')))run(`Object.defineProperty(globalThis,${JSON.stringify(name)},{get:()=>${path},set:value=>{${path}=value},configurable:true})`);
 const action=(action,id)=>listeners.click({target:{closest:()=>({dataset:{action,id}})}});
 return {ctx,el,run,action,store};
}
function attachStudy(app){vm.runInContext(fs.readFileSync(base+'dist/study.js','utf8'),app.ctx);return app;}
module.exports={boot,attachStudy};
