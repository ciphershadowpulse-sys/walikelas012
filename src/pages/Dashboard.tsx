import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CalendarCheck, Stethoscope, FileText, AlertTriangle,
  TrendingUp, Clock, ArrowRight, BookOpen, Megaphone, FileBarChart,
  UserCircle, GraduationCap, CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/AuthContext';
import { useClassData } from '../hooks/useClassData';
import { supabase } from '../lib/supabase';
import { StudentNote } from '../types';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

interface DailyStats {
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  terlambat: number;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const { classData, academicPeriod, students, loading: classLoading } = useClassData();
  const navigate = useNavigate();
  
  const [todayAttendance, setTodayAttendance] = useState<DailyStats>({ hadir: 0, sakit: 0, izin: 0, alpa: 0, terlambat: 0 });
  const [weekChartData, setWeekChartData] = useState<any[]>([]);
  const [unresolvedNotes, setUnresolvedNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classData && students.length > 0) {
      fetchDashboardData();
    } else if (!classLoading) {
      setLoading(false);
    }
  }, [classData, students, classLoading]);

  async function fetchDashboardData() {
    if (!classData) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get today's attendance
      const { data: todayData } = await supabase
        .from('attendances')
        .select('status')
        .eq('class_id', classData.id)
        .eq('attendance_date', today);

      const stats: DailyStats = { hadir: 0, sakit: 0, izin: 0, alpa: 0, terlambat: 0 };
      todayData?.forEach(a => {
        if (a.status === 'Hadir') stats.hadir++;
        else if (a.status === 'Sakit') stats.sakit++;
        else if (a.status === 'Izin') stats.izin++;
        else if (a.status === 'Alpa') stats.alpa++;
        else if (a.status === 'Terlambat') stats.terlambat++;
      });
      setTodayAttendance(stats);

      // Get last 7 days chart data
      const weekData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
        
        const { data: dayData } = await supabase
          .from('attendances')
          .select('status')
          .eq('class_id', classData.id)
          .eq('attendance_date', dateStr);

        const dayStats = { hadir: 0, sakit: 0, izin: 0, alpa: 0, terlambat: 0 };
        dayData?.forEach(a => {
          if (a.status === 'Hadir') dayStats.hadir++;
          else if (a.status === 'Sakit') dayStats.sakit++;
          else if (a.status === 'Izin') dayStats.izin++;
          else if (a.status === 'Alpa') dayStats.alpa++;
          else if (a.status === 'Terlambat') dayStats.terlambat++;
        });

        weekData.push({
          day: dayName,
          Hadir: dayStats.hadir,
          Sakit: dayStats.sakit,
          Izin: dayStats.izin,
          Alpa: dayStats.alpa,
        });
      }
      setWeekChartData(weekData);

      // Get unresolved notes
      const { data: notes } = await supabase
        .from('student_notes')
        .select('*, students(*)')
        .in('student_id', students.map(s => s.id))
        .neq('completion_status', 'Selesai')
        .order('created_at', { ascending: false })
        .limit(5);

      setUnresolvedNotes(notes || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    { title: 'Data Siswa', desc: 'Kelola data & profil siswa', icon: Users, path: '/data-siswa', color: 'bg-blue-600' },
    { title: 'Absensi Harian', desc: 'Isi & update kehadiran harian', icon: CalendarCheck, path: '/absensi-harian', color: 'bg-emerald-600' },
    { title: 'Rekap Absensi', desc: 'Lihat rekap harian & bulanan', icon: FileText, path: '/rekap-absensi', color: 'bg-indigo-600' },
    { title: 'Catatan Siswa', desc: 'Catat perkembangan & sikap', icon: BookOpen, path: '/catatan-siswa', color: 'bg-purple-600', badge: unresolvedNotes.length },
    { title: 'Pengumuman', desc: 'Buat & publikasi pengumuman', icon: Megaphone, path: '/pengumuman', color: 'bg-teal-600' },
    { title: 'Cetak Laporan', desc: 'Cetak laporan siap print', icon: FileBarChart, path: '/laporan', color: 'bg-rose-600' },
    { title: 'Profil Saya', desc: 'Informasi guru & akun', icon: UserCircle, path: '/profil', color: 'bg-gray-600' },
  ];

  if (classLoading || loading) {
    return <LoadingSpinner message="Memuat dashboard..." />;
  }

  if (!classData) {
    return (
      <div className="card text-center py-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">Belum Ada Kelas</h3>
        <p className="text-gray-500">Anda belum terdaftar sebagai wali kelas pada kelas manapun.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 text-white relative overflow-hidden shadow-lg border-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-medium mb-2 text-primary-200">
              <GraduationCap className="w-4 h-4" /> System Wali Kelas Digital
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Selamat Datang, {profile?.full_name}</h1>
            <p className="text-primary-100 text-sm mt-1">
              Wali Kelas <span className="font-semibold text-white">{classData.class_name}</span> • Tahun Pelajaran {academicPeriod?.school_year || '-'} ({academicPeriod?.semester || '-'})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/absensi-harian')}
              className="bg-white text-primary-900 hover:bg-primary-50 font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm shadow flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              Input Absensi Hari Ini
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <span>⚡</span> Pintasan Fitur Utama
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map((act) => (
            <button
              key={act.path}
              onClick={() => navigate(act.path)}
              className="card p-4 hover:border-primary-500 hover:shadow-md transition-all text-left group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg text-white ${act.color} group-hover:scale-110 transition-transform`}>
                  <act.icon className="w-5 h-5" />
                </div>
                {act.badge && act.badge > 0 ? (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {act.badge}
                  </span>
                ) : null}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary-600 transition-colors">
                  {act.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{act.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Siswa"
          value={students.length}
          icon={<Users className="w-5 h-5" />}
          color="text-blue-600"
        />
        <StatCard
          title="Hadir Hari Ini"
          value={todayAttendance.hadir}
          icon={<CalendarCheck className="w-5 h-5" />}
          color="text-emerald-600"
        />
        <StatCard
          title="Sakit"
          value={todayAttendance.sakit}
          icon={<Stethoscope className="w-5 h-5" />}
          color="text-yellow-600"
        />
        <StatCard
          title="Izin"
          value={todayAttendance.izin}
          icon={<FileText className="w-5 h-5" />}
          color="text-blue-600"
        />
        <StatCard
          title="Alpa"
          value={todayAttendance.alpa}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="text-red-600"
        />
        <StatCard
          title="Terlambat"
          value={todayAttendance.terlambat}
          icon={<Clock className="w-5 h-5" />}
          color="text-orange-600"
        />
      </div>

      {/* Attendance Chart & Unresolved Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Grafik Kehadiran 7 Hari Terakhir
              </h3>
              <p className="text-xs text-gray-500">Statistik tren kehadiran siswa per hari</p>
            </div>
            <button
              onClick={() => navigate('/rekap-absensi')}
              className="text-xs text-primary-800 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
            >
              Lihat Rekap <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="Hadir" fill="#10b981" name="Hadir" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sakit" fill="#f59e0b" name="Sakit" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Izin" fill="#3b82f6" name="Izin" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Alpa" fill="#ef4444" name="Alpa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Unresolved Notes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>🚨</span> Siswa Perlu Perhatian
            </h3>
            <button
              onClick={() => navigate('/catatan-siswa')}
              className="text-xs text-primary-800 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {unresolvedNotes.length === 0 ? (
            <div className="p-6 text-center text-gray-500 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Tidak ada catatan yang perlu ditindaklanjuti</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unresolvedNotes.map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {(note as any).students?.full_name || 'Siswa'}
                    </p>
                    <span className="badge-yellow">
                      {note.completion_status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Kategori: <span className="font-medium text-blue-600 dark:text-blue-400">{note.category}</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
