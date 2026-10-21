(function(Zhou){
 'use strict';
 const snaps=Object.freeze([35,60,90]);
 const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
 const normalizeSnap=value=>snaps.includes(value)?value:60;
 function heightFor(snap,viewportHeight){return normalizeSnap(snap)*Math.max(0,finite(viewportHeight))/100;}
 function nearestSnap(height,viewportHeight){
  if(!(viewportHeight>0)||!Number.isFinite(height))return 60;
  return snaps.reduce((best,snap)=>Math.abs(height-heightFor(snap,viewportHeight))<Math.abs(height-heightFor(best,viewportHeight))?snap:best,35);
 }
 // Downward deltas/velocities are positive. A fast fling only dismisses from
 // the lowest stop; from taller stops the user must actually drag below it.
 function decideDrag({snap=60,deltaY=0,viewportHeight=0,velocityY=0}={}){
  snap=normalizeSnap(snap);deltaY=finite(deltaY);velocityY=finite(velocityY);
  if(!(viewportHeight>0)||!Number.isFinite(viewportHeight)||Math.abs(deltaY)<8)return {snap,dismiss:false};
  const height=heightFor(snap,viewportHeight)-deltaY;
  const threshold=Math.max(64,viewportHeight*.12);
  if(deltaY>0&&(height<=heightFor(35,viewportHeight)-threshold||(snap===35&&deltaY>24&&velocityY>.65)))return {snap:35,dismiss:true};
  return {snap:nearestSnap(height-Math.max(-1.5,Math.min(1.5,velocityY))*120,viewportHeight),dismiss:false};
 }
 Zhou.DetailSheet=Object.freeze({snaps,heightFor,nearestSnap,decideDrag});
 Zhou.createDetailSheet=function({dialog,body,onDismiss,window:win,document:doc}={}){
  let snap=60,destroyed=false,drag=null;
  const disposers=[];
  const supported=Boolean(dialog?.nodeType===1&&body?.nodeType===1&&dialog.contains?.(body)&&typeof dialog.insertBefore==='function'&&typeof doc?.createElement==='function'&&typeof win?.addEventListener==='function'&&typeof dialog.style?.setProperty==='function');
  const getState=()=>({supported,destroyed,snap,mobile:supported&&isMobile(),open:Boolean(dialog?.open),dragging:Boolean(drag)});
  if(!supported)return {sync(){},destroy(){destroyed=true;},setSnap(){},getState};
  const media=win.matchMedia?.('(max-width: 767px)');
  function isMobile(){return typeof win.innerWidth==='number'?win.innerWidth<768:Boolean(media?.matches);}
  const controls=doc.createElement('div'),handle=doc.createElement('div');
  controls.className='detailSheetControls';
  controls.setAttribute('role','group');controls.setAttribute('aria-label','详情高度');
  handle.className='detailSheetHandle';handle.tabIndex=0;
  handle.setAttribute('role','slider');handle.setAttribute('aria-label','调整详情高度；上下拖动，向下拖到底部关闭');
  handle.setAttribute('aria-orientation','vertical');handle.setAttribute('aria-valuemin','35');handle.setAttribute('aria-valuemax','90');
  const grip=doc.createElement('span');grip.setAttribute('aria-hidden','true');handle.appendChild(grip);controls.appendChild(handle);
  const labels={35:'简览',60:'阅读',90:'展开'};
  const buttons=snaps.map(value=>{
   const button=doc.createElement('button');button.type='button';button.className='detailSheetSnap';button.textContent=value+'%';
   button.setAttribute('aria-label',labels[value]+'：详情高度 '+value+'%');
   listen(button,'click',()=>setSnap(value));controls.appendChild(button);return button;
  });
  dialog.insertBefore(controls,dialog.firstChild);
  dialog.classList.add('hasDetailSheet');
  function listen(target,type,listener,options){
   target.addEventListener(type,listener,options);disposers.push(()=>target.removeEventListener(type,listener,options));
  }
  function height(){return Math.max(1,finite(win.innerHeight,doc.documentElement?.clientHeight||1));}
  function update(){
   // CSS, not JS, changes layout at the breakpoint. In particular, neither
   // sync nor dragging rewrites dialog/body scrollTop or the existing header.
   dialog.style.setProperty('--detail-sheet-height',snap+'dvh');
   dialog.style.setProperty('--detail-sheet-height-fallback',snap+'vh');
   handle.setAttribute('aria-valuenow',String(snap));handle.setAttribute('aria-valuetext',labels[snap]+'，'+snap+'%');
   buttons.forEach((button,index)=>button.setAttribute('aria-pressed',String(snaps[index]===snap)));
  }
  function release(){
   const previous=drag;drag=null;
   dialog.classList.remove('isSheetDragging');dialog.style.removeProperty('--detail-sheet-drag-height');
   if(previous){try{handle.releasePointerCapture?.(previous.id);}catch{/* Capture may already have been lost. */}}
  }
  function setSnap(value){if(destroyed)return;release();snap=normalizeSnap(value);update();}
  function sync(){
   if(destroyed)return;
   release();
   if(!dialog.open)snap=60;
   const mobile=isMobile();controls.hidden=!mobile;
   // Never steal focus on show/back; only rescue focus from newly hidden UI.
   if(!mobile&&controls.contains(doc.activeElement)&&dialog.open)dialog.querySelector?.('#detailBack')?.focus?.({preventScroll:true});
   update();
  }
  function pointerDown(event){
   if(destroyed||!isMobile()||!dialog.open||drag||event.isPrimary===false||(event.button!==undefined&&event.button!==0)||!Number.isFinite(event.clientY))return;
   drag={id:event.pointerId,startY:event.clientY,lastY:event.clientY,lastTime:finite(event.timeStamp),velocity:0,height:height(),snap};
   try{handle.setPointerCapture?.(event.pointerId);}catch{/* Pointer events without capture still support the buttons. */}
   dialog.classList.add('isSheetDragging');event.preventDefault();
  }
  function pointerMove(event){
   if(!drag||event.pointerId!==drag.id||!Number.isFinite(event.clientY))return;
   const time=finite(event.timeStamp,drag.lastTime),elapsed=time-drag.lastTime;
   if(elapsed>0)drag.velocity=(event.clientY-drag.lastY)/elapsed;
   drag.lastY=event.clientY;drag.lastTime=time;
   const pixels=Math.max(80,Math.min(heightFor(90,drag.height),heightFor(drag.snap,drag.height)-(event.clientY-drag.startY)));
   dialog.style.setProperty('--detail-sheet-drag-height',pixels+'px');event.preventDefault();
  }
  function pointerUp(event){
   if(!drag||event.pointerId!==drag.id)return;
   const deltaY=finite(event.clientY,drag.lastY)-drag.startY;
   const velocityY=finite(event.timeStamp)-drag.lastTime>100?0:drag.velocity;
   const result=decideDrag({snap:drag.snap,deltaY,viewportHeight:drag.height,velocityY});release();
   if(result.dismiss&&typeof onDismiss==='function')onDismiss();else setSnap(result.snap);
  }
  function pointerCancel(event){if(drag&&event.pointerId===drag.id)release();}
  listen(handle,'pointerdown',pointerDown);listen(handle,'pointermove',pointerMove);listen(handle,'pointerup',pointerUp);
  listen(handle,'pointercancel',pointerCancel);listen(handle,'lostpointercapture',pointerCancel);
  listen(handle,'keydown',event=>{
   if(!isMobile()||!dialog.open)return;
   const index=snaps.indexOf(snap);
   const value=event.key==='ArrowUp'||event.key==='ArrowRight'?snaps[Math.min(2,index+1)]:event.key==='ArrowDown'||event.key==='ArrowLeft'?snaps[Math.max(0,index-1)]:event.key==='Home'?35:event.key==='End'?90:null;
   // Escape deliberately bubbles to the dialog's existing cancel/back handler.
   if(value!==null){event.preventDefault();setSnap(value);}
  });
  listen(win,'resize',sync);listen(win,'blur',release);
  if(win.visualViewport?.addEventListener)listen(win.visualViewport,'resize',sync);
  if(media?.addEventListener)listen(media,'change',sync);
  listen(dialog,'close',sync);
  sync();
  function destroy(){
   if(destroyed)return;
   release();destroyed=true;disposers.splice(0).forEach(dispose=>dispose());
   if(controls.contains(doc.activeElement)&&dialog.open)dialog.querySelector?.('#detailBack')?.focus?.({preventScroll:true});
   controls.parentNode?.removeChild(controls);dialog.classList.remove('hasDetailSheet');
   dialog.style.removeProperty('--detail-sheet-height');dialog.style.removeProperty('--detail-sheet-height-fallback');
  }
  return {sync,destroy,setSnap,getState};
 };
})(globalThis.Zhou ||= {});
