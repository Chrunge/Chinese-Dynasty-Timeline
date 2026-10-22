(function(root){
 'use strict';
 const Zhou=root.Zhou||(root.Zhou={}),key='zhou-ui-v1',version=1;
 Zhou.createInterfacePreferences=function(storage){
  const raw=storage.read(key,{}),saved=raw&&typeof raw==='object'?raw:{};
  const value={advanced:saved.advanced===true,onboardingVersion:Number.isSafeInteger(saved.onboardingVersion)?saved.onboardingVersion:0};
  return {value,save(){return storage.write(key,{...value});},shouldGuide(){return value.onboardingVersion<version;},complete(){value.onboardingVersion=version;return this.save();}};
 };
 Zhou.createInterfaceExperience=function({document:doc,window:win,storage,datasetId='zhou',onCanvasBlank,onSettingsOpen}){
  if(!doc?.documentElement?.contains)return {active:false,setAdvanced(){},closeAdvanced(){},destroy(){}};
  const $=s=>doc.querySelector(s),preferences=Zhou.createInterfacePreferences(storage),listeners=[];
  const listen=(node,type,fn,options)=>{node?.addEventListener(type,fn,options);listeners.push(()=>node?.removeEventListener(type,fn,options));};
  const toggle=$('#advancedToggle'),panel=$('#advancedSettings'),guide=$('#onboarding'),status=$('#uiStatus');
  const notice=ok=>{if(status)status.textContent=ok?'':'浏览器未允许保存界面偏好；本次操作仍然可用。';};
  function advanced(open,persist=true){
   if(!panel||!toggle)return;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('active',open);
   const arrow=$('#settingsChevron');if(arrow)arrow.textContent=open?'▴':'▾';
   if(persist){preferences.value.advanced=open;notice(preferences.save());if(open)onSettingsOpen?.();}
  }
  function closeAdvanced(focus=false){if(panel&&!panel.hidden){advanced(false);if(focus)toggle?.focus({preventScroll:true});}}
  advanced(preferences.value.advanced,false);listen(toggle,'click',()=>advanced(panel.hidden));
  listen(doc,'keydown',e=>{
   if(e.key==='Escape'&&!e.defaultPrevented&&!doc.querySelector('dialog[open]')&&!doc.querySelector('.timelineGestureCandidates')&&(!guide||guide.hidden)&&panel&&!panel.hidden){closeAdvanced(true);e.preventDefault();}
  });
  let start=null,dragged=false,lastDrag=-Infinity;
  listen($('#viewport'),'pointerdown',e=>{start={x:e.clientX,y:e.clientY};dragged=false;},{passive:true});
  listen($('#viewport'),'pointermove',e=>{if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>6)dragged=true;},{passive:true});
  listen(doc,'pointerup',()=>{if(dragged)lastDrag=Date.now();start=null;},{passive:true});
  listen(doc,'pointercancel',()=>{lastDrag=Date.now();start=null;},{passive:true});
  listen($('#viewport'),'click',e=>{
   if(e.defaultPrevented||Date.now()-lastDrag<350||doc.querySelector('dialog[open]'))return;
   if(e.target.closest?.('button,a,input,select,textarea,summary,.stateLabel,.timelineGestureCandidates'))return;
   closeAdvanced(false);onCanvasBlank?.();
  });
  const links=[...doc.querySelectorAll('[data-topic]')],current=links.findIndex(a=>a.dataset.topic===datasetId);
  for(const [id,index] of [['previousTopic',current-1],['nextTopic',current+1]]){const a=$('#'+id),target=current>=0?links[index]:null;if(!a)continue;if(target){a.href=target.getAttribute('href');a.setAttribute('aria-label',(id==='previousTopic'?'上一时期：':'下一时期：')+target.textContent);a.title=(id==='previousTopic'?'上一时期：':'下一时期：')+target.textContent;a.removeAttribute('aria-disabled');a.removeAttribute('tabindex');}else{a.removeAttribute('href');a.setAttribute('aria-disabled','true');a.tabIndex=-1;}}
  const nav=$('.topicNav');
  if(current>=0){const item=links[current];item.setAttribute('aria-current','page');item.scrollIntoView({inline:'center',block:'nearest',behavior:'instant'});}
  listen(nav,'keydown',e=>{const index=links.indexOf(doc.activeElement);if(index<0)return;let next;if(e.key==='ArrowRight')next=Math.min(links.length-1,index+1);else if(e.key==='ArrowLeft')next=Math.max(0,index-1);else if(e.key==='Home')next=0;else if(e.key==='End')next=links.length-1;else return;e.preventDefault();links[next].focus({preventScroll:true});links[next].scrollIntoView({block:'nearest',inline:'nearest'});});
  const steps=[
   {target:'.zooms',title:'1 / 3 · 拖动与缩放时间轴',text:'用＋、−调整时间跨度，用“全景”查看整个专题。触屏可单指拖动、双指缩放；鼠标可拖动空白画布。'},
   {target:'#viewport',title:'2 / 3 · 点击条带阅读史源',text:'点击君主或事件阅读详情，也可从“重点人物”进入本专题画廊。空白表示尚未收录，不代表没有历史。'},
   {target:'.cursorHandle',title:'3 / 3 · 移动同年参考线',text:'拖动金色年份手柄，或点击工具栏年份输入定位。键盘左右键逐年调整；更多工具统一收纳在“视图设置”。'}
  ];let step=0,highlight=null;
  function clear(){if(highlight){highlight.classList.remove('onboardingTarget');highlight.removeAttribute('aria-describedby');highlight=null;}}
  function draw(){if(!guide)return;clear();const item=steps[step];guide.hidden=false;$('#onboardingStep').textContent='首次使用引导 · 可随时跳过';$('#onboardingTitle').textContent=item.title;$('#onboardingText').textContent=item.text;$('#onboardingNext').textContent=step===2?'完成':'下一步';highlight=$(item.target);highlight?.classList.add('onboardingTarget');highlight?.setAttribute('aria-describedby','onboardingText');}
  function finish(){clear();if(guide)guide.hidden=true;notice(preferences.complete());toggle?.focus({preventScroll:true});}
  listen(guide,'keydown',e=>{if(e.key==='Escape'){e.preventDefault();finish();}});
  listen(doc,'keydown',e=>{if(e.key==='Escape'&&guide&&!guide.hidden&&!doc.querySelector('dialog[open]')&&!doc.querySelector('.timelineGestureCandidates')){e.preventDefault();finish();}});
  listen($('#onboardingSkip'),'click',finish);listen($('#onboardingNext'),'click',()=>{if(step<2){step++;draw();}else finish();});
  listen($('#replayOnboarding'),'click',()=>{step=0;draw();$('#onboardingNext')?.focus({preventScroll:true});});
  if(preferences.shouldGuide())draw();
  return {active:true,preferences,setAdvanced:advanced,closeAdvanced,destroy(){clear();listeners.forEach(remove=>remove());}};
 };
})(globalThis);
