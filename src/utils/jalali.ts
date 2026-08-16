/**
 * Jalali Date and Persian Digit formatting utilities for BiSaf
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  return String(num).replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

export function formatTimePersian(dateString?: string | Date): string {
  if (!dateString) return '—';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '—';

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return toPersianDigits(`${hours}:${minutes}`);
}

export function formatLongJalaliDate(dateString?: string | Date): string {
  if (!dateString) return '—';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '—';

  try {
    const weekday = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long' }).format(date);
    const day = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric' }).format(date);
    const month = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long' }).format(date);
    const year = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' }).format(date);
    return `${weekday} ${day} ${month} ماه ${year}`;
  } catch {
    return toPersianDigits(date.toLocaleDateString('fa-IR'));
  }
}

export function formatShortJalaliDate(dateString?: string | Date): string {
  if (!dateString) return '—';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '—';

  try {
    const day = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric' }).format(date);
    const month = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'short' }).format(date);
    return `${day} ${month}`;
  } catch {
    return toPersianDigits(date.toLocaleDateString('fa-IR'));
  }
}

export function formatJalaliDate(dateString?: string | Date): string {
  if (!dateString) return '—';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '—';

  try {
    const formatted = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
    return formatted;
  } catch {
    return toPersianDigits(date.toLocaleDateString());
  }
}

export function formatRelativeTimePersian(dateString?: string | Date): string {
  if (!dateString) return '—';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '—';

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'هم‌اکنون';
  if (diffSec < 3600) return toPersianDigits(`${Math.floor(diffSec / 60)} دقیقه پیش`);
  if (diffSec < 86400) return toPersianDigits(`${Math.floor(diffSec / 3600)} ساعت پیش`);
  return formatJalaliDate(date);
}
