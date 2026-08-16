import React, { useState } from 'react';
import { CheckCircle2, Lock, Sparkles, ArrowLeft, ShieldCheck, X } from 'lucide-react';
import { AuthService } from '../services/authService';
import { QueueItem } from '../types';
import { PasswordInput } from './PasswordInput';

interface RegistrationConversionModalProps {
  ticket: QueueItem;
  shopName: string;
  onClose: () => void;
}

export const RegistrationConversionModal: React.FC<RegistrationConversionModalProps> = ({
  ticket,
  shopName,
  onClose
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState(ticket.customer_phone || '');
  const [password, setPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleStep1Submit = () => {
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPass = password.trim() || AuthService.generateRandomPassword();
    setGeneratedPassword(finalPass);

    // Register user account
    AuthService.register({
      phone: phone || '09120000000',
      password: finalPass,
      username: username || undefined,
      fullName: ticket.customer_name || 'کاربر جدید'
    });

    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-5 text-right">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              ✅ نوبت شما ثبت شد. با حساب رایگان بی‌صف (کمتر از ۱ دقیقه):
            </h3>

            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p>🔔 نزدیک نوبتتان را از طریق بله، ایتا یا روبیکا به شما اطلاع می‌دهیم. بدون ثبت‌نام، فقط اعلان مرورگر ارسال می‌شود که ممکن است آن را نبینید.</p>
              <p>🏠 از هرجا نوبت بگیرید و فقط زمان نوبت مراجعه کنید.</p>
              <p>⚡ با یک لمس دوباره از مراکز قبلی نوبت بگیرید.</p>
              <p>🗺️ همه مراکز عضو بی‌صف را روی نقشه ببینید.</p>
              <p>🚀 هر روز مراکز جدیدی اضافه می‌شوند.</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 pt-1">🟢 رایگان | کمتر از ۱ دقیقه</p>
            </div>

            <button
              onClick={handleStep1Submit}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all text-center flex items-center justify-center gap-2"
            >
              ساخت حساب رایگان
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-5 text-right">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
              <Sparkles className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              🎉 یک قدم تا فعال شدن حسابتان
            </h3>

            <div className="flex items-center gap-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl">
              <span>✅ فعال‌سازی فوری</span>
              <span>✅ رایگان</span>
              <span>✅ کمتر از ۱ دقیقه</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  شماره موبایل
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09121234567"
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-left focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  🔒 رمز عبور (اختیاری - در صورت خالی ماندن خودکار تولید می‌شود)
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز دلخواه یا خالی جهت تولید خودکار"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نام کاربری (اختیاری جهت ورود با نام کاربری)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مانند: ali123"
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-left focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all text-center flex items-center justify-center gap-2"
            >
              🚀 ساخت حساب رایگان
            </button>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-5 text-right">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              🎉 حسابتان با موفقیت فعال شد.
            </h3>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 space-y-2">
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                🔑 رمز عبور شما: <span className="font-mono text-lg bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 select-all">{generatedPassword}</span>
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                از این پس با شماره موبایل خود و این رمز می‌توانید از طریق مرورگر، بله، ایتا و روبیکا وارد بی‌صف شوید.
              </p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                🔒 برای امنیت بیشتر می‌توانید رمز خود را تغییر دهید.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-lg transition-all text-center flex items-center justify-center gap-2"
            >
              🚀 تغییر رمز عبور / مشاهده داشبورد
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
