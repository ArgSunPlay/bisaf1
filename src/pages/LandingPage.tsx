import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Ticket, Clock, Smartphone, Bell, ShieldCheck, Check,
  ArrowLeft, Info, HelpCircle, PhoneCall, Sparkles,
  Utensils, Scissors, Store, Armchair, Users, User, LogOut
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { LandingFooterConfig, Profile } from '../types';

import scanImg from '../assets/images/bisaf_step_scan_1786231431644.jpg';
import queueImg from '../assets/images/bisaf_step_queue_1786231442058.jpg';
import notifyImg from '../assets/images/bisaf_step_notify_1786231450473.jpg';

const LOCATION_CATEGORIES = [
  { id: 'restaurant', name: 'رستوران', icon: Utensils, color: 'bg-rose-500 text-white border-rose-600', inactiveColor: 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60' },
  { id: 'barber', name: 'آرایشگاه', icon: Scissors, color: 'bg-indigo-500 text-white border-indigo-600', inactiveColor: 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60' },
  { id: 'bakery', name: 'نانوایی', icon: Store, color: 'bg-amber-500 text-white border-amber-600', inactiveColor: 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60' }
];

const HIGH_QUEUE_PLACES = [
  'نانوایی',
  'مطب و درمانگاه',
  'ادارات',
  'دادگاه',
  'آزمایشگاه',
  'رستوران و کافه',
  'بانک و دفاتر خدمات',
  'فروشگاه و سوپرمارکت'
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // User state
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => StorageService.getCurrentUser());

  // Footer & CTA dynamic config state
  const [footerConfig, setFooterConfig] = useState<LandingFooterConfig>(() => StorageService.getFooterConfig());

  // Selected category state
  const [selectedCategory, setSelectedCategory] = useState<string>('bakery');
  // Footer info modals state
  const [activeModal, setActiveModal] = useState<'about' | 'help' | 'support' | null>(null);

  // Dynamic high queue locations rotating state
  const [placeIndex, setPlaceIndex] = useState<number>(0);
  const [fade, setFade] = useState<boolean>(true);

  useEffect(() => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPlaceIndex((prev) => (prev + 1) % HIGH_QUEUE_PLACES.length);
        setFade(true);
      }, 250);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  const isLoggedIn = Boolean(currentUser && currentUser.id && currentUser.id !== 'guest');
  const isCustomer = currentUser?.role === 'customer';
  const isNonCustomer = isLoggedIn && !isCustomer;

  const selectedCatObj = LOCATION_CATEGORIES.find(c => c.id === selectedCategory) || LOCATION_CATEGORIES[2];

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 selection:bg-emerald-500/20 selection:text-emerald-700">
      
      {/* MAIN HERO CONTENT SECTION */}
      <section className="relative overflow-hidden pt-3 pb-6 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">
        
        {/* Soft Ambient Radial Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* 2. CENTRAL CORE SECTION (3 OPTIONS) */}
        <div className="space-y-4 pt-1 font-['Vazirmatn',sans-serif]">
          {/* Section Header: Text "با بی‌صف" */}
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black leading-[36px] text-slate-900 dark:text-white">
              با بی‌صف
            </h2>
          </div>

          {/* 3 Options (Vertical gap: 8px) - Centered layout */}
          <div className="space-y-3 w-full max-w-md mx-auto">
            {/* Option 1: Green Checkmark 32px + "به سادگی" -> Animation: Left Entrance & Centered Content */}
            <div className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-slide-in-left">
              <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                به سادگی
              </span>
            </div>

            {/* Option 2: Green Checkmark 32px + "به رایگان" -> Animation: Right Entrance & Centered Content */}
            <div className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-slide-in-right">
              <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                به رایگان
              </span>
            </div>

            {/* Option 3: Green Checkmark 32px + "بی‌معطلی" -> Animation: Left Entrance & Centered Content */}
            <div className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-slide-in-left">
              <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                بی‌معطلی
              </span>
            </div>
          </div>
        </div>

        {/* 3. SECTION (LOCATION/QUEUE TYPES DYNAMIC DISPLAY) */}
        <div className="pt-4 pb-1 space-y-1 text-center">
          {/* Line 1: Large "در" */}
          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">
            در
          </div>
          {/* Line 2: Dynamic text (larger font size than "در") cycling through high queue locations including bakery */}
          <div className="h-12 flex items-center justify-center">
            <span 
              className={`text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 transition-all duration-300 transform ${
                fade ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1'
              }`}
            >
              {HIGH_QUEUE_PLACES[placeIndex]}
            </span>
          </div>
          {/* Line 3: "نوبت بگیر" */}
          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200 pt-2">
            نوبت بگیر
          </div>
        </div>





      </section>



      {/* 4. TRUST & VALUE BENEFITS (DIRECTLY BELOW GREEN CTA BUTTON) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 hidden sm:block">
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">
            مزایای استفاده از بی‌صف
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">کمتر در صف بمان</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">مدیریت زمان بدون اتلاف وقت حضوری</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">از هرجا وضعیت را ببین</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">مشاهده زنده موقعیت صف روی گوشی</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">نزدیک نوبت باخبر شو</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">پیامک و هشدار در پیام‌رسان‌ها</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">رایگان شروع کن</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">بدون نیاز به نصب یا پرداخت هزینه</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 5. THREE-STEP VISUAL STORY (DIRECTLY BELOW BENEFITS SECTION) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            روش ساده استفاده
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            بی‌صف چگونه کار می‌کند؟
          </h2>
        </div>

        {/* Grid Flow of 3 Steps on Desktop / Vertical on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* STEP 1 — SCAN */}
          <div className="space-y-4 text-center sm:text-right">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm aspect-[4/3]">
              <img 
                src={scanImg} 
                alt="مرد مسن در حال اسکن QR کد بی‌صف در ورودی فروشگاه با تلفن همراه" 
                className="w-full h-full object-cover object-center"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-extrabold border border-white/10">
                گام اول
              </div>
            </div>

            <div className="space-y-1.5 px-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                ۱. QR کد را اسکن کن
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                QR کد بی‌صف را در ورودی مرکز اسکن کن.
              </p>
            </div>
          </div>

          {/* STEP 2 — TAKE A QUEUE NUMBER */}
          <div className="space-y-4 text-center sm:text-right">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm aspect-[4/3]">
              <img 
                src={queueImg} 
                alt="تصویر صفحه نمایش گوشی در حال دریافت فیش نوبت دیجیتال بی‌صف" 
                className="w-full h-full object-cover object-center"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-extrabold border border-white/10">
                گام دوم
              </div>
            </div>

            <div className="space-y-1.5 px-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                ۲. نوبتت را بگیر
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                نوبتت را بگیر و هرجا خواستی منتظر بمان.
              </p>
            </div>
          </div>

          {/* STEP 3 — GET NOTIFIED */}
          <div className="space-y-4 text-center sm:text-right">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm aspect-[4/3]">
              <img 
                src={notifyImg} 
                alt="اعلان هوشمند روی صفحه گوشی با پیام فقط ۳ نفر تا نوبت شما باقی مانده" 
                className="w-full h-full object-cover object-center"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-extrabold border border-white/10">
                گام سوم
              </div>
            </div>

            <div className="space-y-1.5 px-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                ۳. نزدیک نوبتت باخبر شو
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                وقتی نوبتت نزدیک شد، بهت اطلاع می‌دهیم.
              </p>
            </div>
          </div>

        </div>

      </section>


      {/* 4. FINAL CTA AFTER THE STORY */}
      {!isNonCustomer && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {footerConfig.ctaTitle || 'آماده دریافت نوبت هستید؟'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {footerConfig.ctaSubtitle || 'همین حالا شروع کن؛ رایگان و کمتر از یک دقیقه.'}
            </p>
          </div>

          <div>
            <Link
              to={isLoggedIn ? "/dashboard" : "/login"}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-md shadow-emerald-600/15 transition-all text-sm inline-flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>{footerConfig.ctaButtonText || 'نوبت بگیر'}</span>
            </Link>
          </div>
        </section>
      )}


      {/* 5. MINIMAL FOOTER */}
      <footer className="pt-8 pb-4 border-t border-slate-200/60 dark:border-slate-800 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
        <div className="flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
          <button 
            onClick={() => setActiveModal('about')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
          >
            درباره بی‌صف
          </button>
          <button 
            onClick={() => setActiveModal('help')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
          >
            راهنما
          </button>
          <button 
            onClick={() => setActiveModal('support')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
          >
            تماس / پشتیبانی
          </button>
          
          {isLoggedIn ? (
            <button 
              onClick={() => {
                StorageService.setCurrentUser({
                  id: 'guest',
                  phone: '',
                  role: 'customer',
                  created_at: new Date().toISOString()
                });
                window.location.href = '/';
              }}
              className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium text-rose-600 dark:text-rose-400"
            >
              خروج
            </button>
          ) : (
            <Link 
              to="/login"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              ورود
            </Link>
          )}
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          © ۱۴۰۳ بی‌صف (BiSaf.ir) — سامانه کشوری نوبت‌دهی هوشمند
        </p>
      </footer>


      {/* FOOTER INFO MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            
            {activeModal === 'about' && (
              <>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                  <Info className="w-5 h-5" />
                  <h4>درباره بی‌صف</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  بی‌صف سامانه کشوری مدیریت صف و نوبت‌دهی هوشمند است که با هدف حذف صف‌های فیزیکی در نانوایی‌ها، درمانگاه‌ها، مطب‌ها و مراکز خدماتی ایران طراحی شده است.
                </p>
              </>
            )}

            {activeModal === 'help' && (
              <>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                  <HelpCircle className="w-5 h-5" />
                  <h4>راهنمای دریافت نوبت</h4>
                </div>
                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>با دوربین گوشی QR کد نصب‌شده در مرکز را اسکن کنید.</li>
                  <li>تعداد نوبت مورد نظر را مشخص و فیش دیجیتال را دریافت نمایید.</li>
                  <li>هنگام نزدیک شدن نوبت، پیامک و پیام در پیام‌رسان دریافت خواهید کرد.</li>
                </ol>
              </>
            )}

            {activeModal === 'support' && (
              <>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                  <PhoneCall className="w-5 h-5" />
                  <h4>تماس و پشتیبانی</h4>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                  <p>پشتیبانی ۲۴ ساعته بی‌صف جهت پاسخگویی به سؤالات مشتریان و پذیرندگان:</p>
                  <p className="font-mono dir-ltr text-right font-bold text-slate-800 dark:text-slate-200">
                    ۰۲۱-۹۱۰۹۰۰۰۰
                  </p>
                  <p className="text-[11px] text-slate-500">پشتیبانی تلگرام و بله: @BiSaf_Support</p>
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
              >
                بستن
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
