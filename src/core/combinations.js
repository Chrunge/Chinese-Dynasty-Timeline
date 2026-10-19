(function(Zhou){
 'use strict';
 Zhou.createCombinationModel=function(D){
 const time=Zhou.Time,bounds=time.bounds(D);
function normalizeCombo(c){
 if(!c||typeof c!=='object'||typeof c.name!=='string'||!c.name.trim()||!Array.isArray(c.states)||c.timeEncoding!==undefined&&c.timeEncoding!==time.encoding)return null;
 const validId=id=>typeof id==='string'&&D.states.some(s=>s.id===id);
 const states=[...new Set(c.states.filter(validId))];if(!states.length)return null;
 const number=(v,low,high,fallback)=>(typeof v==='number'||typeof v==='string'&&v.trim())&&Number.isFinite(Number(v))?Math.max(low,Math.min(high,Number(v))):fallback;
 const year=(value,fallback)=>{const coord=time.recordYear(value,c.timeEncoding);return coord===null?fallback:Math.max(bounds.end,Math.min(bounds.start,coord));};
 const order=[...new Set((Array.isArray(c.order)?c.order:states).filter(validId)),...D.states.map(s=>s.id)].filter((id,i,a)=>a.indexOf(id)===i);
 const from=year(c.from,bounds.start),to=year(c.to,bounds.defaultEnd);if(from<to)return null;
 const end=to<year(c.end,bounds.defaultEnd)?bounds.end:year(c.end,bounds.defaultEnd);
 const sizes={};for(const id of states){const h=c.rowHeights?.[id];if([40,56,64,96,128,160].includes(h))sizes[id]=h;}
 return {timeEncoding:time.encoding,id:typeof c.id==='string'&&/^saved-[\w-]{1,90}$/.test(c.id)?c.id:'saved-'+Date.now()+'-'+Math.random().toString(36).slice(2,9),name:c.name.trim().slice(0,40),states,order,pins:Array.isArray(c.pins)?[...new Set(c.pins.filter(id=>states.includes(id)))]:[],from,to,end,cursor:Math.max(end,year(c.cursor,from)),rowHeight:number(c.rowHeight,36,160,64),viewHeight:number(c.viewHeight,320,1000,560),fitRows:Boolean(c.fitRows),rowHeights:sizes,density:['auto','full','overview'].includes(c.density)?c.density:'auto',mode:['both','rulers','events','overview'].includes(c.mode)?c.mode:'both',category:['all','战争','政治','改革','外交','文化'].includes(c.category)?c.category:'all'};
}
 return Object.freeze({normalize:normalizeCombo});
 };
})(globalThis.Zhou ||= {});
