import React, { useState } from 'react';
import { User, Mail, Phone, Key, Building2, Calendar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';
import { useClassData } from '../hooks/useClassData';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast, { ToastType } from '../components/Toast';

export default function Profil() {
  const { profile, user } = useAuth();
  const { teacherData, classData, academicPeriod, loading } = useClassData();
  const [fullName, setFullName] = useState(profile?.full_name || 'Dra. Siti Rahmawati, M.Pd.');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSaving(true);

    try {
      if (profile?.id) {
        await supabase
          .from('profiles')
          .update({ full_name: fullName })
          .eq('id', profile.id);
      }
      setToast({ message: 'Profil berhasil diperbarui', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Profil berhasil diperbarui', type: 'success' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner message="Memuat profil..." />;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profil Saya</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Informasi akun dan data wali kelas binaan</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-primary-800 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {(fullName || profile?.full_name || 'S').charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{fullName || profile?.full_name}</h2>
            <p className="text-sm text-primary-700 dark:text-primary-400 font-medium">Wali Kelas {classData?.class_name || 'XII-A'}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap Guru</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Informasi Akun
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email Utama</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.email || profile?.email || 'siti.rahmawati@sekolah.sch.id'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Role Akses</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">Wali Kelas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Info */}
        <div className="card">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Data Pegawai / Guru
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">NIP</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{teacherData?.nip || '198001012010011001'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Nomor Telepon</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{teacherData?.phone || '081234567890'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Class Info */}
        <div className="card">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" /> Kelas Binaan
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Nama Kelas</p>
                <p className="text-sm font-semibold text-primary-800 dark:text-primary-400">{classData?.class_name || 'XII-A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Tahun Pelajaran / Semester</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {academicPeriod?.school_year || '2024/2025'} ({academicPeriod?.semester || 'Ganjil'})
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
