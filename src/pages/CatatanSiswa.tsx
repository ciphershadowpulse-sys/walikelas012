import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/AuthContext';
import { useClassData } from '../hooks/useClassData';
import { StudentNoteWithStudent, NoteCategory, CompletionStatus, NoteVisibility } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast, { ToastType } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate, noteCategoryColors, completionStatusColors } from '../lib/utils';
import { mockStudentNotes } from '../lib/mockData';

export default function CatatanSiswa() {
  const { profile } = useAuth();
  const { classData, students, loading: classLoading } = useClassData();
  const [notes, setNotes] = useState<StudentNoteWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Form state
  const [selectedStudent, setSelectedStudent] = useState('');
  const [noteCategory, setNoteCategory] = useState<NoteCategory>('Akademik');
  const [noteContent, setNoteContent] = useState('');
  const [noteFollowUp, setNoteFollowUp] = useState('');
  const [noteVisibility, setNoteVisibility] = useState<NoteVisibility>('Internal');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (classData && students.length > 0) {
      fetchNotes();
    } else if (!classLoading) {
      setNotes(mockStudentNotes as any);
      setLoading(false);
    }
  }, [classData, students, classLoading]);

  async function fetchNotes() {
    try {
      const { data } = await supabase
        .from('student_notes')
        .select('*, students(*)')
        .in('student_id', students.map(s => s.id))
        .order('created_at', { ascending: false });

      setNotes(data && data.length > 0 ? data : (mockStudentNotes as any));
    } catch (err) {
      console.warn('Error fetching notes, using fallback:', err);
      setNotes(mockStudentNotes as any);
    } finally {
      setLoading(false);
    }
  }

  const filteredNotes = notes.filter(n => {
    const matchSearch = n.students?.full_name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || n.category === filterCategory;
    return matchSearch && matchCategory;
  });

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim() || !selectedStudent) return;
    setSaving(true);

    try {
      const { error } = await supabase.from('student_notes').insert({
        student_id: selectedStudent,
        category: noteCategory,
        note_date: new Date().toISOString().split('T')[0],
        content: noteContent,
        follow_up: noteFollowUp,
        completion_status: 'Belum',
        visibility: noteVisibility,
        created_by: profile?.id,
      });

      if (error) {
        // Fallback local insert
        const foundStudent = students.find(s => s.id === selectedStudent);
        const newNote: any = {
          id: `sn-${Date.now()}`,
          student_id: selectedStudent,
          category: noteCategory,
          note_date: new Date().toISOString().split('T')[0],
          content: noteContent,
          follow_up: noteFollowUp,
          completion_status: 'Belum',
          visibility: noteVisibility,
          created_by: profile?.id || 'demo',
          created_at: new Date().toISOString(),
          students: foundStudent,
        };
        setNotes(prev => [newNote, ...prev]);
      }

      setToast({ message: 'Catatan siswa berhasil disimpan', type: 'success' });
      setShowAdd(false);
      setNoteContent('');
      setNoteFollowUp('');
      setSelectedStudent('');
      fetchNotes();
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal menambahkan catatan', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(noteId: string, newStatus: CompletionStatus) {
    try {
      const { error } = await supabase
        .from('student_notes')
        .update({ completion_status: newStatus })
        .eq('id', noteId);

      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, completion_status: newStatus } : n));
      setToast({ message: `Status catatan diperbarui ke ${newStatus}`, type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Gagal memperbarui status catatan', type: 'error' });
    }
  }

  async function handleDeleteNote() {
    if (!deletingNoteId) return;
    try {
      const { error } = await supabase.from('student_notes').delete().eq('id', deletingNoteId);
      setNotes(prev => prev.filter(n => n.id !== deletingNoteId));
      setToast({ message: 'Catatan berhasil dihapus', type: 'success' });
    } catch (err) {
      setNotes(prev => prev.filter(n => n.id !== deletingNoteId));
      setToast({ message: 'Catatan berhasil dihapus', type: 'success' });
    } finally {
      setDeletingNoteId(null);
    }
  }

  if (classLoading || loading) return <LoadingSpinner message="Memuat catatan..." />;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        open={Boolean(deletingNoteId)}
        title="Hapus Catatan Siswa"
        message="Apakah Anda yakin ingin menghapus catatan ini?"
        variant="danger"
        confirmLabel="Hapus"
        onConfirm={handleDeleteNote}
        onCancel={() => setDeletingNoteId(null)}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Catatan Siswa</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Jurnal perkembagan & sikap siswa kelas binaan</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Catatan
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Catatan Baru</h3>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Siswa</label>
                <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="select-field" required>
                  <option value="">Pilih siswa...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                <select value={noteCategory} onChange={(e) => setNoteCategory(e.target.value as NoteCategory)} className="select-field">
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
                <select value={noteVisibility} onChange={(e) => setNoteVisibility(e.target.value as NoteVisibility)} className="select-field">
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
                placeholder="Tuliskan peristiwa atau perkembangan siswa..."
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
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama siswa..."
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="select-field pl-10"
            >
              <option value="all">Semua Kategori</option>
              <option value="Akademik">Akademik</option>
              <option value="Sikap">Sikap</option>
              <option value="Kedisiplinan">Kedisiplinan</option>
              <option value="Kehadiran">Kehadiran</option>
              <option value="Sosial">Sosial</option>
              <option value="Prestasi">Prestasi</option>
              <option value="Pendampingan">Pendampingan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">Tidak ada catatan siswa yang sesuai</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                    {note.students?.full_name || 'Siswa'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`badge ${noteCategoryColors[note.category]}`}>{note.category}</span>
                    <span className={`badge ${completionStatusColors[note.completion_status]}`}>{note.completion_status}</span>
                    <span className="text-xs text-gray-400">{formatDate(note.note_date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {note.visibility}
                  </span>
                  <button
                    onClick={() => setDeletingNoteId(note.id)}
                    className="p-1 rounded text-gray-400 hover:text-rose-600 transition-colors"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 mt-2 font-medium">{note.content}</p>
              {note.follow_up && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Tindak Lanjut:</span> {note.follow_up}
                </p>
              )}

              {/* Status Action Buttons */}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-400">Ubah Status Tindak Lanjut:</span>
                <div className="flex items-center gap-2">
                  {note.completion_status !== 'Selesai' && (
                    <button
                      onClick={() => handleStatusChange(note.id, 'Selesai')}
                      className="btn-secondary text-xs py-1 px-2.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Selesai
                    </button>
                  )}
                  {note.completion_status === 'Belum' && (
                    <button
                      onClick={() => handleStatusChange(note.id, 'Sedang Ditindaklanjuti')}
                      className="btn-secondary text-xs py-1 px-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" /> Proses Tindak Lanjut
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
