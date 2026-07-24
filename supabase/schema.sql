-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'wali_kelas', 'guru');
CREATE TYPE gender_type AS ENUM ('L', 'P');
CREATE TYPE attendance_status AS ENUM ('Hadir', 'Sakit', 'Izin', 'Alpa', 'Terlambat');
CREATE TYPE leave_status AS ENUM ('Menunggu', 'Disetujui', 'Ditolak', 'Perlu Perbaikan');
CREATE TYPE leave_type AS ENUM ('Sakit', 'Izin Keluarga', 'Keperluan Pribadi', 'Lomba', 'Lainnya');
CREATE TYPE note_category AS ENUM ('Akademik', 'Sikap', 'Kedisiplinan', 'Kehadiran', 'Sosial', 'Prestasi', 'Pendampingan');
CREATE TYPE completion_status AS ENUM ('Belum', 'Sedang Ditindaklanjuti', 'Selesai');
CREATE TYPE note_visibility AS ENUM ('Internal', 'Untuk Orang Tua', 'UntukBK');
CREATE TYPE student_status AS ENUM ('Aktif', 'Pindah', 'Lulus', 'Keluar');
CREATE TYPE announcement_status AS ENUM ('Draft', 'Dipublikasikan');

-- Teachers table
CREATE TABLE teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nip VARCHAR(30) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  status VARCHAR(20) DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role user_role DEFAULT 'wali_kelas',
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic periods
CREATE TABLE academic_periods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_year VARCHAR(20) NOT NULL,
  semester VARCHAR(10) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  UNIQUE(school_year, semester)
);

-- Classes
CREATE TABLE classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name VARCHAR(50) NOT NULL,
  grade_level VARCHAR(10) NOT NULL,
  homeroom_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  academic_period_id UUID REFERENCES academic_periods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nis VARCHAR(30) UNIQUE NOT NULL,
  nisn VARCHAR(30) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  gender gender_type NOT NULL,
  birth_place VARCHAR(100),
  birth_date DATE,
  address TEXT,
  parent_phone VARCHAR(20),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  status student_status DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendances
CREATE TABLE attendances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'Hadir',
  notes TEXT,
  input_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  correction_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, attendance_date)
);

-- Leave requests
CREATE TABLE leave_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type leave_type DEFAULT 'Sakit',
  reason TEXT NOT NULL,
  attachment_url TEXT,
  status leave_status DEFAULT 'Menunggu',
  homeroom_note TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student notes
CREATE TABLE student_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  category note_category NOT NULL,
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  follow_up TEXT,
  completion_status completion_status DEFAULT 'Belum',
  visibility note_visibility DEFAULT 'Internal',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  publish_date DATE,
  expiry_date DATE,
  status announcement_status DEFAULT 'Draft',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_attendances_date ON attendances(attendance_date);
CREATE INDEX idx_attendances_student ON attendances(student_id);
CREATE INDEX idx_leave_requests_student ON leave_requests(student_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_student_notes_student ON student_notes(student_id);
CREATE INDEX idx_announcements_class ON announcements(class_id);
CREATE INDEX idx_announcements_status ON announcements(status);
