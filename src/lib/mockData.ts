import { Profile, Teacher, AcademicPeriod, Class, Student, Attendance, StudentNote, Announcement } from '../types';

export const mockProfile: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  full_name: 'Dra. Siti Rahmawati, M.Pd.',
  email: 'siti.rahmawati@sekolah.sch.id',
  role: 'wali_kelas',
  teacher_id: '00000000-0000-0000-0000-000000000001',
  created_at: new Date().toISOString(),
};

export const mockTeacher: Teacher = {
  id: '00000000-0000-0000-0000-000000000001',
  nip: '198001012010011001',
  full_name: 'Dra. Siti Rahmawati, M.Pd.',
  phone: '081234567890',
  email: 'siti.rahmawati@sekolah.sch.id',
  status: 'Aktif',
};

export const mockAcademicPeriod: AcademicPeriod = {
  id: '00000000-0000-0000-0000-000000000010',
  school_year: '2024/2025',
  semester: 'Ganjil',
  is_active: true,
};

export const mockClass: Class = {
  id: '00000000-0000-0000-0000-000000000020',
  class_name: 'XII-A',
  grade_level: '12',
  homeroom_teacher_id: '00000000-0000-0000-0000-000000000001',
  academic_period_id: '00000000-0000-0000-0000-000000000010',
  created_at: new Date().toISOString(),
};

export const mockStudents: Student[] = [
  { id: '101', nis: '2021001', nisn: '0012345671', full_name: 'Ahmad Fauzi', gender: 'L', birth_place: 'Jakarta', birth_date: '2007-01-15', address: 'Jl. Merdeka No. 10, Jakarta', parent_phone: '081111111101', class_id: mockClass.id, status: 'Aktif', created_at: new Date().toISOString() },
  { id: '102', nis: '2021002', nisn: '0012345672', full_name: 'Budi Santoso', gender: 'L', birth_place: 'Bandung', birth_date: '2007-03-20', address: 'Jl. Diponegoro No. 25, Bandung', parent_phone: '081111111102', class_id: mockClass.id, status: 'Aktif', created_at: new Date().toISOString() },
  { id: '103', nis: '2021003', nisn: '0012345673', full_name: 'Citra Dewi Lestari', gender: 'P', birth_place: 'Surabaya', birth_date: '2007-05-10', address: 'Jl. Pahlawan No. 8, Surabaya', parent_phone: '081111111103', class_id: mockClass.id, status: 'Aktif', created_at: new Date().toISOString() },
  { id: '104', nis: '2021004', nisn: '0012345674', full_name: 'Dian Permata Sari', gender: 'P', birth_place: 'Yogyakarta', birth_date: '2007-07-22', address: 'Jl. Malioboro No. 15, Yogyakarta', parent_phone: '081111111104', class_id: mockClass.id, status: 'Aktif', created_at: new Date().toISOString() },
  { id: '105', nis: '2021005', nisn: '0012345675', full_name: 'Eko Prasetyo', gender: 'L', birth_place: 'Semarang', birth_date: '2007-02-28', address: 'Jl. Pandanaran No. 30, Semarang', parent_phone: '081111111105', class_id: mockClass.id, status: 'Aktif', created_at: new Date().toISOString() },
  { id: '106', nis: '2021006', nisn: '0012345676', full_name: 'Fitri Handayani', gender: 'P', birth_place: 'Medan', birth_date: '2007-09-05', address: 'Jl. Sumatera No. 12, Medan', parent_phone: '081111111106', class_id: mockClass.id, status: 'Aktif', created_at: new Date().toISOString() },
  { id: '107', nis: '2021007', nisn: '0012345677', full_name: 'Gilang Ramadhan', gender: 'L', birth_place: 'Makassar', birth_date: '2007-11-18', address: 'Jl. Sulawesi No. 7, Makassar', parent_phone: '081111111107', class_id: mockClass.id, status: 'Aktif', created_at: new Date().toISOString() },
  { id: '108', nis: '2021008', nisn: '0012345678', full_name: 'Hana Nurul Aini', gender: 'P', birth_place: 'Palembang', birth_date: '2007-04-12', address: 'Jl. Sriwijaya No. 20, Palembang', parent_phone: '081111111108', class_id: mockClass.id, status: 'Aktif', created_at: new Date().toISOString() },
  { id: '109', nis: '2021009', nisn: '0012345679', full_name: 'Indra Wijaya Kusuma', gender: 'L', birth_place: 'Bali', birth_date: '2007-06-30', address: 'Jl. Dewata No. 5, Bali', parent_phone: '081111111109', class_id: mockClass.id, status: 'Aktif', created_at: new Date().toISOString() },
  { id: '110', nis: '2021010', nisn: '0012345680', full_name: 'Jasmine Putri Ayu', gender: 'P', birth_place: 'Aceh', birth_date: '2007-08-14', address: 'Jl. Serambi No. 3, Aceh', parent_phone: '081111111110', class_id: mockClass.id, status: 'Aktif', created_at: new Date().toISOString() },
];

const today = new Date().toISOString().split('T')[0];

export const mockAttendances: Attendance[] = [
  { id: 'att-1', student_id: '101', class_id: mockClass.id, attendance_date: today, status: 'Hadir', notes: '', input_by: mockProfile.id, correction_reason: '', created_at: today, updated_at: today },
  { id: 'att-2', student_id: '102', class_id: mockClass.id, attendance_date: today, status: 'Hadir', notes: '', input_by: mockProfile.id, correction_reason: '', created_at: today, updated_at: today },
  { id: 'att-3', student_id: '103', class_id: mockClass.id, attendance_date: today, status: 'Sakit', notes: 'Surat dokter', input_by: mockProfile.id, correction_reason: '', created_at: today, updated_at: today },
  { id: 'att-4', student_id: '104', class_id: mockClass.id, attendance_date: today, status: 'Hadir', notes: '', input_by: mockProfile.id, correction_reason: '', created_at: today, updated_at: today },
  { id: 'att-5', student_id: '105', class_id: mockClass.id, attendance_date: today, status: 'Terlambat', notes: 'Macet', input_by: mockProfile.id, correction_reason: '', created_at: today, updated_at: today },
  { id: 'att-6', student_id: '106', class_id: mockClass.id, attendance_date: today, status: 'Hadir', notes: '', input_by: mockProfile.id, correction_reason: '', created_at: today, updated_at: today },
  { id: 'att-7', student_id: '107', class_id: mockClass.id, attendance_date: today, status: 'Izin', notes: 'Acara keluarga', input_by: mockProfile.id, correction_reason: '', created_at: today, updated_at: today },
  { id: 'att-8', student_id: '108', class_id: mockClass.id, attendance_date: today, status: 'Hadir', notes: '', input_by: mockProfile.id, correction_reason: '', created_at: today, updated_at: today },
  { id: 'att-9', student_id: '109', class_id: mockClass.id, attendance_date: today, status: 'Hadir', notes: '', input_by: mockProfile.id, correction_reason: '', created_at: today, updated_at: today },
  { id: 'att-10', student_id: '110', class_id: mockClass.id, attendance_date: today, status: 'Alpa', notes: 'Tanpa keterangan', input_by: mockProfile.id, correction_reason: '', created_at: today, updated_at: today },
];

export const mockStudentNotes: StudentNote[] = [
  {
    id: 'sn-1',
    student_id: '101',
    category: 'Akademik',
    note_date: today,
    content: 'Ahmad menunjukkan peningkatan nilai matematika yang signifikan.',
    follow_up: 'Berikan latihan olimpiade tingkat sekolah.',
    completion_status: 'Selesai',
    visibility: 'Internal',
    created_by: mockProfile.id,
    created_at: today,
    students: mockStudents[0],
  },
  {
    id: 'sn-2',
    student_id: '105',
    category: 'Kedisiplinan',
    note_date: today,
    content: 'Eko sering terlambat 15 menit saat jam pertama.',
    follow_up: 'Pemanggilan orang tua.',
    completion_status: 'Sedang Ditindaklanjuti',
    visibility: 'Untuk Orang Tua',
    created_by: mockProfile.id,
    created_at: today,
    students: mockStudents[4],
  },
  {
    id: 'sn-3',
    student_id: '104',
    category: 'Prestasi',
    note_date: today,
    content: 'Dian meraih juara 1 lomba karya ilmiah tingkat kota.',
    follow_up: 'Usulkan untuk beasiswa sekolah.',
    completion_status: 'Selesai',
    visibility: 'Untuk Orang Tua',
    created_by: mockProfile.id,
    created_at: today,
    students: mockStudents[3],
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'an-1',
    class_id: mockClass.id,
    title: 'Jadwal Ujian Tengah Semester',
    content: 'Diberitahukan kepada seluruh siswa kelas XII-A bahwa UTS dilaksanakan minggu depan.',
    publish_date: today,
    expiry_date: today,
    status: 'Dipublikasikan',
    created_by: mockProfile.id,
    created_at: today,
  },
];
