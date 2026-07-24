import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { GraduationCap, Eye, EyeOff, Loader2, UserPlus, LogIn, MailCheck, AlertCircle } from 'lucide-react';
import Toast, { ToastType } from '../components/Toast';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form state
  const [regFullName, setRegFullName] = useState('');
  const [regNip, setRegNip] = useState('');
  const [regClassName, setRegClassName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [error, setError] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    if (!email.trim()) {
      setError('Email harus diisi');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Password harus diisi');
      setLoading(false);
      return;
    }

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/dashboard', { replace: true });
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!regFullName.trim()) {
      setError('Nama lengkap wali kelas harus diisi');
      return;
    }

    if (!regClassName.trim()) {
      setError('Nama kelas binaan harus diisi (contoh: XII-A / X-1)');
      return;
    }

    if (!regEmail.trim()) {
      setError('Email pribadi harus diisi');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    const result = await signUp({
      fullName: regFullName,
      nip: regNip,
      email: regEmail,
      password: regPassword,
      className: regClassName,
    });

    if (result.error) {
      setError(result.error);
    } else if (result.requireConfirmation) {
      setInfoMessage('Pendaftaran Berhasil! Silakan periksa inbox/spam email Anda untuk verifikasi.');
      setActiveTab('login');
      setEmail(regEmail);
      setPassword(regPassword);
    } else {
      setToast({ message: 'Akun Wali Kelas berhasil terdaftar!', type: 'success' });
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    }
    setLoading(false);
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-slate-950 p-4 relative overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Decorative Blur Backgrounds */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 my-8">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-3 border border-white/20 shadow-2xl">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Wali Kelas Digital</h1>
          <p className="text-primary-200 mt-1 text-sm font-medium">Sistem Presensi & Manajemen Wali Kelas</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20 dark:border-gray-800">
          
          {/* Tabs Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); setInfoMessage(''); }}
              className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-gray-900 text-primary-800 dark:text-primary-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setError(''); setInfoMessage(''); }}
              className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-gray-900 text-primary-800 dark:text-primary-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Daftar Akun
            </button>
          </div>

          {infoMessage && (
            <div className="mb-4 p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
              <MailCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">Informasi Akun</p>
                <p className="leading-relaxed">{infoMessage}</p>
              </div>
            </div>
          )}

          {error && typeof error === 'string' && error.trim() !== '' && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Pribadi
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="masukkan email pribadi anda"
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2 font-semibold shadow-lg shadow-primary-900/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk ke Sistem'
                )}
              </button>
            </form>
          ) : (
            /* TAB 2: REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Lengkap Guru & Gelar
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="input-field py-1.5 text-sm"
                  placeholder="Contoh: Dra. Siti Rahmawati, M.Pd."
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    NIP / NUPTK
                  </label>
                  <input
                    type="text"
                    value={regNip}
                    onChange={(e) => setRegNip(e.target.value)}
                    className="input-field py-1.5 text-sm"
                    placeholder="19800101..."
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Nama Kelas Binaan
                  </label>
                  <input
                    type="text"
                    value={regClassName}
                    onChange={(e) => setRegClassName(e.target.value)}
                    className="input-field py-1.5 text-sm"
                    placeholder="XII-A"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Pribadi
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="input-field py-1.5 text-sm"
                  placeholder="email.pribadi@gmail.com"
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="input-field py-1.5 text-sm pr-8"
                      placeholder="Min. 6 karakter"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Konfirmasi Password
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="input-field py-1.5 text-sm"
                    placeholder="Ulangi password"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2 font-semibold shadow-lg shadow-primary-900/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mendaftarkan Akun...
                  </>
                ) : (
                  'Daftar Akun Wali Kelas'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          &copy; {new Date().getFullYear()} Wali Kelas Digital. All rights reserved.
        </p>
      </div>
    </div>
  );
}
