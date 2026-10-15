import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Globe,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

interface InstallApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
}

export const InstallApkModal: React.FC<InstallApkModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'apk' | 'pwa'>('apk');
  const [copiedLink, setCopiedLink] = useState(false);

  // GitHub Release details for the user's repository
  const githubRepoUrl = 'https://github.com/ariboim/suara-rakyat';
  const githubReleasesUrl = 'https://github.com/ariboim/suara-rakyat/releases';
  const directApkUrl = 'https://www.google.com/url?sa=E&q=https%3A%2F%2Fgithub.com%2Fariboim%2Fsuara-rakyat%2Freleases%2Flatest%2Fdownload%2Fapp-debug.apk';

  const handleCopyApkLink = () => {
    navigator.clipboard.writeText(directApkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        onClose();
      }
    } else {
      alert(
        'Untuk memasang aplikasi langsung di browser Chrome/Android:\n1. Ketuk ikon titik tiga (⋮) di pojok kanan atas browser\n2. Pilih "Instal aplikasi" atau "Tambahkan ke Layar Utama"\n3. Aplikasi Suara Rakyat dengan ikon resmi akan terpasang di HP Anda!'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-50 via-slate-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-700 text-white flex items-center justify-center shadow-md shadow-red-700/25 shrink-0 overflow-hidden border border-red-300">
              <img
                src="/favicon.svg"
                alt="Logo Suara Rakyat"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 id="install-modal-title" className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span>Pasang Aplikasi Suara Rakyat</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Android APK
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Akses cepat, notifikasi berita warga, & verifikasi fakta anti-hoaks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Tutup dialog pasang aplikasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'apk'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Unduh File APK (GitHub)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pwa')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Pasang Cepat di Browser (PWA)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeTab === 'apk' ? (
            <div className="space-y-4">
              {/* Primary Download Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                        Direct APK Release
                      </span>
                      <h4 className="text-base sm:text-lg font-bold mt-1">
                        Unduh app-debug.apk
                      </h4>
                      <p className="text-xs text-red-100">
                        Sumber Resmi: GitHub @ariboim/suara-rakyat
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                      href={directApkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-red-700 hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 text-center"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh app-debug.apk Sekarang</span>
                    </a>

                    <a
                      href={githubReleasesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-800/80 hover:bg-red-800 text-white font-semibold text-xs border border-white/20 transition-all text-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Halaman Rilis GitHub</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Direct Link Copier */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Tautan Langsung APK:</span>
                  <button
                    type="button"
                    onClick={handleCopyApkLink}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 hover:text-red-800 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Tautan Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-600 truncate select-all">
                  {directApkUrl}
                </div>
              </div>

              {/* Step-by-Step Installation Guide for Android */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                    !
                  </div>
                  <h5 className="text-xs font-bold text-amber-950">
                    Panduan Memasang debug.apk di HP Android:
                  </h5>
                </div>

                <ol className="text-xs text-amber-900/90 space-y-2 list-decimal list-inside pl-1">
                  <li className="leading-relaxed">
                    <strong className="text-slate-900">Buka file yang diunduh:</strong> Setelah selesai mengunduh <span className="font-mono font-bold">app-debug.apk</span>, ketuk file tersebut dari bar notifikasi atau folder <span className="font-semibold">Download</span>.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-slate-900">Izinkan Sumber Tidak Dikenal:</strong> Jika muncul pesan <em>"Demi keamanan, ponsel Anda tidak diizinkan memasang aplikasi tidak dikenal"</em>, ketuk <strong className="text-slate-900">Setelan (Settings)</strong> lalu aktifkan <strong className="text-emerald-700">"Izinkan dari sumber ini"</strong>.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-slate-900">Peringatan Google Play Protect:</strong> Karena berformat <em>debug APK</em> dari repositori GitHub, jika muncul pesan <em>"Aplikasi tidak dikenal / Unrecognized app"</em>, pilih <strong className="text-red-700">"Info selengkapnya"</strong> lalu ketuk <strong className="text-red-700">"Tetap instal (Install anyway)"</strong>.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-slate-900">Selesai!</strong> Ikon Suara Rakyat akan muncul di layar ponsel dan aplikasi siap digunakan.
                  </li>
                </ol>
              </div>

              {/* Security info */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  File APK berasal langsung dari kompilasi GitHub Actions resmi repositori <span className="font-semibold text-slate-800">suara-rakyat</span> tanpa modifikasi pihak ketiga.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* PWA Direct Installation Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                      Web App / PWA Resmi
                    </span>
                    <h4 className="text-base sm:text-lg font-bold mt-1">
                      Pasang Tanpa Download File APK
                    </h4>
                    <p className="text-xs text-emerald-100">
                      Irit memori, otomatis terbarui, dan langsung berlogo resmi
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePwaInstall}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-emerald-800 hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Pasang Aplikasi Suara Rakyat ke Layar Utama</span>
                </button>
              </div>

              {/* Instructions for Browser Menu */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Cara Pasang Manual lewat Google Chrome Android:</span>
                </h5>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                  <li>Buka website ini di Google Chrome pada ponsel Android Anda.</li>
                  <li>Ketuk tombol menu titik tiga (<strong className="text-slate-900">⋮</strong>) di sudut kanan atas.</li>
                  <li>Pilih menu <strong className="text-slate-900">"Instal aplikasi"</strong> atau <strong className="text-slate-900">"Tambahkan ke Layar Utama" (Add to Home screen)</strong>.</li>
                  <li>Ketuk <strong className="text-emerald-700">"Instal"</strong>. Ikon resmi Suara Rakyat akan langsung muncul di beranda ponsel!</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Metode ini tidak memerlukan izin file debug APK atau setelan sumber tidak dikenal.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <a
            href={githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-600 hover:text-red-700 font-medium"
          >
            <span>GitHub: ariboim/suara-rakyat</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
