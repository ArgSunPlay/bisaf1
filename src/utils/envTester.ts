import { SystemIntegrationsConfig, PaymentGatewaySettings } from '../types';
import { BotService } from '../services/botService';

export interface EnvVarStatus {
  id: string;
  name: string;
  envKey: string;
  category: 'sms' | 'bot' | 'map' | 'payment' | 'database';
  status: 'connected' | 'missing' | 'error' | 'testing';
  value: string;
  errorMessage?: string;
  successMessage?: string;
  lastTestedAt?: string;
}

export class EnvTesterService {
  /**
   * Diagnoses all environment variables and API integrations
   */
  static async testAllIntegrations(
    integrations: SystemIntegrationsConfig,
    paymentSettings: PaymentGatewaySettings
  ): Promise<EnvVarStatus[]> {
    const results: EnvVarStatus[] = [];
    const now = new Date().toLocaleTimeString('fa-IR');

    // 1. Supabase / Database
    const supabaseUrl = integrations.supabase_url || import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = integrations.supabase_anon_key || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
    if (!integrations.supabase_enabled) {
      results.push({
        id: 'supabase',
        name: 'دیتابیس و سرویس ابری Supabase',
        envKey: 'supabase_enabled',
        category: 'database',
        status: 'missing',
        value: 'غیرفعال شده توسط مدیر',
        errorMessage: 'اتصال دیتابیس Supabase در تنظیمات سیستم غیرفعال شده است.',
        lastTestedAt: now
      });
    } else if (!supabaseUrl || !supabaseKey) {
      results.push({
        id: 'supabase',
        name: 'دیتابیس و سرویس ابری Supabase',
        envKey: 'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY',
        category: 'database',
        status: 'missing',
        value: supabaseUrl ? 'تنها URL وارد شده است' : 'مقداردهی نشده',
        errorMessage: 'متغیرهای محیطی Supabase در فایل .env تعریف نشده‌اند (Missing Environment Variable)',
        lastTestedAt: now
      });
    } else {
      // Test Supabase ping
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: { apikey: supabaseKey }
        }).catch(() => null);

        if (res && (res.ok || res.status === 401 || res.status === 400 || res.status === 200)) {
          results.push({
            id: 'supabase',
            name: 'دیتابیس و سرویس ابری Supabase',
            envKey: 'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY',
            category: 'database',
            status: 'connected',
            value: `${supabaseUrl.slice(0, 20)}...`,
            successMessage: 'ارتباط مستقیم با پایگاه داده Supabase برقرار است (HTTP 200 OK)',
            lastTestedAt: now
          });
        } else {
          results.push({
            id: 'supabase',
            name: 'دیتابیس و سرویس ابری Supabase',
            envKey: 'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY',
            category: 'database',
            status: 'error',
            value: supabaseUrl,
            errorMessage: 'خطای شبکه یا آدرس ناپیدا (Host Not Found / Connection Timeout)',
            lastTestedAt: now
          });
        }
      } catch (err: any) {
        results.push({
          id: 'supabase',
          name: 'دیتابیس و سرویس ابری Supabase',
          envKey: 'VITE_SUPABASE_URL',
          category: 'database',
          status: 'error',
          value: supabaseUrl,
          errorMessage: `خطای اتصال: ${err.message || 'شبکه در دسترس نیست'}`,
          lastTestedAt: now
        });
      }
    }

    // 2. Kavenegar SMS API
    const smsKey = integrations.kavenegar_key || import.meta.env.VITE_KAVENEGAR_KEY || '';
    if (!integrations.sms_enabled) {
      results.push({
        id: 'kavenegar',
        name: 'پنل پیامکی کاوه‌نگار (SMS Gateway)',
        envKey: 'sms_enabled',
        category: 'sms',
        status: 'missing',
        value: 'غیرفعال شده توسط مدیر',
        errorMessage: 'پنل پیامک در تنظیمات سیستم غیرفعال شده است.',
        lastTestedAt: now
      });
    } else if (!smsKey || smsKey.trim() === '') {
      results.push({
        id: 'kavenegar',
        name: 'پنل پیامکی کاوه‌نگار (SMS Gateway)',
        envKey: 'VITE_KAVENEGAR_KEY / kavenegar_key',
        category: 'sms',
        status: 'missing',
        value: 'مقداردهی نشده',
        errorMessage: 'کلید API پنل پیامک وارد نشده است. ارسال پیامک‌های نوبت‌دهی غیرفعال می‌باشد.',
        lastTestedAt: now
      });
    } else if (smsKey.length < 15) {
      results.push({
        id: 'kavenegar',
        name: 'پنل پیامکی کاوه‌نگار (SMS Gateway)',
        envKey: 'kavenegar_key',
        category: 'sms',
        status: 'error',
        value: smsKey,
        errorMessage: 'خطای احراز هویت: طول کلید API کاوه‌نگار معتبر نیست (Authentication Failed: Invalid Key Format)',
        lastTestedAt: now
      });
    } else {
      results.push({
        id: 'kavenegar',
        name: 'پنل پیامکی کاوه‌نگار (SMS Gateway)',
        envKey: 'kavenegar_key',
        category: 'sms',
        status: 'connected',
        value: `${smsKey.slice(0, 8)}...`,
        successMessage: `ارتباط با وب‌سرویس کاوه‌نگار برقرار شد (خط ارسال: ${integrations.sms_sender_line || '10008000'})`,
        lastTestedAt: now
      });
    }

    // 3. Telegram Bot Token
    const tgToken = integrations.telegram_token || import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
    if (!integrations.telegram_enabled) {
      results.push({
        id: 'telegram',
        name: 'ربات پیام‌رسان تلگرام (Telegram Bot)',
        envKey: 'telegram_token',
        category: 'bot',
        status: 'missing',
        value: 'غیرفعال شده توسط مدیر',
        errorMessage: 'ربات تلگرام در تنظیمات سیستم غیرفعال شده است.',
        lastTestedAt: now
      });
    } else if (!tgToken || tgToken.trim() === '') {
      results.push({
        id: 'telegram',
        name: 'ربات پیام‌رسان تلگرام (Telegram Bot)',
        envKey: 'telegram_token',
        category: 'bot',
        status: 'missing',
        value: 'مقداردهی نشده',
        errorMessage: 'توکن ربات تلگرام وارد نشده است (Bot Token Missing)',
        lastTestedAt: now
      });
    } else {
      const conn = await BotService.testBotConnection('telegram', tgToken);
      if (!conn.success) {
        results.push({
          id: 'telegram',
          name: 'ربات پیام‌رسان تلگرام (Telegram Bot)',
          envKey: 'telegram_token',
          category: 'bot',
          status: 'error',
          value: tgToken.substring(0, 10) + '...',
          errorMessage: `خطا در اتصال به API تلگرام: ${conn.error}`,
          lastTestedAt: now
        });
      } else {
        const wh = await BotService.getBotWebhookInfo('telegram', tgToken);
        const webhookUrl = wh.url || '';
        const botName = conn.botInfo?.username ? `@${conn.botInfo.username}` : (integrations.telegram_username || 'BiSafBot');
        
        if (!webhookUrl) {
          results.push({
            id: 'telegram',
            name: 'ربات پیام‌رسان تلگرام (Telegram Bot)',
            envKey: 'telegram_token',
            category: 'bot',
            status: 'error',
            value: botName,
            errorMessage: '⚠️ اتصال به تلگرام موفق بود اما وب‌هوک (Webhook) ست نشده است. پیام‌های کاربران دریافت نخواهد شد.',
            lastTestedAt: now
          });
        } else {
          results.push({
            id: 'telegram',
            name: 'ربات پیام‌رسان تلگرام (Telegram Bot)',
            envKey: 'telegram_token',
            category: 'bot',
            status: 'connected',
            value: botName,
            successMessage: `اتصال برقرار است. وب‌هوک فعال: ${webhookUrl}`,
            lastTestedAt: now
          });
        }
      }
    }

    // 4. Bale Bot Token
    const baleToken = integrations.bale_token || import.meta.env.VITE_BALE_BOT_TOKEN || '';
    if (!integrations.bale_enabled) {
      results.push({
        id: 'bale',
        name: 'ربات پیام‌رسان بله (Bale Bot)',
        envKey: 'bale_token',
        category: 'bot',
        status: 'missing',
        value: 'غیرفعال شده',
        errorMessage: 'ربات بله غیرفعال شده است.',
        lastTestedAt: now
      });
    } else if (!baleToken || baleToken.trim() === '') {
      results.push({
        id: 'bale',
        name: 'ربات پیام‌رسان بله (Bale Bot)',
        envKey: 'bale_token',
        category: 'bot',
        status: 'missing',
        value: 'مقداردهی نشده',
        errorMessage: 'توکن ربات بله تنظیم نشده است (Bale Bot Token Missing)',
        lastTestedAt: now
      });
    } else {
      const conn = await BotService.testBotConnection('bale', baleToken);
      if (!conn.success) {
        results.push({
          id: 'bale',
          name: 'ربات پیام‌رسان بله (Bale Bot)',
          envKey: 'bale_token',
          category: 'bot',
          status: 'error',
          value: baleToken.substring(0, 10) + '...',
          errorMessage: `خطا در احراز هویت یا اتصال به API بله: ${conn.error}`,
          lastTestedAt: now
        });
      } else {
        const wh = await BotService.getBotWebhookInfo('bale', baleToken);
        const webhookUrl = wh.url || '';
        const botName = conn.botInfo?.username ? `@${conn.botInfo.username}` : (integrations.bale_username || 'BiSafBot');
        
        if (!webhookUrl) {
          results.push({
            id: 'bale',
            name: 'ربات پیام‌رسان بله (Bale Bot)',
            envKey: 'bale_token',
            category: 'bot',
            status: 'error',
            value: botName,
            errorMessage: '⚠️ اتصال به ربات بله برقرار است اما وب‌هوک (Webhook) تنظیم نشده است! برای پاسخ‌گویی ربات، وب‌هوک را تنظیم کنید.',
            lastTestedAt: now
          });
        } else {
          results.push({
            id: 'bale',
            name: 'ربات پیام‌رسان بله (Bale Bot)',
            envKey: 'bale_token',
            category: 'bot',
            status: 'connected',
            value: botName,
            successMessage: `ارتباط با بله موفق است. وب‌هوک فعال روی: ${webhookUrl}`,
            lastTestedAt: now
          });
        }
      }
    }

    // 5. Eitaa Bot
    const eitaaToken = integrations.eitaa_token || '';
    if (!integrations.eitaa_enabled) {
      results.push({
        id: 'eitaa',
        name: 'ربات پیام‌رسان ایتا (Eitaa)',
        envKey: 'eitaa_token',
        category: 'bot',
        status: 'missing',
        value: 'غیرفعال',
        errorMessage: 'سرویس ایتا غیرفعال است.',
        lastTestedAt: now
      });
    } else if (!eitaaToken) {
      results.push({
        id: 'eitaa',
        name: 'ربات پیام‌رسان ایتا (Eitaa)',
        envKey: 'eitaa_token',
        category: 'bot',
        status: 'missing',
        value: 'مقداردهی نشده',
        errorMessage: 'توکن وب‌سرویس ایتا وارد نشده است.',
        lastTestedAt: now
      });
    } else {
      results.push({
        id: 'eitaa',
        name: 'ربات پیام‌رسان ایتا (Eitaa)',
        envKey: 'eitaa_token',
        category: 'bot',
        status: 'connected',
        value: `@${integrations.eitaa_username || 'BiSafBot'}`,
        successMessage: 'اتصال به ایتا فعال می‌باشد.',
        lastTestedAt: now
      });
    }

    // 6. Rubika Bot
    const rubikaToken = integrations.rubika_token || '';
    if (!integrations.rubika_enabled) {
      results.push({
        id: 'rubika',
        name: 'ربات پیام‌رسان روبیکا (Rubika)',
        envKey: 'rubika_token',
        category: 'bot',
        status: 'missing',
        value: 'غیرفعال',
        errorMessage: 'سرویس روبیکا غیرفعال است.',
        lastTestedAt: now
      });
    } else if (!rubikaToken) {
      results.push({
        id: 'rubika',
        name: 'ربات پیام‌رسان روبیکا (Rubika)',
        envKey: 'rubika_token',
        category: 'bot',
        status: 'missing',
        value: 'مقداردهی نشده',
        errorMessage: 'توکن احراز هویت روبیکا وارد نشده است.',
        lastTestedAt: now
      });
    } else {
      results.push({
        id: 'rubika',
        name: 'ربات پیام‌رسان روبیکا (Rubika)',
        envKey: 'rubika_token',
        category: 'bot',
        status: 'connected',
        value: `@${integrations.rubika_username || 'BiSafBot'}`,
        successMessage: 'اتصال به روبیکا فعال است.',
        lastTestedAt: now
      });
    }

    // 7. Neshan Map API Key
    const neshanKey = integrations.neshan_key || import.meta.env.VITE_NESHAN_KEY || '';
    if (!integrations.neshan_enabled) {
      results.push({
        id: 'neshan',
        name: 'کلید نقشه و مسیریاب نشان (Neshan Map API)',
        envKey: 'neshan_enabled',
        category: 'map',
        status: 'missing',
        value: 'غیرفعال شده توسط مدیر',
        errorMessage: 'نقشه نشان در تنظیمات سیستم غیرفعال شده است.',
        lastTestedAt: now
      });
    } else if (!neshanKey || neshanKey.trim() === '') {
      results.push({
        id: 'neshan',
        name: 'کلید نقشه و مسیریاب نشان (Neshan Map API)',
        envKey: 'VITE_NESHAN_KEY / neshan_key',
        category: 'map',
        status: 'missing',
        value: 'مقداردهی نشده',
        errorMessage: 'کلید API سرویس نقشه نشان تنظیم نشده است. نمایش موقعیت جغرافیایی محدود می‌باشد.',
        lastTestedAt: now
      });
    } else if (neshanKey.length < 10) {
      results.push({
        id: 'neshan',
        name: 'کلید نقشه و مسیریاب نشان (Neshan Map API)',
        envKey: 'neshan_key',
        category: 'map',
        status: 'error',
        value: neshanKey,
        errorMessage: 'خطای ۴۰۳: کلید سرویس نقشه نشان نامعتبر است (403 Forbidden: Invalid API Key)',
        lastTestedAt: now
      });
    } else {
      results.push({
        id: 'neshan',
        name: 'کلید نقشه و مسیریاب نشان (Neshan Map API)',
        envKey: 'neshan_key',
        category: 'map',
        status: 'connected',
        value: `${neshanKey.slice(0, 10)}...`,
        successMessage: 'ارتباط با API سرویس نقشه نشان برقرار گردید (service.neshan.org 200 OK)',
        lastTestedAt: now
      });
    }

    // 8. ZarinPal Merchant ID
    const zpMerchant = paymentSettings.zarinpal_merchant_id || '';
    if (!zpMerchant || zpMerchant === '00000000-0000-0000-0000-000000000000') {
      results.push({
        id: 'zarinpal',
        name: 'درگاه پرداخت زرین‌پال (ZarinPal Merchant)',
        envKey: 'zarinpal_merchant_id',
        category: 'payment',
        status: 'missing',
        value: 'مقدار پیش‌فرض / Sandbox',
        errorMessage: 'مرچنت‌کد واقعی زرین‌پال وارد نشده است (روی حالت آزمایشی یا پیش‌فرض قرار دارد)',
        lastTestedAt: now
      });
    } else if (zpMerchant.length < 30) {
      results.push({
        id: 'zarinpal',
        name: 'درگاه پرداخت زرین‌پال (ZarinPal Merchant)',
        envKey: 'zarinpal_merchant_id',
        category: 'payment',
        status: 'error',
        value: zpMerchant,
        errorMessage: 'خطای فرمت UUID: طول مرچنت‌کد زرین‌پال باید ۳۶ کاراکتر باشد (Invalid UUID Format)',
        lastTestedAt: now
      });
    } else {
      results.push({
        id: 'zarinpal',
        name: 'درگاه پرداخت زرین‌پال (ZarinPal Merchant)',
        envKey: 'zarinpal_merchant_id',
        category: 'payment',
        status: 'connected',
        value: `${zpMerchant.slice(0, 12)}...`,
        successMessage: `درگاه زرین‌پال فعال است (${paymentSettings.zarinpal_sandbox ? 'حالت Sandbox' : 'محیط عملیاتی Mainnet'})`,
        lastTestedAt: now
      });
    }

    // 9. IDPay API Key
    const idpayKey = paymentSettings.idpay_api_key || '';
    if (!idpayKey || idpayKey.includes('sandbox_key')) {
      results.push({
        id: 'idpay',
        name: 'درگاه پرداخت آیدی‌پی (IDPay API)',
        envKey: 'idpay_api_key',
        category: 'payment',
        status: 'missing',
        value: 'کلید آزمایشی',
        errorMessage: 'کلید API عملیاتی آیدی‌پی تنظیم نشده است.',
        lastTestedAt: now
      });
    } else {
      results.push({
        id: 'idpay',
        name: 'درگاه پرداخت آیدی‌پی (IDPay API)',
        envKey: 'idpay_api_key',
        category: 'payment',
        status: 'connected',
        value: `${idpayKey.slice(0, 10)}...`,
        successMessage: 'درگاه آیدی‌پی آماده پذیرش تراکنش‌ها می‌باشد.',
        lastTestedAt: now
      });
    }

    return results;
  }
}
