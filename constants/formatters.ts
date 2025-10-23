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

/**
 * Formatea una fecha ISO (YYYY-MM-DD) a formato español DD/MM/YYYY
 */
export function formatDateToSpanish(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Convierte fecha formato español DD/MM/YYYY a ISO YYYY-MM-DD
 */
export function parseSpanishDate(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
    return dateStr;
  }
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

/**
 * Obtiene la fecha actual en formato ISO YYYY-MM-DD
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha completa con nombre de mes en español
 */
export function formatDateLongSpanish(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
}

/**
 * Formatea una fecha con mes corto en español
 */
export function formatDateShortSpanish(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const month = months[date.getMonth()];
  return `${day} ${month}`;
}
