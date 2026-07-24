import React, { useState, useEffect } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/AuthContext';
import { useClassData } from '../hooks/useClassData';
import { Attendance, Student, AttendanceStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { getTodayString, getIndonesianDayName, formatDate, attendanceColors } from '../lib/utils';

interface MonthlySummaryItem {
  student: Student;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  terlambat: number;
  total: number;
}

export default function RekapAbsensi() {
  const { classData, students, loading: classLoading } = useClassData();
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [dailyData, setDailyData] = useState<Attendance[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummaryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classData && students.length > 0) {
      if (viewMode === 'daily') {
        fetchDailyData();
      } else {
        fetchMonthlyData();
      }
    }
  }, [classData, students, viewMode, selectedDate, selectedMonth]);

  async function fetchDailyData() {
    if (!classData) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendances')
        .select('*')
        .eq('class_id', classData.id)
        .eq('attendance_date', selectedDate);

      if (error) throw error;
      setDailyData(data || []);
    } catch (err) {
      console.error('Error fetching daily attendance:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMonthlyData() {
    if (!classData) return;
    setLoading(true);
    try {
      const [year, monthNum] = selectedMonth.split('-');
      const startDate = `${year}-${monthNum}-01`;
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
      const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('attendances')
        .select('*')
        .eq('class_id', classData.id)
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate);

      if (error) throw error;

      const summaryMap: Record<string, MonthlySummaryItem> = {};
      students.forEach(s => {
        summaryMap[s.id] = {
          student: s,
          hadir: 0,
          sakit: 0,
          izin: 0,
          alpa: 0,
          terlambat: 0,
          total: 0,
        };
      });

      data?.forEach(a => {
        if (summaryMap[a.student_id]) {
          summaryMap[a.student_id].total++;
          if (a.status === 'Hadir') summaryMap[a.student_id].hadir++;
          else if (a.status === 'Sakit') summaryMap[a.student_id].sakit++;
          else if (a.status === 'Izin') summaryMap[a.student_id].izin++;
          else if (a.status === 'Alpa') summaryMap[a.student_id].alpa++;
          else if (a.status === 'Terlambat') summaryMap[a.student_id].terlambat++;
        }
      });

      setMonthlySummary(Object.values(summaryMap));
    } catch (err) {
      console.error('Error fetching monthly attendance:', err);
    } finally {
      setLoading(false);
    }
  }

  function getAttendanceForStudent(studentId: string): Attendance | undefined {
    return dailyData.find(a => a.student_id === studentId);
  }

  if (classLoading) return <LoadingSpinner message="Memuat data..." />;
  if (!classData) return <div className="card"><p className="text-center text-gray-500">Belum ada kelas.</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rekap Absensi</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Kelas {classData.class_name}</p>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'daily'
                  ? 'bg-primary-800 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              Harian
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-primary-800 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              Bulanan
            </button>
          </div>
          <div>
            {viewMode === 'daily' ? (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field w-auto"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="input-field w-auto"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Memuat rekap absensi..." />
      ) : viewMode === 'daily' ? (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rekap Absensi - {getIndonesianDayName(selectedDate)}, {formatDate(selectedDate)}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">No</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">NIS</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Nama</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student, idx) => {
                  const att = getAttendanceForStudent(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{student.nis}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{student.full_name}</td>
                      <td className="px-4 py-3 text-center">
                        {att ? (
                          <span className={`badge ${attendanceColors[att.status]}`}>
                            {att.status}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{att?.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {students.length === 0 && (
            <div className="text-center py-8 text-gray-500">Tidak ada data siswa</div>
          )}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rekap Bulanan - {selectedMonth}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">No</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">NIS</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Nama</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Hadir</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Sakit</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Izin</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Alpa</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Terlambat</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {monthlySummary.map((item, idx) => (
                  <tr key={item.student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.student.nis}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{item.student.full_name}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">{item.hadir}</td>
                    <td className="px-4 py-3 text-center text-yellow-600 font-medium">{item.sakit}</td>
                    <td className="px-4 py-3 text-center text-blue-600 font-medium">{item.izin}</td>
                    <td className="px-4 py-3 text-center text-red-600 font-medium">{item.alpa}</td>
                    <td className="px-4 py-3 text-center text-orange-600 font-medium">{item.terlambat}</td>
                    <td className="px-4 py-3 text-center font-semibold">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {monthlySummary.length === 0 && (
            <div className="text-center py-8 text-gray-500">Belum ada data absensi untuk bulan ini</div>
          )}
        </div>
      )}
    </div>
  );
}
