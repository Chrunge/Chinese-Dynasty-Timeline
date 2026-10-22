// Real offline entry paths. No controller calls replace clicks in this test.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {catalog} from '../lib/production.mjs';
const out=resolve('.validation/figures');mkdirSync(out,{recursive:true});
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:existsSync(chromium.executablePath())?{}:{channel:'chrome'})});
const results=[],layoutChecks=[];

async function checkGroupLabels(page,topic,width,scenario='default'){
 const problems=await page.locator('.groupedRow .stateLabel').evaluateAll(labels=>{
  const issues=[];
  for(const label of labels){
   const outer=label.getBoundingClientRect(),title=label.querySelector('.rowGroupTitle'),members=[...label.querySelectorAll('.memberLabel')];
   if(title.scrollHeight>title.clientHeight+1||title.getBoundingClientRect().top<outer.top-1)issues.push('clipped title: '+title.textContent);
   let bottom=title.getBoundingClientRect().bottom;
   for(const member of members){
    const rect=member.getBoundingClientRect(),name=member.querySelector('.stateName').getBoundingClientRect(),dates=member.querySelector('.memberDates').getBoundingClientRect();
    if(rect.top<bottom-1||rect.bottom>outer.bottom+1)issues.push('overlapping member: '+member.textContent);
    if(dates.top<name.bottom-1||dates.bottom>rect.bottom+1)issues.push('overlapping dates: '+member.textContent);
    bottom=rect.bottom;
   }
  }
  return issues;
 });
 assert.deepEqual(problems,[],topic+'/'+width+' group labels');
 layoutChecks.push({topic,width,scenario,status:'pass'});
}
try{
 for(const width of [390,1200])for(const topic of catalog){
  const context=await browser.newContext({viewport:{width,height:900},offline:true,reducedMotion:'reduce',hasTouch:width<680});
  const page=await context.newPage(),errors=[],remoteRequests=[];
  page.setDefaultTimeout(10000);
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/^https?:/.test(request.url()))remoteRequests.push(request.url());});
  try{
   await page.goto(pathToFileURL(resolve('dist',topic.page)).href);
   await page.locator('.stateRow').first().waitFor();
   await checkGroupLabels(page,topic.id,width);
   if(await page.locator('#onboarding').isVisible())await page.locator('#onboardingSkip').click();
   const trigger=page.locator('#figuresToggle'),gallery=page.locator('#figuresGallery');
   assert.equal(await gallery.isVisible(),false);
   assert.equal(await trigger.getAttribute('aria-expanded'),'false');
   await page.locator('#yearToggle').click();assert.equal(await page.locator('#yearEditor').isVisible(),true);
   await trigger.click();await gallery.waitFor({state:'visible'});
   assert.equal(await page.locator('#yearEditor').isVisible(),false);
   assert.equal(await trigger.getAttribute('aria-expanded'),'true');
   const pills=gallery.locator('[data-figures-person-id]'),allCount=await pills.count();
   assert(allCount>0);assert.equal(Number(await page.locator('#figuresCount').innerText()),allCount);
   await gallery.locator('[data-figures-action="filter-core"]').click();
   assert.equal(await gallery.locator('[data-figures-action="filter-core"]').getAttribute('aria-pressed'),'true');
   const core=await gallery.locator('[data-figures-person-id]').count();assert(core<=allCount);
   const coreIds=await gallery.locator('[data-figures-person-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.figuresPersonId).sort());
   assert.deepEqual(coreIds,await page.evaluate(()=>D.people.filter(p=>p.biographyPlan?.isCore26).map(p=>p.id).sort()));
   await gallery.locator('[data-figures-action="filter-all"]').click();assert.equal(await pills.count(),allCount);
   const person=pills.first(),id=await person.getAttribute('data-figures-person-id');
   const name=await page.evaluate(id=>D.people.find(p=>p.id===id).name,id);
   await person.click();await page.locator('#detail').waitFor({state:'visible'});
   assert.equal(await gallery.isVisible(),false);assert((await page.locator('#detailBody').innerText()).includes(name));
   assert.equal(await page.evaluate(()=>navigation.key),'person:'+id);
   assert.equal(await page.evaluate(()=>appState.session.figureHighlight?.id),id);
   await page.locator('#close').click();await page.locator('#detail').waitFor({state:'hidden'});
   await page.locator('#clearFigureHighlight').click();assert.equal(await page.locator('#figureHighlight').isVisible(),false);
   assert.equal(await page.evaluate(()=>appState.session.figureHighlight),null);
   await trigger.click();await gallery.locator('[data-figures-category]').first().click();
   assert.equal(await page.evaluate(()=>appState.session.figureHighlight?.kind),'category');
   await gallery.locator('[data-figures-action="clear"]').click();assert.equal(await page.evaluate(()=>appState.session.figureHighlight),null);
   const close=gallery.locator('[data-figures-action="close"]');await close.focus();await page.keyboard.press('Escape');
   assert.equal(await gallery.isVisible(),false);assert.equal(await trigger.getAttribute('aria-expanded'),'false');
   assert.equal(await page.evaluate(()=>document.activeElement.id),'figuresToggle');
   await page.locator('#advancedToggle').click();await page.locator('#themeMode').selectOption('dark');
   assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
   await page.locator('#themeMode').selectOption('light');await page.reload();await page.locator('.stateRow').first().waitFor();
   assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
   await page.locator('#filter').click();await page.locator('#allStates').click();await page.locator('#applyFilters').click();
   await checkGroupLabels(page,topic.id,width,'all');
   assert.deepEqual(errors,[]);assert.deepEqual(remoteRequests,[]);
   results.push({topic:topic.id,width,status:'pass',people:allCount,core});
   console.log('PASS figures',topic.id,width,'gallery -> person -> detail, clear/category, Escape, theme');
  }catch(error){
   await page.screenshot({path:resolve(out,topic.id+'-'+width+'-failure.png'),fullPage:true}).catch(()=>{});
   throw new Error(topic.id+'/'+width+': '+error.message,{cause:error});
  }finally{await context.close();}
 }
 for(const width of [320,375,680,681])for(const id of ['qin-han','five-dynasties','liao-jin-song']){
  const context=await browser.newContext({viewport:{width,height:900},offline:true,reducedMotion:'reduce'}),page=await context.newPage();
  try{
   await page.goto(pathToFileURL(resolve('dist',catalog.find(t=>t.id===id).page)).href);await page.locator('.stateRow').first().waitFor();
   await checkGroupLabels(page,id,width);
   if(width===375&&id!=='liao-jin-song'){
    if(await page.locator('#onboarding').isVisible())await page.locator('#onboardingSkip').click();
    await page.locator('#viewport').scrollIntoViewIfNeeded();
    await page.screenshot({path:resolve(out,id+'-375-labels.png')});
   }
  }finally{await context.close();}
 }
 writeFileSync(resolve(out,'results.json'),JSON.stringify({browser:browser.version(),offline:true,cases:results,layoutChecks},null,2)+'\n');
}finally{await browser.close();}
