'use strict';
// Draw a prepared comparison page using only its canvas context and layout plan.
(function(root){
 const Zhou=root.Zhou||(root.Zhou={});
 const exportWidth=1200,exportHeight=850;
 const fmt=y=>Zhou.Time.format(y),range=(a,b,approx=false)=>Zhou.Time.range(a,b,approx);
function exportFont(ctx,size=18,bold=false){ctx.font=(bold?'600 ':'')+size+'px "Noto Sans CJK SC", system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';}
// Rounded caps only denote recorded endpoints. Page cuts stay flat, with
// continuation strokes wholly inside the clipped year cells (never new dates).
function drawIntervalEvent(ctx,segment,pos,scale,yy){
 const xx=pos(segment.from),ww=(segment.from-segment.to+1)*scale,end=xx+ww,r=Math.min(5,ww/2),top=yy-5,bottom=yy+5;
 ctx.fillStyle='#b68c47';ctx.strokeStyle='#73571e';ctx.lineWidth=1;ctx.beginPath();
 ctx.moveTo(xx+(segment.startClipped?0:r),top);ctx.lineTo(end-(segment.endClipped?0:r),top);
 if(segment.endClipped)ctx.lineTo(end,bottom);else{ctx.quadraticCurveTo(end,top,end,yy);ctx.quadraticCurveTo(end,bottom,end-r,bottom);}
 ctx.lineTo(xx+(segment.startClipped?0:r),bottom);
 if(segment.startClipped)ctx.lineTo(xx,top);else{ctx.quadraticCurveTo(xx,bottom,xx,yy);ctx.quadraticCurveTo(xx,top,xx+r,top);}
 ctx.closePath();ctx.fill();ctx.stroke();
 const mark=Math.min(3,ww/4);for(const x of [segment.startClipped?xx:null,segment.endClipped?end-mark:null])if(x!==null){ctx.beginPath();ctx.moveTo(x,yy+3);ctx.lineTo(x+mark,yy-3);ctx.stroke();}
 return xx;
}
function drawExportPage(ctx,page,plan,index){
 const W=exportWidth,H=exportHeight;ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.textBaseline='alphabetic';ctx.fillStyle='#19343d';exportFont(ctx,30,true);ctx.fillText((plan.title||'历史对照图')+' · 历史对比笔记',40,54);exportFont(ctx,17);ctx.fillStyle='#65777c';ctx.fillText(range(plan.from,plan.to)+' · '+plan.states.map(s=>s.name).join('、'),40,86);ctx.fillText('事件类别：'+(plan.category==='all'?'全部':plan.category)+' · 参考年份：'+fmt(plan.cursor)+(plan.query?' · 按搜索结果所显示国家导出':''),40,112);
 if(page.type==='index'){let y=151;for(const line of page.lines){exportFont(ctx,line.kind==='url'?15:18,line.kind==='heading');ctx.fillStyle=line.kind==='url'?'#315f79':line.kind==='heading'?'#19343d':'#42585e';ctx.fillText(line.text,44,y);y+=line.height;}}
 else{
  const left=132,right=1155,track=right-left,scale=track/(page.from-page.to+1),pos=y=>left+(page.from-y)*scale;
  ctx.fillStyle='#edf3f3';ctx.fillRect(38,132,1124,43);exportFont(ctx,17,true);ctx.fillStyle='#19343d';ctx.fillText(range(page.from,page.to),48,159);
  const span=page.from-page.to+1,step=span>200?50:span>100?25:span>50?10:5;exportFont(ctx,14);ctx.textAlign='center';for(let year=Math.floor(page.from/step)*step;year>=page.to;year-=step){const xx=pos(year);ctx.fillText(fmt(year).replace(/年$/,''),xx,197);}ctx.textAlign='left';
  let y=212;for(const row of page.rows){const {s,height}=row;ctx.fillStyle='#f8faf9';ctx.fillRect(38,y,1124,height);ctx.strokeStyle='#dce4e3';ctx.beginPath();ctx.moveTo(38,y+height);ctx.lineTo(1162,y+height);ctx.stroke();ctx.fillStyle=s.color;exportFont(ctx,22,true);ctx.fillText(s.name,55,y+35);
   // Draw continuity, including recorded interruptions and restorations.
   ctx.strokeStyle=s.color;ctx.lineWidth=4;ctx.setLineDash(s.approxStart||s.approxEnd?[7,4]:[]);const a=Math.min(page.from,s.start),b=Math.max(page.to,s.end);if(a>=b){const gaps=s.interruptions.filter(g=>g.start>=b&&g.end<=a).sort((g,h)=>h.start-g.start);let current=a;for(const gap of gaps){ctx.beginPath();ctx.moveTo(pos(current),y+14);ctx.lineTo(pos(Math.min(a,gap.start)),y+14);ctx.stroke();current=Math.max(b,gap.end);}ctx.beginPath();ctx.moveTo(pos(current),y+14);ctx.lineTo(pos(b)+scale,y+14);ctx.stroke();}ctx.setLineDash([]);ctx.lineWidth=1;
   for(const r of row.rulers){const xx=pos(Math.min(page.from,r.start)),ww=(Math.min(page.from,r.start)-Math.max(page.to,r.end)+1)*scale,yy=y+28+r.exportLane*22;ctx.fillStyle=s.color;ctx.fillRect(xx,yy,Math.max(1,ww-1),19);const level=r.dating?.level||'inferred';if(level!=='certain'){ctx.strokeStyle='#19343d';ctx.setLineDash(level==='inferred'?[4,3]:[]);ctx.strokeRect(xx,yy,Math.max(1,ww-1),19);if(level==='disputed')ctx.strokeRect(xx+2,yy+2,Math.max(1,ww-5),15);ctx.setLineDash([]);}exportFont(ctx,14);ctx.fillStyle='#fff';const label=Zhou.Presentation.rulerLabel(r);if(ww>ctx.measureText(label).width+8)ctx.fillText(label,xx+4,yy+15);}
   const events=plan.events.filter(v=>v.e.states.includes(s.id)&&(v.interval?row.intervalEvents?.some(segment=>segment.event.number===v.number):v.e.year<=page.from&&v.e.year>=page.to));let markerEnd=-1;for(const v of events){const yy=y+height-29;let xx;if(v.interval){const segment=row.intervalEvents.find(segment=>segment.event.number===v.number);xx=drawIntervalEvent(ctx,segment,pos,scale,yy);}else{xx=pos(v.e.year);ctx.fillStyle='#b68c47';ctx.beginPath();ctx.moveTo(xx,yy-6);ctx.lineTo(xx+6,yy);ctx.lineTo(xx,yy+6);ctx.lineTo(xx-6,yy);ctx.closePath();ctx.fill();}exportFont(ctx,14);const text='E'+v.number;if(xx>=markerEnd){ctx.fillStyle='#73571e';const tx=Math.min(xx+8,right-ctx.measureText(text).width);ctx.fillText(text,tx,yy+23);markerEnd=tx+ctx.measureText(text).width+8;}}
   if(s.end<=page.from&&s.end>=page.to){const xx=pos(s.end);ctx.strokeStyle='#a64139';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(xx,y+7);ctx.lineTo(xx,y+height-8);ctx.stroke();ctx.lineWidth=1;}
   if(!row.rulers.length){exportFont(ctx,14);ctx.fillStyle='#65777c';ctx.fillText(a>=b?'君主纪年待考':'本时间段未存续',left+10,y+51);}y+=height;
  }
  if(plan.cursor<=page.from&&plan.cursor>=page.to){ctx.strokeStyle='#b68c47';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pos(plan.cursor),204);ctx.lineTo(pos(plan.cursor),y);ctx.stroke();ctx.lineWidth=1;}
  exportFont(ctx,15);ctx.fillStyle='#42585e';ctx.fillText(plan.hasIntervals?'彩条＝君主　细线＝国家　菱形E＝单点　胶囊E＝区间（平切续接非起讫）　红线＝终止　金线＝参考年':'彩条＝君主　细线＝国家存续　菱形E编号＝同一事件　红线＝终止 / 称帝　金线＝参考年份',40,760);ctx.fillText('定：较确定　推：推定（虚线）　异：存在异说（双框）。完整姓名、在位年份、事件与来源见后附索引。',40,785);
 }
 ctx.strokeStyle='#dce4e3';ctx.beginPath();ctx.moveTo(40,809);ctx.lineTo(1160,809);ctx.stroke();exportFont(ctx,14);ctx.fillStyle='#65777c';ctx.fillText((plan.title||'历史对照图')+' · 精选资料 / 年级精度 · 资料更新 '+plan.updated+' · 导出 '+plan.date,40,835);ctx.textAlign='right';ctx.fillText('第 '+(index+1)+' / '+plan.pages.length+' 页',1160,835);ctx.textAlign='left';
}
 Object.assign(Zhou,{drawExportPage,exportFont});
})(globalThis);
