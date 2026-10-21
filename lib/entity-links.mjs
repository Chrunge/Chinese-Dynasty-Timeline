// Navigation-only projection of corpus identities. No historical records are
// merged, copied to another topic, or resolved by matching display names.
const blockedPolities = new Set(['later-liang', 'wu-zhou']);
const validYear = value => Number.isSafeInteger(value) && (value > 0 || Number.isSafeInteger(1 - value));
const localPage = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.html$/.test(value);

function bounds(data) {
  const dates = (data.states || []).flatMap(state => [state.start, state.end]).filter(validYear);
  const timeline = data.timeline || {};
  const start = validYear(timeline.start) ? timeline.start : dates.length ? Math.max(...dates) : null;
  const end = validYear(timeline.end) ? timeline.end : dates.length ? Math.min(...dates) : null;
  if (!validYear(start) || !validYear(end) || start < end) throw new TypeError('Invalid entity-link target timeline');
  const clamp = year => Math.max(end, Math.min(start, year));
  const defaultEnd = validYear(timeline.defaultEnd) ? clamp(timeline.defaultEnd) : end;
  const cursor = validYear(timeline.cursor) ? Math.max(defaultEnd, clamp(timeline.cursor)) : start;
  return {start, end, cursor, clamp};
}

function destination(entry, collection, id) {
  const {data} = entry;
  const records = collection === 'polities' ? data.states : data.people;
  const record = records?.find(value => value.id === id);
  if (!record) return null;
  const time = bounds(data), ids = new Set(data.states.map(state => state.id));
  const within = year => validYear(year) && year <= time.start && year >= time.end;
  let year = time.cursor, selected;
  if (collection === 'polities') {
    selected = [id];
    if (validYear(record.start)) year = time.clamp(record.start);
  } else {
    const relatedIds = new Set(record.relatedEvents || []);
    const events = (data.events || []).filter(event => relatedIds.has(event.id) || event.participants?.some(person => person.id === id));
    const journeys = record.journey || [];
    // An associated ruler's entire reign is not a person's activity date.
    const datedEvent = events.find(event => within(event.year));
    const datedJourney = journeys.find(stage => within(stage.year));
    if (datedEvent) year = datedEvent.year;
    else if (datedJourney) year = datedJourney.year;
    const participantStates = events.flatMap(event => (event.participants || []).filter(person => person.id === id).map(person => person.state));
    const ministerStates = data.states.filter(state => (state.rulers || []).some(ruler => (ruler.ministers || []).some(person => person.id === id))).map(state => state.id);
    selected = [...new Set([...(record.states || []), ...participantStates, ...ministerStates, ...journeys.map(stage => stage.state || stage.stateId)])].filter(state => ids.has(state));
  }
  const type = collection === 'polities' ? 'country' : 'person', key = type + ':' + id;
  const nonBCE = year <= 0 || time.end <= 0;
  // A new, clean target view: never forward the source's reading/search filters.
  const params = new URLSearchParams({v:nonBCE ? '2' : '1', dataset:entry.id, year:String(year), end:String(time.end), states:selected.join(','), pinned:'', order:selected.join(','), zoom:'4', category:'all', mode:'both', density:'auto', scope:'all', q:'', desc:'0', event:'', target:key, item:key});
  if (nonBCE) params.set('time', 'bce-axis');
  return {datasetId:entry.id, name:entry.name, href:entry.page + '#' + params.toString()};
}

export function buildEntityLinks(corpus, entries) {
  const targets = new Map();
  for (const entry of entries) {
    if (!entry || typeof entry.id !== 'string' || targets.has(entry.id)) throw new TypeError('Invalid or duplicate entity-link dataset');
    if (!localPage(entry.page) || !entry.data || !Array.isArray(entry.data.states)) throw new TypeError('Invalid entity-link target: ' + entry.id);
    targets.set(entry.id, entry);
  }
  const entities = {polities:[], people:[]};
  for (const collection of Object.keys(entities)) {
    for (const entity of corpus?.entities?.[collection] || []) {
      if (entity.identityScope !== 'stable-id' || collection === 'polities' && blockedPolities.has(entity.id)) continue;
      const appearances = [...new Set((entity.appearances || []).map(appearance => appearance.datasetId))];
      if (appearances.length < 2) continue;
      const links = appearances.flatMap(datasetId => {
        const target = targets.get(datasetId);
        const link = target && destination(target, collection, entity.id);
        return link ? [link] : [];
      });
      if (links.length > 1) entities[collection].push({id:entity.id, links});
    }
    entities[collection].sort((a,b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  }
  return {schemaVersion:1, entities};
}
