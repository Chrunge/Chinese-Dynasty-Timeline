// Authoring dates have no year zero; runtime coordinates preserve historical BCE IDs.
export function toAxis(date) {
  if (!date || typeof date !== 'object' || !['BCE', 'CE'].includes(date.era) || !Number.isSafeInteger(date.year) || date.year <= 0 || Object.keys(date).some(key => !['era', 'year'].includes(key))) {
    throw new Error('年份须为 {era: BCE|CE, year: 正整数}（无公元零年）');
  }
  return date.era === 'BCE' ? date.year : 1 - date.year;
}

export function fromAxis(axis) {
  if (!Number.isSafeInteger(axis) || (axis <= 0 && !Number.isSafeInteger(1-axis))) throw new Error('运行时年份须为可逆转换的安全整数');
  return axis > 0 ? {era:'BCE', year:axis} : {era:'CE', year:1-axis};
}
