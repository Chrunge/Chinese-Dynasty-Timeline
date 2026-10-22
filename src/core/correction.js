(function (Zhou) {
  'use strict';
  // Topic labels describe the existing datasets, not a replacement entity ID.
  // The Issue Form IDs in .github/ISSUE_TEMPLATE/data-correction.yml are the
  // query contract. No body/title interpolation, network request or auto-submit.
  const topics = Object.freeze({
    'xia-shang':'夏商', 'zhou':'周朝', 'qin-han':'秦汉',
    'three-kingdoms':'三国', 'wei-jin-nan-bei':'魏晋南北朝',
    'sui-tang':'隋唐', 'five-dynasties':'五代十国',
    'liao-jin-song':'宋辽金', 'yuan':'元朝', 'ming':'明朝', 'qing':'清朝'
  });
  Zhou.createCorrectionLink = function (options = {}) {
    // Legacy VM fixtures have no browser URL constructor; never break their
    // existing detail rendering just to add an optional outbound link.
    if (!options || typeof options !== 'object' || typeof URLSearchParams !== 'function') return null;
    const {topic, id, name, year} = options;
    if (typeof topic !== 'string' || !Object.hasOwn(topics, topic) ||
        typeof id !== 'string' || !id.trim() ||
        typeof name !== 'string' || !name.trim()) return null;
    const params = new URLSearchParams({
      template:'data-correction.yml',
      topic:topics[topic],
      record_id:id,
      record_name:name,
      reference_year:Zhou.Time.format(year)
    });
    return 'https://github.com/Chrunge/Zhou-Dynasty-Timeline/issues/new?' + params.toString();
  };
})(globalThis.Zhou ||= {});
