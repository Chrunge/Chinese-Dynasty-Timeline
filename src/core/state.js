(function (Zhou) {
  'use strict';
  // Mutable application state has one owner. Renderers and persistence receive
  // explicit snapshots; no domain query reads this state implicitly.
  Zhou.createApplicationState = data => ({
    conditions: {end:256, selected:new Set(data.states.map(s=>s.id)), category:'all', cursor:770},
    layout: {stateOrder:data.states.map(s=>s.id), rowHeight:64, fitRows:false, viewHeight:560, expanded:false, rowHeights:{}, px:4, mode:'both', density:'auto', pinned:new Set()},
    search: {query:'', searchScope:'all', searchDescriptions:false, searchLimit:6, searchTarget:null},
    session: {activeEventId:null, visibleStates:[], rowLayouts:new Map(), savedCombos:[]}
  });
  Zhou.readLayout = (saved, defaults, ids) => {
    if (!saved || typeof saved !== 'object') return {...defaults};
    const number = (value, low, high, fallback) => (typeof value === 'number' || typeof value === 'string') && Number.isFinite(Number(value)) ? Math.max(low, Math.min(high, Number(value))) : fallback;
    const rowHeights = {};
    for (const id of ids) if ([40,56,64,96,128,160].includes(saved.rowHeights?.[id])) rowHeights[id] = saved.rowHeights[id];
    return {...defaults, stateOrder:Array.isArray(saved.order)?[...new Set([...saved.order.filter(id=>ids.includes(id)),...ids])]:[...defaults.stateOrder],
      rowHeight:number(saved.rowHeight,36,160,defaults.rowHeight), viewHeight:number(saved.viewHeight,320,1000,defaults.viewHeight), fitRows:Boolean(saved.fitRows), rowHeights};
  };
})(globalThis.Zhou ||= {});
