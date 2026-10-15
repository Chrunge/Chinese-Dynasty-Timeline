(function (Zhou) {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  const overlaps = (start, end, from, to) => start >= to && end <= from;
  const comparisonStart = ruler => Math.max(ruler.start, ruler.chronology?.accession ?? ruler.start);

  // The only interpretation of historical dates shared by all consumers.
  // Timeline bars retain the adopted table dates; year queries include verified accession.
  Zhou.createHistory = function (data) {
    const states = new Map(data.states.map(state => [state.id, state]));
    const events = new Map(data.events.map(event => [event.id, event]));
    const people = new Map(data.people.map(person => [person.id, person]));
    const state = value => typeof value === 'string' ? states.get(value) : value;
    const interruptionAt = (value, year) => state(value)?.interruptions?.find(gap => overlaps(gap.start, gap.end, year, year));
    const existsAt = (value, year) => {
      const item = state(value);
      return Boolean(item && overlaps(item.start, item.end, year, year));
    };
    const rulersAt = (value, year) => {
      const item = state(value);
      return !existsAt(item, year) || interruptionAt(item, year) ? [] : item.rulers.filter(ruler => overlaps(comparisonStart(ruler), ruler.end, year, year));
    };
    function eventsInRange({from = 1046, to = 221, states: ids = [...states.keys()], category = 'all'} = {}) {
      const selected = new Set(ids);
      return data.events.filter(event => overlaps(event.year, event.year, from, to) && event.states.some(id => selected.has(id)) && (category === 'all' || event.kind === category)).sort((a, b) => b.year - a.year);
    }
    function rulersInRange(value, from, to) {
      return (state(value)?.rulers || []).filter(ruler => overlaps(ruler.start, ruler.end, from, to));
    }
    function compareYear(year, ids = [...states.keys()]) {
      return [...new Set(ids)].map(state).filter(item => existsAt(item, year)).map(item => ({state: item, interruption: interruptionAt(item, year) || null, rulers: rulersAt(item, year), events: eventsInRange({from: year, to: year, states: [item.id]})}));
    }
    function comparison(options) {
      const {from, to, category = 'all', cursor = from} = options;
      if (!Number.isInteger(from) || !Number.isInteger(to) || from < to || from > 1046 || to < 221) throw new Error('请填写有效范围：前1046年至前221年，起始年份须大于或等于结束年份。');
      const selected = [...new Set(options.states || [])].map(state).filter(Boolean);
      // A detached snapshot: outputs cannot accidentally change the source or each other.
      return copy({schemaVersion: 1, version: data.version, updated: data.updated, from, to, category, cursor,
        chronology: {bars: 'adopted-table', yearQueries: 'verified-accession-and-interruptions'},
        states: selected.map(item => ({...item, rulers: rulersInRange(item, from, to)})),
        events: eventsInRange({from, to, category, states: selected.map(item => item.id)}),
        stateNames: Object.fromEntries(data.states.map(item => [item.id, item.name])), sources: data.sources});
    }
    return Object.freeze({state, event: id => events.get(id), person: id => people.get(id), comparisonStart, interruptionAt, existsAt, rulersAt, rulersInRange, eventsInRange, compareYear, comparison});
  };
})(globalThis.Zhou ||= {});
