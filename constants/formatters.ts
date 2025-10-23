/**
 * Formatea un número o string a formato de moneda sin redondear
 * Preserva los decimales exactos que el usuario introdujo
 * Para números calculados, muestra máximo 2 decimales sin redondear hacia arriba/abajo
 */
export function formatCurrency(value: string | number): string {
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      return '0';
    }
    return value;
  }
  
  if (isNaN(value)) {
    return '0';
  }
  
  // Para números (resultados de cálculos), truncamos a 2 decimales sin redondear
  const str = value.toString();
  const decimalIndex = str.indexOf('.');
  
  if (decimalIndex === -1) {
    return str;
  }
  
  // Truncar a 2 decimales sin redondear
  return str.substring(0, decimalIndex + 3);
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
 * Retorna un string para evitar problemas de precisión de punto flotante
 */
export function calculateFinalPrice(price: string | number, discountPercent: string | number): string {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price;
  const discountNum = typeof discountPercent === 'string' ? parseFloat(discountPercent) : discountPercent;
  
  if (isNaN(priceNum) || isNaN(discountNum)) {
    return '0';
  }
  
  const discountAmount = (priceNum * discountNum) / 100;
  const finalPrice = priceNum - discountAmount;
  
  // Convertir a string y truncar a 2 decimales sin redondear
  const str = finalPrice.toString();
  const decimalIndex = str.indexOf('.');
  
  if (decimalIndex === -1) {
    return str;
  }
  
  return str.substring(0, decimalIndex + 3);
}
