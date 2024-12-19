export const formatPrice = (price: number | string, currency: string = '₦'): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  return `${currency}${numericPrice.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}; 