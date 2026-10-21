// Development-only axe/Playwright; every release page remains dependency-free.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {catalog} from '../lib/production.mjs';
const require=createRequire(import.meta.url),axe=readFileSync(require.resolve('axe-core/axe.min.js'),'utf8'),out=resolve('.validation/p1');mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{channel:'chrome'})});
const results=[];
async function audit(page,label){await page.evaluate(axe);const report=await page.evaluate(async()=>{const result=await axe.run(document);return {profile:'axe-core default enabled rules (no rule overrides)',violations:result.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:result.incomplete.map(v=>({id:v.id,nodes:v.nodes.length}))};});writeFileSync(resolve(out,label+'-axe.json'),JSON.stringify(report,null,2));assert.deepEqual(report.violations.filter(v=>['serious','critical'].includes(v.impact)),[],label+' axe serious/critical');return report;}
async function keyTo(page,id){for(let i=0;i<180;i++){if(await page.evaluate(id=>document.activeElement?.id===id,id))return;await page.keyboard.press('Tab');}throw Error('Keyboard cannot reach '+id);}
async function timelineSemantics(page){
 const paths=await page.locator('#eventKindLegend path').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')));assert.equal(new Set(paths).size,5,'five non-color event icons');
 const target=await page.evaluate(()=>{const e=D.events.find(e=>e.key&&e.states.length>=3);appState.search.query='';appState.conditions.selected=new Set(e.states);appState.layout.pinned.clear();appState.layout.fitRows=true;appState.layout.mode='both';appState.layout.density='full';appState.session.activeEventId=null;appState.layout.px=4;render();setCursor(e.year,true);vp.scrollTop=0;const b=[...chart.querySelectorAll('[data-event-ids]')].find(b=>b.dataset.eventIds.split(',').includes(e.id));return {id:e.id,ids:b.dataset.eventIds,selected:[...appState.conditions.selected]};});
 const marker=page.locator('.semanticEvent[data-event-ids="'+target.ids+'"]');await marker.first().hover();const guide=page.locator('.eventRelation[data-event-id="'+target.id+'"]');assert.ok(await guide.locator('.eventRelationDot').count()>=2,'guide spans actual visible lanes');assert.equal(await guide.locator('.eventRelationStem').count(),1);assert.deepEqual(await page.evaluate(()=>[...appState.conditions.selected]),target.selected,'hover never reselects hidden polities');await page.locator('#timeSliceToggle').hover();assert.equal(await guide.count(),0,'hover guide cleans up');
 await marker.first().focus();assert.equal(await guide.count(),1,'keyboard focus has the same guide');await page.locator('#timeSliceToggle').focus();assert.equal(await guide.count(),0);
 const state=await page.evaluate(()=>{const s=D.states.find(s=>s.undated?.length&&s.start<=timelineBounds.start&&s.start>=appState.conditions.end);appState.conditions.selected=new Set([s.id]);appState.layout.fitRows=false;appState.layout.px=4;render();vp.scrollLeft=x(s.start);vp.scrollTop=0;return s.id;});
 await page.locator('[data-undated-state="'+state+'"]').click();await page.locator('#detail').waitFor();assert.equal(await page.evaluate(()=>document.activeElement.id),'undated-lineage');assert.ok(await page.locator('.undatedLineage li').count()>0);await audit(page,'zhou-'+(await page.viewportSize()).width+'-lineage');await page.keyboard.press('Escape');
 await page.evaluate(()=>{appState.layout.density='overview';appState.layout.rowHeight=36;render();});
 const entryRects=await page.locator('.stateRow').first().evaluate(row=>{const a=row.querySelector('.lifeStart').getBoundingClientRect(),b=row.querySelector('.undatedCapsule').getBoundingClientRect();return {end:a.bottom,start:b.top};});assert.ok(entryRects.start>=entryRects.end+1,'overview capsule does not cover the adopted polity start label');
}
try{for(const width of (process.env.P1_WIDTHS||'375,1200').split(',').map(Number))for(const topic of catalog.filter(t=>!process.env.P1_TOPIC||process.env.P1_TOPIC===t.id)){
 const context=await browser.newContext({viewport:{width,height:900},offline:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[],network=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
 try{
  await page.goto(pathToFileURL(resolve('dist',topic.page)).href);await page.locator('.stateRow').first().waitFor();await page.keyboard.press('Escape');
  const baseline=await audit(page,topic.id+'-'+width+'-home');
  await page.locator('#timeSliceToggle').click();await page.locator('#timeSlice').waitFor();assert.match(await page.locator('#timeSlice').innerText(),/当年|同年/);
  const expected=await page.evaluate(()=>historyService.compareYear(appState.conditions.cursor).length),cards=await page.locator('#timeSlice [data-slice-state]').count();assert.equal(cards,expected,'all-topic slice is independent of visible selection');
  await audit(page,topic.id+'-'+width+'-slice');await page.keyboard.press('Escape');assert.equal(await page.locator('#timeSlice').isVisible(),false);
  await page.locator('#advancedToggle').click();const last=page.locator('#advancedSettings button:visible').last();await last.focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('#advancedSettings')),true,'advanced focus boundary');await page.keyboard.press('Escape');assert.equal(await page.locator('#advancedSettings').isVisible(),false);
  // Actual keyboard-only chain: search -> detail -> sections -> Escape -> cursor -> export.
  await page.locator('#search').focus();const name=await page.evaluate(()=>D.events.find(e=>e.dating?.alternatives?.length)?.name||D.events[0].name);await page.keyboard.type(name);await page.keyboard.press('Enter');await page.locator('#detail').waitFor();
  for(const section of ['detail-dating','detail-sources']){const jump=page.locator('[data-detail-section="'+section+'"]');if(await jump.count()){await keyTo(page,await jump.getAttribute('id'));await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),section);}}
   const summary=page.locator('#detail .dateOpinions summary');if(await summary.count()){for(let i=0;i<120&&!await page.evaluate(()=>document.activeElement?.matches('#detail .dateOpinions summary'));i++)await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.matches('#detail .dateOpinions summary')),true);const open=await summary.evaluate(el=>el.parentElement.open);await page.keyboard.press('Enter');assert.equal(await summary.evaluate(el=>el.parentElement.open),!open);}
  await audit(page,topic.id+'-'+width+'-detail');
  await page.keyboard.press('Escape');await page.keyboard.press('Alt+y');assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('cursorHandle')),true);
  const year=await page.evaluate(()=>appState.conditions.cursor);await page.keyboard.press('ArrowLeft');assert.equal(await page.evaluate(()=>appState.conditions.cursor),Math.min(year+1,await page.evaluate(()=>timelineBounds.start)));await page.waitForTimeout(260);assert.match(await page.locator('#accessibilityStatus').innerText(),/参考年份/);
  await page.keyboard.press('Alt+e');await page.locator('#exportDialog').waitFor();await audit(page,topic.id+'-'+width+'-export');await page.keyboard.press('Escape');
  await page.locator('#clearSearch').click();await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
  const contrast=await page.evaluate(()=>{const A=Zhou.Accessibility;return [...document.querySelectorAll('.ruler,.politySegment,.event')].filter(el=>el.getClientRects().length&&el.textContent.trim()).map(el=>{const style=getComputedStyle(el),fg=A.parseColor(style.color),bg=A.parseColor(style.backgroundColor);return {id:el.dataset.id||el.className,ratio:fg&&bg&&bg[3]===1?A.contrast(fg,bg):null};}).filter(x=>x.ratio!==null&&x.ratio<4.5);});assert.deepEqual(contrast,[],'colored label AA');
  if(topic.id==='zhou')await timelineSemantics(page);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false);assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
  await page.screenshot({path:resolve(out,topic.id+'-'+width+'.png')});results.push({topic:topic.id,width,status:'pass',homeViolations:baseline.violations});console.log('PASS P1',topic.id,width);
 }catch(e){await page.screenshot({path:resolve(out,'FAIL-'+topic.id+'-'+width+'.png')}).catch(()=>{});throw e;}finally{await context.close();}
}writeFileSync(resolve(out,'results.json'),JSON.stringify({browser:browser.version(),offline:true,cases:results},null,2));}finally{await browser.close();}
