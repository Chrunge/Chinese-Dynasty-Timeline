// Technical projection only. The four source JSON files remain byte-for-byte intact.
const additionalIds = new Set(['wei-jin-nan-bei', 'sui-tang', 'liao-jin-song', 'ming']);
const kindMaps = {
  activities: {military:'activity', culture:'activity', thought:'activity'},
  eventPolities: {founded:'involved', ended:'involved'},
  eventPeople: {leader:'participant', commander:'participant', victim:'related'},
  tenurePeople: {holder:'associated'},
  personPolities: {monarch:'service', cultural:'activity', royal:'activity'},
  events: {'军事':'战争', '制度':'政治', '思想':'文化'}
};
const reasons = {
  activities:'UI通用活动类别；不推造服役、教学或出行，原kindLabel/label/text不变。',
  eventPolities:'建置或终结均属事件涉及政权；原关系类型另存sourceKind。',
  eventPeople:'leader/commander为原文参与角色；victim仅作相关人物，避免推造主动参与。',
  tenurePeople:'任职持有人属于关联人物；原任期、人物ID和说明不变。',
  personPolities:'monarch按既有君主/执政任职关联归service，非一律皇帝；文化和宗室仅归通用活动，不推造官职。',
  events:'UI类别归一化：军事→战争，制度→政治（不一律视为改革），思想→文化；非史实修改。'
};

/**
 * Pure, deterministic compatibility projection for an already-cloned schema-2 input.
 * Returns a fresh annotated copy for the four supported IDs, without mutating a;
 * unknown/old IDs return a unchanged by identity. No I/O, validation bypass or ID/name matching.
 * The caller must still pass the result through validateAtlas / compileAtlas.
 */
export function prepareAdditionalProduction(a, id) {
  if (!additionalIds.has(id)) return a;
  const out = structuredClone(a);
  if (out.metadata.importNotes?.some(note => note.code === 'additional-production-v1')) return out;
  const changes = [];
  for (const [collection, mapping] of Object.entries(kindMaps)) {
    const records = ['events', 'activities'].includes(collection) ? out[collection] : out.relations[collection];
    for (const [index, record] of records.entries()) {
      if (!Object.hasOwn(mapping, record.kind)) continue;
      const from = record.kind, to = mapping[from];
      record.sourceKind = from;
      record.kind = to;
      changes.push({collection, index, ...(record.id ? {id:record.id} : {}), originalKind:from, projectedKind:to, reason:reasons[collection]});
    }
  }
  for (const [index, period] of out.periods.entries()) {
    if (period.structure !== 'dynasty') continue;
    period.sourceStructure = period.structure;
    period.structure = 'overview';
    changes.push({collection:'periods', index, id:period.id, field:'structure', originalStructure:'dynasty', projectedStructure:'overview', reason:'朝代视角仅归全览；不据此假定全时期大一统。'});
  }
  // The only approved duplicate: one compound event records both the founding and
  // ending of Southern Ming. Keep both original edges, not just one chosen claim.
  if (id === 'ming') {
    const eventId = 'ming-event-09-southern-ming-zheng-taiwan', polityId = 'southern-ming';
    const originals = a.relations.eventPolities.filter(edge => edge.eventId === eventId && edge.polityId === polityId);
    if (originals.length === 2 && originals[0].kind === 'founded' && originals[1].kind === 'ended') {
      const first = out.relations.eventPolities.find(edge => edge.eventId === eventId && edge.polityId === polityId);
      first.kind = 'involved';
      delete first.sourceKind; // Neither original subtype is the sole claim.
      first.sourceEdges = structuredClone(originals);
      const sourceIds = [...new Set(originals.flatMap(edge => edge.sourceIds || []))];
      if (sourceIds.length) first.sourceIds = sourceIds;
      const descriptions = originals.map(edge => edge.description).filter(Boolean);
      if (descriptions.length) first.description = descriptions.join('；');
      let retained = false;
      out.relations.eventPolities = out.relations.eventPolities.filter(edge => {
        if (edge.eventId !== eventId || edge.polityId !== polityId) return true;
        if (retained) return false;
        retained = true;
        return true;
      });
      changes.push({collection:'eventPolities', eventId, polityId, operation:'coalesce', originalCount:2, projectedCount:1, reason:'同一事件/政权的founded和ended归一逻辑关联；两条原边完整保存在sourceEdges，不裁决复合事件的不同阶段。'});
    }
  }
  out.metadata.importNotes = [...(out.metadata.importNotes || []), {
    code:'additional-production-v1',
    note:'仅技术投影：原文件逐字节保留；未联网史实校验，未修改日期、实体ID或关系端点。类别归一化及同pair合并均可追溯，不能理解为新史实或重新校核。',
    changes
  }];
  return out;
}
