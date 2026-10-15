import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Newspaper,
  Bell,
  User as UserIcon,
  ShieldAlert,
  LogOut,
  Sparkles,
  Flame,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  PenSquare,
  Home,
  Volume2,
  VolumeX,
  ArrowRight,
} from 'lucide-react';
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
  recentApprovedArticles?: NewsArticle[];
  unreadNotificationsCount?: number;
  onClearNotifications?: () => void;
  onSimulateApprovedToast?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
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
  recentApprovedArticles = [],
  unreadNotificationsCount = 0,
  onClearNotifications,
  onSimulateApprovedToast,
  soundEnabled = true,
  onToggleSound,
}) => {
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [activeBreakingIndex, setActiveBreakingIndex] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform shrink-0 border-2 border-amber-500/60 bg-gradient-to-br from-red-700 to-red-950 p-0.5">
              <img
                src="/favicon.svg"
                alt="Logo Resmi Suara Rakyat"
                className="w-full h-full object-contain"
                width="56"
                height="56"
              />
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
            {/* Quick Install App button */}
            <a
              href="https://www.google.com/url?sa=E&q=https%3A%2F%2Fgithub.com%2Fariboim%2Fsuara-rakyat%2Freleases%2Flatest%2Fdownload%2Fapp-debug.apk"
              target="_blank"
              rel="noopener noreferrer"
              title="Install Aplikasi Android Suara Rakyat (Unduh APK Langsung)"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-95 transition-all shadow-xs cursor-pointer border border-emerald-500/50"
            >
              <Download className="w-4 h-4 text-emerald-100" />
              <span>Install App</span>
            </a>

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

            {/* Notification Bell (Notifikasi Berita Terverifikasi Redaksi) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsUserMenuOpen(false);
                  if (unreadNotificationsCount > 0 && onClearNotifications) {
                    onClearNotifications();
                  }
                }}
                title="Notifikasi Berita Baru Disetujui"
                className="relative inline-flex items-center justify-center p-2 rounded-xl text-slate-800 bg-white hover:bg-slate-100 hover:text-red-700 active:scale-95 transition-all cursor-pointer border border-slate-300 shadow-2xs"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-600 text-[9px] sm:text-[10px] font-black text-white ring-2 ring-white animate-pulse">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                          Notifikasi Berita Baru
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Artikel disetujui redaksi & siap dibaca
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onToggleSound && (
                        <button
                          type="button"
                          onClick={onToggleSound}
                          title={soundEnabled ? 'Matikan suara notifikasi' : 'Nyalakan suara notifikasi'}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          {soundEnabled ? (
                            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      )}
                      {onSimulateApprovedToast && (
                        <button
                          type="button"
                          onClick={() => {
                            onSimulateApprovedToast();
                            setIsNotificationsOpen(false);
                          }}
                          className="text-[10px] font-bold px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                          title="Simulasikan notifikasi toast artikel baru disetujui"
                        >
                          ⚡ Tes Toast
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 px-2 py-1">
                    {recentApprovedArticles && recentApprovedArticles.length > 0 ? (
                      recentApprovedArticles.map((art) => (
                        <div
                          key={art.id}
                          className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors flex gap-2.5 items-start group"
                        >
                          {art.imageUrl ? (
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                              <Newspaper className="w-5 h-5" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {art.category}
                            </span>
                            <h5 className="font-serif font-bold text-xs text-slate-900 line-clamp-2 mt-1 group-hover:text-red-700 transition-colors">
                              {art.title}
                            </h5>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                              Oleh {art.reporterName} • {art.location}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onSelectArticle(art);
                              setIsNotificationsOpen(false);
                            }}
                            className="shrink-0 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs self-center cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Baca</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-500">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-1.5" />
                        <p className="text-xs font-semibold text-slate-700">Belum ada notifikasi baru</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Ketika admin menyetujui artikel baru, notifikasi toast akan muncul otomatis.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
