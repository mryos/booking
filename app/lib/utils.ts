/**
 * Utility functions for WIB (Western Indonesian Time / Asia/Jakarta)
 */

export const TIMEZONE = 'Asia/Jakarta';

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD (WIB)
 */
export function getWIBDate(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Mendapatkan waktu sekarang dalam format HH:mm (WIB)
 */
export function getWIBTime(): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(new Date());
}

/**
 * Mendapatkan objek Date yang sudah disesuaikan dengan WIB untuk keperluan manipulasi bulan/tahun
 */
export function getWIBNow(): Date {
  // Teknik ini mengembalikan Date objek yang merepresentasikan waktu WIB
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0');
  
  return new Date(
    getPart('year'),
    getPart('month') - 1,
    getPart('day'),
    getPart('hour'),
    getPart('minute'),
    getPart('second')
  );
}

/**
 * Memformat string tanggal (YYYY-MM-DD) menjadi format Indonesia yang cantik
 */
export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  // Pastikan menggunakan T00:00:00 agar tidak dianggap UTC dan bergeser hari
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Mendapatkan nama bulan dalam Bahasa Indonesia
 */
export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Mendapatkan label hari dalam Bahasa Indonesia
 */
export const INDONESIAN_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
