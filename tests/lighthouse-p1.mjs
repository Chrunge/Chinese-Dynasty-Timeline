// Local HTTP is only an audit transport; the release still supports file://.
import {createServer} from 'node:http';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import lighthouse from 'lighthouse';
import {launch} from 'chrome-launcher';
import assert from 'node:assert/strict';
import {catalog} from '../lib/production.mjs';
const root=resolve('dist'),out=resolve('.validation/p1/lighthouse');mkdirSync(out,{recursive:true});
const server=createServer((req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+decodeURIComponent(pathname));if(!file.startsWith(root+sep))throw Error('path');res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'})[extname(file)]||'application/octet-stream');res.end(readFileSync(file));}catch{res.statusCode=404;res.end('Not found');}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));let chrome;const results=[];
try{chrome=await launch({chromeFlags:['--headless=new','--no-sandbox','--disable-gpu'],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{chromePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 for(const width of (process.env.P1_WIDTHS||'375,1200').split(',').map(Number))for(const topic of catalog.filter(t=>!process.env.P1_TOPIC||process.env.P1_TOPIC===t.id)){
  const mobile=width<768,{lhr,report}=await lighthouse(`http://127.0.0.1:${server.address().port}/${topic.page}`,{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['accessibility'],formFactor:mobile?'mobile':'desktop',screenEmulation:{mobile,width,height:900,deviceScaleFactor:1,disabled:false},throttlingMethod:'provided'});
  const score=Math.round(lhr.categories.accessibility.score*100),failed=Object.values(lhr.audits).filter(a=>a.score!==null&&a.score<1).map(a=>({id:a.id,title:a.title,details:a.details}));
  writeFileSync(resolve(out,topic.id+'-'+width+'.json'),typeof report==='string'?report:JSON.stringify(lhr,null,2));results.push({topic:topic.id,width,score,failed});console.log('LIGHTHOUSE',topic.id,width,score);assert.ok(score>=95,topic.id+' '+width+' accessibility '+score);
 }
}finally{writeFileSync(resolve(out,'results.json'),JSON.stringify(results,null,2));await chrome?.kill();await new Promise(done=>server.close(done));}
