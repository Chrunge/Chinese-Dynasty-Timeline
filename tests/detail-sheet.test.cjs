const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/ui/detail-sheet.js'),'utf8');
const context=vm.createContext({});vm.runInContext(source,context);
const {DetailSheet:rules,createDetailSheet}=context.Zhou;
const plain=value=>JSON.parse(JSON.stringify(value));
assert.deepEqual(plain(rules.snaps),[35,60,90]);
for(const [snap,pixels] of [[35,280],[60,480],[90,720]])assert.equal(rules.heightFor(snap,800),pixels);
assert.equal(rules.heightFor(-1,800),480);assert.equal(rules.heightFor(90,-1),0);
assert.equal(rules.nearestSnap(279,800),35);assert.equal(rules.nearestSnap(470,800),60);assert.equal(rules.nearestSnap(690,800),90);
assert.equal(rules.nearestSnap(0,0),60);assert.equal(rules.nearestSnap(NaN,800),60);
function decision(options,expected){assert.deepEqual(plain(rules.decideDrag(options)),expected);}
decision({snap:60,deltaY:7,viewportHeight:800,velocityY:10},{snap:60,dismiss:false});
decision({snap:60,deltaY:-220,viewportHeight:800},{snap:90,dismiss:false});
decision({snap:90,deltaY:230,viewportHeight:800},{snap:60,dismiss:false});
decision({snap:60,deltaY:180,viewportHeight:800},{snap:35,dismiss:false});
decision({snap:35,deltaY:60,viewportHeight:800},{snap:35,dismiss:false});
decision({snap:35,deltaY:96,viewportHeight:800},{snap:35,dismiss:true});
decision({snap:35,deltaY:30,viewportHeight:800,velocityY:.7},{snap:35,dismiss:true});
decision({snap:60,deltaY:30,viewportHeight:800,velocityY:.7},{snap:35,dismiss:false});
decision({snap:60,deltaY:300,viewportHeight:800},{snap:35,dismiss:true});
decision({snap:90,deltaY:540,viewportHeight:800},{snap:35,dismiss:true});
decision({snap:35,deltaY:64,viewportHeight:300},{snap:35,dismiss:true});
decision({snap:60,deltaY:900,viewportHeight:0},{snap:60,dismiss:false});
decision({snap:90,deltaY:NaN,viewportHeight:800},{snap:90,dismiss:false});

// Deliberately small DOM boundary: lifecycle/layout ownership is tested here,
// while native dialog top-layer rendering still needs a real browser smoke test.
class Events {
 constructor(){this.listeners=new Map();}
 addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn);}
 removeEventListener(type,fn){this.listeners.get(type)?.delete(fn);}
 emit(type,values={}){const event={type,prevented:false,preventDefault(){this.prevented=true;},...values};for(const fn of [...(this.listeners.get(type)||[])])fn(event);return event;}
 count(){return [...this.listeners.values()].reduce((sum,set)=>sum+set.size,0);}
}
class Element extends Events {
 constructor(tag,doc){
  super();this.nodeType=1;this.tagName=tag;this.ownerDocument=doc;this.children=[];this.attributes={};this.scrollTop=0;
  const values=new Set();this.classList={add:value=>values.add(value),remove:value=>values.delete(value),contains:value=>values.has(value)};
  this.style={values:{},setProperty(name,value){this.values[name]=value;},removeProperty(name){delete this.values[name];}};
 }
 setAttribute(name,value){this.attributes[name]=value;}
 get firstChild(){return this.children[0]||null;}
 appendChild(child){return this.insertBefore(child,null);}
 insertBefore(child,before){const index=before?this.children.indexOf(before):this.children.length;this.children.splice(index,0,child);child.parentNode=this;return child;}
 removeChild(child){this.children.splice(this.children.indexOf(child),1);child.parentNode=null;}
 contains(child){return this===child||this.children.some(node=>node.contains(child));}
 focus(options){this.ownerDocument.activeElement=this;this.focusOptions=options;}
 querySelector(selector){return selector==='#detailBack'?this.back:null;}
 setPointerCapture(id){this.capture=id;}
 releasePointerCapture(id){if(this.capture===id){this.capture=null;this.emit('lostpointercapture',{pointerId:id});}}
}
function fixture(width=390){
 const doc={documentElement:{clientHeight:800}};doc.createElement=tag=>new Element(tag,doc);
 const win=new Events();win.innerWidth=width;win.innerHeight=800;win.visualViewport=new Events();win.media=new Events();win.media.matches=width<768;win.matchMedia=()=>win.media;
 const dialog=doc.createElement('dialog'),header=doc.createElement('div'),body=doc.createElement('div'),back=doc.createElement('button');header.appendChild(back);dialog.appendChild(header);dialog.appendChild(body);dialog.back=back;dialog.open=true;dialog.scrollTop=510;body.scrollTop=42;back.focus();
 let dismissals=0;
 const sheet=createDetailSheet({dialog,body,window:win,document:doc,onDismiss(){dismissals++;dialog.open=false;sheet.sync();}});
 const controls=dialog.firstChild,handle=controls.firstChild,buttons=controls.children.slice(1);
 return {doc,win,dialog,header,body,back,sheet,controls,handle,buttons,dismissals:()=>dismissals};
}
const f=fixture();
assert.equal(f.dialog.children[1],f.header);assert.equal(f.dialog.children[2],f.body);assert.equal(f.controls.hidden,false);
assert.equal(f.handle.attributes.role,'slider');assert.equal(f.buttons.length,3);assert.equal(f.buttons[1].attributes['aria-pressed'],'true');
assert.equal(f.doc.activeElement,f.back);assert.equal(f.dialog.scrollTop,510);assert.equal(f.body.scrollTop,42);
f.buttons[0].emit('click');assert.equal(f.sheet.getState().snap,35);assert.equal(f.dialog.style.values['--detail-sheet-height'],'35dvh');
for(const [key,snap] of [['ArrowUp',60],['ArrowUp',90],['ArrowUp',90],['Home',35],['End',90],['ArrowDown',60]]){
 const event=f.handle.emit('keydown',{key});assert(event.prevented);assert.equal(f.sheet.getState().snap,snap);
}
assert.equal(f.handle.emit('keydown',{key:'Escape'}).prevented,false);assert.equal(f.dismissals(),0);
f.sheet.sync();assert.equal(f.sheet.getState().snap,60);assert.equal(f.dialog.scrollTop,510);assert.equal(f.body.scrollTop,42);
// No touch handler is installed on the reading surface; body scrolling is native.
assert.equal(f.body.count(),0);assert.equal(f.dialog.listeners.has('pointerdown'),false);
f.handle.emit('pointerdown',{pointerId:1,clientY:300,button:2});assert.equal(f.sheet.getState().dragging,false);
f.handle.emit('pointerdown',{pointerId:1,clientY:300,button:0,isPrimary:false});assert.equal(f.sheet.getState().dragging,false);
f.handle.emit('pointerdown',{pointerId:1,clientY:300,button:0,timeStamp:10});assert.equal(f.handle.capture,1);
f.handle.emit('pointermove',{pointerId:2,clientY:700,timeStamp:80});assert.equal(f.dialog.style.values['--detail-sheet-drag-height'],undefined);
f.handle.emit('pointermove',{pointerId:1,clientY:80,timeStamp:120});assert.equal(f.dialog.style.values['--detail-sheet-drag-height'],'700px');
f.handle.emit('pointerup',{pointerId:1,clientY:80,timeStamp:300});assert.equal(f.sheet.getState().snap,90);assert.equal(f.sheet.getState().dragging,false);
assert.equal(f.dialog.style.values['--detail-sheet-drag-height'],undefined);
f.handle.emit('pointerdown',{pointerId:3,clientY:300,timeStamp:310});f.handle.emit('pointermove',{pointerId:3,clientY:600,timeStamp:400});f.handle.emit('pointercancel',{pointerId:3});
assert.equal(f.sheet.getState().snap,90);assert.equal(f.dismissals(),0);
f.handle.emit('pointerdown',{pointerId:4,clientY:300,timeStamp:500});f.win.emit('blur');assert.equal(f.sheet.getState().dragging,false);
// A resize cancels capture, and crossing 768px removes only sheet presentation.
f.handle.focus();f.handle.emit('pointerdown',{pointerId:5,clientY:300,timeStamp:600});f.win.innerWidth=768;f.win.emit('resize');
assert.equal(f.controls.hidden,true);assert.equal(f.sheet.getState().mobile,false);assert.equal(f.sheet.getState().dragging,false);assert.equal(f.doc.activeElement,f.back);
assert.equal(f.dialog.scrollTop,510);assert.equal(f.body.scrollTop,42);assert.equal(f.back.focusOptions.preventScroll,true);
f.win.innerWidth=767;f.win.emit('resize');assert.equal(f.controls.hidden,false);assert.equal(f.sheet.getState().snap,90);
f.sheet.setSnap(35);f.handle.emit('pointerdown',{pointerId:6,clientY:300,timeStamp:700});f.handle.emit('pointermove',{pointerId:6,clientY:430,timeStamp:900});f.handle.emit('pointerup',{pointerId:6,clientY:430,timeStamp:1100});
assert.equal(f.dismissals(),1);assert.equal(f.sheet.getState().snap,60);assert.equal(f.dialog.open,false);
f.dialog.open=true;f.sheet.sync();assert.equal(f.sheet.getState().snap,60);
f.win.visualViewport.emit('resize');assert.equal(f.dialog.scrollTop,510);
f.sheet.destroy();f.sheet.destroy();assert.equal(f.sheet.getState().destroyed,true);assert.equal(f.dialog.firstChild,f.header);
assert.equal(f.dialog.classList.contains('hasDetailSheet'),false);assert.deepEqual(f.dialog.style.values,{});
assert.equal(f.win.count(),0);assert.equal(f.win.media.count(),0);assert.equal(f.win.visualViewport.count(),0);assert.equal(f.dialog.count(),0);assert.equal(f.handle.count(),0);assert(f.buttons.every(button=>button.count()===0));
f.sheet.sync();f.sheet.setSnap(35);assert.equal(f.sheet.getState().snap,60);
const recreated=createDetailSheet({dialog:f.dialog,body:f.body,window:f.win,document:f.doc});
assert.equal(f.dialog.children.length,3);assert.equal(recreated.getState().snap,60);recreated.destroy();assert.equal(f.dialog.children.length,2);assert.equal(f.win.count(),0);
const desktop=fixture(1200);assert.equal(desktop.controls.hidden,true);desktop.sheet.destroy();
// Existing VM stubs lack true element/node/style APIs and must safely no-op.
for(const options of [undefined,{dialog:{open:true,style:{},scrollTop:99},body:{},document:{createElement(){throw Error('legacy stub must not be used');}},window:{addEventListener(){throw Error('legacy stub must not be used');}}}]){
 const sheet=createDetailSheet(options);sheet.sync();sheet.setSnap(90);assert.equal(sheet.getState().supported,false);sheet.destroy();sheet.destroy();assert.equal(sheet.getState().destroyed,true);
}
const css=fs.readFileSync(path.join(__dirname,'../src/ui/detail-sheet.css'),'utf8');
assert(css.includes('@media (max-width: 767px)'));assert(css.includes('60dvh'));assert(css.includes('90dvh'));assert(css.includes('safe-area-inset-bottom'));assert(css.includes('prefers-reduced-motion: reduce'));assert(css.includes('height: 44px'));assert(css.includes('top: 52px'));
console.log('PASS detail sheet: pure heights/snaps/drag dismissal, handle-only gestures, keyboard/Esc ownership, original scroll/focus/header, breakpoint/viewport changes, close/reset, lifecycle cleanup and legacy VM no-op.');
