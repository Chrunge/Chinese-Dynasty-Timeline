(function (Zhou) {
  'use strict';
  // The runtime axis preserves legacy BCE coordinates and decreases to the right.
  // BCE 1 = 1, CE 1 = 0, CE 2 = -1. Only null represents an unknown date.
  const encoding = 'bce-axis';
  const isYear = value => Number.isSafeInteger(value) && (value > 0 || Number.isSafeInteger(1 - value));
  function encode(date) {
    if (!date || typeof date !== 'object' || !Number.isSafeInteger(date.year) || date.year < 1) return null;
    if (date.era === 'BCE') return date.year;
    if (date.era === 'CE') return 1 - date.year;
    return null;
  }
  function decode(coord) {
    if (!isYear(coord)) return null;
    return coord > 0 ? {era:'BCE', year:coord} : {era:'CE', year:1 - coord};
  }
  function format(coord) {
    const date = decode(coord);
    return date ? (date.era === 'BCE' ? '前' : '公元') + date.year + '年' : '年份未定';
  }
  function range(a, b, approx = false) {
    let text;
    if (a === b) text = format(a);
    else if (isYear(a) && isYear(b) && a > 0 && b > 0) text = '前' + a + '—' + b + '年';
    else if (isYear(a) && isYear(b) && a <= 0 && b <= 0) text = '公元' + (1 - a) + '—' + (1 - b) + '年';
    else text = format(a) + '—' + format(b);
    return (approx ? '约 ' : '') + text;
  }
  function overlaps(start, end, from, to) {
    return isYear(start) && isYear(end) && start >= end && typeof from === 'number' && Number.isFinite(from) && typeof to === 'number' && Number.isFinite(to) && from >= to && start >= to && end <= from;
  }
  // An explicitly supplied unknown/invalid end is not a point event. Keep the
  // original dates untouched; callers skip null ranges rather than invent dates.
  function eventRange(event) {
    if (!event || typeof event !== 'object') return null;
    const start = event.year, end = Object.prototype.hasOwnProperty.call(event, 'endYear') ? event.endYear : start;
    return isYear(start) && isYear(end) && start >= end ? {start, end} : null;
  }
  function bounds(data = {}) {
    const dates = (data.states || []).flatMap(state => [state.start, state.end]).map(value => typeof value === 'object' ? encode(value) : value).filter(isYear);
    const timeline = data.timeline || {};
    if (!dates.length && (!isYear(timeline.start) || !isYear(timeline.end))) throw new TypeError('时间范围缺少有效的 timeline 配置或 states 日期。');
    const derivedStart = dates.length ? Math.max(...dates) : timeline.start;
    const derivedEnd = dates.length ? Math.min(...dates) : timeline.end;
    const start = isYear(timeline.start) ? timeline.start : derivedStart;
    const end = isYear(timeline.end) ? timeline.end : derivedEnd;
    if (start < end) throw new RangeError('时间范围 start 必须大于或等于 end。');
    const clamp = value => Math.max(end, Math.min(start, value));
    const defaultEnd = isYear(timeline.defaultEnd) ? clamp(timeline.defaultEnd) : end;
    // Time bounds remain domain-only; topic defaults belong to the UI.
    const targetCursor = timeline.cursor;
    const cursor = isYear(targetCursor) ? Math.max(defaultEnd, clamp(targetCursor)) : start;
    return {start, end, defaultEnd, cursor};
  }
  // Unmarked persisted records predate CE support: never reinterpret their zero
  // or negative values as CE dates. Unknown encodings are rejected by consumers.
  function recordYear(value, timeEncoding) {
    if (timeEncoding !== undefined && timeEncoding !== encoding) return null;
    if (typeof value !== 'number' && typeof value !== 'string' || typeof value === 'string' && !value.trim()) return null;
    const coord = Number(value);
    return isYear(coord) && (timeEncoding === encoding || coord > 0) ? coord : null;
  }
  Zhou.Time = Object.freeze({encoding, encode, decode, format, range, isYear, overlaps, eventRange, bounds, recordYear});
})(globalThis.Zhou ||= {});
