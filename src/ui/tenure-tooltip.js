(function(Zhou){
 'use strict';
 // One out-of-flow tooltip, outside clipped tracks. Native title remains a
 // fallback; focus and pointer use exactly the same unchanged tenure text.
 Zhou.createTenureTooltip=function(chart){
  const doc=chart?.ownerDocument,view=doc?.defaultView;
  if(chart?.nodeType!==1||!doc?.body||!view)return {destroy(){}};
  let target=null,node=null,description=null;const listeners=[];
  function close(){if(target){if(description)target.setAttribute('aria-describedby',description);else target.removeAttribute('aria-describedby');}node?.remove();node=null;target=null;}
  function position(){
   if(!target||!node)return;
   const rect=target.getBoundingClientRect(),width=Math.min(300,view.innerWidth-16);node.style.maxWidth=width+'px';node.style.left=Math.max(8,Math.min(view.innerWidth-width-8,rect.left))+'px';const height=node.getBoundingClientRect().height;node.style.top=Math.max(8,Math.min(view.innerHeight-height-8,rect.bottom+6))+'px';
  }
  function open(element){
   if(element===target)return;close();if(!element)return;
   target=element;description=target.getAttribute('aria-describedby');node=doc.createElement('div');node.id='tenure-slot-tooltip';node.className='tenureSlotTooltip';node.setAttribute('role','tooltip');node.textContent=target.title;doc.body.appendChild(node);target.setAttribute('aria-describedby',[description,node.id].filter(Boolean).join(' '));position();
  }
  const slot=element=>element?.closest?.('button.subyearSlot');
  const listen=(element,type,handler,options)=>{element.addEventListener(type,handler,options);listeners.push(()=>element.removeEventListener(type,handler,options));};
  listen(chart,'pointerover',event=>open(slot(event.target)));
  listen(chart,'focusin',event=>open(slot(event.target)));
  listen(chart,'pointerout',event=>{if(slot(event.target)&&!slot(event.relatedTarget)&&doc.activeElement!==target)close();});
  listen(chart,'focusout',event=>{if(slot(event.target)&&!slot(event.relatedTarget))close();});
  listen(doc,'pointerdown',close,true);listen(doc,'keydown',event=>{if(event.key==='Escape')close();});listen(view,'resize',close);// Native focus scrolls after focusin: retain and reposition the keyboard
  // description instead of immediately removing its aria-describedby target.
  listen(doc,'scroll',()=>{if(target&&(doc.activeElement===target||target.matches?.(':hover')))position();else close();},true);
  return {destroy(){close();listeners.forEach(remove=>remove());}};
 };
 if(typeof document!=='undefined')Zhou.createTenureTooltip(document.querySelector('#chart'));
})(globalThis.Zhou ||= {});
