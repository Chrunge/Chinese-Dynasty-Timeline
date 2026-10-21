(function (Zhou) {
  'use strict';
  // The resource contains navigation, not shared facts. No DOM/storage/global
  // dataset lookup is needed; callers render these as ordinary native anchors.
  Zhou.createEntityLinks = function ({index, data, search} = {}) {
    const datasetId = data?.datasetId || data?.timeline?.topic || 'zhou';
    const collections = {country:'polities', polity:'polities', polities:'polities', person:'people', people:'people'};
    const blockedPolities = new Set(['later-liang', 'wu-zhou']);
    function links(type, id) {
      const collection = collections[type];
      if (!collection || typeof id !== 'string' || index?.schemaVersion !== 1) return [];
      if (collection === 'polities' && blockedPolities.has(id)) return [];
      const key = (collection === 'polities' ? 'country:' : 'person:') + id;
      const records = collection === 'polities' ? data?.states : data?.people;
      if (!records?.some(record => record.id === id) || !search?.index?.some(entry => entry.key === key)) return [];
      const entity = index.entities?.[collection]?.find(value => value.id === id);
      if (!entity?.links?.some(link => link.datasetId === datasetId)) return [];
      const seen = new Set();
      return entity.links.filter(link => {
        if (!link || typeof link.datasetId !== 'string' || link.datasetId === datasetId || seen.has(link.datasetId) || typeof link.name !== 'string' || typeof link.href !== 'string') return false;
        // Fail closed if an untrusted/obsolete resource contains a remote URL,
        // mismatched identity, or another protocol. Encoded IDs remain opaque.
        const match = link.href.match(/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.html#([^#]*)$/);
        if (!match) return false;
        const params = new URLSearchParams(match[1]);
        if (params.get('dataset') !== link.datasetId || params.get('item') !== key || params.get('target') !== key || !['1','2'].includes(params.get('v'))) return false;
        if (params.get('v') === '2' && params.get('time') !== 'bce-axis') return false;
        seen.add(link.datasetId);return true;
      }).map(({datasetId,name,href}) => ({datasetId,name,href}));
    }
    return Object.freeze({links});
  };
})(globalThis.Zhou ||= {});
