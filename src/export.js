'use strict';
(function(root){
const exportWidth=1200,exportHeight=850;
function exportFont(ctx,size=18,bold=false){return globalThis.Zhou.exportFont(ctx,size,bold);}
function buildExportPlan(options,ctx){
 const model=historyService.comparison(options);
 return globalThis.Zhou.buildExportPlan(model,options,(text,size,bold)=>{exportFont(ctx,size,bold);return ctx.measureText(text).width;});
}
function exportRulerLanes(s,from,to){return globalThis.Zhou.exportRulerLanes(s,from,to);}
function wrapExportText(ctx,text,width){return globalThis.Zhou.wrapExportText(value=>ctx.measureText(value).width,text,width);}
function concatExportBytes(chunks){return globalThis.Zhou.concatExportBytes(chunks);}
function buildImagePDF(images){return globalThis.Zhou.buildImagePDF(images);}
function exportCRC32(bytes){return globalThis.Zhou.exportCRC32(bytes);}
function buildImagesZIP(files){return globalThis.Zhou.buildImagesZIP(files);}
function drawExportPage(ctx,page,plan,index){return globalThis.Zhou.drawExportPage(ctx,page,plan,index);}
function exportCanvas(page,plan,index){const canvas=document.createElement('canvas');canvas.width=exportWidth*2;canvas.height=exportHeight*2;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('当前浏览器无法生成图片，请换用支持Canvas的浏览器。');ctx.scale(2,2);drawExportPage(ctx,page,plan,index);return canvas;}
function canvasExportBlob(canvas,type){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('图片生成失败，请缩短范围后重试。')),type,type==='image/jpeg'?0.92:undefined));}
let exportObjectURL=null,exportBusy=false,exportStateIds=[];
function clearExportDownload(){if(exportObjectURL){URL.revokeObjectURL(exportObjectURL);exportObjectURL=null;}$('#exportDownload').innerHTML='';}
async function createComparisonExport(){
 if(exportBusy)return;exportBusy=true;$('#createExport').disabled=true;document.querySelectorAll('#exportForm input,#exportForm select').forEach(e=>e.disabled=true);clearExportDownload();$('#exportStatus').textContent='正在准备导出…';
 try{
  const options={from:globalThis.Zhou.Time.encode({era:$('#exportFromEra').value||'BCE',year:Number($('#exportFrom').value)}),to:globalThis.Zhou.Time.encode({era:$('#exportToEra').value||'BCE',year:Number($('#exportTo').value)}),span:Number($('#exportSpan').value),states:exportStateIds,cursor:appState.conditions.cursor,category:appState.conditions.category,query:appState.search.query};
  if($('#exportFormat').value==='json'){
   const model=historyService.comparison(options);if(!model.states.length)throw new Error('当前没有显示的国家，请先筛选国家或清除搜索。');
   const blob=new Blob([JSON.stringify(model,null,2)],{type:'application/json'});exportObjectURL=URL.createObjectURL(blob);
   const a=document.createElement('a');a.href=exportObjectURL;a.download='zhou-comparison-'+model.from+'-'+model.to+'.json';a.textContent='下载对照资料 JSON';$('#exportDownload').appendChild(a);$('#exportStatus').textContent='已生成对照资料，包含资料版本、纪年口径与来源。';return;
  }
  await document.fonts?.ready;const measure=document.createElement('canvas').getContext('2d');if(!measure)throw new Error('当前浏览器无法生成图片。');const plan=buildExportPlan(options,measure),pdf=$('#exportFormat').value==='pdf',files=[];
  for(let i=0;i<plan.pages.length;i++){$('#exportStatus').textContent='正在生成 '+(i+1)+' / '+plan.pages.length+' 页…';await new Promise(resolve=>setTimeout(resolve,0));const canvas=exportCanvas(plan.pages[i],plan,i);const blob=await canvasExportBlob(canvas,pdf?'image/jpeg':'image/png');files.push(new Uint8Array(await blob.arrayBuffer()));canvas.width=canvas.height=0;}
  const blob=pdf?buildImagePDF(files):files.length===1?new Blob(files,{type:'image/png'}):buildImagesZIP(files),extension=pdf?'pdf':files.length===1?'png':'zip',filename='zhou-comparison-'+plan.from+'-'+plan.to+'.'+extension;exportObjectURL=URL.createObjectURL(blob);const a=document.createElement('a');a.href=exportObjectURL;a.download=filename;a.textContent='下载 '+(pdf?'PDF':files.length===1?'PNG图片':'PNG图片包')+'（'+plan.pages.length+'页）';$('#exportDownload').appendChild(a);$('#exportStatus').textContent='已生成 '+plan.states.length+' 个国家、'+range(plan.from,plan.to)+'的对比，含完整文字索引和来源。';
 }catch(error){$('#exportStatus').textContent=error.message||'导出失败，请缩短时间范围后重试。';}finally{exportBusy=false;$('#createExport').disabled=false;document.querySelectorAll('#exportForm input,#exportForm select').forEach(e=>e.disabled=false);}
}
$('#exportCompare').onclick=()=>{if(exportBusy){$('#exportDialog').showModal();return;}exportStateIds=appState.session.visibleStates.map(s=>s.id);const start=historyService.timeline.start,from=Math.round(Math.min(start,Math.max(appState.conditions.end,start-vp.scrollLeft/appState.layout.px))),to=Math.round(Math.max(appState.conditions.end,start-(vp.scrollLeft+vp.clientWidth-labelWidth())/appState.layout.px));for(const [prefix,coord] of [['exportFrom',from],['exportTo',to]]){const date=globalThis.Zhou.Time.decode(coord);$('#'+prefix).value=date.year;$('#'+prefix+'Era').value=date.era;}$('#exportCountries').textContent='当前显示国家：'+(exportStateIds.map(id=>byId(id).name).join('、')||'无');if(!exportBusy){clearExportDownload();$('#exportStatus').textContent='';}$('#exportDialog').showModal();};
$('#closeExport').onclick=()=>$('#exportDialog').close();$('#exportForm').onsubmit=e=>{e.preventDefault();createComparisonExport();};
window.addEventListener('pagehide',()=>{if(exportObjectURL)URL.revokeObjectURL(exportObjectURL);});

Object.assign(root,{buildExportPlan,drawExportPage,exportCanvas,canvasExportBlob,exportFont,exportRulerLanes,wrapExportText,concatExportBytes,buildImagePDF,exportCRC32,buildImagesZIP,createComparisonExport});
})(globalThis);
