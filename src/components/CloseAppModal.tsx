import React from 'react';
import { Power, RotateCcw, Newspaper, CheckCircle2, Heart } from 'lucide-react';

interface CloseAppModalProps {
  isOpen: boolean;
  isAppClosed: boolean;
  onCancel: () => void;
  onConfirmClose: () => void;
  onReopenApp: () => void;
}

export const CloseAppModal: React.FC<CloseAppModalProps> = ({
  isOpen,
  isAppClosed,
  onCancel,
  onConfirmClose,
  onReopenApp,
}) => {
  if (isAppClosed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 text-white animate-in fade-in duration-300">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-950/70 border border-red-800/60 flex items-center justify-center text-red-500 shadow-lg">
            <Power className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
              <Newspaper className="w-3.5 h-3.5 text-red-400" />
              Sesi Aplikasi Diistirahatkan
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Aplikasi Suara Rakyat Ditutup
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Terima kasih telah membaca dan berpartisipasi dalam jurnalisme publik terpercaya. Suara dan aspirasi Anda adalah penggerak perubahan bangsa.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-2 text-left">
            <div className="flex items-center gap-2 font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Status Data Terakhir:</span>
            </div>
            <p className="text-slate-400">
              Semua draf laporan berita warga dan status moderasi tersimpan dengan aman di penyimpanan lokal Anda.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={onReopenApp}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 shadow-lg shadow-red-700/30 active:scale-95 transition-all text-base cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Buka Kembali Aplikasi</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <span>Dikelola dengan integritas &</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>untuk rakyat Indonesia</span>
          </p>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
          <Power className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Tutup Aplikasi Suara Rakyat?
          </h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Apakah Anda yakin ingin keluar dari portal berita? Seluruh data laporan dan riwayat baca Anda tetap tersimpan dengan aman.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={onCancel}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirmClose}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
          >
            Ya, Tutup Aplikasi
          </button>
        </div>
      </div>
    </div>
  );
};
