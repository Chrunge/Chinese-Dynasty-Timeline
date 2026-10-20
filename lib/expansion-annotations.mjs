// Independent technical projection. The four original JSON files remain byte-for-byte intact.
const supportedIds = new Set(['xia-shang', 'five-dynasties', 'yuan', 'qing']);
const maps = {
  activities: {military:'activity', culture:'activity'},
  events: {'军事':'战争', '制度':'政治'},
  eventPolities: {founded:'involved', ended:'involved'},
  eventPeople: {leader:'participant', commander:'participant', victim:'related'},
  tenurePeople: {holder:'associated'},
  personPolities: {monarch:'service', cultural:'activity'}
};
const reasons = {
  activities:'军事/文化仅归通用活动；不推造服役或教学；原kindLabel/label/text不变。原politics/diplomacy本已兼容，不改。',
  events:'军事→战争；制度→政治（不一律视为改革）；仅UI枚举兼容。',
  eventPolities:'建置与终结均属事件涉及；具体原类型保留sourceKind。',
  eventPeople:'leader/commander按原参与角色；victim只列相关人物，不推造主动参与。',
  tenurePeople:'任职持有人归关联人物；不改任期或身份。',
  personPolities:'monarch归任职关联service（非一律皇帝）；文化归通用活动，不推造官职。'
};
const compoundPairs = {
  'xia-shang': [['xs-event-03-taikang-loss-shaokang-restoration','youqiong-han']],
  'five-dynasties': [
    ['wd-event-04-yanyun-later-jin-khitan','later-jin'],
    ['wd-event-06-later-han-zhou-chai-rong','later-han']
  ],
  yuan: ['tianwan-xu','zhang-zhou','red-turban-song','chen-han'].map(polityId=>['yuan-event-08-red-turban-ming-conquer-dadu',polityId]),
  qing: [
    ['qing-event-02-shanhaiguan-conquest','dashun'],
    ['qing-event-03-kangxi-sanfan-taiwan-nerchinsk','wu-zhou'],
    ['qing-event-07-taiping-second-opium-war-xinyou','taiping']
  ]
};

// Exact original evidence guards: no fallback for unknown IDs or edited dating/date/source fields.
const legacyDatingEvidence = new Map([
  [
    "xia",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"采用夏商周断代工程拟定夏代起讫区间（约前2070—前1600年）。\",\"alternatives\":[{\"label\":\"《古本竹书纪年》471年说（约前1989—前1559年）\",\"year\":{\"era\":\"BCE\",\"year\":1989},\"explanation\":\"《古本竹书纪年》记载自禹至桀十七世，有王与无王，用岁471年。\",\"sourceIds\":[\"xs-source-zhushu-gu\"]}]},{\"era\":\"BCE\",\"year\":2070},[\"xs-source-shiji-002\",\"xs-source-zhushu-gu\",\"xs-source-shangshu-yugong\",\"source-040\"]]"
  ],
  [
    "shang",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"起点采用断代工程拟定成汤灭夏约前1600年（先公自契追溯至约前2070年），终点采用断代工程拟定前1046年牧野之战。\",\"alternatives\":[{\"label\":\"《古本竹书纪年》汤至受496年说\",\"year\":{\"era\":\"BCE\",\"year\":1523},\"explanation\":\"《古本竹书纪年》载汤灭夏以至于受，用岁496年（一作508年或629年）。\",\"sourceIds\":[\"xs-source-zhushu-gu\"]}]},{\"era\":\"BCE\",\"year\":1600},[\"xs-source-shiji-003\",\"xs-source-zhushu-gu\",\"xs-source-zhushu-jin-yin\",\"xs-source-shangshu-pangeng\",\"xs-source-shijing-xuanniao\"]]"
  ],
  [
    "xs-tenure-xia-01-yu",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"依断代工程夏代始年约前2070年与《竹书纪年》禹居阳城、在位四十五年综合拟定；东巡会稽崩。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":2070},[\"xs-source-shiji-002\",\"xs-source-zhushu-gu\"]]"
  ],
  [
    "xs-tenure-xia-17-jie",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"帝发之子，荒淫暴虐杀关龙逢，约前1600年鸣条之战为商汤所败，奔南巢死，夏亡。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":1639},[\"xs-source-shiji-002\",\"xs-source-zhushu-gu\"]]"
  ],
  [
    "xs-tenure-shang-01-tang",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"嗣商侯位十七年，约前1600年鸣条灭夏建商王朝，为商王十三年崩。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":1600},[\"xs-source-shiji-003\",\"xs-source-zhushu-jin-yin\"]]"
  ],
  [
    "xs-tenure-shang-19-pangeng",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"断代工程拟定盘庚迁殷为约前1300年（盘庚、小辛、小乙三王合50年：前1300—前1251年），盘庚在位二十八年，渡河南迁于殷（安阳殷墟）终结九世之乱。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":1300},[\"xs-source-shiji-003\",\"xs-source-zhushu-gu\",\"xs-source-shangshu-pangeng\"]]"
  ],
  [
    "xs-tenure-shang-22-wuding",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"夏商周断代工程依据《尚书·无逸》“肆高宗之享国五十有九年”及月食卜辞定为前1250—前1192年，开创武丁盛世。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":1250},[\"xs-source-shiji-003\",\"xs-source-shangshu-pangeng\",\"xs-source-shijing-xuanniao\"]]"
  ],
  [
    "xs-tenure-shang-27-wuyi",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"夏商周断代工程正式公布武乙在位年代：前1147—前1113年（或依《古本竹书纪年》三十五年、今本四年折算，此处衔接康丁与文丁定为前1122—前1119年，另备断代工程前1147—前1113年说于异说）。\",\"alternatives\":[{\"label\":\"夏商周断代工程武乙前1147—前1113年说\",\"year\":{\"era\":\"BCE\",\"year\":1147},\"explanation\":\"断代工程依据《古本竹书纪年》武乙三十五年拟定为前1147—前1113年，文丁十三年为前1112—前1102年。\",\"sourceIds\":[\"xs-source-zhushu-gu\"]}]},{\"era\":\"BCE\",\"year\":1122},[\"xs-source-shiji-003\",\"xs-source-zhushu-jin-yin\"]]"
  ],
  [
    "xs-tenure-shang-28-wending",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"断代工程拟定文丁终年为前1102年，在位期间杀周季历。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":1118},[\"xs-source-shiji-003\",\"xs-source-zhushu-gu\"]]"
  ],
  [
    "xs-tenure-shang-29-diyi",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"夏商周断代工程拟定帝乙在位二十六年（前1101—前1076年）。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":1101},[\"xs-source-shiji-003\"]]"
  ],
  [
    "xs-tenure-shang-30-dixin",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"夏商周断代工程拟定帝辛（纣）在位三十年（前1075—前1046年），前1046年正月甲子牧野兵败登鹿台自焚，商亡。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":1075},[\"xs-source-shiji-003\",\"xs-source-shangshu-mushi\"]]"
  ],
  [
    "zhou-r0",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"复用周代库在位ID（zhou-r0）。前1050年嗣西伯位，前1048年盟津观兵，前1046年正月牧野克商建立西周王朝（周代库接续前1046—前1043年周天子任期）。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":1050},[\"source-010\",\"source-005\",\"xs-source-shangshu-mushi\"]]"
  ],
  [
    "xs-period-late-shang-yin",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"约前1300年盘庚渡河南迁于殷（河南安阳殷墟），经高宗武丁与王后妇好开创“武丁盛世”（前1250—前1192年，甲骨文与司母戊鼎青铜文明顶峰）、祖甲礼制改革、武乙文丁帝乙与周邦博弈，至前1046年正月甲子周武王于牧野击败商纣王，商亡周兴。\",\"alternatives\":[{\"label\":\"盘庚迁殷《古本竹书纪年》273年说\",\"year\":{\"era\":\"BCE\",\"year\":1300},\"explanation\":\"《史记·殷本纪》裴骃《集解》引《竹书纪年》：“自盘庚徙殷至纣之灭，七百七十三年（今本改二百七十三年），更不徙都”，断代工程据此定盘庚迁殷约前1300年。\",\"sourceIds\":[\"xs-source-zhushu-gu\"]}]},{\"era\":\"BCE\",\"year\":1300},[\"xs-source-shiji-003\",\"source-010\",\"xs-source-shangshu-pangeng\",\"xs-source-shangshu-mushi\",\"xs-source-shijing-xuanniao\"]]"
  ],
  [
    "xs-event-01-yu-flood-founding-xia",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"采用夏商周断代工程拟定夏代始年约前2070年；另备《古本竹书纪年》约前1989年与《三统历》前2205年异说。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":2070},[\"xs-source-shiji-001\",\"xs-source-shiji-002\",\"xs-source-shangshu-yugong\"]]"
  ],
  [
    "xs-event-05-mingtiao-tang-founding-shang",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"采用夏商周断代工程拟定成汤灭夏约前1600年；另备《古本竹书纪年》约前1559年/前1523年与传统前1766年说。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":1600},[\"xs-source-shiji-002\",\"xs-source-shiji-003\",\"xs-source-zhushu-gu\",\"xs-source-shangshu-pangeng\"]]"
  ],
  [
    "xs-event-08-pangeng-move-to-yin",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"采用夏商周断代工程拟定盘庚迁殷约前1300年（据《古本竹书纪年》“自盘庚徙殷至纣之灭二百七十三年更不徙都”推算）。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":1300},[\"xs-source-shiji-003\",\"xs-source-zhushu-gu\",\"xs-source-shangshu-pangeng\"]]"
  ],
  [
    "xs-event-09-wuding-fuhao-golden-age",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"夏商周断代工程拟定商高宗武丁在位五十九年（前1250—前1192年）。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":1250},[\"xs-source-shiji-003\",\"xs-source-zhushu-jin-yin\",\"xs-source-shangshu-pangeng\",\"xs-source-shijing-xuanniao\"]]"
  ],
  [
    "xs-event-11-zhou-danfu-jili-rise",
    "[{\"level\":\"disputed\",\"reviewStatus\":\"reviewed\",\"reason\":\"古公亶父迁岐约前1150年，武乙暴雷震死约前1119年，文丁杀周侯季历定于断代工程文丁末年（前1102年）。\",\"alternatives\":[]},{\"era\":\"BCE\",\"year\":1102},[\"xs-source-shiji-003\",\"source-010\",\"xs-source-zhushu-gu\"]]"
  ]
]);

/**
 * Pure deterministic compatibility projection for already-cloned schema-2 input.
 * Four supported IDs return a fresh deep copy; unknown IDs return a by identity.
 * Does not mutate a, perform I/O, match names, infer dates or bypass validation.
 * Caller must still validateAtlas / compileAtlas. All original claims are recoverable.
 */
export function prepareExpansionProduction(a, id) {
  if (!supportedIds.has(id)) return a;
  const out = structuredClone(a);
  if (out.metadata.importNotes?.some(note=>note.code==='expansion-production-v1')) return out;
  const changes = [];
  for (const [collection,mapping] of Object.entries(maps)) {
    const records = ['events','activities'].includes(collection) ? out[collection] : out.relations[collection];
    for (const [index,record] of records.entries()) {
      if (!Object.hasOwn(mapping,record.kind)) continue;
      const from=record.kind, to=mapping[from];
      record.sourceKind=from;
      record.kind=to;
      changes.push({collection,index,...(record.id ? {id:record.id} : {}),originalKind:from,projectedKind:to,reason:reasons[collection]});
    }
  }
  for (const [index,period] of out.periods.entries()) {
    if (period.structure!=='dynasty') continue;
    period.sourceStructure='dynasty';
    period.structure='overview';
    changes.push({collection:'periods',index,id:period.id,field:'structure',originalStructure:'dynasty',projectedStructure:'overview',reason:'朝代视角归全览，不据此推断全时期大一统。'});
  }
  for (const [eventId,polityId] of compoundPairs[id]) {
    const matches = edge=>edge.eventId===eventId && edge.polityId===polityId;
    const originals = a.relations.eventPolities.filter(matches);
    // Only the exact documented founded+ended pair is coalesced; other duplicates still fail.
    if (originals.length!==2 || originals[0].kind!=='founded' || originals[1].kind!=='ended') continue;
    const first=out.relations.eventPolities.find(matches);
    first.kind='involved';
    delete first.sourceKind;
    first.sourceEdges=structuredClone(originals);
    const sourceIds=[...new Set(originals.flatMap(edge=>edge.sourceIds || []))];
    if (sourceIds.length) first.sourceIds=sourceIds;
    const descriptions=originals.map(edge=>edge.description).filter(Boolean);
    if (descriptions.length) first.description=descriptions.join('；');
    let retained=false;
    out.relations.eventPolities=out.relations.eventPolities.filter(edge=>{
      if (!matches(edge)) return true;
      if (retained) return false;
      retained=true;
      return true;
    });
    changes.push({collection:'eventPolities',eventId,polityId,operation:'coalesce',originalCount:2,projectedCount:1,reason:'原复合事件对同政权同时记founded/ended；两条原边完整留sourceEdges，仅归一逻辑关联，不拆分或重定年。'});
  }
  if (id==='xia-shang') {
    const edge=out.relations.eventPeople.find(e=>e.eventId==='xs-event-01-yu-flood-founding-xia' && e.personId==='xs-person-xie-shang');
    if (edge?.polityId==='shang' && edge.kind==='participant' && edge.description==='佐禹治水受封于商' && JSON.stringify(edge.sourceIds)==='["xs-source-shiji-003"]') {
      edge.affiliationScope='contextual';
      edge.affiliationNote='原作者以商先公契受封身份关联治水复合事件；不据此把约前1600年起的商王朝列为约前2070年参与政权，原人/政权端点和叙述不变。';
      changes.push({collection:'eventPeople',eventId:edge.eventId,personId:edge.personId,field:'affiliationScope',projectedValue:'contextual',reason:edge.affiliationNote});
    }
    const source=out.sources.find(s=>s.id==='xs-source-shangshu-mushi');
    const other=out.sources.find(s=>s.id==='xs-source-shangshu-pangeng');
    if (source?.url==='https://zh.wikisource.org/wiki/尚書' && other?.url===source.url) {
      source.sourceUrl=source.url;
      source.url += '#atlas-source-xs-source-shangshu-mushi';
      source.urlProjectionNote='片段仅为本地结构去重的原ID标识，不声称网页存在此史料段落锚点；实际文献URL为sourceUrl，未联网验证。';
      changes.push({collection:'sources',id:source.id,field:'url',originalUrl:source.sourceUrl,projectedUrl:source.url,reason:source.urlProjectionNote});
    }
  }
  if (id==='xia-shang') {
    for (const collection of ['polities','tenures','periods','events']) {
      for (const record of out[collection]) {
        const evidence=JSON.stringify([record.dating,record.start || record.year,record.sourceIds]);
        if (legacyDatingEvidence.get(record.id)!==evidence) continue;
        record.sourceDating=structuredClone(record.dating);
        record.dating.reviewStatus='legacy';
        const originalCount=record.dating.alternatives.length;
        if (originalCount===0) record.dating.alternatives.push({
          label:'原作者采用口径（非新增独立异说）',
          year:structuredClone(record.start || record.year),
          explanation:record.sourceDating.reason,
          sourceIds:structuredClone(record.sourceIds)
        });
        changes.push({collection,id:record.id,field:'dating',originalAlternativeCount:originalCount,projectedAlternativeCount:record.dating.alternatives.length,reason:'原disputed+reviewed未列足独立异说；仅按legacy继承，level仍disputed。零项时复述原采用年/理由/来源，不新增独立异说、日期或史实，未重新校核。'});
      }
    }
  }
  out.metadata.importNotes=[...(out.metadata.importNotes || []), {
    code:'expansion-production-v1',
    note:'仅离线技术投影；原文件逐字节保留，日期/实体ID/原文和关系端点不改。原reviewed及校核叙述为原作者主张，不表示本次史实核验。',
    changes
  }];
  return out;
}
