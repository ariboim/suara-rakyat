import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Link as LinkIcon,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  Mail,
  Sparkles,
  Globe,
} from 'lucide-react';
import { NewsArticle } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
  onShared?: (platform: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  article,
  onShared,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [copiedType, setCopiedType] = useState<'short' | 'full'>('short');

  if (!isOpen || !article) return null;

  const shortCode = article.id.replace('art-', '');
  const baseUrl = window.location.origin + window.location.pathname;
  const shortUrl = `${baseUrl}?s=${shortCode}`;
  const fullUrl = `${baseUrl}?articleId=${article.id}`;

  const shareTextSummary = `📢 *[SUARA RAKYAT - Jurnalisme Warga]*\n\n*${article.title}*\n\n📌 *Kategori:* ${article.category}\n👤 *Sumber/Pelapor:* ${article.reporterName}\n📍 *Lokasi:* ${article.location}\n\n🔗 *Baca Berita Lengkap:* ${shortUrl}`;

  const handleCopyLink = (type: 'short' | 'full' = 'short') => {
    const targetUrl = type === 'short' ? shortUrl : fullUrl;
    navigator.clipboard.writeText(targetUrl);
    setCopiedType(type);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    if (onShared) onShared('copy');
  };

  const sharePlatforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      desc: 'Kirim ke chat pribadi atau grup WA',
      icon: MessageCircle,
      bgColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'Populer',
      action: () => {
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTextSummary)}`,
          '_blank'
        );
        if (onShared) onShared('whatsapp');
      },
    },
    {
      id: 'facebook',
      name: 'Facebook',
      desc: 'Bagikan ke beranda atau grup FB',
      icon: Facebook,
      bgColor: 'bg-[#1877F2] hover:bg-[#0c63d4] text-white',
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}&quote=${encodeURIComponent(`[SUARA RAKYAT] ${article.title}`)}`,
          '_blank',
          'noopener,noreferrer'
        );
        if (onShared) onShared('facebook');
      },
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      desc: 'Kirim cuitan berita ke linimasa',
      icon: Twitter,
      bgColor: 'bg-slate-900 hover:bg-black text-white',
      action: () => {
        const tweetText = `📢 ${article.title}\n\nLaporan warga dari ${article.location} via @SuaraRakyatID #JurnalismeWarga #${article.category.replace(/[\s&]+/g, '')}`;
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(tweetText)}`,
          '_blank',
          'noopener,noreferrer'
        );
        if (onShared) onShared('twitter');
      },
    },
    {
      id: 'telegram',
      name: 'Telegram',
      desc: 'Kirim ke channel atau grup Telegram',
      icon: Send,
      bgColor: 'bg-[#229ED9] hover:bg-[#1d8bc0] text-white',
      action: () => {
        const teleText = `📢 *${article.title}*\n\n📌 Kategori: ${article.category}\n📍 Lokasi: ${article.location}\n\nBaca selengkapnya di Suara Rakyat:`;
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(teleText)}`,
          '_blank',
          'noopener,noreferrer'
        );
        if (onShared) onShared('telegram');
      },
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      desc: 'Bagikan ke jejaring profesional',
      icon: Linkedin,
      bgColor: 'bg-[#0A66C2] hover:bg-[#084e96] text-white',
      action: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}`,
          '_blank',
          'noopener,noreferrer'
        );
        if (onShared) onShared('linkedin');
      },
    },
    {
      id: 'email',
      name: 'Email',
      desc: 'Kirim rilis berita via surat elektronik',
      icon: Mail,
      bgColor: 'bg-slate-700 hover:bg-slate-800 text-white',
      action: () => {
        const subject = `[Suara Rakyat] ${article.title}`;
        const body = `Halo,\n\nSaya ingin membagikan laporan berita warga dari Portal Suara Rakyat:\n\n"${article.title}"\nKategori: ${article.category}\nLokasi: ${article.location}\nSumber: ${article.reporterName}\n\nBaca artikel selengkapnya di portal resmi:\n${shortUrl}\n\nSalam,\nSuara Rakyat - Suara Fakta Dari Warga`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        if (onShared) onShared('email');
      },
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `[Suara Rakyat] ${article.title}`,
          text: `Baca laporan warga "${article.title}" di Portal Suara Rakyat:`,
          url: shortUrl,
        });
        if (onShared) onShared('native');
        onClose();
      } catch {
        // User dismissed native sheet
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="share-modal-title" className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>Bagikan Berita</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                  Medsos & Chat
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Sebarkan fakta jurnalisme warga ke media sosial dan jejaring Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Tutup dialog bagikan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body - scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Article Snippet */}
          <div className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex gap-3 items-center">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                {article.category}
              </span>
              <h4 className="font-serif font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 mt-1">
                {article.title}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                Sumber: {article.reporterName} • {article.location}
              </p>
            </div>
          </div>

          {/* Social Platforms Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-red-600" />
                Pilih Platform Media Sosial:
              </span>
              <span className="text-[11px] text-slate-400">Langsung Buka Aplikasi</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {sharePlatforms.map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={platform.action}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all active:scale-95 shadow-xs cursor-pointer ${platform.bgColor}`}
                  >
                    {platform.badge && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full uppercase">
                        {platform.badge}
                      </span>
                    )}
                    <IconComponent className="w-6 h-6 mb-1.5" />
                    <span className="text-xs font-bold">{platform.name}</span>
                    <span className="text-[9px] opacity-80 line-clamp-1 text-center mt-0.5">
                      {platform.desc.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Native Share button if supported on mobile/desktop */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <ExternalLink className="w-4 h-4 text-slate-600" />
              <span>Gunakan Menu Berbagi Bawaan Perangkat (Android/iOS)</span>
            </button>
          )}

          {/* Copy Links Section */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                Tautan Berita Portal:
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Dapat Langsung Diakses
              </span>
            </div>

            {/* Short URL Box with Copy Button */}
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-[10px] font-bold shrink-0">
                SHORT LINK
              </div>
              <input
                type="text"
                readOnly
                value={shortUrl}
                className="flex-1 bg-transparent text-xs text-slate-700 font-mono focus:outline-none select-all truncate"
              />
              <button
                type="button"
                onClick={() => handleCopyLink('short')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isCopied && copiedType === 'short'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs'
                }`}
              >
                {isCopied && copiedType === 'short' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* Success alert */}
            {isCopied && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Link ringkas berhasil disalin! Tinggal tempel (paste) di status Facebook, bio Instagram, grup chat, atau pesan langsung.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">
            Portal Berita Warga Terverifikasi • Bebas Hoaks
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
