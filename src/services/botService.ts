import { UserRole } from '../types';
import { StorageService } from './storage';

export interface BotCommandResponse {
  text: string;
  buttons?: string[];
}

export interface ActiveBotProviderInfo {
  id: 'telegram' | 'bale' | 'eitaa' | 'rubika' | 'whatsapp';
  name: string;
  color: string;
  username?: string;
  hasToken: boolean;
  isEnabledInAdmin: boolean;
}

export class BotService {
  /**
   * Returns active bot providers that are connected (have tokens) OR have their activation toggle enabled in Admin Panel API settings
   */
  static getActiveBotProviders(): ActiveBotProviderInfo[] {
    try {
      const featureFlags = StorageService.getFeatureFlags();
      const botFeature = featureFlags.find(f => f.key === 'bot_integration');
      if (botFeature && !botFeature.enabled) {
        return [];
      }

      const integrations = StorageService.getSystemIntegrations();

      const providers: Array<{
        id: 'telegram' | 'bale' | 'eitaa' | 'rubika' | 'whatsapp';
        name: string;
        color: string;
        token: string;
        username: string;
        enabled: boolean;
      }> = [
        {
          id: 'bale',
          name: 'بله',
          color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          token: integrations.bale_token || '',
          username: integrations.bale_username || 'BiSafBot',
          enabled: Boolean(integrations.bale_enabled)
        },
        {
          id: 'telegram',
          name: 'تلگرام',
          color: 'bg-sky-500 hover:bg-sky-600 text-white',
          token: integrations.telegram_token || '',
          username: integrations.telegram_username || 'BiSafBot',
          enabled: Boolean(integrations.telegram_enabled)
        },
        {
          id: 'eitaa',
          name: 'ایتا',
          color: 'bg-amber-600 hover:bg-amber-700 text-white',
          token: integrations.eitaa_token || '',
          username: integrations.eitaa_username || 'BiSafBot',
          enabled: Boolean(integrations.eitaa_enabled)
        },
        {
          id: 'rubika',
          name: 'روبیکا',
          color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          token: integrations.rubika_token || '',
          username: integrations.rubika_username || 'BiSafBot',
          enabled: Boolean(integrations.rubika_enabled)
        },
        {
          id: 'whatsapp',
          name: 'واتساپ',
          color: 'bg-green-600 hover:bg-green-700 text-white',
          token: integrations.whatsapp_token || '',
          username: integrations.whatsapp_instance || '',
          enabled: Boolean(integrations.whatsapp_enabled)
        }
      ];

      return providers
        .filter(p => p.enabled || (p.token && p.token.trim().length > 0))
        .map(p => ({
          id: p.id,
          name: p.name,
          color: p.color,
          username: p.username,
          hasToken: Boolean(p.token && p.token.trim().length > 0),
          isEnabledInAdmin: p.enabled
        }));
    } catch {
      return [];
    }
  }
  /**
   * Handle Customer Bot Start (Section 44)
   */
  static getCustomerBotStart(): BotCommandResponse {
    return {
      text: `🎉 سلام عزیز! به بی‌صف خوش اومدی.
من نوبت‌گیری هوشمند تو هستم که معطل صف نمونی.

⚡ با من:
• بدون ایستادن تو صف نوبت می‌گیری
• نزدیک نوبتت که شد، خودم خبرت می‌کنم
• از فروشگاه‌ها یا کسب‌وکارهایی که قبلاً با این اپلیکیشن (QR کدها) نوبت گرفتی، به‌راحتی و بدون رفتن دوباره به اونجا نوبت می‌گیری
• فروشگاه‌های دور و برت که از این برنامه استفاده می‌کنن رو می‌بینی و می‌تونی بدون اینکه بری اونجا، نوبت بگیری

📋 یکی از گزینه‌های زیر رو انتخاب کن:`,
      buttons: [
        '📍 فروشگاه‌های اطراف',
        '🕒 فروشگاه‌هایی که قبلاً ازشون نوبت گرفتی',
        '📋 وضعیت نوبت من',
        '❓ راهنما',
        '🎁 دعوت از دوستان'
      ]
    };
  }

  /**
   * Handle Shopkeeper Bot Start (Section 45)
   */
  static getShopkeeperBotStart(allowActions: boolean = true): BotCommandResponse {
    const buttons = [
      '📊 گزارش امروز',
      '📋 وضعیت صف'
    ];
    if (allowActions) {
      buttons.push('➕ افزودن مشتری حضوری', '✅ تحویل سفارش بعدی');
    }
    buttons.push('❓ راهنما');

    return {
      text: `👋 سلام متصدی عزیز!
به بات مدیریتی بی‌صف خوش اومدی.
من اینجام تا مدیریت صف رو برات راحت‌تر کنم.

⚡ با من می‌تونی:
• وضعیت صف فروشگاهت رو یک‌جا ببینی
• مشتریای حضوری رو سریع وارد صف کنی (اگه فعال باشه)
• با یه دکمه، مشتری بعدی رو تحویل بدی (اگه فعال باشه)
• آخر شب یه گزارش کامل از کارت بگیری

📋 یکی از گزینه‌های زیر رو انتخاب کن:`,
      buttons
    };
  }

  /**
   * Handle Marketer Bot Start (Section 46)
   */
  static getMarketerBotStart(): BotCommandResponse {
    return {
      text: `📈 سلام بازاریاب عزیز! به بی‌صف خوش اومدی.
⚡ با من می‌تونی:
• تعداد نوبت‌های امروز فروشگاه‌های زیرمجموعه‌ات رو ببینی
• وضعیت تسویه حساب خودت رو چک کنی
• فروشگاه جدید ثبت کنی
📋 یکی از گزینه‌های زیر رو انتخاب کن:`,
      buttons: [
        '📊 نوبت‌های امروز فروشگاه‌ها',
        '💰 وضعیت تسویه',
        '➕ ثبت فروشگاه جدید',
        '❓ راهنما'
      ]
    };
  }

  /**
   * Handle Admin Bot Start (Section 47)
   */
  static getAdminBotStart(): BotCommandResponse {
    return {
      text: `👑 سلام مدیر عزیز! به بی‌صف خوش اومدی.
⚡ با من می‌تونی:
• خلاصه امروز کل سیستم رو ببینی
• بازاریاب‌های جدید رو تأیید یا رد کنی
• ماژول‌های مختلف رو فعال یا غیرفعال کنی
📋 یکی از گزینه‌های زیر رو انتخاب کن:`,
      buttons: [
        '📊 خلاصه امروز',
        '👤 کاربران در انتظار تأیید',
        '⚙️ تنظیمات سریع',
        '❓ راهنما'
      ]
    };
  }

  /**
   * Get Threshold notification text (Section 44)
   */
  static getThresholdNotificationText(shopName: string, threshold: number): string {
    return `🔔 سلام عزیز! بر اساس تنظیم خودت، الان ${threshold} نفر دیگه جلوی تو توی ${shopName} هستند. کم‌کم آماده باش که نوبتت نزدیکه.`;
  }

  /**
   * Get bot deep link URL for a specific provider reading configured system integrations
   */
  static getBotDeepLink(provider: 'telegram' | 'bale' | 'eitaa' | 'rubika' | 'whatsapp', botUsernameOverride?: string, shopSlug?: string): string {
    const integrations = StorageService.getSystemIntegrations();
    const slug = shopSlug || 'bisaf_app';
    
    switch (provider) {
      case 'telegram': {
        const u = botUsernameOverride || integrations.telegram_username || 'BiSafBot';
        return `https://t.me/${u}?start=${slug}`;
      }
      case 'bale': {
        const u = botUsernameOverride || integrations.bale_username || 'BiSafBot';
        return `https://ble.ir/${u}?start=${slug}`;
      }
      case 'eitaa': {
        const u = botUsernameOverride || integrations.eitaa_username || 'BiSafBot';
        return `https://eitaa.com/${u}?start=${slug}`;
      }
      case 'rubika': {
        const u = botUsernameOverride || integrations.rubika_username || 'BiSafBot';
        return `https://rubika.ir/${u}?start=${slug}`;
      }
      case 'whatsapp': {
        const num = integrations.sms_sender_line || '989121111111';
        return `https://wa.me/${num}?text=start_${slug}`;
      }
      default:
        return '#';
    }
  }

  /**
   * Test live connection to Telegram/Bale Bot API
   */
  static async testBotConnection(provider: 'telegram' | 'bale', token: string): Promise<{ success: boolean; botInfo?: any; error?: string }> {
    if (!token || !token.trim()) {
      return { success: false, error: 'توکن ربات وارد نشده است.' };
    }
    const baseUrl = provider === 'telegram' 
      ? `https://api.telegram.org/bot${token.trim()}`
      : `https://tapi.bale.ai/bot${token.trim()}`;
    
    try {
      const res = await fetch(`${baseUrl}/getMe`);
      const data = await res.json();
      if (data.ok) {
        return { success: true, botInfo: data.result };
      } else {
        return { success: false, error: data.description || 'احراز هویت توکن ناموفق بود.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'خطا در برقراری ارتباط با سرور پیام‌رسان.' };
    }
  }

  /**
   * Check current Webhook info from Telegram/Bale API
   */
  static async getBotWebhookInfo(provider: 'telegram' | 'bale', token: string): Promise<{ success: boolean; url?: string; pendingCount?: number; error?: string }> {
    if (!token || !token.trim()) {
      return { success: false, error: 'توکن ربات وارد نشده است.' };
    }
    const baseUrl = provider === 'telegram' 
      ? `https://api.telegram.org/bot${token.trim()}`
      : `https://tapi.bale.ai/bot${token.trim()}`;
    
    try {
      const res = await fetch(`${baseUrl}/getWebhookInfo`);
      const data = await res.json();
      if (data.ok && data.result) {
        return {
          success: true,
          url: data.result.url || '',
          pendingCount: data.result.pending_update_count || 0
        };
      } else {
        return { success: false, error: data.description || 'دریافت وضعیت وب‌هوک ناموفق بود.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'خطا در دریافت وضعیت وب‌هوک.' };
    }
  }

  /**
   * Register Webhook URL on Telegram/Bale server
   */
  static async setBotWebhook(provider: 'telegram' | 'bale', token: string, webhookUrl: string): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!token || !token.trim()) {
      return { success: false, error: 'توکن ربات وارد نشده است.' };
    }
    if (!webhookUrl || !webhookUrl.trim() || !webhookUrl.startsWith('https://')) {
      return { success: false, error: 'آدرس وب‌هوک باید یک URL معتبر با پروتکل HTTPS باشد.' };
    }
    const baseUrl = provider === 'telegram' 
      ? `https://api.telegram.org/bot${token.trim()}`
      : `https://tapi.bale.ai/bot${token.trim()}`;
    
    try {
      const targetUrl = `${baseUrl}/setWebhook?url=${encodeURIComponent(webhookUrl.trim())}`;
      const res = await fetch(targetUrl, { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        return { success: true, message: data.description || 'وب‌هوک با موفقیت روی سرور پیام‌رسان ثبت شد.' };
      } else {
        return { success: false, error: data.description || 'ثبت وب‌هوک در API پیام‌رسان شکست خورد.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'خطا در ثبت وب‌هوک.' };
    }
  }
}
