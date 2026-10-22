const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const sources=['src/core/time.js','src/core/person-activities.js','src/core/history.js','src/core/time-slice.js','src/ui/time-slice.js'];
const text=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function services(){const ctx=vm.createContext({});for(const name of sources)vm.runInContext(text(name),ctx);return ctx.Zhou;}
const Z=services(),plain=value=>JSON.parse(JSON.stringify(value));
function fixture(){return {
 timeline:{start:4,end:-4,defaultEnd:-4,cursor:1},
 states:[
  {id:'a',name:'甲政权',start:4,end:-3,interruptions:[],rulers:[
   {id:'a-main',name:'甲正式君主',role:'君主',start:1,end:-3,chronology:{regnalStart:1},dating:{level:'inferred',reason:'采用口径待复核，不等同于精确纪年。'}},
   {id:'a-late',name:'甲先即位后改元',role:'并立君主',start:0,end:-3,chronology:{accession:1,regnalStart:0}},
   {id:'a-context',name:'只属背景关系',start:3,end:-3,polityAssociation:'contextual',chronology:{regnalStart:3}}
  ]},
  {id:'b',name:'乙政权',start:3,end:-2,interruptions:[{start:0,end:-1,reason:'外力中断；该段无连续君主。'}],rulers:[{id:'b-r',name:'乙君主',start:3,end:-2,chronology:{regnalStart:3}}]},
  {id:'c',name:'丙政权',start:0,end:-4,rulers:[{id:'c-r',name:'丙元年未详',start:0,end:-4,chronology:{accession:0}}]},
  {id:'d',name:'已结束政权',start:4,end:2,rulers:[]}
 ],
 events:[{id:'e0',name:'公元元年事件',year:0,states:['a','b'],kind:'政治'},{id:'eMinus',name:'公元二年事件',year:-1,states:['c'],kind:'政治'},{id:'unknown',name:'日期不明事件',year:null,states:['a'],kind:'政治'}],
 people:[
  {id:'p0',name:'当年有记录人物',birth:4,death:-4,journey:[{year:0,summary:'元年有明确记载'},{year:1,summary:'前一年记载'},{year:-2,summary:'分散的后来记载'},{year:null,summary:'年不详'}]},
  {id:'p-life',name:'只知生卒人物',birth:4,death:-4,journey:[]},
  {id:'p-scattered',name:'仅有前后活动人物',journey:[{year:2,summary:'早期活动'},{year:-2,summary:'晚期活动'}]}
 ]
};}
function setup(){const data=fixture(),history=Z.createHistory(data);return {data,history,model:Z.createTimeSliceModel({data,history})};}

test('横截面列全专题存续政权，不受勾选/视觉行组影响且不修改资料',()=>{
 const {data,model}=setup(),before=JSON.stringify(data);
 data.presentation={rowGroups:[{id:'visual-only',stateIds:['a']}]};const configured=JSON.stringify(data);
 const slice=model.at(0);
 assert.deepEqual(plain(slice.states.map(row=>row.state.id)),['a','b','c']);
 assert.equal(slice.year,0);assert.equal(slice.label,'公元1年');assert.equal(JSON.stringify(data),configured);
 delete data.presentation;assert.equal(JSON.stringify(data),before);
 assert.deepEqual(plain(model.at(-4).states.map(row=>row.state.id)),['c']);
});
test('采用history查询：中断保留政权原注但没有君主，contextual不成为在位者',()=>{
 const {model}=setup(),slice=model.at(0),a=slice.states.find(row=>row.state.id==='a'),b=slice.states.find(row=>row.state.id==='b');
 assert.deepEqual(plain(a.rulers.map(row=>row.ruler.id)),['a-main','a-late']);
 assert.equal(b.interruption.reason,'外力中断；该段无连续君主。');assert.equal(b.rulers.length,0);
 assert.equal(model.at(-2).states.find(row=>row.state.id==='b').rulers.length,1);
});
test('年次只据显式regnalStart：跨公元无0年，元年前不冒充元年，缺失未详',()=>{
 const {model}=setup();
 const before=model.at(1).states.find(row=>row.state.id==='a').rulers;
 assert.equal(before[0].regnal.number,1);assert.equal(before[1].regnal.status,'before');assert.equal(before[1].regnal.number,null);assert.match(before[1].regnal.label,/元年前/);
 const zero=model.at(0);assert.equal(zero.states[0].rulers[0].regnal.number,2);assert.equal(zero.states[0].rulers[1].regnal.label,'元年');
 const unknown=zero.states.find(row=>row.state.id==='c').rulers[0].regnal;
 assert.deepEqual(plain(unknown),{status:'unknown',number:null,label:'元年未详'});
 assert.equal(model.at(-1).states[0].rulers[0].regnal.number,3);
});
test('当年事件去重，人物只列明确年份活动，不从生卒/分散事迹推断活跃',()=>{
 const {model}=setup(),slice=model.at(0);
 assert.deepEqual(plain(slice.events.map(event=>event.id)),['e0']);
 assert.deepEqual(plain(slice.people.map(row=>row.person.id)),['p0']);
 assert.equal(slice.people[0].activities.length,1);assert.equal(slice.people[0].label,'当年有活动记载');
 assert.equal(model.at(-1).people.length,0);assert.deepEqual(plain(model.at(-1).events.map(event=>event.id)),['eMinus']);
 assert.equal(model.at(0).people[0].activities[0].year,0);
});
test('未知和非整数年份拒绝，CE负坐标有效',()=>{
 const {model}=setup();for(const value of [null,undefined,'0',NaN,1.2])assert.throws(()=>model.at(value),/有效的年份坐标/);
 assert.equal(model.at(-1).label,'公元2年');
});

test('真实跨元与全公元专题复用同一模型，无周朝边界/政权名假设',async()=>{
 const {compileAtlas}=await import('../lib/atlas.mjs');
 for(const [name,year]of [['qin-han',0],['three-kingdoms',1-223]]){
  const data=compileAtlas(JSON.parse(text('data/examples/'+name+'.json'))),history=Z.createHistory(data),before=JSON.stringify(data);
  const slice=Z.createTimeSliceModel({data,history}).at(year);
  assert.deepEqual(plain(slice.states.map(row=>row.state.id)),data.states.filter(state=>history.existsAt(state,year)).map(state=>state.id));
  assert.equal(slice.label,Z.Time.format(year));assert.equal(JSON.stringify(data),before);
  if(name==='three-kingdoms')assert.equal(slice.states.length,3);
  if(name==='qin-han')assert(slice.states.flatMap(row=>row.rulers).some(row=>row.ruler.name==='汉平帝'&&row.regnal.number===2));
 }
});

// Minimal DOM boundary for the isolated component, not an HTML parser. Moving a
// focused subtree drops focus, as a real DOM move does; the component restores it.
function dom(){
 const doc={activeElement:null,createElement:tag=>new Element(tag)};
 class Element{
  constructor(tag){this.tagName=tag.toUpperCase();this.ownerDocument=doc;this.children=[];this.parentNode=null;this.attrs=new Map();this.listeners=new Map();this.hidden=false;this.scrollTop=0;this._text='';this.className='';}
  get id(){return this.getAttribute('id')||'';}set id(value){this.setAttribute('id',value);}
  set textContent(value){this._text=String(value);this.replaceChildren();}get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
  setAttribute(key,value){this.attrs.set(key,String(value));}getAttribute(key){return this.attrs.get(key)??null;}removeAttribute(key){this.attrs.delete(key);}
  contains(item){return item===this||this.children.some(child=>child.contains(item));}
  remove(){if(this.contains(doc.activeElement))doc.activeElement=null;if(this.parentNode){const p=this.parentNode;p.children.splice(p.children.indexOf(this),1);this.parentNode=null;}}
  appendChild(child){child.remove();this.children.push(child);child.parentNode=this;return child;}
  replaceChildren(...children){for(const child of [...this.children])child.remove();for(const child of children)this.appendChild(child);}
  addEventListener(type,listener){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(listener);}
  removeEventListener(type,listener){this.listeners.get(type)?.delete(listener);}
  closest(selector){if(selector==='[data-time-slice-open]'&&this.getAttribute('data-time-slice-open')!==null)return this;return this.parentNode?.closest(selector)||null;}
  focus(){doc.activeElement=this;}
  emit(type,props={}){const event={target:this,key:undefined,stopped:false,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;},...props};for(let item=this;item&&!event.stopped;item=item.parentNode)for(const listener of item.listeners.get(type)||[])listener(event);return event;}
 }
 const container=doc.createElement('section'),trigger=doc.createElement('button'),outside=doc.createElement('button');
 function find(root,predicate){if(predicate(root))return root;for(const child of root.children){const found=find(child,predicate);if(found)return found;}return null;}
 return {doc,container,trigger,outside,find};
}
function uiSetup(){const d=dom(),{data,history}=setup(),opened=[];let queries=0;const original=history.eventsInRange;const watched={...history,eventsInRange(options){queries++;return original(options);}};const ui=Z.createTimeSlice({...d,data,history:watched,onOpen:key=>opened.push(key)});return {...d,ui,opened,get queries(){return queries;}};}

test('不完整旧伪DOM安全降级，纯模型仍可独立调用',()=>{
 const {data,history}=setup();const ui=Z.createTimeSlice({container:{},trigger:{},data,history});
 ui.update(0);assert.equal(ui.toggle(),false);ui.close();ui.destroy();
 assert.equal(Z.createTimeSliceModel({data,history}).at(0).year,0);
});

test('UI默认折叠且闭合更新不查询，打开后使用非modal region和原生按钮',()=>{
 const app=uiSetup();assert.equal(app.container.hidden,true);assert.equal(app.trigger.getAttribute('aria-expanded'),'false');
 app.ui.update(0);app.ui.update(-1);assert.equal(app.queries,0);app.trigger.emit('click');assert.equal(app.queries,1);
 assert.equal(app.container.hidden,false);assert.equal(app.trigger.getAttribute('aria-expanded'),'true');assert.match(app.container.textContent,/公元2年/);
 assert(app.find(app.container,n=>n.getAttribute('role')==='region'));assert.equal(app.find(app.container,n=>n.getAttribute('aria-modal')==='true'),null);
 const detail=app.find(app.container,n=>n.getAttribute('data-time-slice-open')==='country:a');assert.equal(detail.tagName,'BUTTON');assert.equal(detail.type,'button');detail.emit('click');assert.deepEqual(app.opened,['country:a']);
 app.ui.destroy();
});
test('打开更新保留详情按钮焦点；记录消失时回标题，不抢外部焦点',()=>{
 const app=uiSetup();app.ui.update(0);app.ui.toggle(true);
 const button=app.find(app.container,n=>n.getAttribute('data-time-slice-open')==='ruler:a-main');button.focus();app.ui.update(-1);assert.equal(app.doc.activeElement,button);
 app.ui.update(-4);assert.equal(app.doc.activeElement.tagName,'H3');
 app.outside.focus();app.ui.update(0);assert.equal(app.doc.activeElement,app.outside);app.ui.destroy();
});
test('Esc从面板与trigger均收起并回trigger；Tab不trap，销毁解绑和还原属性',()=>{
 const app=uiSetup();app.ui.update(0);app.ui.toggle(true);
 const person=app.find(app.container,n=>n.getAttribute('data-time-slice-open')==='person:p0');person.focus();
 assert.equal(person.emit('keydown',{key:'Tab'}).prevented,undefined);
 assert.equal(person.emit('keydown',{key:'Escape'}).prevented,true);assert.equal(app.container.hidden,true);assert.equal(app.doc.activeElement,app.trigger);
 app.trigger.emit('click');app.trigger.emit('keydown',{key:'Escape'});assert.equal(app.container.hidden,true);
 const count=app.queries;app.ui.destroy();assert.equal(app.container.children.length,0);assert.equal(app.trigger.getAttribute('aria-expanded'),null);assert.equal(app.trigger.getAttribute('aria-controls'),null);assert.equal(app.container.id,'');
 app.trigger.emit('click');app.ui.update(0);assert.equal(app.queries,count);assert.equal(app.ui.toggle(),false);
});
test('UI原样保留政权中断注、元年前/缺失提示和人物活动措辞，文本不作为HTML',()=>{
 const app=uiSetup();app.ui.update(0);app.ui.toggle(true);
 assert.match(app.container.textContent,/外力中断；该段无连续君主/);assert.match(app.container.textContent,/政权中断/);assert.match(app.container.textContent,/元年未详/);assert.match(app.container.textContent,/当年有活动记载/);assert.match(app.container.textContent,/不由生卒或分散事迹推断/);assert.match(app.container.textContent,/采用纪年/);assert.match(app.container.textContent,/采用口径待复核，不等同于精确纪年/);
 app.ui.update(1);assert.match(app.container.textContent,/元年前/);app.ui.close();assert.equal(app.container.hidden,true);app.ui.destroy();
});
