(function(Zhou){
 'use strict';
 // Presentation only: never normalizes the shared object or rewrites its URL.
 // A remembered research-combination label can be stale after any view change,
 // so describe the actual polity set instead of borrowing a preset's name.
 Zhou.describeSharedView=function(data,shared={}){
  const time=Zhou.Time,view=shared.view||{},clean=value=>String(value??'').replace(/\s+/g,' ').trim();
  const title=clean(data.title)||clean(data.datasetId)||'历史专题';
  const selected=new Set([...(Array.isArray(view.selected)?view.selected:[]),...(Array.isArray(shared.pinned)?shared.pinned:[])]);
  const states=(data.states||[]).filter(state=>selected.has(state.id));
  const names=states.map(state=>clean(state.name)||state.id);
  const coordinate=value=>typeof value==='number'&&Number.isFinite(value)&&time.isYear(Math.round(value))?Math.round(value):null;
  const from=coordinate(shared.range?.from),to=coordinate(shared.range?.to);
  const range=from!==null&&to!==null&&shared.range.from>=shared.range.to&&from>=to?time.range(from,to):'范围未定';
  const cursor=time.isYear(view.cursor)?time.format(view.cursor):'年份未定';
  const category=view.category==='all'?'全部':clean(view.category)||'未指定';
  const query=clean(view.query),scope=view.searchScope==='selected'?'所选政权':'全部资料';
  return [title+'｜所选政权组合：'+(names.join('、')||'未选择'),
   '视窗范围：'+range+'；参考年份：'+cursor,
   '事件类别：'+category+(query?'；搜索：'+query+'（'+scope+(view.searchDescriptions?'，含正文':'')+'）':'')].join('\n');
 };
})(globalThis.Zhou ||= {});
