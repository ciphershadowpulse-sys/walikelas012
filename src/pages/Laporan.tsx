import React, { useState, useEffect, useRef } from 'react';
import { Printer, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useClassData } from '../hooks/useClassData';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatDateShort } from '../lib/utils';

type ReportType = 'attendance-daily' | 'attendance-monthly' | 'attendance-student' | 'notes';

export default function Laporan() {
  const { classData, students, loading: classLoading } = useClassData();
  const printRef = useRef<HTMLDivElement>(null);
  const [reportType, setReportType] = useState<ReportType>('attendance-daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classData) {
      fetchReport();
    }
  }, [classData, reportType, date, month, selectedStudent]);

  async function fetchReport() {
    setLoading(true);
    try {
      switch (reportType) {
        case 'attendance-daily':
          await fetchDailyAttendance();
          break;
        case 'attendance-monthly':
          await fetchMonthlyAttendance();
          break;
        case 'attendance-student':
          await fetchStudentAttendance();
          break;
        case 'notes':
          await fetchNotes();
          break;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDailyAttendance() {
    const { data: attData } = await supabase
      .from('attendances')
      .select('*, students(*)')
      .eq('class_id', classData!.id)
      .eq('attendance_date', date);
    setData(attData || []);
  }

  async function fetchMonthlyAttendance() {
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
    const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;

    const { data: attData } = await supabase
      .from('attendances')
      .select('*, students(*)')
      .eq('class_id', classData!.id)
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate);
    setData(attData || []);
  }

  async function fetchStudentAttendance() {
    let query = supabase
      .from('attendances')
      .select('*, students(*)')
      .eq('class_id', classData!.id)
      .order('attendance_date', { ascending: false })
      .limit(60);

    if (selectedStudent !== 'all') {
      query = query.eq('student_id', selectedStudent);
    }

    const { data: attData } = await query;
    setData(attData || []);
  }

  async function fetchNotes() {
    let query = supabase
      .from('student_notes')
      .select('*, students(*)')
      .in('student_id', students.map(s => s.id))
      .order('created_at', { ascending: false });

    if (selectedStudent !== 'all') {
      query = query.eq('student_id', selectedStudent);
    }

    const { data: notesData } = await query;
    setData(notesData || []);
  }

  function handlePrint() {
    window.print();
  }

  if (classLoading) return <LoadingSpinner message="Memuat..." />;
  if (!classData) return <div className="card"><p className="text-center text-gray-500">Belum ada kelas.</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Laporan</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Cetak laporan kelas</p>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Laporan</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className="select-field">
              <option value="attendance-daily">Rekap Absensi Harian</option>
              <option value="attendance-monthly">Rekap Absensi Bulanan</option>
              <option value="attendance-student">Rekap Absensi Per Siswa</option>
              <option value="notes">Daftar Catatan Perkembangan</option>
            </select>
          </div>
          {(reportType === 'attendance-daily') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
            </div>
          )}
          {(reportType === 'attendance-monthly') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bulan</label>
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input-field" />
            </div>
          )}
          {(reportType === 'attendance-student' || reportType === 'notes') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Siswa</label>
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="select-field">
                <option value="all">Semua Siswa</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-end">
            <button onClick={handlePrint} className="btn-primary flex items-center gap-2 w-full justify-center">
              <Printer className="w-4 h-4" />
              Cetak Laporan
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div ref={printRef} className="card print:shadow-none print:border-none">
        <div className="hidden print:block text-center mb-6">
          <h2 className="text-xl font-bold">Laporan Kelas {classData.class_name}</h2>
          <p className="text-sm text-gray-500">
            {reportType === 'attendance-daily' && `Absensi Harian - ${formatDate(date)}`}
            {reportType === 'attendance-monthly' && `Absensi Bulanan - ${month}`}
            {reportType === 'attendance-student' && `Absensi Per Siswa`}
            {reportType === 'notes' && `Catatan Perkembangan`}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Memuat laporan..." />
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2" />
            <p>Tidak ada data untuk laporan ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-2 text-left">No</th>
                  {data[0]?.students && <th className="px-4 py-2 text-left">Nama</th>}
                  {(reportType === 'attendance-daily' || reportType === 'attendance-monthly' || reportType === 'attendance-student') && (
                    <>
                      <th className="px-4 py-2 text-left">Tanggal</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Keterangan</th>
                    </>
                  )}
                  {reportType === 'notes' && (
                    <>
                      <th className="px-4 py-2 text-left">Kategori</th>
                      <th className="px-4 py-2 text-left">Tanggal</th>
                      <th className="px-4 py-2 text-left">Isi</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((item: any, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2">{idx + 1}</td>
                    {item.students && <td className="px-4 py-2 font-medium">{item.students.full_name}</td>}
                    {(reportType === 'attendance-daily' || reportType === 'attendance-monthly' || reportType === 'attendance-student') && (
                      <>
                        <td className="px-4 py-2">{formatDateShort(item.attendance_date)}</td>
                        <td className="px-4 py-2">
                          <span className={`badge ${
                            item.status === 'Hadir' ? 'badge-green' :
                            item.status === 'Sakit' ? 'badge-yellow' :
                            item.status === 'Izin' ? 'badge-blue' :
                            item.status === 'Alpa' ? 'badge-red' : 'badge-gray'
                          }`}>{item.status}</span>
                        </td>
                        <td className="px-4 py-2">{item.notes || '-'}</td>
                      </>
                    )}
                    {reportType === 'notes' && (
                      <>
                        <td className="px-4 py-2">{item.category}</td>
                        <td className="px-4 py-2">{formatDateShort(item.note_date)}</td>
                        <td className="px-4 py-2 max-w-xs truncate">{item.content}</td>
                        <td className="px-4 py-2">{item.completion_status}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body { background: white; }
          .card { box-shadow: none; border: 1px solid #e5e7eb; }
          button { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
        }
      `}</style>
    </div>
  );
}
