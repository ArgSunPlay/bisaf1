import React, { useMemo } from 'react';
import { Sparkles, ExternalLink, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Shop, BannerItem } from '../types';
import { StorageService } from '../services/storage';

interface ClickablePromoBannerProps {
  shop?: Shop | null;
  className?: string;
  onBannerClick?: () => void;
}

export const ClickablePromoBanner: React.FC<ClickablePromoBannerProps> = ({
  shop,
  className = '',
  onBannerClick
}) => {
  // Resolve banner: from shop.banner_id or shop direct fields
  const resolvedBanner: BannerItem | null = useMemo(() => {
    if (!shop) return null;
    if (shop.banner_id) {
      const b = StorageService.getBannerById(shop.banner_id);
      if (b && b.is_active) return b;
    }
    if (shop.banner_active && shop.banner_image_url) {
      return {
        id: 'shop-inline-banner',
        title: shop.banner_title || `پیشنهاد ویژه ${shop.name}`,
        image_url: shop.banner_image_url,
        target_url: shop.banner_target_url || '#',
        is_active: true,
        created_at: new Date().toISOString()
      };
    }
    return null;
  }, [shop]);

  // If a banner is active
  if (resolvedBanner && resolvedBanner.image_url) {
    const handleClick = () => {
      if (onBannerClick) {
        onBannerClick();
      }
      if (resolvedBanner.target_url && resolvedBanner.target_url !== '#') {
        if (resolvedBanner.target_url.startsWith('http://') || resolvedBanner.target_url.startsWith('https://')) {
          window.open(resolvedBanner.target_url, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = resolvedBanner.target_url;
        }
      }
    };

    return (
      <div 
        id="shop-clickable-promo-banner"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
        className={`relative overflow-hidden rounded-2xl cursor-pointer shadow-md group border border-amber-200/60 dark:border-amber-900/40 hover:shadow-lg transition-all duration-300 transform active:scale-[0.99] bg-slate-950 ${className}`}
      >
        {/* Banner Image Container with Aspect-Ratio Protection */}
        <div className="relative w-full h-28 sm:h-32 flex items-center justify-center overflow-hidden bg-slate-900">
          <img 
            src={resolvedBanner.image_url} 
            alt={resolvedBanner.title || 'بنر تبلیغاتی اختصاصی'} 
            className="w-full h-full object-contain sm:object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
        </div>

        {/* Banner Content Overlay */}
        <div className="absolute inset-0 p-3 flex flex-col justify-between text-white pointer-events-none">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 font-extrabold text-[10px] flex items-center gap-1 shadow-sm backdrop-blur-xs">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              <span>پیشنهاد و اطلاع‌رسانی {shop?.name ? shop.name : 'ویژه'}</span>
            </span>
            <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <p className="text-xs sm:text-sm font-black text-white line-clamp-1 drop-shadow-sm">
              {resolvedBanner.title}
            </p>
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-0.5 shrink-0">
              <span>مشاهده</span>
              <ArrowLeft className="w-3 h-3 transform group-hover:-translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default Universal Smart Banner (Promoting BiSaf registration, Map & PWA)
  return (
    <div 
      id="bisaf-universal-promo-banner"
      onClick={() => {
        if (onBannerClick) {
          onBannerClick();
        } else {
          window.location.href = '/login';
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') window.location.href = '/login'; }}
      className={`relative overflow-hidden rounded-2xl cursor-pointer p-3 sm:p-4 bg-gradient-to-l from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md border border-emerald-400/30 hover:shadow-lg transition-all duration-300 transform active:scale-[0.99] group ${className}`}
    >
      <div className="flex items-center justify-between relative z-10 gap-2">
        <div className="space-y-0.5 max-w-[85%]">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
              سامانه بی‌صف
            </span>
            <span className="text-[11px] font-extrabold text-emerald-100">
              مدیریت نوبت‌دهی هوشمند
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-black text-white truncate">
            عضویت در سامانه و مشاهده مراکز بر روی نقشه
          </h4>
          <p className="text-[10px] sm:text-[11px] text-emerald-100/90 line-clamp-1">
            با نصب برنامه بی‌صف، به راحتی وضعیت صف‌ها و نانوایی‌های اطراف را بررسی کنید.
          </p>
        </div>

        <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:bg-white group-hover:text-emerald-700 transition-all shrink-0">
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Subtle Background Pattern */}
      <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
    </div>
  );
};
