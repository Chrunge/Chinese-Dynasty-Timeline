// Authoring model -> backward-compatible browser projection. No filesystem or UI state.
import {toAxis} from './time.mjs';
const own = (object, key) => Object.hasOwn(object, key);
const unique = values => [...new Set(values)];
const copy = value => Array.isArray(value) ? value.map(copy) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key,v]) => [key,copy(v)])) : value;
const chronologyFields = ['accession', 'regnalStart', 'abdication', 'death'];
const activityKinds = ['service', 'persuasion', 'death', 'activity', 'exile', 'travel', 'origin', 'birth', 'diplomacy', 'invitation', 'teaching', 'residence', 'resignation', 'accession', 'politics', 'founder'];
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const year = value => Number.isSafeInteger(value) && value > 0;
function validateDating(d, id, validYear = year) {
  assert(d && ['certain', 'inferred', 'disputed'].includes(d.level), `纪年可信度缺失：${id}`);
  assert(['legacy', 'partial', 'reviewed'].includes(d.reviewStatus), `纪年校核状态缺失：${id}`);
  assert(typeof d.reason === 'string' && d.reason.trim(), `纪年说明缺失：${id}`);
  assert(Array.isArray(d.alternatives), `纪年异说须为数组：${id}`);
  assert(d.level !== 'disputed' || d.alternatives.length >= (d.reviewStatus === 'legacy' ? 1 : 2), `异说须列明口径（新校核至少两项）：${id}`);
  for (const a of d.alternatives) {
    assert(a.label && a.explanation && a.sourceIds?.length, `异说缺少说明或来源：${id}`);
    assert(a.year == null || validYear(a.year), `异说年份无效：${id}`);
  }
}

function validateLegacyAtlas(atlas, {allowAccessionStart = false} = {}) {
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
  const date = validateDating;
  const undatedIds = new Set(), legacyKeys = new Set();
  for (const s of atlas.states) {
    assert(year(s.start) && year(s.end) && s.start >= s.end, `国家区间倒置：${s.id}`);
    assert(!own(s, 'rulers'), `君主须在独立集合维护：${s.id}`);
    date(s.dating, s.id);
    assert(Array.isArray(s.undated), `未定位君主须为数组：${s.id}`);
    for (const r of s.undated) {
      assert(typeof r.id === 'string' && /^undated-[a-z0-9-]+$/.test(r.id), `未定位君主缺少稳定 ID：${s.id}`);
      assert(!undatedIds.has(r.id) && !Object.values(maps).some(map => map.has(r.id)), `未定位君主重复 ID：${r.id}`);
      undatedIds.add(r.id);
      assert(Array.isArray(r.legacyKeys), `旧路由须为数组：${r.id}`);
      for (const key of r.legacyKeys) {
        assert(typeof key === 'string' && key.startsWith(`undated:${s.id}:`) && /^\d+$/.test(key.slice(`undated:${s.id}:`.length)), `旧路由无效：${r.id}`);
        assert(!legacyKeys.has(key), `旧路由重复：${key}`); legacyKeys.add(key);
      }
    }
  }
  for (const r of atlas.rulers) {
    ref('states', r.stateId);
    assert(year(r.start) && year(r.end) && r.start >= r.end, `君主区间倒置：${r.id}`);
    assert(!own(r, 'ministers'), `君臣关系须在关系表维护：${r.id}`);
    date(r.dating, r.id);
    assert(r.chronology?.regnalStart === r.start || allowAccessionStart && r.chronology?.accession === r.start && year(r.chronology.regnalStart) && r.start >= r.chronology.regnalStart && r.chronology.regnalStart >= r.end, `元年/图示起点与区间不一致：${r.id}`);
    for (const key of chronologyFields) assert(r.chronology[key] === null || year(r.chronology[key]), `生涯节点年份无效：${r.id}.${key}`);
    assert(r.chronology.accession === null || r.chronology.accession >= r.end, `即位晚于统治结束：${r.id}`);
    if (r.chronology.changes != null) {
      assert(Array.isArray(r.chronology.changes), `生涯变化节点须为数组：${r.id}`);
      for (const change of r.chronology.changes) {
        assert(change && year(change.year), `生涯变化节点年份无效：${r.id}`);
        assert(typeof change.label === 'string' && change.label.trim(), `生涯变化节点说明缺失：${r.id}`);
      }
    }
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
    if (own(e, 'endYear')) {
      assert(year(e.endYear), `事件终点年份无效：${e.id}`);
      const start = e.yearRef ? maps.rulers.get(e.yearRef.rulerId).chronology[e.yearRef.field] : e.year;
      assert(start >= e.endYear, `事件区间倒置：${e.id}`);
    }
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
      if (edge.affiliationScope != null) assert(allowAccessionStart && type === 'eventPeople' && edge.affiliationScope === 'contextual' && edge.affiliationNote, `身份关联缺少说明：${key}`);
      if (type === 'eventPeople' && edge.kind === 'participant' && edge.affiliationScope !== 'contextual') {
        assert(atlas.relations.eventStates.some(v => v.eventId === edge.eventId && v.stateId === edge.stateId), `参与者所属国家未在事件中列明：${key}`);
      }
    }
  }
  for (const e of atlas.events) assert(atlas.relations.eventStates.some(v => v.eventId === e.id), `事件没有相关国家：${e.id}`);
  return maps;
}

// Convert schema 2 to the existing projection vocabulary without ever matching names.
function projectAuthoringDates(value, offset = 0) {
  if (Array.isArray(value)) return value.map(item => projectAuthoringDates(item, offset));
  if (!value || typeof value !== 'object') return value;
  if (own(value, 'era')) {
    const axis = toAxis(value) + offset;
    assert(Number.isSafeInteger(axis), '日期转换超出安全整数范围');
    return axis;
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, projectAuthoringDates(item, offset)]));
}

function legacyView(atlas, offset = 0) {
  if (atlas.schemaVersion === 1) return atlas;
  const a = projectAuthoringDates(atlas, offset), rel = a.relations || {};
  return {...a, schemaVersion:1,
    states:a.polities.map(p => ({...p, undated:p.undated || [], interruptions:p.interruptions || []})),
    rulers:a.tenures.map(t => ({...t, stateId:t.polityId})),
    events:a.events.map(e => ({...e, kind:e.kind ?? e.category, ...(e.yearRef ? {yearRef:{rulerId:e.yearRef.tenureId, field:e.yearRef.field}} : {})})),
    activities:a.activities.map(v => ({...v, stateId:v.polityId})),
    relations:{
      eventStates:(rel.eventPolities || []).map(v => ({...v, stateId:v.polityId})),
      eventPeople:(rel.eventPeople || []).map(v => ({...v, ...(v.polityId ? {stateId:v.polityId} : {})})),
      rulerPeople:(rel.tenurePeople || []).map(v => ({...v, rulerId:v.tenureId})),
      personStates:(rel.personPolities || []).map(v => ({...v, stateId:v.polityId}))
    }};
}

function validateDomainConfig(atlas, maps) {
  const convert = value => atlas.schemaVersion === 2 ? toAxis(value) : value;
  const valid = value => atlas.schemaVersion === 2 ? (toAxis(value), true) : year(value);
  const timeline = atlas.timeline;
  if (timeline != null || atlas.schemaVersion === 2) {
    assert(timeline && ['start','end','defaultEnd','cursor'].every(k => valid(timeline[k])), '时间线配置年份无效');
    const {start,end,defaultEnd,cursor} = Object.fromEntries(['start','end','defaultEnd','cursor'].map(k => [k,convert(timeline[k])]));
    assert(start >= defaultEnd && defaultEnd >= end && start >= cursor && cursor >= end, '时间线配置区间倒置或默认值越界');
  }
  assert(atlas.schemaVersion !== 2 || Array.isArray(atlas.periods), '缺少资料集合：periods');
  const periods = new Map();
  for (const p of atlas.periods || []) {
    assert(typeof p.id === 'string' && p.id && !periods.has(p.id), `时期重复 ID 或缺少 ID：${p.id}`);
    periods.set(p.id, p);
    assert(p.name && valid(p.start) && valid(p.end) && convert(p.start) >= convert(p.end), `时期区间倒置或名称缺失：${p.id}`);
    assert(Array.isArray(p.polityIds) && unique(p.polityIds).length === p.polityIds.length, `时期政权引用须为去重数组：${p.id}`);
    p.polityIds.forEach(id => assert(maps.states.has(id), `未知 polities 引用：${id}`));
    if (p.structure != null) assert(['coexistence','unified','transition','overview'].includes(p.structure), `未知时期结构：${p.id}`);
    if (atlas.schemaVersion === 2) {
      assert(p.polityIds.length, `时期须引用至少一个政权：${p.id}`);
      assert(p.sourceIds?.length && p.dating, `时期缺少来源或纪年：${p.id}`);
      validateDating(p.dating,p.id,valid);
      for (const id of p.sourceIds) assert(maps.sources.has(id), `未知 sources 引用：${id}`);
      for (const id of p.polityIds) {
        const polity = atlas.polities.find(v => v.id === id);
        assert(convert(p.start) >= convert(polity.end) && convert(polity.start) >= convert(p.end), `时期与政权区间不相交：${p.id}:${id}`);
      }
    }
  }
  for (const p of periods.values()) {
    if (!p.parentId) continue;
    assert(periods.has(p.parentId), `未知 periods 引用：${p.parentId}`);
    const directParent = periods.get(p.parentId);
    assert(convert(directParent.start) >= convert(p.start) && convert(p.end) >= convert(directParent.end), `子时期超出父时期：${p.id}`);
    const visited = new Set([p.id]); let parent = p;
    while (parent.parentId) {
      assert(!visited.has(parent.parentId), `时期父级循环：${p.id}`);
      visited.add(parent.parentId); parent = periods.get(parent.parentId);
      assert(parent, `未知 periods 引用：${p.parentId}`);
    }
  }
  for (const r of atlas.schemaVersion === 2 ? atlas.tenures : atlas.rulers) {
    if (atlas.schemaVersion === 2) {
      assert(own(r,'personId'), `任期须显式提供 personId（未知为 null）：${r.id}`);
      assert(r.name && r.role && r.sourceIds?.length, `任期缺少名称、职务或来源：${r.id}`);
      const p = atlas.polities.find(p => p.id === r.polityId);
      if(r.polityAssociation != null) {
        assert(r.polityAssociation === 'contextual' && r.associationNote && r.personId != null, `任职阶段关联缺少说明：${r.id}`);
        assert(convert(p.start) >= convert(r.end) && convert(r.start) >= convert(p.end), `任职阶段与政权区间不相交：${r.id}`);
      }
      assert(r.polityAssociation === 'contextual' || convert(p.start) >= convert(r.start) && convert(r.end) >= convert(p.end), `任期超出政权区间：${r.id}`);
    }
    if (r.personId != null) assert(maps.people.has(r.personId), `未知 people 引用：${r.personId}`);
  }
}

export function validateAtlas(atlas) {
  assert(atlas && [1,2].includes(atlas.schemaVersion), '不支持的资料模型版本');
  assert(atlas.metadata && typeof atlas.metadata.updated === 'string' && typeof atlas.metadata.version === 'string' && Array.isArray(atlas.metadata.sourceIds), '缺少资料元信息：metadata');
  if (atlas.schemaVersion === 1) {
    const maps = validateLegacyAtlas(atlas); validateDomainConfig(atlas, maps);
    return {...maps, polities:maps.states, tenures:maps.rulers, periods:new Map((atlas.periods || []).map(p => [p.id,p]))};
  }
  for (const type of ['polities','tenures','people','periods','events','activities','sources']) assert(Array.isArray(atlas[type]), `缺少资料集合：${type}`);
  for (const type of ['eventPolities','eventPeople','tenurePeople','personPolities']) assert(Array.isArray(atlas.relations?.[type]), `缺少关系表：${type}`);
  // Check all authoring date positions, then offset only the validation copy so the
  // unchanged schema-1 validator can check chronology/order across the CE boundary.
  const dateKeys = new Set(['start','end','year','endYear','from','to','defaultEnd','cursor','birth', ...chronologyFields]);
  let minimum = 0;
  const walk = value => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) return value.forEach(walk);
    if (own(value,'era')) { minimum = Math.min(minimum,toAxis(value)); return; }
    for (const [key,v] of Object.entries(value)) {
      if (dateKeys.has(key) && v !== null) { minimum = Math.min(minimum,toAxis(v)); }
      else walk(v);
    }
  };
  walk(atlas);
  assert(Number.isSafeInteger(1-minimum), '日期超出可校验安全范围');
  const maps = validateLegacyAtlas(legacyView(atlas,1-minimum), {allowAccessionStart:true});
  for (const p of atlas.polities) {
    assert(p.name && p.kind && p.sourceIds?.length, `政权缺少名称、类别或来源：${p.id}`);
    if (p.interruptions != null) {
      assert(Array.isArray(p.interruptions), `政权中断须为数组：${p.id}`);
      for (const gap of p.interruptions) assert(toAxis(p.start) >= toAxis(gap.start) && toAxis(gap.start) >= toAxis(gap.end) && toAxis(gap.end) >= toAxis(p.end), `政权中断区间无效：${p.id}`);
    }
  }
  for (const e of atlas.events) {
    assert(e.name && ['政治','战争','改革','外交','文化'].includes(e.kind ?? e.category), `事件缺少名称或类别：${e.id}`);
    assert(e.kind == null || e.category == null || e.kind === e.category, `事件类别冲突：${e.id}`);
  }
  validateDomainConfig(atlas,maps);
  // Public maps expose original authoring records, not the temporary validation axis.
  return Object.fromEntries(['polities','tenures','people','periods','events','activities','sources'].map(type => [type,new Map(atlas[type].map(item => [item.id,item]))]));
}

export function compileAtlas(input) {
  validateAtlas(input);
  const atlas = legacyView(input);
  const maps = Object.fromEntries(['states','rulers','people','events','activities','sources'].map(type => [type,new Map(atlas[type].map(item => [item.id,item]))]));
  const hydrate = value => {
    if (Array.isArray(value)) return value.map(hydrate);
    if (!value || typeof value !== 'object') return value;
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      if (key === 'sourceIds') out.sources = v.map(id => copy(maps.sources.get(id)));
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
  const events = atlas.events.map(e => ({...hydrate(e), ...(input.schemaVersion === 2 && !e.description ? {description:['background','process','result','impact'].map(key=>e.narrative?.[key]).filter(Boolean).join(' ')} : {}), year:eventYear(e),
    states:rel.eventStates.filter(edge => edge.eventId === e.id).map(edge => edge.stateId),
    participants:rel.eventPeople.filter(edge => edge.eventId === e.id && edge.kind === 'participant').map(edge => ({...personCard(edge), state:edge.stateId, ...(edge.affiliationScope ? {affiliationScope:edge.affiliationScope,affiliationNote:edge.affiliationNote} : {})})),
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
  const timeline = atlas.timeline || {start:Math.max(...states.map(s => s.start)), end:Math.min(...states.map(s => s.end)), defaultEnd:Math.min(...states.map(s => s.end)), cursor:Math.max(...states.map(s => s.start))};
  const polities = atlas.states.map(p => hydrate({...p, undated:p.undated || [], interruptions:p.interruptions || []}));
  const tenures = atlas.rulers.map(r => ({...hydrate(r), polityId:r.stateId, personId:r.personId ?? null}));
  const periods = (atlas.periods || []).map(hydrate);
  // Person membership includes explicit officeholding but never inferred name equality.
  for (const p of people) p.states = unique([...p.states, ...tenures.filter(t => t.personId === p.id).map(t => t.polityId)]);
  return {
    schemaVersion:input.schemaVersion, timeEncoding:'bce-axis', timeline:{...timeline},
    title:atlas.metadata.title || '历史时间线', metadata:hydrate(atlas.metadata), periods, polities, tenures,
    ...(atlas.combinations ? {combinations:hydrate(atlas.combinations)} : {}),
    activities:atlas.activities.map(hydrate), relations:hydrate(input.schemaVersion === 2 ? projectAuthoringDates(input.relations) : input.relations),
    updated:atlas.metadata.updated, version:atlas.metadata.version,
    sources:hydrate({sourceIds:atlas.metadata.sourceIds}).sources,
    states, events, people,
    peopleCoverage:{detailedRulerIntervals:rulers.filter(r => r.biography?.detailLevel === '生平简介').length,
      rulerIntervalsWithMinisters:rulers.filter(r => r.ministers.length).length, ministerProfiles:people.length},
    researchCoverage:{journeys:people.filter(p => p.journey?.length).length, narratives:events.filter(e => e.narrative).length, note:atlas.metadata.researchNote}
  };
}

export const serializeAtlas = atlas => 'window.ZHOU_DATA = ' + JSON.stringify(compileAtlas(atlas)) + ';\n';
