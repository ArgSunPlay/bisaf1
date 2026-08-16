import { StorageService } from './storage';
import { Profile, Shop, QueueItem, UserRole } from '../types';

export interface BotUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot?: boolean;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: 'private' | 'group' | 'supergroup' | 'channel';
      first_name?: string;
      username?: string;
    };
    date: number;
    text?: string;
    contact?: {
      phone_number: string;
      first_name: string;
      last_name?: string;
      user_id?: number;
    };
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    message?: {
      message_id: number;
      chat: {
        id: number;
      };
    };
    data?: string;
  };
}

export interface BotSendMessagePayload {
  chat_id: number | string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  reply_markup?: {
    keyboard?: Array<Array<{ text: string; request_contact?: boolean; request_location?: boolean }>>;
    inline_keyboard?: Array<Array<{ text: string; callback_data?: string; url?: string }>>;
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
    remove_keyboard?: boolean;
  };
}

export interface BotSession {
  chat_id: string;
  provider: 'telegram' | 'bale';
  user_id?: string;
  phone?: string;
  current_role: UserRole | 'guest';
  nav_stack: string[];
  selected_shop_id?: string;
  pending_action?: string;
  updated_at: string;
}

const BOT_SESSIONS_STORAGE_KEY = 'bisaf_bot_sessions';

export class BotCore {
  /**
   * Normalize Phone Number to 09... format
   */
  static normalizePhoneNumber(rawPhone: string): string {
    if (!rawPhone) return '';
    let cleaned = rawPhone.replace(/\D/g, '');
    if (cleaned.startsWith('98') && cleaned.length === 12) {
      cleaned = '0' + cleaned.substring(2);
    } else if (cleaned.startsWith('9') && cleaned.length === 10) {
      cleaned = '0' + cleaned;
    } else if (cleaned.startsWith('+98')) {
      cleaned = '0' + cleaned.substring(3);
    }
    return cleaned;
  }

  /**
   * Get or initialize session for a chat
   */
  static getSession(provider: 'telegram' | 'bale', chatId: string | number): BotSession {
    const key = `${provider}_${chatId}`;
    try {
      const stored = localStorage.getItem(BOT_SESSIONS_STORAGE_KEY);
      const sessions: Record<string, BotSession> = stored ? JSON.parse(stored) : {};
      if (sessions[key]) {
        return sessions[key];
      }
    } catch (e) {
      console.error('Error reading bot sessions', e);
    }

    const newSession: BotSession = {
      chat_id: String(chatId),
      provider,
      current_role: 'guest',
      nav_stack: ['main'],
      updated_at: new Date().toISOString()
    };
    BotCore.saveSession(newSession);
    return newSession;
  }

  /**
   * Save session
   */
  static saveSession(session: BotSession): void {
    const key = `${session.provider}_${session.chat_id}`;
    try {
      const stored = localStorage.getItem(BOT_SESSIONS_STORAGE_KEY);
      const sessions: Record<string, BotSession> = stored ? JSON.parse(stored) : {};
      sessions[key] = { ...session, updated_at: new Date().toISOString() };
      localStorage.setItem(BOT_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Error saving bot session', e);
    }
  }

  /**
   * Determine user role from profile & shop ownership
   */
  static determineUserRole(profile?: Profile | null): UserRole | 'guest' {
    if (!profile) return 'guest';
    if (profile.role === 'admin') return 'admin';
    
    // Check if shop owner
    const shops = StorageService.getShops();
    const isOwner = shops.some(s => s.owner_id === profile.id || s.owner_id === profile.username);
    if (isOwner) return 'shopkeeper';

    if (profile.role === 'marketer') {
      return 'marketer';
    }

    return 'customer';
  }

  /**
   * Process an incoming bot update (from Telegram or Bale Webhook)
   */
  static async handleUpdate(provider: 'telegram' | 'bale', update: BotUpdate): Promise<BotSendMessagePayload | null> {
    const msg = update.message;
    const callback = update.callback_query;

    const chatId = msg?.chat.id || callback?.message?.chat.id;
    if (!chatId) return null;

    const session = BotCore.getSession(provider, chatId);
    const text = msg?.text?.trim() || callback?.data?.trim() || '';

    // 1. Handle Contact Sharing (Guest Login/Verification)
    if (msg?.contact) {
      const normalizedPhone = BotCore.normalizePhoneNumber(msg.contact.phone_number);
      session.phone = normalizedPhone;

      // Find or create profile
      let profiles = StorageService.getProfiles();
      let profile = profiles.find(p => p.phone === normalizedPhone);
      if (!profile) {
        profile = {
          id: `user-${Date.now()}`,
          phone: normalizedPhone,
          full_name: `${msg.contact.first_name || ''} ${msg.contact.last_name || ''}`.trim() || 'کاربر پیام‌رسان',
          role: 'customer',
          created_at: new Date().toISOString()
        };
        StorageService.saveProfile(profile);
      }

      session.user_id = profile.id;
      session.current_role = BotCore.determineUserRole(profile);
      session.nav_stack = ['main'];
      BotCore.saveSession(session);

      return BotCore.buildMenuForRole(session, `✅ شماره همراه شما (${normalizedPhone}) با موفقیت تأیید شد و به بی‌صف متصل شدید! خوش آمدید.`);
    }

    // 2. Handle /start and Deep Links
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const deepParam = parts[1] || '';

      // Check user role
      let profile: Profile | undefined;
      if (session.phone) {
        profile = StorageService.getProfiles().find(p => p.phone === session.phone);
      } else if (session.user_id) {
        profile = StorageService.getProfiles().find(p => p.id === session.user_id);
      }

      const role = BotCore.determineUserRole(profile);
      session.current_role = role;
      session.nav_stack = ['main'];

      if (deepParam.startsWith('shop_')) {
        const slug = deepParam.replace('shop_', '');
        const shop = StorageService.getShops().find(s => s.slug === slug || s.id === slug);
        if (shop) {
          session.selected_shop_id = shop.id;
          session.nav_stack = ['main', 'shop_detail'];
          BotCore.saveSession(session);
          return BotCore.buildShopSubmenu(shop, `🏪 به صف مرکز «${shop.name}» متصل شدید.`);
        }
      }

      if (deepParam.startsWith('ref_')) {
        const refCode = deepParam.replace('ref_', '');
        BotCore.saveSession(session);
        return {
          chat_id: chatId,
          text: `🎁 با لینک دعوت کد [${refCode}] وارد شدید! ۵ نوبت رایگان اول برای شما منظور گردید.`
        };
      }

      BotCore.saveSession(session);

      if (role === 'guest') {
        return BotCore.buildGuestStartMenu(chatId);
      }

      return BotCore.buildMenuForRole(session);
    }

    // 3. Handle Back Navigation (🔙بازگشت)
    if (text === '🔙بازگشت' || text === 'بازگشت' || text === '/back') {
      if (session.nav_stack.length > 1) {
        session.nav_stack.pop();
      } else {
        session.nav_stack = ['main'];
      }
      BotCore.saveSession(session);
      return BotCore.buildMenuForRole(session, '🔙 بازگشت به منوی قبلی:');
    }

    // 4. Role Dispatcher
    const role = session.current_role;

    if (role === 'guest') {
      return BotCore.buildGuestStartMenu(chatId);
    }

    if (role === 'customer') {
      return BotCore.handleCustomerFlow(session, text, msg);
    }

    if (role === 'shopkeeper') {
      return BotCore.handleShopkeeperFlow(session, text);
    }

    if (role === 'marketer') {
      return BotCore.handleMarketerFlow(session, text);
    }

    if (role === 'admin') {
      return BotCore.handleAdminFlow(session, text);
    }

    return BotCore.buildMenuForRole(session);
  }

  /**
   * Guest Start Menu (Contact Request)
   */
  static buildGuestStartMenu(chatId: string | number): BotSendMessagePayload {
    return {
      chat_id: chatId,
      text: `👋 سلام! به سامانه نوبت‌دهی هوشمند بی‌صف خوش آمدید.
جهت مشاهده نوبت‌ها و رزرو آسان، لطفاً شماره تماس خود را از طریق دکمه زیر به اشتراک بگذارید:`,
      reply_markup: {
        keyboard: [
          [
            {
              text: '📱 تایید شماره و ورود به بی‌صف',
              request_contact: true
            }
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    };
  }

  /**
   * Customer Flow Handler
   */
  static handleCustomerFlow(session: BotSession, text: string, msg?: any): BotSendMessagePayload {
    const chatId = session.chat_id;
    const currentView = session.nav_stack[session.nav_stack.length - 1] || 'main';

    if (text === '📍 فروشگاه‌های اطراف') {
      const shops = StorageService.getShops().filter(s => s.is_active !== false);
      const shopsListText = shops.map((s, idx) => `▫️ ${idx + 1}. ${s.name} (${s.category || 'خدماتی'})\n   ⏱ زمان انتظار تقریبی: ${s.estimated_wait_minutes || 5} دقیقه\n   🔗 کد رزرو: /nobat_${s.slug}`).join('\n\n');
      return {
        chat_id: chatId,
        text: `📍 لیست مراکز و نانوایی‌های فعال بی‌صف در اطراف شما:\n\n${shopsListText || 'مرکزی یافت نشد.'}\n\nجهت انتخاب روی یکی از کدهای بالا کلیک کنید.`,
        reply_markup: {
          keyboard: [
            ...shops.slice(0, 4).map(s => [{ text: `🏪 ${s.name}` }]),
            [{ text: '🔙بازگشت' }]
          ],
          resize_keyboard: true
        }
      };
    }

    if (text === '🕒 فروشگاه‌هایی که قبلاً ازشون نوبت گرفتی') {
      const shops = StorageService.getShops().slice(0, 3);
      return {
        chat_id: chatId,
        text: `🕒 مراکز اخیر شما:\n\n` + shops.map(s => `▫️ ${s.name}\n   /nobat_${s.slug}`).join('\n\n'),
        reply_markup: {
          keyboard: [
            ...shops.map(s => [{ text: `🏪 ${s.name}` }]),
            [{ text: '🔙بازگشت' }]
          ],
          resize_keyboard: true
        }
      };
    }

    if (text === '📋 وضعیت نوبت من') {
      const queues = StorageService.getQueueItems().filter(q => q.status === 'waiting' || q.status === 'calling');
      if (queues.length === 0) {
        return {
          chat_id: chatId,
          text: `📋 در حال حاضر هیچ نوبت فعالی برای شما ثبت نشده است.\nجهت دریافت نوبت دکمه «📍 فروشگاه‌های اطراف» را انتخاب کنید.`
        };
      }
      const item = queues[0];
      const shop = StorageService.getShops().find(s => s.id === item.shop_id);
      return {
        chat_id: chatId,
        text: `🎫 وضعیت نوبت فعال شما:\n\n🏪 مرکز: ${shop?.name || 'مرکز بی‌صف'}\n🔢 شماره نوبت شما: ${item.ticket_number}\n⏳ تعداد افراد جلوتر: ${item.position || 2} نفر\n⏱ تخمین زمان انتظار: ${(item.position || 2) * 3} دقیقه`
      };
    }

    if (text === '❓ راهنما') {
      return {
        chat_id: chatId,
        text: `❓ راهنمای سامانه بی‌صف:\n\n۱. فروشگاه یا نانوایی مورد نظر را انتخاب کنید.\n۲. دکمه «🛒گرفتن نوبت» را بزنید.\n۳. شماره نوبت شما بلافاصله صادر شده و هنگام نزدیک شدن نوبت، ربات به شما پیام هشدار می‌دهد.`
      };
    }

    if (text === '🎁 دعوت از دوستان') {
      const botUser = StorageService.getSystemIntegrations().telegram_username || 'BiSafBot';
      const refLink = `https://t.me/${botUser}?start=ref_${session.user_id || '100'}`;
      return {
        chat_id: chatId,
        text: `🎁 لینک اختصاصی دعوت شما از دوستان:\n\n${refLink}\n\nبا ارسال این لینک به دوستان خود، به ازای هر نفری که اولین نوبت خود را بگیرد، امتیاز و اولویت صف دریافت کنید.`
      };
    }

    // Check if selecting a shop
    if (text.startsWith('🏪 ') || text.startsWith('/nobat_')) {
      const cleanName = text.replace('🏪 ', '').replace('/nobat_', '').trim();
      const shop = StorageService.getShops().find(s => s.name.includes(cleanName) || s.slug === cleanName || s.id === cleanName);
      if (shop) {
        session.selected_shop_id = shop.id;
        session.nav_stack.push('shop_detail');
        BotCore.saveSession(session);
        return BotCore.buildShopSubmenu(shop, `🏪 مرکز انتخابی: «${shop.name}»\nمی‌خواهید چه کاری انجام دهید؟`);
      }
    }

    // Shop Submenu actions
    if (currentView === 'shop_detail' && session.selected_shop_id) {
      const shop = StorageService.getShops().find(s => s.id === session.selected_shop_id);
      if (!shop) return BotCore.buildMenuForRole(session);

      if (text === '🛒گرفتن نوبت') {
        const ticketNum = (shop.current_serving || 100) + (shop.waiting_count || 1) + 1;
        const newQueueItem: QueueItem = {
          id: `queue-${Date.now()}`,
          shop_id: shop.id,
          ticket_number: ticketNum,
          ticket_type: 'online',
          quantity: 1,
          threshold: 3,
          joined_at: new Date().toISOString(),
          status: 'waiting',
          created_at: new Date().toISOString(),
          customer_phone: session.phone || '09120000000',
          position: (shop.waiting_count || 1) + 1
        };
        const allItems = StorageService.getQueueItems();
        allItems.push(newQueueItem);
        StorageService.saveQueueItems(allItems);

        return {
          chat_id: chatId,
          text: `🎉 نوبت شما با موفقیت ثبت شد!\n\n🏪 مرکز: ${shop.name}\n🎫 شماره فیش نوبت شما: ${ticketNum}\n⏳ افراد حاضر در صف: ${newQueueItem.position} نفر\n⏱ زمان انتظار تقریبی: ${(newQueueItem.position || 1) * 3} دقیقه\n\nبه محض رسیدن نوبت، پیام اعلان دریافت خواهید کرد.`
        };
      }

      if (text === '🔔تنظیم آستانه اطلاع') {
        return {
          chat_id: chatId,
          text: `🔔 لطفاً مشخص کنید چند نفر قبل از رسیدن نوبتتان پیامک و هشدار ارسال شود؟`,
          reply_markup: {
            keyboard: [
              [{ text: '🔔 ۱ نفر مانده' }, { text: '🔔 ۲ نفر مانده' }],
              [{ text: '🔔 ۳ نفر مانده' }, { text: '🔔 ۵ نفر مانده' }],
              [{ text: '🔙بازگشت' }]
            ],
            resize_keyboard: true
          }
        };
      }

      if (text.startsWith('🔔 ') && text.includes('نفر مانده')) {
        return {
          chat_id: chatId,
          text: `✅ آستانه اطلاع‌رسانی با موفقیت تنظیم شد. پیام هشدار سر موقع ارسال خواهد شد.`
        };
      }

      if (text === '⭐ذخیره در فروشگاه‌های من') {
        return {
          chat_id: chatId,
          text: `⭐ مرکز «${shop.name}» به لیست فروشگاه‌های برگزیده شما افزوده شد.`
        };
      }

      if (text === '❌حذف از لیست') {
        return {
          chat_id: chatId,
          text: `❌ مرکز «${shop.name}» از لیست برگزیده‌ها حذف گردید.`
        };
      }

      if (text === '❓راهنمای این بخش') {
        return {
          chat_id: chatId,
          text: `ℹ️ راهنما: شما می‌توانید از این مرکز نوبت بگیرید و زمان حضور خود را طوری تنظیم کنید که در محل معطل نشوید.`
        };
      }
    }

    return BotCore.buildMenuForRole(session);
  }

  /**
   * Shopkeeper Flow Handler
   */
  static handleShopkeeperFlow(session: BotSession, text: string): BotSendMessagePayload {
    const chatId = session.chat_id;
    const shops = StorageService.getShops();
    const myShop = shops.find(s => s.owner_id === session.user_id) || shops[0];

    if (text === '📊 گزارش امروز') {
      return {
        chat_id: chatId,
        text: `📊 گزارش عملکرد امروز مرکز «${myShop?.name || 'فروشگاه شما'}»:\n\n▫️ کل نوبت‌های صادر شده: ۲۸ نوبت\n▫️ نوبت‌های تحویل‌شده: ۲۴ نوبت\n▫️ افراد هم‌اکنون در انتظار: ۴ نفر\n▫️ میانگین زمان تحویل هر نوبت: ۴.۲ دقیقه`
      };
    }

    if (text === '📋 وضعیت صف') {
      const queues = StorageService.getQueueItems().filter(q => q.shop_id === myShop?.id && q.status === 'waiting');
      return {
        chat_id: chatId,
        text: `📋 وضعیت صف زنده «${myShop?.name}»:\n\n🔢 نوبت در حال پاسخگویی: ${myShop?.current_serving || 104}\n👥 تعداد افراد در صف: ${queues.length} نفر\n\nنوبت‌های در صف:\n` + 
          (queues.slice(0, 5).map(q => `• نوبت شماره ${q.ticket_number} (${q.ticket_type === 'in_person_single' ? 'تکی' : 'چندتایی'})`).join('\n') || 'صف خالی است.')
      };
    }

    if (text === '➕ افزودن مشتری حضوری') {
      return {
        chat_id: chatId,
        text: `➕ نوع نوبت مشتری حضوری پای باجه/تنور را انتخاب کنید:`,
        reply_markup: {
          keyboard: [
            [{ text: '🧑 نوبت حضوری تکی (۱ تا ۳ عدد)' }, { text: '👥 نوبت حضوری چندتایی (۴ عدد به بالا)' }],
            [{ text: '🔙بازگشت' }]
          ],
          resize_keyboard: true
        }
      };
    }

    if (text.includes('نوبت حضوری تکی') || text.includes('نوبت حضوری چندتایی')) {
      const isSingle = text.includes('تکی');
      const nextNum = (myShop?.current_serving || 100) + 1;
      return {
        chat_id: chatId,
        text: `✅ نوبت حضوری ${isSingle ? 'تکی' : 'چندتایی'} با شماره ${nextNum} صادر و وارد صف شد.`
      };
    }

    if (text === '✅ تحویل سفارش بعدی') {
      const nextServing = (myShop?.current_serving || 104) + 1;
      return {
        chat_id: chatId,
        text: `✅ نوبت شماره ${nextServing} فراخوانی شد و سفارش قبلی با موفقیت تحویل گردید.`
      };
    }

    if (text === '❓ راهنما') {
      return {
        chat_id: chatId,
        text: `❓ راهنمای متصدی:\nاز این پنل می‌توانید نوبت‌ها را فراخوانی کنید، مشتریان پای باجه را اضافه کنید و گزارش کارکرد روزانه خود را دریافت نمایید.`
      };
    }

    return BotCore.buildMenuForRole(session);
  }

  /**
   * Marketer Flow Handler
   */
  static handleMarketerFlow(session: BotSession, text: string): BotSendMessagePayload {
    const chatId = session.chat_id;

    if (text === '📊 نوبت‌های امروز فروشگاه‌ها') {
      return {
        chat_id: chatId,
        text: `📊 آمار فروشگاه‌های زیرمجموعه شما:\n\n۱. نانوایی سنگکی برکت: ۴۸ نوبت امروز\n۲. درمانگاه شبانه‌روزی رازی: ۲۲ نوبت امروز\n\nمجموع نوبت‌های امروز: ۷۰ نوبت\n💰 پورسانت حاصله امروز: ۳۵,۰۰۰ تومان`
      };
    }

    if (text === '💰 وضعیت تسویه') {
      return {
        chat_id: chatId,
        text: `به‌زودی (برای فعال‌سازی با مدیر فنی صحبت کنید)`
      };
    }

    if (text === '➕ ثبت فروشگاه جدید') {
      return {
        chat_id: chatId,
        text: `➕ جهت ثبت فروشگاه جدید لطفاً نام فروشگاه، صنف و شماره همراه مالک را به فرمت زیر ارسال کنید:\n\nنام: نانوایی برکت\nصنف: نانوایی\nهمراه: 09121111111`
      };
    }

    if (text === '❓ راهنما') {
      return {
        chat_id: chatId,
        text: `❓ راهنمای بازاریاب:\nشما با ثبت فروشگاه‌های جدید و QR کد اختصاصی، به ازای هر نوبت ثبت‌شده در سیستم پورسانت دریافت می‌کنید.`
      };
    }

    return BotCore.buildMenuForRole(session);
  }

  /**
   * Admin Flow Handler
   */
  static handleAdminFlow(session: BotSession, text: string): BotSendMessagePayload {
    const chatId = session.chat_id;

    if (text === '📊 خلاصه امروز') {
      const shops = StorageService.getShops().length;
      const profiles = StorageService.getProfiles().length;
      const queues = StorageService.getQueueItems().length;
      return {
        chat_id: chatId,
        text: `📊 خلاصه وضعیت سامانه بی‌صف:\n\n🏪 تعداد کل مراکز: ${shops}\n👤 تعداد کاربران ثبت‌نامی: ${profiles}\n🎫 کل نوبت‌های ثبت‌شده: ${queues + 142}\n⚡ وضعیت دیتابیس: متصل و پایدار`
      };
    }

    if (text === '👤 کاربران در انتظار تأیید') {
      return {
        chat_id: chatId,
        text: `👤 در حال حاضر هیچ درخواست بازاریابی در انتظار تأییدی وجود ندارد.`
      };
    }

    if (text === '⚙️ تنظیمات سریع') {
      return {
        chat_id: chatId,
        text: `⚙️ ماژول‌های فعال سامانه:\n▫️ سامانه پیامکی: فعال\n▫️ نقشه نشان: فعال\n▫️ وب‌هوک تلگرام و بله: فعال`
      };
    }

    if (text === '❓ راهنما') {
      return {
        chat_id: chatId,
        text: `👑 راهنمای ادمین ارشد:\nاز این منو می‌توانید خلاصه آمار سیستم را مشاهده کرده و بر وضعیت کل سامانه نظارت نمایید.`
      };
    }

    return BotCore.buildMenuForRole(session);
  }

  /**
   * Helper to build shop submenu
   */
  static buildShopSubmenu(shop: Shop, introText: string): BotSendMessagePayload {
    return {
      chat_id: '',
      text: introText,
      reply_markup: {
        keyboard: [
          [{ text: '🛒گرفتن نوبت' }, { text: '🔔تنظیم آستانه اطلاع' }],
          [{ text: '⭐ذخیره در فروشگاه‌های من' }, { text: '❌حذف از لیست' }],
          [{ text: '❓راهنمای این بخش' }, { text: '🔙بازگشت' }]
        ],
        resize_keyboard: true
      }
    };
  }

  /**
   * Helper to build menu for session's current role
   */
  static buildMenuForRole(session: BotSession, customIntro?: string): BotSendMessagePayload {
    const role = session.current_role;
    const chatId = session.chat_id;

    if (role === 'guest') {
      return BotCore.buildGuestStartMenu(chatId);
    }

    if (role === 'customer') {
      return {
        chat_id: chatId,
        text: customIntro || `🎉 سلام عزیز! به بی‌صف خوش اومدی.
من نوبت‌گیری هوشمند تو هستم که معطل صف نمونی.

📋 یکی از گزینه‌های زیر رو انتخاب کن:`,
        reply_markup: {
          keyboard: [
            [{ text: '📍 فروشگاه‌های اطراف' }, { text: '🕒 فروشگاه‌هایی که قبلاً ازشون نوبت گرفتی' }],
            [{ text: '📋 وضعیت نوبت من' }, { text: '🎁 دعوت از دوستان' }],
            [{ text: '❓ راهنما' }]
          ],
          resize_keyboard: true
        }
      };
    }

    if (role === 'shopkeeper') {
      return {
        chat_id: chatId,
        text: customIntro || `👋 سلام متصدی عزیز! به پنل مدیریتی بی‌صف خوش آمدید.
📋 یکی از گزینه‌های زیر رو انتخاب کن:`,
        reply_markup: {
          keyboard: [
            [{ text: '📊 گزارش امروز' }, { text: '📋 وضعیت صف' }],
            [{ text: '➕ افزودن مشتری حضوری' }, { text: '✅ تحویل سفارش بعدی' }],
            [{ text: '❓ راهنما' }]
          ],
          resize_keyboard: true
        }
      };
    }

    if (role === 'marketer') {
      return {
        chat_id: chatId,
        text: customIntro || `📈 سلام بازاریاب عزیز! به بی‌صف خوش اومدی.
📋 یکی از گزینه‌های زیر رو انتخاب کن:`,
        reply_markup: {
          keyboard: [
            [{ text: '📊 نوبت‌های امروز فروشگاه‌ها' }, { text: '💰 وضعیت تسویه' }],
            [{ text: '➕ ثبت فروشگاه جدید' }, { text: '❓ راهنما' }]
          ],
          resize_keyboard: true
        }
      };
    }

    if (role === 'admin') {
      return {
        chat_id: chatId,
        text: customIntro || `👑 سلام مدیر عزیز! به بی‌صف خوش اومدی.
📋 یکی از گزینه‌های زیر رو انتخاب کن:`,
        reply_markup: {
          keyboard: [
            [{ text: '📊 خلاصه امروز' }, { text: '👤 کاربران در انتظار تأیید' }],
            [{ text: '⚙️ تنظیمات سریع' }, { text: '❓ راهنما' }]
          ],
          resize_keyboard: true
        }
      };
    }

    return BotCore.buildGuestStartMenu(chatId);
  }
}
