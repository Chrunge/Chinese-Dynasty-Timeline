(function (Zhou) {
  'use strict';
  // Biography reader mode and trajectory engine for 57 historical figures.
  const {topicToFile:TOPIC_TO_FILE,dynasties:BIOGRAPHY_DYNASTIES}=Zhou.BiographyData;

  function toCoord(val) {
    if (val == null) return null;
    if (typeof val === 'number') return val;
    if (typeof val === 'object' && val.year) {
      return val.era === 'BCE' ? val.year : 1 - val.year;
    }
    return null;
  }

  const Biography = {
    dynasties: BIOGRAPHY_DYNASTIES,

    getFiguresForDataset(datasetId) {
      const file = TOPIC_TO_FILE[datasetId] || (datasetId + '.json');
      const entry = BIOGRAPHY_DYNASTIES.find(d => d.datasetFile === file);
      return entry ? entry.figures : [];
    },

    getAllFigures() {
      const map = new Map();
      for (const d of BIOGRAPHY_DYNASTIES) {
        for (const f of d.figures) {
          if (!map.has(f.id)) map.set(f.id, f);
        }
      }
      return Array.from(map.values());
    },

    enrichDataset(D) {
      if (!D || !Array.isArray(D.people)) return;
      const topicId = D.datasetId || D.timeline?.topic || 'zhou';
      const figures = this.getFiguresForDataset(topicId);
      const peopleMap = new Map((D.people || []).map(p => [p.id, p]));

      for (const fig of figures) {
        let p = peopleMap.get(fig.id);
        if (p) {
          p.biographyPlan = fig.biographyPlan;
          p.servedMonarchs = fig.servedMonarchs;
          p.associatedPolities = fig.associatedPolities;
          p.stageActivities = fig.stageActivities;
          if (!p.role || p.role === '已收录人物') p.role = fig.role;
          if (!p.sources || !p.sources.length) {
            p.sources = Array.isArray(fig.sources) ? fig.sources.slice() : [];
          }
        } else {
          const newPerson = {
            id: fig.id,
            name: fig.name,
            role: fig.role,
            summary: fig.summary,
            sourceIds: (fig.sources || []).map(s => s.id),
            sources: fig.sources || [],
            states: (fig.associatedPolities || []).map(ap => ap.polityId),
            relatedEvents: (fig.biographyPlan?.chapters || []).map(c => c.eventId).filter(Boolean),
            eventIds: (fig.biographyPlan?.chapters || []).map(c => c.eventId).filter(Boolean),
            rulerKeys: (fig.servedMonarchs || []).map(m => 'ruler:' + m.tenureId),
            biographyPlan: fig.biographyPlan,
            servedMonarchs: fig.servedMonarchs,
            associatedPolities: fig.associatedPolities,
            stageActivities: fig.stageActivities,
            journey: (fig.stageActivities || []).map(sa => ({
              id: sa.id,
              label: sa.label,
              text: sa.text,
              kind: sa.kindLabel,
              kindCode: sa.kind,
              state: sa.polityId,
              year: toCoord(sa.year),
              approx: sa.approx || false
            }))
          };
          D.people.push(newPerson);
          peopleMap.set(fig.id, newPerson);
        }
      }
    },

    getMatchingEntities(motif, D) {
      if (!motif || motif === 'none' || !D) {
        return { active: false, personIds: new Set(), tenureIds: new Set(), eventIds: new Set(), stateIds: new Set() };
      }
      const personIds = new Set();
      for (const p of (D.people || [])) {
        const bp = p.biographyPlan;
        if (!bp) continue;
        if (motif === 'all') {
          personIds.add(p.id);
        } else if (motif === 'core26') {
          if (bp.isCore26) personIds.add(p.id);
        } else if (bp.motifCategory === motif) {
          personIds.add(p.id);
        }
      }

      const tenureIds = new Set();
      const stateIds = new Set();
      const eventIds = new Set();

      for (const p of (D.people || [])) {
        if (!personIds.has(p.id)) continue;
        for (const s of (p.states || [])) stateIds.add(s);
        for (const ap of (p.associatedPolities || [])) stateIds.add(ap.polityId);
        for (const m of (p.servedMonarchs || [])) if (m.tenureId) tenureIds.add(m.tenureId);
        for (const eId of (p.eventIds || [])) eventIds.add(eId);
        for (const eId of (p.relatedEvents || [])) eventIds.add(eId);
        for (const ch of (p.biographyPlan?.chapters || [])) {
          if (ch.eventId) eventIds.add(ch.eventId);
          if (ch.polityId) stateIds.add(ch.polityId);
        }
        for (const sa of (p.stageActivities || [])) {
          if (sa.eventId) eventIds.add(sa.eventId);
          if (sa.polityId) stateIds.add(sa.polityId);
        }
      }

      for (const state of (D.states || [])) {
        for (const r of (state.rulers || [])) {
          if (r.ministers && r.ministers.some(m => personIds.has(m.id))) {
            tenureIds.add(r.id);
          }
        }
      }

      for (const e of (D.events || [])) {
        if (e.participants && e.participants.some(pt => personIds.has(pt.id))) {
          eventIds.add(e.id);
        }
      }

      return {
        active: true,
        motif,
        personIds,
        tenureIds,
        eventIds,
        stateIds
      };
    },

    getTrajectoryPoints(person, rowLayouts, xFn, labelWidth) {
      if (!person) return [];
      const stages = Zhou.PersonActivities.narrative(person);
      if (!stages.length) return [];
      const sorted = [...stages].sort((a, b) => a.sequence - b.sequence);
      const points = [];
      for (const s of sorted) {
        const yCoord = toCoord(s.year);
        if (!Number.isFinite(yCoord)) continue;
        const polityId = s.polityId || s.stateId;
        const row = rowLayouts ? rowLayouts.get(polityId) : null;
        if (!row) continue;
        const px = xFn(yCoord) + labelWidth;
        const py = row.offset + row.height / 2;
        points.push({
          seq: s.sequence,
          year: yCoord,
          polityId,
          x: Math.round(px),
          y: Math.round(py),
          label: s.label || s.title || '',
          kindLabel: s.kindLabel || '',
          text: s.text || s.summary || ''
        });
      }
      return points;
    },

    buildTrajectoryPath(points) {
      if (!points || points.length < 2) return '';
      let d = 'M ' + points[0].x + ' ' + points[0].y;
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1], p1 = points[i];
        const mx = Math.round((p0.x + p1.x) / 2);
        d += ' C ' + mx + ' ' + p0.y + ', ' + mx + ' ' + p1.y + ', ' + p1.x + ' ' + p1.y;
      }
      return d;
    }
  };

  Zhou.Biography = Biography;
})(globalThis.Zhou = globalThis.Zhou || {});
