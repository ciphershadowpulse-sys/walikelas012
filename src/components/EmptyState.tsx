import React from 'react';
import { FileX2 } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = 'Tidak ada data',
  message = 'Belum ada data yang tersedia.',
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon || <FileX2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />}
      <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500">{message}</p>
    </div>
  );
}
