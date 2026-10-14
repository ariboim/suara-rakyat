import React from 'react';
import { Home, ChevronLeft, ChevronRight, RotateCcw, Power, PenSquare, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface NavigationToolbarProps {
  onGoHome: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onRefresh: () => void;
  onCloseApp: () => void;
  onWriteReport: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  currentPage: number;
  totalPages: number;
  isRefreshing: boolean;
  lastUpdatedText: string;
  currentUser: User | null;
  onOpenAdmin?: () => void;
  pendingCount?: number;
}

export const NavigationToolbar: React.FC<NavigationToolbarProps> = ({
  onGoHome,
  onPrevPage,
  onNextPage,
  onRefresh,
  onCloseApp,
  onWriteReport,
  canGoPrev,
  canGoNext,
  currentPage,
  totalPages,
  isRefreshing,
  lastUpdatedText,
  currentUser,
  onOpenAdmin,
  pendingCount = 0,
}) => {
  return (
    <aside aria-label="Bilah Navigasi Kontrol" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Action Navigation Buttons required by user */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            {/* Ke Home */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onGoHome();
              }}
              title="Kembali ke Halaman Depan / Beranda Utama"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-800 bg-white hover:bg-slate-100 hover:text-red-700 active:scale-95 transition-all cursor-pointer border border-slate-300 shadow-2xs"
            >
              <Home className="w-4 h-4 text-red-600" />
              <span>Ke Home</span>
            </button>

            {/* Halaman Sebelumnya */}
            <button
              onClick={onPrevPage}
              disabled={!canGoPrev}
              title="Buka halaman sebelumnya"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                canGoPrev
                  ? 'text-slate-700 bg-white hover:bg-slate-50 border-slate-300 active:scale-95 cursor-pointer shadow-xs'
                  : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Halaman</span> Sebelumnya
            </button>

            {/* Page indicator pill */}
            <span className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md border border-slate-200 hidden md:inline-flex items-center">
              Hal {currentPage} dari {Math.max(1, totalPages)}
            </span>

            {/* Halaman Berikutnya */}
            <button
              onClick={onNextPage}
              disabled={!canGoNext}
              title="Buka halaman berikutnya"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                canGoNext
                  ? 'text-slate-700 bg-white hover:bg-slate-50 border-slate-300 active:scale-95 cursor-pointer shadow-xs'
                  : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <span className="hidden sm:inline">Halaman</span> Berikutnya
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Refresh Berita */}
            <button
              onClick={onRefresh}
              title="Refresh / Muat Ulang Berita Terbaru"
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer border border-emerald-200"
            >
              <RotateCcw className={`w-4 h-4 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Right section: Tulis Berita CTA + Admin Link + Tutup Aplikasi */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Last update time note */}
            <span className="text-xs text-slate-600 hidden lg:inline-block">
              Update: <span className="font-medium text-slate-700">{lastUpdatedText}</span>
            </span>

            {/* Admin Desk shortcut if admin or quick review */}
            {currentUser?.role === 'admin' && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Meja Redaksi</span>
                {pendingCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* Tulis Berita Primary Button */}
            <button
              onClick={onWriteReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-bold text-white bg-red-700 hover:bg-red-800 active:scale-95 shadow-xs transition-all cursor-pointer"
            >
              <PenSquare className="w-4 h-4" />
              <span>Tulis Berita</span>
            </button>

            {/* Tutup Aplikasi Button (Required) */}
            <button
              onClick={onCloseApp}
              title="Keluar / Tutup Aplikasi"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 transition-all border border-rose-200 cursor-pointer"
            >
              <Power className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Tutup</span> Aplikasi
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
