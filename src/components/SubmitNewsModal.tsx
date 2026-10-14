import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, ShieldAlert, CheckCircle2, Lock, Sparkles, MapPin, Calendar, FileText, Send } from 'lucide-react';
import { NewsArticle, NewsCategory, User } from '../types';
import { storageService } from '../services/storageService';

interface SubmitNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onRequireAuth: () => void;
  onArticleSubmitted: (newArticle: NewsArticle) => void;
  onOpenAdminPanel?: () => void;
}

const CATEGORIES: Exclude<NewsCategory, 'Semua'>[] = [
  'Infrastruktur & Layanan',
  'Sosial & Budaya',
  'Ekonomi & Pasar',
  'Politik & Hukum',
  'Lingkungan & Bencana',
  'Pendidikan',
  'Kesehatan',
  'Cerpen (Cerita Pendek)',
];

const SAMPLE_PRESET_IMAGES = [
  { label: 'Jalan / Infrastruktur', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Banjir / Lingkungan', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Pasar & Pertanian', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cerpen / Literasi', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80' },
];

export const SubmitNewsModal: React.FC<SubmitNewsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRequireAuth,
  onArticleSubmitted,
  onOpenAdminPanel,
}) => {
  // Form fields as requested
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Exclude<NewsCategory, 'Semua'>>('Infrastruktur & Layanan');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [reporterName, setReporterName] = useState(currentUser?.name || '');
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser?.phone || '');
  const [location, setLocation] = useState(currentUser?.city ? `${currentUser.city}` : '');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);

  const [error, setError] = useState('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedArticle, setSubmittedArticle] = useState<NewsArticle | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync reporter name if user logs in
  React.useEffect(() => {
    if (currentUser) {
      if (!reporterName) setReporterName(currentUser.name);
      if (!whatsappNumber && currentUser.phone) setWhatsappNumber(currentUser.phone);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // If user is not logged in, enforce the rule: "semua yang input berita wajib login / sign up menggunakan email"
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Wajib Masuk / Daftar Akun
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Demi menjaga kredibilitas dan pertanggungjawaban informasi publik, seluruh kontributor berita Suara Rakyat wajib memiliki akun terdaftar menggunakan email.
          </p>
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                onClose();
                onRequireAuth();
              }}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-red-700 hover:bg-red-800 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              Daftar / Masuk dengan Email Sekarang
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle local image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File yang diunggah harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Ukuran file foto maksimal 8 MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || title.trim().length < 10) {
      setError('Judul berita minimal 10 karakter agar informatif.');
      return;
    }
    if (!content.trim() || content.trim().length < 40) {
      setError('Isi berita minimal 40 karakter. Jelaskan peristiwa secara runut (apa, siapa, di mana, kapan, mengapa).');
      return;
    }
    if (!reporterName.trim()) {
      setError('Mohon cantumkan Sumber / Nama Pelapor yang akan ditampilkan di berita.');
      return;
    }
    if (!whatsappNumber.trim() || whatsappNumber.trim().length < 9) {
      setError('Mohon masukkan Nomor WhatsApp aktif untuk keperluan verifikasi redaksi (nomor dijamin aman & tidak dipublikasikan).');
      return;
    }

    // Default image fallback if user didn't upload
    const finalImageUrl = imageUrl || SAMPLE_PRESET_IMAGES[0].url;

    const newArticle = storageService.addArticle({
      title: title.trim(),
      content: content.trim(),
      category,
      imageUrl: finalImageUrl,
      imageCaption: imageCaption.trim() || `Dokumentasi warta warga di ${location || 'lokasi peristiwa'}.`,
      reporterName: reporterName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      location: location.trim() || 'Indonesia',
      incidentDate: incidentDate || new Date().toISOString().split('T')[0],
      authorId: currentUser.id,
    });

    setSubmittedArticle(newArticle);
    setIsSubmittedSuccess(true);
    onArticleSubmitted(newArticle);
  };

  const handleResetForm = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setImageCaption('');
    setError('');
    setIsSubmittedSuccess(false);
    setSubmittedArticle(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-rose-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-red-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Formulir Tulis Berita Warga
              </h2>
              <p className="text-xs text-red-200">
                Suarakan kebenaran demi kepentingan umum & masyarakat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[82vh] overflow-y-auto">
          {/* ===================== SUBMISSION SUCCESS VIEW ===================== */}
          {isSubmittedSuccess ? (
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 inline-block mb-2">
                  Status: Menunggu Persetujuan Moderasi Admin
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Laporan Berita Berhasil Dikirim!
                </h3>
                <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
                  Terima kasih <span className="font-semibold text-slate-800">{reporterName}</span>. Laporan Anda dengan judul:
                </p>
                <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left max-w-lg mx-auto">
                  <p className="font-serif font-bold text-slate-900 text-base">
                    "{submittedArticle?.title}"
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                    <span>Kategori: <strong>{submittedArticle?.category}</strong></span>
                    <span>•</span>
                    <span>Pelapor: <strong>{submittedArticle?.reporterName}</strong></span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 text-left max-w-lg mx-auto space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Proses Selanjutnya oleh Redaksi:</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  1. Tim redaksi akan memverifikasi kebenaran laporan.
                  <br />
                  2. <strong>Nomor WhatsApp Anda ({submittedArticle?.whatsappNumber})</strong> dijaga kerahasiaannya dan hanya dipakai oleh admin untuk konfirmasi langsung bila dibutuhkan.
                  <br />
                  3. Setelah disetujui, berita akan langsung terbit di halaman muka portal Suara Rakyat.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                <button
                  onClick={() => {
                    handleResetForm();
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all text-sm cursor-pointer shadow-sm"
                >
                  Selesai & Ke Beranda
                </button>
                {onOpenAdminPanel && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminPanel();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 active:scale-95 transition-all text-sm cursor-pointer"
                  >
                    🛡️ Buka Meja Moderasi Admin
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ===================== REPORT FORM ===================== */
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}

              {/* 1. Judul Berita */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Judul Berita <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Tanggul Sungai Jebol Menggenangi Pemukiman Warga 3 RT di Desa Sukatani"
                  className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 bg-slate-50/50"
                  required
                />
                <p className="text-[11px] text-slate-600 mt-1">
                  Buat judul ringkas, padat, dan memuat pokok peristiwa.
                </p>
              </div>

              {/* Kategori, Lokasi, Tanggal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Kategori Berita <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Exclude<NewsCategory, 'Semua'>)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Lokasi Peristiwa
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Kab/Kota, Provinsi"
                      className="w-full pl-8 pr-2.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Tanggal Peristiwa
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Isi Berita */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Isi Berita Lengkap <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {content.trim().length} karakter • {Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200))} mnt baca
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan kronologi dan fakta peristiwa secara objektif:
- Apa yang terjadi?
- Siapa yang terdampak atau terlibat?
- Di mana lokasi persisnya?
- Kapan waktu peristiwanya?
- Bagaimana dampaknya dan apa harapan warga sekitar?"
                  className="w-full p-3 text-sm leading-relaxed rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 bg-slate-50/50"
                  required
                />
              </div>

              {/* 3. Upload Foto */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Upload Foto / Dokumentasi Berita <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Format: JPG, PNG, WEBP (Max 8MB)
                  </span>
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-300 group">
                    <img
                      src={imageUrl}
                      alt="Pratinjau foto berita"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white text-xs font-bold text-slate-800 hover:bg-slate-100"
                      >
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-700"
                      >
                        Hapus Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-white"
                  >
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">
                      Klik untuk Upload Foto dari Komputer / HP
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      atau gunakan pilihan foto preset di bawah untuk simulasi
                    </p>
                  </div>
                )}

                {/* Preset sample images for effortless instant testing */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                    Atau pilih foto simulasi siap pakai:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-left p-1.5 rounded-lg border text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                          imageUrl === preset.url
                            ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Keterangan foto (opsional, contoh: Suasana warga saat membersihkan puing tanggul)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-600 bg-white"
                  />
                </div>
              </div>

              {/* 4. Sumber / Nama Pelapor & 5. Nomor WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sumber / Nama (Ditampilkan di berita) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Sumber / Nama Pelapor <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Contoh: Dian Prasetyo (Warga RT 04)"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-slate-50/50"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    ✓ <strong>Nama ini DITAMPILKAN</strong> sebagai sumber/penulis artikel publik.
                  </p>
                </div>

                {/* Nomor WhatsApp (TIDAK DITAMPILKAN DI BERITA - ADMIN ONLY) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nomor WhatsApp Pelapor <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-amber-50/30"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-amber-700 font-bold mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600 inline" />
                    <strong>TIDAK DITAMPILKAN DI BERITA</strong> (Hanya untuk Admin Verifikasi)
                  </p>
                </div>
              </div>

              {/* Privacy Notice Box highlighting WhatsApp confidentiality */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-amber-950">Jaminan Kerahasiaan Kontak:</span> Sesuai ketentuan Kode Etik Jurnalisme Warga Suara Rakyat, nomor WhatsApp Anda 100% dirahasiakan dari publik dan pembaca umum. Nomor ini disimpan secara privat agar Dewan Redaksi Admin dapat memverifikasi kebenaran laporan Anda sebelum diterbitkan.
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-700 hover:bg-red-800 active:scale-95 transition-all shadow-md shadow-red-700/20 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Berita ke Redaksi</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
