import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {catalog,compileProduction} from '../lib/production.mjs';
import {createBiographyCompiler,biographySource} from '../lib/biography.mjs';
const book=JSON.parse(readFileSync(biographySource,'utf8'));
const datasets=new Map(catalog.map(topic=>[topic.id,compileProduction(JSON.parse(readFileSync('data/'+topic.file,'utf8')),topic.id)]));
const compiler=createBiographyCompiler(book);
const strip=value=>Array.isArray(value)?value.map(strip):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([key])=>!['eventId','eventDatasetId','polityDatasetId','eventReference'].includes(key)).map(([key,item])=>[key,strip(item)])):value;

test('reference repairs preserve every original narrative, date and source',()=>{
 const fixture=JSON.parse(readFileSync('tests/fixtures/biography-narratives.json','utf8'));
 assert.equal(createHash('sha256').update(JSON.stringify(strip(book))).digest('hex'),fixture.sha256);
});
test('wrong or missing external scopes remain unresolved instead of being silently accepted',()=>{
 const damaged=structuredClone(book),chapter=damaged.dynasties[4].figures.find(p=>p.id==='tk-person-sima-yi').biographyPlan.chapters[0];
 chapter.polityDatasetId='unknown';
 const issues=createBiographyCompiler(damaged).diagnose(compiler.enrich(datasets.get('wei-jin-nan-bei')),'wei-jin-nan-bei',datasets);
 assert(issues.some(issue=>issue.kind==='polity'&&issue.targetDatasetId==='unknown'));
 delete chapter.polityDatasetId;
 assert(createBiographyCompiler(damaged).diagnose(compiler.enrich(datasets.get('wei-jin-nan-bei')),'wei-jin-nan-bei',datasets).some(issue=>issue.id==='eastern-han'));
});
test('unindexed declarations do not permit dangling clickable event IDs',()=>{
 const damaged=structuredClone(book),chapter=damaged.dynasties[2].figures.find(p=>p.id==='qh-person-huo-guang').biographyPlan.chapters[2];
 chapter.eventId='fake-event';
 assert.throws(()=>createBiographyCompiler(damaged).inspectReferences(datasets.get('qin-han'),'qin-han',datasets),/未收录事件声明无效/);
});
test('foreign chapters remain readable and cannot mutate the current topic selection or year',()=>{
 const {boot}=createRequire(import.meta.url)('./helpers/browser.cjs'),app=boot({},1200,undefined,'data-wei-jin-nan-bei.js');
 app.action('person','tk-person-sima-yi');
 const html=app.el('#detailBody').innerHTML;assert(html.includes('专题外背景，仅阅读叙述'));
 assert.equal((html.match(/class="bioChapterCard narrativeOnly"/g)||[]).length,5);
 const before=app.run('JSON.stringify({cursor:appState.conditions.cursor,selected:[...appState.conditions.selected]})');
 app.action('bioChapter',String(1-208)+':eastern-han:1');
 assert.equal(app.run('JSON.stringify({cursor:appState.conditions.cursor,selected:[...appState.conditions.selected]})'),before);
});
test('unindexed chapters show their status and retain their explicit year',()=>{
 const {boot}=createRequire(import.meta.url)('./helpers/browser.cjs'),app=boot({},1200,undefined,'data-qin-han.js');
 app.action('person','qh-person-huo-guang');assert(app.el('#detailBody').innerHTML.includes('本章所述事件尚未单独收录'));
 assert(app.el('#detailBody').innerHTML.includes('前74年'));
});
