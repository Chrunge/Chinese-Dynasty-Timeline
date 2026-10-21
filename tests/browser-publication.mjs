// Development-only offline acceptance for build-time publication and actual UI outputs.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {catalog,compileProduction} from '../lib/production.mjs';
const out=resolve('.validation/publication');mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{channel:'chrome'})});
const results=[];
try{
 for(const width of [375,1200])for(const topic of catalog){
  const data=compileProduction(JSON.parse(readFileSync(resolve('data',topic.file),'utf8')),topic.id);
  const url=pathToFileURL(resolve('dist',topic.page)).href;
  const staticContext=await browser.newContext({viewport:{width,height:900},javaScriptEnabled:false,offline:true});
  try{
   const page=await staticContext.newPage();await page.goto(url);
   assert.equal(await page.title(),data.title);
   assert.equal(await page.locator('meta[property="og:title"]').getAttribute('content'),data.title);
   assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://chrunge.github.io/Zhou-Dynasty-Timeline/'+topic.page);
   assert.equal(await page.locator('[data-static-tenure]').count(),data.states.reduce((n,s)=>n+s.rulers.length,0));
   assert.equal(await page.locator('[data-static-undated]').count(),data.states.reduce((n,s)=>n+(s.undated?.length||0),0));
   assert.equal(await page.locator('.noScriptReading').isVisible(),true);
   assert.equal(await page.locator('.seal').innerText(),topic.id==='zhou'?'周':'史');
   assert.equal(await page.locator('nav[aria-label="历史时期无脚本导航"] a').count(),catalog.length);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   assert.equal(await page.locator('.workspace').isVisible(),false);
   assert.match(await page.locator('.noScriptReading').innerText(),/定＝较确定，推＝推定，异＝存在异说/);
   assert.match(await page.locator('.noScriptReading').innerText(),/不推造年份/);
   if(topic.id!=='zhou')assert.match(await page.locator('.noScriptReading').innerText(),/未联网核验史实/);
   await page.screenshot({path:resolve(out,topic.id+'-'+width+'-noscript.png')});
   results.push({topic:topic.id,width,mode:'noscript',status:'pass'});
  }finally{await staticContext.close();}
  const context=await browser.newContext({viewport:{width,height:900},offline:true,reducedMotion:'reduce'});
  try{
   const page=await context.newPage(),errors=[],network=[];
   page.on('pageerror',error=>errors.push(error.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
   await page.goto(url);await page.locator('.stateRow').first().waitFor();await page.keyboard.press('Escape');
   assert.equal(await page.locator('.noScriptReading').count(),0,'static fallback is not duplicate visible content with JS');
   await page.locator('#advancedToggle').click();await page.locator('#shareView').click();
   const shareLink=await page.locator('#shareLink').inputValue(),text=await page.locator('#shareText').inputValue();
   assert.ok(text.startsWith(data.title+'｜所选政权组合：'));
   assert.ok(text.endsWith('\n'+shareLink));assert.match(text,/视窗范围：.+参考年份：/);
   await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied for acceptance');}}}));
   await page.locator('#copyShareText').click();
   assert.deepEqual(await page.locator('#shareText').evaluate(el=>({start:el.selectionStart,end:el.selectionEnd,active:document.activeElement===el})),{start:0,end:text.length,active:true});
   await page.keyboard.press('Escape');await page.keyboard.press('Escape');
   // Observe the real browser Blob rather than a separately reconstructed model.
   await page.evaluate(()=>{const original=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{window.__publicationBlob=blob;return original(blob);};});
   await page.keyboard.press('Alt+e');await page.locator('#exportFormat').selectOption('json');await page.locator('#createExport').click();
   await page.locator('#exportDownload a').waitFor();
   const snapshot=await page.evaluate(async()=>JSON.parse(await window.__publicationBlob.text()));
   assert.equal(snapshot.schemaVersion,1);assert.equal(snapshot.exportContext.reimportableAsAtlas,false);
   assert.equal(snapshot.exportContext.records.pixelClipping,false);assert.ok(snapshot.states.length);
   const exact=await page.evaluate(snapshot=>historyService.comparison({states:snapshot.exportContext.filters.stateIds,from:snapshot.from,to:snapshot.to,cursor:snapshot.cursor,category:snapshot.category}),snapshot);
   const {exportContext,...originalFields}=snapshot;assert.deepEqual(originalFields,exact,'all v1 snapshot fields unchanged by publication wrapper');
   assert.match(await page.locator('#exportStatus').innerText(),/不是 Atlas/);await page.keyboard.press('Escape');
   const expected=await page.evaluate(()=>{const event=D.events[0];showEvent(event.id);return {id:event.id,name:event.name,year:Zhou.Time.format(appState.conditions.cursor)};});
   const correction=page.locator('#detail [data-correction-link]'),href=new URL(await correction.getAttribute('href'));
   assert.equal(href.origin,'https://github.com');assert.equal(href.pathname,'/Chrunge/Zhou-Dynasty-Timeline/issues/new');
   assert.equal(href.searchParams.get('record_id'),expected.id);assert.equal(href.searchParams.get('record_name'),expected.name);assert.equal(href.searchParams.get('reference_year'),expected.year);
   assert.equal(await correction.getAttribute('target'),'_blank');assert.match(await correction.getAttribute('rel'),/noopener/);
   await correction.focus();await page.keyboard.press('Escape');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   assert.deepEqual(errors,[]);assert.deepEqual(network,[],'opening feedback never submits or requests GitHub');
   results.push({topic:topic.id,width,mode:'interactive',status:'pass'});
   console.log('PASS publication',topic.id,width,'noscript + sharing + JSON + feedback');
  }finally{await context.close();}
 }
 writeFileSync(resolve(out,'results.json'),JSON.stringify({browser:browser.version(),offline:true,cases:results},null,2));
}finally{await browser.close();}
