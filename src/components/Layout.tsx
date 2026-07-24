import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileDrawer from './MobileDrawer';
import { useAuth } from '../hooks/AuthContext';
import { QrCode } from 'lucide-react';
import QRScannerModal from './QRScannerModal';
import Toast, { ToastType } from './Toast';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  const handleQrScanSuccess = (decodedText: string) => {
    setShowQrModal(false);
    setToast({
      message: `QR Code '${decodedText}' terdeteksi! Mengarahkan ke Absensi Harian...`,
      type: 'success'
    });

    navigate('/absensi-harian', {
      replace: true,
      state: { qrScanned: true, code: decodedText }
    });
  };

  return (
    <div className="min-h-screen flex">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <QRScannerModal
        open={showQrModal}
        onClose={() => setShowQrModal(false)}
        onScanSuccess={handleQrScanSuccess}
        title="Scan QR Presensi Siswa"
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        userName={profile?.full_name || 'Wali Kelas'}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileDrawer onOpen={() => setSidebarOpen(true)} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Wali Kelas Digital</h2>
            </div>

            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-900/10 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Scan QR Siswa</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
