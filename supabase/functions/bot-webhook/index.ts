import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache for dynamic texts
let textCache: Record<string, string> = {};
let cacheLastUpdated = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

async function getDynamicText(supabase: any, key: string, fallback: string): Promise<string> {
  const now = Date.now();
  if (now - cacheLastUpdated > CACHE_TTL) {
    const { data } = await supabase.from('bot_dynamic_texts').select('key, text');
    if (data) {
      textCache = {};
      data.forEach((item: any) => {
        textCache[item.key] = item.text;
      });
      cacheLastUpdated = now;
    }
  }
  return textCache[key] || fallback;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const provider = parts[parts.length - 1]; // e.g., 'telegram' or 'bale'

    if (provider !== 'telegram' && provider !== 'bale') {
      return new Response('Invalid provider', { status: 400 });
    }

    const payload = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize BotCore
    const core = new BotCore(supabaseClient, provider);
    await core.handleUpdate(payload);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

class BotCore {
  private supabase: any;
  private provider: 'telegram' | 'bale';
  private adapter: BotAdapter;

  constructor(supabase: any, provider: 'telegram' | 'bale') {
    this.supabase = supabase;
    this.provider = provider;
    
    const token = provider === 'telegram' 
      ? Deno.env.get('BOT_TELEGRAM_TOKEN') 
      : Deno.env.get('BOT_BALE_TOKEN');
      
    this.adapter = new BotAdapter(provider, token || '');
  }

  async handleUpdate(update: any) {
    if (!update.message) return; // We only handle messages for now

    const message = update.message;
    const chatId = message.chat.id.toString();
    const text = message.text || '';
    const contact = message.contact;

    // 1. Check user mapping
    const { data: mapping } = await this.supabase
      .from('user_bot_mappings')
      .select('user_id')
      .eq('provider', this.provider)
      .eq('chat_id', chatId)
      .single();

    if (!mapping && !contact) {
      // 3. Guest User
      const fallbackWelcome = '👋 سلام عزیز! به بی‌صف خوش اومدی. 🚀 برای اینکه بتونی بدون معطلی نوبت بگیری و وضعیت صف رو زنده ببینی، فقط کافیه روی دکمه زیر کلیک کنی تا شمارت تایید بشه. (رایگان و زیر ۵ ثانیه) 👇';
      const welcomeText = await getDynamicText(this.supabase, 'guest_welcome', fallbackWelcome);
      
      await this.adapter.sendMessage(chatId, welcomeText, {
        reply_markup: {
          keyboard: [[{ text: '📱 تایید شماره و ورود به بی‌صف', request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      return;
    }

    if (contact) {
      // 4. Register/Login Flow
      const phone = contact.phone_number.startsWith('+') 
        ? contact.phone_number.substring(1) 
        : contact.phone_number;

      // Find or create user
      let { data: profile } = await this.supabase
        .from('profiles')
        .select('id, role')
        .eq('phone', phone)
        .single();

      if (!profile) {
        // Create new user
        const { data: newProfile, error } = await this.supabase
          .from('profiles')
          .insert({ phone, full_name: contact.first_name, role: 'customer' })
          .select('id, role')
          .single();
          
        if (error) throw error;
        profile = newProfile;
      }

      // Create mapping
      await this.supabase.from('user_bot_mappings').insert({
        provider: this.provider,
        chat_id: chatId,
        user_id: profile.id
      });

      await this.showMainMenu(chatId, profile.role, profile.id);
      return;
    }

    // 2. Logged-in User
    if (mapping) {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('id, role')
        .eq('id', mapping.user_id)
        .single();

      if (profile) {
        await this.handleUserCommand(chatId, text, profile.role, profile.id);
      }
    }
  }

  async handleUserCommand(chatId: string, text: string, role: string, userId: string) {
    if (text.startsWith('/start') || text === 'منوی اصلی') {
      await this.showMainMenu(chatId, role, userId);
      return;
    }

    // Additional logic for specific buttons can go here
    if (text === '📍 پیدا کردن فروشگاه‌های اطراف من' && role === 'customer') {
      await this.adapter.sendMessage(chatId, 'در حال جستجوی فروشگاه‌های اطراف شما...');
      // Fetch shops from DB and show inline keyboard
      return;
    }

    // Default fallback
    await this.showMainMenu(chatId, role, userId);
  }

  async showMainMenu(chatId: string, role: string, userId: string) {
    let text = '';
    let keyboard: any[] = [];

    switch (role) {
      case 'customer': {
        const defaultText = `🎉 سلام عزیز! به بی‌صف خوش اومدی.
من نوبت‌گیری هوشمند تو هستم که معطل صف نمونی.

⚡ با من:
• بدون ایستادن تو صف نوبت می‌گیری
• نزدیک نوبتت که شد، خودم خبرت می‌کنم
• از فروشگاه‌ها یا کسب‌وکارهایی که قبلاً با این اپلیکیشن (QR کدها) نوبت گرفتی، به‌راحتی و بدون رفتن دوباره به اونجا نوبت می‌گیری
• فروشگاه‌های دور و برت که از این برنامه استفاده می‌کنن رو می‌بینی و می‌تونی بدون اینکه بری اونجا، نوبت بگیری

📋 یکی از گزینه‌های زیر رو انتخاب کن:`;
        text = await getDynamicText(this.supabase, 'customer_welcome', defaultText);
        keyboard = [
          [{ text: '📍 فروشگاه‌های اطراف' }],
          [{ text: '🕒 فروشگاه‌هایی که قبلاً ازشون نوبت گرفتی' }],
          [{ text: '📋 وضعیت نوبت من' }, { text: '❓ راهنما' }],
          [{ text: '🎁 دعوت از دوستان' }]
        ];
        break;
      }
      case 'shopkeeper': {
        const defaultText = `👋 سلام متصدی عزیز!
به بات مدیریتی بی‌صف خوش اومدی.
من اینجام تا مدیریت صف فروشگاهت رو برات راحت‌تر کنه.

⚡ با من می‌تونی:
• وضعیت صف فروشگاهت رو یکجا ببینی
• مشتریای حضوری رو سریع وارد صف کنی (اگه فعال باشه)
• با یه دکمه، مشتری بعدی رو تحویل بدی (اگه فعال باشه)
• آخر شب یه گزارش کامل از کارت بگیری

📋 یکی از گزینه‌های زیر رو انتخاب کن:`;
        text = await getDynamicText(this.supabase, 'shopkeeper_welcome', defaultText);
        keyboard = [
          [{ text: '📊 گزارش امروز' }, { text: '📋 وضعیت صف' }],
          [{ text: '➕ افزودن مشتری حضوری' }, { text: '✅ تحویل سفارش بعدی' }],
          [{ text: '❓ راهنما' }]
        ];
        break;
      }
      case 'marketer': {
        const defaultText = `📈 سلام بازاریاب عزیز! به بی‌صف خوش اومدی.
⚡ با من می‌تونی:
• تعداد نوبت‌های امروز فروشگاه‌های زیرمجموعه‌ات رو ببینی
• وضعیت تسویه حساب خودت رو چک کنی
• فروشگاه جدید ثبت کنی
📋 یکی از گزینه‌های زیر رو انتخاب کن:`;
        text = await getDynamicText(this.supabase, 'marketer_welcome', defaultText);
        keyboard = [
          [{ text: '📊 نوبت‌های امروز فروشگاه‌ها' }],
          [{ text: '💰 وضعیت تسویه' }, { text: '➕ ثبت فروشگاه جدید' }],
          [{ text: '❓ راهنما' }]
        ];
        break;
      }
      case 'admin': {
        const defaultText = `👑 سلام مدیر عزیز! به بی‌صف خوش اومدی.
⚡ با من می‌تونی:
• خلاصه امروز کل سیستم رو ببینی
• بازاریاب‌های جدید رو تأیید یا رد کنی
• ماژول‌های مختلف رو فعال یا غیرفعال کنی
📋 یکی از گزینه‌های زیر رو انتخاب کن:`;
        text = await getDynamicText(this.supabase, 'admin_welcome', defaultText);
        keyboard = [
          [{ text: '📊 خلاصه امروز' }, { text: '👤 کاربران در انتظار تأیید' }],
          [{ text: '⚙️ تنظیمات سریع' }, { text: '❓ راهنما' }]
        ];
        break;
      }
      default:
        text = 'نقش کاربری نامشخص است.';
    }

    await this.adapter.sendMessage(chatId, text, {
      reply_markup: {
        keyboard,
        resize_keyboard: true
      }
    });
  }
}

class BotAdapter {
  private baseUrl: string;

  constructor(provider: 'telegram' | 'bale', token: string) {
    if (provider === 'telegram') {
      this.baseUrl = `https://api.telegram.org/bot${token}`;
    } else {
      this.baseUrl = `https://tapi.bale.ai/bot${token}`;
    }
  }

  async sendMessage(chatId: string, text: string, options?: any) {
    const payload: any = {
      chat_id: chatId,
      text: text,
      ...options
    };

    const response = await fetch(`${this.baseUrl}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error(`Error sending message via ${this.baseUrl}:`, await response.text());
    }
    
    return response.json();
  }
}
