// Authoring model -> backward-compatible browser projection. No filesystem or UI state.
const own = (object, key) => Object.hasOwn(object, key);
const unique = values => [...new Set(values)];
const chronologyFields = ['accession', 'regnalStart', 'abdication', 'death'];
const activityKinds = ['service', 'persuasion', 'death', 'activity', 'exile', 'travel', 'origin', 'birth', 'diplomacy', 'invitation', 'teaching', 'residence', 'resignation'];
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const year = value => Number.isInteger(value) && value > 0;

export function validateAtlas(atlas) {
  assert(atlas.schemaVersion === 1, '不支持的资料模型版本');
  const maps = {};
  for (const type of ['states', 'rulers', 'people', 'events', 'activities', 'sources']) {
    assert(Array.isArray(atlas[type]), `缺少资料集合：${type}`);
    maps[type] = new Map();
    for (const item of atlas[type]) {
      assert(typeof item.id === 'string' && item.id.length, `${type} 缺少稳定 ID`);
      assert(!maps[type].has(item.id), `${type} 重复 ID：${item.id}`);
      maps[type].set(item.id, item);
    }
  }
  const ref = (type, id) => assert(maps[type].has(id), `未知 ${type} 引用：${id}`);
  const walk = (value, path = 'atlas') => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`));
    for (const [key, v] of Object.entries(value)) {
      if (key === 'sourceIds') {
        assert(Array.isArray(v) && unique(v).length === v.length, `来源引用须为去重数组：${path}`);
        v.forEach(id => ref('sources', id));
      } else if (key === 'sourceId') ref('sources', v);
      else if (key === 'sources' && path !== 'atlas') throw new Error(`不可内嵌重复来源：${path}`);
      else walk(v, `${path}.${key}`);
    }
  };
  walk(atlas);
  const urls = new Set();
  for (const source of atlas.sources) {
    assert(source.title && /^https?:\/\//.test(source.url), `来源缺少标题或 URL：${source.id}`);
    assert(!urls.has(source.url), `重复来源 URL：${source.url}`);
    urls.add(source.url);
  }
  const date = (d, id) => {
    assert(d && ['certain', 'inferred', 'disputed'].includes(d.level), `纪年可信度缺失：${id}`);
    assert(['legacy', 'partial', 'reviewed'].includes(d.reviewStatus), `纪年校核状态缺失：${id}`);
    assert(typeof d.reason === 'string' && d.reason.trim(), `纪年说明缺失：${id}`);
    assert(Array.isArray(d.alternatives), `纪年异说须为数组：${id}`);
    assert(d.level !== 'disputed' || d.alternatives.length >= (d.reviewStatus === 'legacy' ? 1 : 2), `异说须列明口径（新校核至少两项）：${id}`);
    for (const a of d.alternatives) {
      assert(a.label && a.explanation && a.sourceIds?.length, `异说缺少说明或来源：${id}`);
      assert(a.year == null || year(a.year), `异说年份无效：${id}`);
    }
  };
  for (const s of atlas.states) {
    assert(year(s.start) && year(s.end) && s.start >= s.end, `国家区间倒置：${s.id}`);
    assert(!own(s, 'rulers'), `君主须在独立集合维护：${s.id}`);
    date(s.dating, s.id);
  }
  for (const r of atlas.rulers) {
    ref('states', r.stateId);
    assert(year(r.start) && year(r.end) && r.start >= r.end, `君主区间倒置：${r.id}`);
    assert(!own(r, 'ministers'), `君臣关系须在关系表维护：${r.id}`);
    date(r.dating, r.id);
    assert(r.chronology?.regnalStart === r.start, `元年/图示起点与区间不一致：${r.id}`);
    for (const key of chronologyFields) assert(r.chronology[key] === null || year(r.chronology[key]), `生涯节点年份无效：${r.id}.${key}`);
    assert(r.chronology.accession === null || r.chronology.accession >= r.end, `即位晚于统治结束：${r.id}`);
  }
  for (const p of atlas.people) {
    assert(!['states', 'journey', 'relatedEvents'].some(key => own(p, key)), `人物关系应通过 ID 维护：${p.id}`);
    assert(p.name && p.summary && p.sourceIds?.length, `人物简介或来源缺失：${p.id}`);
  }
  for (const e of atlas.events) {
    assert(!['states', 'participants'].some(key => own(e, key)), `事件关系应在关系表维护：${e.id}`);
    assert(own(e, 'year') !== own(e, 'yearRef'), `事件须选择 year 或 yearRef：${e.id}`);
    if (e.yearRef) {
      ref('rulers', e.yearRef.rulerId);
      assert(chronologyFields.includes(e.yearRef.field), `不支持的纪年字段：${e.id}`);
      assert(year(maps.rulers.get(e.yearRef.rulerId).chronology[e.yearRef.field]), `事件引用的纪年尚未核实：${e.id}`);
    } else assert(year(e.year), `事件年份无效：${e.id}`);
    date(e.dating, e.id);
    assert(e.sourceIds?.length, `事件缺少来源：${e.id}`);
    for (const key of ['background', 'process', 'result', 'impact']) assert(typeof e.narrative?.[key] === 'string' && e.narrative[key].trim(), `事件摘要不完整：${e.id}.${key}`);
    assert(Array.isArray(e.narrative.related), `事件主题关联须为数组：${e.id}`);
    for (const id of e.narrative.related) { ref('events', id); assert(id !== e.id, `事件不可关联自己：${id}`); }
  }
  const stages = new Set();
  for (const a of atlas.activities) {
    ref('people', a.personId); ref('states', a.stateId);
    if (a.eventId) ref('events', a.eventId);
    assert(activityKinds.includes(a.kind) && a.kindLabel, `未知活动类别：${a.id}`);
    assert(Number.isInteger(a.sequence) && a.sequence > 0 && !stages.has(`${a.personId}:${a.sequence}`), `人物活动排序重复或无效：${a.id}`);
    stages.add(`${a.personId}:${a.sequence}`);
    assert(own(a, 'year') !== own(a, 'yearFromEvent'), `活动须选择 year 或 yearFromEvent：${a.id}`);
    if (own(a, 'yearFromEvent')) assert(a.yearFromEvent === true && a.eventId, `活动日期引用缺少事件：${a.id}`);
    else assert(a.year === null || year(a.year), `活动年份无效：${a.id}`);
    assert(a.sourceIds?.length, `活动缺少来源：${a.id}`);
  }
  const definitions = {
    eventStates: [['eventId', 'events'], ['stateId', 'states']],
    eventPeople: [['eventId', 'events'], ['personId', 'people']],
    rulerPeople: [['rulerId', 'rulers'], ['personId', 'people']],
    personStates: [['personId', 'people'], ['stateId', 'states']]
  };
  for (const [type, fields] of Object.entries(definitions)) {
    assert(Array.isArray(atlas.relations?.[type]), `缺少关系表：${type}`);
    const keys = new Set();
    for (const edge of atlas.relations[type]) {
      fields.forEach(([field, collection]) => ref(collection, edge[field]));
      const key = fields.map(([field]) => edge[field]).join(':');
      assert(!keys.has(key), `重复关联：${type}:${key}`); keys.add(key);
      if (edge.stateId) ref('states', edge.stateId);
      const kinds = {eventStates:['involved'], eventPeople:['participant','related'], rulerPeople:['associated'], personStates:activityKinds};
      assert(kinds[type].includes(edge.kind), `未知关系类别：${type}:${key}`);
      if (type !== 'eventStates') assert(edge.sourceIds?.length && edge.description, `关系缺少来源或说明：${type}:${key}`);
      if (type === 'eventPeople' && edge.kind === 'participant') {
        assert(atlas.relations.eventStates.some(v => v.eventId === edge.eventId && v.stateId === edge.stateId), `参与者所属国家未在事件中列明：${key}`);
      }
    }
  }
  for (const e of atlas.events) assert(atlas.relations.eventStates.some(v => v.eventId === e.id), `事件没有相关国家：${e.id}`);
  return maps;
}

export function compileAtlas(atlas) {
  const maps = validateAtlas(atlas);
  const hydrate = value => {
    if (Array.isArray(value)) return value.map(hydrate);
    if (!value || typeof value !== 'object') return value;
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      if (key === 'sourceIds') out.sources = v.map(id => ({...maps.sources.get(id)}));
      else if (key === 'sourceId') out.source = maps.sources.get(v).url;
      else out[key] = hydrate(v);
    }
    return out;
  };
  const eventYear = e => e.yearRef ? maps.rulers.get(e.yearRef.rulerId).chronology[e.yearRef.field] : e.year;
  const rel = atlas.relations;
  const personCard = edge => {
    const p = hydrate(maps.people.get(edge.personId));
    return {...p, relation:edge.description, sources:hydrate({sourceIds:unique([...maps.people.get(edge.personId).sourceIds, ...edge.sourceIds])}).sources, ...(edge.note ? {summary:edge.note} : {})};
  };
  const states = atlas.states.map(s => ({...hydrate(s), rulers:atlas.rulers.filter(r => r.stateId === s.id).map(r => {
    const ministers = rel.rulerPeople.filter(edge => edge.rulerId === r.id).map(personCard);
    return {...hydrate(r), ministers, ministerCoverage:ministers.length ? '仅列已核实关联，不表示任职贯穿整个在位区间。' : '尚未收录可靠的相关人物资料。'};
  })}));
  const events = atlas.events.map(e => ({...hydrate(e), year:eventYear(e),
    states:rel.eventStates.filter(edge => edge.eventId === e.id).map(edge => edge.stateId),
    participants:rel.eventPeople.filter(edge => edge.eventId === e.id && edge.kind === 'participant').map(edge => ({...personCard(edge), state:edge.stateId})),
    participantCoverage:'仅列已收录且有明确关系记载的人物；同年在位不等于亲自参与。'
  }));
  const people = atlas.people.map(p => {
    const activities = atlas.activities.filter(a => a.personId === p.id).sort((a,b) => a.sequence - b.sequence);
    const rulerEdges = rel.rulerPeople.filter(edge => edge.personId === p.id);
    const eventEdges = rel.eventPeople.filter(edge => edge.personId === p.id);
    const states = unique([
      ...rulerEdges.map(edge => maps.rulers.get(edge.rulerId).stateId),
      ...rel.personStates.filter(edge => edge.personId === p.id).map(edge => edge.stateId),
      ...eventEdges.map(edge => edge.stateId).filter(Boolean),
      ...activities.map(a => a.stateId)
    ]);
    const relatedEvents = unique([...eventEdges.map(edge => edge.eventId), ...activities.map(a => a.eventId).filter(Boolean)]);
    const journey = activities.map(a => {
      const e = a.yearFromEvent ? maps.events.get(a.eventId) : null;
      return {...hydrate(a), state:a.stateId, kind:a.kindLabel, kindCode:a.kind, year:e ? eventYear(e) : a.year,
        approx:e ? e.approx || e.dating.level !== 'certain' : a.approx, ...(a.eventId ? {event:a.eventId} : {}), ...(e ? {dating:hydrate(e.dating)} : {})};
    });
    return {...hydrate(p), states, relatedEvents, ...(journey.length ? {journey} : {})};
  });
  const rulers = states.flatMap(s => s.rulers);
  return {
    updated:atlas.metadata.updated, version:atlas.metadata.version,
    sources:hydrate({sourceIds:atlas.metadata.sourceIds}).sources,
    states, events, people,
    peopleCoverage:{detailedRulerIntervals:rulers.filter(r => r.biography?.detailLevel === '生平简介').length,
      rulerIntervalsWithMinisters:rulers.filter(r => r.ministers.length).length, ministerProfiles:people.length},
    researchCoverage:{journeys:people.filter(p => p.journey?.length).length, narratives:events.filter(e => e.narrative).length, note:atlas.metadata.researchNote}
  };
}

export const serializeAtlas = atlas => 'window.ZHOU_DATA = ' + JSON.stringify(compileAtlas(atlas)) + ';\n';
