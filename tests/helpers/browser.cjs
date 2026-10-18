const fs=require('node:fs'),vm=require('node:vm');
const base=require('node:path').resolve(__dirname,'../..')+'/';
// A small DOM boundary for the timeline's keyed, top-level elements. Historical
// markup remains opaque so existing string assertions inspect the same HTML.
function installTimelineDOM(document,chart){
 function node(html){
  const opening=html.match(/^<[^>]+>/)?.[0]||'',attributes={};
  for(const match of opening.matchAll(/([\w-]+)="([^"]*)"/g))attributes[match[1]]=match[2];
  const style={},updates={},item={parentNode:null,dataset:{},className:attributes.class||'',style,firstChild:{}};
  for(const [name,value] of Object.entries(attributes))if(name.startsWith('data-'))item.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value;
  let text;
  Object.defineProperty(item.firstChild,'textContent',{get:()=>text??html.match(/<span[^>]*>([^<]*)<\/span>/)?.[1]??'',set:value=>{text=String(value);}});
  item.style=new Proxy(style,{set(target,key,value){target[key]=String(value);updates[key]=String(value);return true;}});
  item.getAttribute=name=>attributes[name]??null;
  item.matches=selector=>selector.startsWith('.')?item.className.split(' ').includes(selector.slice(1)):selector.match(/^\[data-state="?([^"\]]+)"?\]$/)?.[1]===item.dataset.state;
  Object.defineProperty(item,'isConnected',{get:()=>Boolean(item.parentNode)});
  Object.defineProperty(item,'outerHTML',{get(){
   let result=html;
   if(Object.keys(updates).length){
    const styles=Object.fromEntries((attributes.style||'').split(';').filter(Boolean).map(pair=>{const at=pair.indexOf(':');return [pair.slice(0,at),pair.slice(at+1)];}));
    for(const [name,value] of Object.entries(updates))styles[name.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())]=value;
    const value=Object.entries(styles).map(([name,value])=>name+':'+value).join(';');
    result=attributes.style!==undefined?result.replace(/style="[^"]*"/,'style="'+value+'"'):result.replace(/^<[^>]+>/,tag=>tag.slice(0,-1)+' style="'+value+'">');
   }
   if(text!==undefined)result=result.replace(/(<span\b[^>]*>)[\s\S]*?(<\/span>)/,(_,a,b)=>a+text+b);
   return result;
  }});
  return item;
 }
 function parse(html){
  const result=[];let depth=0,start=0;
  for(const token of html.matchAll(/<[^>]+>/g)){
   const close=/^<\//.test(token[0]),voidTag=/^<(?:br|hr|img|input|meta|link)\b/i.test(token[0])||/\/>$/.test(token[0]);
   if(!depth)start=token.index;
   if(close)depth--;else if(!voidTag)depth++;
   if(!depth)result.push(node(html.slice(start,token.index+token[0].length)));
  }
  return result;
 }
 chart.children=[];chart.innerHTMLWrites=0;
 chart.insertBefore=(item,before)=>{
  if(item.parentNode)item.parentNode.removeChild(item);
  const at=before?chart.children.indexOf(before):chart.children.length;
  if(at<0)throw new Error('insertBefore target is not a child');
  chart.children.splice(at,0,item);item.parentNode=chart;return item;
 };
 chart.removeChild=item=>{const at=chart.children.indexOf(item);if(at<0)throw new Error('removeChild target is not a child');chart.children.splice(at,1);item.parentNode=null;return item;};
 chart.replaceChild=(item,previous)=>{chart.insertBefore(item,previous);chart.removeChild(previous);return previous;};
 chart.querySelectorAll=selector=>chart.children.filter(item=>item.matches(selector));
 chart.querySelector=selector=>chart.querySelectorAll(selector)[0]||null;
 Object.defineProperty(chart,'childNodes',{get:()=>chart.children});
 Object.defineProperty(chart,'innerHTML',{get:()=>chart.children.map(item=>item.outerHTML).join(''),set:html=>{chart.innerHTMLWrites++;for(const child of chart.children)child.parentNode=null;chart.children=parse(String(html));for(const child of chart.children)child.parentNode=chart;}});
 const createElement=document.createElement;
 document.createElement=tag=>tag==='template'?{content:{},set innerHTML(html){this.content.firstElementChild=parse(String(html))[0]||null;}}:createElement(tag);
}
function boot(store={},width=1200,modelContext){
 const elements=new Map(),listeners={};
 const el=id=>{if(!elements.has(id))elements.set(id,{id,style:{},classList:{values:new Set(),toggle(k,value){if(value??!this.values.has(k))this.values.add(k);else this.values.delete(k)},add(k){this.values.add(k)},remove(k){this.values.delete(k)},contains(k){return this.values.has(k)}},firstChild:{textContent:''},dataset:{},innerHTML:'',textContent:'',value:'',scrollLeft:0,scrollTop:0,clientWidth:width,clientHeight:560,hidden:false,addEventListener(name,f){if(name==='close')this.onclose=f;else this[name]=f},showModal(){this.open=true},close(){this.open=false;this.onclose?.()},focus(){ctx.document.activeElement=this},querySelectorAll(){return this.controls||[]},isConnected:true,setPointerCapture(){},getBoundingClientRect(){return {top:0,left:0,right:width,bottom:800}},click(){}});return elements.get(id)};
 const periods=['all','west','spring','war'].map(p=>{let e=el(p);e.dataset.period=p;return e});
 const ctx={window:{scrollX:0,scrollY:0,scrollTo(x,y){this.scrollX=x;this.scrollY=y},matchMedia:()=>({matches:width<680}),addEventListener(){}},document:{querySelector:el,querySelectorAll:s=>s==='[data-period]'?periods:[],addEventListener(name,f){listeners[name]=f},getElementById:el,body:el('body'),createElement:()=>el('a')},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},requestAnimationFrame:f=>f(),console,Date,Math,Blob,TextEncoder,Uint8Array,DataView,URL:{createObjectURL(blob){ctx.exportedBlob=blob;return 'blob:test'},revokeObjectURL(){}},clearTimeout(){},setTimeout:f=>f()};
 ctx.AbortController=AbortController;ctx.document.modelContext=modelContext;
 installTimelineDOM(ctx.document,el('#chart'));
 const querySelector=ctx.document.querySelector;
 ctx.document.querySelector=selector=>selector==='.cursorline'?el('#chart').querySelector(selector)||querySelector(selector):querySelector(selector);
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(base+'dist/data.js','utf8'),ctx);vm.runInContext(fs.readFileSync(base+'dist/app.js','utf8'),ctx);
 const run=s=>vm.runInContext(s,ctx);
 for(const [name,path] of Object.entries(require('./state-aliases.cjs')))run(`Object.defineProperty(globalThis,${JSON.stringify(name)},{get:()=>${path},set:value=>{${path}=value},configurable:true})`);
 const action=(action,id)=>listeners.click({target:{closest:()=>({dataset:{action,id}})}});
 return {ctx,el,run,action,store};
}
function attachStudy(app){vm.runInContext(fs.readFileSync(base+'dist/study.js','utf8'),app.ctx);return app;}
module.exports={boot,attachStudy};
