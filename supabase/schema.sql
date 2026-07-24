-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'wali_kelas', 'guru');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('L', 'P');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('Hadir', 'Sakit', 'Izin', 'Alpa', 'Terlambat');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE leave_status AS ENUM ('Menunggu', 'Disetujui', 'Ditolak', 'Perlu Perbaikan');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE leave_type AS ENUM ('Sakit', 'Izin Keluarga', 'Keperluan Pribadi', 'Lomba', 'Lainnya');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE note_category AS ENUM ('Akademik', 'Sikap', 'Kedisiplinan', 'Kehadiran', 'Sosial', 'Prestasi', 'Pendampingan');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE completion_status AS ENUM ('Belum', 'Sedang Ditindaklanjuti', 'Selesai');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE note_visibility AS ENUM ('Internal', 'Untuk Orang Tua', 'UntukBK');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE student_status AS ENUM ('Aktif', 'Pindah', 'Lulus', 'Keluar');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE announcement_status AS ENUM ('Draft', 'Dipublikasikan');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nip VARCHAR(30) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  status VARCHAR(20) DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role user_role DEFAULT 'wali_kelas',
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Academic periods
CREATE TABLE IF NOT EXISTS academic_periods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_year VARCHAR(20) NOT NULL,
  semester VARCHAR(10) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  UNIQUE(school_year, semester)
);

-- 4. Classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name VARCHAR(50) NOT NULL,
  grade_level VARCHAR(10) NOT NULL,
  homeroom_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  academic_period_id UUID REFERENCES academic_periods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Students
CREATE TABLE IF NOT EXISTS students (
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

-- 6. Attendances
CREATE TABLE IF NOT EXISTS attendances (
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

-- 7. Leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
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

-- 8. Student notes
CREATE TABLE IF NOT EXISTS student_notes (
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

-- 9. Announcements
CREATE TABLE IF NOT EXISTS announcements (
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

-- Enable RLS & Add Public Policies for full access
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Permissive policies for read & write
CREATE POLICY "Allow public read teachers" ON teachers FOR SELECT USING (true);
CREATE POLICY "Allow public insert teachers" ON teachers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update teachers" ON teachers FOR UPDATE USING (true);

CREATE POLICY "Allow public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read academic_periods" ON academic_periods FOR SELECT USING (true);
CREATE POLICY "Allow public insert academic_periods" ON academic_periods FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Allow public insert classes" ON classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update classes" ON classes FOR UPDATE USING (true);

CREATE POLICY "Allow public read students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public insert students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update students" ON students FOR UPDATE USING (true);
CREATE POLICY "Allow public delete students" ON students FOR DELETE USING (true);

CREATE POLICY "Allow public read attendances" ON attendances FOR SELECT USING (true);
CREATE POLICY "Allow public insert attendances" ON attendances FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update attendances" ON attendances FOR UPDATE USING (true);

CREATE POLICY "Allow public read student_notes" ON student_notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert student_notes" ON student_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update student_notes" ON student_notes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete student_notes" ON student_notes FOR DELETE USING (true);

CREATE POLICY "Allow public read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Allow public insert announcements" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update announcements" ON announcements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete announcements" ON announcements FOR DELETE USING (true);

-- Insert Default Academic Period
INSERT INTO academic_periods (school_year, semester, is_active)
VALUES ('2024/2025', 'Ganjil', true)
ON CONFLICT (school_year, semester) DO UPDATE SET is_active = true;
