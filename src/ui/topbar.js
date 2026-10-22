(function(Zhou){
 'use strict';
 Zhou.createTopbar=function(b){
  const {document:doc,window:win,data,state,viewport,bounds}=b,$=b.$,listeners=[];
  const listen=(node,type,fn,options)=>{if(node===doc&&!doc?.documentElement?.contains)return;node?.addEventListener?.(type,fn,options);listeners.push(()=>node?.removeEventListener?.(type,fn,options));};
  const model=Zhou.createFiguresModel?.(data),editor=$('#yearEditor'),yearToggle=$('#yearToggle');
  let keyboardIndex=-1,theme='system';
  function refresh(){
   const h=state.session.figureHighlight,tag=$('#figureHighlight'),label=$('#figureHighlightText');
   if(tag)tag.hidden=!h;
   if(label)label.textContent=h?'高亮：'+h.label+(h.kind==='category'?' ('+h.entities.personIds.size+'人)':''):'';
   $('#clearFigureHighlight')?.setAttribute?.('aria-label',h?'清除高亮：'+h.label:'清除人物高亮');
   if($('#figuresCount'))$('#figuresCount').textContent=String(model?.count||0);
   const choices=[...doc.querySelectorAll('#searchResults .searchResult')];
   choices.forEach((node,i)=>{node.id='search-option-'+i;node.setAttribute?.('role','option');node.setAttribute?.('aria-selected',String(i===keyboardIndex));node.classList.toggle('keyboardChosen',i===keyboardIndex);});
   const search=$('#search');search?.setAttribute?.('aria-expanded',String(Boolean(state.search.query&&choices.length)));
   if(keyboardIndex>=0&&choices[keyboardIndex])search?.setAttribute?.('aria-activedescendant',choices[keyboardIndex].id);else search?.removeAttribute?.('aria-activedescendant');
  }
  function closeYear(focus=false){if(editor)editor.hidden=true;yearToggle?.setAttribute?.('aria-expanded','false');if(focus)yearToggle?.focus?.({preventScroll:true});}
  function openYear(){
   b.interfaceExperience?.closeAdvanced(false);gallery?.close();
   const date=Zhou.Time.decode(state.conditions.cursor);if(!date)return;
   $('#yearEra').value=date.era;$('#year').value=date.year;if(editor)editor.hidden=false;yearToggle?.setAttribute?.('aria-expanded','true');$('#year')?.focus?.({preventScroll:true});$('#year')?.select?.();
  }
  function clearHighlight(){state.session.figureHighlight=null;state.session.activePersonId=null;state.conditions.motif='none';b.render();}
  function stages(person){
   return Zhou.PersonActivities.narrative(person).filter(r=>Zhou.Time.isYear(r.year)&&r.year<=bounds.start&&r.year>=bounds.end&&data.states.some(s=>s.id===r.stateId)).sort((a,c)=>a.sequence-c.sequence);
  }
  function reveal(entities){for(const id of entities.stateIds)state.conditions.selected.add(id);state.search.query='';if($('#search'))$('#search').value='';state.search.searchTarget=null;state.session.activeEventId=null;}
  function openPerson(id){
   const p=model?.person(id);if(!p)return false;
   const entities=model.entitiesForPerson(id);state.session.figureHighlight={kind:'person',id,label:p.name,entities};state.session.activePersonId=id;state.conditions.motif='none';reveal(entities);
   const first=stages(p)[0];
   if(first&&first.year<state.conditions.end){state.conditions.end=bounds.end;b.syncControls?.();}
   state.layout.mode='both';if($('#mode'))$('#mode').value='both';if(state.layout.density==='overview')state.layout.density='auto';
   state.layout.px=Math.max(6,state.layout.px);b.render();
   if(first){b.setCursor(first.year,true);b.scrollToState(first.stateId);}else{const id=[...entities.stateIds][0];if(id)b.scrollToState(id);}
   b.showPerson(p.id);refresh();return true;
  }
  function highlightCategory(key,info={}){
   const entities=model?.entitiesForCategory(key,{coreOnly:Boolean(info.coreOnly)});if(!entities?.active||!entities.personIds.size)return false;
   const group=model.groups({coreOnly:Boolean(info.coreOnly)}).find(g=>g.key===key);
   state.session.figureHighlight={kind:'category',id:key,label:info.label||group?.name||key,entities};state.session.activePersonId=null;state.conditions.motif='none';reveal(entities);b.render();refresh();return true;
  }
  const gallery=Zhou.createFiguresGallery?.({data,model,container:$('#figuresGallery'),trigger:$('#figuresToggle'),document:doc,onPerson:openPerson,onCategory:highlightCategory,onClear:clearHighlight});
  listen($('#figuresToggle'),'click',()=>{b.interfaceExperience?.closeAdvanced(false);closeYear();});
  listen(yearToggle,'click',()=>{if(editor?.hidden)openYear();else closeYear();});
  listen($('#previousYear'),'click',()=>{closeYear();b.setCursor(state.conditions.cursor+1,true);});
  listen($('#nextYear'),'click',()=>{closeYear();b.setCursor(state.conditions.cursor-1,true);});
  const originalJump=$('#jump')?.onsubmit;
  if($('#jump'))$('#jump').onsubmit=e=>{originalJump?.(e);const year=Zhou.Time.encode({era:$('#yearEra').value,year:Number($('#year').value)});if(Zhou.Time.isYear(year)&&year<=bounds.start&&year>=bounds.end)closeYear(true);};
  listen(doc,'keydown',e=>{if(e.key==='Escape'&&!e.defaultPrevented&&!doc.querySelector('dialog[open]')&&editor&&!editor.hidden){closeYear(true);e.preventDefault();}});
  listen(doc,'click',e=>{if(editor&&!editor.hidden&&!editor.contains?.(e.target)&&!yearToggle?.contains?.(e.target))closeYear();});
  listen($('#quickClearSearch'),'click',()=>{$('#clearSearch')?.onclick?.();keyboardIndex=-1;refresh();$('#search')?.focus?.({preventScroll:true});});
  const input=$('#search'),oldKey=input?.onkeydown;
  if(input)input.onkeydown=e=>{
   if(e.isComposing)return;
   const choices=[...doc.querySelectorAll('#searchResults .searchResult')];
   if((e.key==='ArrowDown'||e.key==='ArrowUp')&&choices.length){e.preventDefault?.();keyboardIndex=(keyboardIndex+(e.key==='ArrowDown'?1:-1)+choices.length)%choices.length;refresh();choices[keyboardIndex]?.scrollIntoView?.({block:'nearest'});return;}
   if(e.key==='Enter'&&keyboardIndex>=0&&choices[keyboardIndex]){e.preventDefault?.();choices[keyboardIndex].click();return;}
   const hadQuery=Boolean(state.search.query);oldKey?.(e);if(e.key==='Escape'&&hadQuery)e.preventDefault?.();
  };
  listen(input,'input',()=>{keyboardIndex=-1;refresh();});
  listen($('#timeSliceToggle'),'click',()=>{$('#timeSlice')?.scrollIntoView?.({block:'nearest',behavior:'auto'});});
  listen($('#clearFigureHighlight'),'click',clearHighlight);
  const order=$('#orderStates'),oldOrder=order?.onclick;
  if(order)order.onclick=()=>{$('#filters')?.close?.();oldOrder?.();};
  listen($('#ordering'),'close',()=>{$('#filter')?.focus?.({preventScroll:true});});
  listen($('#dataStatusToggle'),'click',()=>{$('#dataStatus')?.showModal?.();});
  listen($('#closeDataStatus'),'click',()=>{$('#dataStatus')?.close?.();$('#dataStatusToggle')?.focus?.({preventScroll:true});});
  function setTheme(value,persist=true){
   theme=['system','light','dark'].includes(value)?value:'system';const dark=theme==='dark'||theme==='system'&&Boolean(win?.matchMedia?.('(prefers-color-scheme: dark)').matches);
   doc.documentElement?.setAttribute?.('data-theme',dark?'dark':'light');if($('#themeMode'))$('#themeMode').value=theme;
   doc.querySelector('meta[name="theme-color"]')?.setAttribute?.('content',dark?'#141C24':'#F7F5F0');
   if(persist&&!b.storage?.write('zhou-theme-v1',theme)&&$('#uiStatus'))$('#uiStatus').textContent='本次主题已应用；浏览器未允许保存。';
   b.onThemeChanged?.();
  }
  setTheme(b.storage?.read('zhou-theme-v1','system')||'system',false);
  listen($('#themeMode'),'change',e=>setTheme(e.target.value));
  const media=win?.matchMedia?.('(prefers-color-scheme: dark)');listen(media,'change',()=>{if(theme==='system')setTheme('system',false);});
  refresh();
  return {model,gallery,refresh,openPerson,highlightCategory,clearHighlight,closeYear,setTheme,destroy(){listeners.forEach(remove=>remove());gallery?.destroy();if(input)input.onkeydown=oldKey;if($('#jump'))$('#jump').onsubmit=originalJump;if(order)order.onclick=oldOrder;}};
 };
})(globalThis.Zhou ||= {});
