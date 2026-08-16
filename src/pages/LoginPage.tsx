import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Phone, User, ShieldCheck, Sparkles, MessageCircle, Send, CheckCircle2, Award } from 'lucide-react';
import { AuthService } from '../services/authService';
import { BotService, ActiveBotProviderInfo } from '../services/botService';
import { StorageService } from '../services/storage';
import { translateError } from '../utils/errorTranslator';
import { PasswordInput } from '../components/PasswordInput';
import { useDynamicText } from '../hooks/useDynamicText';
import { toPersianDigits } from '../utils/persianNumbers';

export const LoginPage: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  const [activeBots, setActiveBots] = useState<ActiveBotProviderInfo[]>([]);
  
  const botPromoTitle = useDynamicText('login_bot_promo_title', 'ثبت‌نام و ورود سریع با ربات‌ها (اولویت اول)');
  const botPromoBadge = useDynamicText('login_bot_promo_badge', 'بدون نیاز به پیامک');
  const botPromoDesc = useDynamicText('login_bot_promo_desc', 'با ۱ کلیک در ربات‌های بله و تلگرام عضو شوید و نوبت‌های خود را به صورت اعلان آنلاین پیگیری کنید:');

  useEffect(() => {
    const bots = BotService.getActiveBotProviders();
    // Ensure both Bale and Telegram are represented for quick bot access
    if (bots.length === 0) {
      setActiveBots([
        { id: 'bale', name: 'بله', username: 'BiSafBot', icon: 'MessageCircle', color: 'bg-emerald-600' },
        { id: 'telegram', name: 'تلگرام', username: 'BiSafQueueBot', icon: 'Send', color: 'bg-sky-500' }
      ]);
    } else {
      setActiveBots(bots);
    }
  }, []);
  
  // Login Password fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP fields
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (loginMethod === 'password') {
        const res = await AuthService.login(identifier, password);
        if (!res.success) {
          setErrorMsg(res.error || 'اطلاعات ورود نامعتبر است.');
        } else {
          redirectUserByRole(res.user?.role, res.user?.id);
        }
      } else {
        // OTP Login / Auto-Register as Customer
        if (!otpSent) {
          if (!otpPhone || otpPhone.trim().length < 10) {
            setErrorMsg('لطفاً شماره موبایل معتبر (۱۱ رقم) وارد کنید.');
            setLoading(false);
            return;
          }
          const generatedCode = Math.floor(10000 + Math.random() * 90000).toString();
          setSimulatedOtp(generatedCode);
          setOtpSent(true);
          setSuccessMsg(`کد تایید پیامکی: ${generatedCode}`);
          setLoading(false);
          return;
        }

        const res = await AuthService.loginWithOTP(otpPhone, otpCode);
        if (!res.success) {
          setErrorMsg(res.error || 'کد تایید وارد شده صحیح نمی‌باشد.');
        } else {
          redirectUserByRole(res.user?.role, res.user?.id);
        }
      }
    } catch (err) {
      setErrorMsg(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  const redirectUserByRole = (role?: string, userId?: string) => {
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'shopkeeper') {
      const shops = StorageService.getShops();
      const shop = shops.find(s => s.owner_id === userId);
      if (shop) {
        navigate(`/panel/${shop.id}`);
      } else {
        navigate('/dashboard');
      }
    } else if (role === 'marketer') {
      navigate('/marketer');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
      <div className="bg-white dark:bg-slate-900 rounded-b-2xl sm:rounded-b-2xl max-w-md w-full p-4 sm:p-6 shadow-xl border-x border-b border-t-0 border-slate-200 dark:border-slate-800 space-y-3.5">
        
        {/* 🌟 1. BOT REGISTRATION - TOP PRIORITY (ثبت‌نام و اتصال فوری در پیام‌رسان‌ها) */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                {botPromoTitle}
              </span>
            </div>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
              {botPromoBadge}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
            {botPromoDesc}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <a 
              href={BotService.getBotDeepLink('bale', 'BiSafBot', 'register')}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-2 bg-[#2ba36c] hover:bg-[#238a5b] text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>ربات بله</span>
            </a>

            <a 
              href={BotService.getBotDeepLink('telegram', 'BiSafQueueBot', 'register')}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-2 bg-[#2AABEE] hover:bg-[#2298D4] text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>ربات تلگرام</span>
            </a>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="relative flex py-0.5 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink-0 mx-3 text-slate-400 dark:text-slate-500 text-[11px] font-bold">یا ورود با شماره موبایل</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* ALERTS */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold text-center animate-shake">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold text-center flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            {simulatedOtp && (
              <button
                type="button"
                onClick={() => setOtpCode(simulatedOtp)}
                className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700"
              >
                درج خودکار کد
              </button>
            )}
          </div>
        )}

        {/* AUTH FORM */}
        <form onSubmit={handleLogin} className="space-y-3">
          
          {/* Method Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => { setLoginMethod('otp'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                loginMethod === 'otp'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              کد یکبار مصرف (SMS)
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('password'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                loginMethod === 'password'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              رمز عبور / نام کاربری
            </button>
          </div>

          {loginMethod === 'password' ? (
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  شماره موبایل یا نام کاربری
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="09121234567 یا نام کاربری"
                    className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رمز عبور
                </label>
                <PasswordInput
                  showLockIcon
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور خود را وارد کنید"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  شماره همراه (مشتری)
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    disabled={otpSent}
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    placeholder="09123456789"
                    className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="animate-fade-in space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      کد ۵ رقمی تایید
                    </label>
                    <button 
                      type="button" 
                      onClick={() => { setOtpSent(false); setOtpCode(''); setSuccessMsg(''); }}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                      تغییر شماره
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="12345"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm tracking-widest text-center font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                    dir="ltr"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md shadow-emerald-600/20 transition-all text-xs flex items-center justify-center gap-2"
          >
            {loading
              ? 'در حال بررسی...'
              : loginMethod === 'otp'
                ? otpSent ? 'ورود به سامانه' : 'ارسال کد یکبار مصرف (SMS)'
                : 'ورود به حساب'}
          </button>
        </form>

        {/* 🌟 MARKETER REGISTRATION CALLOUT (لینک به صفحه اختصاصی ثبت‌نام بازاریابان) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            to="/marketer-register"
            className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline p-1"
          >
            <Award className="w-3.5 h-3.5" />
            <span>متقاضی همکاری به عنوان بازاریاب هستید؟ ثبت‌نام بازاریابان</span>
          </Link>
        </div>

        {/* Bottom Trust Badge */}
        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>امنیت اطلاعات و حریم خصوصی در بی‌صف تضمین‌شده است</span>
        </div>

      </div>
    </div>
  );
};
