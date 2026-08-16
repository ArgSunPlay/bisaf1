import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Sun, Moon, Shield, Store, User, LogOut, 
  Sparkles, Award, MapPin, ArrowRight, Calendar, Clock,
  Home, ListOrdered, LayoutDashboard, Ticket, QrCode, Printer,
  Settings, SlidersHorizontal, Radio, PlusCircle, Database,
  Key, HelpCircle, Layers, CheckCircle2, ChevronLeft
} from 'lucide-react';
import QRCode from 'qrcode';
import { Profile, Shop } from '../types';
import { StorageService } from '../services/storage';
import { formatLongJalaliDate, formatShortJalaliDate, toPersianDigits } from '../utils/jalali';
import bisafLogo from '../assets/images/bisaf_logo_concept_1786242674840.jpg';
import { ShopkeeperSettingsModal } from './ShopkeeperSettingsModal';
import { QrPrintStudio } from './marketer/QrPrintStudio';

interface NavbarProps {
  currentUser: Profile | null;
  onThemeToggle: () => void;
  isDark: boolean;
  onOpenTestRunner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onThemeToggle, isDark }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeUser = currentUser || StorageService.getCurrentUser();
  const isLoggedIn = Boolean(activeUser && activeUser.id && activeUser.id !== 'guest');
  const userRole = activeUser?.role || 'customer';

  // Active Shop detection for Shopkeeper and Header display
  const currentShop: Shop | null = useMemo(() => {
    // 1. From URL pathname
    if (location.pathname.startsWith('/panel/')) {
      const shopId = location.pathname.split('/')[2];
      return StorageService.getShopById(shopId) || null;
    }
    if (location.pathname.startsWith('/shop/')) {
      const slug = location.pathname.split('/')[2];
      return StorageService.getShopBySlug(slug) || null;
    }
    if (location.pathname.startsWith('/print/')) {
      const shopId = location.pathname.split('/')[2];
      return StorageService.getShopById(shopId) || null;
    }
    // 2. From current user if shopkeeper
    if (userRole === 'shopkeeper' && activeUser?.id) {
      const shops = StorageService.getShops();
      const userShop = shops.find(s => s.owner_id === activeUser.id || s.owner_id === activeUser.username);
      if (userShop) return userShop;
      return shops[0] || null;
    }
    return null;
  }, [location.pathname, activeUser, userRole]);

  // Dynamic Page Title & Primary Purpose for Header Span
  const pageTitleAndPurpose = useMemo(() => {
    const path = location.pathname;
    // 1. Home page must remain empty
    if (path === '/') {
      return '';
    }
    // 2. Auth routes
    if (path === '/login' || path === '/register') {
      return 'ورود یا ثبت‌نام';
    }
    if (path === '/marketer-register' || path === '/join-marketer') {
      return 'ثبت‌نام و همکاری بازاریابان';
    }
    // 3. Main Dashboard & Panels
    if (path === '/dashboard') {
      return 'داشبورد نوبت‌ها و نقشه';
    }
    if (path === '/marketer') {
      return 'پنل بازاریابی و ثبت مراکز';
    }
    if (path === '/admin') {
      return 'پنل مدیریت کل سیستم';
    }
    if (path === '/admin/database' || path === '/database') {
      return 'استودیو مدیریت داده‌ها';
    }
    // 4. Shop-Specific Routes
    if (path.startsWith('/panel/')) {
      return currentShop ? `پنل متصدی — ${currentShop.name}` : 'پنل مدیریت صف متصدی';
    }
    if (path.startsWith('/shop/')) {
      return currentShop ? `دریافت نوبت — ${currentShop.name}` : 'دریافت نوبت آنلاین';
    }
    if (path.startsWith('/print/')) {
      return currentShop ? `چاپ فیش — ${currentShop.name}` : 'چاپ نوبت و فیش';
    }
    return 'سامانه هوشمند بی‌صف';
  }, [location.pathname, currentShop]);

  // Modal States for Navbar
  const [activeSettingsShop, setActiveSettingsShop] = useState<Shop | null>(null);
  const [activeQrShop, setActiveQrShop] = useState<Shop | null>(null);
  const [custQrImg, setCustQrImg] = useState<string>('');
  const [opQrImg, setOpQrImg] = useState<string>('');

  // Jalali Date & Time live state
  const [jalaliDate, setJalaliDate] = useState<string>('');
  const [compactJalaliDate, setCompactJalaliDate] = useState<string>('');
  const [jalaliTime, setJalaliTime] = useState<string>('');

  // Live Queue Serving Notification State (for header banner)
  const [servingAnnouncement, setServingAnnouncement] = useState<{ ticket: any; shopName: string } | null>(null);

  useEffect(() => {
    const handleTicketCalling = (e: any) => {
      const detail = e.detail;
      if (detail && detail.ticket) {
        setServingAnnouncement(detail);
        setTimeout(() => {
          setServingAnnouncement(prev => (prev?.ticket?.id === detail.ticket.id ? null : prev));
        }, 7000);
      }
    };
    window.addEventListener('bisaf-ticket-calling', handleTicketCalling);
    return () => window.removeEventListener('bisaf-ticket-calling', handleTicketCalling);
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      try {
        const fullDate = formatLongJalaliDate(now);
        const compactDate = formatShortJalaliDate(now);

        const timeStr = new Intl.DateTimeFormat('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(now);

        setJalaliDate(fullDate);
        setCompactJalaliDate(compactDate);
        setJalaliTime(timeStr);
      } catch {
        setJalaliDate(now.toLocaleDateString('fa-IR'));
        setCompactJalaliDate(now.toLocaleDateString('fa-IR'));
        setJalaliTime(now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }));
      }
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenQrStudioForShop = async (targetShop: Shop) => {
    try {
      const opUrl = `${window.location.origin}/panel/${targetShop.id}?auto_login=true`;
      const custUrl = `${window.location.origin}/shop/${targetShop.slug}`;
      const [opImg, custImg] = await Promise.all([
        QRCode.toDataURL(opUrl, { width: 220, margin: 1 }),
        QRCode.toDataURL(custUrl, { width: 220, margin: 1 })
      ]);
      setOpQrImg(opImg);
      setCustQrImg(custImg);
      setActiveQrShop(targetShop);
      setIsMenuOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    StorageService.setCurrentUser({
      id: 'guest',
      phone: '',
      role: 'customer',
      created_at: new Date().toISOString()
    });
    window.location.href = '/';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-safe">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-15 flex items-center justify-between gap-2">
          
          {/* RIGHT SIDE: Logo + Brand Name */}
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/" className="flex items-center gap-2 group focus:outline-none">
              <div className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] sm:min-w-[40px] rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform border border-emerald-500/30">
                <img src={bisafLogo} alt="لوگوی بی‌صف" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center items-start">
                <span className="font-black text-xl sm:text-2xl leading-none tracking-tight text-slate-900 dark:text-white">
                  بی صف
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER TOP: Realtime Customer Serving Notification Banner */}
          {servingAnnouncement && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white rounded-xl shadow-lg border border-emerald-300/40 animate-pulse text-[11px] sm:text-xs font-black max-w-[160px] xs:max-w-[240px] sm:max-w-md truncate">
              <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
              <span className="truncate">
                🔔 نوبت #{toPersianDigits(servingAnnouncement.ticket.ticket_number)} | {servingAnnouncement.ticket.customer_name || 'مشتری'} | {servingAnnouncement.ticket.ticket_type === 'in_person_single' ? 'تکی' : `چندتایی (${toPersianDigits(servingAnnouncement.ticket.quantity)} نان)`} | {servingAnnouncement.ticket.ticket_type?.startsWith('online') ? 'آنلاین' : 'حضوری'}
              </span>
              <button 
                onClick={() => setServingAnnouncement(null)} 
                className="mr-0.5 text-emerald-100 hover:text-white shrink-0 text-xs px-1"
                title="بستن اعلان"
              >
                ✕
              </button>
            </div>
          )}

          {/* LEFT SIDE: Controls & Dynamic Hamburger Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Direct role shortcuts on desktop */}
            <div className="hidden md:flex items-center gap-2 ml-2">
              <Link 
                to="/dashboard" 
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 h-9"
              >
                <MapPin className="w-4 h-4 text-emerald-500" />
                داشبورد
              </Link>

              {userRole === 'shopkeeper' && currentShop && (
                <Link 
                  to={`/panel/${currentShop.id}`} 
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition-colors h-9 flex items-center"
                >
                  پنل متصدی
                </Link>
              )}

              {userRole === 'marketer' && (
                <Link 
                  to="/marketer" 
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors h-9 flex items-center"
                >
                  پنل بازاریاب
                </Link>
              )}

              {userRole === 'admin' && (
                <Link 
                  to="/admin" 
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 transition-colors h-9 flex items-center"
                >
                  مدیریت ارشد
                </Link>
              )}
            </div>

            {/* Login / Logout Button */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-1.5 h-9 min-w-[36px]"
                title="خروج از حساب کاربری"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xs:inline">خروج</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 h-9 min-w-[36px]"
                title="ورود به حساب کاربری"
              >
                <User className="w-4 h-4" />
                <span>ورود</span>
              </Link>
            )}

            {/* Theme Toggle Icon */}
            <button
              onClick={onThemeToggle}
              className="w-9 h-9 min-w-[36px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors border border-slate-200/60 dark:border-slate-700/60"
              title="تغییر پوسته (روز / شب)"
              aria-label="تغییر پوسته"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Dynamic Hamburger Menu Icon */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-9 h-9 min-w-[36px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors border border-slate-200/60 dark:border-slate-700/60 relative"
              title="منوی هوشمند امکانات و دسترسی"
              aria-label="منوی اصلی"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              {userRole !== 'customer' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* 🕒 TIME, DYNAMIC PAGE TITLE / PURPOSE SPAN, AND CALENDAR BAR */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-1">
          <div className="w-full flex items-center justify-between px-2.5 sm:px-3 py-1 border border-slate-200/60 dark:border-slate-700/60 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 shadow-sm gap-2 min-h-[32px]">
            
            {/* Clock (Time) */}
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono dir-ltr">
                {jalaliTime}
              </span>
            </div>

            {/* Middle Badge / Span (Page Title & Function - Empty on Home Page as requested) */}
            <div className="flex items-center justify-center min-w-0 flex-1 px-1">
              {pageTitleAndPurpose ? (
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-white truncate text-center px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-xs">
                  {pageTitleAndPurpose}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 opacity-0 select-none">
                  صفحه اصلی
                </span>
              )}
            </div>

            {/* Calendar (Date) */}
            <div className="flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              {/* Mobile View (< 768px): Short Date */}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 md:hidden">
                {compactJalaliDate}
              </span>
              {/* Desktop View (>= 768px): Long Date */}
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hidden md:inline">
                {jalaliDate}
              </span>
            </div>

          </div>
        </div>

        {/* 🍔 DYNAMIC HAMBURGER MENU (امکانات و تنظیمات متناسب با نقش کاربر) */}
        {isMenuOpen && (
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-4 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-fade-in">
            
            {/* User Profile & Role Status Header */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl text-white font-black text-xs ${
                  userRole === 'admin' ? 'bg-purple-600' :
                  userRole === 'marketer' ? 'bg-indigo-600' :
                  userRole === 'shopkeeper' ? 'bg-amber-600' : 'bg-emerald-600'
                }`}>
                  {userRole === 'admin' ? <Shield className="w-4 h-4" /> :
                   userRole === 'marketer' ? <Award className="w-4 h-4" /> :
                   userRole === 'shopkeeper' ? <Store className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {isLoggedIn ? (activeUser.full_name || activeUser.username || activeUser.phone) : 'کاربر مهمان'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    نقش کاربری: {
                      userRole === 'admin' ? '👑 مدیر ارشد سامانه (Admin)' :
                      userRole === 'marketer' ? '💼 بازاریاب رسمی' :
                      userRole === 'shopkeeper' ? '🏪 متصدی مرکز / فروشگاه' : '👤 مشتری عادی'
                    }
                  </span>
                </div>
              </div>

              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors border border-rose-200 dark:border-rose-800"
                >
                  خروج
                </button>
              )}
            </div>

            {/* 🌟 DYNAMIC SECTION 1: SHOPKEEPER TOOLS & SETTINGS (اگر متصدی است یا در پنل فروشگاه است) */}
            {(userRole === 'shopkeeper' || currentShop || userRole === 'admin') && currentShop && (
              <div className="space-y-2 p-3.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-800/60">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-amber-600" />
                    امکانات و تنظیمات فروشگاه: {currentShop.name}
                  </h4>
                  <span className="text-[10px] bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">
                    پنل متصدی
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                  {/* Open Settings Modal */}
                  <button
                    onClick={() => {
                      setActiveSettingsShop(currentShop);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-100/50 dark:hover:bg-slate-800 border border-amber-200/70 dark:border-amber-800/70 text-slate-800 dark:text-slate-100 font-bold transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-amber-600" />
                      <span>تنظیمات، بنر، دکمه‌ها و رمز</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Open A4 Poster Print Studio */}
                  <button
                    onClick={() => handleOpenQrStudioForShop(currentShop)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      <span>استودیو چاپ پوستر A4</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-indigo-200" />
                  </button>

                  {/* Thermal Receipt Print */}
                  <Link
                    to={`/print/${currentShop.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span>چاپ فیش حرارتی POS</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </Link>

                  {/* Go to Operator Queue Panel */}
                  <Link
                    to={`/panel/${currentShop.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-black transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <ListOrdered className="w-4 h-4 text-emerald-600" />
                      <span>پنل اصلی مدیریت صف و تحویل</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-emerald-500" />
                  </Link>

                  {/* Public Customer View */}
                  <Link
                    to={`/shop/${currentShop.slug}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-teal-500" />
                      <span>صفحه عمومی نوبت‌گیری این فروشگاه</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>
              </div>
            )}

            {/* 🌟 DYNAMIC SECTION 2: MARKETER TOOLS (اگر نقش بازاریاب یا مدیر است) */}
            {(userRole === 'marketer' || userRole === 'admin') && (
              <div className="space-y-2 p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    امکانات و ابزارهای پنل بازاریابی
                  </h4>
                  <span className="text-[10px] bg-indigo-200/80 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                    بازاریابی
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <Link
                    to="/marketer?tab=dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-100/50 dark:hover:bg-slate-800 border border-indigo-200/70 dark:border-indigo-800/70 text-indigo-950 dark:text-indigo-200 font-bold"
                  >
                    <span>📊 داشبورد و آمار پورسانت</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/marketer?tab=register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    <span>➕ ثبت فروشگاه جدید</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/marketer?tab=shops"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-100/50 dark:hover:bg-slate-800 border border-indigo-200/70 dark:border-indigo-800/70 text-indigo-950 dark:text-indigo-200 font-bold"
                  >
                    <span>🏬 مراکز ثبت‌شده من</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* 🌟 DYNAMIC SECTION 3: SUPER ADMIN TOOLS (اگر نقش مدیر است) */}
            {userRole === 'admin' && (
              <div className="space-y-2 p-3.5 bg-purple-50/70 dark:bg-purple-950/30 rounded-2xl border border-purple-200/80 dark:border-purple-800/60">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-purple-600" />
                    ابزارهای مدیریت ارشد سیستم (Super Admin)
                  </h4>
                  <span className="text-[10px] bg-purple-200/80 dark:bg-purple-900 text-purple-900 dark:text-purple-200 px-2 py-0.5 rounded-full font-bold">
                    سطح دسترسی کامل
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <Link
                    to="/admin?section=env_status"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200/70 dark:border-purple-800/70 text-purple-950 dark:text-purple-200 font-bold flex items-center justify-between"
                  >
                    <span>⚡ متغیرها و تست زنده</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/admin?section=users"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200/70 dark:border-purple-800/70 text-purple-950 dark:text-purple-200 font-bold flex items-center justify-between"
                  >
                    <span>👥 کاربران و دسترسی‌ها</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/admin?section=shops"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200/70 dark:border-purple-800/70 text-purple-950 dark:text-purple-200 font-bold flex items-center justify-between"
                  >
                    <span>🏬 مراکز و صنف‌ها</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/admin?section=database"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-between"
                  >
                    <span>🗄️ استودیو دیتابیس</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* 🌟 GENERAL SECTION: FOR ALL USERS (صفحات اصلی سامانه) */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 px-1">
                دسترسی به صفحات اصلی:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/70 transition-all group"
                >
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-slate-900 dark:text-white">صفحه اصلی (ورودگاه)</span>
                    <span className="text-[10px] text-slate-500">معرفی و ثبت‌نام نوبت‌دهی</span>
                  </div>
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50/60 dark:hover:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/70 transition-all group"
                >
                  <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 shrink-0">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-slate-900 dark:text-white">داشبورد مشتری و نوبت‌ها</span>
                    <span className="text-[10px] text-slate-500">نوبت‌های فعال من و نقشه</span>
                  </div>
                </Link>

                <Link
                  to="/shop/barekat-sangak"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50/60 dark:hover:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/70 transition-all group"
                >
                  <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 shrink-0">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-slate-900 dark:text-white">نمونه صفحه نوبت‌گیری</span>
                    <span className="text-[10px] text-slate-500">نانوایی برکت سنگک</span>
                  </div>
                </Link>

                <Link
                  to="/marketer-register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60 font-bold text-indigo-900 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-800/80 transition-all group"
                >
                  <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-indigo-900 dark:text-indigo-200">ثبت‌نام و همکاری بازاریابان</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400">کسب درآمد و پورسانت مراکز</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Menu Footer with Theme and Login/Register */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={onThemeToggle}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-slate-700/60"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                <span>حالت پوسته: {isDark ? 'تاریک (شب) 🌙' : 'روشن (روز) ☀️'}</span>
              </button>

              {!isLoggedIn && (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-600/30"
                >
                  ورود / ثبت‌نام در سامانه
                </Link>
              )}
            </div>

          </div>
        )}
      </header>

      {/* Settings Modal if triggered from Navbar */}
      {activeSettingsShop && (
        <ShopkeeperSettingsModal
          shop={activeSettingsShop}
          onClose={() => setActiveSettingsShop(null)}
          onOpenQrStudio={() => handleOpenQrStudioForShop(activeSettingsShop)}
          onSettingsUpdated={(updated) => {
            setActiveSettingsShop(null);
          }}
        />
      )}

      {/* QrPrintStudio Modal if triggered from Navbar */}
      {activeQrShop && (
        <QrPrintStudio
          shop={activeQrShop}
          custQr={custQrImg}
          opQr={opQrImg}
          onClose={() => setActiveQrShop(null)}
        />
      )}
    </>
  );
};
