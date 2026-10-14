import { NewsArticle, User } from '../types';
import { INITIAL_ARTICLES, INITIAL_USERS } from '../data/initialData';

const ARTICLES_KEY = 'suara_rakyat_articles_v1';
const USERS_KEY = 'suara_rakyat_users_v1';
const CURRENT_USER_KEY = 'suara_rakyat_current_user_v1';

export const storageService = {
  getArticles(): NewsArticle[] {
    try {
      const data = localStorage.getItem(ARTICLES_KEY);
      if (!data) {
        localStorage.setItem(ARTICLES_KEY, JSON.stringify(INITIAL_ARTICLES));
        return INITIAL_ARTICLES;
      }
      const parsed: NewsArticle[] = JSON.parse(data);
      let changed = false;
      INITIAL_ARTICLES.forEach((initArt) => {
        if (!parsed.some((p) => p.id === initArt.id)) {
          parsed.push(initArt);
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(ARTICLES_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_ARTICLES;
    }
  },

  saveArticles(articles: NewsArticle[]): void {
    try {
      localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
    } catch (err) {
      console.error('Error saving articles', err);
    }
  },

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (!data) {
        localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: User[]): void {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (err) {
      console.error('Error saving users', err);
    }
  },

  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (err) {
      console.error('Error saving current user', err);
    }
  },

  addArticle(newArticle: Omit<NewsArticle, 'id' | 'createdAt' | 'status' | 'views' | 'reactions' | 'comments'>): NewsArticle {
    const articles = this.getArticles();
    const article: NewsArticle = {
      ...newArticle,
      id: `art-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending', // Wajib pending untuk moderasi admin
      views: 0,
      reactions: { setuju: 0, penting: 0, prihatin: 0, bagikan: 0 },
      comments: [],
    };
    const updated = [article, ...articles];
    this.saveArticles(updated);
    return article;
  },

  updateArticleStatus(articleId: string, status: 'approved' | 'rejected', notes?: string, adminName: string = 'Admin Redaksi'): NewsArticle[] {
    const articles = this.getArticles();
    const updated = articles.map((art) => {
      if (art.id === articleId) {
        return {
          ...art,
          status,
          moderationNotes: notes || (status === 'approved' ? 'Laporan telah diverifikasi redaksi dan layak tayang.' : 'Belum memenuhi standar jurnalisme warga.'),
          reviewedBy: adminName,
          reviewedAt: new Date().toISOString(),
        };
      }
      return art;
    });
    this.saveArticles(updated);
    return updated;
  },

  incrementViews(articleId: string): void {
    const articles = this.getArticles();
    const updated = articles.map((art) => {
      if (art.id === articleId) {
        return { ...art, views: art.views + 1 };
      }
      return art;
    });
    this.saveArticles(updated);
  },

  addReaction(articleId: string, type: 'setuju' | 'penting' | 'prihatin' | 'bagikan'): NewsArticle | null {
    const articles = this.getArticles();
    let updatedArticle: NewsArticle | null = null;
    const updated = articles.map((art) => {
      if (art.id === articleId) {
        const reactions = { ...art.reactions, [type]: art.reactions[type] + 1 };
        updatedArticle = { ...art, reactions };
        return updatedArticle;
      }
      return art;
    });
    this.saveArticles(updated);
    return updatedArticle;
  },

  addComment(
    articleId: string,
    commentData: {
      authorName: string;
      authorEmail: string;
      authorId?: string;
      authorAvatar?: string;
      authorRole?: 'citizen' | 'admin';
      content: string;
    }
  ): NewsArticle | null {
    const articles = this.getArticles();
    let updatedArticle: NewsArticle | null = null;
    const updated = articles.map((art) => {
      if (art.id === articleId) {
        // Enforce: only approved articles can receive comments
        if (art.status !== 'approved') {
          return art;
        }
        const newComment = {
          id: `cmt-${Date.now()}`,
          articleId,
          authorId: commentData.authorId,
          authorName: commentData.authorName,
          authorEmail: commentData.authorEmail,
          authorAvatar:
            commentData.authorAvatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(commentData.authorName)}&backgroundColor=dc2626`,
          authorRole: commentData.authorRole || 'citizen',
          content: commentData.content,
          createdAt: new Date().toISOString(),
          likes: 0,
          reportsCount: 0,
          reportReasons: [],
          isReported: false,
          isPinned: false,
        };
        updatedArticle = { ...art, comments: [newComment, ...art.comments] };
        return updatedArticle;
      }
      return art;
    });
    this.saveArticles(updated);
    return updatedArticle;
  },

  deleteComment(articleId: string, commentId: string): NewsArticle | null {
    const articles = this.getArticles();
    let updatedArticle: NewsArticle | null = null;
    const updated = articles.map((art) => {
      if (art.id === articleId) {
        const filteredComments = art.comments.filter((c) => c.id !== commentId);
        updatedArticle = { ...art, comments: filteredComments };
        return updatedArticle;
      }
      return art;
    });
    this.saveArticles(updated);
    return updatedArticle;
  },

  reportComment(articleId: string, commentId: string, reason: string): NewsArticle | null {
    const articles = this.getArticles();
    let updatedArticle: NewsArticle | null = null;
    const updated = articles.map((art) => {
      if (art.id === articleId) {
        const updatedComments = art.comments.map((c) => {
          if (c.id === commentId) {
            const currentReasons = c.reportReasons || [];
            return {
              ...c,
              reportsCount: (c.reportsCount || 0) + 1,
              reportReasons: [...currentReasons, reason],
              isReported: true,
            };
          }
          return c;
        });
        updatedArticle = { ...art, comments: updatedComments };
        return updatedArticle;
      }
      return art;
    });
    this.saveArticles(updated);
    return updatedArticle;
  },

  dismissCommentReports(articleId: string, commentId: string): NewsArticle | null {
    const articles = this.getArticles();
    let updatedArticle: NewsArticle | null = null;
    const updated = articles.map((art) => {
      if (art.id === articleId) {
        const updatedComments = art.comments.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              reportsCount: 0,
              reportReasons: [],
              isReported: false,
            };
          }
          return c;
        });
        updatedArticle = { ...art, comments: updatedComments };
        return updatedArticle;
      }
      return art;
    });
    this.saveArticles(updated);
    return updatedArticle;
  },

  togglePinComment(articleId: string, commentId: string): NewsArticle | null {
    const articles = this.getArticles();
    let updatedArticle: NewsArticle | null = null;
    const updated = articles.map((art) => {
      if (art.id === articleId) {
        const updatedComments = art.comments.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              isPinned: !c.isPinned,
            };
          }
          return c;
        });
        // Sort so pinned comments appear first
        updatedComments.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
        updatedArticle = { ...art, comments: updatedComments };
        return updatedArticle;
      }
      return art;
    });
    this.saveArticles(updated);
    return updatedArticle;
  },

  likeComment(articleId: string, commentId: string): NewsArticle | null {
    const articles = this.getArticles();
    let updatedArticle: NewsArticle | null = null;
    const updated = articles.map((art) => {
      if (art.id === articleId) {
        const updatedComments = art.comments.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              likes: (c.likes || 0) + 1,
            };
          }
          return c;
        });
        updatedArticle = { ...art, comments: updatedComments };
        return updatedArticle;
      }
      return art;
    });
    this.saveArticles(updated);
    return updatedArticle;
  },

  resetToDefault(): void {
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(INITIAL_ARTICLES));
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  },
};
