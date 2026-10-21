(function (Zhou) {
  'use strict';
  // This codec contains no DOM, storage or URL-history side effects.
  Zhou.createViewLinkCodec = function (data, search) {
    const time = Zhou.Time, bounds = time.bounds(data);
    const ids = new Set(data.states.map(state => state.id));
    const events = new Set(data.events.map(event => event.id));
    const entries = new Set(search.index.map(entry => entry.key));
    const categories = ['all','政治','战争','改革','外交','文化'];
    const modes = ['both','rulers','events','overview'];
    const densities = ['auto','full','overview'];
    const validItem = value => entries.has(value) || typeof value === 'string' && value.startsWith('cluster:') && value.slice(8).split(',').every(id => events.has(id));
    function parse(hash) {
      if (typeof hash !== 'string' || hash.length > 10000) return null;
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      if(params.has('dataset') && params.get('dataset') !== (data.datasetId||'zhou'))return null;
      const version = params.has('v') ? params.get('v') : '1', encoding = params.get('time');
      if (!['1','2'].includes(version) || encoding !== null && encoding !== time.encoding || version === '2' && encoding !== time.encoding) return null;
      const view = {}, result = {view, version};
      const number = (name, min, max) => {
        const raw = params.get(name);
        if (raw === null || !raw.trim()) return undefined;
        const value = Number(raw);
        return Number.isFinite(value) && value >= min && value <= max ? value : undefined;
      };
      const list = name => {
        if (!params.has(name)) return undefined;
        const raw = params.get(name), values = [...new Set(raw.split(',').filter(id => ids.has(id)))];
        return raw === '' || values.length ? values : undefined;
      };
      const coordinate = name => {
        const value = number(name,bounds.end,bounds.start);
        return value !== undefined && (version === '2' || value > 0) ? value : undefined;
      };
      const year = coordinate('year'), zoom = number('zoom',.8,24), end = coordinate('end');
      if (time.isYear(year)) view.cursor = year;
      if (zoom !== undefined) view.px = zoom;
      if (time.isYear(end)) view.end = end;
      const selected = list('states'); if (selected !== undefined) view.selected = selected;
      for (const name of ['pinned','order']) { const value = list(name); if (value !== undefined) result[name] = value; }
      for (const [key, name, allowed] of [['category','category',categories],['mode','mode',modes],['density','density',densities],['searchScope','scope',['all','selected']]]) {
        if (allowed.includes(params.get(name))) view[key] = params.get(name);
      }
      if (params.has('q')) view.query = params.get('q').slice(0,100);
      if (['0','1'].includes(params.get('desc'))) view.searchDescriptions = params.get('desc') === '1';
      if (params.has('event') && (params.get('event') === '' || events.has(params.get('event')))) view.activeEventId = params.get('event') || null;
      if (params.has('target')) { const key = search.normalizeKey(params.get('target')); if (!key || entries.has(key)) view.searchTarget = key || null; }
      if (params.has('item')) { const key = search.normalizeKey(params.get('item')); if (validItem(key)) result.item = key; }
      const from = coordinate('from'), to = coordinate('to'), width = number('width',1,20000);
      if (from !== undefined && (to === undefined || from >= to)) result.range = {from, ...(to !== undefined ? {to} : {}), ...(width !== undefined ? {width} : {})};
      if ([view.cursor,result.range?.from,result.range?.to].some(value => value !== undefined && value < (view.end ?? bounds.defaultEnd))) view.end = bounds.end;
      return Object.keys(view).length || result.pinned || result.order || result.range || result.item ? result : null;
    }
    function encode(value) {
      const {view, pinned, order, range, item} = value;
      const nonBCE = [view.cursor,view.end,range?.from,range?.to].some(coord => typeof coord === 'number' && Number.isFinite(coord) && coord <= 0);
      const params = new URLSearchParams({v:nonBCE?'2':'1',year:String(view.cursor),end:String(view.end),states:view.selected.join(','),pinned:pinned.join(','),order:order.join(','),zoom:String(Number(view.px.toFixed(4))),category:view.category,mode:view.mode,density:view.density,scope:view.searchScope,q:view.query,desc:view.searchDescriptions?'1':'0',event:view.activeEventId||'',target:view.searchTarget||''});
      if (nonBCE) params.set('time',time.encoding);
      if(data.datasetId && data.datasetId!=='zhou')params.set('dataset',data.datasetId);
      if (range) for (const key of ['from','to','width']) if (Number.isFinite(range[key])) params.set(key,String(Number(range[key].toFixed(4))));
      const key = search.normalizeKey(item); if (validItem(key)) params.set('item',key);
      return '#' + params.toString();
    }
    return Object.freeze({parse,encode});
  };

  Zhou.createViewLinkController = function (bridge) {
    const {codec, location, history} = bridge;
    let ready = false, applying = false, timer = null, handled = null;
    const fallback = codec.parse(codec.encode(bridge.read()));
    function restore() {
      if (handled === location.hash) return;
      bridge.clearTimeout(timer); timer = null;
      const value = location.hash ? codec.parse(location.hash) : fallback;
      handled = location.hash;
      if (!value) return;
      applying = true;
      try { bridge.apply(value); } finally { applying = false; }
    }
    function flush() {
      if (!ready || applying) return;
      bridge.clearTimeout(timer); timer = null;
      const hash = codec.encode(bridge.read());
      if (location.hash !== hash) {
        try { history.replaceState(history.state,'',location.pathname + location.search + hash); handled = hash; } catch {}
      }
      return location.href.split('#')[0] + hash;
    }
    function schedule() {
      if (!ready || applying) return;
      bridge.clearTimeout(timer); timer = bridge.setTimeout(flush,200);
    }
    function start() { if(location.hash)restore();else handled='';ready = true; }
    return Object.freeze({start,restore,schedule,flush});
  };
})(globalThis.Zhou ||= {});
