/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Download,
  Smartphone,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  CheckCircle,
  Eye,
  Calendar,
  MapPin,
  PenSquare,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Flame,
  User as UserIcon,
  Share2,
} from 'lucide-react';
import { NewsArticle, NewsCategory, User, ActiveView } from './types';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { NavigationToolbar } from './components/NavigationToolbar';
import { AuthModal } from './components/AuthModal';
import { SubmitNewsModal } from './components/SubmitNewsModal';
import { AdminModeration } from './components/AdminModeration';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { ShareModal } from './components/ShareModal';
import { UserDashboard } from './components/UserDashboard';
import { CloseAppModal } from './components/CloseAppModal';
import { Footer } from './components/Footer';
import {
  ToastNotificationContainer,
  ToastNotificationItem,
  playNotificationChime,
} from './components/ToastNotification';

const CATEGORIES: NewsCategory[] = [
  'Semua',
  'Rekomendasi',
  'Infrastruktur & Layanan',
  'Sosial & Budaya',
  'Ekonomi & Pasar',
  'Politik & Hukum',
  'Lingkungan & Bencana',
  'Pendidikan',
  'Kesehatan',
  'Cerpen (Cerita Pendek)',
];

const ITEMS_PER_PAGE = 6;

export default function App() {
  // Main data state
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Navigation and UI state
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signup' | 'login'>('signup');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isAppClosed, setIsAppClosed] = useState(false);

  // Toast notifications for newly approved articles
  const [toasts, setToasts] = useState<ToastNotificationItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [recentApprovedNotifications, setRecentApprovedNotifications] = useState<NewsArticle[]>([]);

  // Share modal state for quick sharing directly from article cards
  const [sharingArticle, setSharingArticle] = useState<NewsArticle | null>(null);

  // Refresh feedback state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedText, setLastUpdatedText] = useState('Baru saja (Otomatis)');

  // Show Toast notification when admin approves an article
  const showApprovedToast = useCallback(
    (article: NewsArticle) => {
      const toastId = `toast-${article.id}-${Date.now()}`;
      const newToast: ToastNotificationItem = {
        id: toastId,
        article,
        timestamp: Date.now(),
        duration: 8500,
      };

      setToasts((prev) => [
        newToast,
        ...prev.filter((t) => t.article.id !== article.id).slice(0, 2),
      ]);

      setRecentApprovedNotifications((prev) => {
        const withoutCurrent = prev.filter((a) => a.id !== article.id);
        return [article, ...withoutCurrent].slice(0, 10);
      });

      setUnreadNotificationsCount((prev) => prev + 1);

      if (soundEnabled) {
        playNotificationChime();
      }
    },
    [soundEnabled]
  );

  // Core Automated Refresh handler: loads latest data & triggers toast if new articles were approved by admin
  const executeAutoRefresh = useCallback(
    (showSpinner = false) => {
      if (showSpinner) setIsRefreshing(true);
      const freshArticles = storageService.getArticles();
      const freshUser = storageService.getCurrentUser();

      setArticles((prev) => {
        const prevApprovedIds = new Set(
          prev.filter((a) => a.status === 'approved').map((a) => a.id)
        );
        const newlyApproved = freshArticles.filter(
          (a) => a.status === 'approved' && !prevApprovedIds.has(a.id)
        );

        // Notify user with toast if newly approved articles arrived in this session
        if (newlyApproved.length > 0 && prev.length > 0) {
          newlyApproved.forEach((art) => {
            showApprovedToast(art);
          });
        }

        return freshArticles;
      });

      setCurrentUser(freshUser);
      const now = new Date();
      setLastUpdatedText(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB (Otomatis)'
      );

      if (showSpinner) {
        setTimeout(() => setIsRefreshing(false), 350);
      }
    },
    [showApprovedToast]
  );

  const loadData = useCallback(() => {
    executeAutoRefresh(false);
  }, [executeAutoRefresh]);

  // Automated refresh when the application is opened (on mount, on window focus, on tab visibility change)
  useEffect(() => {
    // 1. Initial automated refresh upon opening the application
    executeAutoRefresh(false);

    // 2. Automate refresh when tab / app is opened or brought to foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        executeAutoRefresh(false);
      }
    };

    const handleFocus = () => {
      executeAutoRefresh(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // 3. Periodic synchronization every 7 seconds to keep latest approved articles always fresh
    const syncTimer = setInterval(() => {
      executeAutoRefresh(false);
    }, 7000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(syncTimer);
    };
  }, [executeAutoRefresh]);

  // Manual refresh button handler
  const handleRefresh = () => {
    executeAutoRefresh(true);
  };

  // Only approved articles appear in public views
  const approvedArticles = useMemo(() => {
    return articles.filter((a) => a.status === 'approved');
  }, [articles]);

  const pendingCount = useMemo(() => {
    return articles.filter((a) => a.status === 'pending').length;
  }, [articles]);

  // Breaking news for ticker
  const breakingArticles = useMemo(() => {
    const breaking = approvedArticles.filter((a) => a.isBreaking);
    return breaking.length > 0 ? breaking : approvedArticles.slice(0, 3);
  }, [approvedArticles]);

  // Filtered approved articles
  const filteredArticles = useMemo(() => {
    return approvedArticles.filter((article) => {
      const matchesCategory =
        selectedCategory === 'Semua' || article.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [approvedArticles, selectedCategory, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ITEMS_PER_PAGE));
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Required Navigation Actions (Kembali ke Halaman Depan / Home)
  const handleGoHome = () => {
    setActiveView('home');
    setSelectedCategory('Semua');
    setSearchQuery('');
    setCurrentPage(1);
    setSelectedArticle(null);
    setIsSubmitModalOpen(false);
    setIsAuthModalOpen(false);
    setIsCloseModalOpen(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('s');
      url.searchParams.delete('b');
      url.searchParams.delete('articleId');
      if (window.location.hash.startsWith('#s-') || window.location.hash.startsWith('#article')) {
        url.hash = '';
      }
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    } catch {
      // safe fallback
    }
    // Scroll window and document elements to top reliably
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  };

  const handlePrevPage = () => {
    if (activeView === 'article-detail' && selectedArticle) {
      // Navigate to previous article
      const currentIndex = approvedArticles.findIndex((a) => a.id === selectedArticle.id);
      if (currentIndex > 0) {
        setSelectedArticle(approvedArticles[currentIndex - 1]);
        return;
      }
    }
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (activeView === 'article-detail' && selectedArticle) {
      // Navigate to next article
      const currentIndex = approvedArticles.findIndex((a) => a.id === selectedArticle.id);
      if (currentIndex >= 0 && currentIndex < approvedArticles.length - 1) {
        setSelectedArticle(approvedArticles[currentIndex + 1]);
        return;
      }
    }
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  // Close Application handling (Required)
  const handleCloseAppClick = () => {
    setIsCloseModalOpen(true);
  };

  const handleConfirmCloseApp = () => {
    setIsCloseModalOpen(false);
    setIsAppClosed(true);
  };

  const handleReopenApp = () => {
    setIsAppClosed(false);
    handleGoHome();
  };

  // Auth Handling
  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    loadData();
  };

  const handleLogout = () => {
    storageService.setCurrentUser(null);
    setCurrentUser(null);
    handleGoHome();
  };

  // Quick switch role between Admin and Citizen for easy evaluation
  const handleSwitchRole = (targetRole: 'admin' | 'citizen') => {
    const users = storageService.getUsers();
    let target = users.find((u) => u.role === targetRole);
    if (!target) {
      target = targetRole === 'admin'
        ? {
            id: 'admin-auto',
            name: 'Redaktur Pelaksana (Admin)',
            email: 'admin@suararakyat.id',
            role: 'admin',
            registeredAt: new Date().toISOString(),
          }
        : {
            id: 'citizen-auto',
            name: 'Siti Rahmawati (Warga)',
            email: 'siti.rahma@gmail.com',
            role: 'citizen',
            registeredAt: new Date().toISOString(),
          };
    }
    storageService.setCurrentUser(target);
    setCurrentUser(target);
  };

  // Write Report Action (enforces login requirement)
  const handleOpenWriteReport = () => {
    if (!currentUser) {
      handleOpenAuth('signup');
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  // Article Submitted
  const handleArticleSubmitted = (_newArticle: NewsArticle) => {
    loadData();
  };

  // View article detail
  const handleSelectArticle = useCallback((article: NewsArticle) => {
    storageService.incrementViews(article.id);
    setSelectedArticle({ ...article, views: article.views + 1 });
    try {
      const url = new URL(window.location.href);
      const shortCode = article.id.replace('art-', '');
      url.searchParams.set('s', shortCode);
      url.searchParams.delete('articleId');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // safe fallback
    }
  }, []);


  const handleDismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleReadArticleFromToast = useCallback(
    (article: NewsArticle) => {
      handleSelectArticle(article);
    },
    [handleSelectArticle]
  );

  // Moderation Status Update (triggers toast when status is approved)
  const handleUpdateArticleStatus = (
    articleId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    const updated = storageService.updateArticleStatus(
      articleId,
      status,
      notes,
      currentUser?.name || 'Admin Redaksi'
    );
    setArticles(updated);

    if (status === 'approved') {
      const approvedItem = updated.find((a) => a.id === articleId);
      if (approvedItem) {
        showApprovedToast(approvedItem);
      }
    }
  };

  // Simulate an approved article toast for easy testing and evaluation
  const handleSimulateApprovedToast = useCallback(() => {
    const pendingArticle = articles.find((a) => a.status === 'pending');
    if (pendingArticle) {
      handleUpdateArticleStatus(
        pendingArticle.id,
        'approved',
        'Telah diverifikasi dan disetujui dewan redaksi Suara Rakyat.'
      );
    } else {
      const demoArticle: NewsArticle = {
        id: `demo-${Date.now()}`,
        title: 'Pemkot Resmikan Taman Kota Terbuka Hijau Baru Ramah Anak dan Disabilitas',
        content: 'Taman kota baru seluas 3 hektar kini resmi dibuka untuk warga dengan berbagai fasilitas olahraga, jalur pedestrian ramah kursi roda, serta perpustakaan alam terbuka yang dapat diakses gratis oleh masyarakat.',
        category: 'Infrastruktur & Layanan',
        imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Fasilitas taman ramah disabilitas yang baru saja diresmikan.',
        reporterName: 'Wulan Andriani (Jurnalis Warga)',
        whatsappNumber: '081233445566',
        location: 'Surabaya, Jawa Timur',
        incidentDate: '2026-10-14',
        createdAt: new Date().toISOString(),
        status: 'approved',
        reviewedBy: 'Admin Redaksi',
        reviewedAt: new Date().toISOString(),
        authorId: 'usr-citizen-demo',
        views: 28,
        reactions: { setuju: 19, penting: 35, prihatin: 0, bagikan: 12 },
        comments: [],
      };
      const updated = [demoArticle, ...articles];
      storageService.saveArticles(updated);
      setArticles(updated);
      showApprovedToast(demoArticle);
    }
  }, [articles, currentUser, showApprovedToast]);

  // Synchronize notifications across tabs and custom events
  useEffect(() => {
    const handleArticleApproved = (e: Event) => {
      const customEvent = e as CustomEvent<NewsArticle>;
      if (customEvent.detail) {
        showApprovedToast(customEvent.detail);
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'suara_rakyat_last_approved_article' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.article) {
            showApprovedToast(parsed.article);
            loadData();
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('article-approved', handleArticleApproved);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('article-approved', handleArticleApproved);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [showApprovedToast, loadData]);

  // Seed recent approved notifications list from loaded articles
  useEffect(() => {
    if (articles.length > 0) {
      setRecentApprovedNotifications((prev) => {
        if (prev.length > 0) return prev;
        return articles.filter((a) => a.status === 'approved').slice(0, 6);
      });
    }
  }, [articles]);

  const handleCloseArticle = () => {
    setSelectedArticle(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('s');
      url.searchParams.delete('b');
      url.searchParams.delete('articleId');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // safe fallback
    }
  };

  // Headline article for Hero
  const headlineArticle = approvedArticles.find((a) => a.isHeadline) || approvedArticles[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* 1. Top Header & Masthead */}
      <Header
        currentUser={currentUser}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        pendingReportsCount={pendingCount}
        breakingArticles={breakingArticles}
        onSelectArticle={handleSelectArticle}
        onWriteNews={handleOpenWriteReport}
        onGoHome={handleGoHome}
        recentApprovedArticles={recentApprovedNotifications}
        unreadNotificationsCount={unreadNotificationsCount}
        onClearNotifications={() => setUnreadNotificationsCount(0)}
        onSimulateApprovedToast={handleSimulateApprovedToast}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* 2. Primary Navigation Toolbar (Ke Home, Halaman Sebelumnya, Halaman Berikutnya, Refresh, Tutup Aplikasi) */}
      <NavigationToolbar
        onGoHome={handleGoHome}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onRefresh={handleRefresh}
        onCloseApp={handleCloseAppClick}
        onWriteReport={handleOpenWriteReport}
        canGoPrev={currentPage > 1 || (activeView === 'article-detail' && !!selectedArticle)}
        canGoNext={currentPage < totalPages || (activeView === 'article-detail' && !!selectedArticle)}
        currentPage={currentPage}
        totalPages={totalPages}
        isRefreshing={isRefreshing}
        lastUpdatedText={lastUpdatedText}
        currentUser={currentUser}
        onOpenAdmin={() => setActiveView('admin')}
        pendingCount={pendingCount}
      />

      {/* 3. Main Views Router */}
      <main className="flex-1">
        {/* ===================== VIEW: ADMIN MODERATION ===================== */}
        {activeView === 'admin' && (
          <AdminModeration
            articles={articles}
            currentUser={currentUser}
            onUpdateArticleStatus={handleUpdateArticleStatus}
            onBackToHome={handleGoHome}
            onViewArticleDetail={handleSelectArticle}
            onDataChanged={loadData}
            onWriteNews={handleOpenWriteReport}
            onSimulateApprovedToast={handleSimulateApprovedToast}
          />
        )}

        {/* ===================== VIEW: USER DASHBOARD ===================== */}
        {activeView === 'dashboard' && currentUser && (
          <UserDashboard
            currentUser={currentUser}
            articles={articles}
            onWriteNewReport={handleOpenWriteReport}
            onViewArticle={handleSelectArticle}
            onOpenAdminDesk={() => setActiveView('admin')}
            onGoHome={handleGoHome}
          />
        )}

        {/* ===================== VIEW: HOME / PORTAL BERITA ===================== */}
        {activeView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">

            {/* ===================== BANNER INSTALL APLIKASI SUARA RAKYAT (HALAMAN MUKA) ===================== */}
            <section aria-label="Install Aplikasi Suara Rakyat" className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl border-2 border-amber-500/60">
              {/* Background ambient lighting */}
              <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-red-600/15 blur-3xl pointer-events-none"></div>
              <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Logo & Headline */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400 bg-gradient-to-br from-red-700 to-red-950 p-1 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <img
                      src="/favicon.svg"
                      alt="Logo Resmi Suara Rakyat"
                      className="w-full h-full object-contain"
                      width="96"
                      height="96"
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-slate-950" />
                        Aplikasi Android Resmi
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        APK Siap Pasang
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700">
                        app-debug.apk
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black font-editorial tracking-tight text-white">
                      Pasang Aplikasi Suara Rakyat di Smartphone Anda
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                      Akses jurnalisme warga tercepat, kirim laporan fakta dari lingkungan Anda secara instan, dan dapatkan notifikasi berita penting terverifikasi langsung di ponsel Anda.
                    </p>
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                  <a
                    href="https://www.google.com/url?sa=E&q=https%3A%2F%2Fgithub.com%2Fariboim%2Fsuara-rakyat%2Freleases%2Flatest%2Fdownload%2Fapp-debug.apk"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Klik untuk mengunduh dan install langsung aplikasi Suara Rakyat"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-base font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 active:scale-95 transition-all shadow-xl shadow-red-700/40 hover:shadow-2xl border-2 border-amber-400/90 cursor-pointer group"
                  >
                    <Download className="w-5 h-5 text-amber-300 animate-bounce group-hover:scale-110 transition-transform" />
                    <span>Install Aplikasi (Unduh APK)</span>
                    <ExternalLink className="w-4 h-4 text-white/80" />
                  </a>
                </div>
              </div>
            </section>
            {/* Admin Desk notification banner if pending items exist */}
            {currentUser?.role === 'admin' && pendingCount > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950">
                      Ada {pendingCount} Laporan Berita Baru Menunggu Moderasi Redaksi!
                    </h3>
                    <p className="text-xs text-amber-800">
                      Verifikasi nomor WhatsApp pelapor dan pastikan keabsahan fakta sebelum diterbitkan.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveView('admin')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs"
                >
                  Buka Meja Moderasi Sekarang
                </button>
              </div>
            )}

            {/* Headline Hero Section (if on Page 1 and no search query) */}
            {currentPage === 1 && selectedCategory === 'Semua' && !searchQuery && headlineArticle && (
              <section aria-label="Berita Utama" className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div
                    onClick={() => handleSelectArticle(headlineArticle)}
                    className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[460px] cursor-pointer overflow-hidden group bg-slate-900"
                  >
                    <img
                      src={headlineArticle.imageUrl}
                      alt={headlineArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-md flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-300" />
                        Laporan Utama Warga
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-900">
                        {headlineArticle.category}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Terverifikasi Redaksi
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(headlineArticle.createdAt).toLocaleDateString('id-ID')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {headlineArticle.location}
                        </span>
                      </div>

                      <h2
                        onClick={() => handleSelectArticle(headlineArticle)}
                        className="font-serif font-black text-2xl sm:text-3xl text-slate-950 leading-tight hover:text-red-700 cursor-pointer transition-colors"
                      >
                        {headlineArticle.title}
                      </h2>

                      <p className="text-sm text-slate-600 line-clamp-4 leading-relaxed font-serif">
                        {headlineArticle.content}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">
                          Sumber / Pelapor: {headlineArticle.reporterName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Privasi Terjaga • {headlineArticle.views} pembaca
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSharingArticle(headlineArticle);
                          }}
                          title="Bagikan berita utama ke WhatsApp, Facebook, X, Telegram, LinkedIn, dll."
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Bagikan Medsos</span>
                        </button>

                        <button
                          onClick={() => handleSelectArticle(headlineArticle)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 transition-colors shadow-xs"
                        >
                          <span>Baca Lengkap</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Filter and Search Ribbon */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Rubrik:</span>
                  </div>
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-red-700 text-white shadow-xs'
                            : cat === 'Rekomendasi'
                            ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cat === 'Rekomendasi' && (
                          <Sparkles
                            className={`w-3.5 h-3.5 ${
                              isSelected ? 'text-amber-300 fill-amber-300' : 'text-amber-600 fill-amber-500'
                            }`}
                          />
                        )}
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Search Box */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berita warta warga..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-slate-50/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Active Search / Filter feedback */}
              {(selectedCategory !== 'Semua' || searchQuery) && (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>
                    Ditemukan <strong>{filteredArticles.length}</strong> berita
                    {selectedCategory !== 'Semua' && ` di kategori "${selectedCategory}"`}
                    {searchQuery && ` dengan kata kunci "${searchQuery}"`}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCategory('Semua');
                      setSearchQuery('');
                    }}
                    className="text-red-700 hover:underline font-bold"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* News Articles Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-700"></span>
                  <h3 className="font-editorial font-bold text-xl text-slate-900 tracking-tight">
                    {selectedCategory === 'Semua' ? 'Kabar Warga Terverifikasi' : selectedCategory}
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Halaman {currentPage} dari {totalPages}
                </span>
              </div>

              {paginatedArticles.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-lg">
                    Belum Ada Berita yang Sesuai
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Tidak menemukan berita untuk filter atau pencarian saat ini. Anda dapat menjadi orang pertama yang melaporkan fakta di daerah Anda!
                  </p>
                  <button
                    onClick={handleOpenWriteReport}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 transition-colors shadow-xs"
                  >
                    <PenSquare className="w-4 h-4" />
                    <span>Tulis Berita Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedArticles.map((article) => (
                    <article
                      key={article.id}
                      onClick={() => handleSelectArticle(article)}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group cursor-pointer"
                    >
                      <div>
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden bg-slate-100">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span
                            className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs text-white ${
                              article.category === 'Rekomendasi'
                                ? 'bg-amber-600/95 border border-amber-300/40 shadow-xs'
                                : 'bg-slate-900/80'
                            }`}
                          >
                            {article.category === 'Rekomendasi' && '⭐ '}
                            {article.category}
                          </span>
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/90 text-white flex items-center gap-1 shadow-xs">
                            <CheckCircle className="w-3 h-3" />
                            Terverifikasi
                          </span>
                        </div>

                        {/* Text */}
                        <div className="p-5 space-y-2.5">
                          <div className="flex items-center gap-2 text-[11px] text-slate-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(article.createdAt).toLocaleDateString('id-ID')}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {article.location}
                            </span>
                          </div>

                          <h3 className="font-serif font-bold text-slate-950 text-lg leading-snug group-hover:text-red-700 transition-colors line-clamp-2">
                            {article.title}
                          </h3>

                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-serif">
                            {article.content}
                          </p>
                        </div>
                      </div>

                      {/* Author attribution (Notice: No WA displayed to public!) */}
                      <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-800 truncate">
                            Sumber: {article.reporterName}
                          </p>
                          <p className="text-[10px] text-slate-600">
                            🔒 Kontak privat terlindungi
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSharingArticle(article);
                            }}
                            title="Bagikan berita ke WhatsApp, Facebook, X, Telegram, dll."
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 border border-emerald-200 transition-colors cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Bagikan</span>
                          </button>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 pl-0.5">
                            <Eye className="w-3.5 h-3.5" />
                            {article.views}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls bar at bottom */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    currentPage > 1
                      ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  ← Halaman Sebelumnya
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        currentPage === pg
                          ? 'bg-red-700 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    currentPage < totalPages
                      ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  Halaman Berikutnya →
                </button>
              </div>
            )}

            {/* Citizen Journalism Invitation Banner */}
            <section className="bg-gradient-to-r from-red-800 via-rose-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-red-200 text-xs font-bold border border-white/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gerakan Suara Warga Indonesia
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight font-editorial">
                    Punya Fakta Peristiwa di Sekitar Anda?
                  </h3>
                  <p className="text-xs sm:text-sm text-red-100 max-w-xl leading-relaxed">
                    Daftar akun jurnalisme warga, tulis berita dengan jujur, lampirkan bukti foto. Berita Anda akan ditinjau tim redaksi kami dan disiarkan untuk kemaslahatan bersama.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <button
                    onClick={handleOpenWriteReport}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all text-sm shadow-md cursor-pointer"
                  >
                    <PenSquare className="w-4 h-4" />
                    <span>Kirim Berita Sekarang</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* 4. Article Detail Modal */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={handleCloseArticle}
        onPrevArticle={handlePrevPage}
        onNextArticle={handleNextPage}
        hasPrev={
          approvedArticles.findIndex((a) => a.id === selectedArticle?.id) > 0
        }
        hasNext={
          approvedArticles.findIndex((a) => a.id === selectedArticle?.id) >= 0 &&
          approvedArticles.findIndex((a) => a.id === selectedArticle?.id) <
            approvedArticles.length - 1
        }
        currentUser={currentUser}
        onRequireAuth={() => handleOpenAuth('signup')}
        onArticleUpdated={(updated) => {
          setSelectedArticle(updated);
          loadData();
        }}
        onWriteNews={handleOpenWriteReport}
        onGoHome={handleGoHome}
      />

      {/* 5. Auth Modal (Sign Up & Login with celebration) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authInitialMode}
        onSuccess={handleAuthSuccess}
        onGoToWriteReport={() => {
          setIsAuthModalOpen(false);
          setIsSubmitModalOpen(true);
        }}
      />

      {/* 6. Submit News Modal */}
      <SubmitNewsModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        currentUser={currentUser}
        onRequireAuth={() => handleOpenAuth('signup')}
        onArticleSubmitted={handleArticleSubmitted}
        onOpenAdminPanel={() => {
          setIsSubmitModalOpen(false);
          setActiveView('admin');
        }}
      />

      {/* 7. Close Application Modal / Closed View */}
      <CloseAppModal
        isOpen={isCloseModalOpen}
        isAppClosed={isAppClosed}
        onCancel={() => setIsCloseModalOpen(false)}
        onConfirmClose={handleConfirmCloseApp}
        onReopenApp={handleReopenApp}
      />

      {/* 8. Global Share Modal for Quick Sharing to Social Media */}
      <ShareModal
        isOpen={!!sharingArticle}
        onClose={() => setSharingArticle(null)}
        article={sharingArticle}
        onShared={() => {
          if (sharingArticle) {
            storageService.addReaction(sharingArticle.id, 'bagikan');
          }
        }}
      />

      {/* 9. Editorial Footer */}
      <Footer
        onSelectCategory={(cat) => {
          handleGoHome();
          setSelectedCategory(cat);
        }}
        onGoHome={handleGoHome}
        onOpenReportModal={handleOpenWriteReport}
      />

      {/* 10. Toast Notification System for Newly Approved Articles */}
      <ToastNotificationContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
        onReadArticle={handleReadArticleFromToast}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />
    </div>
  );
}
