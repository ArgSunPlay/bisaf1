# BiSaf (بی‌صف) — سامانه هوشمند مدیریت صف و نوبت‌دهی

![BiSaf PWA](https://img.shields.io/badge/PWA-Mobile--First-emerald)
![License](https://img.shields.io/badge/License-MIT-blue)

**بی‌صف (BiSaf)** یک پلتفرم جامع، موبایل‌محور (Mobile-First) و هوشمند برای مدیریت صف و صادر کردن نوبت دیجیتال در مراکز خدماتی و فروشگاهی ایران (از جمله نانوایی‌ها، درمانگاه‌ها، داروخانه‌ها، رستوران‌ها، فروشگاه‌ها و دفاتر اداری) است.

---

## 🚀 ویژگی‌های کلیدی (Key Features)

1. **طراحی موبایل‌محور و پرتره (Mobile-First & RTL):**
   - بهینه‌سازی کامل برای استفاده با یک دست در تمام گوشی‌های هوشمند (از ۳۲۰px تا صفحه‌نمایش‌های بزرگ).
   - پشتیبانی کامل از Safe Area اینست‌های iOS و اندروید (`env(safe-area-inset)`).
   - پشتیبانی از فونت وزیرمتن (Vazirmatn)، اعداد فارسی، تقویم جلالی و پوسته‌های تاریک/روشن (Dark/Light Mode).

2. **الگوریتم تناوبی صف‌دهی (Interleaving Algorithm):**
   - مدیریت هوشمند صف‌های ترکیبی تکی (in_person_single) و چندتایی (in_person_multi).
   - تحویل عادلانه نوبت‌ها جهت جلوگیری از تجمع و معطلی خریداران.

3. **تخمین دقیق زمان انتظار (Wait-Time Estimation):**
   - محاسبه میانگین بر اساس ۲۰ نوبت اخیر تحویل شده با اعمال ضریب تعداد.
   - نمایش خودکار عبارت «در حال جمع‌آوری داده» در صورت کمتر بودن داده‌ها از ۳ فیش.

4. **فرآیند تبدیل ثبت‌نام قراردادی ۳ مرحله‌ای (3-Step Contractual Registration Conversion):**
   - نمایش پیام‌های دقیق و مصوب فارسی پس از ثبت نوبت همراه با تولید خودکار رمز عبور امن ۶ رقمی و امکان تعریف نام کاربری دلخواه.

5. **نقشه تعاملی مراکز (Interactive Leaflet & Neshan Map):**
   - نمایش تمام مراکز خدمت‌رسانی روی نقشه OpenStreetMap/Leaflet با امکان سوئیچ خودکار به API نشان (Neshan).

6. **یکپارچه‌سازی ربات‌های پیام‌رسان ایرانی و بین‌المللی (Bot Core Architecture):**
   - پشتیبانی کامل از ربات تلگرام (Telegram)، بله (Bale)، ایتا (Eitaa)، روبیکا (Rubika) و واتساپ (WhatsApp).
   - دکمه‌های مستقیم نوبت‌گیری و تنظیم آستانه هشدار (Threshold 1-10).

7. **ارسال پیامک جایگزین (SMS Fallback):**
   - ارسال پیامک خودکار در صورت عدم مشاهده اعلان ربات پس از ۵ دقیقه با متون استاندارد پشتیبانی کاوه‌نگار و ملی‌پیاک.

8. **زیرساخت کامل پرداخت آنلاین (Payment Infrastructure):**
   - معماری ایزوله درگاه‌های پرداخت (زرین‌پال / آی‌دی‌پی) با حالت پیش‌فرض غیرفعال ("به‌زودی (برای فعال‌سازی با مدیر فنی صحبت کنید)").

9. **پنل مدیریت ارشد (Admin Panel):**
   - پنل ۱۰۰٪ واکنش‌گرا و سازگار با موبایل جهت مدیریت کاربران، مراکز، پرچم‌های ویژگی (Feature Flags)، کلیدهای ربات‌ها و لاگ‌های امنیتی (Audit Logs).
   - نام کاربری مدیر ارشد پیش‌فرض: `Alahedeh`

10. **قابلیت PWA و چاپ فیش حرارتی / PDF:**
    - کارکرد آفلاین شل برنامه (Offline Shell) و قابلیت نصب روی صفحه اصلی (Add to Home Screen).
    - صدور فیش با تولید خودکار QR کد و خروجی PDF بر اساس کتابخانه‌های `QRCode` و `jsPDF`.

---

## 🛠️ ساختار پروژه‌ (Directory Structure)

```text
├── public/
│   ├── manifest.webmanifest      # PWA Manifest
│   └── sw.js                     # PWA Service Worker
├── src/
│   ├── components/               # UI components (Navbar, BottomNav, RegistrationModal, AudioPlayer)
│   ├── pages/                    # Main views (PublicShop, Dashboard, ShopkeeperPanel, Marketer, Admin, Print, Login)
│   ├── services/                 # Business logic, Supabase client, Queue engine, Auth, Bots, Payments
│   ├── utils/                    # Jalali date utilities, error translators
│   ├── types.ts                  # TypeScript data interfaces
│   ├── App.tsx                   # Main app & routing
│   ├── index.css                 # Tailwind CSS & custom styles
│   └── main.tsx                  # React entry point
├── supabase/
│   └── migrations/               # PostgreSQL schema & RLS policies
├── .env.example                  # Environment variables template
├── metadata.json                 # AI Studio & applet metadata
├── package.json
└── vite.config.ts
```

---

## ⚙️ راه اندازی و اجرا (Setup & Local Development)

### ۱. نصب وابستگی‌ها:
```bash
npm install
```

### ۲. تنظیم متغیرهای محیطی:
یک فایل `.env` بر اساس `.env.example` بسازید:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
NESHAN_API_KEY=your_neshan_key
```

### ۳. اجرا در حالت توسعه:
```bash
npm run dev
```

### ۴. بیلد نهایی و تست کامپایل:
```bash
npm run build
```

---

## 🔒 امنیت و احراز هویت (Security & Auth)
- امکان ورود همزمان با **شماره موبایل + رمز عبور** یا **نام کاربری + رمز عبور** برای همان حساب کاربری.
- عدم افشای توکن‌ها و کلیدهای محرمانه (Service Role Key، کلیدهای ربات و پیامک) در فرانت‌اند.
- اجرای سیاست‌های دسترسی سطح سطر (RLS) در دیتابیس PostgreSQL.

---

## 📄 مجوز (License)
پروژه بی‌صف تحت مجوز MIT منتشر شده است.
