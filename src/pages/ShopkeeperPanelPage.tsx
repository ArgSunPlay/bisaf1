import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Users, UserPlus, Play, CheckCircle2, PauseCircle, XCircle, 
  Printer, Radio, Volume2, Sparkles, RefreshCw, AlertCircle, ArrowRight,
  Settings, Plus, Trash2, ShoppingBag, QrCode, Copy, Check, SlidersHorizontal, Image, Globe,
  Lock, Eye, EyeOff, ShieldCheck, KeyRound, BellRing, ChevronRight
} from 'lucide-react';
import QRCode from 'qrcode';
import { StorageService } from '../services/storage';
import { QueueService } from '../services/queueService';
import { AuthService } from '../services/authService';
import { Shop, QueueItem, ProductItem } from '../types';
import { toPersianDigits } from '../utils/jalali';
import { QrPrintStudio } from '../components/marketer/QrPrintStudio';
import { ShopkeeperSettingsModal } from '../components/ShopkeeperSettingsModal';
import { PasswordInput } from '../components/PasswordInput';

export const ShopkeeperPanelPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Default to dark mode for shopkeeper (battery saving)
    if (!localStorage.getItem('theme_preference_set')) {
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('theme_preference_set', 'true');
      document.documentElement.classList.add('dark');
      // Force a re-render if needed by dispatching
      window.dispatchEvent(new Event('theme-change'));
    }
  }, []);

  const [shop, setShop] = useState<Shop | null>(null);
  const [queueInfo, setQueueInfo] = useState<any>(null);
  const [message, setMessage] = useState('');
  
  // Quick in-person parameters
  const [selectedBreadType, setSelectedBreadType] = useState<string>('');
  const [customMultiQty, setCustomMultiQty] = useState<number>(3);

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Dual QR Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [operatorQrImg, setOperatorQrImg] = useState('');
  const [customerQrImg, setCustomerQrImg] = useState('');

  // Operator Password Protection States
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(`op_auth_${shopId}`) === 'true';
  });
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const currentUser = AuthService.getCurrentUser();

  const operatorProfile = useMemo(() => {
    if (!shop?.owner_id) return null;
    return StorageService.getProfiles().find(p => p.id === shop.owner_id || p.username === shop.owner_id);
  }, [shop]);

  useEffect(() => {
    // Check auto-login via Operator QR Code
    if (searchParams.get('auto_login') === 'true' || searchParams.get('login_type') === 'qr') {
      if (shopId) {
        AuthService.loginAsShopkeeper(shopId);
        setMessage('🔑 ورود به پنل متصدی از طریق QR کد اختصاصی');
        setTimeout(() => setMessage(''), 4000);
      }
    }
  }, [searchParams, shopId]);

  const reloadData = () => {
    const found = StorageService.getShopById(shopId);
    setShop(found);

    if (found) {
      const q = QueueService.getShopQueue(found.id);
      setQueueInfo(q);

      const items = (found.product_items && found.product_items.length > 0)
        ? found.product_items
        : [
            { id: 'p-1', name: 'نان ساده' },
            { id: 'p-2', name: 'نان بزرگ' }
          ];
      if (!selectedBreadType && items[0]) {
        setSelectedBreadType(items[0].name);
      }

      // Check if password unlocked
      const requiresPass = found.require_operator_password === true;
      if (!requiresPass || currentUser?.role === 'admin' || sessionStorage.getItem(`op_auth_${found.id}`) === 'true') {
        setIsPasswordUnlocked(true);
      }

      // Generate Dual QR Codes
      const opUrl = `${window.location.origin}/panel/${found.id}?auto_login=true`;
      const custUrl = `${window.location.origin}/shop/${found.slug}`;

      QRCode.toDataURL(opUrl, { width: 220, margin: 1 })
        .then(url => setOperatorQrImg(url))
        .catch(err => console.error(err));

      QRCode.toDataURL(custUrl, { width: 220, margin: 1 })
        .then(url => setCustomerQrImg(url))
        .catch(err => console.error(err));
    }
  };

  useEffect(() => {
    reloadData();
  }, [shopId]);

  const handleVerifyOperatorPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    
    const expectedPassword = shop.operator_password || operatorProfile?.password || 'admin';
    if (enteredPassword.trim() === expectedPassword.trim()) {
      setIsPasswordUnlocked(true);
      sessionStorage.setItem(`op_auth_${shop.id}`, 'true');
      setPasswordError('');
      setMessage('🔓 رمز عبور متصدی با موفقیت تأیید شد و پنل باز شد.');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setPasswordError('❌ رمز عبور وارد شده نادرست است. لطفاً رمز عبور اختصاصی متصدی را وارد نمایید.');
    }
  };

  if (!shop || !queueInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle Serve Next
  const handleServeNext = () => {
    const res = QueueService.serveNext(shop.id);
    if (!res.success) {
      setMessage(`ℹ️ ${res.message}`);
    } else {
      setMessage(`✅ نوبت #${toPersianDigits(res.item?.ticket_number)} فراخوانده شد.`);
    }
    reloadData();
    setTimeout(() => setMessage(''), 3000);
  };

  // Add 1 Single Customer (One-click)
  const handleAddSingleCustomer = () => {
    const itemSummary = selectedBreadType ? `۱ عدد ${selectedBreadType}` : '۱ عدد نان';
    const newItem = QueueService.createTicket({
      shopId: shop.id,
      customerName: 'مشتری حضوری (تکی)',
      ticketType: 'in_person_single',
      quantity: 1,
      itemsSummary: itemSummary
    });
    setMessage(`✅ نوبت تکی #${toPersianDigits(newItem.ticket_number)} صادر شد.`);
    reloadData();
    setTimeout(() => setMessage(''), 3000);
  };

  // Add Multi Customer (One-click with count)
  const handleAddMultiCustomer = (qty: number) => {
    const itemSummary = selectedBreadType ? `${toPersianDigits(qty)} عدد ${selectedBreadType}` : `${toPersianDigits(qty)} عدد نان`;
    const newItem = QueueService.createTicket({
      shopId: shop.id,
      customerName: `مشتری حضوری (${toPersianDigits(qty)} تایی)`,
      ticketType: 'in_person_multi',
      quantity: qty,
      itemsSummary: itemSummary
    });
    setMessage(`✅ نوبت چندتایی (${toPersianDigits(qty)} عدد) #${toPersianDigits(newItem.ticket_number)} صادر شد.`);
    reloadData();
    setTimeout(() => setMessage(''), 3000);
  };

  // Cancel Ticket
  const handleCancelTicket = (id: string, ticketNumber: number) => {
    if (window.confirm(`آیا از لغو نوبت شماره #${toPersianDigits(ticketNumber)} اطمینان دارید؟`)) {
      QueueService.cancelTicket(id);
      setMessage(`❌ نوبت #${toPersianDigits(ticketNumber)} لغو شد.`);
      reloadData();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Handle Settings update from modal
  const handleSettingsUpdated = (updatedShop: Shop) => {
    setShop(updatedShop);
    reloadData();
    setMessage('✅ تمام تنظیمات با موفقیت ذخیره شد.');
    setTimeout(() => setMessage(''), 3000);
  };

  // Password Unlock Screen
  if (shop.require_operator_password && !isPasswordUnlocked) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5 animate-fade-in text-right">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 rounded-3xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              ورود با رمز عبور متصدی
            </h2>
            <p className="text-xs text-slate-500">
              این مرکز دارای قفل امنیتی متصدی است. جهت مدیریت صف «<span className="font-bold text-slate-700 dark:text-slate-300">{shop.name}</span>» لطفاً رمز عبور را وارد نمایید.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold">نام کاربری متصدی:</span>
            <span className="font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
              {operatorProfile?.username || shop.owner_id || 'mot1'}
            </span>
          </div>

          {passwordError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-bold">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleVerifyOperatorPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                رمز عبور متصدی:
              </label>
              <PasswordInput
                showLockIcon
                value={enteredPassword}
                onChange={(e) => {
                  setEnteredPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="رمز عبور متصدی را وارد کنید..."
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-sm shadow-md transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>تأیید رمز عبور و ورود به پنل متصدی</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              بازگشت به صفحه اصلی
            </button>
          </div>

        </div>
      </div>
    );
  }

  const products = shop.product_items && shop.product_items.length > 0
    ? shop.product_items
    : [
        { id: 'p-1', name: 'نان ساده' },
        { id: 'p-2', name: 'نان بزرگ' }
      ];

  return (
    <div className="max-w-xl mx-auto px-2 sm:px-4 py-2 sm:py-3 space-y-2.5">
      
      {/* Toast Notification Message */}
      {message && (
        <div className="p-2.5 bg-amber-500 text-slate-950 font-black rounded-2xl text-xs text-center shadow-lg border border-amber-400 animate-bounce">
          {message}
        </div>
      )}

      {/* SLIM TOP CONTROLS & STATS BAR */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
            title="امکانات و تنظیمات متصدی"
          >
            <Settings className="w-3.5 h-3.5 text-amber-600" />
            <span>تنظیمات و چاپ</span>
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
            title="استودیو پوستر A4"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={reloadData}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="بروزرسانی"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 font-bold text-[11px]">
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
            در انتظار: <strong className="text-amber-600 font-mono">{toPersianDigits(queueInfo.waitingCount)}</strong>
          </span>
          <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
            سرو شده: <strong className="font-mono">{toPersianDigits(queueInfo.servedCount || 0)}</strong>
          </span>
        </div>
      </div>

      {/* 🔴 SECTION 1: HIGHEST ELEMENT - BIG RED SERVE BUTTON (دکمه تحویل در بالاترین قسمت با رنگ قرمز) */}
      <div className="relative">
        <button
          onClick={handleServeNext}
          className="w-full py-4 sm:py-5 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-black rounded-3xl shadow-xl shadow-red-600/30 flex flex-col items-center justify-center gap-1.5 transition-all text-center border-2 border-red-500"
        >
          <div className="flex items-center justify-center gap-2">
            <BellRing className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse text-amber-200" />
            <span className="text-base sm:text-lg">
              {shop.serve_button_label || '🥖 تحویل و فراخوانی نوبت بعدی'}
            </span>
          </div>

          {queueInfo.currentlyServing ? (
            <div className="flex items-center gap-2 text-xs sm:text-sm bg-red-800/80 px-3 py-1 rounded-xl text-red-100 font-mono">
              <span>هم‌اکنون در حال تحویل نوبت #{toPersianDigits(queueInfo.currentlyServing.ticket_number)}</span>
              <span className="text-amber-300 font-bold">({queueInfo.currentlyServing.customer_name || 'مشتری'})</span>
            </div>
          ) : (
            <div className="text-[11px] sm:text-xs text-red-100 font-bold">
              {queueInfo.waitingCount > 0 
                ? `آماده فراخوانی از بین ${toPersianDigits(queueInfo.waitingCount)} نفر در صف انتظار` 
                : 'صف در حال حاضر خالی است'}
            </div>
          )}
        </button>
      </div>

      {/* 🟢 SECTION 2: ADD IN-PERSON CUSTOMER BUTTONS (دکمه‌های اضافه کردن افراد حضوری زیر دکمه تحویل) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 shadow-md border border-slate-200 dark:border-slate-800 space-y-2.5">
        
        {/* Bread / Product Selector Chips if multiple */}
        {products.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            <span className="text-[11px] font-extrabold text-slate-500 shrink-0">نوع نان:</span>
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedBreadType(p.name)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedBreadType === p.name
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* Big Single and Multi Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Single Customer Button */}
          <button
            onClick={handleAddSingleCustomer}
            className="py-3.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{shop.single_button_label || '+ نوبت تکی (۱ عدد)'}</span>
          </button>

          {/* Multi Customer Button with Quick Stepper */}
          <div className="flex items-stretch gap-1.5">
            <button
              onClick={() => handleAddMultiCustomer(customMultiQty)}
              className="flex-1 py-3.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{shop.multi_button_label ? `${shop.multi_button_label} (${toPersianDigits(customMultiQty)})` : `+ نوبت چندتایی (${toPersianDigits(customMultiQty)} عدد)`}</span>
            </button>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setCustomMultiQty(q => Math.min(q + 1, 30))}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs rounded-lg"
                title="افزایش"
              >
                +
              </button>
              <button
                onClick={() => setCustomMultiQty(q => Math.max(q - 1, 2))}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs rounded-lg"
                title="کاهش"
              >
                -
              </button>
            </div>
          </div>
        </div>

        {/* Quick Multi Presets */}
        <div className="flex items-center gap-1 pt-0.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-slate-500 font-bold shrink-0">تعداد سریع:</span>
          {[2, 3, 5, 10, 15, 20].map(cnt => (
            <button
              key={cnt}
              onClick={() => handleAddMultiCustomer(cnt)}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 text-[11px] font-mono font-bold transition-colors"
            >
              +{toPersianDigits(cnt)}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 SECTION 3: QUEUE WAITING LIST (صف به همین شکل که قرار دادی هم زیرش) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4 shadow-md border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              افراد حاضر در صف انتظار
            </h3>
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs rounded-full">
              {toPersianDigits(queueInfo.waitingCount)} نفر
            </span>
          </div>

          <button onClick={reloadData} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="بروزرسانی">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {queueInfo.waitingItems.length === 0 ? (
          <div className="text-center py-6 space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              صف در حال حاضر خالی است.
            </p>
            <p className="text-[10px] text-slate-400">
              با اسکن QR کد توسط مشتریان یا دکمه‌های بالا، نوبت‌ها بلافاصله اضافه می‌شوند.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {queueInfo.waitingItems.map((item: QueueItem) => (
              <div 
                key={item.id} 
                className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-sm">
                    #{toPersianDigits(item.ticket_number)}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {item.customer_name || 'مشتری'}
                      </h4>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        item.ticket_type === 'in_person_single' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}>
                        {item.ticket_type === 'in_person_single' ? 'تکی' : 'چندتایی'}
                      </span>
                    </div>

                    {item.items_summary ? (
                      <p className="text-[10px] sm:text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        🥖 {item.items_summary}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500">
                        تعداد: {toPersianDigits(item.quantity)} عدد
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleCancelTicket(item.id, item.ticket_number)}
                  className="px-2 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-[11px] font-bold flex items-center gap-1 border border-rose-200 dark:border-rose-900 transition-colors"
                  title="لغو نوبت"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>لغو</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shopkeeper Settings Modal */}
      {showSettingsModal && (
        <ShopkeeperSettingsModal
          shop={shop}
          onClose={() => setShowSettingsModal(false)}
          onOpenQrStudio={() => setShowQrModal(true)}
          onSettingsUpdated={handleSettingsUpdated}
        />
      )}

      {/* QrPrintStudio Modal */}
      {showQrModal && (
        <QrPrintStudio
          shop={shop}
          custQr={customerQrImg}
          opQr={operatorQrImg}
          onClose={() => setShowQrModal(false)}
        />
      )}

    </div>
  );
};
