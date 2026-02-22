import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value);
}

export function formatDecimal(value: number, decimals = 2): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `%${formatDecimal(value, 1)}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd.MM.yyyy', { locale: tr });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd.MM.yyyy HH:mm', { locale: tr });
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: tr });
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return `${formatDecimal(kg / 1000, 1)} ton`;
  }
  if (kg < 1) {
    return `${formatNumber(Math.round(kg * 1000))} g`;
  }
  return `${formatDecimal(kg, 1)} kg`;
}

export function formatQuantityWithUnit(quantity: number, unit: string): string {
  return `${formatNumber(quantity)} ${unit}`;
}
