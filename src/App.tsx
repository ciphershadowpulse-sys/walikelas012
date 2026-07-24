import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataSiswa from './pages/DataSiswa';
import DetailSiswa from './pages/DetailSiswa';
import AbsensiHarian from './pages/AbsensiHarian';
import RekapAbsensi from './pages/RekapAbsensi';
import CatatanSiswa from './pages/CatatanSiswa';
import Pengumuman from './pages/Pengumuman';
import Laporan from './pages/Laporan';
import Profil from './pages/Profil';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/data-siswa" element={<DataSiswa />} />
            <Route path="/data-siswa/:id" element={<DetailSiswa />} />
            <Route path="/absensi-harian" element={<AbsensiHarian />} />
            <Route path="/rekap-absensi" element={<RekapAbsensi />} />
            <Route path="/catatan-siswa" element={<CatatanSiswa />} />
            <Route path="/pengumuman" element={<Pengumuman />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/profil" element={<Profil />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
