# 🎓 Wali Kelas Digital

Sistem Manajemen & Presensi Wali Kelas Berbasis Web modern yang dibangun menggunakan **React 18**, **TypeScript**, **Tailwind CSS**, **Vite**, dan **Supabase**.

---

## 📌 Fitur Utama

- 🔑 **Otentikasi & Pendaftaran Akun (Daftar Akun)**: Fitur pendaftaran Wali Kelas baru (Nama Lengkap, NIP, Nama Kelas Binaan, Email, Password) yang otomatis terintegrasi ke Supabase Auth, data guru (`teachers`), data kelas (`classes`), dan profil (`profiles`).
- 📊 **Dashboard Interaktif**: Ringkasan statistik kehadiran siswa, grafik tren harian 7 hari terakhir, dan daftar siswa yang memerlukan perhatian wali kelas.
- 👥 **Data Siswa**: Manajemen master data siswa kelas binaan (NIS, NISN, Nama, JK, Alamat, No HP Ortu), pencarian instan, filter status, serta fitur *Tambah*, *Edit*, dan *Hapus* siswa.
- 👤 **Detail Siswa**: Informasi lengkap biodata siswa, riwayat absensi 30 hari terakhir, serta riwayat catatan perkembangan siswa.
- 📅 **Absensi Harian**: Input presensi kelas harian per tanggal (Hadir, Sakit, Izin, Alpa, Terlambat) dengan opsi *Tandai Semua Hadir* dan alasan perbaikan.
- 📋 **Rekap Absensi**: Laporan rekapitulasi kehadiran dalam format **Harian** dan **Bulanan** lengkap dengan statistik akumulasi per siswa.
- 📝 **Catatan Siswa**: Jurnal pencatatan perkembangan siswa (Akademik, Sikap, Kedisiplinan, Sosial, Prestasi, Pendampingan) beserta status tindak lanjut (*Belum -> Sedang Ditindaklanjuti -> Selesai*).
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

## 🐙 Panduan GitHub & Pemasangan

### 📥 1. Cara Mengunduh (Clone) & Menjalankan Proyek dari GitHub

```bash
# 1. Clone repository
git clone https://github.com/username/wali-kelas-digital.git
cd wali-kelas-digital

# 2. Install dependensi
npm install --legacy-peer-deps

# 3. Jalankan server lokal
npm run dev
```

Akses di browser: `http://localhost:5173`

---

## 🔑 Pendaftaran & Akun Wali Kelas

Anda memiliki 2 cara untuk mendaftarkan / menggunakan akun Wali Kelas:

1. **Form Pendaftaran Akun di Halaman Login**:
   - Buka halaman Login aplikasi.
   - Klik tab **Daftar Akun**.
   - Isi Nama Lengkap Guru, NIP, Nama Kelas Binaan (contoh: `XII-A`), Email, dan Password.
   - Klik **Daftar Akun Wali Kelas**. Akun akan otomatis terdaftar dan dapat langsung digunakan!

2. **Manual via Supabase Dashboard**:
   - Buka Supabase Dashboard > **Authentication** > **Users** > **Add User**.
   - Daftarkan email dan password.

---

## 📜 Lisensi & Hak Cipta
&copy; Wali Kelas Digital. Dilindungi Undang-Undang.
