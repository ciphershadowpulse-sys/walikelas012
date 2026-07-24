import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { GraduationCap, Eye, EyeOff, Loader2, UserPlus, LogIn, KeyRound, MailCheck, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Toast, { ToastType } from '../components/Toast';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'password' | 'otp' | 'register'>('password');
  
  // Password Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Login State
  const [otpEmail, setOtpEmail] = useState('');
  const [otpStage, setOtpStage] = useState<'request' | 'verify'>('request');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
  
  const { signIn, signUp, sendOtp, verifyOtp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: any;
    if (otpStage === 'verify' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [otpStage, countdown]);

  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!otpEmail.trim()) {
      setError('Email harus diisi untuk menerima OTP');
      return;
    }

    setLoading(true);
    const result = await sendOtp(otpEmail);

    if (result.error) {
      setError(result.error);
    } else {
      setOtpStage('verify');
      setCountdown(60);
      setCanResend(false);
      setInfoMessage(`Kode OTP 6-Digit telah dikirimkan ke email ${otpEmail}. Silakan periksa inbox/spam email Anda.`);
    }
    setLoading(false);
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus to next box if digit typed
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newDigits = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pastedData.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const token = otpDigits.join('');
    if (token.length !== 6) {
      setError('Masukkan 6 digit kode OTP secara lengkap');
      return;
    }

    setLoading(true);
    const result = await verifyOtp(otpEmail, token);

    if (result.error) {
      setError(result.error);
    } else {
      setToast({ message: 'Verifikasi OTP berhasil!', type: 'success' });
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setError('');
    setLoading(true);
    const result = await sendOtp(otpEmail);
    if (result.error) {
      setError(result.error);
    } else {
      setCountdown(60);
      setCanResend(false);
      setToast({ message: 'Kode OTP baru berhasil dikirim ulang!', type: 'info' });
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
      setError('Email harus diisi');
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
      setActiveTab('password');
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
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setActiveTab('password'); setError(''); setInfoMessage(''); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                activeTab === 'password'
                  ? 'bg-white dark:bg-gray-900 text-primary-800 dark:text-primary-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Password
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('otp'); setError(''); setInfoMessage(''); setOtpStage('request'); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                activeTab === 'otp'
                  ? 'bg-white dark:bg-gray-900 text-primary-800 dark:text-primary-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              OTP 6-Digit
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setError(''); setInfoMessage(''); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-gray-900 text-primary-800 dark:text-primary-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Daftar
            </button>
          </div>

          {infoMessage && (
            <div className="mb-4 p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
              <MailCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">Informasi Kode OTP</p>
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

          {/* MODE 1: PASSWORD LOGIN */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Guru
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="masukkan email anda"
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
          )}

          {/* MODE 2: OTP 6-DIGIT LOGIN */}
          {activeTab === 'otp' && (
            <div>
              {otpStage === 'request' ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Kedinasan / Guru
                    </label>
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      className="input-field"
                      placeholder="masukkan email anda"
                      disabled={loading}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Kode OTP 6-Digit akan dikirimkan secara gratis ke email ini.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2 font-semibold shadow-lg shadow-primary-900/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mengirimkan Kode OTP...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Kirim Kode OTP (6 Digit)
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* VERIFY OTP STAGE */
                <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Masukkan 6 Digit Kode OTP untuk:</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{otpEmail}</p>
                  </div>

                  {/* 6 Digit OTP Inputs */}
                  <div className="flex items-center justify-center gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-11 h-13 text-center text-xl font-bold rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        disabled={loading}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join('').length !== 6}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 font-semibold shadow-lg shadow-primary-900/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memverifikasi OTP...
                      </>
                    ) : (
                      'Verifikasi Kode OTP & Masuk'
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setOtpStage('request')}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Ubah Email
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={!canResend || loading}
                      className={`flex items-center gap-1 font-semibold ${
                        canResend
                          ? 'text-primary-800 dark:text-primary-400 hover:underline cursor-pointer'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      {canResend ? 'Kirim Ulang OTP' : `Resend (${countdown}s)`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* MODE 3: REGISTER FORM */}
          {activeTab === 'register' && (
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
                  Email Kedinasan / Pribadi
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="input-field py-1.5 text-sm"
                  placeholder="nama.guru@sekolah.sch.id"
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
