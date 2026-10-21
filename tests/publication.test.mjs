import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {catalog,compileProduction} from '../lib/production.mjs';
import {SITE_URL,dateLabel,dateRange,renderNoScript,renderTopicHead,renderSocialSVG,applyTopicTemplate,validateTopicOutput} from '../lib/site-presentation.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const entries=catalog.map(topic=>({topic,data:compileProduction(JSON.parse(read('data/'+topic.file)),topic.id)}));
const template=read('src/index.html');
for(const {topic,data} of entries)test(topic.name+'：独立SEO、无脚本任期完整与SVG构建一致',()=>{
 const copy=JSON.stringify(data),html=applyTopicTemplate(template,topic,data),svg=renderSocialSVG(topic,data);
 validateTopicOutput(html,svg,topic,data);
 assert.ok(html.includes('href="'+new URL(topic.page,SITE_URL).href+'"'));
 assert.equal((html.match(/name="description"/g)||[]).length,1);
 assert.equal((html.match(/property="og:title"/g)||[]).length,1);
 assert.equal((html.match(/name="twitter:card" content="summary_large_image"/g)||[]).length,1);
 assert.equal((html.match(/data-static-undated="/g)||[]).length,data.states.reduce((n,s)=>n+(s.undated?.length||0),0));
 const no=renderNoScript(topic,data);const nav=no.match(/<nav aria-label="历史时期无脚本导航">([\s\S]*?)<\/nav>/)?.[1];
 assert.equal((nav?.match(/<a /g)||[]).length,catalog.length,'build catalog, including byte-compatible Zhou projection without catalog');
 for(const target of catalog)assert.ok(nav.includes('href="'+target.page+'"'));
 assert.ok(html.indexOf('data-static-tenure=')>html.indexOf('<noscript>')&&html.lastIndexOf('data-static-tenure=')<html.indexOf('</noscript>'));
 for(const s of data.states)for(const r of s.rulers)assert.ok(html.includes('data-static-tenure="'+r.id+'"'));
 assert.ok(html.includes(data.metadata.scopeNote.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')));
 assert.match(svg,/<svg[^>]*width="1200" height="630"/);assert.doesNotMatch(svg,/<script|<foreignObject|href="https?:/i);
 assert.equal(JSON.stringify(data),copy,'presentation must not mutate history projection');
 assert.throws(()=>validateTopicOutput(html.replace(/<title>[\s\S]*?<\/title>/,''),svg,topic,data),/不完整/);
 assert.throws(()=>validateTopicOutput(html.replace('data-static-tenure="','data-removed="'),svg,topic,data),/不完整/);
});
test('日期跨公元无零年，未详年不推造；元信息和列表严格转义',()=>{
 assert.equal(dateLabel(0),'公元1年');assert.equal(dateRange(1,-1),'前1年—公元2年');assert.equal(dateLabel(null),'年份未定');
 const {topic,data:original}=entries[0],data=structuredClone(original);data.title='<script>"坏&标题</script>';data.metadata.scopeNote='"<&bad>';data.states[0].name='"<svg/onload=x>';data.states[0].rulers[0].name='<script>x</script>';
 const head=renderTopicHead(topic,data),no=renderNoScript(topic,data),svg=renderSocialSVG(topic,data);
 assert.doesNotMatch(head+no+svg,/<script>|<svg\/onload/);assert.match(head,/&lt;script&gt;/);assert.match(no,/&lt;script&gt;/);
 assert.throws(()=>applyTopicTemplate('',topic,data),/插槽/);
 const png=renderTopicHead(topic,data,'png');assert.match(png,/social-xia-shang\.png/);assert.match(png,/content="image\/png"/);
});
test('发布清单记录每个专题SVG内容哈希；默认构建无需运行时第三方模块',()=>{
 const release=JSON.parse(read('dist/release.json'));
 for(const {topic} of entries){const asset='social-'+topic.id+'.svg',svg=read('dist/'+asset);assert.equal(release.assets[asset],createHash('sha256').update(svg).digest('hex'));}
 assert.match(read('build.mjs'),/actual\.equals/);assert.doesNotMatch(read('build.mjs'),/from ['"](?:playwright|sharp|canvas|puppeteer)['"]/);
 assert.match(read('.github/workflows/site.yml'),/inputs\.social_png/);
});
