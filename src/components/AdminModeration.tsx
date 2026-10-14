import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  MessageSquare,
  Phone,
  User,
  MapPin,
  Eye,
  ExternalLink,
  AlertTriangle,
  ArrowLeft,
  ThumbsUp,
  Trash2,
  Pin,
  Flag,
  Home,
  PenSquare,
} from 'lucide-react';
import { NewsArticle, ModerationStatus, User as UserType } from '../types';
import { storageService } from '../services/storageService';

interface AdminModerationProps {
  articles: NewsArticle[];
  currentUser: UserType | null;
  onUpdateArticleStatus: (articleId: string, status: 'approved' | 'rejected', notes?: string) => void;
  onBackToHome: () => void;
  onViewArticleDetail: (article: NewsArticle) => void;
  onDataChanged?: () => void;
  onWriteNews?: () => void;
}

export const AdminModeration: React.FC<AdminModerationProps> = ({
  articles,
  currentUser: _currentUser,
  onUpdateArticleStatus,
  onBackToHome,
  onViewArticleDetail,
  onDataChanged,
  onWriteNews,
}) => {
  // Main admin view mode: 'articles' or 'comments'
  const [activeAdminTab, setActiveAdminTab] = useState<'articles' | 'comments'>('articles');

  // Article filters
  const [filterStatus, setFilterStatus] = useState<ModerationStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [articleToReject, setArticleToReject] = useState<NewsArticle | null>(null);

  // Comment filters
  const [commentFilter, setCommentFilter] = useState<'reported' | 'all'>('reported');
  const [commentSearch, setCommentSearch] = useState('');

  // Article counts
  const pendingCount = articles.filter((a) => a.status === 'pending').length;
  const approvedCount = articles.filter((a) => a.status === 'approved').length;
  const rejectedCount = articles.filter((a) => a.status === 'rejected').length;

  // Flatten all comments from articles
  const allCommentsList = useMemo(() => {
    const list: { article: NewsArticle; comment: NewsArticle['comments'][0] }[] = [];
    articles.forEach((art) => {
      art.comments.forEach((cmt) => {
        list.push({ article: art, comment: cmt });
      });
    });
    return list;
  }, [articles]);

  const reportedCommentsList = useMemo(() => {
    return allCommentsList.filter(
      (item) => item.comment.isReported || (item.comment.reportsCount || 0) > 0
    );
  }, [allCommentsList]);

  // Filtered comments
  const filteredComments = useMemo(() => {
    const base = commentFilter === 'reported' ? reportedCommentsList : allCommentsList;
    if (!commentSearch.trim()) return base;
    const q = commentSearch.toLowerCase();
    return base.filter(
      (item) =>
        item.comment.content.toLowerCase().includes(q) ||
        item.comment.authorName.toLowerCase().includes(q) ||
        item.article.title.toLowerCase().includes(q)
    );
  }, [commentFilter, reportedCommentsList, allCommentsList, commentSearch]);

  const filteredArticles = articles.filter((article) => {
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.whatsappNumber.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (article: NewsArticle) => {
    onUpdateArticleStatus(article.id, 'approved', 'Telah diverifikasi dan disetujui oleh Redaksi Suara Rakyat.');
    if (selectedArticle?.id === article.id) {
      setSelectedArticle({ ...selectedArticle, status: 'approved' });
    }
  };

  const openRejectModal = (article: NewsArticle) => {
    setArticleToReject(article);
    setRejectionNotes('Informasi memerlukan verifikasi bukti atau dokumentasi lebih lanjut.');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (articleToReject) {
      onUpdateArticleStatus(articleToReject.id, 'rejected', rejectionNotes.trim());
      if (selectedArticle?.id === articleToReject.id) {
        setSelectedArticle({ ...selectedArticle, status: 'rejected' });
      }
    }
    setIsRejectModalOpen(false);
    setArticleToReject(null);
  };

  // Comment Moderation Actions
  const handleDeleteComment = (articleId: string, commentId: string) => {
    if (window.confirm('Hapus komentar ini secara permanen dari artikel?')) {
      storageService.deleteComment(articleId, commentId);
      if (onDataChanged) onDataChanged();
    }
  };

  const handleDismissCommentReports = (articleId: string, commentId: string) => {
    storageService.dismissCommentReports(articleId, commentId);
    if (onDataChanged) onDataChanged();
  };

  const handleTogglePinComment = (articleId: string, commentId: string) => {
    storageService.togglePinComment(articleId, commentId);
    if (onDataChanged) onDataChanged();
  };

  const formatWaLink = (waNumber: string, title: string) => {
    let clean = waNumber.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    const message = encodeURIComponent(`Halo, saya Redaksi Suara Rakyat ingin memverifikasi fakta terkait laporan berita Anda: "${title}".`);
    return `https://wa.me/${clean}?text=${message}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-600/80 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Meja Redaksi & Dewan Moderasi
              </span>
              <span className="text-xs text-slate-300">
                Akses Administrator
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pusat Kurasi Berita & Moderasi Komentar
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Periksa keaslian berita warga, verifikasi nomor WhatsApp privat pelapor, dan moderasi komentar publik demi kenyamanan ruang diskusi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onBackToHome();
              }}
              title="Kembali ke Halaman Depan"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-colors border border-white/20 active:scale-95 cursor-pointer shadow-xs"
            >
              <Home className="w-4 h-4 text-amber-300" />
              <span>Halaman Depan (Home)</span>
            </button>

            {onWriteNews && (
              <button
                onClick={onWriteNews}
                title="Tulis Berita Baru"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-colors border border-red-500 active:scale-95 cursor-pointer shadow-md"
              >
                <PenSquare className="w-4 h-4" />
                <span>Tulis Berita</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Selector: Moderasi Berita vs Moderasi Komentar */}
        <div className="flex rounded-xl bg-slate-950/60 p-1.5 mt-6 border border-slate-700/80 max-w-md">
          <button
            onClick={() => setActiveAdminTab('articles')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeAdminTab === 'articles'
                ? 'bg-red-700 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>📰 Moderasi Berita</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('comments')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeAdminTab === 'comments'
                ? 'bg-red-700 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>💬 Moderasi Komentar</span>
            {reportedCommentsList.length > 0 && (
              <span className="px-2 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                {reportedCommentsList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: MODERASI BERITA ===================== */}
      {activeAdminTab === 'articles' && (
        <div>
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`p-3.5 rounded-xl text-left transition-all ${
                filterStatus === 'pending'
                  ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-950'
                  : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Menunggu Kurasi</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black mt-1 text-amber-600">{pendingCount}</p>
            </button>

            <button
              onClick={() => setFilterStatus('approved')}
              className={`p-3.5 rounded-xl text-left transition-all ${
                filterStatus === 'approved'
                  ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-950'
                  : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Diterbitkan (Live)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black mt-1 text-emerald-600">{approvedCount}</p>
            </button>

            <button
              onClick={() => setFilterStatus('rejected')}
              className={`p-3.5 rounded-xl text-left transition-all ${
                filterStatus === 'rejected'
                  ? 'bg-rose-500/20 border-2 border-rose-400 text-rose-950'
                  : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Ditolak / Arsip</span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black mt-1 text-rose-600">{rejectedCount}</p>
            </button>

            <button
              onClick={() => setFilterStatus('all')}
              className={`p-3.5 rounded-xl text-left transition-all ${
                filterStatus === 'all'
                  ? 'bg-blue-500/20 border-2 border-blue-400 text-blue-950'
                  : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Total Seluruh Laporan</span>
                <ShieldCheck className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black mt-1 text-slate-900">{articles.length}</p>
            </button>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  filterStatus === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Menunggu Moderasi ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  filterStatus === 'approved'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Disetujui ({approvedCount})
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  filterStatus === 'rejected'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Ditolak ({rejectedCount})
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  filterStatus === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semua Laporan ({articles.length})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul, pelapor, atau nomor WA..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-white"
              />
            </div>
          </div>

          {/* Main Grid: List of Submissions & Detailed Inspection Pane */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Submissions List (Left 7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {filteredArticles.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800">
                    Tidak ada laporan dalam status ini
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Semua laporan berita telah dimoderasi dengan baik atau tidak sesuai pencarian.
                  </p>
                </div>
              ) : (
                filteredArticles.map((article) => {
                  const isSelected = selectedArticle?.id === article.id;
                  return (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                        isSelected
                          ? 'border-red-600 ring-2 ring-red-600/20 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {article.category}
                        </span>

                        {/* Status Pill */}
                        {article.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3" />
                            Menunggu Persetujuan
                          </span>
                        )}
                        {article.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Disetujui / Tayang
                          </span>
                        )}
                        {article.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3" />
                            Ditolak
                          </span>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0 border border-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-red-700 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                            {article.content}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2.5">
                            <span className="font-medium text-slate-700 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {article.reporterName}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {article.location}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-slate-400" />
                              {article.comments.length} komentar
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Info box visible to admin */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WA Pelapor: <strong>{article.whatsappNumber}</strong> (Privat)</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {article.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(article);
                                }}
                                className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                              >
                                Setujui
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRejectModal(article);
                                }}
                                className="px-3 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                              >
                                Tolak
                              </button>
                            </>
                          )}
                          {article.status === 'approved' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewArticleDetail(article);
                              }}
                              className="px-3 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Lihat Tayang
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Inspection Panel (Right 5 Cols) */}
            <div className="lg:col-span-5">
              {selectedArticle ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm sticky top-20 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Detail Pemeriksaan Redaksi
                    </span>
                    <span className="text-xs text-slate-400">
                      ID: {selectedArticle.id}
                    </span>
                  </div>

                  {/* Cover Image */}
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={selectedArticle.imageUrl}
                      alt={selectedArticle.title}
                      className="w-full h-44 object-cover"
                    />
                    {selectedArticle.imageCaption && (
                      <p className="text-[11px] text-slate-500 p-2 bg-slate-50 border-t border-slate-200 italic">
                        {selectedArticle.imageCaption}
                      </p>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                      {selectedArticle.category}
                    </span>
                    <h3 className="font-serif font-bold text-slate-900 text-lg leading-snug mt-2">
                      {selectedArticle.title}
                    </h3>
                  </div>

                  {/* Reporter & WhatsApp Info (CRITICAL: Private verification) */}
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        Data Pelapor & Kontak Verifikasi
                      </span>
                      <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                        Rahasia Redaksi
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Sumber / Nama Publik:</span>
                        <strong className="text-slate-900">{selectedArticle.reporterName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Lokasi:</span>
                        <span className="font-medium">{selectedArticle.location}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Nomor WhatsApp Pelapor:</span>
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          {selectedArticle.whatsappNumber}
                        </span>
                      </div>

                      <a
                        href={formatWaLink(selectedArticle.whatsappNumber, selectedArticle.title)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat WA Verifikasi</span>
                      </a>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Naskah Berita:
                    </label>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line font-sans">
                      {selectedArticle.content}
                    </div>
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="pt-2 space-y-2">
                    {selectedArticle.status === 'pending' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleApprove(selectedArticle)}
                          className="py-2.5 px-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Setujui & Publikasikan</span>
                        </button>
                        <button
                          onClick={() => openRejectModal(selectedArticle)}
                          className="py-2.5 px-3 rounded-xl font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Tolak Laporan</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {selectedArticle.status === 'approved' ? (
                          <button
                            onClick={() => openRejectModal(selectedArticle)}
                            className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200"
                          >
                            Tarik dari Publikasi (Unpublish)
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApprove(selectedArticle)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300"
                          >
                            Tinjau Ulang & Terbitkan
                          </button>
                        )}
                        <button
                          onClick={() => onViewArticleDetail(selectedArticle)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Lihat Artikel</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  <Eye className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-medium">
                    Pilih salah satu laporan di sebelah kiri untuk memeriksa fakta, dokumentasi, dan kontak WhatsApp pelapor secara seksama.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: MODERASI KOMENTAR ===================== */}
      {activeAdminTab === 'comments' && (
        <div className="space-y-6">
          {/* Comment Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Komentar Dilaporkan
                </span>
                <Flag className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-3xl font-black text-rose-700 mt-2">
                {reportedCommentsList.length}
              </p>
              <p className="text-[11px] text-rose-800 mt-1">
                Memerlukan tindakan peninjauan atau penghapusan
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Total Komentar Warga
                </span>
                <MessageSquare className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-3xl font-black text-slate-800 mt-2">
                {allCommentsList.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Di seluruh artikel berita yang disetujui
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Komentar Disematkan (Pin)
                </span>
                <Pin className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-3xl font-black text-amber-700 mt-2">
                {allCommentsList.filter((item) => item.comment.isPinned).length}
              </p>
              <p className="text-[11px] text-amber-800 mt-1">
                Komentar positif dan berwawasan yang diutamakan
              </p>
            </div>
          </div>

          {/* Comment Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCommentFilter('reported')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  commentFilter === 'reported'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ⚠️ Komentar Dilaporkan ({reportedCommentsList.length})
              </button>
              <button
                onClick={() => setCommentFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  commentFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                💬 Semua Komentar ({allCommentsList.length})
              </button>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={commentSearch}
                onChange={(e) => setCommentSearch(e.target.value)}
                placeholder="Cari isi komentar, nama, atau judul berita..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {filteredComments.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base">
                  {commentFilter === 'reported'
                    ? 'Tidak ada komentar yang dilaporkan!'
                    : 'Belum ada komentar warga'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {commentFilter === 'reported'
                    ? 'Ruang diskusi bersih dan kondusif. Seluruh laporan telah ditindaklanjuti.'
                    : 'Komentar pembaca akan muncul di sini setelah berita tayang.'}
                </p>
              </div>
            ) : (
              filteredComments.map(({ article, comment }) => {
                const isReported = comment.isReported || (comment.reportsCount || 0) > 0;
                return (
                  <div
                    key={comment.id}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all space-y-3 ${
                      isReported
                        ? 'border-rose-300 bg-rose-50/30 ring-1 ring-rose-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Article context & Reported warning */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Pada Berita:</span>
                        <button
                          onClick={() => onViewArticleDetail(article)}
                          className="font-bold text-red-700 hover:underline flex items-center gap-1 text-left line-clamp-1"
                        >
                          <span>{article.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </button>
                      </div>

                      {isReported ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Dilaporkan ({comment.reportsCount || 1}x)</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Status: Normal
                        </span>
                      )}
                    </div>

                    {/* Author & Comment Content */}
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          comment.authorAvatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(comment.authorName)}&backgroundColor=dc2626`
                        }
                        alt={comment.authorName}
                        className="w-9 h-9 rounded-full border border-slate-200 object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {comment.authorName}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ({comment.authorEmail})
                          </span>
                          {comment.isPinned && (
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                              📌 Disematkan
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            • {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mt-1 font-sans bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                          {comment.content}
                        </p>

                        {/* Reported reasons */}
                        {isReported && comment.reportReasons && comment.reportReasons.length > 0 && (
                          <div className="mt-2 p-2.5 rounded-xl bg-rose-100/80 border border-rose-300 text-xs text-rose-950">
                            <span className="font-bold block mb-0.5">
                              ⚠️ Alasan Pelaporan oleh Pembaca:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-900">
                              {comment.reportReasons.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Moderation Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                          {comment.likes} Suka
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Pin Toggle */}
                        <button
                          onClick={() => handleTogglePinComment(article.id, comment.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Pin className="w-3.5 h-3.5" />
                          <span>{comment.isPinned ? 'Lepas Pin' : 'Sematkan'}</span>
                        </button>

                        {/* Dismiss Reports */}
                        {isReported && (
                          <button
                            onClick={() => handleDismissCommentReports(article.id, comment.id)}
                            className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Loloskan komentar dan bersihkan tanda pelanggaran"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Loloskan / Abaikan</span>
                          </button>
                        )}

                        {/* Delete Comment */}
                        <button
                          onClick={() => handleDeleteComment(article.id, comment.id)}
                          className="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Hapus komentar ini secara permanen"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Hapus Komentar</span>
                        </button>

                        {/* View in Article */}
                        <button
                          onClick={() => onViewArticleDetail(article)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Buka Berita</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Rejection Modal with Notes */}
      {isRejectModalOpen && articleToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-lg">
                Konfirmasi Penolakan Laporan
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Laporan: <strong>"{articleToReject.title}"</strong> oleh{' '}
              <strong>{articleToReject.reporterName}</strong>
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alasan Penolakan Redaksi:
              </label>
              <textarea
                rows={3}
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Tuliskan catatan evaluasi redaksi..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/30 bg-slate-50"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Tolak Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
