import catalog from './bekal-id.json';
/** Display-only labels: never changes stored enum values or project identifiers. */
export const bekalUiLabel = (value: any): any => {
  if (typeof value !== 'string') return value;
  const labels = catalog as Record<string, string>;
  const key = value.replace(/\s+/g, ' ').trim();
  const translated = labels[key] || labels[key.toLowerCase()];
  return typeof translated === 'string' ? translated : value;
};
