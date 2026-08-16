import React, { useState, useEffect } from 'react';
import { NotificationService } from '../services/notificationService';
import { StorageService } from '../services/storage';

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    // Check if it's already fired and stored somewhere? 
    // beforeinstallprompt fires once.
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        NotificationService.requestPermission();
      }
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return { canInstall: !!deferredPrompt, install };
};

export function PwaPrompt() {
  const { canInstall, install } = usePwaInstall();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (canInstall && StorageService.getCurrentUser()) {
      setShowPrompt(true);
    }
  }, [canInstall]);

  const handleInstall = async () => {
    setShowPrompt(false);
    await install();
  };

  if (!showPrompt || !canInstall) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-900 z-50 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
          <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg">⚡</span>
        </div>
        <div>
          <h3 className="font-black text-sm text-slate-800 dark:text-white">نصب وب‌اپلیکیشن بی‌صف</h3>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">بدون اشغال فضای گوشی</span>
        </div>
      </div>
      <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-4 font-medium leading-relaxed">
        با نصب بی‌صف روی صفحه اصلی:
        <ul className="list-disc list-inside mt-1 space-y-0.5 text-[10px] font-bold">
          <li>اعلان صوتی رسیدن نوبت را دریافت می‌کنید</li>
          <li>مراکز اطراف خود را روی نقشه می‌بینید</li>
          <li>بدون نیاز به نصب از بازار یا گوگل‌پلی</li>
        </ul>
      </p>
      <div className="flex gap-2">
        <button onClick={handleInstall} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs transition-colors">
          نصب با یک کلیک
        </button>
        <button onClick={() => setShowPrompt(false)} className="px-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-xs bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
          بعداً
        </button>
      </div>
    </div>
  );
}
