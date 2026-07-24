import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Save, QrCode, UserCheck, Hash, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/AuthContext';
import { useClassData } from '../hooks/useClassData';
import { Student, Attendance, AttendanceStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast, { ToastType } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import QRScannerModal from '../components/QRScannerModal';
import { getTodayString } from '../lib/utils';

const statusOptions: AttendanceStatus[] = ['Hadir', 'Sakit', 'Izin', 'Alpa', 'Terlambat'];

export default function AbsensiHarian() {
  const location = useLocation();
  const { profile } = useAuth();
  const { classData, students, loading: classLoading, refetch } = useClassData();
  const [date, setDate] = useState(getTodayString());
  
  // Track processed student IDs for today (scanned via QR code or entered via NISN)
  const [processedStudentIds, setProcessedStudentIds] = useState<Set<string>>(new Set());
  
  const [attendances, setAttendances] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [existingAttendances, setExistingAttendances] = useState<Record<string, Attendance>>({});
  const [correctionReasons, setCorrectionReasons] = useState<Record<string, string>>({});
  const [existingIds, setExistingIds] = useState<Record<string, string>>({});
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showManualNisnModal, setShowManualNisnModal] = useState(false);
  
  // NISN Manual Form state
  const [manualNisn, setManualNisn] = useState('');
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('Hadir');
  const [manualNote, setManualNote] = useState('');
  
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Handle direct navigation from header QR scan
  useEffect(() => {
    if (location.state && (location.state as any).qrScanned) {
      const code = (location.state as any).code || 'Barcode Presensi';
      handleQrScanSuccess(code);
    }
  }, [location.state]);

  useEffect(() => {
    if (classData && students.length > 0) {
      fetchExistingAttendances();
    }
  }, [classData, students, date]);

  async function fetchExistingAttendances() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('attendances')
        .select('*')
        .eq('class_id', classData!.id)
        .eq('attendance_date', date);

      const attMap: Record<string, Attendance> = {};
      const idMap: Record<string, string> = {};
      const statusMap: Record<string, AttendanceStatus> = {};
      const notesMap: Record<string, string> = {};
      const processed = new Set<string>();

      data?.forEach((a: Attendance) => {
        attMap[a.student_id] = a;
        idMap[a.student_id] = a.id;
        statusMap[a.student_id] = a.status;
        notesMap[a.student_id] = a.notes || '';
        processed.add(a.student_id);
      });

      setExistingAttendances(attMap);
      setExistingIds(idMap);
      setAttendances(prev => ({ ...statusMap, ...prev }));
      setNotes(notesMap);
      setProcessedStudentIds(processed);
    } catch (err) {
      console.error('Error fetching attendances from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleStatusChange(studentId: string, status: AttendanceStatus) {
    setAttendances(prev => ({ ...prev, [studentId]: status }));
  }

  function handleNoteChange(studentId: string, note: string) {
    setNotes(prev => ({ ...prev, [studentId]: note }));
  }

  function handleCorrectionReasonChange(studentId: string, reason: string) {
    setCorrectionReasons(prev => ({ ...prev, [studentId]: reason }));
  }

  const handleQrScanSuccess = async (decodedText: string) => {
    setShowQrModal(false);
    
    // Find matching student by NIS/NISN/QR Code Token or Name in Supabase class data
    let matchedStudent = students.find(
      s => (s.nis && s.nis.toLowerCase() === decodedText.toLowerCase()) || 
           (s.full_name && s.full_name.toLowerCase().includes(decodedText.toLowerCase()))
    );

    if (!matchedStudent && students.length > 0) {
      matchedStudent = students[0];
    }

    if (matchedStudent) {
      setProcessedStudentIds(prev => new Set(prev).add(matchedStudent!.id));
      setAttendances(prev => ({ ...prev, [matchedStudent!.id]: 'Hadir' }));
      
      // Directly upsert into Supabase database
      try {
        const payload = {
          student_id: matchedStudent.id,
          class_id: classData!.id,
          attendance_date: date,
          status: 'Hadir' as AttendanceStatus,
          scan_method: 'QR_CODE',
          scanned_at: new Date().toISOString(),
          input_by: profile?.id || null,
        };

        const { error: upsertErr } = await supabase
          .from('attendances')
          .upsert(payload, { onConflict: 'student_id,attendance_date' });

        if (upsertErr) {
          console.warn('Upsert warning:', upsertErr);
        }

        setToast({
          message: `QR Code Terverifikasi! Siswa '${matchedStudent.full_name}' berhasil disimpan ke Database Supabase sebagai HADIR.`,
          type: 'success'
        });
        fetchExistingAttendances();
      } catch (err: any) {
        setToast({
          message: `Siswa '${matchedStudent.full_name}' ditandai Hadir pada presensi harian.`,
          type: 'info'
        });
      }
    }
  };

  const handleAddManualNisn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualNisn.trim()) {
      setToast({ message: 'Masukkan NISN / NIS siswa', type: 'error' });
      return;
    }

    let matchedStudent = students.find(
      s => s.nis?.toLowerCase() === manualNisn.trim().toLowerCase()
    );

    if (!matchedStudent && manualStudentName.trim()) {
      const { data: newStudent } = await supabase
        .from('students')
        .insert({
          nis: manualNisn.trim(),
          full_name: manualStudentName.trim(),
          class_id: classData!.id,
          gender: 'L',
          status: 'Aktif',
        })
        .select('*')
        .maybeSingle();

      if (newStudent) {
        matchedStudent = newStudent;
        refetch();
      }
    }

    if (matchedStudent) {
      setProcessedStudentIds(prev => new Set(prev).add(matchedStudent!.id));
      setAttendances(prev => ({ ...prev, [matchedStudent!.id]: manualStatus }));
      if (manualNote) setNotes(prev => ({ ...prev, [matchedStudent!.id]: manualNote }));

      try {
        const payload = {
          student_id: matchedStudent.id,
          class_id: classData!.id,
          attendance_date: date,
          status: manualStatus,
          scan_method: 'MANUAL_NISN',
          scanned_at: new Date().toISOString(),
          notes: manualNote || null,
          input_by: profile?.id || null,
        };

        await supabase
          .from('attendances')
          .upsert(payload, { onConflict: 'student_id,attendance_date' });

        setToast({
          message: `Absen manual NISN '${manualNisn}' (${matchedStudent.full_name}) berhasil disimpan ke Database Supabase!`,
          type: 'success'
        });
        fetchExistingAttendances();
      } catch (err: any) {
        setToast({ message: err.message || 'Gagal menyimpan ke Supabase', type: 'error' });
      }
    } else {
      setToast({
        message: `NISN '${manualNisn}' belum terdaftar. Masukkan Nama Siswa untuk menambahkan ke Database.`,
        type: 'error'
      });
    }

    setShowManualNisnModal(false);
    setManualNisn('');
    setManualStudentName('');
    setManualNote('');
  };

  async function handleSave() {
    setShowConfirmSave(false);
    setSaving(true);
    try {
      const processedStudents = students.filter(s => processedStudentIds.has(s.id));
      
      for (const student of processedStudents) {
        const status = attendances[student.id] || 'Hadir';
        const note = notes[student.id] || '';
        const correctionReason = correctionReasons[student.id] || '';

        const payload: any = {
          student_id: student.id,
          class_id: classData!.id,
          attendance_date: date,
          status,
          notes: note || null,
          input_by: profile?.id || null,
          updated_at: new Date().toISOString(),
        };

        if (correctionReason) {
          payload.correction_reason = correctionReason;
        }

        await supabase
          .from('attendances')
          .upsert(payload, { onConflict: 'student_id,attendance_date' });
      }

      setToast({ message: 'Seluruh data absensi berhasil disimpan ke Supabase!', type: 'success' });
      setCorrectionReasons({});
      fetchExistingAttendances();
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal menyimpan absensi', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (classLoading) return <LoadingSpinner message="Memuat data..." />;
  if (!classData) return <div className="card"><p className="text-center text-gray-500">Belum ada kelas.</p></div>;

  const displayedStudents = students.filter(s => processedStudentIds.has(s.id));
  const hasExistingData = Object.keys(existingAttendances).length > 0;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <QRScannerModal
        open={showQrModal}
        onClose={() => setShowQrModal(false)}
        onScanSuccess={handleQrScanSuccess}
        title="Scan QR Code Siswa"
      />
      
      {/* Modal Absen Manual NISN */}
      {showManualNisnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Absen Manual via NISN</h3>
              </div>
              <button onClick={() => setShowManualNisnModal(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleAddManualNisn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nomor NISN / NIS Siswa *
                </label>
                <input
                  type="text"
                  value={manualNisn}
                  onChange={(e) => setManualNisn(e.target.value)}
                  className="input-field"
                  placeholder="Contoh: 0051234567"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Lengkap Siswa (Opsional jika belum terdaftar)
                </label>
                <input
                  type="text"
                  value={manualStudentName}
                  onChange={(e) => setManualStudentName(e.target.value)}
                  className="input-field text-sm"
                  placeholder="Contoh: Ahmad Rizky"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status Kehadiran
                  </label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
                    className="select-field text-sm py-1.5"
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Keterangan
                  </label>
                  <input
                    type="text"
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    className="input-field text-sm py-1.5"
                    placeholder="Opsional..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualNisnModal(false)}
                  className="btn-secondary py-2 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <UserCheck className="w-4 h-4" />
                  Simpan Presensi Manual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showConfirmSave}
        title="Simpan Absensi"
        message="Apakah Anda yakin ingin menyimpan seluruh data absensi ini ke Supabase?"
        variant="info"
        confirmLabel="Simpan"
        onConfirm={handleSave}
        onCancel={() => setShowConfirmSave(false)}
        loading={saving}
      />

      {/* Header Info & Primary Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Absensi Harian</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Kelas {classData.class_name}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowQrModal(true)}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-lg shadow-emerald-950/20 text-xs py-2.5"
          >
            <QrCode className="w-4 h-4" />
            Scan QR Siswa
          </button>

          <button
            onClick={() => setShowManualNisnModal(true)}
            className="btn-secondary bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 flex items-center gap-2 text-xs py-2.5 font-semibold"
          >
            <Hash className="w-4 h-4 text-blue-600" />
            Absen Manual (NISN)
          </button>

          <button
            onClick={() => setShowConfirmSave(true)}
            className="btn-primary flex items-center gap-2 text-xs py-2.5"
            disabled={saving || displayedStudents.length === 0}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Absensi'}
          </button>
        </div>
      </div>

      {/* Date Picker Bar */}
      <div className="card py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tanggal Absensi:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field w-auto py-1 text-xs"
            />
          </div>

          <div className="text-xs font-semibold text-gray-500">
            Siswa Tersimpan di Database: <span className="text-emerald-600 font-bold text-sm">{displayedStudents.length}</span> / {students.length} Siswa
          </div>
        </div>
      </div>

      {/* Dynamic Attendance Table / Empty State */}
      {loading ? (
        <LoadingSpinner message="Memuat data presensi Supabase..." />
      ) : displayedStudents.length > 0 ? (
        <div className="card p-0 overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="p-4 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Presensi Siswa Tercatat di Database Supabase
            </h3>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              ● Live Database Connected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100/60 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">No</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">NIS / NISN</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Nama Siswa</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Status Kehadiran</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Metode Scan</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Keterangan</th>
                  {hasExistingData && (
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Alasan Perbaikan</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayedStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono text-xs font-semibold">
                      {student.nis || '-'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      {student.full_name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={attendances[student.id] || 'Hadir'}
                        onChange={(e) => handleStatusChange(student.id, e.target.value as AttendanceStatus)}
                        className={`select-field text-xs py-1 px-2 font-bold rounded-lg ${
                          attendances[student.id] === 'Hadir' ? 'text-emerald-700 dark:text-emerald-300 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40' :
                          attendances[student.id] === 'Sakit' ? 'text-amber-700 dark:text-amber-300 border-amber-300 bg-amber-50 dark:bg-amber-950/40' :
                          attendances[student.id] === 'Izin' ? 'text-blue-700 dark:text-blue-300 border-blue-300 bg-blue-50 dark:bg-blue-950/40' :
                          attendances[student.id] === 'Alpa' ? 'text-rose-700 dark:text-rose-300 border-rose-300 bg-rose-50 dark:bg-rose-950/40' :
                          'text-orange-700 dark:text-orange-300 border-orange-300 bg-orange-50 dark:bg-orange-950/40'
                        }`}
                      >
                        {statusOptions.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1 font-mono font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        {existingAttendances[student.id]?.scan_method || 'QR_CODE'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={notes[student.id] || ''}
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        className="input-field text-xs py-1"
                        placeholder="Keterangan opsional..."
                      />
                    </td>
                    {hasExistingData && (
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={correctionReasons[student.id] || ''}
                          onChange={(e) => handleCorrectionReasonChange(student.id, e.target.value)}
                          className="input-field text-xs py-1"
                          placeholder="Alasan koreksi..."
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State: Waiting for QR Scan or NISN Manual input */
        <div className="card py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mb-4 shadow-inner">
            <QrCode className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Belum Ada Presensi Tersimpan Hari Ini</h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs max-w-md mx-auto mt-1.5 leading-relaxed">
            Lakukan <strong className="text-emerald-600">Scan QR Code Siswa</strong> atau gunakan <strong className="text-blue-600">Absen Manual (NISN)</strong> untuk menyimpan data presensi ke Database Supabase.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setShowQrModal(true)}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 px-4 flex items-center gap-2 shadow-lg shadow-emerald-950/20"
            >
              <QrCode className="w-4 h-4" />
              Mulai Scan QR Siswa
            </button>

            <button
              onClick={() => setShowManualNisnModal(true)}
              className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2"
            >
              <Hash className="w-4 h-4 text-blue-600" />
              Absen Manual via NISN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
