// Validate only the original deployed site, never historical source URLs.
import fs from 'node:fs';
import crypto from 'node:crypto';
const base='https://chrunge.github.io/Chinese-Dynasty-Timeline/';
const localBytes=fs.readFileSync('dist/release.json'),local=JSON.parse(localBytes);
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function get(file){const url=new URL(file,base);url.searchParams.set('acceptance',Date.now());const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(file+': HTTP '+response.status);return {status:response.status,bytes:Buffer.from(await response.arrayBuffer())};}
const remote=await get('release.json'),release=JSON.parse(remote.bytes);
if(!remote.bytes.equals(localBytes))throw Error('Remote release does not match committed local distribution: '+release.releaseId+' / '+local.releaseId);
const assets=[];
for(const [file,expected] of Object.entries(release.assets)){
 const response=await get(file),actual=sha(response.bytes);if(actual!==expected||actual!==sha(fs.readFileSync('dist/'+file)))throw Error('Actual SHA256 mismatch: '+file);
 if(file.endsWith('.html'))for(const [,asset,version] of response.bytes.toString().matchAll(/(?:src|href)="([^"/?]+\.(?:js|css))\?v=([a-f0-9]+)"/g))if(version!==release.assets[asset]?.slice(0,12))throw Error('Stale HTML asset reference: '+file+' / '+asset);
 assets.push({file,status:response.status,bytes:response.bytes.length,sha256:actual});
}
const root=await get('');if(sha(root.bytes)!==release.assets['index.html'])throw Error('Root entry does not match index.html');
const result={checkedAt:new Date().toISOString(),base,releaseId:release.releaseId,manifestSha256:sha(remote.bytes),identicalToLocal:true,root:{status:root.status,sha256:sha(root.bytes)},assets};
fs.mkdirSync('.validation',{recursive:true});fs.writeFileSync('.validation/display-live-release.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
