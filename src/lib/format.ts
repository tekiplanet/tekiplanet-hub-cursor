export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export interface InvoiceStatusDetails {
  status: string;
  label: string;
  color: string;
  description: string;
  paid_amount: number;
  remaining_amount: number;
  is_overdue: boolean;
  days_overdue: number;
}

export const getStatusBadgeProps = (statusDetails?: InvoiceStatusDetails) => {
  if (!statusDetails) {
    return {
      variant: 'secondary' as const,
      className: ''
    };
  }

  let variant: 'default' | 'secondary' | 'destructive' | 'success' | 'outline' = 'default';
  let className = '';

  switch (statusDetails.color) {
    case 'success':
      variant = 'success';
      break;
    case 'destructive':
      variant = 'destructive';
      break;
    case 'warning':
      variant = 'secondary';
      className = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      break;
    case 'info':
      variant = 'secondary';
      className = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      break;
    case 'muted':
      variant = 'outline';
      break;
  }
  
  return {
    variant,
    className
  };
};

export const getPaymentStatusText = (statusDetails?: InvoiceStatusDetails, currency: string = 'USD') => {
  if (!statusDetails) {
    return '';
  }

  if (statusDetails.status === 'paid') {
    return 'Paid in full';
  }

  if (statusDetails.status === 'partially_paid') {
    return `${formatCurrency(statusDetails.paid_amount, currency)} paid, ${formatCurrency(statusDetails.remaining_amount, currency)} remaining`;
  }

  if (statusDetails.is_overdue) {
    return `Overdue by ${statusDetails.days_overdue} days`;
  }

  return statusDetails.description;
}; 