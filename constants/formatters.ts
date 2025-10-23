/**
 * Formatea un número o string a formato de moneda sin redondear
 * Preserva los decimales exactos que el usuario introdujo
 */
export function formatCurrency(value: string | number): string {
  if (typeof value === 'number') {
    return value.toString();
  }
  
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    return '0';
  }
  
  return value;
}

/**
 * Calcula el descuento sin redondear
 */
export function calculateDiscount(price: string | number, discountPercent: string | number): number {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price;
  const discountNum = typeof discountPercent === 'string' ? parseFloat(discountPercent) : discountPercent;
  
  if (isNaN(priceNum) || isNaN(discountNum)) {
    return 0;
  }
  
  return (priceNum * discountNum) / 100;
}

/**
 * Calcula el precio final sin redondear
 */
export function calculateFinalPrice(price: string | number, discountPercent: string | number): number {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price;
  const discountAmount = calculateDiscount(price, discountPercent);
  
  if (isNaN(priceNum)) {
    return 0;
  }
  
  return priceNum - discountAmount;
}
