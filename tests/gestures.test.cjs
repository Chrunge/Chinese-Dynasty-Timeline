'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../src/ui/gestures.js'),'utf8');
function load(){const context=vm.createContext({});vm.runInContext(source,context,{filename:'src/ui/gestures.js'});return context.Zhou;}
const plain=value=>JSON.parse(JSON.stringify(value));
const box=(left,top,width,height)=>({left,top,right:left+width,bottom:top+height,width,height});

// A deterministic DOM/event/animation harness. It deliberately has no ambient
// document, window, requestAnimationFrame, timers or third-party DOM package.
class Target{
 constructor(){this.listeners=new Map();this.parentNode=null;}
 addEventListener(type,fn,options){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push({fn,capture:options===true||Boolean(options&&options.capture)});}
 removeEventListener(type,fn,options){const capture=options===true||Boolean(options&&options.capture);this.listeners.set(type,(this.listeners.get(type)||[]).filter(item=>item.fn!==fn||item.capture!==capture));}
}
function dispatch(target,type,extra={}){
 const event={type,target,cancelable:true,defaultPrevented:false,detail:0,...extra,
  preventDefault(){if(this.cancelable)this.defaultPrevented=true;},
  stopPropagation(){this.stopped=true;},stopImmediatePropagation(){this.stopped=true;this.immediate=true;}};
 const chain=[];for(let node=target;node;node=node.parentNode)chain.push(node);
 const invoke=(node,capture)=>{event.currentTarget=node;for(const item of [...(node.listeners.get(type)||[])])if(item.capture===capture){item.fn(event);if(event.immediate)break;}};
 for(const node of [...chain].reverse()){invoke(node,true);if(event.stopped)return event;}
 for(const node of chain){invoke(node,false);if(event.stopped)return event;}
 return event;
}
class Node extends Target{
 constructor(doc,tag='div',className=''){
  super();this.nodeType=1;this.ownerDocument=doc;this.tagName=tag.toUpperCase();this.className=className;this.children=[];this.attributes={};this.style={};this.rect=box(0,0,0,0);this.disabled=false;this.hidden=false;this.textContent='';this.clicks=0;
  this.classList={toggle:(name,value)=>{const names=new Set(this.className.split(/\s+/).filter(Boolean));const add=value===undefined?!names.has(name):value;if(add)names.add(name);else names.delete(name);this.className=[...names].join(' ');},contains:name=>this.className.split(/\s+/).includes(name)};
 }
 get isConnected(){for(let node=this;node;node=node.parentNode)if(node===this.ownerDocument)return true;return false;}
 appendChild(node){node.parentNode=this;this.children.push(node);return node;}
 removeChild(node){this.children=this.children.filter(child=>child!==node);if(node.contains(this.ownerDocument.activeElement))this.ownerDocument.activeElement=this.ownerDocument.body;node.parentNode=null;return node;}
 remove(){if(this.parentNode)this.parentNode.removeChild(this);}
 contains(node){for(let current=node;current;current=current.parentNode)if(current===this)return true;return false;}
 matches(selector){
  return selector.split(',').some(part=>{part=part.trim();if(part.startsWith('[')){const match=/^\[([^=\]]+)(?:="([^"]*)")?\]$/.exec(part);return Boolean(match&&this.getAttribute(match[1])!==null&&(match[2]===undefined||this.getAttribute(match[1])===match[2]));}
   const match=/^([a-z]+)?(?:\.([\w-]+))?$/.exec(part);return Boolean(match&&(!match[1]||match[1].toUpperCase()===this.tagName)&&(!match[2]||this.classList.contains(match[2])));});
 }
 closest(selector){for(let node=this;node&&node.nodeType===1;node=node.parentNode)if(node.matches(selector))return node;return null;}
 querySelectorAll(selector){const result=[];for(const child of this.children){if(child.matches(selector))result.push(child);result.push(...child.querySelectorAll(selector));}return result;}
 setAttribute(key,value){this.attributes[key]=String(value);}
 getAttribute(key){return key==='class'?this.className:Object.hasOwn(this.attributes,key)?this.attributes[key]:null;}
 getBoundingClientRect(){return {...this.rect};}
 focus(){const doc=this.ownerDocument,previous=doc.activeElement;if(previous===this)return;doc.activeElement=this;if(previous)dispatch(previous,'focusout',{relatedTarget:this});}
 click(){this.clicks++;return dispatch(this,'click');}
 setPointerCapture(id){this.ownerDocument.captured.set(id,this);}
 releasePointerCapture(id){if(this.ownerDocument.captured.get(id)===this){this.ownerDocument.captured.delete(id);dispatch(this,'lostpointercapture',{pointerId:id});}}
}
function harness(){
 let clock=0,nextFrame=1;const frames=new Map(),view=new Target(),doc=new Target();
 view.innerWidth=600;view.innerHeight=500;view.performance={now:()=>clock};view.requestAnimationFrame=fn=>{const id=nextFrame++;frames.set(id,fn);return id;};view.cancelAnimationFrame=id=>frames.delete(id);view.getComputedStyle=node=>({display:node.style.display||'block',visibility:node.style.visibility||'visible'});
 doc.defaultView=view;doc.parentNode=view;doc.captured=new Map();doc.createElement=tag=>new Node(doc,tag);doc.body=new Node(doc,'body');doc.body.parentNode=doc;doc.activeElement=doc.body;
 const viewport=new Node(doc,'div','viewport'),chart=new Node(doc,'div','chart'),track=new Node(doc,'div','track'),labels=new Node(doc,'div','stateLabel');
 viewport.rect=box(10,20,500,400);viewport.clientWidth=500;viewport.clientHeight=400;chart.rect=box(10,20,2000,1200);track.rect=box(110,84,1900,1136);labels.rect=box(10,84,100,336);
 doc.body.appendChild(viewport);viewport.appendChild(chart);chart.appendChild(track);chart.appendChild(labels);
 let left=100,top=100;Object.defineProperties(viewport,{scrollLeft:{get:()=>left,set:value=>{left=Math.max(0,Math.min(1500,value));}},scrollTop:{get:()=>top,set:value=>{top=Math.max(0,Math.min(800,value));}}});
 doc.elementFromPoint=(x,y)=>{
  const all=[...doc.body.querySelectorAll('button')].reverse();return all.find(node=>node.isConnected&&!node.hidden&&node.style.display!=='none'&&node.style.visibility!=='hidden'&&x>=node.rect.left&&x<=node.rect.right&&y>=node.rect.top&&y<=node.rect.bottom)||viewport;
 };
 function button(className,rect,parent=track,label=className){const node=new Node(doc,'button',className);node.rect=rect;node.setAttribute('aria-label',label);parent.appendChild(node);return node;}
 let scale=4;const zooms=[],cursors=[];const Zhou=load(),api=Zhou.createTimelineGestures({viewport,chart,getScale:()=>scale,onZoom:(next,x)=>{scale=next;zooms.push([next,x]);},onCursor:x=>cursors.push(x),labelWidth:()=>100});
 function pointer(type,x,y,{id=1,touch=true,target=chart,button=0,...rest}={}){return dispatch(type==='pointerdown'?target:doc.captured.get(id)||viewport,type,{pointerId:id,pointerType:touch?'touch':'mouse',button,clientX:x,clientY:y,...rest});}
 function step(ms=16){clock+=ms;const jobs=[...frames.values()];frames.clear();for(const fn of jobs)fn(clock);}
 return {Zhou,api,view,doc,viewport,chart,track,labels,button,pointer,step,zooms,cursors,frames,advance:ms=>{clock+=ms;},scale:()=>scale};
}

test('传统脚本：加载不读取DOM；旧DOM桩和缺参工厂安全降级',()=>{
 const Zhou=load();assert.equal(typeof Zhou.createTimelineGestures,'function');
 for(const options of [undefined,null,{}, {viewport:{addEventListener(){throw Error('stub must not be wired');}},chart:{}}, {viewport:{nodeType:1,ownerDocument:{}},chart:{nodeType:1}}]){
  const api=Zhou.createTimelineGestures(options);assert.equal(api.active,false);assert.doesNotThrow(()=>{api.cancel();api.closeCandidates();api.destroy();});
 }
});

test('纯命中：短图元扩成44方形，长条只增高度，不修改几何',()=>{
 const hit=load().TimelineGestureHit,rect=Object.freeze(box(100,200,2,4));
 assert.deepEqual(plain(hit.expandRect(rect)),{left:79,top:180,right:123,bottom:224});
 assert.deepEqual(plain(hit.expandRect(box(10,20,100,18))),{left:10,top:7,right:110,bottom:51});
 assert.equal(hit.expandRect(box(0,0,0,18)),null);assert.equal(hit.expandRect({left:NaN,top:0,right:10,bottom:10}),null);
 assert.deepEqual(rect,box(100,200,2,4));
});

test('纯命中：收集所有重叠候选并保留原引用，原命中优先但不吞掉邻项',()=>{
 const hit=load().TimelineGestureHit,a=Object.freeze({id:'a',rect:Object.freeze(box(100,100,2,2))}),b=Object.freeze({id:'b',rect:Object.freeze(box(110,100,2,2))}),c=Object.freeze({id:'c',rect:Object.freeze(box(300,300,10,10))});
 const input=Object.freeze([b,c,a]),result=hit.candidates(input,101,101);
 assert.deepEqual(Array.from(result,item=>item.id),['a','b']);assert.strictEqual(result[0],a);assert.strictEqual(result[1],b);
 const same={rect:box(100,100,2,2)};assert.strictEqual(hit.candidates([same,a],101,101)[0],same,'stable tie preserves input order');
 assert.equal(hit.candidates(input,NaN,100).length,0);assert.equal(hit.candidates([],101,101).length,0);
});

test('纯命中：虚拟区域可裁剪，禁用/隐藏/无效记录不抢点击',()=>{
 const hit=load().TimelineGestureHit,rect=box(100,100,2,2),a={rect},b={rect,disabled:true},c={rect,hidden:true},d={rect:box(0,0,0,10)};
 assert.equal(hit.candidates([a,b,c,d],80,100).length,1);
 assert.equal(hit.candidates([a],80,100,{clip:box(100,0,200,200)}).length,0);
 assert.equal(hit.candidates([{rect,hitClip:box(100,0,200,200)}],80,100).length,0);
 assert.equal(hit.candidates([a],100,100,{clip:box(0,0,0,10)}).length,0);
});

test('纯pinch计算：.8..24边界、退化距离、非数值输入',()=>{
 const hit=load().TimelineGestureHit;
 assert.equal(hit.pinchScale(4,100,200),8);assert.equal(hit.pinchScale(4,100,1),.8);assert.equal(hit.pinchScale(4,100,1000),24);
 assert.equal(hit.pinchScale(4,0,100),4);assert.equal(hit.clampScale(Infinity),.8);assert.equal(hit.clampScale(NaN),.8);
});

test('鼠标：保留旧背景拖动/点击参考线，按钮不被手势接管',()=>{
 const h=harness();assert.equal(h.api.active,true);assert(h.viewport.classList.contains('timelineGestureCanvas'));
 h.pointer('pointerdown',200,140,{touch:false});h.pointer('pointermove',150,125,{touch:false});assert.equal(h.viewport.scrollLeft,100,'scroll is rAF throttled');assert.equal(h.frames.size,1);
 h.step();assert.equal(h.viewport.scrollLeft,150);assert.equal(h.viewport.scrollTop,115);assert(h.viewport.classList.contains('dragging'));
 h.pointer('pointerup',150,125,{touch:false});assert.equal(h.frames.size,0,'mouse never flings');assert.equal(h.cursors.length,0);
 const ghost=dispatch(h.chart,'click',{detail:1});assert(ghost.defaultPrevented,'drag click is swallowed');
 h.pointer('pointerdown',240,150,{touch:false});h.pointer('pointerup',240,150,{touch:false});assert.deepEqual(h.cursors,[240]);
 const ruler=h.button('ruler',box(180,130,50,18));h.pointer('pointerdown',190,140,{touch:false,target:ruler});h.pointer('pointerup',190,140,{touch:false});const native=dispatch(ruler,'click',{detail:1});assert.equal(native.defaultPrevented,false);assert.equal(h.cursors.length,1);
 h.pointer('pointerdown',200,140,{touch:false,button:2});h.pointer('pointermove',100,140,{touch:false});h.step();assert.equal(h.viewport.scrollLeft,150);
});

test('单指：rAF合帧、双轴拖动、松手惯性且不误触图元',()=>{
 const h=harness(),ruler=h.button('ruler',box(180,120,2,2));
 h.pointer('pointerdown',181,121,{target:ruler});h.advance(20);h.pointer('pointermove',161,111);h.advance(20);h.pointer('pointermove',141,101);
 assert.equal(h.frames.size,1);assert.equal(h.viewport.scrollLeft,100);h.step();assert.equal(h.viewport.scrollLeft,140);assert.equal(h.viewport.scrollTop,120);
 h.pointer('pointerup',141,101);assert.equal(ruler.clicks,0);assert.equal(h.cursors.length,0);assert.equal(h.frames.size,1);
 const before=h.viewport.scrollLeft;h.step();assert(h.viewport.scrollLeft>before,'release continues pan');
 assert(dispatch(ruler,'click',{detail:1}).defaultPrevented,'native touch click after drag is swallowed');
 for(let i=0;i<110;i++)h.step();assert.equal(h.frames.size,0,'friction terminates');assert(h.viewport.scrollLeft<=1500);assert(h.viewport.scrollTop<=800);
});

test('减少动态效果：直接拖动保留，松手不安排惯性帧',()=>{
 const h=harness();h.view.matchMedia=()=>({matches:true});h.pointer('pointerdown',300,200);h.advance(20);h.pointer('pointermove',240,180);h.step();const left=h.viewport.scrollLeft;assert(left>100);h.pointer('pointerup',240,180);assert.equal(h.frames.size,0);h.step();assert.equal(h.viewport.scrollLeft,left);
});

test('惯性：新指/第二指立即取消旧惯性；pointercancel不遗留帧',()=>{
 const h=harness();h.pointer('pointerdown',300,200);h.advance(20);h.pointer('pointermove',240,180);h.step();h.pointer('pointerup',240,180);assert.equal(h.frames.size,1);
 h.pointer('pointerdown',220,170);assert.equal(h.frames.size,0);const left=h.viewport.scrollLeft;h.step();assert.equal(h.viewport.scrollLeft,left);
 h.pointer('pointerdown',320,170,{id:2});h.pointer('pointermove',360,170,{id:2});assert.equal(h.frames.size,1);
 h.pointer('pointercancel',360,170,{id:2});assert.equal(h.frames.size,0);h.step();assert.equal(h.zooms.length,0);assert.equal(h.viewport.classList.contains('dragging'),false);
 h.pointer('pointerup',220,170);assert.equal(h.frames.size,0);assert.equal(h.cursors.length,0);
});

test('取消/失去捕获：取消尚未提交的pan，之后正常重新手势',()=>{
 const h=harness();h.pointer('pointerdown',200,200);h.advance(20);h.pointer('pointermove',100,150);assert.equal(h.frames.size,1);
 dispatch(h.viewport,'lostpointercapture',{pointerId:1});assert.equal(h.frames.size,0);h.step();assert.equal(h.viewport.scrollLeft,100);assert.equal(h.viewport.scrollTop,100);
 h.pointer('pointerdown',220,220);h.pointer('pointerup',220,220);assert.deepEqual(h.cursors,[220]);
});

test('双指：中心clientX锚定、rAF节流、夹紧缩放、剩余单指不误tap/fling',()=>{
 const h=harness();h.pointer('pointerdown',200,200);h.pointer('pointerdown',300,200,{id:2});
 h.pointer('pointermove',150,200);h.pointer('pointermove',350,200,{id:2});assert.equal(h.frames.size,1);assert.equal(h.zooms.length,0);h.step();
 assert.deepEqual(h.zooms,[[8,250]]);assert.equal(h.viewport.scrollLeft,100,'stationary midpoint does not pan');
 h.pointer('pointermove',100,200);h.pointer('pointermove',500,200,{id:2});h.step();assert.deepEqual(h.zooms.at(-1),[16,300]);assert.equal(h.viewport.scrollLeft,50,'midpoint translation pans');
 h.pointer('pointermove',-1000,200);h.step();assert.equal(h.zooms.at(-1)[0],24);
 h.pointer('pointermove',499,200);h.step();assert.equal(h.zooms.at(-1)[0],.8);
 h.pointer('pointerup',500,200,{id:2});h.advance(20);h.pointer('pointermove',479,200);h.step();h.pointer('pointerup',479,200);assert.equal(h.frames.size,0);assert.equal(h.cursors.length,0);
});

test('双指：开始pinch取消排队的单指pan；第三指、取消皆安全',()=>{
 const h=harness();h.pointer('pointerdown',200,200);h.advance(20);h.pointer('pointermove',180,200);assert.equal(h.frames.size,1);
 h.pointer('pointerdown',300,200,{id:2});assert.equal(h.frames.size,0);h.step();assert.equal(h.viewport.scrollLeft,100);
 h.pointer('pointerdown',400,200,{id:3});h.pointer('pointermove',440,200,{id:3});h.step();assert(h.zooms.every(([scale])=>scale>=.8&&scale<=24));
 h.pointer('pointerup',440,200,{id:3});h.pointer('pointercancel',180,200);assert.equal(h.frames.size,0);assert.equal(h.cursors.length,0);
});

test('cursorHandle：鼠标与触摸拖动、保留抓取偏移、不拖整条marker',()=>{
 for(const touch of [false,true]){
  const h=harness(),line=new Node(h.doc,'div','cursorline');line.rect=box(200,84,1,300);h.chart.appendChild(line);
  const handle=h.button('cursorHandle',box(178,84,44,44),line);
  h.pointer('pointerdown',210,105,{touch,target:handle});h.pointer('pointermove',250,105,{touch});h.pointer('pointermove',260,105,{touch});assert.equal(h.frames.size,1);h.step();
  assert.deepEqual(h.cursors,[250],'grab point remains offset by 10px from handle center');assert.equal(h.viewport.scrollLeft,100);assert.equal(h.viewport.scrollTop,100);
  h.pointer('pointerup',260,105,{touch});assert.equal(h.frames.size,0);assert(dispatch(handle,'click',{detail:1}).defaultPrevented);
  h.pointer('pointerdown',200,105,{touch,target:handle});h.pointer('pointerup',200,105,{touch});assert.equal(h.cursors.length,1,'tap does not jump cursor');
 }
});

test('最终pointerup坐标：缺失/coalesced move不误判tap，最后坐标同步提交',()=>{
 const h=harness(),ruler=h.button('ruler',box(150,120,2,2));
 h.pointer('pointerdown',200,200);h.pointer('pointerup',140,121);assert.equal(h.viewport.scrollLeft,160);assert.equal(ruler.clicks,0);assert.equal(h.cursors.length,0);
 const handle=h.button('cursorHandle',box(178,84,44,44),h.chart);
 h.pointer('pointerdown',200,105,{target:handle});h.pointer('pointermove',230,105);h.step();assert.deepEqual(h.cursors,[230]);h.pointer('pointerup',250,105);assert.deepEqual(h.cursors,[230,250]);
 h.pointer('pointerdown',200,200);h.pointer('pointerdown',300,200,{id:2});h.pointer('pointerup',400,200,{id:2});assert.deepEqual(h.zooms.at(-1),[8,300]);h.api.cancel();
});

test('触控单候选：虚拟44方形命中调用原button.click，且只调用一次',()=>{
 const h=harness(),ruler=h.button('ruler',box(150,120,2,2));let delegated=0;
 h.doc.addEventListener('click',event=>{if(event.target===ruler)delegated++;});
 h.pointer('pointerdown',135,110);h.pointer('pointerup',135,110);assert.equal(ruler.clicks,1);assert.equal(delegated,1);assert.equal(h.cursors.length,0);
 assert(dispatch(ruler,'click',{detail:1}).defaultPrevented);assert.equal(delegated,1);
 ruler.click();assert.equal(delegated,2,'programmatic/keyboard clicks with detail=0 remain available');
});

test('触控多候选：即使直接触到原button也消歧，完整标题、键盘选择/退出',()=>{
 const h=harness(),a=h.button('ruler',box(150,120,2,2),h.track,'君主完整任期'),b=h.button('event',box(160,120,2,2),h.track,'事件完整标题');
 const previous=h.button('stateName',box(20,200,50,20),h.labels);previous.focus();
 h.pointer('pointerdown',151,121,{target:a});h.pointer('pointerup',151,121);
 let menu=h.doc.body.querySelectorAll('.timelineGestureCandidates')[0];assert(menu);assert.equal(menu.getAttribute('role'),'dialog');assert.equal(a.clicks,0);assert.equal(b.clicks,0);
 let buttons=menu.querySelectorAll('button');assert.equal(buttons.length,3);assert.equal(buttons[0].textContent,'君主完整任期');assert.equal(buttons[1].textContent,'事件完整标题');assert.strictEqual(h.doc.activeElement,buttons[0]);
 dispatch(buttons[0],'keydown',{key:'ArrowDown'});assert.strictEqual(h.doc.activeElement,buttons[1]);dispatch(buttons[1],'keydown',{key:'End'});assert.strictEqual(h.doc.activeElement,buttons[2]);dispatch(buttons[2],'keydown',{key:'Home'});assert.strictEqual(h.doc.activeElement,buttons[0]);dispatch(buttons[0],'keydown',{key:'Escape'});
 assert.equal(h.doc.body.querySelectorAll('.timelineGestureCandidates').length,0);assert.strictEqual(h.doc.activeElement,previous);
 h.pointer('pointerdown',156,121);h.pointer('pointerup',156,121);menu=h.doc.body.querySelectorAll('.timelineGestureCandidates')[0];buttons=menu.querySelectorAll('button');buttons[1].click();
 assert.equal(a.clicks,0);assert.equal(b.clicks,1);assert.equal(h.doc.body.querySelectorAll('.timelineGestureCandidates').length,0);assert.strictEqual(h.doc.activeElement,b);
});

test('兼容click：打开弹窗/重建图元后仍拦截旧触控click，新UI按压不受影响',()=>{
 const h=harness(),ruler=h.button('ruler',box(150,120,2,2));
 const dialog=new Node(h.doc,'div','dialog');h.doc.body.appendChild(dialog);const close=h.button('ordinaryButton',box(300,120,44,44),dialog);
 h.pointer('pointerdown',151,121,{target:ruler});h.pointer('pointerup',151,121);assert.equal(ruler.clicks,1);
 assert(dispatch(close,'click',{detail:1}).defaultPrevented,'retargeted compatibility click is suppressed outside viewport too');
 dispatch(close,'pointerdown',{pointerId:3,pointerType:'touch',button:0,clientX:310,clientY:130});assert.equal(dispatch(close,'click',{detail:1}).defaultPrevented,false,'a genuinely new UI press clears the click guard');
 h.pointer('pointerdown',200,200);h.advance(20);h.pointer('pointermove',100,160);h.step();h.pointer('pointerup',100,160);assert.equal(h.frames.size,1);
 dispatch(h.viewport,'pointercancel',{pointerId:1});assert.equal(h.frames.size,0,'pointercancel also cancels already-started inertia');
});

test('候选菜单：外点、取消按钮、Tab离开可退出且不激活任何候选',()=>{
 const h=harness(),a=h.button('ruler',box(150,120,2,2)),b=h.button('event',box(160,120,2,2));
 const open=()=>{h.pointer('pointerdown',156,121);h.pointer('pointerup',156,121);return h.doc.body.querySelectorAll('.timelineGestureCandidates')[0];};
 let menu=open();assert(menu);dispatch(h.doc.body,'pointerdown',{clientX:1,clientY:1});assert(!menu.isConnected);
 menu=open();menu.querySelectorAll('button').at(-1).click();assert(!menu.isConnected);
 menu=open();h.viewport.focus();assert(!menu.isConnected);assert.equal(a.clicks,0);assert.equal(b.clicks,0);
});

test('密集类型：君主/事件/分段/国家/钉/起点均命中且不改变视觉、ID或日期',()=>{
 for(const className of ['ruler','event','politySegment','stateName','pinState','lifeStart']){
  const h=harness(),label=['stateName','pinState'].includes(className),rect=label?box(40,120,2,2):box(150,120,2,2),node=h.button(className,rect,label?h.labels:h.track);
  node.setAttribute('data-id','stable-id');node.setAttribute('data-year','230');const before=JSON.stringify({rect:node.rect,attributes:node.attributes});
  h.pointer('pointerdown',rect.left-15,rect.top);h.pointer('pointerup',rect.left-15,rect.top);assert.equal(node.clicks,1,className);assert.equal(JSON.stringify({rect:node.rect,attributes:node.attributes}),before);
 }
});

test('虚拟命中：轴/固定标签遮挡边界、不可见图元和普通UI不被扩张抢点',()=>{
 const h=harness(),underAxis=h.button('ruler',box(150,70,2,2)),underLabel=h.button('ruler',box(90,120,2,2)),nearLabel=h.button('ruler',box(112,120,2,2));
 h.pointer('pointerdown',151,75);h.pointer('pointerup',151,75);assert.equal(underAxis.clicks,0);assert.equal(h.cursors.length,0);
 h.pointer('pointerdown',100,121);h.pointer('pointerup',100,121);assert.equal(underLabel.clicks,0);assert.equal(nearLabel.clicks,0);assert.equal(h.cursors.length,0);
 const hidden=h.button('event',box(200,120,2,2));hidden.style.visibility='hidden';const disabled=h.button('event',box(250,120,2,2));disabled.disabled=true;
 h.pointer('pointerdown',201,121);h.pointer('pointerup',201,121);h.pointer('pointerdown',251,121);h.pointer('pointerup',251,121);assert.equal(hidden.clicks,0);assert.equal(disabled.clicks,0);
 const ui=h.button('ordinaryButton',box(300,120,44,44));const event=h.pointer('pointerdown',310,130,{target:ui});assert.equal(event.defaultPrevented,false);h.pointer('pointermove',200,130);h.step();assert.equal(h.viewport.scrollLeft,100);assert.equal(h.doc.body.querySelectorAll('.timelineGestureCandidates').length,0);
});

test('遮挡：实际矩形被固定行或模态元素盖住时不生成虚拟候选',()=>{
 const h=harness(),ruler=h.button('ruler',box(150,120,2,2)),cover=h.button('ordinaryButton',box(140,110,44,44));
 h.pointer('pointerdown',135,121);h.pointer('pointerup',135,121);assert.equal(ruler.clicks,0);assert.equal(cover.clicks,0);assert.equal(h.doc.body.querySelectorAll('.timelineGestureCandidates').length,0);
});

test('destroy/cancel/失焦/隐藏：移除监听、候选、捕获与动画，destroy幂等',()=>{
 for(const kind of ['cancel','destroy','blur','hidden']){
  const h=harness();h.pointer('pointerdown',200,200);h.advance(20);h.pointer('pointermove',100,100);assert.equal(h.frames.size,1);
  if(kind==='blur')dispatch(h.view,'blur');else if(kind==='hidden'){h.doc.hidden=true;dispatch(h.doc,'visibilitychange');}else h.api[kind]();
  assert.equal(h.frames.size,0);assert.equal(h.doc.captured.size,0);assert.equal(h.viewport.classList.contains('dragging'),false);h.step();assert.equal(h.viewport.scrollLeft,100);
  h.api.destroy();h.api.destroy();assert.equal(h.viewport.classList.contains('timelineGestureCanvas'),false);
  h.pointer('pointerdown',200,200);h.pointer('pointermove',100,100);h.step();assert.equal(h.frames.size,0);assert.equal(h.cursors.length,0);
 }
 const h=harness();h.button('ruler',box(150,120,2,2));h.button('event',box(160,120,2,2));h.pointer('pointerdown',156,121);h.pointer('pointerup',156,121);assert.equal(h.doc.body.querySelectorAll('.timelineGestureCandidates').length,1);h.api.destroy();assert.equal(h.doc.body.querySelectorAll('.timelineGestureCandidates').length,0);
});

test('CSS作用域只限手势canvas和菜单，不扩大密集图元视觉或伪元素',()=>{
 const css=fs.readFileSync(path.resolve(__dirname,'../src/ui/gestures.css'),'utf8');
 assert(css.includes('touch-action:none'));assert(css.includes('min-height:44px'));assert(css.includes('min-width:44px'));assert(!css.includes('::before'));assert(!css.includes('::after'));
 const rules=[...css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/([^{}]+)\{/g)].map(match=>match[1].trim());assert(rules.length>0);assert(rules.every(selector=>selector.startsWith('.timelineGesture')));
 assert(!/\.(ruler|event|politySegment|stateName|pinState|lifeStart)\s*\{/.test(css));
});
