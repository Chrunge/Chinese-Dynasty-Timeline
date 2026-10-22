(function (Zhou) {
  'use strict';

  const MOTIF_CATEGORIES = Object.freeze([
    {
      key: '铁血变法与破局者',
      name: '铁血变法与破局者',
      icon: '🔥',
      intro: '身处秩序困局，以铁腕法令革弊破局。'
    },
    {
      key: '文人挂帅与定鼎孤臣',
      name: '文人挂帅与定鼎孤臣',
      icon: '⚔️',
      intro: '危难之际执掌枢机或挂帅三军，力挽狂澜。'
    },
    {
      key: '时代风暴中的文史巨擘',
      name: '时代风暴中的文史与科学巨擘',
      icon: '📜',
      intro: '在乱世贬谪或实学探索中铸就文化与科学巅峰。'
    },
    {
      key: '绝境逆旅与隐忍权谋者',
      name: '绝境逆旅与隐忍权谋者',
      icon: '♟️',
      intro: '历经多朝更迭与权力漩涡，隐忍谋国或全身存民。'
    }
  ]);

  const KNOWN_MOTIF_KEYS = new Set(MOTIF_CATEGORIES.map(c => c.key));

  function isFigure(p) {
    if (!p || typeof p !== 'object' || p.id == null) return false;
    const id = String(p.id).trim();
    if (!id) return false;
    const hasBioPlan = Boolean(p.biographyPlan && typeof p.biographyPlan === 'object');
    const hasStageActivities = Array.isArray(p.stageActivities) && p.stageActivities.length > 0;
    const hasJourney = Array.isArray(p.journey) && p.journey.length > 0;
    return hasBioPlan || hasStageActivities || hasJourney;
  }

  function isCore(p) {
    return Boolean(p && p.biographyPlan && p.biographyPlan.isCore26 === true);
  }

  function createFiguresModel(data) {
    const rawPeople = Array.isArray(data?.people) ? data.people : [];
    const seenIds = new Set();
    const people = [];

    for (const p of rawPeople) {
      if (!isFigure(p)) continue;
      const idStr = String(p.id);
      if (seenIds.has(idStr)) continue;
      seenIds.add(idStr);
      people.push(p);
    }

    const peopleMap = new Map();
    for (const p of people) {
      peopleMap.set(p.id, p);
      peopleMap.set(String(p.id), p);
    }

    // Build sets of valid existing entity IDs in the current dataset
    const validStateIds = new Set();
    if (Array.isArray(data?.states)) {
      for (const s of data.states) {
        if (s && s.id != null) validStateIds.add(String(s.id));
      }
    }

    const validTenureIds = new Set();
    if (Array.isArray(data?.rulers)) {
      for (const r of data.rulers) {
        if (r && r.id != null) validTenureIds.add(String(r.id));
      }
    }
    if (Array.isArray(data?.states)) {
      for (const s of data.states) {
        if (Array.isArray(s?.rulers)) {
          for (const r of s.rulers) {
            if (r && r.id != null) validTenureIds.add(String(r.id));
          }
        }
      }
    }

    const validEventIds = new Set();
    if (Array.isArray(data?.events)) {
      for (const e of data.events) {
        if (e && e.id != null) validEventIds.add(String(e.id));
      }
    }

    function person(id) {
      if (id == null) return null;
      return peopleMap.get(id) || peopleMap.get(String(id)) || null;
    }

    function groups({ coreOnly = false } = {}) {
      const activePeople = coreOnly ? people.filter(isCore) : people;
      const result = [];

      for (const cat of MOTIF_CATEGORIES) {
        const catPeople = activePeople.filter(p => p.biographyPlan?.motifCategory === cat.key);
        if (catPeople.length > 0) {
          result.push({
            key: cat.key,
            name: cat.name,
            icon: cat.icon,
            intro: cat.intro,
            count: catPeople.length,
            people: catPeople
          });
        }
      }

      // People not categorized under the 4 standard motifs are placed in other group
      const otherPeople = activePeople.filter(p => {
        const motif = p.biographyPlan?.motifCategory;
        return !motif || !KNOWN_MOTIF_KEYS.has(motif);
      });

      if (otherPeople.length > 0) {
        result.push({
          key: 'other',
          name: '其他已收录人物',
          icon: '📜',
          intro: '本专题其他已收录人物。',
          count: otherPeople.length,
          people: otherPeople
        });
      }

      return result;
    }

    function deriveEntities(targetPeople) {
      if (!Array.isArray(targetPeople) || targetPeople.length === 0) {
        return {
          active: false,
          personIds: new Set(),
          tenureIds: new Set(),
          eventIds: new Set(),
          stateIds: new Set()
        };
      }

      const personIds = new Set(targetPeople.map(p => p.id));
      const personIdStrs = new Set(targetPeople.map(p => String(p.id)));
      const stateIds = new Set();
      const tenureIds = new Set();
      const eventIds = new Set();

      for (const p of targetPeople) {
        // States from person
        if (Array.isArray(p.states)) {
          for (const s of p.states) {
            const sid = String(s);
            if (validStateIds.has(sid)) stateIds.add(sid);
          }
        }
        if (Array.isArray(p.associatedPolities)) {
          for (const ap of p.associatedPolities) {
            const sid = String(ap?.polityId || ap?.stateId || '');
            if (sid && validStateIds.has(sid)) stateIds.add(sid);
          }
        }
        if (Array.isArray(p.biographyPlan?.chapters)) {
          for (const ch of p.biographyPlan.chapters) {
            const sid = String(ch?.polityId || ch?.stateId || '');
            if (sid && validStateIds.has(sid)) stateIds.add(sid);
            const eid = String(ch?.eventId || '');
            if (eid && validEventIds.has(eid)) eventIds.add(eid);
          }
        }
        if (Array.isArray(p.stageActivities)) {
          for (const sa of p.stageActivities) {
            const sid = String(sa?.polityId || sa?.stateId || '');
            if (sid && validStateIds.has(sid)) stateIds.add(sid);
            const eid = String(sa?.eventId || '');
            if (eid && validEventIds.has(eid)) eventIds.add(eid);
          }
        }
        if (Array.isArray(p.journey)) {
          for (const j of p.journey) {
            const sid = String(j?.state || j?.polityId || j?.stateId || '');
            if (sid && validStateIds.has(sid)) stateIds.add(sid);
            const eid = String(j?.event || j?.eventId || '');
            if (eid && validEventIds.has(eid)) eventIds.add(eid);
          }
        }

        // Tenures from person
        if (Array.isArray(p.servedMonarchs)) {
          for (const sm of p.servedMonarchs) {
            const tid = String(sm?.tenureId || sm?.rulerId || '');
            if (tid && validTenureIds.has(tid)) tenureIds.add(tid);
          }
        }
        if (Array.isArray(p.rulerKeys)) {
          for (const rk of p.rulerKeys) {
            const tid = String(rk).replace(/^ruler:/, '');
            if (tid && validTenureIds.has(tid)) tenureIds.add(tid);
          }
        }

        // Events from person
        if (Array.isArray(p.eventIds)) {
          for (const eid of p.eventIds) {
            const idStr = String(eid);
            if (validEventIds.has(idStr)) eventIds.add(idStr);
          }
        }
        if (Array.isArray(p.relatedEvents)) {
          for (const eid of p.relatedEvents) {
            const idStr = String(eid);
            if (validEventIds.has(idStr)) eventIds.add(idStr);
          }
        }
      }

      // Derive from rulers' ministers (strictly matching explicit IDs, not names)
      function scanRulerMinisters(rulers) {
        if (!Array.isArray(rulers)) return;
        for (const r of rulers) {
          if (!r || r.id == null || !validTenureIds.has(String(r.id))) continue;
          if (Array.isArray(r.ministers)) {
            for (const m of r.ministers) {
              if (m && m.id != null && (personIds.has(m.id) || personIdStrs.has(String(m.id)))) {
                tenureIds.add(String(r.id));
                break;
              }
            }
          }
        }
      }

      scanRulerMinisters(data?.rulers);
      if (Array.isArray(data?.states)) {
        for (const s of data.states) {
          scanRulerMinisters(s?.rulers);
        }
      }

      // Derive from events' participants (strictly matching explicit IDs, not names)
      if (Array.isArray(data?.events)) {
        for (const e of data.events) {
          if (!e || e.id == null || !validEventIds.has(String(e.id))) continue;
          if (Array.isArray(e.participants)) {
            for (const pt of e.participants) {
              if (pt && pt.id != null && (personIds.has(pt.id) || personIdStrs.has(String(pt.id)))) {
                eventIds.add(String(e.id));
                break;
              }
            }
          }
        }
      }

      return {
        active: true,
        personIds,
        tenureIds,
        eventIds,
        stateIds
      };
    }

    function entitiesForPerson(id) {
      const p = person(id);
      if (!p) {
        return {
          active: false,
          personIds: new Set(),
          tenureIds: new Set(),
          eventIds: new Set(),
          stateIds: new Set()
        };
      }
      return deriveEntities([p]);
    }

    function entitiesForCategory(key, { coreOnly = false } = {}) {
      if (!key) {
        return {
          active: false,
          personIds: new Set(),
          tenureIds: new Set(),
          eventIds: new Set(),
          stateIds: new Set()
        };
      }

      let matchingPeople = [];
      if (key === 'all' || key === '全部') {
        matchingPeople = coreOnly ? people.filter(isCore) : people;
      } else if (key === 'other' || key === '其他已收录人物') {
        const otherPeople = people.filter(p => {
          const motif = p.biographyPlan?.motifCategory;
          return !motif || !KNOWN_MOTIF_KEYS.has(motif);
        });
        matchingPeople = coreOnly ? otherPeople.filter(isCore) : otherPeople;
      } else {
        const cat = MOTIF_CATEGORIES.find(c => c.key === key || c.name === key);
        const targetKey = cat ? cat.key : key;
        const catPeople = people.filter(p => p.biographyPlan?.motifCategory === targetKey);
        matchingPeople = coreOnly ? catPeople.filter(isCore) : catPeople;
      }

      if (matchingPeople.length === 0) {
        return {
          active: false,
          personIds: new Set(),
          tenureIds: new Set(),
          eventIds: new Set(),
          stateIds: new Set()
        };
      }

      return deriveEntities(matchingPeople);
    }

    return {
      people,
      count: people.length,
      groups,
      person,
      entitiesForPerson,
      entitiesForCategory
    };
  }

  Zhou.createFiguresModel = createFiguresModel;
  Zhou.MOTIF_CATEGORIES = MOTIF_CATEGORIES;
})(globalThis.Zhou = globalThis.Zhou || {});
