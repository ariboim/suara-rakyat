import React, { useState, useEffect } from 'react';
import { Newspaper, Bell, User as UserIcon, ShieldAlert, LogOut, Sparkles, Flame, CheckCircle, ChevronDown, PenSquare, Home } from 'lucide-react';
import { User, ActiveView, NewsArticle } from '../types';

interface HeaderProps {
  currentUser: User | null;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onSwitchRole: (targetRole: 'admin' | 'citizen') => void;
  pendingReportsCount: number;
  breakingArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onWriteNews?: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeView,
  onSelectView,
  onOpenAuth,
  onLogout,
  onSwitchRole,
  pendingReportsCount,
  breakingArticles,
  onSelectArticle,
  onWriteNews,
  onGoHome,
}) => {
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [activeBreakingIndex, setActiveBreakingIndex] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Indonesian date and clock formatting
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
      setCurrentTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle breaking news ticker
  useEffect(() => {
    if (breakingArticles.length <= 1) return;
    const ticker = setInterval(() => {
      setActiveBreakingIndex((prev) => (prev + 1) % breakingArticles.length);
    }, 4500);
    return () => clearInterval(ticker);
  }, [breakingArticles.length]);

  const currentBreaking = breakingArticles[activeBreakingIndex] || breakingArticles[0];

  return (
    <header className="bg-white border-b border-slate-200">
      {/* Topmost Editorial Info Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">{currentDateStr}</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-amber-400">{currentTimeStr}</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">Edisi Nasional & Nusantara</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Verifikasi Independen Anti-Hoaks</span>
            </div>

            {/* Quick Demo Switcher Pill */}
            <div className="flex items-center gap-1 bg-slate-800/90 rounded-full px-2 py-0.5 border border-slate-700">
              <span className="text-[10px] text-slate-400">Mode Uji:</span>
              <button
                onClick={() => onSwitchRole('citizen')}
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                  currentUser?.role === 'citizen'
                    ? 'bg-red-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Warga
              </button>
              <button
                onClick={() => onSwitchRole('admin')}
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                  currentUser?.role === 'admin'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Admin Redaksi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Masthead / Logo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div
            onClick={() => {
              if (onGoHome) {
                onGoHome();
              } else {
                onSelectView('home');
              }
            }}
            className="flex items-center gap-3.5 cursor-pointer group text-center md:text-left select-none"
            role="button"
            tabIndex={0}
            title="Kembali ke Halaman Depan Suara Rakyat"
          >
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-rose-900 flex items-center justify-center text-white shadow-md shadow-red-700/20 group-hover:scale-105 transition-transform">
              <Newspaper className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-editorial uppercase">
                  SUARA RAKYAT
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-700 text-white shadow-xs">
                  Portal Warga
                </span>
              </div>
              <p className="text-xs text-slate-600 tracking-wide font-medium mt-0.5">
                Menyuarakan Kebenaran • Mengawal Aspirasi & Fakta dari Warga untuk Bangsa
              </p>
            </div>
          </div>

          {/* User Profile / Auth Actions & Navigation Shortcuts */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-end">
            {/* Quick Home button */}
            <button
              type="button"
              onClick={() => {
                if (onGoHome) {
                  onGoHome();
                } else {
                  onSelectView('home');
                }
              }}
              title="Kembali ke Halaman Depan (Home)"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-800 hover:bg-slate-100 hover:text-red-700 active:scale-95 transition-all cursor-pointer border border-slate-300 shadow-2xs"
            >
              <Home className="w-4 h-4 text-red-600" />
              <span>Home</span>
            </button>

            {/* Quick Tulis Berita button */}
            <button
              onClick={() => {
                if (onWriteNews) {
                  onWriteNews();
                } else if (!currentUser) {
                  onOpenAuth('signup');
                } else {
                  onSelectView('report');
                }
              }}
              title="Tulis Berita Warga Baru"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tulis Berita</span>
              <span className="sm:hidden">Tulis</span>
            </button>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 transition-all cursor-pointer shadow-xs"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {currentUser.role === 'admin' ? '🛡️ Admin Redaksi' : '✍️ Kontributor Warga'}
                    </p>
                  </div>
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}&backgroundColor=dc2626`}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700">
                        {currentUser.role === 'admin' ? 'Akses Admin Moderator' : 'Akun Jurnalis Warga'}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onGoHome) {
                            onGoHome();
                          } else {
                            onSelectView('home');
                          }
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Home className="w-3.5 h-3.5 text-red-600" />
                        <span>Halaman Depan (Home)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onWriteNews) {
                            onWriteNews();
                          } else {
                            onSelectView('report');
                          }
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <PenSquare className="w-3.5 h-3.5 text-red-600" />
                        <span>Tulis Berita Baru</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSelectView('dashboard');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>Laporan Saya & Riwayat</span>
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onSelectView('admin');
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-amber-900 bg-amber-50/60 hover:bg-amber-100/60 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                            <span>Meja Redaksi Admin</span>
                          </div>
                          {pendingReportsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-bold">
                              {pendingReportsCount}
                            </span>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Akun (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Masuk Akun
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Daftar Warga</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breaking News Ticker */}
      {currentBreaking && (
        <div className="bg-red-50 border-y border-red-200/80 text-xs py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-700 text-white font-extrabold text-[11px] uppercase tracking-wider shrink-0 shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Warta Kilat</span>
            </div>

            <div
              onClick={() => onSelectArticle(currentBreaking)}
              className="truncate text-slate-800 hover:text-red-700 cursor-pointer transition-colors flex-1 font-medium"
            >
              <span className="font-bold text-red-900 mr-2">[{currentBreaking.category}]:</span>
              {currentBreaking.title}
            </div>

            <span className="text-[11px] text-slate-600 hidden md:inline shrink-0">
              Pelapor: {currentBreaking.reporterName}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
