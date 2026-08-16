import React, { useState } from 'react';
import { 
  X, Settings, QrCode, Printer, Radio, Image, SlidersHorizontal, 
  Trash2, ShieldCheck, Check, Lock, Eye, EyeOff, Save, Store
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Shop, ProductItem } from '../types';
import { StorageService } from '../services/storage';
import { AudioRadioPlayer } from './AudioRadioPlayer';
import { PasswordInput } from './PasswordInput';
import { ShopProductsManager } from './ShopProductsManager';
import { toPersianDigits } from '../utils/jalali';

interface ShopkeeperSettingsModalProps {
  shop: Shop;
  onClose: () => void;
  onOpenQrStudio: () => void;
  onSettingsUpdated: (updatedShop: Shop) => void;
}

export const ShopkeeperSettingsModal: React.FC<ShopkeeperSettingsModalProps> = ({
  shop,
  onClose,
  onOpenQrStudio,
  onSettingsUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'products' | 'labels' | 'banner' | 'security'>('tools');

  // Form states initialized from shop
  const [selectedBannerId, setSelectedBannerId] = useState(shop.banner_id || '');
  const [bannerUrl, setBannerUrl] = useState(shop.banner_image_url || '');
  const [bannerTargetUrl, setBannerTargetUrl] = useState(shop.banner_target_url || '');
  const [bannerTitle, setBannerTitle] = useState(shop.banner_title || '');
  const [bannerActive, setBannerActive] = useState(shop.banner_active !== false);

  const [serveBtnLabel, setServeBtnLabel] = useState(shop.serve_button_label || '');
  const [singleBtnLabel, setSingleBtnLabel] = useState(shop.single_button_label || '');
  const [multiBtnLabel, setMultiBtnLabel] = useState(shop.multi_button_label || '');

  const [productsList, setProductsList] = useState<ProductItem[]>(
    shop.product_items && shop.product_items.length > 0
      ? shop.product_items
      : [
          { id: 'p-1', name: 'نان ساده' },
          { id: 'p-2', name: 'نان بزرگ' }
        ]
  );

  const [requireOperatorPassword, setRequireOperatorPassword] = useState(shop.require_operator_password === true);
  const [operatorPassword, setOperatorPassword] = useState(shop.operator_password || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const systemBanners = StorageService.getBanners();

  const handleSelectSystemBanner = (id: string) => {
    setSelectedBannerId(id);
    if (id) {
      const found = systemBanners.find(b => b.id === id);
      if (found) {
        setBannerUrl(found.image_url);
        setBannerTitle(found.title);
        setBannerTargetUrl(found.target_url || '');
      }
    }
  };

  const handleSave = () => {
    const updated: Shop = {
      ...shop,
      banner_id: selectedBannerId || undefined,
      banner_image_url: bannerUrl,
      banner_target_url: bannerTargetUrl,
      banner_title: bannerTitle,
      banner_active: bannerActive,
      serve_button_label: serveBtnLabel,
      single_button_label: singleBtnLabel,
      multi_button_label: multiBtnLabel,
      require_operator_password: requireOperatorPassword,
      operator_password: operatorPassword.trim() ? operatorPassword.trim() : undefined,
      product_items: productsList.filter(p => p.name.trim().length > 0)
    };

    StorageService.saveShop(updated);
    onSettingsUpdated(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Settings className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                امکانات و تنظیمات متصدی
              </h3>
              <p className="text-[11px] text-slate-500 font-bold">
                {shop.name} ({shop.category})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 py-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto shrink-0 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'tools'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>چاپ و نوبت‌خوان</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>انواع نان ({toPersianDigits(productsList.length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('labels')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'labels'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>شخصی‌سازی دکمه‌ها</span>
          </button>

          <button
            onClick={() => setActiveTab('banner')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'banner'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>بنر تبلیغاتی</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>امنیت و رمز</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 text-right">
          
          {/* TAB 1: TOOLS (PRINT & RADIO) */}
          {activeTab === 'tools' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  استودیو پوستر A4 و فیش حرارتی:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenQrStudio();
                    }}
                    className="py-3 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>استودیو چاپ پوستر A4</span>
                  </button>

                  {shop.thermal_printer_enabled ? (
                    <Link
                      to={`/print/${shop.id}`}
                      onClick={onClose}
                      className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                    >
                      <Printer className="w-4 h-4 text-emerald-400" />
                      <span>چاپ فیش حرارتی POS (فعال)</span>
                    </Link>
                  ) : (
                    <div 
                      className="py-3 px-3 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-center"
                      title="امکان چاپ فیش حرارتی توسط مدیر سیستم در پنل مدیریت قابل فعال‌سازی است."
                    >
                      <div className="flex items-center gap-1.5">
                        <Printer className="w-4 h-4 text-slate-400" />
                        <span>فیش حرارتی: غیرفعال</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">(تنظیم از پنل مدیریت)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  رادیو نوبت‌خوان صوتی متصدی:
                </h4>
                <AudioRadioPlayer />
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS & BREAD TYPES */}
          {activeTab === 'products' && (
            <div className="space-y-3 animate-fade-in">
              {shop.has_dynamic_menu ? (
                <ShopProductsManager shop={shop} onUpdate={() => setProductsList(StorageService.getShops().find(s => s.id === shop.id)?.product_items || [])} />
              ) : (
                <>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    مدیریت انواع نان / محصولات این مرکز:
                  </h4>
                  <div className="space-y-2">
                    {productsList.map((p, idx) => (
                      <div key={p.id || idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => {
                            const updated = [...productsList];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setProductsList(updated);
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        />
                        <button
                          onClick={() => setProductsList(prev => prev.filter((_, i) => i !== idx))}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setProductsList(prev => [...prev, { id: `p-${Date.now()}`, name: 'نوع جدید' }])}
                      className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      + افزودن نوع نان جدید
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOM LABELS */}
          {activeTab === 'labels' && (
            <div className="space-y-3 animate-fade-in text-xs">
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                شخصی‌سازی عناوین دکمه‌های متصدی:
              </h4>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">دکمه قرمز تحویل و فراخوانی:</label>
                  <input
                    type="text"
                    value={serveBtnLabel}
                    onChange={(e) => setServeBtnLabel(e.target.value)}
                    placeholder="تحویل نان و نوبت بعدی"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">دکمه نوبت تکی:</label>
                  <input
                    type="text"
                    value={singleBtnLabel}
                    onChange={(e) => setSingleBtnLabel(e.target.value)}
                    placeholder="+ نوبت تکی (۱ عدد)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">دکمه نوبت چندتایی:</label>
                  <input
                    type="text"
                    value={multiBtnLabel}
                    onChange={(e) => setMultiBtnLabel(e.target.value)}
                    placeholder="+ نوبت چندتایی"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BANNER CONFIG */}
          {activeTab === 'banner' && (
            <div className="space-y-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  تنظیم بنر تبلیغاتی کلیک‌خور برای مشتریان:
                </h4>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>نمایش بنر</span>
                  <input
                    type="checkbox"
                    checked={bannerActive}
                    onChange={(e) => setBannerActive(e.target.checked)}
                    className="w-4 h-4 accent-amber-500"
                  />
                </label>
              </div>

              {/* Banner aspect ratio info note */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[11px] leading-relaxed">
                📐 <strong>سایز استاندارد پیشنهادی:</strong> ۱۲۰۰ در ۴۰۰ پیکسل (نسبت ۳:۱). سیستم بی‌صف به طور هوشمند و خودکار با حفظ نسبت ابعاد (Aspect Ratio) تصویر را کامل نمایش می‌دهد.
              </div>

              {/* Predefined banners dropdown */}
              {systemBanners.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">انتخاب از بنرهای سراسری تعریف‌شده توسط مدیر:</label>
                  <select
                    value={selectedBannerId}
                    onChange={(e) => handleSelectSystemBanner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">بنر سفارشی دستی (لینک زیر)</option>
                    {systemBanners.map(b => (
                      <option key={b.id} value={b.id}>{b.title} {b.is_active ? '🟢' : '⚪'}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">آدرس عکس بنر (URL):</label>
                  <input
                    type="text"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none"
                    dir="ltr"
                  />
                </div>

                {/* Aspect Ratio Preserved Live Image Preview */}
                {bannerUrl.trim() && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500">پیش‌نمایش زنده با حفظ نسبت تصویر:</span>
                    <div className="w-full bg-slate-900 rounded-xl p-1.5 border border-slate-700 flex items-center justify-center min-h-[80px] max-h-[130px] overflow-hidden">
                      <img
                        src={bannerUrl}
                        alt="پیش‌نمایش"
                        className="max-h-[120px] w-auto max-w-full object-contain mx-auto rounded shadow"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">لینک مقصد هنگام کلیک (Target URL):</label>
                  <input
                    type="text"
                    value={bannerTargetUrl}
                    onChange={(e) => setBannerTargetUrl(e.target.value)}
                    placeholder="https://bisaf.ir/... یا اینستاگرام"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">عنوان زیر بنر:</label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="سفارش آنلاین نان داغ برکت بدون صف"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & OPERATOR PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-3 animate-fade-in text-xs bg-purple-50 dark:bg-purple-950/30 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  قفل امنیتی و رمز عبور متصدی:
                </h4>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-800 dark:text-purple-200">
                  <span>الزام رمز</span>
                  <input
                    type="checkbox"
                    checked={requireOperatorPassword}
                    onChange={(e) => setRequireOperatorPassword(e.target.checked)}
                    className="w-4 h-4 accent-purple-600"
                  />
                </label>
              </div>

              <p className="text-[11px] text-purple-800 dark:text-purple-300 leading-relaxed">
                در صورت فعال بودن، ورود به پنل متصدی حتی با اسکن QR کد نیازمند وارد کردن رمز عبور خواهد بود.
              </p>

              {requireOperatorPassword && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-200">
                    رمز عبور اختصاصی متصدی:
                  </label>
                  <PasswordInput
                    value={operatorPassword}
                    onChange={(e) => setOperatorPassword(e.target.value)}
                    placeholder="رمز عبور متصدی..."
                    className="border-purple-300 dark:border-purple-700"
                  />
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
          >
            بستن
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md transition-transform active:scale-[0.98] flex items-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>ذخیره شد!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>ذخیره تغییرات</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
