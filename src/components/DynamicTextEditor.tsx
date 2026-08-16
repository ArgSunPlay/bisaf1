import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Save, Sparkles, MessageCircle } from 'lucide-react';

const DYNAMIC_TEXTS_SCHEMA = [
  {
    key: 'login_bot_promo_title',
    label: 'تیتر باکس پیشنهاد ربات (صفحه ورود)',
    default: 'ثبت‌نام و ورود سریع با ربات‌ها (اولویت اول)',
    type: 'text'
  },
  {
    key: 'login_bot_promo_badge',
    label: 'برچسب باکس پیشنهاد ربات (صفحه ورود)',
    default: 'بدون نیاز به پیامک',
    type: 'text'
  },
  {
    key: 'login_bot_promo_desc',
    label: 'متن توضیحات باکس پیشنهاد ربات (صفحه ورود)',
    default: 'با ۱ کلیک در ربات‌های بله و تلگرام عضو شوید و نوبت‌های خود را به صورت اعلان آنلاین پیگیری کنید:',
    type: 'textarea'
  },
  {
    key: 'bot_welcome_msg',
    label: 'پیام خوش‌آمدگویی ربات تلگرام/بله',
    default: 'به ربات نوبت‌دهی هوشمند بی‌صف خوش آمدید. لطفاً گزینه مورد نظر را انتخاب کنید:',
    type: 'textarea'
  }
];

export const DynamicTextEditor: React.FC = () => {
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    setTexts(StorageService.getDynamicTexts());
  }, []);

  const handleChange = (key: string, value: string) => {
    setTexts(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (key: string) => {
    const value = texts[key] || '';
    StorageService.saveDynamicText(key, value);
    
    setSaveStatus(`تغییرات برای کلید ${key} ذخیره شد.`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            سیستم مدیریت محتوا (متون و پیام‌ها)
          </h3>
          <p className="text-[11px] text-slate-500 mt-2 font-bold">
            در این بخش می‌توانید متون مختلف استفاده شده در سایت و ربات‌ها را تغییر دهید. با فشردن دکمه ذخیره، متن در کل سامانه به‌روز می‌شود.
          </p>
        </div>

        {saveStatus && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-[11px] font-bold text-center border border-emerald-200 dark:border-emerald-800 animate-fade-in">
            {saveStatus}
          </div>
        )}

        {/* Visual Bot Promo Editor block specifically designed for the login box requirement */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-xs font-black text-indigo-700 dark:text-indigo-400 mb-2">
            ویرایشگر لایو: پیشنهاد ربات (صفحه لاگین)
          </h4>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 space-y-2 max-w-md mx-auto shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-1 ml-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <input 
                  type="text" 
                  value={texts['login_bot_promo_title'] ?? DYNAMIC_TEXTS_SCHEMA.find(t => t.key === 'login_bot_promo_title')?.default} 
                  onChange={(e) => handleChange('login_bot_promo_title', e.target.value)}
                  className="text-xs font-black text-slate-800 dark:text-slate-200 bg-transparent border-b border-dashed border-emerald-300 focus:outline-none w-full"
                />
              </div>
              <input 
                type="text"
                value={texts['login_bot_promo_badge'] ?? DYNAMIC_TEXTS_SCHEMA.find(t => t.key === 'login_bot_promo_badge')?.default}
                onChange={(e) => handleChange('login_bot_promo_badge', e.target.value)}
                className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs w-28 text-center focus:outline-none"
              />
            </div>

            <textarea 
              value={texts['login_bot_promo_desc'] ?? DYNAMIC_TEXTS_SCHEMA.find(t => t.key === 'login_bot_promo_desc')?.default}
              onChange={(e) => handleChange('login_bot_promo_desc', e.target.value)}
              className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug w-full bg-transparent border border-dashed border-emerald-300/50 rounded-lg p-2 focus:outline-none resize-none h-16"
            />
            
            <button
              onClick={() => {
                handleSave('login_bot_promo_title');
                handleSave('login_bot_promo_badge');
                handleSave('login_bot_promo_desc');
              }}
              className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> ذخیره باکس پیشنهاد ربات
            </button>
          </div>
        </div>

        {/* Other text fields */}
        <div className="space-y-4 pt-4">
          <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">سایر متون سامانه</h4>
          {DYNAMIC_TEXTS_SCHEMA.filter(t => !t.key.startsWith('login_bot_promo_')).map((schema) => (
            <div key={schema.key} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {schema.label}
              </label>
              <div className="flex gap-2">
                {schema.type === 'textarea' ? (
                  <textarea
                    value={texts[schema.key] ?? schema.default}
                    onChange={(e) => handleChange(schema.key, e.target.value)}
                    className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500 h-20 resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={texts[schema.key] ?? schema.default}
                    onChange={(e) => handleChange(schema.key, e.target.value)}
                    className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                )}
                <button
                  onClick={() => handleSave(schema.key)}
                  className="px-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  ذخیره
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
