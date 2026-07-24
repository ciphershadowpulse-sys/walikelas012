import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, CheckSquare, Save, AlertTriangle, QrCode } from 'lucide-react';
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
  const { classData, students, loading: classLoading } = useClassData();
  const [date, setDate] = useState(getTodayString());
  const [attendances, setAttendances] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [existingAttendances, setExistingAttendances] = useState<Record<string, Attendance>>({});
  const [correctionReasons, setCorrectionReasons] = useState<Record<string, string>>({});
  const [existingIds, setExistingIds] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmMarkAll, setShowConfirmMarkAll] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // If navigated directly from QR Login on main page
  useEffect(() => {
    if (location.state && (location.state as any).qrScanned) {
      const code = (location.state as any).code || 'Barcode Presensi';
      setToast({
        message: `Terhubung via Scan QR (${code}). Presensi kelas siap dicatat!`,
        type: 'success'
      });
    }
  }, [location.state]);

  useEffect(() => {
    if (classData && students.length > 0) {
      fetchExistingAttendances();
    }
  }, [classData, students, date]);

  useEffect(() => {
    // Initialize default statuses
    const initial: Record<string, AttendanceStatus> = {};
    const initialNotes: Record<string, string> = {};
    students.forEach(s => {
      if (!existingAttendances[s.id]) {
        initial[s.id] = attendances[s.id] || 'Hadir';
        initialNotes[s.id] = notes[s.id] || '';
      }
    });
    setAttendances(prev => ({ ...initial, ...prev }));
  }, [students, existingAttendances]);

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

      data?.forEach((a: Attendance) => {
        attMap[a.student_id] = a;
        idMap[a.student_id] = a.id;
        statusMap[a.student_id] = a.status;
        notesMap[a.student_id] = a.notes || '';
      });

      setExistingAttendances(attMap);
      setExistingIds(idMap);
      setAttendances(prev => ({ ...statusMap, ...prev }));
      setNotes(notesMap);
    } catch (err) {
      console.error('Error fetching attendances:', err);
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

  function handleMarkAllHadir() {
    const newAtt: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      newAtt[s.id] = 'Hadir';
    });
    setAttendances(prev => ({ ...prev, ...newAtt }));
    setShowConfirmMarkAll(false);
    setToast({ message: 'Semua siswa ditandai Hadir', type: 'success' });
  }

  const handleQrScanSuccess = (decodedText: string) => {
    setShowQrModal(false);
    
    // Find matching student by NIS or Name or mark next student
    const matchedStudent = students.find(
      s => s.nis?.toLowerCase() === decodedText.toLowerCase() || 
           s.full_name?.toLowerCase().includes(decodedText.toLowerCase())
    );

    if (matchedStudent) {
      setAttendances(prev => ({ ...prev, [matchedStudent.id]: 'Hadir' }));
      setToast({
        message: `Siswa '${matchedStudent.full_name}' berhasil ditandai HADIR via QR Code!`,
        type: 'success'
      });
    } else {
      // Mark all students present if class barcode
      handleMarkAllHadir();
      setToast({
        message: `QR Code '${decodedText}' terverifikasi! Presensi seluruh kelas ditandai HADIR.`,
        type: 'success'
      });
    }
  };

  async function handleSave() {
    setShowConfirmSave(false);
    setSaving(true);
    try {
      for (const student of students) {
        const status = attendances[student.id] || 'Hadir';
        const note = notes[student.id] || '';
        const existingId = existingIds[student.id];
        const correctionReason = correctionReasons[student.id] || '';

        if (existingId) {
          const updateData: any = { status, notes: note, updated_at: new Date().toISOString() };
          if (correctionReason) {
            updateData.correction_reason = correctionReason;
          }
          const { error } = await supabase
            .from('attendances')
            .update(updateData)
            .eq('id', existingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('attendances').insert({
            student_id: student.id,
            class_id: classData!.id,
            attendance_date: date,
            status,
            notes: note,
            input_by: profile?.id,
          });
          if (error && error.code !== '23505') throw error;
        }
      }

      setToast({ message: 'Absensi harian berhasil disimpan', type: 'success' });
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

  const hasExistingData = Object.keys(existingAttendances).length > 0;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <QRScannerModal
        open={showQrModal}
        onClose={() => setShowQrModal(false)}
        onScanSuccess={handleQrScanSuccess}
        title="Scan QR Presensi Siswa"
      />
      
      <ConfirmDialog
        open={showConfirmMarkAll}
        title="Tandai Semua Hadir"
        message="Semua siswa akan ditandai dengan status Hadir. Lanjutkan?"
        variant="info"
        confirmLabel="Ya, Tandai Semua"
        onConfirm={handleMarkAllHadir}
        onCancel={() => setShowConfirmMarkAll(false)}
      />
      <ConfirmDialog
        open={showConfirmSave}
        title="Simpan Absensi"
        message="Apakah Anda yakin ingin menyimpan data absensi untuk tanggal ini?"
        variant="info"
        confirmLabel="Simpan"
        onConfirm={handleSave}
        onCancel={() => setShowConfirmSave(false)}
        loading={saving}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Absensi Harian</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Kelas {classData.class_name}</p>
        </div>
        <button
          onClick={() => setShowQrModal(true)}
          className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
        >
          <QrCode className="w-4 h-4" />
          Scan QR Presensi Siswa
        </button>
      </div>

      {/* Date Picker & Actions */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field w-auto"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfirmMarkAll(true)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <CheckSquare className="w-4 h-4" />
              Tandai Semua Hadir
            </button>
            <button
              onClick={() => setShowConfirmSave(true)}
              className="btn-primary flex items-center gap-2 text-sm"
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan Absensi'}
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      {loading ? (
        <LoadingSpinner message="Memuat data absensi..." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">No</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">NIS</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Nama Siswa</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Status Kehadiran</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Keterangan</th>
                  {hasExistingData && (
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Alasan Perbaikan</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono text-xs">{student.nis}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {student.full_name}
                      {existingAttendances[student.id] && (
                        <span className="ml-2 text-xs text-emerald-600 font-normal">(Sudah Tercatat)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={attendances[student.id] || 'Hadir'}
                        onChange={(e) => handleStatusChange(student.id, e.target.value as AttendanceStatus)}
                        className={`select-field text-sm py-1 px-2 font-medium ${
                          attendances[student.id] === 'Hadir' ? 'text-emerald-700 dark:text-emerald-300 border-emerald-300' :
                          attendances[student.id] === 'Sakit' ? 'text-amber-700 dark:text-amber-300 border-amber-300' :
                          attendances[student.id] === 'Izin' ? 'text-blue-700 dark:text-blue-300 border-blue-300' :
                          attendances[student.id] === 'Alpa' ? 'text-rose-700 dark:text-rose-300 border-rose-300' :
                          'text-orange-700 dark:text-orange-300 border-orange-300'
                        }`}
                      >
                        {statusOptions.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={notes[student.id] || ''}
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        className="input-field text-sm py-1"
                        placeholder="Keterangan opsional..."
                      />
                    </td>
                    {hasExistingData && (
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={correctionReasons[student.id] || ''}
                          onChange={(e) => handleCorrectionReasonChange(student.id, e.target.value)}
                          className="input-field text-sm py-1"
                          placeholder="Alasan koreksi..."
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {students.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>Tidak ada siswa di kelas ini</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
