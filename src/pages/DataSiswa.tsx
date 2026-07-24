import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Filter, Eye, X } from 'lucide-react';
import { useClassData } from '../hooks/useClassData';
import { supabase } from '../lib/supabase';
import { Student, Gender } from '../types';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast, { ToastType } from '../components/Toast';
import { genderLabels } from '../lib/utils';

export default function DataSiswa() {
  const { classData, students, loading, refetch } = useClassData();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('L');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  const filteredStudents = students.filter((s) => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) || s.nisn.includes(search);
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const resetForm = () => {
    setNis('');
    setNisn('');
    setFullName('');
    setGender('L');
    setBirthPlace('');
    setBirthDate('');
    setAddress('');
    setParentPhone('');
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !nis.trim() || !nisn.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('students').insert({
        nis,
        nisn,
        full_name: fullName,
        gender,
        birth_place: birthPlace,
        birth_date: birthDate || null,
        address,
        parent_phone: parentPhone,
        class_id: classData?.id,
        status: 'Aktif',
      });

      if (error) throw error;
      setToast({ message: 'Siswa baru berhasil ditambahkan', type: 'success' });
      refetch();
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal menambahkan siswa', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'nis', header: 'NIS', sortable: true },
    { key: 'nisn', header: 'NISN', sortable: true },
    {
      key: 'full_name',
      header: 'Nama Lengkap',
      sortable: true,
      render: (s: Student) => (
        <button
          onClick={() => navigate(`/data-siswa/${s.id}`)}
          className="text-primary-800 dark:text-primary-400 hover:underline font-medium"
        >
          {s.full_name}
        </button>
      )
    },
    { key: 'gender', header: 'JK', render: (s: Student) => genderLabels[s.gender] },
    {
      key: 'parent_phone',
      header: 'No. Telp Ortu',
      render: (s: Student) => s.parent_phone || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (s: Student) => (
        <span className={s.status === 'Aktif' ? 'badge-green' : 'badge-gray'}>
          {s.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (s: Student) => (
        <button
          onClick={() => navigate(`/data-siswa/${s.id}`)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          title="Lihat Detail Siswa"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Memuat data siswa..." />;

  if (!classData) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Anda belum memiliki kelas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Data Siswa</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelas {classData.class_name} • Total {students.length} Siswa Terdaftar
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Siswa Baru
        </button>
      </div>

      {/* Modal Tambah Siswa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Tambah Siswa Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIS</label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="input-field"
                    placeholder="Contoh: 2021011"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NISN</label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="input-field"
                    placeholder="Contoh: 0012345681"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  placeholder="Masukkan nama lengkap siswa"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="select-field"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. Telp Ortu</label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="input-field"
                    placeholder="0812xxxxxxxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="input-field"
                    placeholder="Kota kelahiran"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Tempat Tinggal</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field min-h-[70px]"
                  placeholder="Alamat domisili siswa..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan NIS, NISN, atau Nama..."
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select-field pl-10"
          >
            <option value="all">Semua Status Siswa</option>
            <option value="Aktif">Aktif</option>
            <option value="Pindah">Pindah</option>
            <option value="Lulus">Lulus</option>
            <option value="Keluar">Keluar</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        emptyMessage="Tidak ada data siswa yang sesuai dengan pencarian"
        pageSize={10}
      />
    </div>
  );
}
