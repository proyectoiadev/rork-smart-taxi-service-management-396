export const EUR = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function textToCents(input: string): number | null {
  if (input == null) return null;
  const t = String(input).trim();
  if (!t) return null;

  const cleaned = t.replace(/\s|\u00A0/g, '').replace(/\.(?=\d{3}(\D|$))/g, '');
  const unified = cleaned.replace(',', '.');
  if (!/^-?\d*\.?\d*$/.test(unified)) return null;

  const neg = unified[0] === '-' ? -1 : 1;
  const [ip = '0', dpRaw = ''] = (neg === -1 ? unified.slice(1) : unified).split('.');
  const dp = (dpRaw + '00').slice(0, 2);

  const euros = ip === '' ? 0 : ip.split('').reduce((n, ch) => n * 10 + (ch.charCodeAt(0) - 48), 0);
  const cents = dp.split('').reduce((n, ch) => n * 10 + (ch.charCodeAt(0) - 48), 0);
  return neg * (euros * 100 + cents);
}

export function centsToCurrency(cents: number): string {
  return EUR.format((cents || 0) / 100);
}

export function centsToDotString(cents: number): string {
  const neg = cents < 0 ? '-' : '';
  const abs = cents < 0 ? -cents : cents;
  const euros = (abs / 100) | 0;
  const dec = String(abs - euros * 100).padStart(2, '0');
  return `${neg}${euros}.${dec}`;
}

export function percentTextToBps(input: string): number | null {
  if (input == null) return null;
  const u = String(input).trim().replace(',', '.');
  if (!/^-?\d*\.?\d*$/.test(u) || u === '' || u === '.' || u === '-.' || u === '-') return null;

  const neg = u[0] === '-' ? -1 : 1;
  const [ip = '0', dpRaw = ''] = (neg === -1 ? u.slice(1) : u).split('.');
  const dp = (dpRaw + '00').slice(0, 2);

  const intPart = ip.split('').reduce((n, ch) => n * 10 + (ch.charCodeAt(0) - 48), 0);
  const decPart = dp.split('').reduce((n, ch) => n * 10 + (ch.charCodeAt(0) - 48), 0);
  return neg * (intPart * 100 + decPart);
}

export function discountCentsHalfUp(cents: number, percentText: string): number {
  const bps = percentTextToBps(percentText) ?? 0;
  const numer = BigInt(cents) * BigInt(bps);
  const adj = numer >= 0n ? 5000n : -5000n;
  const q = (numer + adj) / 10000n;
  return Number(q);
}
