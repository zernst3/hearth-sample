import { CURRENCY } from '../lib/config';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY.toUpperCase() });

export function formatMoney(cents: number) {
  return money.format(cents / 100);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}
