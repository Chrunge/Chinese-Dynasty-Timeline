(function(Zhou){
 'use strict';
 Zhou.createCombinationModel=function(D){
function normalizeCombo(c){
 if(!c||typeof c!=='object'||typeof c.name!=='string'||!c.name.trim()||!Array.isArray(c.states))return null;
 const validId=id=>typeof id==='string'&&D.states.some(s=>s.id===id);
 const states=[...new Set(c.states.filter(validId))];if(!states.length)return null;
 const number=(v,low,high,fallback)=>Number.isFinite(Number(v))?Math.max(low,Math.min(high,Number(v))):fallback;
 const order=[...new Set((Array.isArray(c.order)?c.order:states).filter(validId)),...D.states.map(s=>s.id)].filter((id,i,a)=>a.indexOf(id)===i);
 const from=Math.round(number(c.from,221,1046,1046)),to=Math.round(number(c.to,221,1046,256));if(from<to)return null;
 const sizes={};for(const id of states){const h=c.rowHeights?.[id];if([40,56,64,96,128,160].includes(h))sizes[id]=h;}
 return {id:typeof c.id==='string'&&/^saved-[\w-]{1,90}$/.test(c.id)?c.id:'saved-'+Date.now()+'-'+Math.random().toString(36).slice(2,9),name:c.name.trim().slice(0,40),states,order,pins:Array.isArray(c.pins)?[...new Set(c.pins.filter(id=>states.includes(id)))]:[],from,to,end:c.end===221||to<256?221:256,cursor:Math.round(number(c.cursor,221,1046,from)),rowHeight:number(c.rowHeight,36,160,64),viewHeight:number(c.viewHeight,320,1000,560),fitRows:Boolean(c.fitRows),rowHeights:sizes,density:['auto','full','overview'].includes(c.density)?c.density:'auto',mode:['both','rulers','events','overview'].includes(c.mode)?c.mode:'both',category:['all','战争','政治','改革','外交','文化'].includes(c.category)?c.category:'all'};
}
 return Object.freeze({normalize:normalizeCombo});
 };
})(globalThis.Zhou ||= {});
