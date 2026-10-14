import React, { useState } from 'react';
import { X, Calendar, MapPin, User, Eye, ThumbsUp, Lightbulb, HeartHandshake, Share2, MessageSquare, CheckCircle, ShieldCheck, ChevronLeft, ChevronRight, Copy, Check, MessageCircle, Link as LinkIcon, ExternalLink, Home, PenSquare } from 'lucide-react';
import { NewsArticle, User as UserType } from '../types';
import { storageService } from '../services/storageService';

interface ArticleDetailModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  onPrevArticle?: () => void;
  onNextArticle?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentUser: UserType | null;
  onRequireAuth: () => void;
  onArticleUpdated: (updated: NewsArticle) => void;
  onWriteNews?: () => void;
  onGoHome?: () => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  onPrevArticle,
  onNextArticle,
  hasPrev = false,
  hasNext = false,
  currentUser,
  onRequireAuth,
  onArticleUpdated,
  onWriteNews,
  onGoHome,
}) => {
  const [commentContent, setCommentContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [hasReacted, setHasReacted] = useState<Record<string, boolean>>({});
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!article) return null;

  const handleReaction = (type: 'setuju' | 'penting' | 'prihatin' | 'bagikan') => {
    if (hasReacted[type]) return;
    const updated = storageService.addReaction(article.id, type);
    if (updated) {
      setHasReacted({ ...hasReacted, [type]: true });
      onArticleUpdated(updated);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    const updated = storageService.addComment(article.id, {
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorEmail: currentUser.email,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      content: commentContent.trim(),
    });

    if (updated) {
      setCommentContent('');
      onArticleUpdated(updated);
    }
  };

  const handleLikeComment = (commentId: string) => {
    const updated = storageService.likeComment(article.id, commentId);
    if (updated) {
      onArticleUpdated(updated);
    }
  };

  const openReportModal = (commentId: string) => {
    setReportingCommentId(commentId);
  };

  const handleConfirmReport = (reason: string) => {
    if (reportingCommentId) {
      const updated = storageService.reportComment(article.id, reportingCommentId, reason);
      if (updated) {
        onArticleUpdated(updated);
      }
      setReportingCommentId(null);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Hapus komentar ini secara permanen?')) {
      const updated = storageService.deleteComment(article.id, commentId);
      if (updated) {
        onArticleUpdated(updated);
      }
    }
  };

  const handleDismissReports = (commentId: string) => {
    const updated = storageService.dismissCommentReports(article.id, commentId);
    if (updated) {
      onArticleUpdated(updated);
    }
  };

  const handleTogglePin = (commentId: string) => {
    const updated = storageService.togglePinComment(article.id, commentId);
    if (updated) {
      onArticleUpdated(updated);
    }
  };

  const getArticleShortCode = () => {
    return article.id.replace('art-', '');
  };

  const getArticleShortUrl = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?s=${getArticleShortCode()}`;
  };

  const getArticlePortalUrl = () => {
    return getArticleShortUrl();
  };

  const handleCopyLink = () => {
    const url = getArticleShortUrl();
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const shareViaWhatsApp = () => {
    const shortUrl = getArticleShortUrl();
    const message = `📢 *[SUARA RAKYAT]*\n\n*${article.title}*\n\n📌 *Kategori:* ${article.category}\n👤 *Sumber:* ${article.reporterName}\n📍 *Lokasi:* ${article.location}\n\n🔗 *Baca Berita Lengkap:* ${shortUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    handleReaction('bagikan');
  };

  const handleNativeShare = async () => {
    const url = getArticleShortUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: `Baca berita "${article.title}" di Portal Suara Rakyat:`,
          url: url,
        });
        handleReaction('bagikan');
      } catch {
        // User closed share sheet or fallback
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-4 sm:my-8 overflow-hidden">
        {/* Sticky modal top bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-3 sm:px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Button Home / Kembali ke Halaman Depan */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                if (onGoHome) onGoHome();
              }}
              title="Kembali ke Halaman Depan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 hover:text-red-700 border border-slate-300 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Home className="w-3.5 h-3.5 text-red-600" />
              <span>Home <span className="hidden md:inline">(Halaman Depan)</span></span>
            </button>

            {/* Button Tulis Berita */}
            {onWriteNews && (
              <button
                onClick={() => {
                  onClose();
                  onWriteNews();
                }}
                title="Tulis Berita Baru"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>Tulis Berita</span>
              </button>
            )}

            {onPrevArticle && (
              <button
                onClick={onPrevArticle}
                disabled={!hasPrev}
                title="Artikel Sebelumnya"
                className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 ${
                  hasPrev
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
                    : 'border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden lg:inline">Sebelumnya</span>
              </button>
            )}

            {onNextArticle && (
              <button
                onClick={onNextArticle}
                disabled={!hasNext}
                title="Artikel Berikutnya"
                className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 ${
                  hasNext
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
                    : 'border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
              >
                <span className="hidden lg:inline">Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="Bagikan Berita Ini"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bagikan</span>
            </button>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 hidden sm:inline-block">
              {article.category}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-4 sm:p-8 max-h-[85vh] overflow-y-auto space-y-6">
          {/* Header Metadata */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Diverifikasi Redaksi Suara Rakyat
              </span>
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(article.createdAt).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {article.location}
              </span>
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {article.views} pembaca
              </span>
            </div>

            {/* Headline Title */}
            <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 leading-tight">
              {article.title}
            </h1>

            {/* Author / Source attribution */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-3 border-b border-slate-100 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-sm border border-red-200">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Sumber / Penulis: {article.reporterName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Jurnalisme Warga Independen • Tanggal Kejadian: {article.incidentDate || '-'}
                  </div>
                </div>
              </div>

              {/* Tombol Bagikan & Aksi Cepat */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </button>

                <button
                  onClick={shareViaWhatsApp}
                  title="Bagikan ke WhatsApp dengan Link Portal"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 active:scale-95 transition-all cursor-pointer shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  title="Salin Link Berita Portal ke Clipboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 active:scale-95 transition-all cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Link Disalin!' : 'Salin Link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full max-h-[460px] object-cover"
            />
            {article.imageCaption && (
              <p className="p-3 text-xs text-slate-600 bg-slate-50 border-t border-slate-200 italic">
                Foto: {article.imageCaption}
              </p>
            )}
          </div>

          {/* Confidentiality Confirmation Box (Reassuring privacy) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Perlindungan Privasi Pelapor:</strong> Nomor kontak WhatsApp pelapor telah diverifikasi secara rahasia oleh tim redaksi Suara Rakyat dan <strong>tidak dipublikasikan</strong> demi menjaga keamanan narasumber.
            </span>
          </div>

          {/* Article Text Content */}
          <div className="prose prose-slate max-w-none text-slate-800 text-base sm:text-lg leading-relaxed whitespace-pre-line font-serif">
            {article.content}
          </div>

          {/* Kotak Khusus: Bagikan Berita ke Publik (WhatsApp & Salin Link Portal) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>Bagikan Berita Ini</span>
                    <span className="text-[10px] uppercase font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md">
                      Tautan Portal Aktif
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Bantu sebarkan suara dan fakta warga ini ke grup WhatsApp, media sosial, atau salin link artikel.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={shareViaWhatsApp}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Bagikan ke WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Short Link Disalin!' : 'Salin Short Link'}</span>
                </button>
              </div>
            </div>

            {/* Direct URL preview box */}
            <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/60 text-xs">
              <span className="text-slate-600 shrink-0 font-bold flex items-center gap-1">
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-200/70 text-emerald-900 text-[10px] font-bold">
                  SHORT URL
                </span>
                <span>Link Ringkas:</span>
              </span>
              <div className="flex-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-mono text-[11px] truncate select-all">
                {getArticleShortUrl()}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors shrink-0 cursor-pointer"
              >
                {isCopied ? '✓ Tersalin' : 'Salin'}
              </button>
            </div>

            {isCopied && (
              <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Short URL artikel berita berhasil disalin ke papan klip! Link ringkas ini mengarah langsung ke portal Suara Rakyat.</span>
              </div>
            )}
          </div>

          {/* Reaction Bar */}
          <div className="pt-6 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Tanggapan Pembaca Terhadap Berita Ini:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleReaction('setuju')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  hasReacted['setuju']
                    ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <ThumbsUp className="w-4 h-4 text-blue-600" />
                <span>Setuju ({article.reactions.setuju})</span>
              </button>

              <button
                onClick={() => handleReaction('penting')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  hasReacted['penting']
                    ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Penting ({article.reactions.penting})</span>
              </button>

              <button
                onClick={() => handleReaction('prihatin')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  hasReacted['prihatin']
                    ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                <span>Prihatin ({article.reactions.prihatin})</span>
              </button>

              <button
                onClick={() => {
                  handleReaction('bagikan');
                  shareViaWhatsApp();
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  hasReacted['bagikan']
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>Bagikan ({article.reactions.bagikan})</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-600" />
                <span>Kolom Aspirasi & Komentar Warga ({article.comments.length})</span>
              </h4>
              {currentUser?.role === 'admin' && (
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  Mode Moderasi Admin Aktif
                </span>
              )}
            </div>

            {/* Check if article is approved */}
            {article.status !== 'approved' ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Kolom Komentar Belum Aktif</span>
                  <span>
                    Berita ini masih berstatus <strong>{article.status === 'pending' ? 'Menunggu Moderasi Redaksi' : 'Ditolak'}</strong>. Komentar pembaca hanya dapat dibuka setelah berita disetujui dan diterbitkan secara resmi oleh redaksi.
                  </span>
                </div>
              </div>
            ) : (
              /* Approved article: comment submission */
              <>
                {currentUser ? (
                  <form onSubmit={handleAddComment} className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={
                          currentUser.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}&backgroundColor=dc2626`
                        }
                        alt={currentUser.name}
                        className="w-6 h-6 rounded-full border border-slate-300 object-cover"
                      />
                      <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
                      <span className="text-[10px] text-slate-500">
                        ({currentUser.role === 'admin' ? '🛡️ Admin Redaksi' : '✍️ Kontributor Terdaftar'})
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Sampaikan tanggapan, aspirasi, atau fakta tambahan dengan santun dan beretika..."
                      className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-white"
                      required
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        {commentContent.trim().length} karakter • Jagalah etika berdiskusi
                      </span>
                      <button
                        type="submit"
                        disabled={!commentContent.trim()}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          commentContent.trim()
                            ? 'bg-red-700 hover:bg-red-800 text-white cursor-pointer active:scale-95'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Kirim Komentar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <p className="text-xs text-slate-600">
                      Anda harus masuk atau mendaftar akun menggunakan email untuk ikut menyampaikan aspirasi di kolom komentar.
                    </p>
                    <button
                      onClick={onRequireAuth}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 transition-colors shadow-xs cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Masuk / Daftar Akun untuk Berkomentar</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* List of comments */}
            <div className="space-y-3 pt-2">
              {article.comments.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Belum ada komentar pada berita ini. Jadilah yang pertama memberikan aspirasi!
                </p>
              ) : (
                article.comments.map((comment) => {
                  const isAuthor = currentUser?.email === comment.authorEmail;
                  const isAdmin = currentUser?.role === 'admin';
                  const isReported = comment.isReported || (comment.reportsCount || 0) > 0;

                  return (
                    <div
                      key={comment.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                        isReported && isAdmin
                          ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-300'
                          : comment.isPinned
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Pinned or Reported Indicator */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              comment.authorAvatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(comment.authorName)}&backgroundColor=dc2626`
                            }
                            alt={comment.authorName}
                            className="w-7 h-7 rounded-full border border-slate-300 object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{comment.authorName}</span>
                              {comment.authorRole === 'admin' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                  Admin Redaksi
                                </span>
                              )}
                              {comment.isPinned && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-yellow-100 text-yellow-900 border border-yellow-300 flex items-center gap-0.5">
                                  📌 Disematkan
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-600">
                              {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Admin Badge if comment is reported */}
                        {isReported && isAdmin && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                            ⚠️ Dilaporkan ({comment.reportsCount || 1}x)
                          </span>
                        )}
                      </div>

                      {/* Comment text */}
                      <p className="text-slate-800 leading-relaxed font-sans text-xs sm:text-sm pl-9">
                        {comment.content}
                      </p>

                      {/* Admin Report Details Box */}
                      {isReported && isAdmin && comment.reportReasons && comment.reportReasons.length > 0 && (
                        <div className="ml-9 p-2 rounded-lg bg-rose-100/70 border border-rose-300 text-[11px] text-rose-900">
                          <span className="font-bold block">Alasan Laporan Pembaca:</span>
                          <ul className="list-disc list-inside">
                            {comment.reportReasons.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Comment Action Footer: Like, Report, Admin Tools (Delete, Dismiss, Pin) */}
                      <div className="pl-9 pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        {/* Likes */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleLikeComment(comment.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-red-700 transition-colors"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{comment.likes > 0 ? comment.likes : 'Suka'}</span>
                          </button>

                          {/* Report Button (available to all users) */}
                          <button
                            type="button"
                            onClick={() => openReportModal(comment.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-amber-700 transition-colors"
                            title="Laporkan komentar melanggar pedoman"
                          >
                            <span className="text-amber-600">🚩</span>
                            <span>Laporkan</span>
                          </button>
                        </div>

                        {/* Moderation Actions (Delete, Dismiss, Pin) */}
                        <div className="flex items-center gap-2">
                          {/* Admin Pin Toggle */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleTogglePin(comment.id)}
                              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                              title={comment.isPinned ? 'Lepas Sematan' : 'Sematkan di atas'}
                            >
                              {comment.isPinned ? 'Lepas Pin' : 'Sematkan'}
                            </button>
                          )}

                          {/* Admin Dismiss Reports */}
                          {isAdmin && isReported && (
                            <button
                              type="button"
                              onClick={() => handleDismissReports(comment.id)}
                              className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
                              title="Loloskan komentar ini dan hapus tanda laporan"
                            >
                              Loloskan
                            </button>
                          )}

                          {/* Delete Action (Admins or Author) */}
                          {(isAdmin || isAuthor) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 transition-colors cursor-pointer"
                              title="Hapus komentar ini secara permanen"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Navigation Strip: Ke Halaman Depan & Tulis Berita */}
            <div className="mt-8 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-red-50/30 p-4 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  if (onGoHome) onGoHome();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-slate-100 hover:text-red-700 border border-slate-300 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Home className="w-4 h-4 text-red-600" />
                <span>← Kembali ke Halaman Depan</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={shareViaWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Bagikan ke WA</span>
                </button>

                {onWriteNews && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onWriteNews();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-red-700 hover:bg-red-800 transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    <PenSquare className="w-4 h-4" />
                    <span>Tulis Berita</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reporting Modal */}
      {reportingCommentId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="text-amber-600">🚩</span>
                <span>Laporkan Komentar</span>
              </h4>
              <button
                onClick={() => setReportingCommentId(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Pilih alasan pelaporan komentar agar tim moderator redaksi dapat meninjau:
            </p>

            <div className="space-y-1.5">
              {[
                'Ujaran kebencian / Provokasi SARA',
                'Disinformasi / Hoaks',
                'Spam atau iklan tidak relevan',
                'Pelecehan / Kata-kata kasar',
                'Penipuan atau konten berbahaya',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => handleConfirmReport(reason)}
                  className="w-full text-left p-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-700 border border-slate-200 transition-colors"
                >
                  • {reason}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setReportingCommentId(null)}
              className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-700 text-center cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Share Modal Dialog (Tombol Bagikan ke WhatsApp & Salin Link Portal) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Bagikan Berita
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sebarkan informasi dari warga ke portal publik
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Article Snippet */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex gap-3">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-red-700">
                  {article.category}
                </span>
                <h4 className="font-serif font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">
                  Sumber: {article.reporterName} • {article.location}
                </p>
              </div>
            </div>

            {/* Main Action Buttons: WhatsApp & Copy Link */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  shareViaWhatsApp();
                  setIsShareModalOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition-all shadow-md shadow-emerald-600/20 text-sm cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Bagikan ke Aplikasi WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 transition-all border border-slate-300 text-sm cursor-pointer"
              >
                {isCopied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                <span>{isCopied ? 'Short Link Berhasil Disalin!' : 'Salin Short Link Berita'}</span>
              </button>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={() => {
                    handleNativeShare();
                    setIsShareModalOpen(false);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Gunakan Menu Berbagi Perangkat</span>
                </button>
              )}
            </div>

            {/* Portal Link preview */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  SHORT URL
                </span>
                <span>Tautan Ringkas Portal Suara Rakyat:</span>
              </label>
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                <input
                  type="text"
                  readOnly
                  value={getArticleShortUrl()}
                  className="w-full bg-transparent text-xs text-slate-700 font-mono focus:outline-none select-all"
                />
              </div>
            </div>

            {isCopied && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Tautan siap dibagikan! Penerima link akan langsung diarahkan ke artikel ini di portal.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
