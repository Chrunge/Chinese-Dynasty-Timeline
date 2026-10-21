// Offline acceptance only. Uses existing build artifacts; never builds, mutates
// dist/data, requests historical sources, or writes reports/screenshots.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {catalog} from '../lib/production.mjs';

const widths = [375,1200], results = [], collisions = new Set();
const poison = '__stage4_old_reading_must_not_win__';
const pageURL = topic => pathToFileURL(resolve('dist',topic.page)).href;
const browser = await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {channel:'chrome'})});

async function session(width,{fixture=null}={}) {
  const context = await browser.newContext({viewport:{width,height:900},offline:true,reducedMotion:'reduce'});
  // Intercept the actual classic script's window.ZHOU_DATA assignment. Both the
  // synthetic dataset and legacy reading record exist before any app module runs.
  await context.addInitScript(({fixture,poison}) => {
    localStorage.setItem('zhou-ui-v1',JSON.stringify({advanced:false,onboardingVersion:1}));
    let data;
    Object.defineProperty(window,'ZHOU_DATA',{configurable:true,get:()=>data,set:incoming=>{
      data=fixture || incoming;
      const id=data.datasetId || data.timeline?.topic || 'zhou';
      const key=(id==='zhou'?'':id+':')+'zhou-reading-v4';
      if(fixture){localStorage.removeItem(key);return;}
      const dates=data.states.flatMap(state=>[state.start,state.end]).filter(Number.isSafeInteger);
      const start=Number.isSafeInteger(data.timeline?.start)?data.timeline.start:Math.max(...dates);
      const end=Number.isSafeInteger(data.timeline?.defaultEnd)?data.timeline.defaultEnd:Math.min(...dates);
      // Old unmarked reading records are intentionally poisoned, but otherwise
      // valid/restorable (including BCE-only years where the target has BCE).
      const saved={version:4,width:widthForRecord(),view:{px:19,end,selected:[data.states.at(-1).id],query:poison,mode:'overview',category:'文化',cursor:start,density:'overview',activeEventId:null,searchScope:'selected',searchDescriptions:true,searchLimit:37,searchTarget:null,left:100,top:30,searchTop:0,pageY:0,periods:[]},layout:{order:data.states.map(state=>state.id).reverse(),pins:[data.states.at(-1).id],rowHeight:96,viewHeight:560,fitRows:false,rowHeights:{}}};
      localStorage.setItem(key,JSON.stringify(saved));
      window.__stage4OldReading={key,saved};
    }});
    function widthForRecord(){return innerWidth;}
  },{fixture,poison});
  const page=await context.newPage(), errors=[], network=[], failed=[], resources=[];
  page.on('pageerror',error=>errors.push('pageerror: '+error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push('console.error: '+message.text());});
  page.on('request',request=>{resources.push(request.url());if(/^https?:/i.test(request.url()))network.push(request.url());});
  page.on('requestfailed',request=>failed.push({url:request.url(),error:request.failure()?.errorText}));
  page.setDefaultTimeout(10000);
  return {context,page,async verify(label){
    assert.deepEqual(errors,[],label+' runtime/console errors');
    assert.deepEqual(network,[],label+' must remain entirely offline');
    assert.deepEqual(failed,[],label+' failed local resources');
    assert(resources.some(url=>/\/entity-links\.js(?:$|[?#])/.test(url)),label+' loaded the independent cross-topic resource');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,label+' page overflow');
  }};
}
async function ready(page) {
  await page.locator('.stateRow').first().waitFor();
  assert.equal(await page.locator('#onboarding').isVisible(),false);
  assert.equal(await page.evaluate(()=>window.ZHOU_ENTITY_LINKS?.schemaVersion),1,'cross-topic resource executes on the actual file page');
}
async function openRecord(page,type,id) {
  await page.evaluate(({type,id})=>{if(document.querySelector('#detail').open)closeDetail(false);if(type==='country')showState(id);else showPerson(id);},{type,id});
  await page.locator('#detail').waitFor();
  assert.equal(await page.evaluate(()=>navigation.key),type+':'+id);
}
async function nativeHop(page,datasetId,key) {
  const link=page.locator('#detail a[data-cross-topic="'+datasetId+'"]');
  assert.equal(await link.count(),1,'one native link for target topic');
  const attributes=await link.evaluate(el=>({tag:el.tagName,href:el.href,raw:el.getAttribute('href'),target:el.target,onclick:el.getAttribute('onclick')}));
  assert.equal(attributes.tag,'A');assert.equal(attributes.target,'');assert.equal(attributes.onclick,null);
  assert.match(attributes.raw,/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.html#/);
  const targetURL=new URL(attributes.href), p=new URLSearchParams(targetURL.hash.slice(1));
  assert.equal(targetURL.protocol,'file:');assert.equal(p.get('dataset'),datasetId);
  assert.equal(p.get('item'),key);assert.equal(p.get('target'),key);
  // Real keyboard activation of a real anchor, not page.goto reconstructed URLs
  // or JS openSharedItem. addInitScript seeds stale target reading before load.
  await link.focus();await Promise.all([page.waitForEvent('load'),page.keyboard.press('Enter')]);
  await ready(page);await page.locator('#detail').waitFor();
  const actual=await page.evaluate(()=>({dataset:D.datasetId||D.timeline?.topic||'zhou',key:navigation.key,cursor:appState.conditions.cursor,end:appState.conditions.end,query:appState.search.query,target:appState.search.searchTarget,selected:[...appState.conditions.selected],pinned:[...appState.layout.pinned],mode:appState.layout.mode,category:appState.conditions.category,scope:appState.search.searchScope,descriptions:appState.search.searchDescriptions,old:window.__stage4OldReading?.saved.view.query,title:document.querySelector('#detail .detailTitle')?.textContent}));
  assert.equal(new URL(page.url()).pathname,targetURL.pathname);
  assert.equal(actual.old,poison,'target had an existing legacy reading record');
  assert.equal(actual.dataset,datasetId);assert.equal(actual.key,key);assert(actual.title);
  assert.equal(actual.cursor,Number(p.get('year')),'explicit target year beats old reading and local person-year hints');
  assert.equal(actual.end,Number(p.get('end')));assert.equal(actual.query,'');assert.equal(actual.target,key);
  assert.deepEqual(actual.selected,p.get('states')?.split(',').filter(Boolean)||[]);
  assert.deepEqual(actual.pinned,[]);assert.equal(actual.mode,'both');assert.equal(actual.category,'all');assert.equal(actual.scope,'all');assert.equal(actual.descriptions,false);
  return {dataset:datasetId,key,cursor:actual.cursor,version:p.get('v'),time:p.get('time')};
}
async function crossTopicCase(width,topic) {
  const s=await session(width),{page}=s;
  try {
    await page.goto(pageURL(topic));await ready(page);
    assert.equal(await page.evaluate(()=>appState.search.query),poison,'old reading is genuinely restored in the absence of a hash');
    const candidates=await page.evaluate(()=>{
      const index=window.ZHOU_ENTITY_LINKS,here=D.datasetId||D.timeline?.topic||'zhou';
      const choose=(collection,records)=>{
        const available=(index.entities?.[collection]||[]).filter(entity=>entity.links.some(link=>link.datasetId===here)&&records.some(record=>record.id===entity.id));
        const chosen=here==='zhou'&&collection==='people'?available.find(entity=>entity.id==='person-033'):available[0];
        return chosen?{id:chosen.id,other:(here==='zhou'&&collection==='people'?chosen.links.find(link=>link.datasetId==='qin-han'):chosen.links.find(link=>link.datasetId!==here)).datasetId}:null;
      };
      return {person:choose('people',D.people),country:choose('polities',D.states),soloPerson:D.people.find(person=>!index.entities?.people?.some(entity=>entity.id===person.id&&entity.links.some(link=>link.datasetId===here)))?.id,collisions:D.states.filter(state=>['later-liang','wu-zhou'].includes(state.id)).map(state=>state.id)};
    });
    const trips=[];
    for(const type of ['person','country']) {
      const candidate=candidates[type];
      if(!candidate){
        if(type==='person'&&candidates.soloPerson){await openRecord(page,type,candidates.soloPerson);assert.equal(await page.locator('#detail [data-cross-topic]').count(),0,'no fabricated shared-person links');await page.locator('#close').click();}
        trips.push({type,status:'none-authored'});continue;
      }
      await openRecord(page,type,candidate.id);
      assert.equal(await page.locator('#detail nav.crossTopicLinks').count(),1);
      assert.equal(await page.locator('#detail [data-cross-topic="'+topic.id+'"]').count(),0,'never link back into the current topic');
      const key=type+':'+candidate.id,forward=await nativeHop(page,candidate.other,key);
      if(topic.id==='zhou'&&type==='person'){
        assert.equal(candidate.id,'person-033');assert.equal(forward.dataset,'qin-han');assert.equal(forward.cursor,0);assert.equal(forward.version,'2');assert.equal(forward.time,'bce-axis');
      }
      const backward=await nativeHop(page,topic.id,key);
      trips.push({type,id:candidate.id,forward,backward});
      await page.locator('#close').click();
    }
    for(const id of candidates.collisions){collisions.add(id);await openRecord(page,'country',id);assert.equal(await page.locator('#detail [data-cross-topic]').count(),0,id+' is dataset-scoped despite name/ID collision');await page.locator('#close').click();}
    await s.verify(topic.id+'/'+width);
    results.push({topic:topic.id,width,status:'pass',trips,collisions:candidates.collisions});console.log('PASS stage4',topic.id,width,JSON.stringify(trips));
  } finally {await s.context.close();}
}

function fixtureData(kind) {
  const dating={level:'certain',reason:'自动化合成定位；非历史资料，不推断月日。',reviewStatus:'partial',sources:[],alternatives:[]};
  const rulers=kind==='slots'?[1,2,3].map(n=>({id:'fixture-tenure-'+n,name:'合成同年任期'+n,role:'合成槽位',start:500,end:500,approx:false,dating:{...dating},chronology:{regnalStart:500,note:'仅年级定位；不设即位月日、不设继承关系。'},description:'合成同年任期'+n+'的独立测试说明。',biography:{summary:'合成同年任期'+n+'的独立测试生平；不是历史人物。',sources:[]},ministers:[],sources:[]})):[];
  const intervals={interval:[0,-4],wide:[490,430],clip:[520,-20],'cross-era':[2,-2],narrow:[0,-1]};
  const span=intervals[kind],event=span?{id:'fixture-event-'+kind,name:'合成区间事件 '+kind,year:span[0],endYear:span[1],kind:'改革',states:['fixture-state'],participants:[],participantCoverage:'仅合成事件，无历史人物关联。',description:'独立合成区间摘要 '+kind,dating:{...dating},sources:[],key:true,narrative:{background:'合成背景 '+kind+'；非历史资料。',process:'合成过程 '+kind+'；不借用既有事件文本。',result:'合成结果 '+kind,impact:'合成影响 '+kind,related:[]}}:null;
  return {datasetId:'stage4-fixture',version:'synthetic-test-only',title:'合成阶段四测试 '+kind,scopeNote:'仅用于离线自动化，不是历史资料。',metadata:{scopeNote:'合成定位测试',exportLegend:'合成年级坐标'},timeline:{topic:'stage4-fixture',start:510,end:-12,defaultEnd:-12,cursor:kind==='slots'?500:kind==='wide'?460:kind==='cross-era'?0:-2},periods:[{id:'fixture',name:'合成年级范围',start:510,end:-12,color:'#ddd'}],states:[{id:'fixture-state',name:'合成测试政权',region:'合成区域',color:'#355b6c',start:510,end:-12,approxStart:false,approxEnd:false,startLabel:'合成开始',endLabel:'合成结束',note:'独立测试政权说明；不是历史实体。',ending:'合成终止，仅检验布局。',dating:{...dating},interruptions:[],undated:[],rulers,sources:[]}],people:[],events:event?[event]:[],sources:[],combinations:[],peopleCoverage:{detailedRulerIntervals:rulers.length,ministerProfiles:0}};
}
async function configureFixture(page,{cursor,px=4,end=-12}={}) {
  await page.evaluate(({cursor,px,end})=>{appState.conditions.end=end;appState.conditions.category='all';appState.search.query='';appState.search.searchTarget=null;appState.layout.rowHeight=128;appState.layout.fitRows=false;appState.layout.mode='both';appState.layout.density='full';appState.layout.px=px;render();setCursor(cursor,true);vp.scrollTop=0;},{cursor,px,end});
}
async function intervalCase(width,kind) {
  const fixture=fixtureData(kind),s=await session(width,{fixture}),{page}=s,event=fixture.events[0];
  try {
    await page.goto(pageURL(catalog.find(topic=>topic.id==='zhou')));await ready(page);
    const px=kind==='narrow'?.8:4;await configureFixture(page,{cursor:kind==='narrow'?0:fixture.timeline.cursor,px});
    const marker=page.locator('button.intervalEvent[data-id="'+event.id+'"]');
    assert.equal(await marker.count(),1,'interval is an individually actionable marker');
    const geometry=await marker.evaluate(el=>({width:el.getBoundingClientRect().width,styleWidth:parseFloat(el.style.width),maxWidth:parseFloat(getComputedStyle(el).maxWidth),left:parseFloat(el.style.left),start:el.dataset.intervalStart,end:el.dataset.intervalEnd,clippedStart:el.classList.contains('intervalClippedStart'),clippedEnd:el.classList.contains('intervalClippedEnd'),title:el.title}));
    const clippedStart=Math.min(fixture.timeline.start,event.year),clippedEnd=Math.max(fixture.timeline.end,event.endYear),expected=(clippedStart-clippedEnd+1)*px;
    assert.equal(geometry.styleWidth,expected);assert(Math.abs(geometry.width-expected)<1,'CSS does not override inclusive interval width');assert.equal(geometry.maxWidth,expected,'max-width is not the legacy 210px label cap');
    assert.equal(geometry.start,String(event.year));assert.equal(geometry.end,String(event.endYear));assert.equal(geometry.left,(fixture.timeline.start-clippedStart)*px);
    if(kind==='wide'){assert(expected>210);assert(geometry.width>210);}
    if(kind==='clip'){assert.equal(geometry.clippedStart,true);assert.equal(geometry.clippedEnd,true);assert.match(geometry.title,/前520年/);assert.match(geometry.title,/公元21年/);}
    if(kind==='interval'||kind==='cross-era'){
      assert.equal(expected,20,'inclusive five-year span, not the four-year endpoint difference');
      const reference=kind==='interval'?-2:0;
      await page.locator('#timeSliceToggle').click();
      const item=page.locator('#timeSlice [data-time-slice-open="event:'+event.id+'"]');
      assert.equal(await item.count(),1,'an interval is listed in its middle year, not just start');
      await item.click();await page.locator('#detail').waitFor();
      assert.equal(await page.evaluate(()=>navigation.key),'event:'+event.id);
      assert.equal(await page.evaluate(()=>appState.conditions.cursor),reference,'board/detail opening preserves the in-interval reference year');
      assert.equal(await page.locator('#detail .detailTitle').innerText(),event.name);
      assert.match(await page.locator('#detail .eventStory').innerText(),new RegExp('合成背景 '+kind));
      assert.match(await page.locator('#detailBody').innerText(),new RegExp('参考年 公元'+(1-reference)+'年'));
      await page.locator('#close').click();
      for(const endpoint of [event.year,event.endYear]){
        await page.evaluate(year=>setCursor(year,true),endpoint);
        assert.equal(await item.count(),1,'both closed endpoints are in the same-year board');
        await item.click();assert.equal(await page.evaluate(()=>appState.conditions.cursor),endpoint);await page.locator('#close').click();
      }
    }
    assert.deepEqual(await page.evaluate(()=>({title:D.title,events:D.events})),{title:fixture.title,events:fixture.events},'presentation never rewrites the synthetic authoring dates/narrative');
    await s.verify('fixture-'+kind+'/'+width);results.push({fixture:kind,width,status:'pass',geometry});console.log('PASS stage4 fixture',kind,width);
  } finally {await s.context.close();}
}
async function slotCase(width) {
  const fixture=fixtureData('slots'),s=await session(width,{fixture}),{page}=s;
  try {
    await page.goto(pageURL(catalog.find(topic=>topic.id==='zhou')));await ready(page);await configureFixture(page,{cursor:500});
    const slots=page.locator('button.ruler.subyearSlot');assert.equal(await slots.count(),3);
    const geometry=await slots.evaluateAll(nodes=>nodes.map(el=>({id:el.dataset.id,order:Number(el.dataset.slotOrder),count:Number(el.dataset.slotCount),anchor:Number(el.dataset.anchor),left:parseFloat(el.style.left),width:el.getBoundingClientRect().width,title:el.title,aria:el.getAttribute('aria-label')})));
    assert.deepEqual(geometry.map(slot=>slot.order),[1,2,3]);assert(geometry.every(slot=>slot.count===3&&slot.anchor===40&&slot.width>=14));
    assert.equal(new Set(geometry.map(slot=>slot.anchor)).size,1,'all controls retain the identical BCE500 historical anchor');
    for(let i=1;i<geometry.length;i++)assert(geometry[i].left>=geometry[i-1].left+geometry[i-1].width,'independent visual micro-slots do not overlap');
    for(const record of geometry){assert.match(record.title,/前500年/);assert.match(record.title,new RegExp('同年展示次序 '+record.order+'/3'));assert.match(record.aria,/未推定年内月日或继承关系/);}
    async function tooltip(slot,record){
      const tip=page.locator('#tenure-slot-tooltip');await tip.waitFor();assert.equal(await tip.getAttribute('role'),'tooltip');assert.equal(await tip.innerText(),record.title);assert.match(await slot.getAttribute('aria-describedby'),/tenure-slot-tooltip/);
      const box=await tip.boundingBox();assert(box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=901,'tooltip escapes clipped row but remains within viewport');
    }
    for(const record of geometry){
      const slot=page.locator('button.subyearSlot[data-id="'+record.id+'"]');
      // Let native scrolling settle before beginning the hover interaction;
      // tooltips deliberately dismiss on scroll, just like a real pointer move.
      await slot.scrollIntoViewIfNeeded();
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await slot.hover();await tooltip(slot,record);
      await slot.click();await page.locator('#detail').waitFor();assert.equal(await page.evaluate(()=>navigation.key),'ruler:'+record.id);assert.equal(await page.locator('#detail .detailTitle').innerText(),'合成同年任期'+record.order);assert.match(await page.locator('#detail .datebadge').innerText(),/^前500年$/);await page.locator('#close').click();
      await page.locator('#search').focus();await slot.focus();await tooltip(slot,record);await page.keyboard.press('Escape');assert.equal(await page.locator('#tenure-slot-tooltip').count(),0);
      await page.locator('#search').focus();await slot.focus();await tooltip(slot,record);
      await page.keyboard.press(record.order%2?'Enter':'Space');await page.locator('#detail').waitFor();assert.equal(await page.evaluate(()=>navigation.key),'ruler:'+record.id);assert.equal(await page.evaluate(()=>appState.conditions.cursor),500);await page.locator('#close').click();
    }
    assert.deepEqual(await page.evaluate(()=>D.states[0].rulers),fixture.states[0].rulers,'micro-slots never invent fractional/year/month/day dates or change source order');
    await s.verify('fixture-slots/'+width);results.push({fixture:'slots',width,status:'pass',geometry});console.log('PASS stage4 fixture slots',width);
  } finally {await s.context.close();}
}
try {
  for(const width of widths)for(const topic of catalog)await crossTopicCase(width,topic);
  assert.deepEqual([...collisions].sort(),['later-liang','wu-zhou'],'both actual known collisions exercised');
  for(const width of widths){for(const kind of ['interval','cross-era','wide','clip','narrow'])await intervalCase(width,kind);await slotCase(width);}
  console.log(JSON.stringify({suite:'stage4',browser:browser.version(),offline:true,widths,cases:results},null,2));
  console.log('PASS stage4: 22 real topic/width cases + 12 self-contained synthetic fixture cases');
} finally {await browser.close();}
