/**
 * Flatten a nested messages object into dot-separated key paths.
 * @param {unknown} obj
 * @param {string} [prefix]
 * @returns {string[]}
 */
export function flattenKeys(obj, prefix = "") {
  if (obj === null || typeof obj !== "object") return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => flattenKeys(v, prefix ? `${prefix}.${k}` : k));
}

/**
 * Compare key sets of several message catalogs.
 * @param {Record<string, unknown>} catalogs locale -> parsed JSON
 * @returns {string[]} human readable problems; empty when all key sets match
 */
export function compareMessages(catalogs) {
  const sets = Object.entries(catalogs).map(([locale, data]) => [locale, new Set(flattenKeys(data))]);
  const all = new Set(sets.flatMap(([, s]) => [...s]));
  const problems = [];
  for (const [locale, set] of sets) {
    for (const key of [...all].sort()) {
      if (!set.has(key)) problems.push(`${locale}: missing key "${key}"`);
    }
  }
  return problems;
}
