// Development-only Playwright. Static release has no dependency on this package.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {catalog} from '../lib/production.mjs';
const out=resolve('.validation/p0');mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{channel:'chrome'})});
const results=[];
const geometry=page=>page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
async function noOverflow(page,label){const g=await geometry(page);assert.ok(g.scroll<=g.width+1&&g.body<=g.width+1,label+': '+JSON.stringify(g));}
async function keyboardGuide(page){
 for(let i=0;i<70;i++){await page.keyboard.press('Tab');if(await page.evaluate(()=>document.activeElement?.id==='onboardingNext'))break;}
 assert.equal(await page.evaluate(()=>document.activeElement?.id),'onboardingNext');
 for(let i=1;i<=3;i++){assert.match(await page.locator('#onboardingTitle').innerText(),new RegExp(i+' / 3'));await page.keyboard.press('Enter');}
 assert.equal(await page.locator('#onboarding').isVisible(),false);
}
async function pointer(page,type,events){const session=await page.context().newCDPSession(page);for(const event of events){await session.send('Input.dispatchTouchEvent',{type:event.type,touchPoints:event.points.map(([id,x,y])=>({id,x,y,radiusX:3,radiusY:3}))});if(event.type==='touchMove')await page.waitForTimeout(16);}await session.detach();}
async function touchDrag(page,x,y,dx,dy){const points=[];points.push({type:'touchStart',points:[[0,x,y]]});for(let i=1;i<=8;i++)points.push({type:'touchMove',points:[[0,x+dx*i/8,y+dy*i/8]]});points.push({type:'touchEnd',points:[]});await pointer(page,'touch',points);}
async function deepTouch(page){
 await page.locator('#viewport').scrollIntoViewIfNeeded();await page.evaluate(()=>{vp.scrollTop=0;vp.scrollLeft=600;setCursor(timelineBounds.start-(vp.scrollLeft+100)/appState.layout.px);});
 const area=await page.locator('#viewport').boundingBox(),x=area.x+area.width-45,y=area.y+100;
 const before=await page.evaluate(()=>vp.scrollLeft);
 await touchDrag(page,x,y,-90,0);const released=await page.evaluate(()=>vp.scrollLeft);await page.waitForTimeout(160);const glided=await page.evaluate(()=>vp.scrollLeft);
 assert.ok(released>before+30,'single finger pan');assert.ok(glided>released,'inertia continues after release: '+JSON.stringify({before,released,glided}));assert.equal(await page.locator('#detail').isVisible(),false,'drag must not click a glyph');
 // New pointer cancels existing inertia; a cancelled pointer cannot keep a stale frame.
 const touchSession=await page.context().newCDPSession(page);await touchSession.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:3}]});await touchSession.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await touchSession.detach();
 const stopped=await page.evaluate(()=>vp.scrollLeft);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>vp.scrollLeft),stopped);
 const cx=area.x+area.width*.68,cy=area.y+135;
 const anchor=await page.evaluate(cx=>timelineBounds.start-(vp.scrollLeft+cx-vp.getBoundingClientRect().left-labelWidth())/appState.layout.px,cx),scale=await page.evaluate(()=>appState.layout.px);
 await pointer(page,'touch',[{type:'touchStart',points:[[1,cx-25,cy],[2,cx+25,cy]]},...Array.from({length:6},(_,i)=>({type:'touchMove',points:[[1,cx-25-(i+1)*4,cy],[2,cx+25+(i+1)*4,cy]]})),{type:'touchEnd',points:[]}]);
 const after=await page.evaluate(cx=>({scale:appState.layout.px,year:timelineBounds.start-(vp.scrollLeft+cx-vp.getBoundingClientRect().left-labelWidth())/appState.layout.px}),cx);
 assert.ok(after.scale>scale*1.5&&after.scale<=24,'pinch zoom');assert.ok(Math.abs(after.year-anchor)<1,'pinch keeps centroid year');
 // Use a real 44px handle. Its logical center may be outside the visible viewport
 // after pan; explicit year positioning puts it in an unobscured part of the axis.
 await page.evaluate(()=>setCursor(timelineBounds.start-(vp.scrollLeft+130)/appState.layout.px));
 const handle=await page.locator('.cursorHandle').boundingBox(),year=await page.evaluate(()=>appState.conditions.cursor);assert.ok(handle.width>=44&&handle.height>=44);
 await touchDrag(page,handle.x+handle.width/2,handle.y+handle.height/2,65,0);assert.ok(await page.evaluate(()=>appState.conditions.cursor)<year,'cursor drag moves year');
 await page.locator('.cursorHandle').focus();const keyed=await page.evaluate(()=>appState.conditions.cursor);await page.keyboard.press('ArrowLeft');assert.equal(await page.evaluate(()=>appState.conditions.cursor),keyed+1);
 // Find a point with overlapping virtual glyph targets, without moving or
 // inflating any temporal bar. Use the real compact zoom, where short reigns
 // have neighbouring 44px hit areas (the pinch above intentionally separated them).
 await page.evaluate(()=>{appState.layout.density='full';zoomAt(.8,vp.getBoundingClientRect().left+labelWidth()+100);vp.scrollTop=0;vp.scrollLeft=0;setCursor(timelineBounds.end);});
 const hit=await page.evaluate(()=>{
  const vr=vp.getBoundingClientRect(),nodes=[...chart.querySelectorAll('button.ruler,button.event,button.politySegment')];
  const items=nodes.map(button=>({button,rect:button.getBoundingClientRect()})).filter(({rect:r})=>r.right>vr.left+labelWidth()+24&&r.left<vr.right-24&&r.top>vr.top+70&&r.bottom<vr.bottom-20);
  for(const item of items){const r=item.rect,y=r.top+r.height/2;for(const offset of [1,r.width-1,r.width/2,-10,r.width+10]){const x=Math.max(vr.left+labelWidth()+24,Math.min(vr.right-24,r.left+offset));const top=document.elementFromPoint(x,y);if(top?.closest('.cursorHandle'))continue;const nearby=Zhou.TimelineGestureHit.candidates(items,x,y,{clip:vr});if(nearby.length>1)return {x,y};}}return null;
 });
 if(!hit)console.log('HIT DEBUG',await page.evaluate(()=>({top:vp.scrollTop,left:vp.scrollLeft,box:vp.getBoundingClientRect().toJSON(),sample:[...chart.querySelectorAll('button.ruler,button.event,button.politySegment')].slice(0,4).map(e=>e.getBoundingClientRect().toJSON())})));
 assert.ok(hit,'real dense targets exist');await page.touchscreen.tap(hit.x,hit.y);await page.locator('.timelineGestureCandidates').waitFor();assert.ok(await page.locator('.timelineGestureCandidate').count()>2);await page.keyboard.press('Escape');assert.equal(await page.locator('.timelineGestureCandidates').count(),0);
 await page.touchscreen.tap(hit.x,hit.y);await page.locator('.timelineGestureCandidate').first().click();await page.locator('#detail').waitFor();assert.equal(await page.locator('.timelineGestureCandidates').count(),0);
 const state=await page.evaluate(()=>({key:navigation.key,scroll:vp.scrollLeft,cursor:appState.conditions.cursor,px:appState.layout.px}));
 for(const snap of [35,90,60]){await page.locator('.detailSheetSnap[aria-label*="'+snap+'%" ]').click();await page.waitForTimeout(200);const r=await page.locator('#detail').boundingBox();assert.ok(Math.abs(r.height-844*snap/100)<4,'sheet '+snap);}
 await page.locator('.detailSheetHandle').focus();await page.keyboard.press('End');assert.equal(await page.locator('.detailSheetHandle').getAttribute('aria-valuenow'),'90');
 await page.evaluate(()=>document.querySelector('#detail').scrollTop=200);assert.ok(await page.locator('#detail').evaluate(e=>e.scrollTop)>0,'long content still scrolls');
 await page.locator('#close').click();assert.equal(await page.locator('#detail').isVisible(),false);assert.equal(await page.evaluate(()=>appState.conditions.cursor),state.cursor);
 // Repeat a long source detail, then dismiss through handle drag, preserving the
 // existing navigation root restoration instead of bypassing closeDetail().
 await page.evaluate(()=>showState(D.states[0].id));await page.locator('.detailSheetSnap[aria-label*="35%" ]').click();await page.waitForTimeout(200);const grip=await page.locator('.detailSheetHandle').boundingBox();await touchDrag(page,grip.x+grip.width/2,grip.y+20,0,140);assert.equal(await page.locator('#detail').isVisible(),false,'pull-down close');
 await noOverflow(page,'deep touch');
}
try{
 for(const width of (process.env.P0_WIDTHS?process.env.P0_WIDTHS.split(',').map(Number):[375,390,768,1200,1440]))for(const topic of catalog.filter(t=>!process.env.P0_TOPIC||t.id===process.env.P0_TOPIC)){
  const context=await browser.newContext({viewport:{width,height:844},hasTouch:width<768,isMobile:false,offline:true,reducedMotion:'reduce',acceptDownloads:true}),page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});
  try{
   await page.goto(pathToFileURL(resolve('dist',topic.page)).href);await page.locator('.stateRow').first().waitFor();await noOverflow(page,topic.id+' initial '+width);
   assert.equal(await page.locator('[data-toolbar-group]').count(),5);assert.equal(await page.locator('#advancedSettings').isVisible(),false);assert.equal(await page.locator('#onboarding').isVisible(),true);
   await keyboardGuide(page);await page.reload();await page.locator('.stateRow').first().waitFor();assert.equal(await page.locator('#onboarding').isVisible(),false);
   const active=await page.locator('.topicNav [aria-current="page"]').boundingBox(),nav=await page.locator('.topicNav').boundingBox();assert.ok(active.x>=nav.x-1&&active.x+active.width<=nav.x+nav.width+1,'current topic centered into view');
   await page.locator('#advancedToggle').click();assert.equal(await page.locator('#advancedSettings').isVisible(),true);await noOverflow(page,'advanced '+topic.id+'/'+width);await page.reload();assert.equal(await page.locator('#advancedSettings').isVisible(),true,'persisted expansion');
   await page.locator('#replayOnboarding').click();await page.keyboard.press('Escape');assert.equal(await page.locator('#onboarding').isVisible(),false);
   // Verify all regular click controls are 44px, without changing dense glyphs.
   const small=await page.evaluate(()=>[...document.querySelectorAll('button,a[data-topic],.topicStep')].filter(e=>e.getClientRects().length&&!e.closest('#chart')&&!e.matches('[aria-disabled=true]')).map(e=>({id:e.id||e.className,r:e.getBoundingClientRect()})).filter(({r})=>r.width<43.5||r.height<43.5).map(({id,r})=>({id,width:r.width,height:r.height})));
   assert.deepEqual(small,[],'44px controls '+topic.id+'/'+width);
    if(width===375||width===768){for(const id of ['filter','orderStates','manageCombos','exportCompare']){await page.locator('#'+id).click();const dialog=page.locator('dialog[open]');await dialog.waitFor();const box=await dialog.evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth}));assert.ok(box.scroll<=box.width+1,'dialog overflow '+id+'/'+topic.id+': '+JSON.stringify(box));await noOverflow(page,id+'/'+topic.id);await page.keyboard.press('Escape');}}
   await page.locator('#advancedToggle').click();await page.locator('#plus').click();await page.locator('#resetZoom').click();assert.equal(await page.evaluate(()=>appState.layout.px),4);
   if(width===375&&topic.id==='zhou'){await page.emulateMedia({reducedMotion:'no-preference'});await deepTouch(page);await page.emulateMedia({reducedMotion:'reduce'});}
   // All eleven actual dialogs support the breakpoint, details retain full
   // source content, Esc uses the existing navigation restoration.
   await page.evaluate(()=>showState(D.states[0].id));await page.locator('#detail').waitFor();assert.ok((await page.locator('#detailBody').innerText()).length>100);
   const sheetVisible=await page.locator('.detailSheetControls').isVisible();assert.equal(sheetVisible,width<768);
   await noOverflow(page,'detail '+topic.id+'/'+width);await page.keyboard.press('Escape');assert.equal(await page.locator('#detail').isVisible(),false);
   if(width===375||width===768)await page.screenshot({path:resolve(out,topic.id+'-'+width+'.png')});
   assert.deepEqual(errors,[]);assert.deepEqual(requests,[],'offline has no network dependencies');results.push({topic:topic.id,width,status:'pass'});console.log('PASS',topic.id,width);
  }catch(error){await page.screenshot({path:resolve(out,'FAIL-'+topic.id+'-'+width+'.png')}).catch(()=>{});throw error;}finally{await context.close();}
 }
 // Storage denial must not prevent navigation or hide the help replay affordance.
 const ctx=await browser.newContext({viewport:{width:375,height:844},offline:true});await ctx.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError');}});});const page=await ctx.newPage();await page.goto(pathToFileURL(resolve('dist/index.html')).href);await page.keyboard.press('Escape');assert.equal(await page.locator('#onboarding').isVisible(),false,'initial unfocused Esc dismisses guide');await page.locator('#advancedToggle').click();assert.equal(await page.locator('#replayOnboarding').isVisible(),true);assert.match(await page.locator('#uiStatus').innerText(),/未允许保存/);await ctx.close();
 writeFileSync(resolve(out,'results.json'),JSON.stringify({browser:browser.version(),offline:true,cases:results,deniedStorage:'pass'},null,2));console.log('PASS P0',results.length,'responsive cases + real touch/pinch/inertia/sheet + denied storage');
}finally{await browser.close();}
