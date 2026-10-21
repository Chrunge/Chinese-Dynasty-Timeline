// Optional development tool. It stages PNGs, never writes dist. The build owns publishing.
import {chromium} from 'playwright';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {catalog} from '../lib/production.mjs';
// Resolve against the checkout rather than a caller's shell directory (including spaces/unicode).
const {fileURLToPath}=await import('node:url');
const checkout=fileURLToPath(new URL('../',import.meta.url)),dist=resolve(checkout,'dist');
const arg=process.argv.find(a=>a.startsWith('--output=')),out=resolve(checkout,arg?.slice(9)||'.validation/social-png'),rel=relative(dist,out);
if(!rel||(!rel.startsWith('..')&&!isAbsolute(rel)))throw Error('预览渲染器不得写入dist，请指定暂存目录');
mkdirSync(out,{recursive:true});const hash=b=>createHash('sha256').update(b).digest('hex'),manifest={version:1,images:{}};
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:process.env.SOCIAL_CHROMIUM_CHANNEL?{channel:process.env.SOCIAL_CHROMIUM_CHANNEL}:{})});
try{
 const context=await browser.newContext({viewport:{width:1200,height:630},deviceScaleFactor:1,offline:true});
 const page=await context.newPage();
 for(const topic of catalog){
  const svg=readFileSync(join(dist,'social-'+topic.id+'.svg'),'utf8');
  await page.setContent('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>Preview</title></head><body style="margin:0;width:1200px;height:630px;overflow:hidden">'+svg+'</body></html>');
  await page.evaluate(()=>document.fonts.ready);const png=await page.screenshot({type:'png',animations:'disabled'});
  writeFileSync(join(out,'social-'+topic.id+'.png'),png);manifest.images[topic.id]={svgSha256:hash(svg),pngSha256:hash(png)};
 }
 writeFileSync(join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log('已暂存11张1200×630 PNG。使用node build.mjs --social-png-dir='+out+'统一发布。');
}finally{await browser.close();}
