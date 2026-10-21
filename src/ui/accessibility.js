(function(root){
 'use strict';
 const Zhou=root.Zhou||(root.Zhou={});
 const linear=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);};
 function luminance(rgb){return .2126*linear(rgb[0])+.7152*linear(rgb[1])+.0722*linear(rgb[2]);}
 function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 function parseColor(value){const match=String(value).match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);return match?[+match[1],+match[2],+match[3],match[4]===undefined?1:+match[4]]:null;}
 function composite(foreground,background){const alpha=foreground[3]??1;return foreground.slice(0,3).map((v,i)=>v*alpha+background[i]*(1-alpha));}
 Zhou.Accessibility=Object.freeze({contrast,luminance,parseColor,composite});
 Zhou.createAccessibility=function({document:doc,window:win}={}){
  if(!doc?.documentElement?.contains||!win?.getComputedStyle)return {cursorChanged(){},refresh(){},destroy(){}};
  const $=s=>doc.querySelector(s),listeners=[],status=$('#accessibilityStatus');let timer=null,lastKeyboard=0,lastMessage='',stopped=false,paintQueued=false;
  function listen(node,type,fn,options){node?.addEventListener(type,fn,options);listeners.push(()=>node?.removeEventListener(type,fn,options));}
  function announce(message){if(!status||message===lastMessage)return;win.clearTimeout(timer);timer=win.setTimeout(()=>{status.textContent=message;lastMessage=message;},220);}
  const focusable=container=>[...container.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex]')].filter(el=>!el.disabled&&el.tabIndex>=0&&!el.closest('[hidden],[inert]')&&el.getClientRects().length);
  function boundary(){const active=doc.activeElement,dialog=active?.closest('dialog[open]');if(dialog)return dialog;const dialogs=[...doc.querySelectorAll('dialog[open]')];if(dialogs.length)return dialogs[dialogs.length-1];const panel=$('#advancedSettings');return panel&&!panel.hidden&&panel.contains(active)?panel:null;}
  listen(doc,'keydown',event=>{
   lastKeyboard=Date.now();
   if(event.key!=='Tab')return;
   const container=boundary();if(!container)return;
   const items=focusable(container);if(!items.length){event.preventDefault();container.tabIndex=-1;container.focus();return;}
   const index=items.indexOf(doc.activeElement);
   if(event.shiftKey&&(index===0||!container.contains(doc.activeElement))){event.preventDefault();items.at(-1).focus();}
   else if(!event.shiftKey&&(!container.contains(doc.activeElement)||index===items.length-1)){event.preventDefault();items[0].focus();}
  },true);
  listen($('#advancedSettings'),'zhou:panelopen',()=>focusable($('#advancedSettings'))[0]?.focus({preventScroll:true}));
  // Native dialogs own their Escape behavior (detail preserves its back stack).
  // This module only wraps Tab, including nested export/share/filter dialogs.
  function cursorChanged(year){if(Date.now()-lastKeyboard<600)announce('参考年份：'+Zhou.Time.format(year)+'。可展开同年天下速览。');}
  function background(el){let color=[255,255,255],layers=[];for(let node=el;node&&node.nodeType===1;node=node.parentElement){const rgb=parseColor(win.getComputedStyle(node).backgroundColor);if(rgb)layers.push(rgb);}for(const layer of layers.reverse())color=composite(layer,color);return color;}
  function paint(){paintQueued=false;if(stopped)return;
   // Preserve every polity/event hue. Only choose an AA foreground for actual
   // rendered colored labels; changes never enter history data or exports.
   doc.querySelectorAll('.era,.ruler,.politySegment,.comparecard h4,.stateName,.orderRow strong,.event').forEach(el=>{
    if(!el.getClientRects().length)return;
    const bg=background(el),black=[0,0,0],white=[255,255,255],color=contrast(black,bg)>=contrast(white,bg)?'#000000':'#ffffff';
    if(el.style.getPropertyValue('--accessible-ink')!==color)el.style.setProperty('--accessible-ink',color);
   });
  }
  function refresh(){if(!paintQueued&&!stopped){paintQueued=true;win.requestAnimationFrame(paint);}}
  const observer=new win.MutationObserver(records=>{if(records.some(r=>r.type==='childList'||['class','open','hidden'].includes(r.attributeName)))refresh();const tag=$('#detailTag');if(tag&&$('#detail')?.open&&records.some(r=>r.target===tag||tag.contains(r.target)))announce('已打开：'+tag.textContent);});
  observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','open','hidden']});
  listen(win,'resize',refresh);refresh();
  return {cursorChanged,refresh,announce,destroy(){stopped=true;observer.disconnect();win.clearTimeout(timer);listeners.forEach(fn=>fn());}};
 };
})(globalThis);
