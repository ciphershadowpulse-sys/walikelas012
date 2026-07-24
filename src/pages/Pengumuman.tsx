import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/AuthContext';
import { useClassData } from '../hooks/useClassData';
import { Announcement, AnnouncementStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast, { ToastType } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate } from '../lib/utils';

export default function Pengumuman() {
  const { profile } = useAuth();
  const { classData, loading: classLoading } = useClassData();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState<AnnouncementStatus>('Draft');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (classData) {
      fetchAnnouncements();
    } else if (!classLoading) {
      setAnnouncements([]);
      setLoading(false);
    }
  }, [classData, classLoading]);

  async function fetchAnnouncements() {
    try {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('class_id', classData!.id)
        .order('created_at', { ascending: false });

      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle('');
    setContent('');
    setPublishDate('');
    setExpiryDate('');
    setStatus('Draft');
    setEditingId(null);
  }

  function openEdit(announcement: Announcement) {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setContent(announcement.content);
    setPublishDate(announcement.publish_date || '');
    setExpiryDate(announcement.expiry_date || '');
    setStatus(announcement.status);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);

    try {
      const dataPayload = {
        class_id: classData!.id,
        title,
        content,
        publish_date: publishDate || null,
        expiry_date: expiryDate || null,
        status,
        created_by: profile?.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          .update(dataPayload)
          .eq('id', editingId);

        if (error) throw error;
        setToast({ message: 'Pengumuman berhasil diperbarui', type: 'success' });
      } else {
        const { error } = await supabase.from('announcements').insert(dataPayload);
        if (error) throw error;
        setToast({ message: 'Pengumuman berhasil dibuat', type: 'success' });
      }

      setShowForm(false);
      resetForm();
      fetchAnnouncements();
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal menyimpan pengumuman', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', deletingId);
      if (error) throw error;
      setAnnouncements(prev => prev.filter(a => a.id !== deletingId));
      setToast({ message: 'Pengumuman berhasil dihapus', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal menghapus pengumuman', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  }

  if (classLoading || loading) return <LoadingSpinner message="Memuat pengumuman..." />;
  if (!classData) return <div className="card"><p className="text-center text-gray-500">Belum ada kelas.</p></div>;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Hapus Pengumuman"
        message="Apakah Anda yakin ingin menghapus pengumuman ini?"
        variant="danger"
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pengumuman Kelas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Publikasi pengumuman untuk kelas {classData.class_name}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Buat Pengumuman
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Pengumuman</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Judul pengumuman..." required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Isi Pengumuman</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field min-h-[120px]"
                placeholder="Tuliskan isi pengumuman..."
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Publikasi</label>
                <input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Berakhir</label>
                <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status Publikasi</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as AnnouncementStatus)} className="select-field">
                  <option value="Draft">Draft</option>
                  <option value="Dipublikasikan">Dipublikasikan</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : editingId ? 'Perbarui Pengumuman' : 'Simpan Pengumuman'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">Belum ada pengumuman untuk kelas ini</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{ann.title}</h3>
                    <span className={ann.status === 'Dipublikasikan' ? 'badge-green' : 'badge-gray'}>
                      {ann.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    {ann.publish_date && <span>Publikasi: {formatDate(ann.publish_date)}</span>}
                    {ann.expiry_date && <span>Berakhir: {formatDate(ann.expiry_date)}</span>}
                    <span>Dibuat: {formatDate(ann.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => openEdit(ann)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                    title="Edit Pengumuman"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(ann.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Hapus Pengumuman"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
