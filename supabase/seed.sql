-- Seed data for demo

-- Insert teacher
INSERT INTO teachers (id, nip, full_name, phone, email, status)
VALUES ('00000000-0000-0000-0000-000000000001', '198001012010011001', 'Dra. Siti Rahmawati, M.Pd.', '081234567890', 'siti.rahmawati@sekolah.sch.id', 'Aktif');

-- Insert academic period
INSERT INTO academic_periods (id, school_year, semester, is_active)
VALUES ('00000000-0000-0000-0000-000000000010', '2024/2025', 'Ganjil', true);

-- Insert class
INSERT INTO classes (id, class_name, grade_level, homeroom_teacher_id, academic_period_id)
VALUES ('00000000-0000-0000-0000-000000000020', 'XII-A', '12', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010');

-- Insert 10 students
INSERT INTO students (id, nis, nisn, full_name, gender, birth_place, birth_date, address, parent_phone, class_id, status) VALUES
('00000000-0000-0000-0000-000000000101', '2021001', '0012345671', 'Ahmad Fauzi', 'L', 'Jakarta', '2007-01-15', 'Jl. Merdeka No. 10, Jakarta', '081111111101', '00000000-0000-0000-0000-000000000020', 'Aktif'),
('00000000-0000-0000-0000-000000000102', '2021002', '0012345672', 'Budi Santoso', 'L', 'Bandung', '2007-03-20', 'Jl. Diponegoro No. 25, Bandung', '081111111102', '00000000-0000-0000-0000-000000000020', 'Aktif'),
('00000000-0000-0000-0000-000000000103', '2021003', '0012345673', 'Citra Dewi Lestari', 'P', 'Surabaya', '2007-05-10', 'Jl. Pahlawan No. 8, Surabaya', '081111111103', '00000000-0000-0000-0000-000000000020', 'Aktif'),
('00000000-0000-0000-0000-000000000104', '2021004', '0012345674', 'Dian Permata Sari', 'P', 'Yogyakarta', '2007-07-22', 'Jl. Malioboro No. 15, Yogyakarta', '081111111104', '00000000-0000-0000-0000-000000000020', 'Aktif'),
('00000000-0000-0000-0000-000000000105', '2021005', '0012345675', 'Eko Prasetyo', 'L', 'Semarang', '2007-02-28', 'Jl. Pandanaran No. 30, Semarang', '081111111105', '00000000-0000-0000-0000-000000000020', 'Aktif'),
('00000000-0000-0000-0000-000000000106', '2021006', '0012345676', 'Fitri Handayani', 'P', 'Medan', '2007-09-05', 'Jl. Sumatera No. 12, Medan', '081111111106', '00000000-0000-0000-0000-000000000020', 'Aktif'),
('00000000-0000-0000-0000-000000000107', '2021007', '0012345677', 'Gilang Ramadhan', 'L', 'Makassar', '2007-11-18', 'Jl. Sulawesi No. 7, Makassar', '081111111107', '00000000-0000-0000-0000-000000000020', 'Aktif'),
('00000000-0000-0000-0000-000000000108', '2021008', '0012345678', 'Hana Nurul Aini', 'P', 'Palembang', '2007-04-12', 'Jl. Sriwijaya No. 20, Palembang', '081111111108', '00000000-0000-0000-0000-000000000020', 'Aktif'),
('00000000-0000-0000-0000-000000000109', '2021009', '0012345679', 'Indra Wijaya Kusuma', 'L', 'Bali', '2007-06-30', 'Jl. Dewata No. 5, Bali', '081111111109', '00000000-0000-0000-0000-000000000020', 'Aktif'),
('00000000-0000-0000-0000-000000000110', '2021010', '0012345680', 'Jasmine Putri Ayu', 'P', 'Aceh', '2007-08-14', 'Jl. Serambi No. 3, Aceh', '081111111110', '00000000-0000-0000-0000-000000000020', 'Aktif');

-- Insert attendances for 7 days
DO $
DECLARE
  student_rec RECORD;
  date_counter DATE := CURRENT_DATE - INTERVAL '6 days';
  status_arr attendance_status[] := ARRAY['Hadir', 'Hadir', 'Hadir', 'Sakit', 'Hadir', 'Hadir', 'Izin', 'Hadir', 'Hadir', 'Terlambat', 'Alpa', 'Hadir', 'Hadir'];
BEGIN
  WHILE date_counter <= CURRENT_DATE LOOP
    FOR student_rec IN SELECT id FROM students WHERE class_id = '00000000-0000-0000-0000-000000000020' LOOP
      INSERT INTO attendances (student_id, class_id, attendance_date, status, notes, input_by)
      VALUES (
        student_rec.id,
        '00000000-0000-0000-0000-000000000020',
        date_counter,
        status_arr[1 + (random() * 12)::int],
        NULL,
        NULL
      );
    END LOOP;
    date_counter := date_counter + INTERVAL '1 day';
  END LOOP;
END $;

-- Insert leave requests
INSERT INTO leave_requests (id, student_id, start_date, end_date, leave_type, reason, attachment_url, status, homeroom_note, reviewed_by, reviewed_at) VALUES
(
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000103',
  CURRENT_DATE,
  CURRENT_DATE + 2,
  'Sakit',
  'Demam tinggi dan tidak bisa masuk sekolah',
  NULL,
  'Menunggu',
  NULL,
  NULL,
  NULL
),
(
  '00000000-0000-0000-0000-000000000302',
  '00000000-0000-0000-0000-000000000107',
  CURRENT_DATE - 5,
  CURRENT_DATE - 3,
  'Izin Keluarga',
  'Ada acara pernikahan keluarga di luar kota',
  NULL,
  'Disetujui',
  'Baik, silakan ikut acara keluarga',
  NULL,
  CURRENT_DATE - 4
),
(
  '00000000-0000-0000-0000-000000000303',
  '00000000-0000-0000-0000-000000000110',
  CURRENT_DATE - 3,
  CURRENT_DATE - 2,
  'Keperluan Pribadi',
  'Izin mengikuti lomba pidato tingkat provinsi',
  NULL,
  'Disetujui',
  'Semoga menang!',
  NULL,
  CURRENT_DATE - 3
);

-- Insert student notes
INSERT INTO student_notes (id, student_id, category, note_date, content, follow_up, completion_status, visibility, created_by) VALUES
(
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000101',
  'Akademik',
  CURRENT_DATE - 10,
  'Ahmad menunjukkan peningkatan nilai matematika yang signifikan',
  'Berikan latihan lanjutan',
  'Selesai',
  'Internal',
  NULL
),
(
  '00000000-0000-0000-0000-000000000402',
  '00000000-0000-0000-0000-000000000105',
  'Kedisiplinan',
  CURRENT_DATE - 7,
  'Eko sering terlambat masuk sekolah dalam seminggu terakhir',
  'Panggil orang tua untuk konsultasi',
  'Sedang Ditindaklanjuti',
  'Untuk Orang Tua',
  NULL
),
(
  '00000000-0000-0000-0000-000000000403',
  '00000000-0000-0000-0000-000000000104',
  'Prestasi',
  CURRENT_DATE - 5,
  'Dian meraih juara 1 lomba karya ilmiah tingkat kota',
  'Usulkan untuk beasiswa prestasi',
  'Selesai',
  'Untuk Orang Tua',
  NULL
),
(
  '00000000-0000-0000-0000-000000000404',
  '00000000-0000-0000-0000-000000000108',
  'Sosial',
  CURRENT_DATE - 3,
  'Hana menunjukkan sikap kepemimpinan yang baik saat kerja kelompok',
  'Libatkan dalam organisasi OSIS',
  'Belum',
  'Internal',
  NULL
),
(
  '00000000-0000-0000-0000-000000000405',
  '00000000-0000-0000-0000-000000000102',
  'Pendampingan',
  CURRENT_DATE - 1,
  'Budi mengalami kesulitan dalam pelajaran fisika',
  'Jadwalkan bimbingan tambahan',
  'Belum',
  'Internal',
  NULL
);

-- Insert announcements
INSERT INTO announcements (id, class_id, title, content, publish_date, expiry_date, status, created_by) VALUES
(
  '00000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000020',
  'Jadwal Ujian Tengah Semester',
  'Diberitahukan kepada seluruh siswa kelas XII-A bahwa Ujian Tengah Semester akan dilaksanakan pada tanggal 15-20 Maret 2025. Harap persiapkan diri dengan belajar sungguh-sungguh.',
  CURRENT_DATE,
  CURRENT_DATE + 14,
  'Dipublikasikan',
  NULL
),
(
  '00000000-0000-0000-0000-000000000502',
  '00000000-0000-0000-0000-000000000020',
  'Rapat Orang Tua Wali Murid',
  'Akan diadakan rapat orang tua wali murid pada hari Sabtu, 10 Februari 2025, pukul 08.00 WIB di Aula Sekolah. Kehadiran orang tua sangat diharapkan.',
  CURRENT_DATE + 5,
  CURRENT_DATE + 7,
  'Draft',
  NULL
);
