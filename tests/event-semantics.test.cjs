'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),helper=path.join(__dirname,'helpers/browser.cjs');
const plain=value=>JSON.parse(JSON.stringify(value));
function presentation(){const context=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'src/core/presentation.js'),'utf8'),context);return context.Zhou.Presentation;}
function bootSource(data,width=1200){
 // Use the unchanged legacy DOM boundary with the current source bundle, never
 // build dist from a teammate's test. Derive order from the production bundler.
 const build=fs.readFileSync(path.join(root,'build.mjs'),'utf8'),bundle=build.match(/'app\.js':\s*\[([^\]]+)\]/)[1];
 const source=[...bundle.matchAll(/'([^']+)'/g)].map(match=>fs.readFileSync(path.join(root,match[1]),'utf8')).join('\n');
 const actualRequire=createRequire(helper),module={exports:{}},replacement={...fs,readFileSync(file,...args){
  const normalized=String(file).replaceAll('\\','/');
  if(normalized.endsWith('/dist/data.js'))return 'window.ZHOU_DATA='+JSON.stringify(data)+';';
  if(normalized.endsWith('/dist/app.js'))return source;
  return fs.readFileSync(file,...args);
 }};
 vm.runInNewContext(fs.readFileSync(helper,'utf8'),{require:id=>id==='node:fs'?replacement:actualRequire(id),module,exports:module.exports,__dirname:path.dirname(helper),console,AbortController,Blob,TextEncoder,Uint8Array,DataView,Date,Math},{filename:helper});
 return module.exports.boot({},width);
}
async function dataset(id='zhou'){const {compileProduction,catalog}=await import('../lib/production.mjs');return compileProduction(JSON.parse(fs.readFileSync(path.join(root,'data',catalog.find(topic=>topic.id===id).file),'utf8')),id);}
const kinds=['政治','战争','改革','外交','文化'];
function fixture(data){const base=plain(data.events[0]);data.events=kinds.map((kind,index)=>({...base,id:'semantic-'+index,name:'原标题不能改名或补造的关键事件'+index,year:500,kind,key:index===3,states:['qin','qi','chu'],participants:[]}));return data;}
function row(app,id){return app.el('#chart').children.find(node=>node.dataset.state===id);}
function eventButtons(node){return [...node.outerHTML.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(match=>({attrs:Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(value=>[value[1],value[2]])),html:match[2]})).filter(button=>button.attrs['data-event-ids']);}
const interest=id=>({dataset:{eventIds:id},closest(selector){return selector==='[data-event-ids]'?this:null;}});
function overlay(app){return app.ctx.document.querySelector('.eventRelations').innerHTML||'';}

test('五类事件的SVG路径与token各异，未知类别不冒充已知分类',()=>{
 const p=presentation(),icons=kinds.map(kind=>p.eventIcon(kind));assert.equal(new Set(icons.map(icon=>icon.token)).size,5);assert.equal(new Set(icons.map(icon=>icon.path)).size,5);assert(icons.every(icon=>icon.path.startsWith('M')));assert.equal(p.eventIcon('未分类').token,'other');
});
test('短标签只是原标题Unicode前缀截断，不造短名或修改冻结记录',()=>{
 const p=presentation(),event=Object.freeze({id:'key',key:true,name:'甲乙丙丁戊己庚辛壬癸子丑',states:Object.freeze(['qin'])});
 assert.equal(p.eventLabel(event),'甲乙丙丁戊己庚辛壬癸…');assert.equal(p.eventLabel({name:'𠮷甲乙'},1),'𠮷…');assert.equal(p.eventLabel({name:'短名'}),'短名');assert.equal(event.name,'甲乙丙丁戊己庚辛壬癸子丑');
});
test('像素布局保留key与混合类别的原ID、完整标题、日期及关系，标签防碰撞',()=>{
 const p=presentation(),records=kinds.map((kind,index)=>Object.freeze({id:'e'+index,kind,key:index===2,name:'原标题'+index,year:500,x:index*20,states:Object.freeze(['qin','chu'])}));Object.freeze(records);
 const before=JSON.stringify(records),result=p.events(records,{position:e=>e.x,measure:()=>160,top:0,bottom:44});
 assert.deepEqual(plain(result.groups.flatMap(group=>Array.from(group.events,e=>e.id)).sort()),records.map(e=>e.id).sort());
 for(const a of result.groups)for(const b of result.groups)if(a!==b&&a.lane===b.lane)assert(a.left+a.width<=b.left||b.left+b.width<=a.left);
 assert.equal(JSON.stringify(records),before);assert(result.groups.some(group=>group.events.some(e=>e.key)));assert.equal(new Set(result.groups.flatMap(group=>Array.from(p.eventKinds(group.events)))).size,5);
});
test('关联点按可见展示行去重，隐藏数仍按原政权ID；坐标0是有效值',()=>{
 const p=presentation(),event=Object.freeze({id:'ce-one',year:0,states:Object.freeze(['a','b','c','hidden'])}),rows=[{key:'group:ab',members:[{id:'a'},{id:'b'}]},{key:'state:c',members:[{id:'c'}]}];
 const [link]=p.eventLinks([event],rows,{position:()=>0,rowPosition:r=>r.key==='group:ab'?0:null});
 assert.equal(link.left,0);assert.equal(link.points.length,1);assert.equal(link.points[0].y,0);assert.deepEqual(plain(link.points[0].states),['a','b']);assert.deepEqual(plain(link.hidden),['c','hidden']);assert.deepEqual(plain(event.states),['a','b','c','hidden']);
});
for(const width of [1200,390])test(`混合聚类同时表达五类形状、key原标题前缀与全部标题/ID ${width}`,async()=>{
 const data=fixture(await dataset()),app=bootSource(data,width),before=app.run('JSON.stringify(D)');
 app.run("selected=new Set(['qin']);mode='events';density='full';rowHeight=36;fitRows=false;render()");
 const buttons=eventButtons(row(app,'qin'));assert.equal(buttons.length,1);const marker=buttons[0];
 assert.match(marker.attrs.class,/cluster/);assert.match(marker.attrs.class,/keyEvent/);assert.equal(marker.attrs['data-event-kinds'].split(' ').length,5);assert.equal((marker.html.match(/<svg /g)||[]).length,5);assert.match(marker.html,/原标题不能改名或补造/);assert.match(marker.html,/class="eventCount">5/);
 assert.deepEqual(marker.attrs['data-id'].split(',').sort(),data.events.map(e=>e.id).sort());for(const e of data.events){assert(marker.attrs.title.includes(e.name));assert(marker.attrs['aria-label'].includes(e.kind));}
 assert.equal(app.run('JSON.stringify(D)'),before);assert.equal(app.run("Zhou.EventSemantics.glyph('战争')").includes('aria-hidden="true"'),true);
});
test('hover与键盘focus是暂态，离开后清除；selected持久，过滤不自动重选隐藏政权',async()=>{
 const app=bootSource(fixture(await dataset()));app.run("selected=new Set(['qin','qi','chu']);mode='events';density='full';rowHeight=64;fitRows=false;render()");
 const before=app.run('JSON.stringify([...selected])'),marker=interest('semantic-0');app.el('#chart').pointerover({target:marker});assert.match(overlay(app),/eventRelationStem/);assert.match(overlay(app),/data-hidden-count="0"/);assert.equal(app.run('activeEventId'),null);
 app.el('#chart').focusin({target:marker});app.el('#chart').pointerout({target:marker,relatedTarget:null});assert.match(overlay(app),/eventRelationStem/);app.el('#chart').focusout({target:marker,relatedTarget:null});assert.equal(overlay(app),'');
 app.run("activeEventId='semantic-0';render()");assert.match(overlay(app),/data-event-id="semantic-0"/);app.run("selected=new Set(['qin']);render()");assert.match(overlay(app),/data-hidden-count="2"/);assert.match(overlay(app),/2个相关政权未显示/);assert.equal(app.run('selected.size'),1);assert.equal(before,'["qin","qi","chu"]');
 app.run('activeEventId=null;render()');assert.equal(overlay(app),'');
});
test('跨泳道引导仅落在视窗内相关行，屏幕外相关行也计入未显示数',async()=>{
 const app=bootSource(fixture(await dataset()));app.el('#viewport').clientHeight=170;app.run("selected=new Set(['qin','qi','chu']);mode='events';density='full';rowHeight=160;fitRows=false;activeEventId='semantic-0';render()");
 assert.match(overlay(app),/data-hidden-count="2"/);assert.equal((overlay(app).match(/class="eventRelationDot"/g)||[]).length,1);app.el('#viewport').scrollTop=160;app.run('syncEventRelations()');assert.match(overlay(app),/data-hidden-count="2"/);assert.equal((overlay(app).match(/class="eventRelationDot"/g)||[]).length,1);
});
test('起点未定年胶囊先打开原政权详情，再聚焦世系锚点，不虚构任期条带',async()=>{
 const data=await dataset(),state=data.states.find(s=>s.undated.length&&s.start<=data.timeline.start),app=bootSource(data);assert(state);app.run(`selected=new Set([${JSON.stringify(state.id)}]);render()`);assert.match(row(app,state.id).outerHTML,/class="event undatedCapsule"/);assert.match(row(app,state.id).outerHTML,/未定年世系/);
 const capsule={dataset:{undatedState:state.id},closest:s=>s==='[data-undated-state]'?capsule:null};let prevented=false;app.el('#chart').click({target:capsule,preventDefault(){prevented=true;}});
 assert(prevented);assert.equal(app.run('navigation.key'),'country:'+state.id);assert.strictEqual(app.ctx.document.activeElement,app.el('undated-lineage'));assert.match(app.el('#detailBody').innerHTML,/未定位的君主与前期领袖/);
});
test('cursorChanged可选钩子播报已夹紧整数坐标，0与负坐标不丢失',async()=>{
 const app=bootSource(await dataset('qin-han')),years=[];app.ctx.ZhouExperienceHooks={cursorChanged:year=>years.push(year)};app.run('setCursor(0);setCursor(-1);setCursor(-99999)');assert.deepEqual(years,[0,-1,app.run('end')]);delete app.ctx.ZhouExperienceHooks;assert.doesNotThrow(()=>app.run('setCursor(0)'));
});
test('胶囊单lane与最紧凑多lane保留底部无障碍事件槽，源boot/所有模式不崩且不丢ID',async()=>{
 const data=await dataset(),app=bootSource(data);for(const width of [1200,390]){app.ctx.innerWidth=width;for(const mode of ['both','rulers','events']){app.run(`selected=new Set(D.states.map(s=>s.id));mode='${mode}';density='full';rowHeight=36;fitRows=false;render()`);assert.equal(app.el('#chart').children.length,app.run('Zhou.Presentation.rows(visibleStates,D.presentation,pinned).length')+2);if(mode==='rulers')continue;for(const state of data.states){const expected=app.run(`historyService.eventsInRange({from:timelineBounds.start,to:end,states:[${JSON.stringify(state.id)}]}).map(e=>e.id).sort()`),actual=[...new Set(eventButtons(row(app,state.id)).flatMap(button=>button.attrs['data-event-ids'].split(',')))].sort();assert.deepEqual(actual,plain(expected));}}}
});
test('不可能外部全阻挡输入显式标记blocked，仍保留原标题与ID且不抛空聚类异常',()=>{
 const p=presentation(),event=Object.freeze({id:'blocked-original',name:'原题',year:500,x:10}),result=p.events([event],{position:e=>e.x,measure:()=>18,top:0,bottom:0,obstacles:[{left:0,right:100,top:0,bottom:18}]});assert.equal(result.groups[0].blocked,true);assert.strictEqual(result.groups[0].events[0],event);
});
test('可选聚类测宽处理扩宽后的相邻标记与任期障碍，原ID/日期不丢失',()=>{
 const p=presentation(),records=Array.from({length:40},(_,i)=>Object.freeze({id:'width-'+i,year:500-i,kind:kinds[i%5],name:'原标题'+i,x:Math.floor(i/2)*17})),before=JSON.stringify(records),obstacles=[{left:30,right:180,top:0,bottom:19}];Object.freeze(records);
 const options={position:e=>e.x,measure:()=>36,measureGroup:group=>group.length===1?36:Math.min(210,45+p.eventKinds(group).length*15+String(group.length).length*7),top:0,bottom:44,focusedId:'width-30',obstacles};
 const result=p.events(records,options);assert.deepEqual(plain(result.groups.flatMap(group=>Array.from(group.events,e=>e.id)).sort()),records.map(e=>e.id).sort());for(const a of result.groups){assert(!a.blocked);assert.equal(a.left,Math.min(...a.events.map(e=>e.x)));assert.equal(a.width,options.measureGroup(a.events));for(const b of result.groups)if(a!==b&&a.lane===b.lane)assert(a.left+a.width+8<=b.left||b.left+b.width+8<=a.left);for(const obstacle of obstacles)assert(a.left>=obstacle.right+2||a.left+a.width<=obstacle.left-2||a.top>=obstacle.bottom+1||a.top+18<=obstacle.top-1);}assert.equal(JSON.stringify(records),before);
});
test('非key中景和远景仅36px图标定推异；近景展开原标题，hover不扩矩形',async()=>{
 const data=fixture(await dataset());data.events=[{...data.events[0],key:false}];const app=bootSource(data);app.run("selected=new Set(['qin']);mode='events';density='auto';px=4;rowHeight=36;fitRows=false;render()");let marker=eventButtons(row(app,'qin'))[0];assert.match(marker.attrs.class,/compactEvent/);assert.match(marker.attrs.style,/width:36px;/);assert.match(marker.html,/eventCertainty/);assert.doesNotMatch(marker.html,/eventShortTitle/);const rectangle=marker.attrs.style;app.el('#chart').pointerover({target:interest(data.events[0].id)});assert.equal(eventButtons(row(app,'qin'))[0].attrs.style,rectangle);
 app.run("activeEventId='semantic-0';px=1;render()");marker=eventButtons(row(app,'qin'))[0];assert.match(marker.attrs.class,/compactEvent/);assert.match(marker.attrs.style,/width:36px;/);
 app.run('px=10;render()');marker=eventButtons(row(app,'qin'))[0];assert.doesNotMatch(marker.attrs.class,/compactEvent/);assert.match(marker.html,/eventShortTitle/);assert(Number(marker.attrs.style.match(/width:([\d.]+)px/)[1])>36);
});
test('非key混合cluster扩宽容纳全部类别图标与计数，key中景保留前缀标签',async()=>{
 const data=fixture(await dataset());data.events.forEach(e=>{e.key=false;e.dating={level:'inferred'};});const app=bootSource(data);app.run("selected=new Set(['qin']);mode='events';density='auto';px=4;rowHeight=36;fitRows=false;render()");let marker=eventButtons(row(app,'qin'))[0];assert.match(marker.attrs.class,/compactEvent/);assert.doesNotMatch(marker.html,/eventShortTitle/);assert.equal((marker.html.match(/<svg /g)||[]).length,5);assert.match(marker.html,/eventCount">5/);assert(Number(marker.attrs.style.match(/width:([\d.]+)px/)[1])>=99);assert(marker.attrs['aria-label'].startsWith('推 5 · '));
 app.run("D.events[3].key=true;activeEventId='semantic-0';render()");marker=eventButtons(row(app,'qin'))[0];assert.match(marker.attrs.class,/keyEvent/);assert.match(marker.html,/eventShortTitle/);assert(marker.attrs['aria-label'].startsWith('推 '+app.run('Zhou.Presentation.eventLabel(D.events[3])')+' 5 · '));
});
test('语音标签以前缀包含事件/政权/君主/钉/未定年胶囊可见文字和cursor显示年',async()=>{
 const app=bootSource(fixture(await dataset()));app.run("selected=new Set(D.states.map(s=>s.id));mode='both';density='full';rowHeight=160;fitRows=false;render()");let checked=0;for(const node of app.el('#chart').children.filter(n=>n.dataset.row)){for(const match of node.outerHTML.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)){if(!/class="(?:stateName|pinState|ruler |event undatedCapsule)/.test(match[1]))continue;const aria=match[1].match(/aria-label="([^"]*)"/)?.[1],visible=match[2].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();if(visible){assert(aria?.startsWith(visible),visible+' must prefix '+aria);checked++;}}}assert(checked>10);
 const cursor=app.ctx.document.querySelector('.cursorline'),attributes={};cursor.firstChild.setAttribute=(name,value)=>attributes[name]=value;app.run('setCursor(500)');assert(attributes['aria-label'].startsWith(attributes['data-year']+' · '));app.run('render()');assert(attributes['aria-label'].includes('左右方向键逐年调整'));
});
test('概览起点标签与未定年胶囊分占独立纵向槽，不遮挡原存续起点',async()=>{
 const data=await dataset(),state=data.states.find(s=>s.undated?.length&&s.start<=data.timeline.start),app=bootSource(data);
 for(const [mode,density]of [['both','overview'],['overview','full']]){
  app.run(`selected=new Set([${JSON.stringify(state.id)}]);mode='${mode}';density='${density}';rowHeight=36;fitRows=false;render()`);
  const html=row(app,state.id).outerHTML;assert.match(html,/class="lifeStart"/);
  const top=Number(html.match(/class="event undatedCapsule"[^>]*style="[^"]*top:([\d.]+)px/)[1]);
  assert(top>=26,'capsule must start below 3px+20px lifeStart, with a gap');
  assert(app.run(`appState.session.rowLayouts.get(${JSON.stringify(state.id)}).height`)>=top+18,'capsule stays inside its row');
 }
});
test('CSS不扩张18px事件、44px代理命中或推定条带的历史几何',()=>{
 const css=fs.readFileSync(path.join(root,'src/ui/event-semantics.css'),'utf8');assert.match(css,/stroke:currentColor/);assert.match(css,/border-left:2px dashed/);assert.match(css,/\.eventRelations\{[^}]*pointer-events:none/);assert.match(css,/\.ruler\.inferredBar::after\{[^}]*inset:0/);assert.doesNotMatch(css,/\.ruler\.inferredBar::after\{[^}]*(?:width|height|transform|margin):/);assert.match(css,/min-height:18px;height:18px/);
});
