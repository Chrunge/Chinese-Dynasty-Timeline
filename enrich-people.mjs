// Compatibility entrypoint. Edit data/atlas.json; never overwrite source records.
console.warn('此旧入口已停用补写逻辑；现在仅从 data/atlas.json 生成数据。');
await import('./sync-data.mjs');
