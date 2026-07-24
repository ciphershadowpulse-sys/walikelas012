import React from 'react';
import { Menu } from 'lucide-react';

interface MobileDrawerProps {
  onOpen: () => void;
}

export default function MobileDrawer({ onOpen }: MobileDrawerProps) {
  return (
    <button
      onClick={onOpen}
      className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <Menu className="w-6 h-6" />
    </button>
  );
}
