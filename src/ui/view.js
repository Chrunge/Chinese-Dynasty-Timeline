(function(Zhou){
 'use strict';
 // Browser geometry and controls are supplied by the composition root.
 Zhou.createViewAdapter=function({state,viewport,$,window,document,render,setCursor,updateRange,bounds}){
  function capture(){
   return {...Zhou.captureViewState(state),left:viewport.scrollLeft,top:viewport.scrollTop,searchTop:$('#searchPanel').scrollTop,pageX:window.scrollX||0,pageY:window.scrollY||0,periods:[...document.querySelectorAll('[data-period]')].filter(b=>b.classList.contains?.('active')).map(b=>b.dataset.period)};
  }
  function syncControls(){
   $('#search').value=state.search.query;$('#mode').value=state.layout.mode;$('#category').value=state.conditions.category;$('#density').value=state.layout.density;$('#searchScope').value=state.search.searchScope;$('#searchDescriptions').checked=state.search.searchDescriptions;$('#extend').checked=state.conditions.end===bounds.end&&bounds.end!==bounds.defaultEnd;$('#extend').disabled=bounds.end===bounds.defaultEnd;$('#cursorYear').min=0-bounds.start;$('#cursorYear').max=0-state.conditions.end;
  }
  function restore(view){
   Zhou.applyViewState(state,view);syncControls();
   document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',view.periods.includes(b.dataset.period)));
   render();setCursor(state.conditions.cursor);viewport.scrollLeft=view.left;viewport.scrollTop=view.top;$('#searchPanel').scrollTop=view.searchTop;updateRange();window.scrollTo?.(view.pageX,view.pageY);
  }
  return Object.freeze({capture,restore,syncControls,getLayout:()=>Zhou.captureLayoutState(state),setLayout:layout=>Zhou.applyLayoutState(state,layout)});
 };
})(globalThis.Zhou ||= {});
