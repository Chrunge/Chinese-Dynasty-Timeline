(function (Zhou) {
  'use strict';
  // Runtime projection uses only the active dataset supplied by the application.
  function toCoord(val) {
    if (val == null) return null;
    if (typeof val === 'number') return val;
    if (typeof val === 'object' && val.year) {
      return val.era === 'BCE' ? val.year : 1 - val.year;
    }
    return null;
  }

  const Biography = {
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
