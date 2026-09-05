const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '\u20B9',
  USD: '$',
  EUR: '\u20AC',
  GBP: '\u00A3',
};

export function formatCurrency(amount: number, currency = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + ' ';
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${symbol}${formatted}`;
}
