# 🎓 Wali Kelas Digital

Sistem Manajemen & Presensi Wali Kelas Berbasis Web modern yang dibangun menggunakan **React 18**, **TypeScript**, **Tailwind CSS**, **Vite**, dan **Supabase**.

---

## 📌 Fitur Utama

- 📊 **Dashboard Interaktif**: Ringkasan statistik kehadiran siswa, grafik tren harian 7 hari terakhir, dan daftar siswa yang memerlukan perhatian wali kelas.
- 👥 **Data Siswa**: Manajemen master data siswa kelas binaan (NIS, NISN, Nama, JK, Alamat, No HP Ortu), pencarian instan, filter status, dan fitur *Tambah Siswa Baru*.
- 👤 **Detail Siswa**: Informasi lengkap biodata siswa, riwayat absensi 30 hari terakhir, serta riwayat catatan perkembangan siswa.
- 📅 **Absensi Harian**: Input presensi kelas harian per tanggal (Hadir, Sakit, Izin, Alpa, Terlambat) dengan opsi *Tandai Semua Hadir* dan alasan perbaikan.
- 📋 **Rekap Absensi**: Laporan rekapitulasi kehadiran dalam format **Harian** dan **Bulanan** lengkap dengan statistik akumulasi per siswa.
- 📝 **Catatan Siswa**: Jurnal pencatatan perkembangan siswa (Akademik, Sikap, Kedisiplinan, Sosial, Prestasi, Pendampingan) beserta status tindak lanjut & hak akses visibilitas.
- 📢 **Pengumuman**: Pembuatan dan pengumuman kelas untuk siswa/orang tua dengan status *Draft* / *Dipublikasikan*.
- 🖨️ **Laporan Siap Cetak**: Penjanaan laporan resmi kelas siap cetak/PDF untuk absensi harian, absensi bulanan, rekap per siswa, dan catatan perkembangan.

---

## 💻 Prasyarat Sistem

Sebelum melakukan pemasangan, pastikan perangkat Anda telah terinstall:
- **Node.js**: versi `v18.0.0` atau yang lebih baru.
- **npm**: versi `v9.0.0` atau yang lebih baru.
- **Akun Supabase**: untuk database PostgreSQL & Authentication.

---

## 🚀 Cara Pemasangan & Jalankan Lokal

### 1. Extract / Download Project
Buka terminal (Command Prompt / PowerShell / Bash) dan masuk ke direktori proyek:
```bash
cd wali-kelas-digital
```

### 2. Install Dependency
Jalankan perintah berikut untuk menginstall seluruh paket yang dibutuhkan:
```bash
npm install --legacy-peer-deps
```

### 3. Konfigurasi Variabel Lingkungan (`.env`)
Buat file `.env` pada direktori utama proyek (sejajar dengan `package.json`):
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```
> **Catatan**: Ganti `<your-project-ref>` dan `<your-supabase-anon-key>` dengan URL dan Anon Key dari Dashboard Supabase Anda (*Settings > API*).

---

## 🗄️ Persiapan Database Supabase

1. Masuk ke [Dashboard Supabase](https://supabase.com/dashboard).
2. Pilih proyek Anda, lalu buka menu **SQL Editor** pada sidebar kiri.
3. Buka file [`supabase/schema.sql`](file:///c:/Users/Monk/Downloads/wali-kelas-digital/supabase/schema.sql) yang ada pada proyek ini, salin seluruh kodenya, lalu **Run** di SQL Editor Supabase untuk membuat tabel-tabel utama (`teachers`, `profiles`, `classes`, `academic_periods`, `students`, `attendances`, `student_notes`, `announcements`).
4. (Opsional) Buka file [`supabase/seed.sql`](file:///c:/Users/Monk/Downloads/wali-kelas-digital/supabase/seed.sql), salin kodenya, dan **Run** di SQL Editor untuk mengisi data contoh.

---

## 🔑 Membuat Akun Wali Kelas

1. Di Dashboard Supabase, buka menu **Authentication** > **Users** > **Add User** > **Create User**.
2. Masukkan Email dan Password untuk Wali Kelas.
3. Setelah user berhasil dibuat, salin **User UID** pengguna tersebut.
4. Buka kembali **SQL Editor** di Supabase, dan jalankan perintah berikut untuk mendaftarkan akun sebagai Wali Kelas:
```sql
INSERT INTO profiles (id, full_name, email, role, teacher_id)
VALUES (
  'PASTE_USER_UID_DISINI',
  'Dra. Siti Rahmawati, M.Pd.',
  'email.guru@sekolah.sch.id',
  'wali_kelas',
  '00000000-0000-0000-0000-000000000001'
);
```

---

## ⚡ Menjalankan Aplikasi

### Mode Pengembang (Development)
Untuk menjalankan aplikasi secara lokal dengan Hot Module Replacement (HMR):
```bash
npm run dev
```
Buka browser Anda dan akses: `http://localhost:5173`

### Build untuk Produksi (Production Build)
Untuk melakukan kompilasi file produksi yang siap di-deploy (Netlify/Vercel/Hosting):
```bash
npm run build
```
Hasil build akan berada di folder `dist/`.

---

## 📁 Struktur Direktori Proyek

```
wali-kelas-digital/
├── public/                 # Asset publik (favicon, logos)
├── src/
│   ├── components/        # Komponen UI Reusable (Sidebar, Layout, DataTable, dll)
│   ├── hooks/             # Custom React Hooks (AuthContext, useClassData)
│   ├── lib/               # Konfigurasi Supabase Client & Helper Functions
│   ├── pages/             # Halaman Aplikasi (Dashboard, DataSiswa, Absensi, dll)
│   ├── types/             # TypeScript Interfaces & Types
│   ├── App.tsx            # Routing & Provider Setup
│   ├── index.css          # Styling Utama & Tailwind Directives
│   └── main.tsx           # Entry point React
├── supabase/              # SQL Schemas & Seed Data
├── .env                   # Variabel lingkungan Supabase (Secret)
├── package.json           # Dependensi proyek
├── tailwind.config.js     # Konfigurasi Tailwind CSS
└── vite.config.ts         # Konfigurasi Vite
```

---

## 📜 Lisensi & Hak Cipta
&copy; Wali Kelas Digital. Dilindungi Undang-Undang.
