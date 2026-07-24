import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Calendar, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Student, StudentNote, Attendance } from '../types';
import { useAuth } from '../hooks/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast, { ToastType } from '../components/Toast';
import { formatDate, genderLabels, noteCategoryColors, completionStatusColors } from '../lib/utils';

export default function DetailSiswa() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddNote, setShowAddNote] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Form state
  const [noteCategory, setNoteCategory] = useState('Akademik');
  const [noteContent, setNoteContent] = useState('');
  const [noteFollowUp, setNoteFollowUp] = useState('');
  const [noteVisibility, setNoteVisibility] = useState('Internal');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) fetchStudentData();
  }, [id]);

  async function fetchStudentData() {
    setLoading(true);
    try {
      const { data: studentData, error: sErr } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (sErr) throw sErr;
      setStudent(studentData);

      const { data: notesData } = await supabase
        .from('student_notes')
        .select('*')
        .eq('student_id', id)
        .order('created_at', { ascending: false });
      setNotes(notesData || []);

      const { data: attData } = await supabase
        .from('attendances')
        .select('*')
        .eq('student_id', id)
        .order('attendance_date', { ascending: false })
        .limit(30);
      setAttendances(attData || []);
    } catch (err) {
      console.error('Error fetching student details:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setSaving(true);

    try {
      const { error } = await supabase.from('student_notes').insert({
        student_id: id,
        category: noteCategory,
        note_date: new Date().toISOString().split('T')[0],
        content: noteContent,
        follow_up: noteFollowUp,
        completion_status: 'Belum',
        visibility: noteVisibility,
        created_by: profile?.id,
      });

      if (error) throw error;
      setToast({ message: 'Catatan berhasil ditambahkan', type: 'success' });
      setShowAddNote(false);
      setNoteContent('');
      setNoteFollowUp('');
      fetchStudentData();
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal menambahkan catatan', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner message="Memuat data siswa..." />;
  if (!student) return <div className="card"><p className="text-center text-gray-500">Siswa tidak ditemukan</p></div>;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Back */}
      <button
        onClick={() => navigate('/data-siswa')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Data Siswa
      </button>

      {/* Student Info Card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-800 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {student.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{student.full_name}</h1>
            <p className="text-gray-500">NIS: {student.nis} | NISN: {student.nisn}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4 text-primary-600" />
            <span className="text-sm">Jenis Kelamin: {genderLabels[student.gender]}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 text-primary-600" />
            <span className="text-sm">Lahir: {student.birth_place}, {formatDate(student.birth_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Phone className="w-4 h-4 text-primary-600" />
            <span className="text-sm">Telp Ortu: {student.parent_phone || '-'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 lg:col-span-2">
            <MapPin className="w-4 h-4 text-primary-600" />
            <span className="text-sm">Alamat: {student.address || '-'}</span>
          </div>
          <div>
            <span className={student.status === 'Aktif' ? 'badge-green' : 'badge-gray'}>
              Status: {student.status}
            </span>
          </div>
        </div>
      </div>

      {/* Add Note Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Catatan Perkembangan & Sikap</h3>
        <button
          onClick={() => setShowAddNote(!showAddNote)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Catatan
        </button>
      </div>

      {/* Add Note Form */}
      {showAddNote && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tambah Catatan Baru</h3>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                <select value={noteCategory} onChange={(e) => setNoteCategory(e.target.value)} className="select-field">
                  <option value="Akademik">Akademik</option>
                  <option value="Sikap">Sikap</option>
                  <option value="Kedisiplinan">Kedisiplinan</option>
                  <option value="Kehadiran">Kehadiran</option>
                  <option value="Sosial">Sosial</option>
                  <option value="Prestasi">Prestasi</option>
                  <option value="Pendampingan">Pendampingan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visibilitas</label>
                <select value={noteVisibility} onChange={(e) => setNoteVisibility(e.target.value)} className="select-field">
                  <option value="Internal">Internal (Wali Kelas)</option>
                  <option value="Untuk Orang Tua">Untuk Orang Tua</option>
                  <option value="UntukBK">Untuk BK</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Isi Catatan</label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="input-field min-h-[90px]"
                placeholder="Tuliskan perkembangan atau kejadian siswa..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tindak Lanjut</label>
              <textarea
                value={noteFollowUp}
                onChange={(e) => setNoteFollowUp(e.target.value)}
                className="input-field min-h-[60px]"
                placeholder="Rencana atau tindakan yang akan diambil..."
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Catatan'}
              </button>
              <button type="button" onClick={() => setShowAddNote(false)} className="btn-secondary">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      <div className="card">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada catatan untuk siswa ini.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${noteCategoryColors[note.category]}`}>{note.category}</span>
                  <span className={`badge ${completionStatusColors[note.completion_status]}`}>{note.completion_status}</span>
                  <span className="text-xs text-gray-400 ml-auto">{formatDate(note.note_date)}</span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{note.content}</p>
                {note.follow_up && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-white dark:bg-gray-900 p-2 rounded border border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Tindak Lanjut:</span> {note.follow_up}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">Akses: {note.visibility}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Riwayat Kehadiran Siswa</h3>
        {attendances.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada data absensi untuk siswa ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Tanggal</th>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Status</th>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {attendances.map((att) => (
                  <tr key={att.id}>
                    <td className="px-4 py-2">{formatDate(att.attendance_date)}</td>
                    <td className="px-4 py-2">
                      <span className={`badge ${
                        att.status === 'Hadir' ? 'badge-green' :
                        att.status === 'Sakit' ? 'badge-yellow' :
                        att.status === 'Izin' ? 'badge-blue' :
                        att.status === 'Alpa' ? 'badge-red' :
                        'badge-gray'
                      }`}>{att.status}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{att.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
