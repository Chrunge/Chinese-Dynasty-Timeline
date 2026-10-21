(function(Zhou){
 'use strict';
 let sequence=0;
 Zhou.createTimeSlice=function({container,trigger,data,history,onOpen,document:doc=container?.ownerDocument}){
  // Lightweight legacy test DOMs do not implement a component-owned subtree.
  // The pure model remains usable there; do not weaken real browser semantics.
  if(!doc?.createElement||!container?.appendChild||!container?.contains||!trigger?.getAttribute||!trigger?.setAttribute||!trigger?.addEventListener)return Object.freeze({update(){},toggle(){return false;},close(){},destroy(){}});
  const model=Zhou.createTimeSliceModel({data,history});
  const old={id:container.id,hidden:container.hidden,controls:trigger.getAttribute('aria-controls'),expanded:trigger.getAttribute('aria-expanded')};
  if(!container.id)container.id='timeSlice-'+(++sequence);
  const generatedId=container.id;
  const root=doc.createElement('div');root.className='timeSlice';
  const header=doc.createElement('div');header.className='timeSliceHeader';
  const title=doc.createElement('h3');title.id=generatedId+'-title';title.tabIndex=-1;header.appendChild(title);
  const closeButton=doc.createElement('button');closeButton.type='button';closeButton.textContent='收起同年横截面';closeButton.className='timeSliceClose';header.appendChild(closeButton);
  const body=doc.createElement('div');body.className='timeSliceBody';root.appendChild(header);root.appendChild(body);container.appendChild(root);
  root.setAttribute('role','region');root.setAttribute('aria-labelledby',title.id);
  trigger.setAttribute('aria-controls',container.id);trigger.setAttribute('aria-expanded','false');container.hidden=true;
  let year=null,opened=false,destroyed=false;
  let buttons=new Map();
  function node(tag,text,parent){const item=doc.createElement(tag);if(text!==undefined)item.textContent=text;if(parent)parent.appendChild(item);return item;}
  function button(key,text,parent,next){
   const item=buttons.get(key)||doc.createElement('button');item.type='button';item.textContent=text;item.setAttribute('data-time-slice-open',key);parent.appendChild(item);next.set(key,item);return item;
  }
  function group(text,parent){const section=node('section',undefined,parent);node('h4',text,section);return section;}
  function focus(item){item?.focus({preventScroll:true});}
  function render(){
   const active=doc.activeElement,hadFocus=body.contains(active),activeKey=active?.getAttribute?.('data-time-slice-open');
   const scrollTop=container.scrollTop,rootScrollTop=root.scrollTop,next=new Map(),content=doc.createElement('div');
   if(!Zhou.Time.isYear(year)){
    title.textContent='同年横截面';node('p','请选择有效的参考年份。',content);
   }else{
    const slice=model.at(year);title.textContent=slice.label+' · 同年横截面';
    node('p','显示当前专题全部存续政权，不受时间轴勾选项影响。元年据明确的采用纪年计算；同年在位不等于参与当年事件。',content).className='timeSliceNote';
    const states=group('存续政权（'+slice.states.length+'）',content);
    if(!slice.states.length)node('p','资料中未记录当年存续的政权。',states);
    const stateList=node('ul',undefined,states);
    for(const row of slice.states){
     const item=node('li',undefined,stateList);item.className='timeSliceState';item.setAttribute('data-slice-state',row.state.id);
     button('country:'+row.state.id,row.state.name,item,next);
     if(row.interruption){
      node('p','政权中断 · 不列连续在位君主',item).className='timeSliceInterruption';
      const note=row.interruption.reason||row.interruption.note||row.interruption.label;
      if(note)node('p',note,item);
     }else if(!row.rulers.length)node('p','当年君主未详（不据空缺补推）。',item);
     else{
      if(row.rulers.length>1)node('p','当年有多位任期记录（并立或同年交替，详见各任期）。',item).className='timeSliceNote';
      const rulers=node('ul',undefined,item);
      for(const entry of row.rulers){
       const ruler=node('li',undefined,rulers);
       button('ruler:'+entry.ruler.id,entry.ruler.name,ruler,next);
       node('span',(entry.ruler.role?' · '+entry.ruler.role:'')+' · 采用纪年：'+entry.regnal.label,ruler);
        if(entry.ruler.approx||entry.ruler.dating?.level==='inferred'||entry.ruler.dating?.level==='disputed')node('p',entry.ruler.dating?.reason||'该任期含约年、推定或异说，年次依采用口径计算，详见任期说明。',ruler).className='timeSliceNote';
      }
     }
    }
    const events=group('当年事件（'+slice.events.length+'）',content);
    if(!slice.events.length)node('p','无当年事件记录。',events);
    else{const list=node('ul',undefined,events);for(const event of slice.events){const item=node('li',undefined,list);button('event:'+event.id,event.title||event.name||event.id,item,next);}}
    const people=group('人物活动记载（'+slice.people.length+'）',content);
    node('p','仅列明确系于当年的活动记录；不由生卒或分散事迹推断连续活跃期，也不表示该年所有在世人物。',people).className='timeSliceNote';
    if(!slice.people.length)node('p','无明确系于当年的人物活动记录。',people);
    else{
     const list=node('ul',undefined,people);
     for(const row of slice.people){const item=node('li',undefined,list);button('person:'+row.person.id,row.person.name,item,next);node('span',' · '+row.label,item);const activities=node('ul',undefined,item);for(const activity of row.activities)node('li',activity.summary||activity.label||activity.kind||'活动记载',activities);}
    }
   }
   body.replaceChildren(content);buttons=next;
   if(hadFocus)focus(buttons.get(activeKey)||title);
   container.scrollTop=scrollTop;root.scrollTop=rootScrollTop;
  }
  function close(restore=false){
   if(destroyed||!opened)return;
   const inside=container.contains(doc.activeElement);opened=false;container.hidden=true;trigger.setAttribute('aria-expanded','false');
   if(restore||inside)focus(trigger);
  }
  function toggle(force){
   if(destroyed)return false;
   const next=typeof force==='boolean'?force:!opened;
   if(!next){close();return false;}
   if(!opened){opened=true;container.hidden=false;trigger.setAttribute('aria-expanded','true');render();focus(title);}
   return opened;
  }
  function update(value){if(destroyed)return;year=Zhou.Time.isYear(value)?value:null;if(opened)render();}
  function onTrigger(){toggle();}
  function onClose(){close(true);}
  function onKey(event){if(event.key==='Escape'&&opened){event.preventDefault();event.stopPropagation();close(true);}}
  function onClick(event){const target=event.target.closest?.('[data-time-slice-open]');if(target&&body.contains(target)){event.stopPropagation();if(typeof onOpen==='function')onOpen(target.getAttribute('data-time-slice-open'));}}
  trigger.addEventListener('click',onTrigger);trigger.addEventListener('keydown',onKey);closeButton.addEventListener('click',onClose);root.addEventListener('keydown',onKey);body.addEventListener('click',onClick);
  function destroy(){
   if(destroyed)return;close();destroyed=true;
   trigger.removeEventListener('click',onTrigger);trigger.removeEventListener('keydown',onKey);closeButton.removeEventListener('click',onClose);root.removeEventListener('keydown',onKey);body.removeEventListener('click',onClick);root.remove();
   for(const [key,value]of [['aria-controls',old.controls],['aria-expanded',old.expanded]]){if(value===null)trigger.removeAttribute(key);else trigger.setAttribute(key,value);}
   container.hidden=old.hidden;if(!old.id&&container.id===generatedId)container.removeAttribute('id');buttons.clear();
  }
  return Object.freeze({update,toggle,close,destroy});
 };
})(globalThis.Zhou ||= {});
