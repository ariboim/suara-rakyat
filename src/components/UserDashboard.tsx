import React from 'react';
import { User, NewsArticle } from '../types';
import { Home, PenSquare, Clock, CheckCircle2, XCircle, FileText, ArrowRight, ShieldCheck, Phone, Mail } from 'lucide-react';

interface UserDashboardProps {
  currentUser: User;
  articles: NewsArticle[];
  onWriteNewReport: () => void;
  onViewArticle: (article: NewsArticle) => void;
  onOpenAdminDesk?: () => void;
  onGoHome?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  articles,
  onWriteNewReport,
  onViewArticle,
  onOpenAdminDesk,
  onGoHome,
}) => {
  // Filter user's reports (by authorId or author email/name)
  const myReports = articles.filter(
    (a) => a.authorId === currentUser.id || a.reporterName.includes(currentUser.name)
  );

  const pendingCount = myReports.filter((a) => a.status === 'pending').length;
  const approvedCount = myReports.filter((a) => a.status === 'approved').length;
  const rejectedCount = myReports.filter((a) => a.status === 'rejected').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}&backgroundColor=dc2626`}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl border-2 border-red-100 object-cover shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                  {currentUser.role === 'admin' ? '🛡️ Administrator' : '✍️ Kontributor Warga'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.email}
                </span>
                {currentUser.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {currentUser.phone}
                  </span>
                )}
                <span>• Bergabung: {new Date(currentUser.registeredAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {onGoHome && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onGoHome();
                }}
                title="Kembali ke Halaman Depan"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-slate-800 bg-white hover:bg-slate-100 hover:text-red-700 border border-slate-300 text-xs transition-colors cursor-pointer shadow-2xs active:scale-95"
              >
                <Home className="w-4 h-4 text-red-600" />
                <span>Halaman Depan (Home)</span>
              </button>
            )}

            {currentUser.role === 'admin' && onOpenAdminDesk && (
              <button
                onClick={onOpenAdminDesk}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-xs transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Buka Meja Redaksi</span>
              </button>
            )}

            <button
              onClick={onWriteNewReport}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white bg-red-700 hover:bg-red-800 shadow-xs text-xs active:scale-95 transition-all cursor-pointer"
            >
              <PenSquare className="w-4 h-4" />
              <span>Tulis Berita Baru</span>
            </button>
          </div>
        </div>

        {/* Stats counter */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-xs font-semibold text-amber-900 block">Menunggu Moderasi</span>
            <span className="text-2xl font-black text-amber-800 mt-0.5 block">{pendingCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-xs font-semibold text-emerald-900 block">Disetujui & Tayang</span>
            <span className="text-2xl font-black text-emerald-800 mt-0.5 block">{approvedCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 block">Total Kontribusi</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{myReports.length}</span>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-700" />
            <span>Riwayat & Status Laporan Saya</span>
          </h2>
          <span className="text-xs text-slate-500">
            Menampilkan {myReports.length} laporan
          </span>
        </div>

        {myReports.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800">
              Belum Ada Laporan yang Dikirimkan
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Apakah Anda melihat jalan rusak, kegiatan gotong royong, fasilitas umum terbengkalai, atau prestasi warga di sekitar Anda? Suarakan sekarang!
            </p>
            <button
              onClick={onWriteNewReport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 transition-colors shadow-xs"
            >
              <span>Mulai Tulis Berita Pertama</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myReports.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row gap-4 items-start justify-between"
              >
                <div className="flex gap-4">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 border border-slate-100"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {article.category}
                      </span>
                      {article.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3" />
                          Menunggu Moderasi Admin
                        </span>
                      )}
                      {article.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Disetujui & Tayang
                        </span>
                      )}
                      {article.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3 h-3" />
                          Ditolak
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-slate-900 text-base leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Diserahkan pada {new Date(article.createdAt).toLocaleDateString('id-ID')} • Lokasi: {article.location}
                    </p>

                    {article.moderationNotes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-2">
                        <strong>Catatan Redaksi:</strong> {article.moderationNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 self-end sm:self-center">
                  {article.status === 'approved' ? (
                    <button
                      onClick={() => onViewArticle(article)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      Buka Berita
                    </button>
                  ) : (
                    <button
                      onClick={() => onViewArticle(article)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Pratinjau Draf
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
