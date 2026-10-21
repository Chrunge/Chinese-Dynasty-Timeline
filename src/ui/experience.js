(function(root){
 'use strict';
 const Zhou=root.Zhou||(root.Zhou={}),key='zhou-ui-v1',version=1;
 Zhou.createInterfacePreferences=function(storage){
  const raw=storage.read(key,{}),saved=raw&&typeof raw==='object'?raw:{};
  const value={advanced:saved.advanced===true,onboardingVersion:Number.isSafeInteger(saved.onboardingVersion)?saved.onboardingVersion:0};
  return {value,save(){return storage.write(key,{...value});},shouldGuide(){return value.onboardingVersion<version;},complete(){value.onboardingVersion=version;return this.save();}};
 };
 Zhou.createInterfaceExperience=function({document:doc,window:win,storage,datasetId='zhou'}){
  if(!doc?.documentElement?.contains)return {active:false,destroy(){}};
  const $=s=>doc.querySelector(s),preferences=Zhou.createInterfacePreferences(storage),listeners=[];
  const listen=(node,type,fn)=>{node?.addEventListener(type,fn);listeners.push(()=>node?.removeEventListener(type,fn));};
  const toggle=$('#advancedToggle'),panel=$('#advancedSettings'),guide=$('#onboarding'),status=$('#uiStatus');
  const notice=ok=>{if(status)status.textContent=ok?'':'浏览器未允许保存界面偏好；本次操作仍然可用。';};
  function advanced(open,persist=true){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(persist){preferences.value.advanced=open;notice(preferences.save());if(open&&typeof win.CustomEvent==='function')panel.dispatchEvent(new win.CustomEvent('zhou:panelopen',{bubbles:true}));}}
   listen($('#advancedClose'),'click',()=>{advanced(false);toggle.focus({preventScroll:true});});
  advanced(preferences.value.advanced,false);listen(toggle,'click',()=>advanced(panel.hidden));
  listen(panel,'keydown',e=>{if(e.key==='Escape'&&!$('#detail')?.open){advanced(false);toggle.focus({preventScroll:true});e.preventDefault();}});
  const links=[...doc.querySelectorAll('[data-topic]')],current=links.findIndex(a=>a.dataset.topic===datasetId);
  for(const [id,index] of [['previousTopic',current-1],['nextTopic',current+1]]){const a=$('#'+id),target=current>=0?links[index]:null;if(target){a.href=target.getAttribute('href');a.setAttribute('aria-label',(id==='previousTopic'?'上一时期：':'下一时期：')+target.textContent);a.removeAttribute('aria-disabled');}else{a.removeAttribute('href');a.setAttribute('aria-disabled','true');a.tabIndex=-1;}}
  const nav=$('.topicNav');
  if(current>=0){const item=links[current];item.setAttribute('aria-current','page');item.scrollIntoView({inline:'center',block:'nearest',behavior:'instant'});}
  listen(nav,'keydown',e=>{const index=links.indexOf(doc.activeElement);if(index<0)return;let next;if(e.key==='ArrowRight')next=Math.min(links.length-1,index+1);else if(e.key==='ArrowLeft')next=Math.max(0,index-1);else if(e.key==='Home')next=0;else if(e.key==='End')next=links.length-1;else return;e.preventDefault();links[next].focus({preventScroll:true});links[next].scrollIntoView({block:'nearest',inline:'nearest'});});
  const steps=[
   {target:'.zooms',title:'1 / 3 · 拖动与缩放时间轴',text:'用＋、−或重置调整时间跨度。触屏可单指惯性拖动、双指捏合缩放；鼠标可拖动空白画布。'},
   {target:'#viewport',title:'2 / 3 · 点击条带阅读史源',text:'点击君主或事件条带，再从详情打开人物档案与来源。触屏密集处先选择项目；手机详情有三档高度。空白表示尚未收录，不代表没有历史。'},
   {target:'.cursorHandle',title:'3 / 3 · 拖动金色同年参考线',text:'拖动金色年份手柄，查看同一年的列国对照；键盘左右键可逐年调整，也可直接输入年份定位。更多工具在“高级 / 视图设置”；帮助中可重看引导。'}
  ];let step=0,highlight=null;
  function clear(){if(highlight){highlight.classList.remove('onboardingTarget');highlight.removeAttribute('aria-describedby');highlight=null;}}
  function draw(){clear();const item=steps[step];guide.hidden=false;$('#onboardingStep').textContent='首次使用引导 · 可随时跳过';$('#onboardingTitle').textContent=item.title;$('#onboardingText').textContent=item.text;$('#onboardingNext').textContent=step===2?'完成':'下一步';highlight=$(item.target);highlight?.classList.add('onboardingTarget');highlight?.setAttribute('aria-describedby','onboardingText');}
  function finish(){clear();guide.hidden=true;notice(preferences.complete());toggle.focus({preventScroll:true});}
  listen(guide,'keydown',e=>{if(e.key==='Escape'){e.preventDefault();finish();}});
  listen(doc,'keydown',e=>{if(e.key==='Escape'&&!guide.hidden&&!doc.querySelector('dialog[open]')&&!doc.querySelector('.timelineGestureCandidates')){e.preventDefault();finish();}});
  listen($('#onboardingSkip'),'click',finish);listen($('#onboardingNext'),'click',()=>{if(step<2){step++;draw();}else finish();});
  listen($('#replayOnboarding'),'click',()=>{step=0;draw();$('#onboardingNext').focus({preventScroll:true});});
  if(preferences.shouldGuide())draw();
  return {active:true,preferences,destroy(){clear();listeners.forEach(remove=>remove());}};
 };
})(globalThis);
