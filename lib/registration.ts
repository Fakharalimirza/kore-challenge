export const textl = (v: any, max = 160) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

export const normEmail = (v: any): string => {
  const e = typeof v === 'string' ? v.trim().toLowerCase().slice(0, 160) : '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : '';
};

export const normPhone = (v: any): string => {
  const p =
    typeof v === 'string' ? v.replace(/[\s\-().]/g, '').slice(0, 32) : '';
  return /^\+?[0-9]{7,15}$/.test(p) ? p : '';
};

export const parseAge = (v: any): number | null => {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').trim());
  return Number.isInteger(n) && n >= 3 && n <= 100 ? n : null;
};

export function dupEntry(entries: any[], email: string, phone: string) {
  return entries.find(
    (e: any) =>
      e.type === 'individual' &&
      ((e.email || '').toLowerCase() === email ||
        (e.phone || '') === phone),
  );
}
