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
- **Git**: [Download Git](https://git-scm.com/downloads)
- **Node.js**: versi `v18.0.0` atau yang lebih baru ([Download Node.js](https://nodejs.org/))
- **npm**: versi `v9.0.0` atau yang lebih baru.
- **Akun Supabase**: untuk database PostgreSQL & Authentication ([Buka Supabase](https://supabase.com/))

---

## 🐙 Panduan GitHub

### 📤 1. Cara Mengunggah (Upload / Push) Proyek ke GitHub

Jika Anda ingin menyimpan kode proyek ini ke repository GitHub Anda sendiri:

#### Step A: Buat Repository Baru di GitHub
1. Buka [GitHub](https://github.com/) dan buat repository baru (*New Repository*).
2. Beri nama repository, misalnya: `wali-kelas-digital`.
3. Biarkan opsi *Add a README file*, *.gitignore*, dan *license* **TIDAK DICENTANG** (kosongkan), lalu klik **Create repository**.
4. Salin URL repository Anda, contoh: `https://github.com/username/wali-kelas-digital.git`.

#### Step B: Inisialisasi & Push dari Terminal Lokal
Buka terminal pada folder proyek ini, lalu jalankan perintah berikut secara berurutan:

```bash
# 1. Inisialisasi Git repository lokal
git init

# 2. Tambahkan seluruh file ke staging area
git add .

# 3. Buat commit pertama
git commit -m "Initial commit - Wali Kelas Digital"

# 4. Ubah nama branch utama menjadi main
git branch -M main

# 5. Hubungkan ke repository GitHub Anda (ganti URL dengan URL repo Anda)
git remote add origin https://github.com/username/wali-kelas-digital.git

# 6. Upload (push) kode ke GitHub
git push -u origin main
```

---

### 📥 2. Cara Mengunduh (Clone) & Menjalankan Proyek dari GitHub

Jika Anda atau rekan tim mengunduh proyek ini dari repository GitHub:

#### Step A: Clone Repository
```bash
git clone https://github.com/username/wali-kelas-digital.git
cd wali-kelas-digital
```

#### Step B: Install Dependensi
```bash
npm install --legacy-peer-deps
```

#### Step C: Buat File Konfigurasi `.env`
Buat file baru bernama `.env` di direktori utama proyek, lalu isi kredensial Supabase Anda:
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

#### Step D: Jalankan Server Lokal
```bash
npm run dev
```
Akses di browser: `http://localhost:5173`

---

## 🗄️ Persiapan Database Supabase

1. Masuk ke [Dashboard Supabase](https://supabase.com/dashboard).
2. Pilih proyek Anda, lalu buka menu **SQL Editor** pada sidebar kiri.
3. Buka file [`supabase/schema.sql`](file:///c:/Users/Monk/Downloads/wali-kelas-digital/supabase/schema.sql) pada proyek ini, salin seluruh kodenya, lalu **Run** di SQL Editor Supabase untuk membuat tabel-tabel utama.
4. Buka file [`supabase/seed.sql`](file:///c:/Users/Monk/Downloads/wali-kelas-digital/supabase/seed.sql), salin kodenya, dan **Run** di SQL Editor untuk mengisi data contoh.

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

## ⚡ Menjalankan & Build Aplikasi

### Mode Pengembang (Development)
```bash
npm run dev
```

### Build Produksi (Production Build)
```bash
npm run build
```
Hasil build produksi yang siap di-deploy (Netlify/Vercel/Hosting) akan berada di folder `dist/`.

---

## 📜 Lisensi & Hak Cipta
&copy; Wali Kelas Digital. Dilindungi Undang-Undang.
