import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Store, Clock, Users, Phone, MapPin, Bell, Sparkles, 
  QrCode, CheckCircle2, Share2, Send, MessageCircle, ArrowRight,
  Download, Radio, Navigation, ShieldCheck, Heart
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { QueueService } from '../services/queueService';
import { BotService, ActiveBotProviderInfo } from '../services/botService';
import { AnalyticsService } from '../services/analyticsService';
import { ClickablePromoBanner } from '../components/ClickablePromoBanner';
import { AudioRadioPlayer } from '../components/AudioRadioPlayer';
import { usePwaInstall } from '../components/PwaPrompt';
import { Shop, QueueItem } from '../types';
import { toPersianDigits } from '../utils/jalali';

import stepScanImg from '../assets/images/bisaf_step_scan_1786231431644.jpg';
import stepQueueImg from '../assets/images/bisaf_step_queue_1786231442058.jpg';
import stepNotifyImg from '../assets/images/bisaf_step_notify_1786231450473.jpg';

export const PublicShopPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Default to light mode for public customers (better aesthetics for first-time users)
    if (!localStorage.getItem('theme_preference_set')) {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('theme_preference_set', 'true');
      document.documentElement.classList.remove('dark');
      window.dispatchEvent(new Event('theme-change'));
    }
  }, []);

  const [shop, setShop] = useState<Shop | null>(null);
  const [queueData, setQueueData] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeBots, setActiveBots] = useState<ActiveBotProviderInfo[]>([]);
  const { canInstall, install } = usePwaInstall();

  useEffect(() => {
    setActiveBots(BotService.getActiveBotProviders());
  }, []);

  useEffect(() => {
    const found = StorageService.getShopBySlug(slug);
    setShop(found);

    if (found) {
      const qData = QueueService.getShopQueue(found.id);
      setQueueData(qData);

      const currentUser = StorageService.getCurrentUser();
      if (currentUser?.id) {
        const favs = StorageService.getFavorites(currentUser.id);
        setIsFavorite(favs.some(f => f.shop_id === found.id));
      }

      // Track Analytics
      AnalyticsService.trackEvent({ event_name: 'page_view', shop_id: found.id });
      AnalyticsService.trackEvent({ event_name: 'qr_scan', shop_id: found.id });
    }
  }, [slug]);

  // Periodic Queue Polling for Real-time Display
  useEffect(() => {
    if (!shop?.id) return;
    const interval = setInterval(() => {
      setQueueData(QueueService.getShopQueue(shop.id));
    }, 4000);
    return () => clearInterval(interval);
  }, [shop?.id]);

  if (!shop || !queueData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">در حال بارگذاری مرکز...</p>
        </div>
      </div>
    );
  }

  const handleToggleFavorite = () => {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser?.id) {
      const newFav = StorageService.toggleFavorite(currentUser.id, shop.id);
      setIsFavorite(newFav);
    } else {
      navigate('/login');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `سامانه نوبت‌دهی ${shop.name}`,
          text: `مشاهده وضعیت زنده نوبت و صف ${shop.name} در بی‌صف`,
          url: window.location.href,
        });
      } catch {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('لینک صفحه فروشگاه کپی شد!');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100/60 dark:bg-slate-950 py-3 sm:py-5 px-3 sm:px-4 max-w-2xl mx-auto space-y-3.5 sm:space-y-4 animate-fade-in font-sans">
      
      {/* 🔴 TOP LEVEL: LIVE QUEUE SERVING DISPLAY (طراحی بدون نیاز به اسکرول و دسترسی یک‌دستی) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" />

        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <span className="text-xs font-black text-rose-400">
              تابلوی اعلام نوبت زنده مرکز
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite 
                  ? 'bg-rose-500 text-white border-rose-400' 
                  : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
              }`}
              title="علاقه‌مندی"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              title="اشتراک‌گذاری"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Highlighted Numbers: Serving & Waiting */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 py-3.5 text-center">
          {/* Serving Number - Highlight Red */}
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-center items-center shadow-inner">
            <span className="text-[11px] font-bold text-rose-300 mb-0.5">
              در حال تحویل 🍞
            </span>
            <span className="text-2xl sm:text-4xl font-black text-rose-400 font-mono tracking-tight animate-pulse">
              {queueData.servingItem ? toPersianDigits(queueData.servingItem.ticket_number) : '—'}
            </span>
            <span className="text-[10px] text-rose-300/80 font-bold truncate max-w-full mt-0.5">
              {queueData.servingItem ? (queueData.servingItem.ticket_type === 'in_person_single' ? 'نوبت تکی' : `${toPersianDigits(queueData.servingItem.quantity)} نان`) : 'آماده فراخوان'}
            </span>
          </div>

          {/* Waiting Count */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-center items-center">
            <span className="text-[11px] font-bold text-slate-300 mb-0.5">
              افراد در صف
            </span>
            <span className="text-2xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
              {toPersianDigits(queueData.waitingCount)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold mt-0.5">
              نفر در انتظار
            </span>
          </div>

          {/* Estimated Wait Time */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-center items-center">
            <span className="text-[11px] font-bold text-slate-300 mb-0.5">
              تخمین انتظار
            </span>
            <span className="text-base sm:text-xl font-extrabold text-amber-300 tracking-tight mt-1">
              {queueData.estimatedWait.text}
            </span>
            <span className="text-[10px] text-slate-400 font-bold mt-0.5">
              زمان تقریبی
            </span>
          </div>
        </div>

        {/* Address and quick info */}
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">{shop.address}</span>
          </div>
          {shop.phone && (
            <div className="flex items-center gap-1 shrink-0 font-mono text-[11px] text-slate-400">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{toPersianDigits(shop.phone)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 🚀 SECTION 2: 3-STEP VISUAL GUIDE (راهنمای مصور ۳ گامی نوبت‌گیری آسان بی‌صف) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              چگونه با بی‌صف نوبت بگیریم؟
            </h3>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
            ۳ مرحله ساده
          </span>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Step 1: Scan QR */}
          <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden mb-1.5 shadow-sm border border-emerald-500/20">
              <img 
                src={stepScanImg} 
                alt="اسکن بارکد بی‌صف" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[11px] font-black text-slate-900 dark:text-slate-100">
              ۱. اسکن بارکد
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
              با دوربین گوشی بدون نصب برنامه
            </span>
          </div>

          {/* Step 2: Queue Status */}
          <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden mb-1.5 shadow-sm border border-amber-500/20">
              <img 
                src={stepQueueImg} 
                alt="دریافت نوبت بی‌صف" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[11px] font-black text-slate-900 dark:text-slate-100">
              ۲. دریافت نوبت
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
              مشاهده افراد جلوتر و تخمین زمان
            </span>
          </div>

          {/* Step 3: Notification */}
          <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden mb-1.5 shadow-sm border border-indigo-500/20">
              <img 
                src={stepNotifyImg} 
                alt="فراخوان هوشمند بی‌صف" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[11px] font-black text-slate-900 dark:text-slate-100">
              ۳. تحویل با پیامک
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
              اعلان صوتی و پیامک رسیدن نوبت
            </span>
          </div>
        </div>
      </div>

      {/* 📲 SECTION 3: PWA INSTALLATION & VALUE PROPOSITION (بخش تبدیل کاربر و نصب سریع) */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-emerald-400/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px]">
                نصب فوری PWA
              </span>
              <span className="text-[11px] font-extrabold text-emerald-100">
                بدون اشغال حافظه
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
              اپلیکیشن بی‌صف را نصب کنید و نانوایی‌های فعال را روی نقشه ببینید
            </h4>
            <p className="text-[10px] sm:text-[11px] text-emerald-100/90 leading-tight">
              مشاهده صف‌های اطراف، دریافت تخفیف‌های ویژه مراکز، و اعلان صوتی زنده
            </p>
          </div>
          {canInstall ? (
            <button
              onClick={install}
              className="w-full sm:w-auto px-4 py-2.5 bg-white text-emerald-700 font-black rounded-xl text-xs shadow-md transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              نصب با یک کلیک
            </button>
          ) : (
            <div className="bg-emerald-800/40 px-3 py-2 rounded-xl border border-emerald-500/30 text-[10px] font-bold text-emerald-100 text-center">
              برای نصب، در منوی مرورگر خود گزینه<br/>«Add to Home Screen» را انتخاب کنید.
            </div>
          )}
        </div>
      </div>

      {/* 🌟 SECTION 4: CLICKABLE PROMO BANNER */}
      <ClickablePromoBanner shop={shop} />

      {/* 📻 SECTION 5: LIVE INTERNET RADIO BISAF (۱۰ کانال استریم فارسی) */}
      <div className="space-y-1.5 pt-1">
        <AudioRadioPlayer />
      </div>

    </div>
  );
};
export default PublicShopPage;
