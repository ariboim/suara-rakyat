import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  Newspaper,
  MapPin,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { NewsArticle } from '../types';

export interface ToastNotificationItem {
  id: string;
  article: NewsArticle;
  timestamp: number;
  duration?: number; // duration in ms, default 8000
  isAuthorNotification?: boolean; // Set to true when notifying the author of the approved article
  customMessage?: string; // Optional custom message e.g. "Selamat berita anda telah ditayangkan, silakan cek halaman utama"
  customTitle?: string;
}

interface ToastNotificationContainerProps {
  toasts: ToastNotificationItem[];
  onDismiss: (id: string) => void;
  onReadArticle: (article: NewsArticle) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

// Gentle pleasant synthesizer chime using Web Audio API
export const playNotificationChime = (isAuthor = false) => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    if (isAuthor) {
      // Triumphant 3-note chime for author celebration (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.12, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
      return;
    }

    // Default note: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Second note: A5 (880 Hz) - uplifting confirmation
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.1, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch {
    // Non-critical if browser blocks unmuted audio
  }
};

const SingleToastCard: React.FC<{
  item: ToastNotificationItem;
  onDismiss: (id: string) => void;
  onReadArticle: (article: NewsArticle) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}> = ({ item, onDismiss, onReadArticle, soundEnabled, onToggleSound }) => {
  const { id, article, duration = 8500, isAuthorNotification, customMessage } = item;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(duration);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      if (isPaused) {
        lastTickRef.current = Date.now();
        return;
      }

      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - delta);
      const newProgress = (remainingTimeRef.current / duration) * 100;
      setProgress(newProgress);

      if (remainingTimeRef.current <= 0) {
        clearInterval(interval);
        onDismiss(id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [id, duration, isPaused, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`group relative text-white backdrop-blur-md rounded-2xl shadow-2xl p-4 transition-all duration-300 overflow-hidden transform animate-in slide-in-from-top-3 fade-in duration-300 pointer-events-auto border ${
        isAuthorNotification
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/90 border-amber-400/80 shadow-amber-900/30 ring-2 ring-amber-400/40'
          : 'bg-slate-900/95 border-slate-700/80 hover:shadow-emerald-950/40 hover:border-emerald-600/60'
      }`}
    >
      {/* Top Header Pill */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isAuthorNotification ? 'bg-amber-400' : 'bg-emerald-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isAuthorNotification ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></span>
          </span>
          <span className={`text-[11px] font-black uppercase tracking-wider truncate ${
            isAuthorNotification ? 'text-amber-300 flex items-center gap-1' : 'text-emerald-400'
          }`}>
            {isAuthorNotification ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Kabar Baik Untuk Anda (Penulis)</span>
              </>
            ) : (
              'Berita Baru Disetujui'
            )}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 truncate hidden sm:inline-block">
            {article.category}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              title={soundEnabled ? 'Matikan suara notifikasi' : 'Nyalakan suara notifikasi'}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className={`w-3.5 h-3.5 ${isAuthorNotification ? 'text-amber-400' : 'text-emerald-400'}`} />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => onDismiss(id)}
            title="Tutup notifikasi"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Author Celebration Banner (Specific text requested by user) */}
      {isAuthorNotification && (
        <div className="mb-2.5 p-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-xs font-bold text-amber-200 flex items-center gap-2">
          <span className="text-base">🎉</span>
          <span className="leading-snug">
            {customMessage || 'Selamat berita anda telah ditayangkan, silakan cek halaman utama'}
          </span>
        </div>
      )}

      {/* Article Content Info */}
      <div className="flex gap-3 items-start">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 border border-slate-700/60 bg-slate-800"
          />
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 text-slate-400">
            <Newspaper className="w-6 h-6" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-serif font-bold text-sm sm:text-base text-white leading-snug line-clamp-2 group-hover:text-amber-200 transition-colors">
            {article.title}
          </h4>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400 mt-1">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <User className="w-3 h-3 text-slate-400" />
              {article.reporterName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400 truncate">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              {article.location}
            </span>
          </div>
        </div>
      </div>

      {/* Subtitle / Verification note */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium truncate">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {isAuthorNotification ? 'Telah disetujui & terbit di beranda' : 'Diverifikasi & layak tayang untuk warga'}
          </span>
        </div>

        {/* Action Button: Cek Halaman Utama / Baca Sekarang */}
        <button
          type="button"
          onClick={() => {
            onReadArticle(article);
            onDismiss(id);
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer ${
            isAuthorNotification
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
              : 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
          }`}
        >
          <span>{isAuthorNotification ? 'Cek Halaman Utama' : 'Baca Sekarang'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress countdown indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastNotificationContainer: React.FC<ToastNotificationContainerProps> = ({
  toasts,
  onDismiss,
  onReadArticle,
  soundEnabled = true,
  onToggleSound,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-20 right-4 sm:right-6 md:right-8 z-[100] flex flex-col gap-3 w-[calc(100vw-2rem)] max-w-md pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <SingleToastCard
          key={item.id}
          item={item}
          onDismiss={onDismiss}
          onReadArticle={onReadArticle}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
        />
      ))}
    </div>
  );
};
