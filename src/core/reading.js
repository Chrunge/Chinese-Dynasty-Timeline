(function(root){
 'use strict';
 const Zhou=root.Zhou||(root.Zhou={});
 Zhou.createReadingModel=function({data,searchIndex,normalizeDetailKey=key=>key,now=()=>Date.now()}){
  const time=Zhou.Time,bounds=time.bounds(data);
  const states=new Set(data.states.map(x=>x.id)),events=new Set(data.events.map(x=>x.id));
  const entries=new Map(searchIndex.map(x=>[x.key,x]));
  const periods=new Set(['all',...(data.periods||[]).map(period=>period.id)]);
  const number=(value,min,max,fallback)=>{
   if(typeof value!=='number'&&typeof value!=='string')return fallback;
   const numeric=Number(value);
   return Number.isFinite(numeric)?Math.min(max,Math.max(min,numeric)):fallback;
  };
  const canonical=key=>typeof key==='string'?normalizeDetailKey(key):null;
  function validKey(value){const key=canonical(value);return typeof key==='string'&&(entries.has(key)||key.startsWith('cluster:')&&key.slice(8).split(',').every(id=>events.has(id)));}
  function sanitizeReading(v){
   if(!v||typeof v!=='object'||!Array.isArray(v.selected)||v.timeEncoding!==undefined&&v.timeEncoding!==time.encoding)return null;
   const year=(value,low,high,fallback)=>{const coord=time.recordYear(value,v.timeEncoding);return coord===null?fallback:Math.max(low,Math.min(high,coord));};
   const end=year(v.end,bounds.end,bounds.start,bounds.defaultEnd),target=canonical(v.searchTarget);
   return {timeEncoding:time.encoding,px:number(v.px,.8,24,4),end,selected:[...new Set(v.selected.filter(id=>states.has(id)))],query:typeof v.query==='string'?v.query.slice(0,100):'',mode:['both','rulers','events','overview'].includes(v.mode)?v.mode:'both',category:['all','政治','战争','改革','外交','文化'].includes(v.category)?v.category:'all',cursor:year(v.cursor,end,bounds.start,Math.max(end,bounds.cursor)),density:['auto','full','overview'].includes(v.density)?v.density:'auto',activeEventId:events.has(v.activeEventId)?v.activeEventId:null,searchScope:v.searchScope==='selected'?'selected':'all',searchDescriptions:Boolean(v.searchDescriptions),searchLimit:Math.round(number(v.searchLimit,6,200,6)),searchTarget:entries.has(target)?target:null,left:number(v.left,0,21000,0),top:number(v.top,0,20000,0),searchTop:number(v.searchTop,0,20000,0),pageX:0,pageY:number(v.pageY,0,20000,0),periods:Array.isArray(v.periods)?v.periods.filter(p=>periods.has(p)):[]};
  }
  function sanitizeVisits(values){
   if(!Array.isArray(values))return [];
   const seen=new Set(),result=[],at=now();
   for(const value of values){
    if(value?.timeEncoding!==undefined&&value.timeEncoding!==time.encoding)continue;
    const key=canonical(value?.key),view=sanitizeReading(value?.view&&{...value.view,timeEncoding:value.view.timeEncoding??value.timeEncoding});
    if(!validKey(key)||!view||seen.has(key))continue;
    seen.add(key);result.push({timeEncoding:time.encoding,key,title:entries.get(key)?.title||'密集事件列表',view,top:number(value.top,0,20000,0),at:number(value.at,0,at,at)});
    if(result.length===50)break;
   }
   return result;
  }
  function sanitizeLayout(value={},defaults={}){
   const l=value&&typeof value==='object'?value:{},rowHeights={};
   for(const [id,h] of Object.entries(l.rowHeights||{}))if(states.has(id)&&[40,56,64,96,128,160].includes(h))rowHeights[id]=h;
   return {order:Array.isArray(l.order)?[...new Set([...l.order.filter(id=>states.has(id)),...states])]:defaults.order,pins:Array.isArray(l.pins)?l.pins.filter(id=>states.has(id)):defaults.pins,rowHeight:number(l.rowHeight,36,160,defaults.rowHeight),viewHeight:number(l.viewHeight,320,1000,defaults.viewHeight),fitRows:Boolean(l.fitRows),rowHeights};
  }
  function restoreReading(saved,{width,labelWidth,layout}){
   if(saved?.timeEncoding!==undefined&&saved.timeEncoding!==time.encoding)return null;
   const encoding=saved?.view?.timeEncoding??saved?.timeEncoding;
   const view=sanitizeReading(saved?.view&&{...saved.view,timeEncoding:encoding});if(!view)return null;
   const savedWidth=number(saved.width,0,Number.MAX_VALUE,width)||width;
   const rangeNumber=(value,low,high,fallback)=>{
    if(typeof value!=='number'&&typeof value!=='string'||typeof value==='string'&&!value.trim())return fallback;
    const coord=Number(value);return Number.isFinite(coord)&&(encoding===time.encoding||coord>0)?Math.max(low,Math.min(high,coord)):fallback;
   };
   if(Math.abs(savedWidth-width)>20&&saved.range){const from=rangeNumber(saved.range.from,view.end,bounds.start,bounds.start),to=rangeNumber(saved.range.to,view.end,from,view.end);view.px=number((width-labelWidth)/Math.max(1,from-to),.8,24,4);view.left=(bounds.start-from)*view.px;}
   return {view,layout:sanitizeLayout(saved.layout,layout)};
  }
  return {number,canonical,validKey,sanitizeReading,sanitizeVisits,sanitizeLayout,restoreReading};
 };
})(globalThis);
