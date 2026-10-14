import React from 'react';
import { Newspaper, ShieldCheck, Lock, Heart, ArrowUp } from 'lucide-react';
import { NewsCategory } from '../types';

interface FooterProps {
  onSelectCategory: (category: NewsCategory) => void;
  onGoHome: () => void;
  onOpenReportModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onGoHome,
  onOpenReportModal,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories: NewsCategory[] = [
    'Infrastruktur & Layanan',
    'Sosial & Budaya',
    'Ekonomi & Pasar',
    'Politik & Hukum',
    'Lingkungan & Bencana',
    'Pendidikan',
    'Kesehatan',
    'Cerpen (Cerita Pendek)',
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div
              onClick={onGoHome}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
                <Newspaper className="w-4 h-4" />
              </div>
              <span className="font-editorial font-black text-xl text-white uppercase tracking-wider">
                SUARA RAKYAT
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Portal berita independen berbasis jurnalisme warga. Memberi ruang bagi suara publik dari seluruh pelosok Nusantara untuk menyampaikan kebenaran dan mengawal kebijakan.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-700 hover:bg-red-800 transition-colors shadow-xs"
              >
                <span>Tulis Berita Warga</span>
              </button>
            </div>
          </div>

          {/* Kategori Berita */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Kategori Rubrik
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      scrollToTop();
                    }}
                    className="hover:text-red-400 transition-colors cursor-pointer text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Pedoman & Keamanan Informasi */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Integritas & Privasi</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px]">
                <div className="flex items-center gap-1 text-slate-200 font-semibold mb-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Kerahasiaan WhatsApp</span>
                </div>
                Nomor kontak pelapor dijamin 100% rahasia, hanya digunakan tim redaksi untuk verifikasi keabsahan fakta sebelum disetujui tayang.
              </div>
              <p>
                Seluruh berita yang tayang telah melalui proses kurasi ketat redaksi untuk menepis disinformasi dan ujaran kebencian.
              </p>
            </div>
          </div>

          {/* Kontak Meja Redaksi */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Meja Redaksi Suara Rakyat
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p>Gedung Aspirasi Publik Lt. 4</p>
              <p>Jl. Merdeka Nusantara No. 45, Jakarta</p>
              <p className="text-slate-300 font-mono pt-1">redaksi@suararakyat.id</p>
              <p className="text-slate-400 font-mono">Layanan Redaksi: +62 21 5567 8900</p>
              <div className="pt-2">
                <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  ● Dewan Pers Terverifikasi
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 Portal Berita Suara Rakyat. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Dibuat dengan dedikasi untuk jurnalisme warga
              <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
            </span>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Kembali ke atas"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
