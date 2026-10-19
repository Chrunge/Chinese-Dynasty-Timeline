'use strict';
// Canvas pagination consumes a comparison snapshot; no browser or data-store access.
(function(root){
 const Zhou=root.Zhou||(root.Zhou={});
 const fmt=y=>Zhou.Time.format(y),range=(a,b,approx=false)=>Zhou.Time.range(a,b,approx);
 const certaintyLabel={certain:'较确定',inferred:'推定',disputed:'存在异说'};
function wrapExportText(measureText,text,width){
 const lines=[];let line='';for(const c of String(text)){if(c==='\n'){lines.push(line);line='';continue;}if(line&&measureText(line+c)>width){lines.push(line);line=c;}else line+=c;}if(line||!lines.length)lines.push(line);return lines;
}
function exportRulerLanes(s,from,to){
 const ends=[],rulers=[];for(const r of s.rulers.filter(r=>r.start>=to&&r.end<=from).sort((a,b)=>b.start-a.start||(a.lane||0)-(b.lane||0))){let lane=r.lane||0;while(ends[lane]!=null&&r.start>=ends[lane])lane++;ends[lane]=r.end;rulers.push({...r,exportLane:lane});}return {rulers,lanes:Math.max(1,ends.length)};
}
function buildExportPlan(model,options={},measureText){
 const {from,to}=model;if(!Zhou.Time.isYear(from)||!Zhou.Time.isYear(to)||from<to||model.timeline&&(from>model.timeline.start||to<model.timeline.end))throw new Error('请填写有效范围，起始时间须早于或等于结束时间。');
 const states=model.states;if(!states.length)throw new Error('当前没有显示的国家，请先筛选国家或清除搜索。');
 const span=[100,150,300,1000].includes(options.span)?options.span:150,sources=[],addSource=s=>{if(!s?.url)return 0;let i=sources.findIndex(v=>v.url===s.url);if(i<0){sources.push(s);i=sources.length-1;}return i+1;};
 const sourceRefs=values=>[...new Set((values||[]).map(addSource).filter(Boolean))];
 const alternatives=dating=>(dating?.alternatives||[]).map(a=>({a,refs:sourceRefs(a.sources)}));
 const citations=refs=>refs.map(n=>'['+n+']').join('');
 const opinionItems=values=>values.map(({a,refs})=>({text:'异说：'+a.label+(a.year!=null?' '+fmt(a.year):'')+(a.explanation?' · '+a.explanation:'')+(refs.length?' · 来源'+citations(refs):'')}));
 const rulers=states.flatMap(s=>s.rulers.map(r=>({state:s,r,ref:addSource({title:(r.source||'').includes('wikisource')?'君主纪年表 · 原典':'君主纪年表 · 检索汇编，待逐条校勘',url:r.source}),refs:sourceRefs(r.sources),datingRefs:sourceRefs(r.dating?.sources),chronologyRefs:sourceRefs(r.chronology?.sources),alternatives:alternatives(r.dating)})));
 const events=model.events.map((e,i)=>({e,number:i+1,refs:sourceRefs(e.sources),alternatives:alternatives(e.dating)}));
 for(const s of states){for(const ref of s.dating?.sources||[])addSource(ref);}
 const pages=[];for(let first=from;first>=to;){const last=Math.max(to,first-span+1);let group=[],weight=0;
  for(const s of states){const packed=exportRulerLanes(s,first,last),height=80+packed.lanes*22;if(group.length&&weight+height>520){pages.push({type:'chart',from:first,to:last,rows:group});group=[];weight=0;}group.push({s,...packed,height});weight+=height;}
  if(group.length)pages.push({type:'chart',from:first,to:last,rows:group});first=last-1;
 }
 // A complete text index accompanies small bars and dense event markers.
 const items=[{text:'君主索引 · 完整在位区间（不将元年一概视为实际即位年）',kind:'heading'}];
 for(const s of states){
  items.push({text:s.name+' · '+range(s.start,s.end,s.approxStart||s.approxEnd)+(s.endNote?' · '+s.endNote:''),kind:'heading'});
  const list=rulers.filter(v=>v.state.id===s.id);
  if(!list.length)items.push({text:'本导出范围没有已定位的在位区间；空白表示未收录或该阶段未存续。'});
  for(const {r,ref,refs,datingRefs,chronologyRefs,alternatives:opinions} of list){
   items.push({text:r.name+(r.person?'（'+r.person+'）':'')+' · '+range(r.start,r.end,r.approx)+' · '+certaintyLabel[r.dating?.level||'inferred']+' · 来源'+citations([...new Set([ref,...refs,...datingRefs].filter(Boolean))])});
   if(r.associationNote)items.push({text:'任期身份说明：'+r.associationNote});
    const chronology=chronologyRefs.filter(n=>n!==ref&&!datingRefs.includes(n));
   if(chronology.length)items.push({text:'即位、元年与结局的纪年节点来源'+citations(chronology)});
   items.push(...opinionItems(opinions));
  }
 }
 items.push({text:'事件索引 · 同一编号在相关国家行中对应同一事件',kind:'heading'});
 for(const {e,number,refs,alternatives:opinions} of events){items.push({text:'E'+number+' · '+range(e.year,e.year,e.approx)+' · '+e.name+' · '+e.states.map(id=>model.stateNames?.[id]||states.find(s=>s.id===id)?.name||id).join('、')+' · '+certaintyLabel[e.dating?.level||'inferred']+' · 来源'+citations(refs)});items.push({text:e.description});items.push(...opinionItems(opinions));}
 if(!events.length)items.push({text:'当前范围与类别筛选下没有已收录事件。'});
 items.push({text:'图例与采用口径',kind:'heading'},{text:model.legend||'彩色条：采用年表的君主在位区间；细线：政权存续；E编号菱形：事件；红色端点：政权终止或资料标记的阶段边界；金色竖线：参考年份。'}, {text:'定＝较确定，推＝推定，异＝存在异说。推定用虚线，异说用双边框。年级精度；同年更替不代表两人全年同时在位。'}, {text:model.scopeNote||'国家中断与复国分段显示；事件与生平为精选。实际即位、退位、去世与改元须查网站详情。'});
 items.push({text:'核查来源 · 原典记载与纪年汇编分别标注',kind:'heading'});sources.forEach((s,i)=>{items.push({text:'['+(i+1)+'] '+s.title,kind:'source'});items.push({text:s.url,kind:'url'});});
 let lines=[],used=0;const flush=()=>{if(lines.length)pages.push({type:'index',lines});lines=[];used=0;};
 for(let itemIndex=0;itemIndex<items.length;itemIndex++){const item=items[itemIndex];if((item.kind==='heading'&&used+68>630)||(item.kind==='source'&&used+92>630))flush();const wrapped=wrapExportText(text=>measureText(text,item.kind==='url'?15:18,item.kind==='heading'),item.text,1110);for(let i=0;i<wrapped.length;i++){const height=item.kind==='heading'?34:item.kind==='url'?24:27;if(used+height>630)flush();lines.push({text:wrapped[i],kind:item.kind,height});used+=height;}if(used+7>630)flush();else{lines.push({text:'',height:7});used+=7;}}
 flush();return {pages,states,events,sources,from,to,title:model.title||'历史对照图',cursor:model.cursor,category:model.category,updated:model.updated,date:new Date().toLocaleDateString('zh-CN'),query:options.query||''};
}
 Object.assign(Zhou,{buildExportPlan,exportRulerLanes,wrapExportText});
})(globalThis);
