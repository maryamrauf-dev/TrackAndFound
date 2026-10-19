import Item from '../models/Item.js';

const DAY = 86400000;

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

function haversineKm(a, b) {
  if (!a || !b || !Number.isFinite(a.lat) || !Number.isFinite(b.lat)) return 0;
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const tokens = (s) => new Set(String(s || '').toLowerCase().match(/[a-z0-9]{3,}/g) || []);
const textOf = (i) =>
  [i.title, i.category, i.description, i.aiTags?.color, i.aiTags?.brand, ...(i.aiTags?.features || [])].join(' ');

function textSimilarity(a, b) {
  if (a.embedding?.length && b.embedding?.length) {
    // Related short texts usually land between 0.25 and 0.75 cosine.
    return Math.max(0, Math.min(1, (cosine(a.embedding, b.embedding) - 0.25) / 0.5));
  }
  const ta = tokens(textOf(a));
  const tb = tokens(textOf(b));
  let shared = 0;
  ta.forEach((t) => tb.has(t) && shared++);
  const union = ta.size + tb.size - shared || 1;
  return Math.min(1, (shared / union) * 3);
}

// 0-100: meaning 55%, category 20%, distance 15%, timing 10%.
export function scorePair(a, b) {
  const sem = textSimilarity(a, b);
  const cat = a.category === b.category ? 1 : 0;
  const km = haversineKm(a.location, b.location);
  const dist = Math.max(0, 1 - km / 3);
  const days = Math.abs(new Date(a.eventDate) - new Date(b.eventDate)) / DAY;
  const time = Math.max(0, 1 - days / 30);
  return Math.round((sem * 0.55 + cat * 0.2 + dist * 0.15 + time * 0.1) * 100);
}

export async function findMatches(source, { limit = 5, min = 35 } = {}) {
  const opposite = source.type === 'lost' ? 'found' : 'lost';
  const pool = await Item.find({ type: opposite, status: 'open', _id: { $ne: source._id } })
    .select('+embedding')
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();

  return pool
    .filter((c) => {
      // An item cannot be found before it was lost (one day of slack for date entry).
      const lost = source.type === 'lost' ? source : c;
      const found = source.type === 'found' ? source : c;
      return new Date(found.eventDate) >= new Date(lost.eventDate) - DAY;
    })
    .map((c) => ({ item: c, score: scorePair(source, c) }))
    .filter((m) => m.score >= min)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map(({ item, score }) => {
      delete item.embedding;
      return { score, item };
    });
}
