(function(Zhou){
 'use strict';
 const DENSE='button.ruler,button.event,button.politySegment,button.stateName,button.pinState,button.lifeStart';
 const INTERACTIVE='button,input,select,textarea,a,[contenteditable="true"]';
 const MIN_SCALE=.8,MAX_SCALE=24,TARGET_SIZE=44,DRAG_SLOP=5;
 function rectOf(rect){
  if(!rect)return null;
  const left=Number(rect.left),top=Number(rect.top),right=rect.right==null?left+Number(rect.width):Number(rect.right),bottom=rect.bottom==null?top+Number(rect.height):Number(rect.bottom);
  return [left,top,right,bottom].every(Number.isFinite)&&right>left&&bottom>top?{left,top,right,bottom}:null;
 }
 function intersect(a,b){
  if(!a||!b)return null;
  return rectOf({left:Math.max(a.left,b.left),top:Math.max(a.top,b.top),right:Math.min(a.right,b.right),bottom:Math.min(a.bottom,b.bottom)});
 }
 function contains(rect,x,y){return rect&&x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;}
 function expandRect(rect,size=TARGET_SIZE){
  const r=rectOf(rect);if(!r)return null;
  size=Number.isFinite(size)&&size>=0?size:TARGET_SIZE;
  const dx=Math.max(0,size-(r.right-r.left))/2,dy=Math.max(0,size-(r.bottom-r.top))/2;
  return {left:r.left-dx,top:r.top-dy,right:r.right+dx,bottom:r.bottom+dy};
 }
 // Pure API: items are {rect, hitClip?, disabled?, hidden?, ...}. Return the
 // ORIGINAL items, including all overlapping virtual targets, in stable order.
 // Expansion is minimum 44 x 44, not a changed visual/temporal rectangle.
 function candidates(items,x,y,{size=TARGET_SIZE,clip=null}={}){
  if(!Number.isFinite(x)||!Number.isFinite(y))return [];
  const bounds=clip?rectOf(clip):null;if(clip&&!bounds)return [];
  return Array.from(items||[]).map((item,index)=>{
   if(!item||item.disabled||item.hidden)return null;
   const rect=rectOf(item.rect);if(!rect)return null;
   let hit=expandRect(rect,size);if(bounds)hit=intersect(hit,bounds);
   if(item.hitClip)hit=intersect(hit,rectOf(item.hitClip));
   if(!contains(hit,x,y))return null;
   const dx=Math.max(rect.left-x,0,x-rect.right),dy=Math.max(rect.top-y,0,y-rect.bottom);
   return {item,index,distance:dx*dx+dy*dy,center:(x-(rect.left+rect.right)/2)**2+(y-(rect.top+rect.bottom)/2)**2};
  }).filter(Boolean).sort((a,b)=>a.distance-b.distance||a.center-b.center||a.index-b.index).map(hit=>hit.item);
 }
 function clampScale(scale){return Number.isFinite(scale)?Math.max(MIN_SCALE,Math.min(MAX_SCALE,scale)):MIN_SCALE;}
 function pinchScale(scale,startDistance,distance){return clampScale(startDistance>0&&Number.isFinite(distance)?scale*distance/startDistance:scale);}
 Zhou.TimelineGestureHit={expandRect,candidates,clampScale,pinchScale};

 // No ambient DOM, timer or animation globals: old VM/DOM stubs safely no-op.
 Zhou.createTimelineGestures=function(options={}){
  const {viewport,chart,getScale,onZoom,onCursor,labelWidth}=options||{};
  const doc=viewport&&viewport.ownerDocument,view=doc&&doc.defaultView;
  const noop=()=>{};
  if(!viewport||viewport.nodeType!==1||!chart||chart.nodeType!==1||!doc||typeof doc.createElement!=='function'||!view||typeof view.requestAnimationFrame!=='function'||typeof view.cancelAnimationFrame!=='function'||typeof viewport.addEventListener!=='function'||typeof viewport.removeEventListener!=='function'||typeof chart.querySelectorAll!=='function')return {active:false,destroy:noop,cancel:noop,closeCandidates:noop};
  const raf=view.requestAnimationFrame.bind(view),caf=view.cancelAnimationFrame.bind(view);
  const now=()=>view.performance&&typeof view.performance.now==='function'?view.performance.now():0;
  const safeClosest=(target,selector)=>target&&typeof target.closest==='function'?target.closest(selector):null;
  const inside=(parent,node)=>Boolean(parent&&node&&typeof parent.contains==='function'&&parent.contains(node));
  const prevent=event=>{if(event.cancelable!==false&&typeof event.preventDefault==='function')event.preventDefault();};
  const stop=event=>{prevent(event);if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();else if(typeof event.stopPropagation==='function')event.stopPropagation();};
  const classToggle=(name,value)=>{if(viewport.classList)viewport.classList.toggle(name,value);};
  const listeners=[],pointers=new Map();
  let frame=null,inertiaFrame=null,mode=null,pan=null,pinch=null,cursor=null,multi=false,destroyed=false,suppressUntil=-1,menu=null;
  function listen(node,type,handler,settings){if(node&&typeof node.addEventListener==='function'){node.addEventListener(type,handler,settings);listeners.push(()=>node.removeEventListener(type,handler,settings));}}
  function capture(id){try{if(typeof viewport.setPointerCapture==='function')viewport.setPointerCapture(id);}catch{}}
  function release(id){try{if(typeof viewport.releasePointerCapture==='function')viewport.releasePointerCapture(id);}catch{}}
  function suppress(){suppressUntil=now()+700;}
  function stopInertia(){if(inertiaFrame!==null)caf(inertiaFrame);inertiaFrame=null;}
  function clearFrame(){if(frame!==null)caf(frame);frame=null;}
  function reset(){
   clearFrame();stopInertia();const ids=Array.from(pointers.keys());pointers.clear();mode=null;pan=null;pinch=null;cursor=null;multi=false;
   classToggle('dragging',false);for(const id of ids)release(id);
  }
  function focus(node){try{if(node&&node.isConnected!==false&&typeof node.focus==='function')node.focus({preventScroll:true});}catch{}}
  function closeCandidates(restore=true){
   if(!menu)return;const previous=menu.previous,node=menu.node;menu=null;
   if(typeof node.remove==='function')node.remove();else if(node.parentNode)node.parentNode.removeChild(node);
   if(restore)focus(previous);
  }
  function activate(button){if(button&&button.isConnected!==false&&!button.disabled&&typeof button.click==='function')button.click();}
  function showCandidates(hits,x,y){
   closeCandidates(false);
   const host=doc.body||doc.documentElement;if(!host||typeof host.appendChild!=='function')return;
   const node=doc.createElement('div'),heading=doc.createElement('p'),previous=doc.activeElement;
   node.className='timelineGestureCandidates';node.setAttribute('role','dialog');node.setAttribute('aria-label','选择时间线项目');
   heading.className='timelineGestureCandidatesTitle';heading.textContent='此处有 '+hits.length+' 个项目，请选择';node.appendChild(heading);
   const buttons=[];
   for(const hit of hits){
    const original=hit.button,button=doc.createElement('button');button.type='button';button.className='timelineGestureCandidate';
    button.textContent=original.getAttribute('aria-label')||original.getAttribute('title')||original.textContent||'时间线项目';
    button.addEventListener('click',event=>{stop(event);closeCandidates(false);focus(original);activate(original);});
    node.appendChild(button);buttons.push(button);
   }
   const close=doc.createElement('button');close.type='button';close.className='timelineGestureCandidate timelineGestureCandidateClose';close.textContent='取消（Esc）';
   close.addEventListener('click',event=>{stop(event);closeCandidates();});node.appendChild(close);buttons.push(close);
   node.addEventListener('keydown',event=>{
    if(event.key==='Escape'){stop(event);closeCandidates();return;}
    let next=buttons.indexOf(doc.activeElement);
    if(event.key==='ArrowDown')next=(next+1)%buttons.length;
    else if(event.key==='ArrowUp')next=(next+buttons.length-1)%buttons.length;
    else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;
    stop(event);focus(buttons[next]);
   });
   node.addEventListener('focusout',event=>{if(event.relatedTarget&&!inside(node,event.relatedTarget))closeCandidates(false);});
   menu={node,previous};host.appendChild(node);
   const width=node.getBoundingClientRect().width||300,height=node.getBoundingClientRect().height||0;
   const screenWidth=view.innerWidth||viewport.clientWidth||320,screenHeight=view.innerHeight||viewport.clientHeight||600;
   node.style.left=Math.max(8,Math.min(x,screenWidth-width-8))+'px';node.style.top=Math.max(8,Math.min(y+12,screenHeight-height-8))+'px';focus(buttons[0]);
  }
  function labelSize(){const value=typeof labelWidth==='function'?Number(labelWidth()):0;return Number.isFinite(value)?Math.max(0,value):0;}
  function collect(x,y){
   const bounds=rectOf(viewport.getBoundingClientRect());if(!bounds)return [];
   const items=[];
   for(const button of chart.querySelectorAll(DENSE)){
    if(button.disabled||button.hidden||typeof button.getBoundingClientRect!=='function')continue;
    const rect=rectOf(button.getBoundingClientRect());if(!rect)continue;
    // Sticky labels/axis are occlusion boundaries, not new visual dimensions.
    const track=Boolean(safeClosest(button,'.track'));
    let clip={left:bounds.left+(track?labelSize():0),right:track?bounds.right:Math.min(bounds.right,bounds.left+labelSize()),top:bounds.top+64,bottom:bounds.bottom};
    clip=intersect(clip,bounds);if(!intersect(rect,clip)||!contains(intersect(expandRect(rect),clip),x,y))continue;
    if(typeof view.getComputedStyle==='function'){
     const style=view.getComputedStyle(button);if(style.display==='none'||style.visibility==='hidden'||style.visibility==='collapse')continue;
    }
    // Exclude targets covered by sticky rows or a modal. Probe the nearest real
    // pixel, never the expanded virtual area, so neighbouring hit boxes coexist.
    if(typeof doc.elementFromPoint==='function'){
     const visible=intersect(rect,clip),probeX=Math.max(visible.left+.1,Math.min(x,visible.right-.1)),probeY=Math.max(visible.top+.1,Math.min(y,visible.bottom-.1));
     const top=doc.elementFromPoint(probeX,probeY);if(top&&!inside(button,top))continue;
    }
    items.push({button,rect,hitClip:clip});
   }
   return candidates(items,x,y,{clip:bounds});
  }
  function sample(point,time){
   if(!pan)return;pan.samples.push({x:point.x,y:point.y,time});
   while(pan.samples.length>2&&time-pan.samples[0].time>100)pan.samples.shift();
  }
  function startPan(point,moved=false){
   mode='pan';pan={id:point.id,x:point.x,y:point.y,left:viewport.scrollLeft,top:viewport.scrollTop,moved,touch:point.touch,samples:[]};sample(point,now());
  }
  function startPinch(){
   clearFrame();stopInertia();multi=true;suppress();cursor=null;pan=null;mode='pinch';
   const pair=Array.from(pointers.values()).slice(0,2),a=pair[0],b=pair[1];
   pinch={ids:pair.map(p=>p.id),distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),scale:clampScale(typeof getScale==='function'?getScale():1),x:(a.x+b.x)/2,y:(a.y+b.y)/2};classToggle('dragging',true);
  }
  function applyFrame(){
   frame=null;if(destroyed)return;
   if(mode==='cursor'&&cursor){const point=pointers.get(cursor.id);if(point&&cursor.moved&&typeof onCursor==='function')onCursor(point.x-cursor.offset);}
   else if(mode==='pan'&&pan&&pan.moved){const point=pointers.get(pan.id);if(point){viewport.scrollLeft=Math.max(0,pan.left-(point.x-pan.x));viewport.scrollTop=Math.max(0,pan.top-(point.y-pan.y));}}
   else if(mode==='pinch'&&pinch){
    const a=pointers.get(pinch.ids[0]),b=pointers.get(pinch.ids[1]);if(!a||!b)return;
    const x=(a.x+b.x)/2,y=(a.y+b.y)/2;
    viewport.scrollLeft=Math.max(0,viewport.scrollLeft-(x-pinch.x));viewport.scrollTop=Math.max(0,viewport.scrollTop-(y-pinch.y));pinch.x=x;pinch.y=y;
    const next=pinchScale(pinch.scale,pinch.distance,Math.hypot(a.x-b.x,a.y-b.y));
    if(typeof onZoom==='function')onZoom(next,x);
   }
  }
  function schedule(){if(frame===null)frame=raf(applyFrame);}
  function flush(){if(frame!==null){caf(frame);applyFrame();}}
  function beginInertia(ended){
   if(view.matchMedia?.('(prefers-reduced-motion: reduce)').matches||!ended.touch||!ended.moved||multi||ended.samples.length<2)return;
   const first=ended.samples[0],last=ended.samples.at(-1),dt=last.time-first.time;
   if(dt<=0||now()-last.time>100)return;
   let vx=Math.max(-3,Math.min(3,(first.x-last.x)/dt)),vy=Math.max(-3,Math.min(3,(first.y-last.y)/dt));
   if(Math.hypot(vx,vy)<.05)return;
   let previous=now(),elapsed=0;
   const tick=time=>{
    inertiaFrame=null;if(destroyed||pointers.size)return;
    const step=Math.max(1,Math.min(48,time-previous||16));previous=time;elapsed+=step;
    const left=viewport.scrollLeft,top=viewport.scrollTop;
    viewport.scrollLeft=Math.max(0,left+vx*step);viewport.scrollTop=Math.max(0,top+vy*step);
    if(viewport.scrollLeft===left)vx=0;if(viewport.scrollTop===top)vy=0;
    const decay=Math.pow(.92,step/16);vx*=decay;vy*=decay;
    if(elapsed<1600&&Math.hypot(vx,vy)>.02)inertiaFrame=raf(tick);
   };
   inertiaFrame=raf(tick);
  }
  function pointerdown(event){
   stopInertia();if(!pointers.size)suppressUntil=-1;
   if(event.button!==undefined&&event.button!==0)return;
   if(menu&&inside(menu.node,event.target))return;
   closeCandidates(false);
   const handle=safeClosest(event.target,'.cursorHandle'),dense=safeClosest(event.target,DENSE),interactive=safeClosest(event.target,INTERACTIVE),touch=event.pointerType==='touch';
   if(!inside(chart,event.target)||interactive&&!handle&&(!touch||!dense))return;
   if(!touch&&event.pointerType!=='mouse'&&event.pointerType!=='pen')return;
   if(pointers.size&&!touch)return;
   const point={id:event.pointerId,x:event.clientX,y:event.clientY,touch,target:event.target};
   pointers.set(point.id,point);capture(point.id);
   if(touch||handle)prevent(event);
   if(pointers.size>=2){startPinch();return;}
   multi=false;
   if(handle){const r=rectOf(handle.getBoundingClientRect());mode='cursor';cursor={id:point.id,x:point.x,y:point.y,offset:r?point.x-(r.left+r.right)/2:0,moved:false};}
   else startPan(point);
  }
  function pointermove(event){
   const point=pointers.get(event.pointerId);if(!point)return;
   point.x=event.clientX;point.y=event.clientY;
   if(mode==='cursor'&&cursor){if(Math.abs(point.x-cursor.x)+Math.abs(point.y-cursor.y)>DRAG_SLOP)cursor.moved=true;if(cursor.moved){classToggle('dragging',true);suppress();schedule();}}
   else if(mode==='pan'&&pan){sample(point,now());if(Math.abs(point.x-pan.x)+Math.abs(point.y-pan.y)>DRAG_SLOP)pan.moved=true;if(pan.moved){classToggle('dragging',true);suppress();schedule();}}
   else if(mode==='pinch')schedule();
   if(point.touch||mode==='cursor')prevent(event);
  }
  function pointerup(event){
   const point=pointers.get(event.pointerId);if(!point)return;
   const changed=point.x!==event.clientX||point.y!==event.clientY;point.x=event.clientX;point.y=event.clientY;
   // The final coordinate can arrive without a preceding pointermove (coalesced
   // input / fast release). Never misclassify that displacement as a tap.
   if(mode==='pan'&&pan){sample(point,now());if(Math.abs(point.x-pan.x)+Math.abs(point.y-pan.y)>DRAG_SLOP)pan.moved=true;if(changed&&pan.moved)schedule();}
   else if(mode==='cursor'&&cursor){if(Math.abs(point.x-cursor.x)+Math.abs(point.y-cursor.y)>DRAG_SLOP)cursor.moved=true;if(changed&&cursor.moved)schedule();}
   else if(mode==='pinch'&&changed)schedule();
   flush();
   const ended=pan,wasMode=mode,wasMulti=multi,wasCursor=cursor;
   pointers.delete(point.id);release(point.id);
   if(point.touch||wasMode==='cursor')prevent(event);
   if(pointers.size){
    if(pointers.size>=2)startPinch();else {pinch=null;cursor=null;startPan(Array.from(pointers.values())[0],true);multi=true;}
    suppress();return;
   }
   mode=null;pan=null;pinch=null;cursor=null;classToggle('dragging',false);
   if(wasMulti||wasMode==='pinch'||wasMode==='cursor')suppress();
   else if(ended&&ended.moved){suppress();beginInertia(ended);}
   else if(ended){
    if(point.touch){
     suppress();const hits=collect(point.x,point.y);
     if(hits.length>1)showCandidates(hits,point.x,point.y);else if(hits.length===1)activate(hits[0].button);
     else {const r=viewport.getBoundingClientRect();if(!safeClosest(point.target,INTERACTIVE)&&point.y>r.top+64&&point.x>=r.left+labelSize()&&typeof onCursor==='function')onCursor(point.x);}
    }else if(!safeClosest(point.target,'button')&&point.y>viewport.getBoundingClientRect().top+64&&typeof onCursor==='function')onCursor(point.x);
   }
   // A handle tap only focuses the handle; it never jumps the reference year.
   if(wasMode==='cursor'&&wasCursor&&!wasCursor.moved)focus(safeClosest(point.target,'.cursorHandle'));
   multi=false;
  }
  function pointercancel(event){if(event.type==='pointercancel')stopInertia();if(pointers.has(event.pointerId)){suppress();reset();}}
  listen(viewport,'pointerdown',pointerdown,{passive:false});listen(viewport,'pointermove',pointermove,{passive:false});
  listen(viewport,'pointerup',pointerup,{passive:false});listen(viewport,'pointercancel',pointercancel);listen(viewport,'lostpointercapture',pointercancel);
  // Guard at document capture: a touch action may open a dialog or rerender the
  // chart before its compatibility click arrives. A fresh press clears the guard;
  // keyboard/programmatic button.click() (detail=0) always reaches original UI.
  listen(doc,'click',event=>{if(event.detail!==0&&now()<=suppressUntil)stop(event);},true);
  listen(doc,'pointerdown',event=>{if(!pointers.size)suppressUntil=-1;if(menu&&!inside(menu.node,event.target))closeCandidates(false);},true);
  listen(view,'blur',()=>{reset();closeCandidates(false);});
  listen(doc,'visibilitychange',()=>{if(doc.hidden){reset();closeCandidates(false);}});
  classToggle('timelineGestureCanvas',true);
  return {active:true,closeCandidates,cancel(){suppress();reset();closeCandidates();},destroy(){if(destroyed)return;destroyed=true;reset();closeCandidates(false);for(const remove of listeners)remove();classToggle('timelineGestureCanvas',false);}};
 };
})(globalThis.Zhou ||= {});
