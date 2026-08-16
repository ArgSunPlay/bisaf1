export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = process.env.BOT_TELEGRAM_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('BOT_TELEGRAM_TOKEN is not configured');
    return res.status(200).json({ ok: true, note: 'Token not configured' });
  }

  try {
    const update = req.body;
    if (!update) {
      return res.status(200).json({ ok: true });
    }

    const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id;
    const text = update.message?.text?.trim() || update.callback_query?.data?.trim() || '';

    // Fast 200 OK immediately for telegram webhook safety
    let replyText = 'سلام! به سامانه نوبت‌دهی هوشمند بی‌صف خوش آمدید.';
    let replyMarkup: any = undefined;

    if (update.message?.contact) {
      const phone = update.message.contact.phone_number;
      replyText = `✅ شماره شما (${phone}) با موفقیت در بی‌صف ثبت شد. به منوی اصلی خوش آمدید:`;
      replyMarkup = {
        keyboard: [
          [{ text: '📍 فروشگاه‌های اطراف' }, { text: '🕒 فروشگاه‌هایی که قبلاً ازشون نوبت گرفتی' }],
          [{ text: '📋 وضعیت نوبت من' }, { text: '🎁 دعوت از دوستان' }],
          [{ text: '❓ راهنما' }]
        ],
        resize_keyboard: true
      };
    } else if (text.startsWith('/start')) {
      replyText = `👋 سلام! به سامانه نوبت‌دهی هوشمند بی‌صف خوش آمدید.
جهت مشاهده نوبت‌ها و رزرو آسان، لطفاً شماره تماس خود را از طریق دکمه زیر به اشتراک بگذارید:`;
      replyMarkup = {
        keyboard: [
          [{ text: '📱 تایید شماره و ورود به بی‌صف', request_contact: true }]
        ],
        resize_keyboard: true
      };
    } else if (text === '📍 فروشگاه‌های اطراف') {
      replyText = `📍 لیست مراکز فعال بی‌صف در اطراف شما:
▫️ ۱. نانوایی سنگکی برکت (سنگک سنتی)
▫️ ۲. درمانگاه شبانه‌روزی رازی
▫️ ۳. مطب دندانپزشکی شفا

جهت دریافت نوبت روی لینک یا دکمه زیر کلیک نمایید.`;
    } else if (text === '📋 وضعیت نوبت من') {
      replyText = `📋 در حال حاضر هیچ نوبت فعالی برای شما ثبت نشده است.`;
    } else if (text === '❓ راهنما') {
      replyText = `❓ راهنمای سامانه بی‌صف:
۱. نانوایی یا مرکز مورد نظر را انتخاب نمایید.
۲. دکمه «گرفتن نوبت» را بزنید.
۳. فیش نوبت آنلاین دریافت و در زمان مقرر به محل مراجعه نمایید.`;
    }

    if (chatId) {
      // Dispatch async call to Telegram sendMessage API
      const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
      await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
          reply_markup: replyMarkup
        })
      }).catch(err => console.error('Telegram sendMessage error:', err));
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return res.status(200).json({ ok: true, error: err.message });
  }
}
