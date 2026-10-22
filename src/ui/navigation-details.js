function captureDetailFrame(){
 const dialog=$('#detail'),body=$('#detailBody'),focus=document.activeElement;
 const controls=[...(body.querySelectorAll?.('button,a,input,select,summary')||[])];
 return {view:viewAdapter.capture(),detail:dialog.open?{key:navigation.key,tag:$('#detailTag').textContent,html:body.innerHTML,top:dialog.scrollTop,bodyTop:body.scrollTop,focusIndex:controls.indexOf(focus)}:null,focus:focus?{element:focus,id:focus.id,action:focus.dataset?.action,key:focus.dataset?.id}:null};
}
function prepareDetailNavigation(){pageEffects.rememberDetail();navigation.prepare(captureDetailFrame());}
function restoreDetailView(v){viewAdapter.restore(v);}
function updateDetailBack(){const previous=navigation.frames[navigation.frames.length-1];$('#detailBack').textContent=previous?.detail?'返回上一级':previous?.view.query?'返回搜索结果':'返回时间线';}
function restoreDetailFocus(frame){
 let target;
 if(frame.detail)target=[...($('#detailBody').querySelectorAll?.('button,a,input,select,summary')||[])][frame.detail.focusIndex]||$('#detailBack');
 else if(frame.focus){const f=frame.focus;target=f.element?.isConnected?f.element:f.id?document.getElementById?.(f.id):[...document.querySelectorAll('[data-action]')].find(e=>e.dataset.action===f.action&&e.dataset.id===f.key);}
 (target||$('#search')).focus?.({preventScroll:true});
}
// Resolve through the existing search index: route prefixes, display groups and
// legacy undated ordinals are not original source IDs. Unknown/help/cluster
// details intentionally have no correction entry.
function detailCorrectionURL(key=navigation.key){
 const canonical=normalizeDetailKey(key),entry=searchIndex.find(e=>e.key===canonical);
 if(!entry||!['country','ruler','person','event'].includes(entry.type)||typeof Zhou.createCorrectionLink!=='function')return null;
 return Zhou.createCorrectionLink({topic:D.datasetId||D.timeline?.topic,id:entry.data.id,name:entry.data.name,year:appState.conditions.cursor});
}
function detailCorrectionLink(key){
 const url=detailCorrectionURL(key);
 return url?'<p class="notice" data-correction-entry="true"><a data-correction-link="true" href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer">反馈此条资料问题 ↗</a> · 打开 GitHub 预填表单，由你核对后提交。</p>':'';
}
function refreshDetailCorrectionLink(){
 const link=$('#detailBody').querySelector?.('[data-correction-link]');
 if(link){const url=detailCorrectionURL();if(url)link.setAttribute('href',url);}
}
function detailCrossLinks(key){
 const entry=searchIndex.find(e=>e.key===normalizeDetailKey(key));if(!entry||!['country','person'].includes(entry.type)||typeof Zhou.createEntityLinks!=='function')return '';
 const entries=Zhou.createEntityLinks({index:window.ZHOU_ENTITY_LINKS,data:D,search:searchService}).links(entry.type,entry.data.id);if(!entries.length)return '';
 return '<nav class="crossTopicLinks" aria-label="此条目的其他专题收录"><strong>跨卷收录</strong>'+entries.map(link=>'<a data-cross-topic="'+escapeHTML(link.datasetId)+'" href="'+escapeHTML(link.href)+'">前往【'+escapeHTML(link.name)+'】 →</a>').join('')+'<small>同一稳定ID在各卷的独立记录；不合并事实，也不表示已确认的后续活动。</small></nav>';
}
function show(tag,html,key=null){
 prepareDetailNavigation();navigation.enter(key);
 navigation.key=key;$('#detailTag').textContent=tag;$('#detailBody').innerHTML=detailCrossLinks(key)+html+detailCorrectionLink(key);updateDetailBack();if(!$('#detail').open)$('#detail').showModal();$('#detailBack').focus?.({preventScroll:true});$('#detail').scrollTop=0;$('#detailBody').scrollTop=0;pageEffects.recordVisit(key);pageEffects.share();detailSheet?.sync();
}
function backDetail(){
 pageEffects.rememberDetail();const frame=navigation.back();if(!frame){closeDetail();return;}navigation.pending=null;restoreDetailView(frame.view);
 if(frame.detail){navigation.key=frame.detail.key;$('#detailTag').textContent=frame.detail.tag;$('#detailBody').innerHTML=frame.detail.html;refreshDetailCorrectionLink();updateDetailBack();restoreDetailFocus(frame);$('#detail').scrollTop=frame.detail.top;$('#detailBody').scrollTop=frame.detail.bodyTop;}
 else{navigation.key=null;appState.session.activePersonId=appState.session.figureHighlight?.kind==='person'?appState.session.figureHighlight.id:null;render();$('#detail').close();navigation.frames=[];restoreDetailFocus(frame);}pageEffects.updateStudy();pageEffects.share();detailSheet?.sync();
}
function closeDetail(restore=true){pageEffects.rememberDetail();navigation.key=null;appState.session.activePersonId=appState.session.figureHighlight?.kind==='person'?appState.session.figureHighlight.id:null;render();const root=navigation.frames[0];navigation.pending=null;navigation.frames=[];if(restore&&root)restoreDetailView(root.view);$('#detail').close();if(root)restoreDetailFocus({...root,detail:null});pageEffects.updateStudy();pageEffects.share();detailSheet?.sync();}
// Section jumps stay inside the existing dialog: no new route, history frame,
// scroll owner or Escape handler. Native button inputs retain keyboard activation.
function detailSectionNavigation(hasUndated=false){
 const entries=[['detail-dating','纪年与异说'],['detail-sources','史源核查'],...(hasUndated?[['undated-lineage','未定年世系']]:[])];
 return '<nav class="detailSectionNav" aria-label="详情章节">'+entries.map(([id,label])=>'<input type="button" id="jump-'+id+'" value="'+label+'" aria-label="跳至'+label+'" aria-controls="'+id+'" data-detail-section="'+id+'">').join('')+'</nav>';
}
function focusDetailSection(id){
 if(!['detail-dating','detail-sources','undated-lineage'].includes(id))return false;
 const section=$('#detailBody').querySelector?.('#'+id);
 if(!section)return false;
 section.focus?.({preventScroll:true});section.scrollIntoView?.({block:'start',inline:'nearest',behavior:'auto'});return true;
}
function chronologyOpinionDate(opinion){
 const valid=Zhou.Time.isYear;
 if(valid(opinion.start)&&valid(opinion.end))return range(opinion.start,opinion.end);
 if(valid(opinion.year))return fmt(opinion.year);
 if(valid(opinion.start))return fmt(opinion.start)+'—终点未定';
 if(valid(opinion.end))return '起点未定—'+fmt(opinion.end);
 return '未列出可定位的年份或区间';
}
function chronologyDatingDetails(record){
 const d=record.dating,alternatives=d?.alternatives||[];
 // Non-disputed legacy detail wording remains unchanged, including the Zhou
 // source qualification. Never infer an alternative from dates in free text.
 if(d?.level!=='disputed'&&!alternatives.length)return datingDetails(d);
 const adopted=Zhou.Time.isYear(record.year)?eventDateLabel(record):range(record.start,record.end,Boolean(record.approx||record.approxStart||record.approxEnd));
 return datingDetails({...d,alternatives:[]})+'<div class="chronologyComparison" aria-label="本图采用与已有异说对照"><article class="chronologyAdopted"><h5>本图采用的图示定位</h5><strong class="chronologyDate">'+escapeHTML(adopted)+'</strong><p class="notice">用于图上定位，不表示已裁决其他纪年或口径。</p>'+links(d?.sources||[])+'</article>'+alternatives.map(a=>'<article class="chronologyAlternative"><h5>'+escapeHTML(a.label)+'</h5><strong class="chronologyDate">'+escapeHTML(chronologyOpinionDate(a))+'</strong><p>'+escapeHTML(a.explanation)+'</p>'+links(a.sources||[])+'</article>').join('')+'</div>'+(alternatives.length<2?'<p class="notice chronologyCoverage">'+(d?.reviewStatus==='legacy'?'旧资料':'现有资料')+'尚不足双口径对照；仅列已有记录，未补造第二项异说。未给出的年份不作推算。</p>':'')+'<details class="dateOpinions"><summary>如何阅读不同纪年与口径 · '+alternatives.length+'项已有记录</summary><p class="notice">图示定位与异说分别保留；差异可能来自起讫、元年或终结口径，须结合各项原说明与来源核查，不能只凭数字判断。</p></details>';
}
function undatedLineageDetails(state){
 if(!state.undated?.length)return '';
 return '<section class="detailSection" id="undated-lineage" tabindex="-1" aria-labelledby="undated-lineage-title"><h4 id="undated-lineage-title">未定位的君主与前期领袖</h4><p class="notice">以下按原资料世系顺序列出，序号不是定年位置；记载中的个别年份不等于完整在位区间，不放入时间轴。</p><ol class="undatedLineage">'+state.undated.map(r=>'<li id="'+escapeHTML(r.id)+'" data-undated-id="'+escapeHTML(r.id)+'"><button class="listitem" data-action="searchHit" data-id="undated:'+escapeHTML(r.id)+'">'+escapeHTML(r.name)+(r.person?' · '+escapeHTML(r.person):'')+'<small>'+escapeHTML(r.known||'在位起讫不详')+'</small></button></li>').join('')+'</ol></section>';
}
// Restored detail HTML can contain an older reference-line year. Refresh on
// restore and immediately before native link activation (including middle-click
// and the context menu), without intercepting navigation or submitting an Issue.
for(const type of ['click','auxclick','contextmenu','focusin'])$('#detailBody').addEventListener(type,event=>{
 const link=event.target.closest?.('[data-correction-link]');if(!link)return;
 const url=detailCorrectionURL();if(url)link.setAttribute('href',url);else event.preventDefault();
});
$('#detailBody').addEventListener('click',event=>{
 const control=event.target.closest?.('[data-detail-section]');
 if(control)focusDetailSection(control.dataset.detailSection);
});
function sameYearTenureDetails(state,ruler){
 const peers=state.rulers.filter(r=>r.start===ruler.start||r.end===ruler.start);if(peers.length<2)return '';
 return '<section class="detailSection sameYearTenures"><h4>'+fmt(ruler.start)+'起讫的任期条目</h4><p class="notice">按原资料展示次序列出；年级精度不能确定年内月日、真实继承顺序或全年并立。同一人物复位仍保留独立任期。</p>'+peers.map((r,i)=>'<button class="listitem" data-action="ruler" data-id="'+escapeHTML(r.id)+'"'+(r.id===ruler.id?' disabled aria-current="true"':'')+'>展示 '+(i+1)+' · '+escapeHTML(r.name)+'<small>'+range(r.start,r.end,r.approx)+' · '+escapeHTML(r.role||'任期')+'</small></button>').join('')+'</section>';
}
function showRuler(id){
 const s=D.states.find(s=>s.rulers.some(r=>r.id===id));if(!s)return;const r=s.rulers.find(r=>r.id===id);
 const es=historyService.eventsInRange({from:rulerComparisonStart(r),to:r.end,states:[s.id]});
 const linkedPerson=r.personId?historyService.person(r.personId):null;
  const bio=r.biography||{summary:r.description||linkedPerson?.summary||'个人生平记载尚待补充。',sources:linkedPerson?.sources||[]};
 const ministers=(r.ministers||[]).map(m=>'<article class="ministerCard"><h5>'+personButton(m.id,m.name)+' <span>'+escapeHTML(m.role)+'</span></h5><p class="relation">'+escapeHTML(m.relation||'')+'</p><p>'+escapeHTML(m.summary)+'</p>'+links(m.sources||[])+'</article>').join('');
 const sources=[...(r.source?[{title:isZhouTopic&&r.source.includes('wikisource')?'《史记》相关年表':'采用的君主纪年表（汇编，待逐条校勘）',url:r.source}]:[]),...(r.sources||[]),...(bio.sources||[])].filter(v=>v?.url).filter((v,i,a)=>a.findIndex(w=>w.url===v.url)===i);
 show(s.name+' · '+r.role,'<h3 class="detailTitle">'+escapeHTML(r.name)+'</h3>'+detailSectionNavigation()+(r.associationNote?'<p class="notice">'+escapeHTML(r.associationNote)+'</p>':'')+'<span class="datebadge">'+range(r.start,r.end,r.approx)+'</span>'+(linkedPerson?'<p class="notice">人物档案：'+personButton(linkedPerson.id,linkedPerson.name)+'</p>':'')+(r.person?'<p class="notice">本名 / 记载名：'+escapeHTML(r.person)+'</p>':'')+'<div class="detailSection"><h4>简要生平</h4><p class="bioScope">'+escapeHTML(bio.detailLevel||'记载摘要')+'</p><p>'+escapeHTML(bio.summary)+'</p>'+(bio.note?'<p class="notice">'+escapeHTML(bio.note)+'</p>':'')+'</div><div class="detailSection"><h4>关键臣子与将领</h4>'+ (ministers||'<p class="notice">'+escapeHTML(r.ministerCoverage||'尚未收录可靠的相关人物资料。')+'</p>')+'</div><section class="detailSection" id="detail-dating" tabindex="-1" aria-label="纪年可信度与不同说法"><h4>纪年可信度与不同说法</h4>'+chronologyDatingDetails(r)+'</section><div class="detailSection"><h4>即位、元年与结局</h4>'+chronologyDetails(r)+(r.note?'<p>'+escapeHTML(r.note)+'</p>':'')+'</div><div class="warning">'+(r.approx?'此区间含推定或争议年代。':'采用年级精度；同年更替不表示两人全年同时在位。')+' 多数区间采用元年纪年，实际即位可能在前一年。'+escapeHTML(s.note)+'</div>'+sameYearTenureDetails(s,r)+'<div class="detailSection"><h4>期间已收录事件 · '+es.length+'</h4>'+eventList(es)+'</div><section class="detailSection" id="detail-sources" tabindex="-1" aria-label="核查来源"><h4>核查来源</h4>'+links(sources)+'</section><div class="related"><button data-action="state" data-id="'+s.id+'">查看'+s.name+'全部世系</button><button data-action="locate" data-id="'+r.start+'">定位在位起点</button></div>','ruler:'+id);
}
const eventList=es=>es.length?es.sort((a,b)=>b.year-a.year).map(e=>'<button class="listitem" data-action="event" data-id="'+e.id+'">'+range(e.year,isIntervalEvent(e)?e.endYear:e.year,e.approx)+' · '+escapeHTML(e.name)+'<small>'+e.kind+' · '+e.states.map(id=>byId(id).name).join('、')+'</small></button>').join(''):'<p class="notice">这一时期的重大事件尚未收录。</p>';
function focusEvent(id){const e=D.events.find(e=>e.id===id);if(!e)return;appState.session.activeEventId=id;appState.search.searchTarget=null;if(appState.layout.density==='overview'){appState.layout.density='auto';$('#density').value='auto';}appState.search.query='';$('#search').value='';appState.conditions.category='all';$('#category').value='all';appState.layout.mode='both';$('#mode').value='both';for(const state of e.states)appState.conditions.selected.add(state);if(e.year<appState.conditions.end){appState.conditions.end=timelineBounds.end;syncViewControls();}appState.layout.px=Math.max(7,appState.layout.px);const referenceYear=eventReferenceYear(e);setCursor(referenceYear);render();setCursor(referenceYear,true);}
function renderEventFocus(){const e=activeEvent(),box=$('#eventFocus');box.hidden=!e;if(!e){box.innerHTML='';return;}box.innerHTML='<div class="focusHeading"><strong>'+eventDateLabel(e)+' · '+escapeHTML(e.name)+'</strong>'+certaintyBadge(e.dating)+'<button data-action="relatedOnly" data-id="'+e.id+'">仅比较相关国家</button><button data-action="event" data-id="'+e.id+'">事件详情</button><button data-action="clearEvent" aria-label="清除事件联动">清除联动</button></div><div class="focusCountries">'+e.states.map(id=>{const state=byId(id),rulers=rulersAt(state,eventReferenceYear(e));return '<span class="focusCountry"><b>'+state.name+'</b> '+(rulers.length?rulers.map(r=>'<button data-action="ruler" data-id="'+r.id+'">'+escapeHTML(r.name)+'</button>').join(' / '):'君主纪年待考')+'</span>';}).join('')+'</div><div class="focusPeople">'+(e.participants.length?'<span>相关人物</span>'+e.participants.map((p,i)=>'<button class="personChip" data-action="participant" data-id="'+e.id+':'+i+'" title="'+escapeHTML(p.relation)+'">'+escapeHTML(p.name)+' · '+byId(p.state).name+'</button>').join(''):'<span class="notice">'+escapeHTML(e.participantCoverage)+'</span>')+'</div>';}
function showEvent(id){const e=D.events.find(e=>e.id===id);if(!e)return;prepareDetailNavigation();focusEvent(id);
 const contemporaries=e.states.map(id=>{const state=byId(id);return '<article class="contemporary"><b>'+state.name+'</b><div>'+ (rulersAt(state,eventReferenceYear(e)).map(r=>'<button data-action="ruler" data-id="'+r.id+'">'+escapeHTML(r.name)+' · '+range(r.start,r.end,r.approx)+'</button>').join('')||'<p class="notice">君主纪年待考</p>')+'</div></article>';}).join('');
 show(e.kind+' · 列国事件','<h3 class="detailTitle">'+escapeHTML(e.name)+'</h3>'+detailSectionNavigation()+'<span class="datebadge">'+range(e.year,isIntervalEvent(e)?e.endYear:e.year,e.approx)+'</span><section id="detail-dating" tabindex="-1" aria-label="纪年与异说">'+chronologyDatingDetails(e)+'</section>'+eventNarrative(e)+'<div class="detailSection"><h4>'+(isIntervalEvent(e)?'参考年 '+fmt(eventReferenceYear(e))+'在位君主':'当年在位君主')+'</h4>'+(isIntervalEvent(e)?'<p class="notice">仅列参考年在位者，不表示其贯穿整个事件区间或全程参与。</p>':'')+'<p class="notice">用于同年对照；已核实的实际即位年一并纳入，条带仍采用年表起点。在位不等于亲自参战或参与此事。</p>'+contemporaries+'</div><div class="detailSection"><h4>已收录的相关人物</h4><p class="notice">'+escapeHTML(e.participantCoverage)+'</p>'+e.participants.map(participantCard).join('')+'</div><section class="detailSection" id="detail-sources" tabindex="-1" aria-label="原典与纪年核查"><h4>原典与纪年核查</h4><p class="notice">原典提供记载，'+(isZhouTopic?'公元前年份由纪年表换算':'年代由采用的纪年表换算')+'；有异说时分别列明。</p>'+links(e.sources)+'</section><div class="related"><button data-action="eventChart" data-id="'+e.id+'">查看图上联动</button></div>','event:'+id);
}
function showState(id){const s=byId(id);if(!s)return;
 const sources=[...(isZhouTopic?[D.sources[2],D.sources[3]].filter(Boolean):D.sources||[]),...(s.sources||[])];
 show(isZhouTopic&&s.id==='zhou'?'周王室 · 参照':'政权 · '+(s.region||s.name),'<h3 class="detailTitle">'+escapeHTML(s.name)+'</h3>'+detailSectionNavigation(Boolean(s.undated?.length))+'<span class="datebadge">'+range(s.start,s.end,s.approxStart||s.approxEnd)+'</span><section id="detail-dating" tabindex="-1" aria-label="纪年与异说">'+chronologyDatingDetails(s)+'</section><p>'+escapeHTML(s.ending)+'</p><div class="warning">'+escapeHTML(s.note)+' 起点为约年时，线段左端仅为示意。</div><div class="detailSection"><h4>君主 / 领袖 · '+s.rulers.length+'个在位区间</h4>'+s.rulers.map(r=>'<button class="listitem" data-action="ruler" data-id="'+r.id+'">'+escapeHTML(r.name)+(r.person?' · '+escapeHTML(r.person):'')+'<small>'+range(r.start,r.end,r.approx)+' · '+r.role+'</small></button>').join('')+'</div>'+undatedLineageDetails(s)+'<div class="detailSection"><h4>重大事件</h4>'+eventList(D.events.filter(e=>e.states.includes(s.id)))+'</div><section class="detailSection" id="detail-sources" tabindex="-1" aria-label="核查来源"><h4>核查来源</h4>'+links(sources)+'</section>','country:'+id);
}
function showAbout(){if(!isZhouTopic){show('资料与纪年','<h3 class="detailTitle">'+escapeHTML(D.title||'历史对照图')+'</h3><p>横向是共同年代，纵向是政权。相同年份上下对照；条带表示已收录的任期，事件可查看详情。</p><div class="detailSection"><h4>范围与分期</h4><p>'+range(timelineBounds.start,timelineBounds.end)+'</p><p>'+timelinePeriods.map(p=>escapeHTML(p.name)+' · '+range(p.start,p.end)).join('；')+'</p></div><p>'+escapeHTML(D.metadata?.scopeNote||'仅展示资料中已收录的政权、任期与事件；空白不代表没有历史。')+'</p><p>公元前与公元纪年明确区分，没有公元0年。年份未定的记录不放入时间线。</p><div class="detailSection"><h4>来源</h4>'+links(D.sources||[])+'</div>');return;}show('资料与纪年','<h3 class="detailTitle">如何读这张对照图</h3><p>横向是共同年代，纵向是国家。相同年份上下对照；君主条是所采用年表的在位区间，菱形是精选事件，红色端点表示终结或身份转变。</p><div class="warning">这是可继续校勘的资料集。君主起讫以检索汇编为底表，重大事件参照《史记》相关篇目。君主结局尚未逐条核实，详情会明确标注。</div><div class="detailSection"><h4>范围与分期</h4><p>覆盖周王室与17个主要诸侯国；从约前1046年到前256年，可延伸到前221年。春秋段从前770年起，战国段从前475年起；前453年、前403年也是不同研究中的战国起点。本图分区是阅读约定。</p><p>西周前841年以前的精确年代多属推定。斜线君主条与虚线存续线表示约年、传统推定或争议。</p></div><div class="detailSection"><h4>即位、元年、同年更替</h4><p>元年常在实际即位的次年，不能把年表的第一年一概理解为即位日期。图按整年绘制，同年发生的短期君主分层显示，未尝试推断月份。</p></div><div class="detailSection"><h4>灭亡与复国</h4><p>陈、蔡的复国显示为线段中断；齐的姜氏与田氏、晋与曲沃分别分层。晋终结、越瓦解采用一系口径并标争议。赵、燕保留残余政权直到前222年。卫延续到前209年，超出图范围时显示延续标记。</p></div><div class="detailSection"><h4>人物简介</h4><p>君主详情提供简要生平与关联臣子、将领的介绍，并标明任职或关联身份。已补充'+D.peopleCoverage.detailedRulerIntervals+'个在位区间的生平简介，'+D.peopleCoverage.ministerProfiles+'位已收录人物；其他区间提供纪年与记载摘要。未收录人物不表示没有辅臣。</p></div><div class="detailSection"><h4>覆盖情况</h4><p>'+D.states.reduce((n,s)=>n+s.rulers.length,0)+'个有起讫的在位区间，'+D.states.reduce((n,s)=>n+s.undated.length,0)+'项未定位君主 / 前期领袖，'+D.events.length+'条精选重大事件。空白与无事件提示表示未收录，不是历史空白。</p></div><div class="detailSection"><h4>缩放、事件与研究组合</h4><p>自动密度分为远景、常规、细节：缩小时保留国家兴亡与精选关键事件，放大后逐步显示君主姓名、年份与具体事件。点击事件会联动相关国家、当年君主与已核实的人物；在位不等于亲自参与。</p><p>国家旁的“钉”固定该行到上方，滚动时保持可见。研究组合保存选择、顺序、固定行、行高与时间范围，默认保存在当前浏览器，可导出、导入以跨设备使用。</p><p>可信度指图示年代：较确定表示年表定位较稳定，推定表示约年或传统推算，存在异说表示已有不同纪年或口径。人物结局的核实程度另列。</p></div><div class="detailSection"><h4>来源</h4>'+links(D.sources)+'</div><p class="notice">资料整理：'+D.updated+' · '+D.version+'</p>');}

function openDetailKey(key){
 if(key.startsWith('person:'))showPerson(key.slice(7));else if(key.startsWith('ruler:'))showRuler(key.slice(6));else if(key.startsWith('country:'))showState(key.slice(8));else if(key.startsWith('event:'))showEvent(key.slice(6));else if(key.startsWith('cluster:')){const events=key.slice(8).split(',').map(historyService.event);show('密集事件 · 按年代展开','<h3 class="detailTitle">'+events.length+'条事件</h3>'+eventList(events),key);}else openSearchResult(key);
}
