export const formatPrice = (amount: number, currency: string = '₦') => {
  return `${currency}${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}; 