import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MapPin, Ticket, Heart, Settings, Bell, Sparkles, Home, User, 
  Store, Users, BarChart3, ShieldCheck, ArrowRight, X, Play, 
  Clock, Smartphone, CheckCircle2, QrCode, PlusCircle, LogIn, 
  ChevronUp, Award, Layers
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { Profile } from '../types';
import { toPersianDigits } from '../utils/jalali';

interface BenefitItem {
  id: string;
  title: string;
  desc: string;
  icon: any;
  demoTitle: string;
  demoDesc: string;
}

const GUEST_BENEFITS: BenefitItem[] = [
  {
    id: 'tracking',
    title: 'پیگیری آنلاین نوبت',
    desc: 'نمایش زنده تعداد نفرات مانده تا نوبت شما و زمان تقریبی انتظار بدون نیاز به ماندن در صف physical',
    icon: Clock,
    demoTitle: 'پیش‌نمایش زنده پیگیری نوبت',
    demoDesc: 'شماره نوبت شما: ۲۴ | ۳ نفر در صف | زمان انتظار تقریبی: ۶ دقیقه'
  },
  {
    id: 'notifications',
    title: 'اعلان صوتی و پیامکی',
    desc: 'دریافت هشدار صوتی و پیامک هنگام نزدیک شدن نوبت تا هیچ فراخوانی را از دست ندهید',
    icon: Bell,
    demoTitle: 'پیش‌نمایش سیستم هشدار و فراخوان',
    demoDesc: '🔔 "نوبت شماره ۲۴ (رضا محمدی) به باجه ۱ مراجعه فرمایید."'
  },
  {
    id: 'history',
    title: 'تاریخچه نوبت‌ها',
    desc: 'دسترسی کامل به فیش‌ها، زمان‌های حضور و سوابق مراجعه به تمام فروشگاه‌ها',
    icon: Ticket,
    demoTitle: 'پیش‌نمایش تاریخچه نوبت‌ها',
    demoDesc: 'سوابق ثبت‌شده: ۲ مراجعه قبلی به فروشگاه نانوایی برکت و پیرایش VIP'
  },
  {
    id: 'favorites',
    title: 'ذخیره مراکز محبوب',
    desc: 'افزودن فروشگاه‌ها به لیست علاقمندی‌ها جهت گرفتن سریع نوبت با یک کلیک',
    icon: Heart,
    demoTitle: 'پیش‌نمایش لیست علاقمندی‌ها',
    demoDesc: 'فروشگاه‌های نشان‌شده شما در بالای صفحه نوبت‌گیری جهت دسترسی سریع قرار می‌گیرند.'
  },
  {
    id: 'speed',
    title: 'نوبت‌گیری سریع و خودکار',
    desc: 'تکمیل خودکار اطلاعات و شماره تماس بدون نیاز به تایپ مجدد در هر بار مراجعه',
    icon: Smartphone,
    demoTitle: 'پیش‌نمایش نوبت‌گیری ۱-کلیکی',
    demoDesc: 'اطلاعات شما ذخیره شده و گرفتن نوبت جدید تنها با لمس دکمه «تایید نوبت» انجام می‌شود.'
  },
  {
    id: 'profile',
    title: 'مدیریت حساب کاربری',
    desc: 'امکان ویرایش نام، شماره تماس و تنظیمات اعلان‌های اختصاصی',
    icon: User,
    demoTitle: 'پیش‌نمایش پروفایل کاربری',
    demoDesc: 'حساب اختصاصی مشتری فعال با سطح دسترسی سریع به تمام امکانات پیشرفته سیستم'
  }
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<Profile | null>(() => StorageService.getCurrentUser());
  const [showGuestModal, setShowGuestModal] = useState<boolean>(false);
  const [activeDemo, setActiveDemo] = useState<BenefitItem | null>(null);

  useEffect(() => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
  }, [location.pathname, location.search]);

  const isLoggedIn = Boolean(currentUser && currentUser.id && currentUser.id !== 'guest');
  const role = currentUser?.role || 'guest';
  const isShopkeeperPanel = location.pathname.startsWith('/panel/');

  // 1. Determine Navigation Tabs based on Role & Current Context
  let tabs: Array<{ id: string; label: string; path?: string; action?: () => void; icon: any; isSpecial?: boolean }> = [];

  if (!isLoggedIn) {
    // GUEST USER TABS
    tabs = [
      {
        id: 'home',
        label: 'صفحه اصلی',
        path: '/',
        icon: Home
      },
      {
        id: 'shops',
        label: 'لیست مراکز',
        path: '/dashboard',
        icon: MapPin
      },
      {
        id: 'benefits',
        label: 'عضویت سریع',
        action: () => setShowGuestModal(true),
        icon: Sparkles,
        isSpecial: true
      },
      {
        id: 'login',
        label: 'ورود / ثبت‌نام',
        path: '/login',
        icon: LogIn
      }
    ];
  } else if (role === 'customer') {
    // CUSTOMER TABS
    tabs = [
      {
        id: 'home',
        label: 'اصلی',
        path: '/',
        icon: Home
      },
      {
        id: 'map',
        label: 'نوبت‌گیری',
        path: '/dashboard?tab=map',
        icon: MapPin
      },
      {
        id: 'tickets',
        label: 'نوبت‌های من',
        path: '/dashboard?tab=tickets',
        icon: Ticket
      },
      {
        id: 'favorites',
        label: 'محبوب‌ها',
        path: '/dashboard?tab=favorites',
        icon: Heart
      },
      {
        id: 'profile',
        label: 'پروفایل',
        path: '/dashboard?tab=settings',
        icon: User
      }
    ];
  } else if (role === 'shopkeeper' || isShopkeeperPanel) {
    // SHOPKEEPER TABS
    const shopId = location.pathname.split('/panel/')[1] || '1';
    tabs = [
      {
        id: 'panel_home',
        label: 'مدیریت صف',
        path: `/panel/${shopId}`,
        icon: Store
      },
      {
        id: 'panel_qr',
        label: 'QR کدها',
        path: `/panel/${shopId}?show_qr=true`,
        icon: QrCode
      },
      {
        id: 'panel_print',
        label: 'چاپ فیش',
        path: `/print/${shopId}`,
        icon: Ticket
      },
      {
        id: 'dashboard',
        label: 'نمای مشتری',
        path: '/dashboard',
        icon: MapPin
      },
      {
        id: 'profile',
        label: 'حساب من',
        path: '/dashboard?tab=settings',
        icon: User
      }
    ];
  } else if (role === 'marketer') {
    // MARKETER TABS
    tabs = [
      {
        id: 'marketer_home',
        label: 'پنل بازاریاب',
        path: '/marketer',
        icon: Award
      },
      {
        id: 'marketer_shops',
        label: 'فروشگاه‌ها',
        path: '/marketer?tab=shops',
        icon: Store
      },
      {
        id: 'marketer_add',
        label: 'ثبت فروشگاه',
        path: '/marketer?tab=add',
        icon: PlusCircle
      },
      {
        id: 'dashboard',
        label: 'نمای کلی',
        path: '/dashboard',
        icon: MapPin
      },
      {
        id: 'profile',
        label: 'حساب من',
        path: '/dashboard?tab=settings',
        icon: User
      }
    ];
  } else if (role === 'admin') {
    // ADMIN TABS
    tabs = [
      {
        id: 'admin_home',
        label: 'پنل ادمین',
        path: '/admin',
        icon: ShieldCheck
      },
      {
        id: 'admin_shops',
        label: 'فروشگاه‌ها',
        path: '/admin?tab=shops',
        icon: Store
      },
      {
        id: 'admin_marketers',
        label: 'بازاریابان',
        path: '/admin?tab=marketers',
        icon: Users
      },
      {
        id: 'admin_analytics',
        label: 'آمار سیستم',
        path: '/admin?tab=analytics',
        icon: BarChart3
      },
      {
        id: 'profile',
        label: 'پروفایل',
        path: '/dashboard?tab=settings',
        icon: User
      }
    ];
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe shadow-lg">
        <div className={`grid ${tabs.length === 4 ? 'grid-cols-4' : 'grid-cols-5'} h-15 max-w-lg mx-auto items-center px-1`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            let isActive = false;

            if (tab.path) {
              if (tab.path === '/') {
                isActive = location.pathname === '/';
              } else if (tab.path.includes('?tab=')) {
                const searchTab = new URLSearchParams(location.search).get('tab');
                const targetTab = tab.path.split('?tab=')[1];
                isActive = location.pathname === tab.path.split('?')[0] && searchTab === targetTab;
              } else {
                isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path);
              }
            }

            if (tab.action) {
              return (
                <button
                  key={tab.id}
                  onClick={tab.action}
                  className="flex flex-col items-center justify-center gap-1 relative py-1 text-amber-600 dark:text-amber-400 group"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-amber-400/30 dark:bg-amber-500/20 animate-pulse" />
                    <Icon className="w-5 h-5 relative z-10 text-amber-600 dark:text-amber-400 scale-110" />
                  </div>
                  <span className="text-[10px] font-black leading-none text-amber-600 dark:text-amber-400">
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={tab.id}
                to={tab.path!}
                className={`flex flex-col items-center justify-center gap-1 relative py-1 transition-all ${
                  isActive 
                    ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-emerald-600 dark:text-emerald-400' : ''} transition-transform`} />
                <span className="text-[10px] font-medium leading-none">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* GUEST CONVERSION BOTTOM SHEET / MODAL */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    امکانات ویژه مشتریان با عضویت رایگان
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    با ثبت‌نام در کمتر از ۱ دقیقه، به تمام قابلیت‌های هوشمند دسترسی یابید:
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGuestModal(false);
                  setActiveDemo(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* List of Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GUEST_BENEFITS.map((item) => {
                const ItemIcon = item.icon;
                const isSelected = activeDemo?.id === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveDemo(item)}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                        <span>{item.title}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">(مشاهده دمو)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Demo Simulation Box */}
            {activeDemo && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl space-y-2 animate-fade-in">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-300">
                  <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                  <span>{activeDemo.demoTitle}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40 leading-relaxed">
                  {activeDemo.demoDesc}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <a
                href="https://ble.ir/BiSafBot?start=guest"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowGuestModal(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>سریع‌ترین راه: ثبت‌نام با ربات بله</span>
              </a>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowGuestModal(false);
                    navigate('/login');
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ثبت‌نام پیامکی / ورود</span>
                </button>
                <button
                  onClick={() => {
                    setShowGuestModal(false);
                    setActiveDemo(null);
                  }}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  انصراف
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

