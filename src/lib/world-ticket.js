const allowedColors = new Set(['mint', 'violet', 'orange', 'blue']);

export function encodeWorldTicket(data) {
  const ticket = {
    k: ['traffic', 'penalty', 'decision'].includes(data.kind) ? data.kind : '',
    n: String(data.name || '').slice(0, 28),
    w: String(data.world || '').slice(0, 48),
    s: String(data.subtitle || '').slice(0, 90),
    d: String(data.story || '').slice(0, 220),
    g: String(data.glyph || '✳').slice(0, 4),
    c: allowedColors.has(data.color) ? data.color : 'blue',
    r: Array.isArray(data.relics) ? data.relics.slice(0, 4).map((item) => String(item).slice(0, 32)) : [],
    p: Array.isArray(data.chart) ? data.chart.slice(0, 12).map((row) => ({ t: String(row.time || '').slice(0, 5), m: Number.isFinite(row.minutes) ? row.minutes : null, e: Boolean(row.excluded) })) : [],
    pt: String(data.peakTime || '').slice(0, 5), av: Number(data.average) || 0,
    pr: data.prediction === 'ALTA' ? 'ALTA' : data.prediction === 'BAJA' ? 'BAJA' : '', cf: Number(data.confidence) || 0,
  };
  const bytes = new TextEncoder().encode(JSON.stringify(ticket));
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeWorldTicket(token) {
  try {
    if (typeof token !== 'string' || token.length > 1800) return null;
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64 + '='.repeat((4 - base64.length % 4) % 4));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof parsed.n !== 'string' || typeof parsed.w !== 'string' || typeof parsed.s !== 'string' || typeof parsed.d !== 'string' || typeof parsed.g !== 'string' || !Array.isArray(parsed.r) || parsed.r.length > 4 || parsed.r.some((item) => typeof item !== 'string')) return null;
    const chart = Array.isArray(parsed.p) ? parsed.p.slice(0, 12).filter((row) => typeof row.t === 'string' && (row.m === null || Number.isFinite(row.m))).map((row) => ({ time: row.t.slice(0, 5), minutes: row.m, excluded: Boolean(row.e) })) : [];
    return {
      kind: ['traffic', 'penalty', 'decision'].includes(parsed.k) ? parsed.k : '',
      name: parsed.n.slice(0, 28), world: parsed.w.slice(0, 48), subtitle: parsed.s.slice(0, 90), story: parsed.d.slice(0, 220), glyph: parsed.g.slice(0, 4),
      color: allowedColors.has(parsed.c) ? parsed.c : 'blue', relics: parsed.r.slice(0, 4).map((item) => item.slice(0, 32)), chart,
      peakTime: typeof parsed.pt === 'string' ? parsed.pt.slice(0, 5) : '', average: Number(parsed.av) || 0,
      prediction: parsed.pr === 'ALTA' || parsed.pr === 'BAJA' ? parsed.pr : '', confidence: Math.min(100, Math.max(0, Number(parsed.cf) || 0)),
    };
  } catch {
    return null;
  }
}
