'use strict';
const D=window.ZHOU_DATA,historyService=Zhou.createHistory(D),searchService=Zhou.createSearch(D),storage=Zhou.createStorage(()=>localStorage);
const $=s=>document.querySelector(s),byId=historyService.state;
const normalizeDetailKey=searchService.normalizeKey;
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=y=>'前'+y+'年',range=(a,b,approx=false)=>(approx?'约 ':'')+(a===b?fmt(a):'前'+a+'—'+b+'年');
const links=arr=>'<div class="sourceLinks">'+arr.map(s=>'<a href="'+escapeHTML(s.url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(s.title)+' ↗</a>').join('')+'</div>';
const appState=Zhou.createApplicationState(D),navigation=Zhou.createNavigation();
appState.layout=Zhou.readLayout(storage.read('zhou-layout-v2',null),appState.layout,D.states.map(s=>s.id));
function saveLayout(){try{storage.write('zhou-layout-v2',{order:appState.layout.stateOrder,rowHeight:appState.layout.rowHeight,viewHeight:appState.layout.viewHeight,fitRows:appState.layout.fitRows,rowHeights:appState.layout.rowHeights});}catch{}}
const builtInCombos=[
 {id:'builtin-seven',name:'战国七雄',states:['qin','qi','chu','yan','han','zhao','liang'],from:475,to:221},
 {id:'builtin-reform',name:'秦—魏变法',states:['qin','liang'],from:453,to:300},
 {id:'builtin-hegemony',name:'晋—楚争霸',states:['jin','chu'],from:700,to:500},
 {id:'builtin-confucius',name:'鲁—卫—齐',states:['lu','wei','qi'],from:600,to:450}
];
try{const p=storage.read('zhou-pins-v3',[]);if(Array.isArray(p))appState.layout.pinned=new Set(p.filter(id=>byId(id)));const c=storage.read('zhou-comparisons-v3',[]);if(Array.isArray(c))appState.session.savedCombos=c.map(normalizeCombo).filter(Boolean).slice(0,30);}catch{}
const vp=$('#viewport'),chart=$('#chart');
const labelWidth=()=>window.matchMedia('(max-width:680px)').matches?88:124;
const x=y=>(1046-y)*appState.layout.px;
const includedEvents=s=>historyService.eventsInRange({from:1046,to:appState.conditions.end,states:[s.id],category:appState.conditions.category});
const {normalizeSearch,rulerAliases,personAliases,countryAliases,narrativeText}=Zhou;
const containsSearch=(texts,q=appState.search.query)=>Boolean(normalizeSearch(q))&&texts.some(t=>normalizeSearch(t).includes(normalizeSearch(q)));
const matchRuler=(r,q=appState.search.query)=>containsSearch([...rulerAliases(r),...(r.ministers||[]).flatMap(m=>personAliases(m.name)),...(appState.search.searchDescriptions?[r.description,r.biography?.summary]:[])],q);
const matchEvent=(e,q=appState.search.query)=>containsSearch([e.name,...(e.participants||[]).flatMap(p=>personAliases(p.name)),...(appState.search.searchDescriptions?[narrativeText(e)]:[])],q);
const searchIndex=buildSearchIndex();
const matches=s=>{if(!appState.search.query)return true;const hits=searchMatches(),countries=hits.filter(h=>h.entry.type==='country'&&h.score===200);return (countries.length?countries:hits).some(hit=>hit.entry.states.includes(s.id));};
const densityLevel=()=>appState.layout.density==='overview'?'overview':appState.layout.density==='full'?'detail':appState.layout.px<2.4?'overview':appState.layout.px<7?'standard':'detail';
const activeEvent=()=>D.events.find(e=>e.id===appState.session.activeEventId);
const certaintyLabel={certain:'较确定',inferred:'推定',disputed:'存在异说'};
const certaintyShort={certain:'定',inferred:'推',disputed:'异'};
function certaintyBadge(d,short=false){const level=d?.level||'inferred';return '<span class="certainty '+level+'" title="'+escapeHTML(d?.reason||'尚待校勘')+'">'+(short?certaintyShort[level]:certaintyLabel[level])+'</span>';}
function datingDetails(d){return '<div class="datingBlock">'+certaintyBadge(d)+'<p class="notice">'+escapeHTML(d?.reason||'纪年依据尚待补充')+'</p><p class="notice">'+({legacy:'沿用资料：尚未逐条复核。',partial:'部分校核：差异已列明，仍有待考事项。',reviewed:'本条纪年及所列依据已核对；不代表相关生平已全部核实。'}[d?.reviewStatus]||'校核状态待补充。')+'</p>'+(d?.alternatives?.length?'<details class="dateOpinions"><summary>展开不同纪年与口径 · '+d.alternatives.length+'项</summary>'+d.alternatives.map(a=>'<article><b>'+escapeHTML(a.label)+(a.year?' · '+fmt(a.year):'')+'</b><p>'+escapeHTML(a.explanation)+'</p>'+links(a.sources||[])+'</article>').join('')+'</details>':'')+'</div>';}
function chronologyDetails(r){const c=r.chronology||{};return '<div class="chronologyGrid">'+[['实际即位 / 承位',c.accession],['元年 / 图示起点',c.regnalStart??r.start],['退位 / 传位',c.abdication],['去世',c.death]].map(([name,year])=>'<div><span>'+name+'</span><strong>'+(year?fmt(year):'尚未核实 / 未收录')+'</strong></div>').join('')+'</div><p>图示终点：'+fmt(r.end)+' · '+escapeHTML(c.endKind||'具体性质待核实')+'</p>'+(c.changes||[]).map(m=>'<p>'+fmt(m.year)+' · '+escapeHTML(m.label)+'</p>').join('')+(c.note?'<p class="notice">'+escapeHTML(c.note)+'</p>':'')+'<p class="notice">元年是所采用年表的纪年起点；空缺日期不会由图示区间自动推算。去世日期可在本图范围之外。</p>'+links(c.sources||[]);}
const rulerComparisonStart=historyService.comparisonStart;
const rulersAt=historyService.rulersAt;
function participantCard(p){return '<article class="ministerCard eventPerson"><h5>'+personButton(p.id,p.name)+' <span>'+escapeHTML(byId(p.state)?.name||'')+'</span></h5><p class="relation">'+escapeHTML(p.relation)+'</p><p>'+escapeHTML(p.summary)+'</p>'+links(p.sources||[])+'</article>';}
function buildSearchIndex(){return searchService.index;}
let searchResultCache=null;
function searchMatches(q=appState.search.query){
 const states=[...new Set([...appState.conditions.selected,...appState.layout.pinned])],key=JSON.stringify([q,appState.search.searchScope,appState.search.searchDescriptions,appState.search.searchScope==='selected'?states:[]]);
 if(searchResultCache?.key!==key)searchResultCache={key,hits:searchService.search(q,{scope:appState.search.searchScope,descriptions:appState.search.searchDescriptions,states})};
 return searchResultCache.hits;
}
