/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
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
} from 'lucide-react';
import { NewsArticle, NewsCategory, User, ActiveView } from './types';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { NavigationToolbar } from './components/NavigationToolbar';
import { AuthModal } from './components/AuthModal';
import { SubmitNewsModal } from './components/SubmitNewsModal';
import { AdminModeration } from './components/AdminModeration';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { UserDashboard } from './components/UserDashboard';
import { CloseAppModal } from './components/CloseAppModal';
import { Footer } from './components/Footer';

const CATEGORIES: NewsCategory[] = [
  'Semua',
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

  // Refresh feedback state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedText, setLastUpdatedText] = useState('Baru saja');

  // Load initial data from storage
  const loadData = useCallback(() => {
    const loadedArticles = storageService.getArticles();
    const loadedUser = storageService.getCurrentUser();
    setArticles(loadedArticles);
    setCurrentUser(loadedUser);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Deep linking: Automatically open article if URL has ?s=... (short url) or ?articleId=...
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const articleIdParam = urlParams.get('articleId');
      const shortCodeParam = urlParams.get('s') || urlParams.get('b');
      const hashParam = window.location.hash.replace(/^#\/?/, '').replace(/^s-/, '');

      const targetCode = shortCodeParam || articleIdParam || hashParam;

      if (targetCode && articles.length > 0) {
        const found = articles.find(
          (a) =>
            a.id === targetCode ||
            a.id === `art-${targetCode}` ||
            a.id.replace('art-', '') === targetCode
        );
        if (found) {
          setSelectedArticle(found);
        }
      }
    } catch {
      // safe fallback
    }
  }, [articles]);

  // Refresh handler (as explicitly requested: "Tampilkan tombol refresh pada aplikasi untuk melihat berita terbaru")
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
      const now = new Date();
      setLastUpdatedText(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      );
    }, 450);
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

  // Moderation Status Update
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
  };

  // View article detail
  const handleSelectArticle = (article: NewsArticle) => {
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
  };

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
              </section>
            )}

            {/* Filter and Search Ribbon */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Kategori:</span>
                  </div>
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-red-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
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
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-xs text-white">
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

                        <div className="flex items-center gap-2 shrink-0 text-slate-600">
                          <span className="flex items-center gap-1 text-[11px]">
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

      {/* 8. Editorial Footer */}
      <Footer
        onSelectCategory={(cat) => {
          handleGoHome();
          setSelectedCategory(cat);
        }}
        onGoHome={handleGoHome}
        onOpenReportModal={handleOpenWriteReport}
      />
    </div>
  );
}
