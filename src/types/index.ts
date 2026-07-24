export type UserRole = 'admin' | 'wali_kelas' | 'guru';
export type Gender = 'L' | 'P';
export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Terlambat';
export type LeaveStatus = 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Perlu Perbaikan';
export type LeaveType = 'Sakit' | 'Izin Keluarga' | 'Keperluan Pribadi' | 'Lomba' | 'Lainnya';
export type NoteCategory = 'Akademik' | 'Sikap' | 'Kedisiplinan' | 'Kehadiran' | 'Sosial' | 'Prestasi' | 'Pendampingan';
export type CompletionStatus = 'Belum' | 'Sedang Ditindaklanjuti' | 'Selesai';
export type NoteVisibility = 'Internal' | 'Untuk Orang Tua' | 'UntukBK';
export type StudentStatus = 'Aktif' | 'Pindah' | 'Lulus' | 'Keluar';
export type AnnouncementStatus = 'Draft' | 'Dipublikasikan';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  teacher_id: string | null;
  created_at: string;
}

export interface Teacher {
  id: string;
  nip: string;
  full_name: string;
  phone: string;
  email: string;
  status: string;
}

export interface AcademicPeriod {
  id: string;
  school_year: string;
  semester: string;
  is_active: boolean;
}

export interface Class {
  id: string;
  class_name: string;
  grade_level: string;
  homeroom_teacher_id: string;
  academic_period_id: string;
  created_at: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  full_name: string;
  gender: Gender;
  birth_place: string;
  birth_date: string;
  address: string;
  parent_phone: string;
  class_id: string;
  status: StudentStatus;
  created_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  scan_method?: string;
  scanned_at?: string;
  notes: string;
  input_by: string;
  correction_reason: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  leave_type: LeaveType;
  reason: string;
  attachment_url: string;
  status: LeaveStatus;
  homeroom_note: string;
  reviewed_by: string;
  reviewed_at: string;
  created_at: string;
  students?: Student;
}

export interface StudentNote {
  id: string;
  student_id: string;
  category: NoteCategory;
  note_date: string;
  content: string;
  follow_up: string;
  completion_status: CompletionStatus;
  visibility: NoteVisibility;
  created_by: string;
  created_at: string;
  students?: Student;
}

export interface Announcement {
  id: string;
  class_id: string;
  title: string;
  content: string;
  publish_date: string;
  expiry_date: string;
  status: AnnouncementStatus;
  created_by: string;
  created_at: string;
}

export interface AttendanceWithStudent extends Attendance {
  students: Student;
}

export interface LeaveRequestWithStudent extends LeaveRequest {
  students: Student;
}

export interface StudentNoteWithStudent extends StudentNote {
  students: Student;
}
