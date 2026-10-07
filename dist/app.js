'use strict';
const D=window.ZHOU_DATA,$=s=>document.querySelector(s),byId=id=>D.states.find(s=>s.id===id);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=y=>'前'+y+'年',range=(a,b,approx=false)=>(approx?'约 ':'')+(a===b?fmt(a):'前'+a+'—'+b+'年');
const links=arr=>'<div class="sourceLinks">'+arr.map(s=>'<a href="'+escapeHTML(s.url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(s.title)+' ↗</a>').join('')+'</div>';
let px=4,end=256,selected=new Set(D.states.map(s=>s.id)),query='',mode='both',category='all',cursor=770,visibleStates=[],rowLayouts=new Map();
const vp=$('#viewport'),chart=$('#chart');
const labelWidth=()=>window.matchMedia('(max-width:680px)').matches?88:124;
const x=y=>(1046-y)*px;
const includedEvents=s=>D.events.filter(e=>e.states.includes(s.id)&&e.year>=end&&(category==='all'||e.kind===category));
const matchRuler=(r,q=query)=>[r.name,r.person,r.role,r.description].some(t=>String(t??'').includes(q));
const matches=s=>!query||[s.name,s.region].some(t=>t.includes(query))||s.rulers.some(r=>matchRuler(r))||s.undated.some(r=>matchRuler(r))||includedEvents(s).some(e=>[e.name,e.description].some(t=>t.includes(query)));
function setPeriod(name){
 document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',b.dataset.period===name));
 const width=vp.clientWidth-labelWidth()-65;
 const spans={all:[1046,end],west:[1046,771],spring:[770,476],war:[475,end]};const [a,b]=spans[name];
 px=Math.max(.8,Math.min(24,width/(a-b+1)));render();vp.scrollLeft=Math.max(0,x(a));setCursor(a,false);
}
function packRulers(s){
 const result=[],ends=[];
 const ordered=s.rulers.filter(r=>r.start>=end&&r.end<=1046).sort((a,b)=>b.start-a.start||a.lane-b.lane);
 for(const r of ordered){let lane=r.lane||0;while(ends[lane]!=null&&r.start>=ends[lane])lane++;ends[lane]=r.end;result.push({...r,displayLane:lane});}
 return {rulers:result,lanes:Math.max(1,ends.length)};
}
function render(){
 const oldScroll=vp.scrollLeft;const w=(1046-end+1)*px+160;
 visibleStates=D.states.filter(s=>selected.has(s.id)&&matches(s));
 chart.style.width=(w+labelWidth())+'px';chart.className=mode==='overview'?'overview':'';
 const eras=[{a:1046,b:771,name:'西周',color:'#64796d'},{a:770,b:476,name:'春秋',color:'#355e68'},{a:475,b:256,name:'战国',color:'#8d734c'}];
 if(end===221)eras.push({a:255,b:221,name:'周亡后 · 秦统一',color:'#79696a'});
 let html='<div class="axis"><div class="corner">国家 / 年代</div><div class="axisTrack" style="width:'+w+'px">';
 for(const era of eras)html+='<div class="era" style="left:'+x(era.a)+'px;width:'+((era.a-era.b+1)*px)+'px;background:'+era.color+'">'+era.name+'</div>';
 const step=px>=12?5:px>=5?10:px>=2?25:50;
 for(let year=1050;year>=end;year-=step){if(year>1046)continue;html+='<div class="tick" style="left:'+x(year)+'px">前'+year+'</div>';}
 html+='</div></div>';
 rowLayouts=new Map();
 for(const s of visibleStates){
  const packed=packRulers(s),isOverview=mode==='overview',rulerVisible=mode==='both'||mode==='rulers',eventVisible=mode==='both'||mode==='events';
  const lanes=rulerVisible?packed.lanes:1,eventTop=(rulerVisible?32+lanes*36:35)+5;
  const height=isOverview?72:Math.max(104,eventTop+36);
  rowLayouts.set(s.id,{height,eventTop});
  html+='<div class="stateRow" data-state="'+s.id+'" style="height:'+height+'px"><button class="stateLabel" data-action="state" data-id="'+s.id+'" aria-label="查看'+s.name+'的历史"><b style="color:'+s.color+'">'+s.name+'</b><small>'+ (s.id==='zhou'?'天子 · 参照':s.id==='liang'?'安邑 → 大梁':s.id==='yue'?'起源待考':s.id==='han'||s.id==='zhao'?'分晋 → 列侯':'点击查看世系')+'</small></button><div class="track" style="width:'+w+'px;height:'+height+'px;background-size:'+(step*px)+'px 100%;background-position:'+x(Math.floor(1046/step)*step)+'px 0">';
  let segments=[{start:s.start,end:Math.max(s.end,end)}];
  for(const gap of s.interruptions){segments=segments.flatMap(seg=>gap.start<=seg.start&&gap.end>=seg.end?[{start:seg.start,end:gap.start+1},{start:gap.end-1,end:seg.end}]:[seg]);}
  for(const seg of segments){if(seg.start<end)continue;html+='<div class="lifeline '+(s.approxStart?'uncertainLife':'')+'" style="left:'+x(seg.start)+'px;width:'+Math.max(0,(seg.start-seg.end+1)*px)+'px;background:'+s.color+'"></div>';}
  if(rulerVisible){
   for(const r of packed.rulers){
    if(s.interruptions.some(g=>r.start<=g.start&&r.end>=g.end))continue;
    const b=Math.max(r.end,end),width=(r.start-b+1)*px;
    const text=width>35?escapeHTML(r.name)+(width>140&&r.person?' · '+escapeHTML(r.person):''):'';
    html+='<button class="ruler '+(r.approx?'approx ':'')+(query&&matchRuler(r)?'match':'')+'" data-action="ruler" data-id="'+r.id+'" style="left:'+x(r.start)+'px;width:'+Math.max(2,width)+'px;top:'+(32+r.displayLane*36)+'px;background-color:'+s.color+';opacity:'+(query&&!matchRuler(r)?'.35':'.94')+'" title="'+escapeHTML(r.name+' '+range(r.start,r.end,r.approx))+'" aria-label="'+escapeHTML(r.name+'，'+range(r.start,r.end,r.approx))+'">'+text+'</button>';
   }
   const first=packed.rulers.reduce((a,r)=>Math.max(a,r.start),0);
   if(first<s.start&&x(first)-x(s.start)>70)html+='<button class="event gap" data-action="state" data-id="'+s.id+'" style="left:'+(x(s.start)+8)+'px;top:36px">早期纪年待考</button>';
  }
  if(eventVisible){
   const es=includedEvents(s).filter(e=>!query||e.name.includes(query)||e.description.includes(query)||s.name.includes(query)).sort((a,b)=>b.year-a.year);
   const groups=[];
   for(const ev of es){const last=groups.at(-1);if(last&&x(ev.year)-x(last[0].year)<(px>=10?75:105))last.push(ev);else groups.push([ev]);}
   for(const group of groups){const ev=group[0];
    if(group.length===1)html+='<button class="event" data-action="event" data-id="'+ev.id+'" style="left:'+x(ev.year)+'px;top:'+eventTop+'px" title="'+escapeHTML(fmt(ev.year)+' · '+ev.name)+'"><i></i><span>'+escapeHTML(ev.name)+'</span></button>';
    else html+='<button class="event cluster" data-action="cluster" data-id="'+group.map(e=>e.id).join(',')+'" style="left:'+x(ev.year)+'px;top:'+eventTop+'px" title="'+group.length+'件事件"><i></i><span>'+escapeHTML(ev.name)+' · '+group.length+'</span></button>';
   }
  }
  if(s.end>=end)html+='<button class="event termination" data-action="state" data-id="'+s.id+'" style="left:'+x(s.end)+'px;top:'+(isOverview?20:17)+'px;height:'+(isOverview?32:52)+'px">'+(s.approxEnd?'约 ':'')+'前'+s.end+' '+(s.id==='qin'?'称帝':s.id==='jin'?'终结争议':s.id==='yue'?'中心瓦解':'终止')+'</button>';
  else if(end===221&&(s.id==='wei'))html+='<div class="gap" style="left:'+(x(221)+8)+'px">延续至前209年</div>';
  html+='</div></div>';
 }
 if(!visibleStates.length)html+='<div class="empty">没有匹配的国家、君主或事件。请修改关键词或国家筛选。</div>';
 html+='<div class="cursorline" style="left:'+(x(cursor)+labelWidth())+'px"><span class="cursorBadge">前'+cursor+'</span></div>';
 chart.innerHTML=html;vp.scrollLeft=oldScroll;$('#zoomLabel').textContent=Number(px.toFixed(1))+' px / 年';$('#filterCount').textContent=selected.size;
 $('#stats').innerHTML=[['18','国家与王室'],[D.states.reduce((n,s)=>n+s.rulers.length,0),'在位区间'],[D.events.length,'精选事件']].map(([n,t])=>'<div class="number"><b>'+n+'</b><span>'+t+'</span></div>').join('');
 updateRange();updateCompare();
}
function updateRange(){const left=Math.min(1046,Math.max(end,1046-Math.floor(vp.scrollLeft/px)));const right=Math.max(end,1046-Math.floor((vp.scrollLeft+vp.clientWidth-labelWidth())/px));$('#visibleRange').textContent='可见：前'+left+'—'+right+'年 · '+visibleStates.length+'行';}
function setCursor(y,scroll=false){cursor=Math.round(Math.min(1046,Math.max(end,y)));$('#cursorYear').value=-cursor;$('#cursorOutput').textContent=fmt(cursor);$('#selectionYear').textContent='年份参考线：'+fmt(cursor);$('#compareTitle').textContent=fmt(cursor)+'的列国';const line=$('.cursorline');if(line){line.style.left=(x(cursor)+labelWidth())+'px';line.firstChild.textContent='前'+cursor;}updateCompare();if(scroll)vp.scrollLeft=Math.max(0,x(cursor)-(vp.clientWidth-labelWidth())/2);}
function updateCompare(){
 $('#compare').innerHTML=visibleStates.filter(s=>s.start>=cursor&&s.end<=cursor).map(s=>{
  const gap=s.interruptions.find(g=>cursor<=g.start&&cursor>=g.end);const rulers=gap?[]:s.rulers.filter(r=>r.start>=cursor&&r.end<=cursor);
  const es=D.events.filter(e=>e.year===cursor&&e.states.includes(s.id));
  return '<button class="comparecard" data-action="state" data-id="'+s.id+'" style="--statecolor:'+s.color+'"><strong>'+s.name+'</strong><span>'+ (gap?escapeHTML(gap.note):rulers.length?rulers.map(r=>(r.approx?'约 · ':'')+escapeHTML(r.name)).join(' / '):'君主纪年待考')+'</span><small>'+ (es.length?escapeHTML(es.map(e=>e.name).join('；')):'该年无已收录大事')+'</small></button>';
 }).join('')||'<p class="notice">该年没有符合当前筛选的国家。</p>';
}
function show(tag,html){$('#detailTag').textContent=tag;$('#detailBody').innerHTML=html;if(!$('#detail').open)$('#detail').showModal();}
function showRuler(id){
 const s=D.states.find(s=>s.rulers.some(r=>r.id===id));if(!s)return;const r=s.rulers.find(r=>r.id===id);
 const es=D.events.filter(e=>e.states.includes(s.id)&&e.year<=r.start&&e.year>=r.end);
 show(s.name+' · '+r.role,'<h3 class="detailTitle">'+escapeHTML(r.name)+'</h3><span class="datebadge">'+range(r.start,r.end,r.approx)+'</span>'+(r.person?'<p class="notice">本名 / 记载名：'+escapeHTML(r.person)+'</p>':'')+(r.description?'<p>'+escapeHTML(r.description)+'</p>':'')+'<div class="detailSection"><h4>起点与终点</h4><p>图示在位起点：'+range(r.start,r.start,r.approx)+'；终点：'+range(r.end,r.end,r.approx)+'。</p><p>'+escapeHTML(r.exit)+'</p>'+(r.note?'<p>'+escapeHTML(r.note)+'</p>':'')+'</div><div class="warning">'+(r.approx?'此区间含推定或争议年代。':'采用年级精度；同年更替不表示两人全年同时在位。')+' 多数区间采用元年纪年，实际即位可能在前一年。'+escapeHTML(s.note)+'</div><div class="detailSection"><h4>期间已收录事件 · '+es.length+'</h4>'+eventList(es)+'</div><div class="detailSection"><h4>核查来源</h4>'+links([{title:r.source.includes('wikisource')?'《史记》相关年表':'采用的君主纪年表（汇编，待逐条校勘）',url:r.source}])+ '</div><div class="related"><button data-action="state" data-id="'+s.id+'">查看'+s.name+'全部世系</button><button data-action="locate" data-id="'+r.start+'">定位在位起点</button></div>');
}
const eventList=es=>es.length?es.sort((a,b)=>b.year-a.year).map(e=>'<button class="listitem" data-action="event" data-id="'+e.id+'">'+range(e.year,e.year,e.approx)+' · '+escapeHTML(e.name)+'<small>'+e.kind+' · '+e.states.map(id=>byId(id).name).join('、')+'</small></button>').join(''):'<p class="notice">这一时期的重大事件尚未收录。</p>';
function showEvent(id){const e=D.events.find(e=>e.id===id);if(!e)return;
 show(e.kind+' · 列国事件','<h3 class="detailTitle">'+escapeHTML(e.name)+'</h3><span class="datebadge">'+range(e.year,e.year,e.approx)+'</span><p>'+escapeHTML(e.description)+'</p>'+(e.approx?'<div class="warning">此事件的定位年份含推定或争议；不据此认定确切发生日期。</div>':'')+'<div class="detailSection"><h4>相关国家</h4><div class="related">'+e.states.map(id=>'<button data-action="state" data-id="'+id+'">'+byId(id).name+'</button>').join('')+'</div></div><div class="detailSection"><h4>原典与纪年核查</h4><p class="notice">原典提供事件记载；公元前年份由现代纪年表换算。两者有异说时，以说明为准。</p>'+links([...e.sources,...(e.approx?[D.sources[2]]:[])])+'</div><div class="related"><button data-action="locate" data-id="'+e.year+'">在图中对照这一年</button></div>');
}
function showState(id){const s=byId(id);if(!s)return;
 show(s.id==='zhou'?'周王室 · 参照':'列国 · '+s.region,'<h3 class="detailTitle">'+s.name+'</h3><span class="datebadge">'+range(s.start,s.end,s.approxStart||s.approxEnd)+'</span><p>'+escapeHTML(s.ending)+'</p><div class="warning">'+escapeHTML(s.note)+' 起点为约年时，线段左端仅为示意。</div><div class="detailSection"><h4>君主 / 领袖 · '+s.rulers.length+'个在位区间</h4>'+s.rulers.map(r=>'<button class="listitem" data-action="ruler" data-id="'+r.id+'">'+escapeHTML(r.name)+(r.person?' · '+escapeHTML(r.person):'')+'<small>'+range(r.start,r.end,r.approx)+' · '+r.role+'</small></button>').join('')+'</div>'+(s.undated.length?'<div class="detailSection"><h4>未定位的君主与前期领袖</h4>'+s.undated.map(r=>'<p class="notice">'+escapeHTML(r.name)+'：'+escapeHTML(r.known||'在位起讫不详')+'</p>').join('')+'</div>':'')+'<div class="detailSection"><h4>重大事件</h4>'+eventList(D.events.filter(e=>e.states.includes(s.id)))+'</div>'+links([D.sources[2],D.sources[3]]));
}
function showAbout(){show('资料与纪年','<h3 class="detailTitle">如何读这张对照图</h3><p>横向是共同年代，纵向是国家。相同年份上下对照；君主条是所采用年表的在位区间，菱形是精选事件，红色端点表示终结或身份转变。</p><div class="warning">这是可继续校勘的首版，不是无争议的完整年表。君主起讫以检索汇编为底表，重大事件参照《史记》相关篇目。君主结局尚未逐条核实，详情会明确标注。</div><div class="detailSection"><h4>范围与分期</h4><p>覆盖周王室与17个主要诸侯国；从约前1046年到前256年，可延伸到前221年。春秋段从前770年起，战国段从前475年起；前453年、前403年也是不同研究中的战国起点。本图分区是阅读约定。</p><p>西周前841年以前的精确年代多属推定。斜线君主条与虚线存续线表示约年、传统推定或争议。</p></div><div class="detailSection"><h4>即位、元年、同年更替</h4><p>元年常在实际即位的次年，不能把年表的第一年一概理解为即位日期。图按整年绘制，同年发生的短期君主分层显示，未尝试推断月份。</p></div><div class="detailSection"><h4>灭亡与复国</h4><p>陈、蔡的复国显示为线段中断；齐的姜氏与田氏、晋与曲沃分别分层。晋终结、越瓦解采用一系口径并标争议。赵、燕保留残余政权直到前222年。卫延续到前209年，超出图范围时显示延续标记。</p></div><div class="detailSection"><h4>覆盖情况</h4><p>'+D.states.reduce((n,s)=>n+s.rulers.length,0)+'个有起讫的在位区间，'+D.states.reduce((n,s)=>n+s.undated.length,0)+'项未定位君主 / 前期领袖，'+D.events.length+'条精选重大事件。空白与无事件提示表示未收录，不是历史空白。</p></div><div class="detailSection"><h4>来源</h4>'+links(D.sources)+'</div><p class="notice">资料整理：'+D.updated+' · '+D.version+'</p>');}
document.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(!target)return;const {action,id}=target.dataset;
 if(action==='state')showState(id);else if(action==='ruler')showRuler(id);else if(action==='event')showEvent(id);else if(action==='cluster'){const es=id.split(',').map(id=>D.events.find(e=>e.id===id));show('密集事件 · 按年代展开','<h3 class="detailTitle">'+es.length+'条事件</h3>'+eventList(es));}else if(action==='locate'){if(Number(id)<end){$('#extend').checked=true;setExtension(true);}if(!selected.size)selected=new Set(D.states.map(s=>s.id));setCursor(Number(id),true);$('#detail').close();}
});
$('#close').onclick=()=>$('#detail').close();$('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#about').onclick=showAbout;$('#sources').onclick=showAbout;
document.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>setPeriod(b.dataset.period));
function zoom(factor){const year=1046-(vp.scrollLeft+(vp.clientWidth-labelWidth())/2)/px;px=Math.max(.8,Math.min(24,px*factor));render();vp.scrollLeft=Math.max(0,x(year)-(vp.clientWidth-labelWidth())/2);}
$('#plus').onclick=()=>zoom(1.6);$('#minus').onclick=()=>zoom(1/1.6);
$('#mode').onchange=e=>{mode=e.target.value;render();};$('#category').onchange=e=>{category=e.target.value;render();};
function setExtension(value){end=value?221:256;$('#cursorYear').max=-end;$('#year').min=221;if(cursor<end)setCursor(end);render();}
$('#extend').onchange=e=>setExtension(e.target.checked);
$('#jump').onsubmit=e=>{e.preventDefault();const y=Number($('#year').value);if(!Number.isFinite(y)||y<221||y>1046)return;if(y<end){$('#extend').checked=true;setExtension(true);}setCursor(y,true);};
$('#cursorYear').oninput=e=>setCursor(-Number(e.target.value));
$('#search').oninput=e=>{query=e.target.value.trim();render();if(query){const r=D.states.flatMap(s=>selected.has(s.id)?s.rulers.filter(r=>matchRuler(r)).map(r=>r.start):[]);const es=D.events.filter(e=>e.year>=end&&(e.name.includes(query)||e.description.includes(query))).map(e=>e.year);const year=r[0]??es[0];if(year)setCursor(year,true);}};
$('#filter').onclick=()=>{const checked=new Set(selected);$('#stateChecks').innerHTML=D.states.map(s=>'<label><input type="checkbox" value="'+s.id+'" '+(checked.has(s.id)?'checked':'')+'>'+s.name+'</label>').join('');$('#filters').showModal();};
$('#closeFilters').onclick=()=>$('#filters').close();$('#allStates').onclick=()=>document.querySelectorAll('#stateChecks input').forEach(c=>c.checked=true);$('#seven').onclick=()=>document.querySelectorAll('#stateChecks input').forEach(c=>c.checked=['zhou','qin','qi','chu','yan','han','zhao','liang'].includes(c.value));$('#applyFilters').onclick=()=>{selected=new Set([...document.querySelectorAll('#stateChecks input:checked')].map(c=>c.value));render();$('#filters').close();};
vp.addEventListener('scroll',updateRange,{passive:true});
let dragging=null,moved=false;
vp.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button,input'))return;dragging={x:e.clientX,y:e.clientY,left:vp.scrollLeft,top:vp.scrollTop};moved=false;vp.setPointerCapture(e.pointerId);});
vp.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;if(Math.abs(dx)+Math.abs(dy)>5){moved=true;vp.classList.add('dragging');}if(moved){vp.scrollLeft=dragging.left-dx;vp.scrollTop=dragging.top-dy;}});
vp.addEventListener('pointerup',e=>{if(dragging&&!moved&&!e.target.closest('button')&&e.clientY>vp.getBoundingClientRect().top+80)setCursor(1046-(e.clientX-vp.getBoundingClientRect().left+vp.scrollLeft-labelWidth())/px);dragging=null;vp.classList.remove('dragging');});vp.addEventListener('pointercancel',()=>{dragging=null;vp.classList.remove('dragging');});
window.addEventListener('resize',()=>{render();});
render();setCursor(770);vp.scrollLeft=Math.max(0,x(770)-40);
// Browser agents use the same navigation and search state as the visible controls.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'compare_zhou_year',title:'对照列国年份',description:'移动年份参考线并展示该年的列国君主与事件；year_bce 为公元前年份。',inputSchema:{type:'object',properties:{year_bce:{type:'integer',minimum:221,maximum:1046}},required:['year_bce'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!Number.isInteger(input.year_bce)||input.year_bce<221||input.year_bce>1046)throw new Error('年份必须是221至1046之间的整数');if(input.year_bce<end){$('#extend').checked=true;setExtension(true);}setCursor(input.year_bce,true);return {year_bce:cursor,states:visibleStates.filter(s=>s.start>=cursor&&s.end<=cursor).map(s=>({state:s.name,rulers:s.rulers.filter(r=>r.start>=cursor&&r.end<=cursor).map(r=>r.name)}))};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
