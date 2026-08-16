import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Award, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  Globe, 
  Info, 
  Lock, 
  MapPin, 
  Phone, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  Store, 
  TrendingUp, 
  User, 
  Users,
  CreditCard
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/authService';
import { Marketer, Profile } from '../types';
import { translateError } from '../utils/errorTranslator';
import { PasswordInput } from '../components/PasswordInput';
import { toPersianDigits } from '../utils/persianNumbers';

const IRAN_PROVINCES = [
  'تهران', 'البرز', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی', 'مازندران', 'گیلان',
  'خوزستان', 'قم', 'یزد', 'کرمان', 'کرمانشاه', 'آذربایجان غربی', 'قزوین', 'مرکزی',
  'همدان', 'سمنان', 'هرمزگان', 'بوشهر', 'اردبیل', 'زنجان', 'گلستان', 'لرستان',
  'کردستان', 'سیستان و بلوچستان', 'چهارمحال و بختیاری', 'ایلام', 'خراسان جنوبی', 'خراسان شمالی', 'کهگیلویه و بویراحمد'
];

export const MarketerRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    province: 'تهران',
    city: '',
    nationalId: '',
    shebaNumber: '',
    bankName: 'بانک ملت',
    experienceDescription: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (!formData.fullName.trim()) throw new Error('لطفاً نام و نام خانوادگی را وارد کنید.');
      if (!formData.phone.trim() || formData.phone.length < 10) throw new Error('لطفاً شماره موبایل معتبر ۱۱ رقمی وارد کنید.');
      if (!formData.password || formData.password.length < 4) throw new Error('رمز عبور باید حداقل ۴ کاراکتر باشد.');
      if (!formData.city.trim()) throw new Error('لطفاً شهر فعالیت خود را وارد کنید.');
      if (!formData.nationalId.trim() || formData.nationalId.length < 10) throw new Error('لطفاً کدملی ۱۰ رقمی معتبر وارد کنید.');

      // 1. Check if user already exists in profiles
      const existingProfiles = StorageService.getProfiles();
      let profile = existingProfiles.find(p => p.phone === formData.phone);

      if (profile) {
        // Update profile role if needed
        profile.role = 'marketer';
        profile.full_name = formData.fullName;
        StorageService.saveProfile(profile);
      } else {
        // Register new profile
        const regRes = await AuthService.register({
          phone: formData.phone,
          password: formData.password,
          fullName: formData.fullName,
          role: 'marketer'
        });
        profile = regRes;
      }

      // 2. Create or Update Marketer record
      const marketerId = `marketer-${Date.now()}`;
      const newMarketer: Marketer = {
        id: marketerId,
        user_id: profile.id,
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        province: formData.province,
        city: formData.city.trim(),
        national_id: formData.nationalId.trim(),
        sheba_number: formData.shebaNumber.trim() ? (formData.shebaNumber.startsWith('IR') ? formData.shebaNumber : `IR${formData.shebaNumber}`) : undefined,
        bank_name: formData.bankName,
        experience_description: formData.experienceDescription.trim(),
        commission_rate: 10, // Default base percentage; strictly determined and fine-tuned by Admin in Admin Panel
        status: 'pending', // Pending Admin review and commission rate assignment
        created_at: new Date().toISOString()
      };

      StorageService.saveMarketer(newMarketer);

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* SUCCESS VIEW */}
        {isSuccess ? (
          <div className="bg-white dark:bg-slate-900 rounded-b-3xl sm:rounded-b-3xl rounded-t-none p-6 sm:p-10 shadow-xl border-x border-b border-t-0 border-emerald-200 dark:border-emerald-800 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                ثبت‌نام شما با موفقیت انجام شد!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                مشخصات کامل شما و شهر فعالیت (<span className="font-bold text-emerald-600 dark:text-emerald-400">{formData.city}</span>) با موفقیت در سامانه ثبت شد.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-right text-xs space-y-2 max-w-lg mx-auto">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Info className="w-4 h-4 text-indigo-500" />
                <span>مراحل بعدی:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                <li>مدیریت ارشد سیستم (Super Admin) مشخصات شما را بررسی و درصد پورسانت اختصاصی شما را تعیین و حساب را فعال خواهد کرد.</li>
                <li>پس از فعال‌سازی می‌توانید با شماره همراه و رمز عبور وارد پنل بازاریابی خود شوید و شروع به ثبت اصناف نمایید.</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/login"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all text-xs"
              >
                ورود به سامانه
              </Link>
              <Link
                to="/"
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all text-xs"
              >
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* SECTION 1: ROLE OVERVIEW & COOPERATION EXPLANATION */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-b-3xl sm:rounded-b-3xl rounded-t-none p-5 sm:p-8 shadow-xl border-x border-b border-t-0 border-indigo-700/40 space-y-6 relative overflow-hidden">
              
              {/* Background ambient lighting */}
              <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-black">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>فرصت همکاری و کسب درآمد مستمر</span>
                </div>

                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                  همکاری به عنوان بازاریاب رسمی سامانه هوشمند «بی‌صف»
                </h1>

                <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed max-w-3xl">
                  سامانه «بی‌صف» اولین و پیشرفته‌ترین پلتفرم نوبت‌دهی آنلاین ابری در کشور است که صف‌های فیزیکی اصناف (نانوایی‌ها، مراکز پزشکی و درمانی، رستوران‌ها، سالن‌های زیبایی و انواع فروشگاه‌ها) را به نوبت‌های هوشمند مجازی تبدیل می‌کند.
                </p>
              </div>

              {/* 4 Core Responsibilities */}
              <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/30 flex items-center justify-center text-amber-300 font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-xs text-white">۱. معرفی به اصناف</h3>
                  <p className="text-[11px] text-indigo-100/80 leading-relaxed">
                    مراجعه به نانوایی‌ها، درمانگاه‌ها، رستوران‌ها و معرفی مزایای نوبت‌دهی آنلاین.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/30 flex items-center justify-center text-emerald-300 font-bold">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-xs text-white">۲. ثبت مرکز در سامانه</h3>
                  <p className="text-[11px] text-indigo-100/80 leading-relaxed">
                    ثبت نام صنف، ایجاد باجه‌های نوبت‌دهی و تنظیم ساعات کاری در پنل اختصاصی بازاریاب.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/30 flex items-center justify-center text-cyan-300 font-bold">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-xs text-white">۳. نصب پوستر استند QR</h3>
                  <p className="text-[11px] text-indigo-100/80 leading-relaxed">
                    چاپ و تحویل استند و پوستر QR اختصاصی فروشگاه جهت اسکن توسط مشتریان.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/30 flex items-center justify-center text-rose-300 font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-xs text-white">۴. آموزش اولیه متصدی</h3>
                  <p className="text-[11px] text-indigo-100/80 leading-relaxed">
                    راهنمایی کوتاه متصدی برای فراخوانی نوبت‌ها و استفاده از چاپ فیش.
                  </p>
                </div>
              </div>

              {/* Commission Policy Callout */}
              <div className="relative p-4 rounded-2xl bg-indigo-950/60 border border-indigo-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start sm:items-center gap-2.5">
                  <DollarSign className="w-5 h-5 text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <span className="font-black text-amber-300">درآمد و درصد پورسانت بازاریابی:</span>
                    <p className="text-[11px] text-indigo-100/80 leading-relaxed mt-0.5">
                      شما به ازای هر مرکز ثبت‌شده و نوبت‌های ثبت‌شده در سامانه، پورسانت مستمر دریافت می‌کنید. میزان دقیق درصد پورسانت اختصاصی هر بازاریاب، بر اساس منطقه و توافق، توسط <strong>مدیریت کل سیستم (Super Admin)</strong> در پنل تعیین و تأیید می‌گردد.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* SECTION 2: REGISTRATION FORM */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5">
              
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    فرم ثبت‌نام و درخواست همکاری بازاریاب
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    لطفاً اطلاعات دقیق خود را جهت بررسی و تعیین درصد پورسانت وارد نمایید.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  فیلدهای * الزامی
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-bold text-center">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نام و نام خانوادگی *
                    </label>
                    <div className="relative">
                      <User className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="مثال: رضا محمدی"
                        className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      شماره تلفن همراه (جهت ورود و تماس) *
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        dir="ltr"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="09121234567"
                        className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-left"
                      />
                    </div>
                  </div>
                </div>

                {/* Province and City (محل فعالیت بازاریاب) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      استان محل فعالیت *
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {IRAN_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      شهر محل فعالیت *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="مثال: تهران، کرج، مشهد، شیراز و..."
                        className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Identity & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      کد ملی (جهت احراز هویت و قرارداد) *
                    </label>
                    <div className="relative">
                      <FileText className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="nationalId"
                        required
                        maxLength={10}
                        dir="ltr"
                        value={formData.nationalId}
                        onChange={handleChange}
                        placeholder="0012345678"
                        className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-left"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      رمز عبور ورود به سامانه *
                    </label>
                    <PasswordInput
                      showLockIcon
                      required
                      name="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="حداقل ۴ کاراکتر"
                    />
                  </div>
                </div>

                {/* Banking info for settlements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نام بانک
                    </label>
                    <select
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="بانک ملت">بانک ملت</option>
                      <option value="بانک ملی">بانک ملی</option>
                      <option value="بانک پاسارگاد">بانک پاسارگاد</option>
                      <option value="بانک سامان">بانک سامان</option>
                      <option value="بانک تجارت">بانک تجارت</option>
                      <option value="بانک صادرات">بانک صادرات</option>
                      <option value="بانک سپه">بانک سپه</option>
                      <option value="بانک رسالت">بانک قرض‌الحسنه رسالت</option>
                      <option value="بانک مهر ایران">بانک مهر ایران</option>
                      <option value="سایر بانک‌ها">سایر بانک‌ها</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      شماره شبا بانکی (جهت واریز پورسانت)
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="shebaNumber"
                        dir="ltr"
                        value={formData.shebaNumber}
                        onChange={handleChange}
                        placeholder="IR120120000000000000000000"
                        className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-left"
                      />
                    </div>
                  </div>
                </div>

                {/* Experience & Descriptions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سابقه فعالیت، رزومه یا توضیحات تکمیلی (اختیاری)
                  </label>
                  <textarea
                    name="experienceDescription"
                    rows={3}
                    value={formData.experienceDescription}
                    onChange={handleChange}
                    placeholder="مختصری از تجربیات بازاریابی، اصناف تحت ارتباط یا حوزه‌های کاری خود بنویسید..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-xs flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        <span>ارسال درخواست ثبت‌نام بازاریاب</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

              {/* Login link */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">قبلاً ثبت‌نام کرده‌اید؟ </span>
                <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  ورود به پنل کاربری
                </Link>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};
