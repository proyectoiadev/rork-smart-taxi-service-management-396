// 1) Formateador perezoso con fallback
let _eurFmt: Intl.NumberFormat | null = null;

function getEURFormatter(): Intl.NumberFormat | null {
  // Evita petar si no existe Intl/NumberFormat
  if (typeof Intl === 'undefined' || typeof Intl.NumberFormat !== 'function') {
    return null;
  }
  if (_eurFmt) return _eurFmt;
  _eurFmt = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return _eurFmt;
}

// 2) Fallback simple sin Intl (no localiza miles, solo "12,34 €")
function formatEURFallback(cents: number): string {
  const neg = cents < 0 ? '-' : '';
  const abs = cents < 0 ? -cents : cents;
  const euros = (abs / 100) | 0;
  const dec = String(abs - euros * 100).padStart(2, '0');
  return `${neg}${euros},${dec} €`;
}

export function centsToCurrency(cents: number): string {
  const fmt = getEURFormatter();
  return fmt ? fmt.format((cents || 0) / 100) : formatEURFallback(cents || 0);
}

/** "12,3" | "12.30" | " 1.234,56 " -> 1234 (céntimos). null si no parseable */
export function textToCents(input: string | null | undefined): number | null {
  if (input == null || input === undefined) return null;
  const t = String(input).trim();
  if (!t || t === 'null' || t === 'undefined') return null;

  const cleaned = t
    .replace(/\s|\u00A0/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '');
  const unified = cleaned.replace(',', '.');
  if (!/^-?\d*\.?\d*$/.test(unified)) return null;

  const neg = unified[0] === '-' ? -1 : 1;
  const [ip = '0', dpRaw = ''] = (neg === -1 ? unified.slice(1) : unified).split('.');
  const dp = (dpRaw + '00').slice(0, 2);

  const euros = ip === '' ? 0 : ip.split('').reduce((n, ch) => n * 10 + (ch.charCodeAt(0) - 48), 0);
  const cents = dp.split('').reduce((n, ch) => n * 10 + (ch.charCodeAt(0) - 48), 0);
  return neg * (euros * 100 + cents);
}

/** 1234 -> "12.34" (punto) para guardar como texto estable */
export function centsToDotString(cents: number): string {
  const neg = cents < 0 ? '-' : '';
  const abs = cents < 0 ? -cents : cents;
  const euros = (abs / 100) | 0;
  const dec = String(abs - euros * 100).padStart(2, '0');
  return `${neg}${euros}.${dec}`;
}

/** "%": "10", "10,5", "10.50" -> basis points (bps) entero */
export function percentTextToBps(input: string | null | undefined): number | null {
  if (input == null || input === undefined) return null;
  const u = String(input).trim().replace(',', '.');
  if (!/^-?\d*\.?\d*$/.test(u) || u === '' || u === '.' || u === '-.' || u === '-' || u === 'null' || u === 'undefined') return null;

  const neg = u[0] === '-' ? -1 : 1;
  const [ip = '0', dpRaw = ''] = (neg === -1 ? u.slice(1) : u).split('.');
  const dp = (dpRaw + '00').slice(0, 2);

  const intPart = ip.split('').reduce((n, ch) => n * 10 + (ch.charCodeAt(0) - 48), 0);
  const decPart = dp.split('').reduce((n, ch) => n * 10 + (ch.charCodeAt(0) - 48), 0);
  return neg * (intPart * 100 + decPart);
}

/**
 * Descuento en céntimos = HALF-UP de (cents * bps / 10000)
 * Sin Math.*, usa BigInt si existe; si no, fallback con enteros de 32 bits (suficiente para importes normales).
 */
export function discountCentsHalfUp(cents: number, percentText: string | null | undefined): number {
  if (cents == null || isNaN(cents)) return 0;
  const bps = percentTextToBps(percentText) ?? 0;

  // Camino preferente con BigInt (si está disponible)
  if (typeof BigInt === 'function') {
    const numer = BigInt(cents | 0) * BigInt(bps);
    const adj = numer >= 0n ? 5000n : -5000n;
    return Number((numer + adj) / 10000n);
  }

  // Fallback sin BigInt: usa truncado por bitwise para magnitudes normales
  const numer = cents * bps;
  const adj = numer >= 0 ? 5000 : -5000;
  return ((numer + adj) / 10000) | 0;
}
