// Build-only presentation. Facts are read from compiled projections, never mutated.
import {fromAxis} from './time.mjs';
import {catalog} from './production.mjs';
export const SITE_URL='https://chrunge.github.io/Zhou-Dynasty-Timeline/';
export const escapeMarkup=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function dateLabel(axis){if(!Number.isSafeInteger(axis))return '年份未定';const d=fromAxis(axis);return (d.era==='BCE'?'前':'公元')+d.year+'年';}
export function dateRange(start,end,approx=false){return (approx?'约 ':'')+(start===end?dateLabel(start):dateLabel(start)+'—'+dateLabel(end));}
const certainty={certain:'定 · 较确定',inferred:'推 · 推定',disputed:'异 · 存在异说'};
export function topicPresentation(topic,data){
 const title=(data.title||topic.name+' · 历史对照图').trim(),scope=String(data.metadata?.scopeNote||data.scopeNote||'仅展示已收录政权、任期与精选事件；空白不代表没有历史。'),research=String(data.metadata?.researchNote||'');
 const years=dateRange(data.timeline.start,data.timeline.end),description=(topic.name+'历史时间线：'+years+'，对照政权、君主任期、人物与精选事件。'+scope).replace(/\s+/g,' ').slice(0,200);
 return {title,scope,research,years,description,url:new URL(topic.page,SITE_URL).href};
}
export function renderTopicHead(topic,data,imageType='svg'){
 const p=topicPresentation(topic,data),image=new URL('social-'+topic.id+'.'+imageType,SITE_URL).href;
 return '<title>'+escapeMarkup(p.title)+'</title>\n'+[
 ['name','description',p.description],['property','og:type','website'],['property','og:locale','zh_CN'],['property','og:site_name','历史对照图'],['property','og:title',p.title],['property','og:description',p.description],['property','og:url',p.url],['property','og:image',image],['property','og:image:type',imageType==='png'?'image/png':'image/svg+xml'],['property','og:image:width','1200'],['property','og:image:height','630'],['property','og:image:alt',topic.name+'历史时间线缩略图，年份与可信度以专题详情为准'],['name','twitter:card','summary_large_image'],['name','twitter:title',p.title],['name','twitter:description',p.description],['name','twitter:image',image],['name','twitter:image:alt',topic.name+'历史时间线缩略图']
 ].map(([key,name,value])=>'<meta '+key+'="'+name+'" content="'+escapeMarkup(value)+'">').join('\n')+'\n<link rel="canonical" href="'+escapeMarkup(p.url)+'">';
}
export function renderNoScript(topic,data){
 const e=escapeMarkup,p=topicPresentation(topic,data),total=data.states.reduce((n,s)=>n+s.rulers.length,0);
 const topics=catalog.map(t=>'<a href="'+e(t.page)+'"'+(t.id===topic.id?' aria-current="page"':'')+'>'+e(t.name)+'</a>').join('');
 return '<noscript><article class="noScriptReading" aria-labelledby="static-title"><p class="notice">当前未启用 JavaScript：以下为构建时生成的完整政权—任期年表。搜索、同年联动与导出须启用脚本。</p><h2 id="static-title">'+e(p.title)+' · 无脚本年表</h2>'+(topics?'<nav aria-label="历史时期无脚本导航">'+topics+'</nav>':'')+'<p>'+e(p.years)+'</p><p>'+e(p.scope)+'</p>'+(p.research?'<p>'+e(p.research)+'</p>':'')+(topic.id!=='zhou'?'<p>本次资料导入仅做结构与引用校验，未联网核验史实；资料中的校核标记不代表本站已逐条复核。</p>':'')+'<p>收录 '+data.states.length+' 个政权，'+total+' 个有定位的任期。定＝较确定，推＝推定，异＝存在异说；同年更替不表示全年同时在位。未定年世系单列，列表采用原资料次序，不推造年份。存续与任期保留原区间，可能超出本专题阅读视窗。</p><nav aria-label="本页政权年表">'+data.states.map(s=>'<a href="#static-'+e(s.id)+'">'+e(s.name)+'</a>').join(' · ')+'</nav>'+data.states.map(s=>'<section id="static-'+e(s.id)+'"><h3>'+e(s.name)+' · '+e(dateRange(s.start,s.end,s.approxStart||s.approxEnd))+'</h3><p>'+e([s.note,s.endNote].filter(Boolean).join(' '))+'</p>'+(s.interruptions?.length?'<ul>'+s.interruptions.map(g=>'<li>中断：'+e(dateRange(g.start,g.end))+' · '+e(g.note)+'</li>').join('')+'</ul>':'')+'<ol class="staticTenures">'+s.rulers.map(r=>'<li data-static-tenure="'+e(r.id)+'"><strong>'+e(r.name)+'</strong>'+(r.person?'（'+e(r.person)+'）':'')+' · '+e(r.role||'任期')+' · <span>'+e(dateRange(r.start,r.end,r.approx))+'</span> · '+e(certainty[r.dating?.level]||certainty.inferred)+(r.associationNote?' · '+e(r.associationNote):'')+(r.dating?.reason?'<p>'+e(r.dating.reason)+'</p>':'')+'</li>').join('')+'</ol>'+(s.undated?.length?'<h4>未定位的君主 / 前期领袖</h4><ol>'+s.undated.map(r=>'<li data-static-undated="'+e(r.id)+'">'+e(r.name)+(r.person?' · '+e(r.person):'')+' · '+e(r.known||'在位起讫未定')+'</li>').join('')+'</ol>':'')+'</section>').join('')+'<p>来源、不同纪年与单条校核说明可在启用脚本后的详情中查阅；未收录不代表历史空白。</p></article></noscript>';
}
export function renderSocialSVG(topic,data){
 const e=escapeMarkup,p=topicPresentation(topic,data),start=data.timeline.start,end=data.timeline.end,span=Math.max(1,start-end),x=y=>230+(start-y)/span*894;
 const rows=data.states.slice(0,8),rowHeight=39,top=203;
 const shapes=rows.map((s,i)=>{const y=top+i*rowHeight,clamp=v=>Math.max(230,Math.min(1124,x(v))),a=clamp(s.start),b=clamp(s.end),color=/^#[0-9a-f]{6}$/i.test(s.color||'')?s.color:'#82b9b0';
  return '<text x="64" y="'+(y+18)+'" fill="#e4eeee" font-size="18">'+e(s.name.slice(0,9))+'</text><path d="M'+a+' '+(y+12)+'H'+b+'" stroke="'+color+'" stroke-width="2"/>'+s.rulers.filter(r=>r.start>=end&&r.end<=start).map(r=>{const left=clamp(r.start),right=clamp(r.end),opacity=r.dating?.level==='certain'?1:.8;return '<rect x="'+left.toFixed(2)+'" y="'+(y+2)+'" width="'+Math.max(2,right-left).toFixed(2)+'" height="20" rx="3" fill="'+color+'" opacity="'+opacity+'"'+(r.dating?.level==='disputed'?' stroke="#ffffff" stroke-width="1.5"':'')+'/>';}).join('');}).join('');
 const ticks=Array.from({length:5},(_,i)=>{const coord=Math.round(start-(start-end)*i/4),pos=x(coord);return '<path d="M'+pos.toFixed(2)+' 188V'+(top+rows.length*rowHeight)+'" stroke="#46616a" stroke-dasharray="3 7"/><text x="'+pos.toFixed(2)+'" y="176" text-anchor="middle" fill="#bdcfd2" font-size="15">'+e(dateLabel(coord))+'</text>';}).join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc"><title id="title">'+e(p.title)+'</title><desc id="desc">'+e(p.description)+'；缩略示意，仅展示前 '+rows.length+' 个政权。</desc><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#122c36"/><stop offset="1" stop-color="#203e43"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><rect x="38" y="38" width="7" height="83" rx="3" fill="#e4c990"/><g font-family="Noto Sans CJK SC,Microsoft YaHei,PingFang SC,sans-serif"><text x="64" y="85" fill="#ffffff" font-size="38" font-weight="700">'+e(p.title.slice(0,27))+'</text><text x="64" y="122" fill="#e4c990" font-size="21">'+e(p.years)+' · 政权 / 君主任期 / 精选事件</text>'+ticks+shapes+'<path d="M220 188V'+(top+rows.length*rowHeight)+'" stroke="#e4c990" stroke-width="2"/><text x="64" y="566" fill="#e4eeee" font-size="18">'+data.states.length+' 个政权 · '+data.states.reduce((n,s)=>n+s.rulers.length,0)+' 个任期 · '+data.events.length+' 条精选事件</text><text x="64" y="597" fill="#bdcfd2" font-size="16">时间线缩略示意'+(data.states.length>rows.length?'（部分政权）':'')+' · 定 / 推 / 异及完整出处请查专题详情 · 非逐条史实认证</text></g></svg>\n';
}
export function applyTopicTemplate(template,topic,data,imageType='svg'){
 const p=topicPresentation(topic,data);
 if(!template.includes('<!-- topic-seo -->')||!template.includes('<!-- topic-static -->'))throw Error('页面缺少专题构建插槽');
 return template.replace('<!-- topic-seo -->',renderTopicHead(topic,data,imageType)).replace('<!-- topic-static -->',renderNoScript(topic,data))
 .replace('<h1>周代列国</h1>','<h1>'+escapeMarkup(topic.id==='zhou'?'周代列国':topic.name)+'</h1>')
 .replace('<span class="seal" aria-hidden="true">周</span>','<span class="seal" aria-hidden="true">'+(topic.id==='zhou'?'周':'史')+'</span>')
 .replace('ZHOU · 1046—256 BCE',escapeMarkup(p.years))
 .replace('aria-label="周代历史时间线"','aria-label="'+escapeMarkup(topic.name)+'历史时间线"')
 .replace('<!-- topic-review -->','<aside class="reviewStatus" aria-label="资料范围与校核状态"><strong>资料与校核说明</strong><p>'+escapeMarkup(p.scope)+'</p>'+(topic.id!=='zhou'?'<p>本次资料导入仅做结构与引用校验，未联网核验史实；具体依据及异说请展开条目详情。</p>':'<p>纪年确定性与生平校核分别标注；具体依据及异说请展开条目详情。</p>')+'</aside>');
}
export function validateTopicOutput(html,svg,topic,data,imageType='svg'){
 const expected=renderTopicHead(topic,data,imageType);
 if(!html.includes(expected)||!html.includes('<noscript>')||!html.includes('data-static-tenure="')||!svg.includes('width="1200" height="630"'))throw Error('专题SEO或预览资源不完整：'+topic.id);
 if((html.match(/<title>/g)||[]).length!==1||(html.match(/rel="canonical"/g)||[]).length!==1)throw Error('专题SEO标签重复：'+topic.id);
 const count=(html.match(/data-static-tenure="/g)||[]).length,total=data.states.reduce((n,s)=>n+s.rulers.length,0);
 if(count!==total)throw Error('无脚本任期列表不完整：'+topic.id);
}
