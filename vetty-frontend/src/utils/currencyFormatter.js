export function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    return '';
  }
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount);
}
