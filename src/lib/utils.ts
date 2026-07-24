import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekDays(): string[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export function getMonthDays(year: number, month: number): string[] {
  const days: string[] = [];
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= lastDay; i++) {
    const d = new Date(year, month, i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export function getIndonesianDayName(date: string): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const d = new Date(date);
  return days[d.getDay()];
}

export const genderLabels: Record<string, string> = {
  L: 'Laki-laki',
  P: 'Perempuan',
};

export const attendanceColors: Record<string, string> = {
  Hadir: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Sakit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Izin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Alpa: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Terlambat: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export const leaveStatusColors: Record<string, string> = {
  Menunggu: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Disetujui: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Ditolak: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Perlu Perbaikan': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

export const noteCategoryColors: Record<string, string> = {
  Akademik: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Sikap: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Kedisiplinan: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Kehadiran: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Sosial: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Prestasi: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  Pendampingan: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
};

export const completionStatusColors: Record<string, string> = {
  Belum: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  'Sedang Ditindaklanjuti': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Selesai: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};
