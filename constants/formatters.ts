/**
 * Formatea un número o string a formato de moneda sin redondear
 * Preserva los decimales exactos que el usuario introdujo
 * Para números calculados, muestra máximo 2 decimales sin redondear hacia arriba/abajo
 */
export function formatCurrency(value: string | number): string {
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      return '0.00';
    }
    // Si es un string válido, asegurarse de que tenga formato correcto
    const numValue = parseFloat(value);
    const str = numValue.toString();
    const decimalIndex = str.indexOf('.');
    
    if (decimalIndex === -1) {
      return str + '.00';
    }
    
    // Truncar a 2 decimales
    const truncated = str.substring(0, decimalIndex + 3);
    const parts = truncated.split('.');
    if (parts[1] && parts[1].length === 1) {
      return truncated + '0';
    }
    return truncated;
  }
  
  if (isNaN(value)) {
    return '0.00';
  }
  
  // Para números (resultados de cálculos), truncamos a 2 decimales sin redondear
  const str = value.toString();
  const decimalIndex = str.indexOf('.');
  
  if (decimalIndex === -1) {
    return str + '.00';
  }
  
  // Truncar a 2 decimales sin redondear
  const truncated = str.substring(0, decimalIndex + 3);
  const parts = truncated.split('.');
  if (parts[1] && parts[1].length === 1) {
    return truncated + '0';
  }
  return truncated;
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
    return '0.00';
  }
  
  const discountAmount = (priceNum * discountNum) / 100;
  const finalPrice = priceNum - discountAmount;
  
  // Convertir a string y truncar a 2 decimales sin redondear
  const str = finalPrice.toString();
  const decimalIndex = str.indexOf('.');
  
  if (decimalIndex === -1) {
    return str + '.00';
  }
  
  const truncated = str.substring(0, decimalIndex + 3);
  const parts = truncated.split('.');
  if (parts[1] && parts[1].length === 1) {
    return truncated + '0';
  }
  return truncated;
}
