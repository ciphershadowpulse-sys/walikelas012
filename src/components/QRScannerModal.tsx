import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, QrCode, CheckCircle2, Sparkles } from 'lucide-react';

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
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (open) {
      setScannedResult(null);

      // Auto-initialize camera QR Code scanner immediately on modal open
      scanner = new Html5QrcodeScanner(
        'qr-reader-auto-container',
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
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
        (_error) => {
          // Continuous frame decoding errors ignored silently
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base flex items-center gap-1.5">
                {title}
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Kamera Aktif • Otomatis Membaca QR Code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Camera Scanner Box */}
        <div className="p-6">
          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/30 dark:border-emerald-500/20 bg-black shadow-inner">
            
            {/* HTML5 Scanner Container */}
            <div id="qr-reader-auto-container" className="w-full"></div>

            {/* Viewfinder overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4">
              <div className="flex items-center gap-2 bg-emerald-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-md mt-2">
                <Camera className="w-3.5 h-3.5 animate-pulse text-emerald-200" />
                <span>Kamera Aktif • Arahkan ke QR Code</span>
              </div>
            </div>
          </div>

          {/* Status Result Footer */}
          {scannedResult ? (
            <div className="mt-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">QR Code Berhasil Di-scan Otomatis!</p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px] mt-0.5">{scannedResult}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
              Arahkan kamera ke Barcode 1, Barcode 2, atau QR Code siswa. Sistem akan otomatis mendeteksi dan mencatat presensi seketika.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
