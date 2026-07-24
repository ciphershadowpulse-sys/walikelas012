import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, Upload, QrCode, CheckCircle2 } from 'lucide-react';

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  title?: string;
}

export default function QRScannerModal({
  open,
  onClose,
  onScanSuccess,
  title = 'Scan QR Code Absensi'
}: QRScannerModalProps) {
  const [activeMode, setActiveMode] = useState<'camera' | 'preset'>('camera');
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (open && activeMode === 'camera') {
      // Initialize HTML5 QR Code Scanner
      scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          setScannedResult(decodedText);
          if (scanner) {
            scanner.clear().catch(console.error);
          }
          onScanSuccess(decodedText);
        },
        (error) => {
          // Ignore frequent scan errors
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [open, activeMode]);

  if (!open) return null;

  const handleSelectPreset = (code: string) => {
    setScannedResult(code);
    onScanSuccess(code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary-800 dark:text-primary-400" />
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveMode('camera')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'camera'
                  ? 'bg-primary-800 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
              }`}
            >
              <Camera className="w-4 h-4" />
              Kamera / Upload QR
            </button>
            <button
              onClick={() => setActiveMode('preset')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'preset'
                  ? 'bg-primary-800 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
              }`}
            >
              <QrCode className="w-4 h-4" />
              Pilih Barcode Presensi
            </button>
          </div>
        </div>

        {/* Scanner Content */}
        <div className="p-6">
          {activeMode === 'camera' ? (
            <div>
              <div id="qr-reader-container" className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"></div>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                Arahkan kamera ke Barcode / QR Code atau upload gambar QR Code dari perangkat Anda.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center mb-2">
                Pilih salah satu Barcode QR Code untuk langsung melakukan presensi:
              </p>
              
              {/* Barcode 1 */}
              <button
                onClick={() => handleSelectPreset('QR-ABSENSI-BARCODE-1')}
                className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-600 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-800/60 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700 text-primary-800 dark:text-primary-400 font-bold group-hover:scale-105 transition-transform">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors">
                      Barcode 1: Scan Presensi Siswa
                    </h4>
                    <p className="text-xs text-gray-500">Scan QR Code Kehadiran Harian Kelas</p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
              </button>

              {/* Barcode 2 */}
              <button
                onClick={() => handleSelectPreset('QR-ABSENSI-BARCODE-2')}
                className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-600 dark:hover:border-emerald-500 bg-gray-50 dark:bg-gray-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700 text-emerald-600 font-bold group-hover:scale-105 transition-transform">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 transition-colors">
                      Barcode 2: Scan untuk Absensi
                    </h4>
                    <p className="text-xs text-gray-500">Scan QR Code Absensi Harian Otomatis</p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
              </button>
            </div>
          )}

          {scannedResult && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
              <span>QR Code Terdeteksi: <strong>{scannedResult}</strong></span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
