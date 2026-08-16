import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Phone, User, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { AuthService } from '../services/authService';
import { ReferralService } from '../services/referralService';
import { translateError } from '../utils/errorTranslator';
import { PasswordInput } from '../components/PasswordInput';

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    phone: '',
    username: '',
    fullName: '',
    password: '',
    role: 'customer'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.phone || !formData.password || !formData.fullName) {
        throw new Error('لطفاً فیلدهای ضروری را تکمیل کنید');
      }

      const user = await AuthService.register({
        phone: formData.phone,
        password: formData.password,
        fullName: formData.fullName,
        username: formData.username || undefined,
        role: formData.role as any
      });

      // Handle referral
      const refCode = searchParams.get('ref');
      if (refCode) {
        ReferralService.createReferral(refCode, formData.phone);
      }

      // Dispatch auth_change event
      window.dispatchEvent(new Event('auth_change'));
      
      // Navigate based on role
      if (user.role === 'customer') {
        navigate('/dashboard');
      } else if (user.role === 'shopkeeper') {
        navigate('/dashboard');
      } else if (user.role === 'marketer') {
        navigate('/marketer');
      } else {
        navigate('/admin');
      }
      
    } catch (err: any) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
      <div className="bg-white dark:bg-slate-900 rounded-b-2xl sm:rounded-b-2xl max-w-md w-full p-4 sm:p-6 shadow-xl border-x border-b border-t-0 border-slate-200 dark:border-slate-800 space-y-3.5">
        
        {error && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl flex items-center gap-2 border border-rose-200 dark:border-rose-800">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              شماره موبایل *
            </label>
            <div className="relative">
              <Phone className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                name="phone"
                dir="ltr"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-2 pr-9 pl-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left font-mono"
                placeholder="09123456789"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              نام و نام خانوادگی *
            </label>
            <div className="relative">
              <User className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-2 pr-9 pl-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="نام کامل خود را وارد کنید"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              نام کاربری (اختیاری)
            </label>
            <div className="relative">
              <User className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="username"
                dir="ltr"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-2 pr-9 pl-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left font-mono"
                placeholder="ali_ahmadi"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              رمز عبور *
            </label>
            <PasswordInput
              showLockIcon
              required
              name="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="رمز عبور دلخواه"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              نقش کاربری
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="customer">مشتری (دریافت نوبت)</option>
              <option value="shopkeeper">متصدی فروشگاه / مرکز</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-xs shadow-md shadow-emerald-600/20 mt-3"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>ثبت‌نام در سامانه بی‌صف</span>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <Link to="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            حساب دارید؟ ورود به سایت
          </Link>

          <Link to="/marketer-register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>همکاری بازاریاب</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
