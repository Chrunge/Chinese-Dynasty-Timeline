// Real installed Chrome/CDP acceptance. No server, dependencies or historical-source requests.
// node tests/browser-presentation.mjs [https://chrunge.github.io/Chinese-Dynasty-Timeline/]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {catalog} from '../lib/production.mjs';
const rowCounts={'xia-shang':5,zhou:12,'qin-han':4,'three-kingdoms':5,'wei-jin-nan-bei':5,'sui-tang':2,'five-dynasties':1,'liao-jin-song':4,yuan:4,ming:2,qing:2};
const defaultYears={'xia-shang':1600,zhou:770,'qin-han':140,'three-kingdoms':-228,'wei-jin-nan-bei':-382,'sui-tang':-617,'five-dynasties':-922,'liao-jin-song':-959,yuan:-1270,ming:-1367,qing:-1643};
const additional=new Set(['wei-jin-nan-bei','sui-tang','liao-jin-song','ming','xia-shang','five-dynasties','yuan','qing']);
const base=process.argv[2]||pathToFileURL(path.resolve('dist')+path.sep).href,live=base.startsWith('https:'),tag=live?'display-live':'display-local';
const out=path.resolve('.validation'),profile=path.join(out,'chrome-display-'+Date.now());fs.mkdirSync(profile,{recursive:true});
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:'inherit'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));let ws,session,seq=0,page='',pending=new Map(),errors=[],networkFailures=[],results=[],version;
const send=(method,params={},sid=session)=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},30000);pending.set(id,{resolve:r=>{clearTimeout(timer);resolve(r);},reject:e=>{clearTimeout(timer);reject(e);}});ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text+': '+r.exceptionDetails.exception?.description);return r.result.value;};
const check=(b,msg)=>{if(!b)throw Error(page+': '+msg);};
async function click(selector){const point=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});await wait(80);}
async function screenshot(name){const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,tag+'-'+name+'.png'),Buffer.from(r.data,'base64'));}
try{
 const active=path.join(profile,'DevToolsActivePort');for(let i=0;i<150&&!fs.existsSync(active);i++)await wait(100);check(fs.existsSync(active),'Chrome did not start');
 const [port,endpoint]=fs.readFileSync(active,'utf8').trim().split(/\r?\n/);ws=new WebSocket(`ws://127.0.0.1:${port}${endpoint}`);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 ws.onmessage=event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p?.reject(Error(JSON.stringify(m.error)));else p?.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push({page,details:m.params.exceptionDetails});else if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push({page,args:m.params.args});else if(m.method==='Network.loadingFailed')networkFailures.push({page,...m.params});};
 version=await send('Browser.getVersion',{},null);const target=await send('Target.createTarget',{url:'about:blank'},null);session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
 for(const domain of ['Page','Runtime','Network'])await send(domain+'.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
  if(!live)await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:'localStorage.clear();sessionStorage.clear();'});
 for(const {id,page:file} of catalog)for(const width of [1200,390]){
  page=id+'-'+width;await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});await send('Page.navigate',{url:new URL(file,base).href});let ready=false;
  for(let i=0;i<150;i++){try{ready=await evaluate(`document.readyState==='complete'&&typeof appState!=='undefined'&&document.querySelectorAll('#chart .stateRow').length>0`);}catch{}if(ready)break;await wait(100);}check(ready,'not initialized');await wait(100);
  const info=await evaluate(`({id:D.datasetId||'zhou',url:location.href,rows:document.querySelectorAll('#chart .stateRow').length,groups:document.querySelectorAll('.groupedRow').length,bars:document.querySelectorAll('#chart .ruler').length,segments:[...document.querySelectorAll('.politySegment')].map(e=>({id:e.dataset.id,text:e.textContent,top:e.style.top})),overflow:document.documentElement.scrollWidth>innerWidth+1})`);
  check(info.id===id&&info.rows===rowCounts[id]&&info.bars>0,'wrong timeline '+JSON.stringify(info));check(!info.overflow,'page horizontal overflow');
   info.defaults=await evaluate(`({year:appState.conditions.cursor,selected:[...appState.conditions.selected],members:appState.session.visibleRows.map(r=>r.members.map(s=>s.id)),count:document.querySelector('#filterCount').textContent,left:vp.scrollLeft,expectedLeft:Math.max(0,Math.min(vp.scrollWidth-vp.clientWidth,x(appState.conditions.cursor)-(vp.clientWidth-labelWidth())/2))})`);
   check(info.defaults.year===defaultYears[id],'wrong highlight year '+JSON.stringify(info.defaults));check(Math.abs(info.defaults.left-info.defaults.expectedLeft)<2,'default viewport not centered/clamped');
   check(info.defaults.count.includes(info.defaults.selected.length+'/'+await evaluate('D.states.length')),'wrong entity count');
   if(id==='liao-jin-song')check(JSON.stringify(info.defaults.members)===JSON.stringify([['northern-song','southern-song'],['liao'],['jin-jurchen'],['western-xia']]),'Song is not first');
   if(id==='sui-tang')check(JSON.stringify(info.defaults.members)===JSON.stringify([['sui'],['tang','wu-zhou']]),'Sui/Tang/Wu Zhou wrong lanes');
  if(id==='qin-han'){check(info.groups===1&&info.segments.length===5,'missing succession segments');check(new Set(info.segments.map(s=>s.top)).size>1,'overlapping polities flattened');const bounds=await evaluate(`(()=>{const parent=document.querySelector('.groupedRow .stateLabel').getBoundingClientRect();return {parent:{top:parent.top,bottom:parent.bottom,height:parent.height},labels:[...document.querySelectorAll('.groupedRow .stateName')].map(e=>{const b=e.getBoundingClientRect();return {text:e.textContent,top:b.top,bottom:b.bottom};})};})()`);check(bounds.labels.every(b=>b.top>=bounds.parent.top-1&&b.bottom<=bounds.parent.bottom+1),'group country labels clipped '+JSON.stringify(bounds));}
  {info.groupBounds=await evaluate(`([...document.querySelectorAll('.stateRow .stateLabel')].map(parent=>{const p=parent.getBoundingClientRect();return [...parent.querySelectorAll('.stateName')].map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,inside:r.top>=p.top-1&&r.bottom<=p.bottom+1};});})).flat()`);check(info.groupBounds.every(b=>b.inside),'group labels clipped '+JSON.stringify(info.groupBounds));}
   await evaluate(`document.querySelector('#viewport').scrollIntoView({block:'center'})`);await screenshot(page+'-timeline');
  // P0 disclosure keeps existing controls behind Advanced. Use the real UI,
   // while remaining compatible with earlier deployed pages without this panel.
   if(await evaluate(`!!document.querySelector('#onboarding:not([hidden])')`))await click('#onboardingSkip');
   if(await evaluate(`document.querySelector('#advancedSettings')?.hidden===true`))await click('#advancedToggle');
   // Stage A uses the actual modal, native checkboxes and real footer controls.
   await click('#filter');
   info.selection=await evaluate(`({title:document.querySelector('#filtersTitle').textContent,text:document.querySelector('#filters').textContent,checks:[...document.querySelectorAll('#stateChecks input')].map(c=>({id:c.value,checked:c.checked}))})`);
   check(info.selection.title.includes('选择政权')&&info.selection.text.includes('主要（默认）')&&info.selection.text.includes('自定义')&&info.selection.text.includes('已显示'),'polity picker contract missing');
   await click('#allStates');check(await evaluate(`[...document.querySelectorAll('#stateChecks input')].every(c=>c.checked)`),'all preset did not select every polity');
   await click('#closeFilters');check(await evaluate(`JSON.stringify([...appState.conditions.selected])===${JSON.stringify(JSON.stringify(info.defaults.selected))}`),'cancelled picker changed selection');
   await click('#filter');
   await evaluate(`(()=>{const b=[...document.querySelectorAll('#filters button')].find(b=>b.textContent.trim()==='主要（默认）');if(!b)throw Error('missing core preset');b.setAttribute('data-phase-a-core','true');})()`);await click('[data-phase-a-core]');
   check(await evaluate(`(()=>{const core=new Set(Zhou.Presentation.topic(D).coreIds);return [...document.querySelectorAll('#stateChecks input')].every(c=>c.checked===core.has(c.value));})()`),'core preset mismatch');
   await evaluate(`(()=>{const b=[...document.querySelectorAll('#filters button')].find(b=>b.textContent.trim()==='自定义');if(!b)throw Error('missing custom preset');b.setAttribute('data-phase-a-custom','true');})()`);await click('[data-phase-a-custom]');
   const custom=await evaluate(`(()=>{const core=new Set(Zhou.Presentation.topic(D).coreIds),checks=[...document.querySelectorAll('#stateChecks input')],c=checks.find(c=>!core.has(c.value))||checks.at(-1);c.click();return {id:c.value,checked:c.checked};})()`);
   await click('#applyFilters');check(await evaluate(`appState.conditions.selected.has(${JSON.stringify(custom.id)})===${custom.checked}`),'custom check was not applied');
   await click('#filter');await click('[data-phase-a-core]');await click('#applyFilters');
   const minor=await evaluate(`D.states.length-Zhou.Presentation.topic(D).coreIds.length`);
   if(minor){
    info.disclosure=await evaluate(`(()=>{const find=()=>[...document.querySelectorAll('#chart button')].find(b=>/展开其余|收起.*割据/.test(b.textContent)),b=find();if(!b)throw Error('missing minor disclosure');const before={left:vp.scrollLeft,year:appState.conditions.cursor},label=b.textContent;b.click();const expanded=appState.session.visibleStates.length,expandedLabel=find()?.textContent;find().click();return {before,label,expanded,expandedLabel,collapsed:appState.session.visibleStates.length,left:vp.scrollLeft,year:appState.conditions.cursor};})()`);
    check(info.disclosure.label.includes(String(minor))&&info.disclosure.expanded===await evaluate('D.states.length')&&info.disclosure.collapsed===info.defaults.selected.length,'minor disclosure counts mismatch '+JSON.stringify(info.disclosure));
    check(info.disclosure.left===info.disclosure.before.left&&info.disclosure.year===info.disclosure.before.year,'disclosure reset viewport or cursor');
   }
   await evaluate(`document.querySelector('#viewport').scrollIntoView({block:'center'})`);await screenshot(page+'-core');
   if(id==='sui-tang'){
    info.wuZhou=await evaluate(`(()=>{const b=document.querySelector('[data-id="st-tenure-wuzhou-wuzetian"]'),row=b.closest('.stateRow');return {members:appState.session.visibleRows.find(r=>r.key===row.dataset.row).members.map(s=>s.id),className:b.className,border:getComputedStyle(b).borderColor,title:b.title};})()`);
    check(info.wuZhou.className.includes('wuZhouBar')&&info.wuZhou.members.includes('tang')&&info.wuZhou.title.includes('武周 · 武则天'),'Wu Zhou highlight or original row identity missing');
    await evaluate('setCursor(-699,true)');await screenshot(page+'-wu-zhou');await click('[data-id="st-tenure-wuzhou-wuzetian"]');
    check(await evaluate(`navigation.key==='ruler:st-tenure-wuzhou-wuzetian'&&/690|天授/.test(document.querySelector('#detailBody').textContent)&&/705|神龙/.test(document.querySelector('#detailBody').textContent)`),'Wu Zhou historical detail lost');await click('#close');
   }
   // Audit every row after checking defaults; large succession groups may have
   // an unchanged minimum height, so minor rows also exercise height expansion.
   await evaluate('appState.conditions.selected=new Set(D.states.map(s=>s.id));render()');
   // Increasing row height spends spare space on events before clustering.
   // Audit real CSS rectangles: opaque-DOM tests cannot detect text overflow.
   info.events=await evaluate(`(()=>{
    appState.layout.px=.8;appState.layout.density='full';appState.layout.mode='both';appState.layout.fitRows=false;appState.layout.rowHeights={};
    const inspect=()=>[...document.querySelectorAll('#chart .stateRow')].map(row=>{
     const buttons=[...row.querySelectorAll('[data-event-lane]')],bars=[...row.querySelectorAll('.ruler')],rect=e=>e.getBoundingClientRect(),inside=rect(row);
     const collisions=[];
     const overlaps=(a,b)=>a.left<b.right-.5&&a.right>b.left+.5&&a.top<b.bottom-.5&&a.bottom>b.top+.5;
     for(let i=0;i<buttons.length;i++){
      const a=rect(buttons[i]);
      if(a.top<inside.top-.5||a.bottom>inside.bottom+.5)collisions.push('row bounds '+buttons[i].dataset.id);
      for(const bar of bars)if(overlaps(a,rect(bar)))collisions.push('ruler '+buttons[i].dataset.id+'/'+bar.dataset.id);
      for(let j=i+1;j<buttons.length;j++)if(overlaps(a,rect(buttons[j])))collisions.push('event '+buttons[i].dataset.id+'/'+buttons[j].dataset.id);
     }
     const members=appState.session.visibleRows.find(r=>r.key===row.dataset.row).members.map(s=>s.id);
     const expected=historyService.eventsInRange({from:timelineBounds.start,to:appState.conditions.end,states:members}).map(e=>e.id).sort();
     const actual=buttons.flatMap(b=>b.dataset.id.split(',')).sort();
     return {key:row.dataset.row,markers:buttons.length,singles:buttons.filter(b=>b.dataset.action==='event').length,lanes:[...new Set(buttons.map(b=>b.dataset.eventLane))],idsMatch:JSON.stringify(expected)===JSON.stringify(actual),collisions};
    });
    const input=document.querySelector('#rowHeight');input.value='36';input.dispatchEvent(new Event('input',{bubbles:true}));const compact=inspect();
    input.value='160';input.dispatchEvent(new Event('input',{bubbles:true}));const expanded=inspect();
    return {compact,expanded};
   })()`);
   check([...info.events.compact,...info.events.expanded].every(r=>r.idsMatch&&!r.collisions.length),'events missing or overlapping '+JSON.stringify(info.events));
   check(info.events.expanded.some((r,i)=>r.markers>info.events.compact[i].markers&&r.lanes.length>1),'extra row height did not expand events');
   await screenshot(page+'-expanded-events');
   // Actual rulers and names are independently actionable; tooltips retain full titles.
  info.labels=await evaluate(`(()=>{appState.layout.px=6;appState.layout.density='auto';appState.layout.rowHeight=128;appState.layout.fitRows=false;render();return {years:document.querySelectorAll('.rulerYears').length,visible:[...document.querySelectorAll('.rulerName')].map(e=>e.textContent),accessible:[...document.querySelectorAll('.ruler')].every(e=>e.getAttribute('aria-label')===e.title&&e.title.length>10)};})()`);
  check(info.labels.years===0&&info.labels.accessible,'name/year hierarchy or accessible full title');
  if(id!=='zhou')check(info.labels.visible.every(s=>!/[（(／/]|基础期|执政|任职/.test(s)),'long role leaked into bar');
  info.zoom=await evaluate(`(()=>{appState.layout.px=24;render();return {years:document.querySelectorAll('.rulerYears').length,visible:[...document.querySelectorAll('.rulerName')].map(e=>e.textContent)};})()`);check(info.zoom.years>0,'years missing after zoom');
  const ruler=additional.has(id)?await evaluate(`document.querySelector('#chart [data-action="ruler"]').dataset.id`):id==='qin-han'?'qh-tenure-han-wudi':id==='three-kingdoms'?'tk-tenure-liubei-hanzhong':'zhou-r1';
  await click('#chart [data-action="ruler"][data-id="'+ruler+'"]');
  info.detail=await evaluate(`({key:navigation.key,open:document.querySelector('#detail').open,text:document.querySelector('#detailBody').textContent})`);check(info.detail.open&&info.detail.key==='ruler:'+ruler&&info.detail.text.includes('简要生平'),'ruler identity/biography missing');await screenshot(page+'-detail');await click('#close');
  if(id!=='zhou'){
   const query=additional.has(id)?await evaluate('D.tenures[0].display.personalName'):id==='qin-han'?'刘邦':'刘备';await evaluate(`document.querySelector('#search').value=${JSON.stringify(query)};document.querySelector('#search').dispatchEvent(new Event('input',{bubbles:true}))`);
   info.search=await evaluate(`searchMatches().filter(h=>h.entry.type==='ruler').map(h=>({key:h.entry.key,state:h.entry.states[0]}))`);check(info.search.length>0,'search absent');if(id==='three-kingdoms')check(info.search.some(r=>r.key==='ruler:tk-tenure-liubei-hanzhong')&&info.search.some(r=>r.key==='ruler:tk-tenure-liu-bei'),'same person tenures merged');
   await click('#clearSearch');
  }
  if(id==='qin-han'){
   await click('#chart [data-action="pin"][data-id="western-han"]');
   info.pin=await evaluate(`({first:appState.session.visibleRows[0].key,pins:[...appState.layout.pinned]})`);check(info.pin.first==='group:qin-han-succession'&&info.pin.pins.join(',')==='western-han','pin lost polity identity');
   await click('#filter');await evaluate(`document.querySelectorAll('#stateChecks input').forEach(e=>e.checked=['western-han','eastern-han','western-chu'].includes(e.value))`);await click('#applyFilters');
   info.filtered=await evaluate(`({ids:appState.session.visibleStates.map(s=>s.id),rows:appState.session.visibleRows.length,segments:[...document.querySelectorAll('.politySegment')].map(e=>e.dataset.id)})`);check(info.filtered.rows===2&&info.filtered.segments.length===2&&!info.filtered.ids.includes('qin'),'filter expanded group unexpectedly');
   await evaluate(`appState.layout.pinned.clear();appState.layout.stateOrder=['western-chu','eastern-han','western-han',...D.states.map(s=>s.id).filter(id=>!['western-chu','eastern-han','western-han'].includes(id))];render()`);check(await evaluate(`appState.session.visibleRows[0].members[0].id==='western-chu'`),'sorting not respected');
  }
  const year=additional.has(id)?await evaluate('timelineBounds.cursor'):id==='zhou'?450:id==='qin-han'?0:-219;await evaluate(`setCursor(${year},true)`);info.compare=await evaluate(`({year:appState.conditions.cursor,cards:[...document.querySelectorAll('#compare .comparecard')].map(e=>({id:e.dataset.id,text:e.textContent}))})`);check(info.compare.cards.length>0,'same year compare absent');
  if(id==='qin-han')check(info.compare.cards.some(c=>c.id==='western-han'&&c.text.includes('汉平帝')),'group identity leaked into comparison');
  if(id==='three-kingdoms')check(!info.compare.cards.find(c=>c.id==='eastern-han')?.text.includes('曹操'),'context tenure impersonates Han emperor');
  // Real export UI: structured JSON snapshot and image/PDF Blob construction.
  const exportYears=await evaluate('({from:Zhou.Time.decode(timelineBounds.start),to:Zhou.Time.decode(timelineBounds.end)})');
   await click('#exportCompare');await evaluate(`document.querySelector('#exportFromEra').value=${JSON.stringify(exportYears.from.era)};document.querySelector('#exportFrom').value=${exportYears.from.year};document.querySelector('#exportToEra').value=${JSON.stringify(exportYears.to.era)};document.querySelector('#exportTo').value=${exportYears.to.year};document.querySelector('#exportFormat').value='json'`);await click('#createExport');
  info.export=await evaluate(`(async()=>{const a=document.querySelector('#exportDownload a');if(!a)throw Error(document.querySelector('#exportStatus').textContent);const m=await(await fetch(a.href)).json();return {stateIds:m.states.map(s=>s.id),tenureIds:m.tenures.map(t=>t.id),names:m.states.flatMap(s=>s.rulers.map(r=>r.name)),sources:m.sources.length};})()`);check(info.export.sources>0&&info.export.stateIds.every(s=>!s.startsWith('group:')),'export identity corrupt');
  if(['three-kingdoms','ming','xia-shang','qing'].includes(id)){if(id==='three-kingdoms')check(info.export.tenureIds.includes('tk-tenure-liubei-hanzhong'),'context identity missing from JSON');await evaluate(`document.querySelector('#exportFormat').value='pdf'`);await click('#createExport');for(let i=0;i<150;i++){if(await evaluate(`!!document.querySelector('#exportDownload a')`))break;await wait(100);}info.pdf=await evaluate(`(async()=>{const a=document.querySelector('#exportDownload a');if(!a)throw Error(document.querySelector('#exportStatus').textContent);const b=await(await fetch(a.href)).blob();return {size:b.size,type:b.type,prefix:(await b.text()).slice(0,8)};})()`);check(info.pdf.prefix.startsWith('%PDF-')&&info.pdf.size>1000,'PDF generation failed');}
  await click('#closeExport');await evaluate(`saveReadingPosition()`);info.reading=await evaluate(`(()=>{const scoped=Zhou.createStorage(()=>localStorage,D.datasetId||''),saved=scoped.read('zhou-reading-v4',null),visits=scoped.read('zhou-visits-v4',[]);setCursor(timelineBounds.start);const restored=restoreSavedReading(saved);return {stored:!!saved,restored,cursor:appState.conditions.cursor,states:[...appState.conditions.selected],visits:visits.map(v=>v.key)};})()`);check(info.reading.stored&&info.reading.restored&&info.reading.cursor===year&&info.reading.visits.includes('ruler:'+ruler),'reading failed to restore polity/tenure identity');
  // Round-trip share codec resolves original polity IDs, never row keys.
  info.share=await evaluate(`(()=>{const codec=Zhou.createViewLinkCodec(D,searchService),hash=codec.encode({view:captureDetailFrame().view,pinned:[...appState.layout.pinned],order:appState.layout.stateOrder});return {hash,parsed:codec.parse(hash)};})()`);check(info.share.parsed&&!info.share.hash.includes('group%3A'),'share no longer round trips');
  results.push(info);console.log('PASS',page,JSON.stringify({rows:info.rows,groups:info.groups,bars:info.bars,years:info.zoom.years,search:info.search?.length,pdf:info.pdf?.size}));
 }
 check(errors.length===0,'page JS errors '+JSON.stringify(errors));check(networkFailures.length===0,'network failures '+JSON.stringify(networkFailures));
 fs.writeFileSync(path.join(out,tag+'-results.json'),JSON.stringify({checkedAt:new Date().toISOString(),base,browser:version,results,errors,networkFailures},null,2));console.log('PASS all '+results.length+' real Chrome cases');
}catch(error){fs.writeFileSync(path.join(out,tag+'-failure.json'),JSON.stringify({error:String(error),results,errors,networkFailures},null,2));console.error(error);process.exitCode=1;}finally{if(ws?.readyState===1){try{await send('Browser.close',{},null);}catch{}ws.close();}browser.kill();}
