export type UserRole = 'citizen' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city?: string;
  avatar?: string;
  registeredAt: string;
  bio?: string;
}

export type NewsCategory =
  | 'Semua'
  | 'Rekomendasi'
  | 'Infrastruktur & Layanan'
  | 'Sosial & Budaya'
  | 'Ekonomi & Pasar'
  | 'Politik & Hukum'
  | 'Lingkungan & Bencana'
  | 'Pendidikan'
  | 'Kesehatan'
  | 'Cerpen (Cerita Pendek)';

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface Comment {
  id: string;
  articleId?: string;
  authorId?: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  authorRole?: UserRole;
  content: string;
  createdAt: string;
  likes: number;
  reportsCount?: number;
  reportReasons?: string[];
  isReported?: boolean;
  isPinned?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  category: Exclude<NewsCategory, 'Semua'>;
  imageUrl: string;
  imageCaption?: string;
  reporterName: string; // Sumber / Nama yang ditampilkan ke publik
  whatsappNumber: string; // NOMOR WA PRIVAT: HANYA untuk Admin Moderasi, TIDAK ditampilkan di berita!
  location: string;
  incidentDate?: string;
  createdAt: string;
  status: ModerationStatus;
  moderationNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  authorId: string;
  views: number;
  reactions: {
    setuju: number;
    penting: number;
    prihatin: number;
    bagikan: number;
  };
  comments: Comment[];
  isBreaking?: boolean;
  isHeadline?: boolean;
}

export type ActiveView = 'home' | 'report' | 'dashboard' | 'admin' | 'article-detail';
