function resultMeta(entry){const states=entry.states.map(id=>byId(id).name).join('、');return [states,entry.undated?'在位起讫待考':entry.type==='ruler'?range(entry.year,entry.until,entry.data.approx):entry.type==='event'?range(entry.year,entry.until??entry.year,entry.data.approx):entry.type==='person'?entry.data.role:'国家世系与事件'].filter(Boolean).join(' · ');}
function searchExcerpt(text){const value=String(text||''),offsets=[];let normalized='';for(let i=0;i<value.length;){const char=String.fromCodePoint(value.codePointAt(i)),part=normalizeSearch(char);normalized+=part;for(let k=0;k<part.length;k++)offsets.push(i);i+=char.length;}const at=normalized.indexOf(normalizeSearch(appState.search.query)),start=Math.max(0,(offsets[at]||0)-35),stop=Math.min(value.length,start+140);return (start?'…':'')+value.slice(start,stop)+(stop<value.length?'…':'');}
function renderSearchResults(){
 const panel=$('#searchPanel');panel.hidden=!appState.search.query;if(!appState.search.query){$('#searchResults').innerHTML='';$('#searchCount').textContent='';return;}
 const hits=searchMatches(),labels={country:'国家',ruler:'君主',person:'人物',event:'事件'};$('#searchCount').textContent='找到 '+hits.length+' 项'+(appState.search.searchScope==='selected'?' · 当前国家':' · 全站');
 if(!hits.length){$('#searchResults').innerHTML='<p class="searchEmpty">没有匹配结果。可检查名称、改用简短关键词，或将范围切换到“全站资料”。</p>';return;}
 const firstType=hits[0].entry.type,types=[firstType,...['country','ruler','person','event'].filter(t=>t!==firstType)];
 $('#searchResults').innerHTML=types.map(type=>{const group=hits.filter(h=>h.entry.type===type);if(!group.length)return '';return '<section class="searchGroup"><h4>'+labels[type]+' <span>'+group.length+'</span></h4>'+group.slice(0,appState.search.searchLimit).map(h=>'<button class="searchResult '+(appState.search.searchTarget===h.entry.key?'chosenResult':'')+'" data-action="searchHit" data-id="'+escapeHTML(h.entry.key)+'"><strong>'+escapeHTML(h.entry.title)+'</strong><small>'+escapeHTML(resultMeta(h.entry))+'</small><span class="matchReason '+(h.score===15?'contextReason':'')+'">'+h.reason+'</span>'+(h.score===15?'<p>'+escapeHTML(searchExcerpt(h.entry.description))+'</p>':'')+'</button>').join('')+(group.length>appState.search.searchLimit?'<p class="searchMoreNote">还有'+(group.length-appState.search.searchLimit)+'项</p>':'')+'</section>';}).join('')+(hits.some(h=>hits.filter(v=>v.entry.type===h.entry.type).length>appState.search.searchLimit)?'<button data-action="moreSearch">显示更多结果</button>':'');
}
function updateSearch(text){appState.search.query=text.trim();appState.search.searchLimit=6;appState.search.searchTarget=null;appState.session.activeEventId=null;render();}
function scrollToSearchState(id){const layout=appState.session.rowLayouts.get(id);if(!layout||layout.pinned)return;const pinnedRows=(appState.session.visibleRows||[]).filter(r=>r.pinned),pinHeight=pinnedRows.reduce((n,r)=>n+(appState.session.rowLayouts.get(r.members[0].id)?.height||0),0);vp.scrollTop=Math.max(0,layout.offset-pinHeight);}
function personButton(value,label){const entry=searchIndex.find(e=>e.key===normalizeDetailKey('person:'+value));label??=entry?.data.name||value;return entry?'<button class="personLink" data-action="person" data-id="'+escapeHTML(entry.data.id)+'">'+escapeHTML(label)+'</button>':escapeHTML(label);}
function showSearchPerson(entry){showPerson(entry.data.id);}
function renderBiographyReader(p,entry,events){
 const bp=p.biographyPlan;
 const goldBadge=bp.characterTag?'<span class="bioBadge goldBadge">'+escapeHTML(bp.characterTag)+'</span>':'';
 const motifBadge=bp.motifCategory?'<span class="bioBadge motifBadge">'+escapeHTML(bp.motifCategory)+'</span>':'';
 const tierBadge=bp.selectionTier?'<span class="bioBadge tierBadge">'+escapeHTML(bp.selectionTier)+'</span>':(bp.isCore26?'<span class="bioBadge tierBadge">核心入选人物（26人精选版）</span>':'<span class="bioBadge tierBadge">扩展人物矩阵</span>');
 const volumeBadge=bp.volume?'<span class="bioBadge volumeBadge">'+escapeHTML(bp.volume)+'</span>':'';
 const lifespan=bp.lifespan?'<div class="bioLifespan"><span class="bioMetaLabel">生卒享年：</span>'+escapeHTML(bp.lifespan)+'</div>':'';

 let monarchChain='';
 if(Array.isArray(p.servedMonarchs)&&p.servedMonarchs.length){
  const list=p.servedMonarchs.map(m=>{
   const kindLabel=m.kind==='associated'?'核心辅政':m.kind==='service'?'出仕':'交涉';
   return '<button type="button" class="monarchBadge" data-action="focusRuler" data-id="'+escapeHTML(m.tenureId)+'" title="'+escapeHTML(m.description||m.monarchName)+'">'+
    '<span class="monarchKind">'+escapeHTML(kindLabel)+'</span>'+
    '<span class="monarchName">'+escapeHTML(m.monarchName)+'</span>'+
    '</button>';
  }).join('');
  monarchChain='<div class="bioMonarchChain"><span class="bioMetaLabel">历仕君主：</span><div class="monarchList">'+list+'</div></div>';
 }

 const origin=p.origin?'<p class="notice">出身：'+escapeHTML(p.origin)+'</p>':'';

 const heraldry='<div class="bioHeraldry">'+
  '<h3 class="detailTitle bioName">'+escapeHTML(p.name)+'</h3>'+
  '<div class="bioRole">'+escapeHTML(p.role||'传记代表人物')+'</div>'+
  '<div class="bioBadges">'+goldBadge+motifBadge+tierBadge+volumeBadge+'</div>'+
  lifespan+
  origin+
  monarchChain+
  '</div>';

 const quoteCard='<div class="bioQuoteCard">'+
  '<div class="bioQuoteSection"><h5>【核心戏剧冲突与历史高潮】</h5><p>'+escapeHTML(bp.coreHighlights||'')+'</p></div>'+
  '<div class="bioQuoteSection"><h5>【历仕帝王与跨政权轨迹】</h5><p>'+escapeHTML(bp.crossRegimeSpan||'')+'</p></div>'+
  (bp.suggestedLength?'<div class="bioQuoteSection"><h5>【立传规划与篇幅】</h5><p>'+escapeHTML(bp.suggestedLength)+(bp.volume?' · '+escapeHTML(bp.volume):'')+'</p></div>':'')+
  '<div class="bioQuoteSection"><h5>【传主小传纪略】</h5><p>'+escapeHTML(p.summary||'')+'</p></div>'+
  '</div>';

 const chapters=Array.isArray(bp.chapters)?bp.chapters:[];
 const chapterCards=chapters.map(ch=>{
  const rawYear=typeof ch.year==='object'?Zhou.Time.encode(ch.year):ch.year;
  const local=byId(ch.polityId)&&(!ch.polityDatasetId||ch.polityDatasetId===(D.datasetId||D.timeline?.topic)),canLocate=local&&Zhou.Time.isYear(rawYear)&&rawYear<=timelineBounds.start&&rawYear>=timelineBounds.end;
  const polity=byId(ch.polityId)||{name:(D.catalog?.find(t=>t.id===ch.polityDatasetId)?.name||'其他专题')+'专题背景'};
  return '<article class="bioChapterCard'+(canLocate?'':' narrativeOnly')+'"'+(canLocate?' data-action="bioChapter" data-id="'+rawYear+':'+escapeHTML(ch.polityId)+':'+ch.chapterNo+'" data-year="'+rawYear+'" data-polity-id="'+escapeHTML(ch.polityId)+'"':'')+' data-chapter-no="'+ch.chapterNo+'">'+
   '<div class="bioChapterHead">'+
    '<span class="bioChapterNo">第 '+ch.chapterNo+' 章</span>'+
    '<span class="bioChapterKind">'+escapeHTML(ch.kindLabel||'')+'</span>'+
    '<span class="bioChapterPolity">'+escapeHTML(polity.name)+'</span>'+
    '<span class="bioChapterYear">'+(ch.approx?'约 ':'')+fmt(rawYear)+'</span>'+
   '</div>'+
   '<h5 class="bioChapterTitle">'+escapeHTML(ch.title)+'</h5>'+
   '<p class="bioChapterSummary">'+escapeHTML(ch.summary)+'</p>'+
   '<div class="bioChapterFoot"><span class="bioChapterHint">'+(canLocate?'联动左图定位 ➔':Zhou.Time.isYear(rawYear)?'专题外背景，仅阅读叙述':'日期未定，仅阅读叙述')+'</span>'+(ch.eventReference?.status==='unindexed'?'<p class="notice">本章所述事件尚未单独收录。</p>':'')+'</div>'+
  '</article>';
 }).join('');

 const chapterSection='<div class="detailSection bioChapterSection">'+
  '<h4>分章传记叙事流（共 '+chapters.length+' 章）</h4>'+
  '<p class="notice">带定位提示的章节可联动时间轴；专题外背景和日期未定章节保留阅读内容。</p>'+
  '<div class="bioChapterFlow">'+chapterCards+'</div>'+
  '</div>';

 const countries=entry.states.map(id=>{
  const s=byId(id);
  return s?'<button data-action="state" data-id="'+id+'">'+escapeHTML(s.name)+'</button>':'';
 }).join('');
 const roles=events.flatMap(e=>(e.participants||[]).filter(v=>v.id===p.id).map(v=>'<p><b>'+escapeHTML(e.name)+'：</b>'+escapeHTML(v.relation)+'</p>')).join('');

 const journey=p.journey?.length?'<ol class="personJourney">'+p.journey.map(j=>'<li><span class="journeyDate">'+(Zhou.Time.isYear(j.year)?(j.approx?'约 ':'')+fmt(j.year):'年份未定 · 依阶段记载')+'</span><h5>'+escapeHTML(j.label)+'</h5><span class="journeyKind">'+escapeHTML(j.kind)+' · '+(byId(j.state)?.name||j.state)+'</span><p>'+escapeHTML(j.text)+'</p><div class="related"><button data-action="state" data-id="'+j.state+'">查看'+(byId(j.state)?.name||j.state)+'</button>'+(j.event?'<button data-action="event" data-id="'+j.event+'">相关事件</button>':'')+'</div></li>').join('')+'</ol>':'';
 const journeySection=journey?'<div class="detailSection"><h4>活动轨迹</h4>'+journey+'</div>':'';

 const rulerSection=(p.rulerKeys&&p.rulerKeys.length)?'<div class="detailSection"><h4>已收录的君主关联</h4><p class="notice">这些是在位区间中的人物关联，不表示此人全程任职，也不是生卒年。</p>'+(p.rulerKeys.map(key=>{const r=searchIndex.find(e=>e.key===key);return r?'<button class="listitem" data-action="ruler" data-id="'+r.data.id+'">'+escapeHTML(r.title)+'<small>'+escapeHTML(resultMeta(r))+'</small></button>':'';}).join('')||'<p class="notice">尚未收录可定位的具体君主关联。</p>')+'</div>':'';

 const relationsSection='<div class="detailSection"><h4>已收录任职 / 活动国家</h4><div class="related">'+countries+'</div><p class="notice">包含任职、辅政、游说、流亡及重大历史涉事政权。</p></div>'+
  rulerSection+
  journeySection+
  (events.length?'<div class="detailSection"><h4>已收录相关事件</h4>'+roles+eventList(events)+'</div>':'');

 return heraldry+quoteCard+chapterSection+relationsSection+links(p.sources||[]);
}

function showPerson(name){
 const entry=searchIndex.find(e=>e.key===normalizeDetailKey('person:'+name));if(!entry)return;const p=entry.data,events=D.events.filter(e=>p.eventIds.includes(e.id));
 appState.session.activePersonId=appState.session.figureHighlight?.kind==='person'?appState.session.figureHighlight.id:p.id;
 render();

 if(p.biographyPlan && !appState.session.legacyShareV1){
  show('传记档案 · '+(p.biographyPlan.dynastyGroup||entry.states.map(id=>byId(id)?.name||id).join('、')),renderBiographyReader(p,entry,events),'person:'+p.id);
  return;
 }
 const journey=p.journey?.length?'<ol class="personJourney">'+p.journey.map(j=>'<li><span class="journeyDate">'+(Zhou.Time.isYear(j.year)?(j.approx?'约 ':'')+fmt(j.year):'年份未定 · 依阶段记载')+'</span><h5>'+escapeHTML(j.label)+'</h5><span class="journeyKind">'+escapeHTML(j.kind)+' · '+byId(j.state).name+'</span><p>'+escapeHTML(j.text)+'</p><div class="related"><button data-action="state" data-id="'+j.state+'">查看'+byId(j.state).name+'</button>'+(j.event?'<button data-action="event" data-id="'+j.event+'">相关事件</button>':'')+'</div></li>').join('')+'</ol>':'<p class="notice">完整活动轨迹尚待补充。下方仅列已收录的君主关联和具体事件，不据君主在位年推算任期或生卒年。</p>';
 const countries=entry.states.map(id=>'<button data-action="state" data-id="'+id+'">'+byId(id).name+'</button>').join('');
 const roles=events.flatMap(e=>(e.participants||[]).filter(v=>v.id===p.id).map(v=>'<p><b>'+escapeHTML(e.name)+'：</b>'+escapeHTML(v.relation)+'</p>')).join('');
 show('人物 · '+entry.states.map(id=>byId(id).name).join('、'),'<h3 class="detailTitle">'+escapeHTML(p.name)+'</h3><p class="notice">'+escapeHTML(p.role||'已收录人物')+'</p>'+(p.origin?'<p class="notice">出身：'+escapeHTML(p.origin)+'</p>':'')+'<div class="detailSection"><h4>简要生平与主要事迹</h4><p>'+escapeHTML(p.summary)+'</p></div><div class="detailSection"><h4>已收录任职 / 活动国家</h4><div class="related">'+countries+'</div><p class="notice">包含任职、游说、流亡及事件活动；具体身份以各阶段标注为准。</p></div><div class="detailSection"><h4>活动轨迹</h4>'+journey+'</div><div class="detailSection"><h4>已收录的君主关联</h4><p class="notice">这些是在位区间中的人物关联，不表示此人全程任职，也不是生卒年。</p>'+(p.rulerKeys.map(key=>{const r=searchIndex.find(e=>e.key===key);return '<button class="listitem" data-action="ruler" data-id="'+r.data.id+'">'+escapeHTML(r.title)+'<small>'+escapeHTML(resultMeta(r))+'</small></button>';}).join('')||'<p class="notice">尚未收录可定位的具体君主关联。</p>')+'</div><div class="detailSection"><h4>已收录相关事件</h4>'+roles+eventList(events)+'</div>'+links(p.sources||[]),'person:'+p.id);
}
function eventNarrative(e){
 const n=e.narrative,sections=n?[['背景',n.background],['经过',n.process],['结果',n.result],['后续影响',n.impact]]:[['背景','背景资料尚待补充。可沿下方同国事件继续阅读。'],['经过',e.description],['结果','本条尚未单独整理结果，采用上方事件摘要记载。'],['后续影响','后续影响尚待校勘，不从年份先后推断因果。']];
 const linksTo=(n?.related||[]).map(id=>D.events.find(v=>v.id===id)).filter(Boolean),earlier=linksTo.filter(v=>v.year>=e.year),later=linksTo.filter(v=>v.year<e.year);
 const neighbors=linksTo.length?[]:D.events.filter(v=>v.id!==e.id&&v.states.some(id=>e.states.includes(id))).sort((a,b)=>Math.abs(a.year-e.year)-Math.abs(b.year-e.year)).slice(0,4);
 return '<div class="eventStory">'+sections.map(([title,text])=>'<section><h4>'+title+'</h4><p>'+escapeHTML(text)+'</p></section>').join('')+'</div><div class="detailSection"><h4>前后事件</h4><p class="notice">'+(n?'按主题整理的阅读线索；关联并不一律表示直接因果。':'同国邻近事件仅按时间关联，不表示因果。')+'</p>'+(linksTo.length?(earlier.length?'<h5>前置 / 同期节点</h5>'+eventList(earlier):'')+(later.length?'<h5>后续节点</h5>'+eventList(later):''):eventList(neighbors))+'</div>';
}
function openSearchResult(key){
 key=normalizeDetailKey(key);
 const entry=searchIndex.find(e=>e.key===key);if(!entry)return;prepareDetailNavigation();appState.search.searchTarget=key;for(const id of entry.states)appState.conditions.selected.add(id);appState.session.activeEventId=null;appState.conditions.category='all';$('#category').value='all';appState.layout.mode='both';$('#mode').value='both';if(appState.layout.density==='overview'){appState.layout.density='auto';$('#density').value='auto';}
 if(entry.type==='country'){const s=entry.data;if(s.end<appState.conditions.end){appState.conditions.end=timelineBounds.end;syncViewControls();}appState.layout.px=Math.max(.8,Math.min(24,(vp.clientWidth-labelWidth()-18)/(s.start-Math.max(s.end,appState.conditions.end)+1)));render();vp.scrollLeft=Math.max(0,x(s.start));scrollToSearchState(s.id);showState(s.id);}
 else if(entry.undated){render();scrollToSearchState(entry.states[0]);const r=entry.data;show('未定位的君主 · '+byId(entry.states[0]).name,'<h3 class="detailTitle">'+escapeHTML(r.name)+'</h3><p>'+escapeHTML(r.known||'在位起讫尚未可靠定位。')+'</p><p class="notice">保留于国家世系中，不将不完整年份强行放入时间线。</p>'+links(r.source?[{title:'采用的世系资料',url:r.source}]:[])+'<button data-action="state" data-id="'+entry.states[0]+'">查看国家世系</button>',entry.key);}
 else{if(Zhou.Time.isYear(entry.year)&&entry.year<appState.conditions.end){appState.conditions.end=timelineBounds.end;syncViewControls();}appState.layout.px=Math.max(7,appState.layout.px);render();if(Zhou.Time.isYear(entry.year))setCursor(entry.year,true);if(entry.states.length)scrollToSearchState(entry.states[0]);if(entry.type==='ruler')showRuler(entry.data.id);else if(entry.type==='person')showSearchPerson(entry);else{const savedQuery=appState.search.query;showEvent(entry.data.id);appState.search.query=savedQuery;$('#search').value=appState.search.query;appState.search.searchTarget=key;render();setCursor(entry.year,true);scrollToSearchState(entry.states[0]);}}
 renderSearchResults();document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',false));
}
