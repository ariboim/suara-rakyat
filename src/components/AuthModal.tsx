import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, MapPin, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  onGoToWriteReport: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onGoToWriteReport,
  initialMode = 'signup',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isSuccessView, setIsSuccessView] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setIsSuccessView(false);
      setError('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Mohon masukkan nama lengkap Anda.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Mohon masukkan alamat email yang valid.');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = storageService.getUsers();
      const existing = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        setError('Email ini sudah terdaftar. Silakan pilih menu Masuk.');
        setLoading(false);
        return;
      }

      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'citizen',
        phone: phone.trim() || undefined,
        city: city.trim() || 'Indonesia',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=dc2626`,
        registeredAt: new Date().toISOString(),
      };

      storageService.saveUsers([...users, newUser]);
      storageService.setCurrentUser(newUser);
      setRegisteredUser(newUser);
      onSuccess(newUser);
      setLoading(false);
      setIsSuccessView(true);
      triggerCelebration();
    }, 400);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Mohon masukkan email Anda.');
      return;
    }
    if (!password) {
      setError('Mohon masukkan kata sandi.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const users = storageService.getUsers();
      const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

      if (found) {
        storageService.setCurrentUser(found);
        onSuccess(found);
        setLoading(false);
        onClose();
      } else {
        // Create quick account for ease of use
        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0],
          email: email.trim().toLowerCase(),
          role: 'citizen',
          registeredAt: new Date().toISOString(),
        };
        storageService.saveUsers([...users, newUser]);
        storageService.setCurrentUser(newUser);
        onSuccess(newUser);
        setLoading(false);
        onClose();
      }
    }, 350);
  };

  const handleQuickDemoLogin = (role: 'admin' | 'citizen') => {
    const users = storageService.getUsers();
    let target = users.find((u) => u.role === role);
    if (!target) {
      target = role === 'admin'
        ? {
            id: 'admin-quick',
            name: 'Redaktur Pelaksana (Admin)',
            email: 'admin@suararakyat.id',
            role: 'admin',
            registeredAt: new Date().toISOString(),
          }
        : {
            id: 'citizen-quick',
            name: 'Siti Rahmawati (Warga)',
            email: 'siti.rahma@gmail.com',
            role: 'citizen',
            registeredAt: new Date().toISOString(),
          };
    }
    storageService.setCurrentUser(target);
    onSuccess(target);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-rose-900 px-6 py-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-red-200">
              Portal Suara Rakyat
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {isSuccessView
              ? 'Selamat Bergabung!'
              : mode === 'signup'
              ? 'Daftar Akun Kontributor Warga'
              : 'Masuk ke Akun Anda'}
          </h2>
          <p className="text-xs text-red-100 mt-1">
            {isSuccessView
              ? 'Kini Anda dapat bersuara dan melaporkan fakta di sekitar Anda.'
              : 'Setiap pelapor berita wajib memiliki akun terverifikasi demi kejujuran informasi.'}
          </p>
        </div>

        {/* Content body */}
        <div className="p-6">
          {/* ===================== SUCCESS CELEBRATION VIEW ===================== */}
          {isSuccessView && registeredUser ? (
            <div className="text-center py-2 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Jurnalis Warga Terdaftar
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Selamat Bergabung, {registeredUser.name}!
                </h3>
                <p className="text-sm text-slate-600 mt-1.5">
                  Akun Anda dengan email <span className="font-semibold text-slate-800">{registeredUser.email}</span> telah aktif.
                  Aspirasi dan laporan fakta Anda sangat berharga bagi perubahan negeri.
                </p>
              </div>

              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 text-left text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Komitmen Privasi & Kurasi Berita:</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  • Berita yang Anda submit akan masuk meja redaksi admin untuk diverifikasi.
                  <br />
                  • <strong>Nomor WhatsApp Anda DIJAMIN RAHASIA</strong> dan tidak akan dipublikasikan ke publik.
                </p>
              </div>

              {/* LINK BUTTON: Masuk Dashboard Tulis Berita */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onGoToWriteReport();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 shadow-md shadow-red-600/20 active:scale-[0.98] transition-all cursor-pointer text-base"
                >
                  <span>Masuk Dashboard Tulis Berita</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={onClose}
                className="text-xs text-slate-600 hover:text-slate-800 underline underline-offset-2 transition-colors"
              >
                Atau jelajahi berita di Beranda terlebih dahulu
              </button>
            </div>
          ) : (
            /* ===================== FORM VIEW (SIGN UP / LOGIN) ===================== */
            <div>
              {/* Tab Selector */}
              <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-red-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Daftar Akun Baru (Sign Up)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-white text-red-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sudah Punya Akun (Masuk)
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={mode === 'signup' ? handleSignUp : handleLogin} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap / Nama Pena Pelapor *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Rian Anggara"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Email (Wajib Aktif) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 bg-slate-50/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 bg-slate-50/50"
                      required
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0812xxxx"
                          className="w-full pl-9 pr-2 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 bg-slate-50/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kota / Domisili
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Contoh: Surabaya"
                          className="w-full pl-9 pr-2 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 bg-slate-50/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-white bg-red-700 hover:bg-red-800 active:scale-[0.98] transition-all cursor-pointer shadow-sm text-sm"
                >
                  {loading
                    ? 'Memproses...'
                    : mode === 'signup'
                    ? 'Daftar Sekarang'
                    : 'Masuk ke Portal'}
                </button>
              </form>

              {/* Quick demo login shortcuts */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-[11px] text-center font-medium text-slate-400 mb-2">
                  Atau coba cepat akun demo:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('citizen')}
                    className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
                  >
                    👤 Demo Warga
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin')}
                    className="py-1.5 px-2.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 transition-colors"
                  >
                    🛡️ Demo Admin Redaksi
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
