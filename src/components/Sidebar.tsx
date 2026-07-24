import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ClipboardCheck,
  BookOpen,
  Megaphone,
  FileBarChart,
  UserCircle,
  LogOut,
  GraduationCap,
  X,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userName: string;
}

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/data-siswa', label: 'Data Siswa', icon: Users },
  { path: '/absensi-harian', label: 'Absensi Harian', icon: CalendarCheck },
  { path: '/rekap-absensi', label: 'Rekap Absensi', icon: ClipboardCheck },
  { path: '/catatan-siswa', label: 'Catatan Siswa', icon: BookOpen },
  { path: '/pengumuman', label: 'Pengumuman', icon: Megaphone },
  { path: '/laporan', label: 'Laporan', icon: FileBarChart },
  { path: '/profil', label: 'Profil', icon: UserCircle },
];

export default function Sidebar({ isOpen, onClose, onLogout, userName }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-primary-800 dark:text-primary-400" />
              <div>
                <h1 className="text-lg font-bold text-primary-800 dark:text-primary-300">Wali Kelas</h1>
                <p className="text-xs text-gray-500">Digital</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{userName}</p>
            <p className="text-xs text-gray-500">Wali Kelas</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-800 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <ThemeToggle />
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
