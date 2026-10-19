(function (Zhou) {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  const overlaps = (...args) => Zhou.Time.overlaps(...args);
  const comparisonStart = ruler => Math.max(ruler.start, ruler.chronology?.accession ?? ruler.start);

  // Historical facts have stable identities; periods are overlapping query windows.
  // Bars use adopted dates, while same-year queries include verified accession.
  Zhou.createHistory = function (data) {
    const timeline = Zhou.Time.bounds(data);
    const states = new Map(data.states.map(item => [item.id, item]));
    const events = new Map(data.events.map(item => [item.id, item]));
    const people = new Map(data.people.map(item => [item.id, item]));
    const polities = new Map((data.polities || data.states).map(item => [item.id, item]));
    const tenures = new Map((data.tenures || data.states.flatMap(item => item.rulers)).map(item => [item.id, item]));
    const periods = new Map((data.periods || []).map(item => [item.id, item]));
    const state = value => typeof value === 'string' ? states.get(value) : value;
    const interruptionAt = (value, year) => state(value)?.interruptions?.find(gap => overlaps(gap.start, gap.end, year, year));
    const existsAt = (value, year) => {
      const item = state(value);
      return Boolean(Zhou.Time.isYear(year) && item && overlaps(item.start, item.end, year, year));
    };
    const rulersAt = (value, year) => {
      const item = state(value);
      return !existsAt(item, year) || interruptionAt(item, year) ? [] : item.rulers.filter(ruler => ruler.polityAssociation !== 'contextual' && overlaps(comparisonStart(ruler), ruler.end, year, year));
    };
    function eventsInRange({from = timeline.start, to = timeline.end, states: ids = [...states.keys()], category = 'all'} = {}) {
      const selected = new Set(ids);
      return data.events.filter(event => overlaps(event.year, event.year, from, to) && event.states.some(id => selected.has(id)) && (category === 'all' || event.kind === category)).sort((a, b) => b.year - a.year);
    }
    function rulersInRange(value, from = timeline.start, to = timeline.end) {
      return (state(value)?.rulers || []).filter(ruler => overlaps(ruler.start, ruler.end, from, to));
    }
    function periodsInRange(from = timeline.start, to = timeline.end) {
      return [...periods.values()].filter(item => overlaps(item.start, item.end, from, to));
    }
    function compareYear(year, ids = [...states.keys()]) {
      return [...new Set(ids)].map(state).filter(item => existsAt(item, year)).map(item => ({state: item, interruption: interruptionAt(item, year) || null, rulers: rulersAt(item, year), events: eventsInRange({from: year, to: year, states: [item.id]})}));
    }
    function comparison(options = {}) {
      const {from = timeline.start, to = timeline.end, category = 'all', cursor = from} = options;
      if (!Zhou.Time.isYear(from) || !Zhou.Time.isYear(to) || from < to || from > timeline.start || to < timeline.end) throw new Error('请填写有效范围：' + Zhou.Time.range(timeline.start, timeline.end) + '，起始时间须早于或等于结束时间。');
      if (!Zhou.Time.isYear(cursor) || cursor > timeline.start || cursor < timeline.end) throw new Error('参考年份超出资料范围。');
      const selected = [...new Set(options.states || [])].map(state).filter(Boolean);
      const selectedIds = new Set(selected.map(item => item.id));
      const selectedTenures = [...tenures.values()].filter(item => selectedIds.has(item.polityId || item.stateId) && overlaps(item.start, item.end, from, to));
      const personIds = new Set(selectedTenures.map(item => item.personId).filter(Boolean));
      const selectedEvents = eventsInRange({from, to, category, states: [...selectedIds]});
      for (const event of selectedEvents) for (const person of event.participants || []) personIds.add(person.id);
      for (const person of data.people) if (person.states?.some(id => selectedIds.has(id))) personIds.add(person.id);
      // Detached, additive v1 snapshot: existing consumers retain their fields and IDs.
      return copy({schemaVersion: 1, timeEncoding: 'bce-axis', ...(data.datasetId ? {datasetId:data.datasetId} : {}), ...(data.presentation ? {presentation:{...data.presentation,rowGroups:data.presentation.rowGroups.map(g=>({...g,stateIds:g.stateIds.filter(id=>selectedIds.has(id))})).filter(g=>g.stateIds.length)}} : {}), timeline, version: data.version, updated: data.updated, from, to, category, cursor,
        title: data.title || '历史对照图', legend: data.metadata?.exportLegend, scopeNote: data.scopeNote || data.metadata?.scopeNote, chronology: {bars: 'adopted-table', yearQueries: 'verified-accession-and-interruptions'},
        states: selected.map(item => ({...item, rulers: rulersInRange(item, from, to)})),
        polities: selected.map(item => polities.get(item.id)), tenures: selectedTenures,
        people: data.people.filter(item => personIds.has(item.id)), periods: periodsInRange(from, to),
        events: selectedEvents,
        stateNames: Object.fromEntries(data.states.map(item => [item.id, item.name])), sources: data.sources});
    }
    return Object.freeze({timeline, state, polity: id => polities.get(id), tenure: id => tenures.get(id), period: id => periods.get(id),
      tenuresForPerson: id => [...tenures.values()].filter(item => item.personId === id), periodsInRange,
      event: id => events.get(id), person: id => people.get(id), comparisonStart, interruptionAt, existsAt, rulersAt, rulersInRange, eventsInRange, compareYear, comparison});
  };
})(globalThis.Zhou ||= {});
