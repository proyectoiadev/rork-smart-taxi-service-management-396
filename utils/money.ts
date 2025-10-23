export const EUR = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "12,3" | "12.30" | " 1.234,56 " -> 1234 (céntimos). null si no parseable */
export function textToCents(input: string): number | null {
  if (input == null) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;
  
  const cleaned = trimmed.replace(/\s|(\u00A0)/g, '').replace(/\.(?=\d{3}(\D|$))/g, '');
  
  const unified = cleaned.replace(',', '.');
  if (!/^-?\d*\.?\d*$/.test(unified)) return null;
  const [ip = '0', dp = ''] = unified.split('.');
  const dec2 = (dp + '00').slice(0, 2);
  const sign = unified.startsWith('-') ? -1 : 1;
  const intPart = Math.abs(parseInt(ip || '0', 10));
  const decPart = Math.abs(parseInt(dec2 || '0', 10));
  return sign * (intPart * 100 + decPart);
}

/** 1234 -> "12,34 €" */
export function centsToCurrency(cents: number): string {
  const euros = (cents || 0) / 100;
  const formatted = euros.toFixed(2).replace('.', ',');
  return `${formatted} €`;
}

/** 1234 -> "12.34" (punto) para guardar en texto compatible con parseFloat */
export function centsToDotString(cents: number): string {
  const abs = Math.abs(cents);
  const sign = cents < 0 ? '-' : '';
  const euros = Math.floor(abs / 100);
  const dec = String(abs % 100).padStart(2, '0');
  return `${sign}${euros}.${dec}`;
}

/** "%": acepta "10", "10,5", "10.5" -> número JS */
export function textPercentToNumber(input: string): number | null {
  if (input == null) return null;
  const t = String(input).trim().replace(',', '.');
  if (!/^-?\d*\.?\d*$/.test(t) || t === '' || t === '.' || t === '-.') return null;
  return Number(t);
}
