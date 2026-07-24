import React, { useState } from 'react';
import { User, Mail, Phone, Key, Building2, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';
import { useClassData } from '../hooks/useClassData';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast, { ToastType } from '../components/Toast';

export default function Profil() {
  const { profile, user } = useAuth();
  const { teacherData, classData, academicPeriod, loading } = useClassData();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile!.id);

      if (error) throw error;
      setToast({ message: 'Profil berhasil diperbarui', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal memperbarui profil', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner message="Memuat profil..." />;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profil</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Informasi akun dan kelas Anda</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-primary-800 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profile?.full_name}</h2>
            <p className="text-gray-500">Wali Kelas</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informasi Akun</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{profile?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Info */}
      {teacherData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Data Guru</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">NIP</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{teacherData.nip}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Telepon</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{teacherData.phone || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{teacherData.email || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Info */}
      {classData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Kelas</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Kelas</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{classData.class_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Tahun Pelajaran / Semester</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {academicPeriod?.school_year || '-'} / {academicPeriod?.semester || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
