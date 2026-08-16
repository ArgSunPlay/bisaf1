/**
 * Centralized Persian error translator for BiSaf (بی‌صف)
 * Translates technical errors into clear, friendly Persian messages.
 */

export function translateError(error: unknown): string {
  if (!error) return 'خطای ناشناخته رخ داده است.';

  const message = typeof error === 'string' ? error : (error as Error)?.message || '';
  const lowerMsg = message.toLowerCase();

  // Authentication & Authorization
  if (lowerMsg.includes('invalid login credentials') || lowerMsg.includes('invalid_credentials')) {
    return 'شماره موبایل، نام کاربری یا رمز عبور اشتباه است.';
  }
  if (lowerMsg.includes('user not found')) {
    return 'کاربری با این مشخصات یافت نشد.';
  }
  if (lowerMsg.includes('phone number already registered') || lowerMsg.includes('already exists') || lowerMsg.includes('duplicate key')) {
    return 'این شماره موبایل یا نام کاربری قبلاً ثبت شده است.';
  }
  if (lowerMsg.includes('unauthorized') || lowerMsg.includes('jwt expired') || lowerMsg.includes('access denied')) {
    return 'جلسه کاری شما به پایان رسیده است. لطفاً دوباره وارد شوید.';
  }
  if (lowerMsg.includes('permission denied') || lowerMsg.includes('row-level security')) {
    return 'شما دسترسی لازم برای انجام این عملیات را ندارید.';
  }

  // Network & Server Connectivity
  if (lowerMsg.includes('network error') || lowerMsg.includes('failed to fetch') || lowerMsg.includes('networkerror')) {
    return 'ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید.';
  }
  if (lowerMsg.includes('timeout') || lowerMsg.includes('timed out')) {
    return 'زمان پاسخ‌گویی سرور به پایان رسید. دوباره تلاش کنید.';
  }

  // Geolocation Errors
  if (lowerMsg.includes('user denied geolocation') || lowerMsg.includes('permission denied') && lowerMsg.includes('location')) {
    return 'دسترسی به موقعیت مکانی توسط کاربر مسدود شده است.';
  }
  if (lowerMsg.includes('position unavailable') || lowerMsg.includes('location unavailable')) {
    return 'موقعیت مکانی شما قابل دریافت نیست.';
  }

  // Notification Permissions
  if (lowerMsg.includes('notification permission denied') || lowerMsg.includes('notifications blocked')) {
    return 'دسترسی ارسال اعلان در مرورگر شما غیرفعال است.';
  }

  // Queue & Business Logic
  if (lowerMsg.includes('queue is closed') || lowerMsg.includes('shop inactive')) {
    return 'صف این مرکز در حال حاضر غیرفعال است.';
  }
  if (lowerMsg.includes('ticket limit reached') || lowerMsg.includes('daily limit')) {
    return 'ظرفیت نوبت‌دهی امروز این مرکز تکمیل شده است.';
  }
  if (lowerMsg.includes('already has active ticket')) {
    return 'شما یک نوبت فعال در این صف دارید.';
  }

  // Rate Limiting
  if (lowerMsg.includes('rate limit') || lowerMsg.includes('too many requests')) {
    return 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً چند لحظه صبر کنید.';
  }

  // Payment Errors
  if (lowerMsg.includes('payment disabled') || lowerMsg.includes('payment_disabled')) {
    return 'به‌زودی (برای فعال‌سازی با مدیر فنی صحبت کنید)';
  }
  if (lowerMsg.includes('payment failed') || lowerMsg.includes('transaction failed')) {
    return 'پرداخت ناموفق بود یا توسط کاربر لغو شد.';
  }

  // Bot API & External Webhooks
  if (lowerMsg.includes('bot token invalid') || lowerMsg.includes('webhook error')) {
    return 'خطا در ارتباط با ربات پیام‌رسان. تنظیمات ربات را بررسی کنید.';
  }

  // Default fallback in friendly Persian
  return message && message.length < 150 ? `خطا: ${message}` : 'خطایی در انجام عملیات رخ داده است. لطفاً دوباره تلاش کنید.';
}
