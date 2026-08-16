import { 
  Shop, QueueItem, Profile, FeatureFlag, CustomerFavorite, 
  BotProvider, Marketer, Referral, AuditLog, PrintTemplate,
  SystemIntegrationsConfig, PaymentGatewaySettings,
  ServiceCategory, ServiceSubcategory, LandingFooterConfig,
  BannerItem
} from '../types';
import { supabase } from './supabaseClient';

const KEYS = {
  CURRENT_USER: 'bisaf_current_user',
  PROFILES: 'bisaf_profiles',
  SHOPS: 'bisaf_shops',
  QUEUE_ITEMS: 'bisaf_queue_items',
  FEATURE_FLAGS: 'bisaf_feature_flags',
  FAVORITES: 'bisaf_favorites',
  BOT_PROVIDERS: 'bisaf_bot_providers',
  SYSTEM_INTEGRATIONS: 'bisaf_system_integrations',
  PAYMENT_SETTINGS: 'bisaf_payment_settings',
  MARKETERS: 'bisaf_marketers',
  REFERRALS: 'bisaf_referrals',
  AUDIT_LOGS: 'bisaf_audit_logs',
  PRINT_TEMPLATES: 'bisaf_print_templates',
  USER_SETTINGS: 'bisaf_user_settings',
  SERVICE_CATEGORIES: 'bisaf_service_categories',
  FOOTER_CONFIG: 'bisaf_footer_config',
  BANNERS: 'bisaf_banners',
  DYNAMIC_TEXTS: 'bisaf_dynamic_texts',
};

export const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 'banner-bisaf-vip',
    title: 'عضویت رایگان در باشگاه مشتریان بی‌صف و دریافت نوبت آسان',
    image_url: 'https://images.unsplash.com/photo-1556742049-0a67e5572263?w=1200&auto=format&fit=crop&q=80',
    target_url: '/login',
    is_active: true,
    created_at: new Date().toISOString(),
    description: 'بنر جامع معرفی مزایای عضویت در بی‌صف و اطلاع‌رسانی پیامکی'
  },
  {
    id: 'banner-bakery-special',
    title: 'سفارش آنلاین نان داغ برکت — بدون معطلی و با کنجد اعلا',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
    target_url: 'https://bisaf.ir/shop/barekat-sangak',
    is_active: true,
    created_at: new Date().toISOString(),
    description: 'بنر ویژه نانوایی‌های سنتی سنگک و بربری'
  },
  {
    id: 'banner-clinic-health',
    title: 'پذیرش هوشمند و نوبت‌دهی بیماران مطب و درمانگاه تخصصی',
    image_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format&fit=crop&q=80',
    target_url: 'https://bisaf.ir/shop/dr-rezaei',
    is_active: true,
    created_at: new Date().toISOString(),
    description: 'بنر اختصاصی درمانگاه‌ها و مطب‌های پزشکی'
  }
];

export const DEFAULT_FOOTER_CONFIG: LandingFooterConfig = {
  aboutBtnText: 'درباره بی‌صف',
  helpBtnText: 'راهنما',
  supportBtnText: 'تماس / پشتیبانی',
  loginBtnText: 'ورود',
  copyrightText: '© ۱۴۰۳ بی‌صف (BiSaf.ir) — سامانه کشوری نوبت‌دهی هوشمند',
  aboutTitle: 'درباره بی‌صف',
  aboutText: 'بی‌صف سامانه کشوری مدیریت صف و نوبت‌دهی هوشمند است که با هدف حذف صف‌های فیزیکی در نانوایی‌ها، درمانگاه‌ها، مطب‌ها و مراکز خدماتی ایران طراحی شده است.',
  helpTitle: 'راهنمای دریافت نوبت',
  helpStep1: 'با دوربین گوشی QR کد نصب‌شده در مرکز را اسکن کنید.',
  helpStep2: 'تعداد نوبت مورد نظر را مشخص و فیش دیجیتال را دریافت نمایید.',
  helpStep3: 'هنگام نزدیک شدن نوبت، پیامک و پیام در پیام‌رسان دریافت خواهید کرد.',
  supportTitle: 'تماس و پشتیبانی',
  supportDesc: 'پشتیبانی ۲۴ ساعته بی‌صف جهت پاسخگویی به سؤالات مشتریان و پذیرندگان:',
  supportPhone: '۰۲۱-۹۱۰۹۰۰۰۰',
  supportMessengers: 'پشتیبانی تلگرام و بله: @BiSaf_Support',
  ctaTitle: 'آماده دریافت نوبت هستید؟',
  ctaSubtitle: 'همین حالا شروع کن؛ رایگان و کمتر از یک دقیقه.',
  ctaButtonText: 'نوبت بگیر'
};

const DEFAULT_SYSTEM_INTEGRATIONS: SystemIntegrationsConfig = {
  supabase_url: import.meta.env.VITE_SUPABASE_URL || 'https://jnburxmyrhzjdpzyhqvy.supabase.co',
  supabase_anon_key: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuYnVyeG15cmh6amRwenlocXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NDQ3NDcsImV4cCI6MjEwMjIyMDc0N30.06anmyCEczHdYwxV2l4wthm_3o40ardtIanuPdeCPkE',
  supabase_enabled: true,
  telegram_token: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
  telegram_username: 'BiSafBot',
  telegram_enabled: false,
  bale_token: import.meta.env.VITE_BALE_BOT_TOKEN || '',
  bale_username: 'BiSafBot',
  bale_enabled: false,
  eitaa_token: import.meta.env.VITE_EITAA_BOT_TOKEN || '',
  eitaa_username: 'BiSafBot',
  eitaa_enabled: false,
  rubika_token: import.meta.env.VITE_RUBIKA_BOT_TOKEN || '',
  rubika_username: 'BiSafBot',
  rubika_enabled: false,
  whatsapp_token: '',
  whatsapp_instance: '',
  whatsapp_enabled: false,
  neshan_key: import.meta.env.VITE_NESHAN_KEY || '',
  neshan_enabled: false,
  kavenegar_key: import.meta.env.VITE_KAVENEGAR_KEY || '',
  melipayamak_key: '',
  ghasedak_key: '',
  farazsms_key: '',
  sms_provider: 'kavenegar',
  sms_sender_line: '10008000',
  sms_enabled: false
};

const DEFAULT_PAYMENT_SETTINGS: PaymentGatewaySettings = {
  enabled: true,
  default_gateway: 'zarinpal',
  currency: 'IRR',
  zarinpal_merchant_id: '00000000-0000-0000-0000-000000000000',
  zarinpal_sandbox: true,
  zarinpal_callback_url: 'https://bisaf.ir/api/payment/verify/zarinpal',
  idpay_api_key: 'idpay_sandbox_key_12345',
  idpay_sandbox: true,
  idpay_callback_url: 'https://bisaf.ir/api/payment/verify/idpay',
  nextpay_api_key: 'nextpay_sandbox_key_67890',
  nextpay_callback_url: 'https://bisaf.ir/api/payment/verify/nextpay'
};

export const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'user-admin',
    phone: '09120000000',
    username: 'admin',
    password: 'admin',
    full_name: 'ادمین ارشد سیستم بی‌صف',
    role: 'admin',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-mot1',
    phone: '09121111111',
    username: 'mot1',
    password: 'admin',
    full_name: 'شاطر نانوایی سنگکی برکت',
    role: 'shopkeeper',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-mot2',
    phone: '09122222222',
    username: 'mot2',
    password: 'admin',
    full_name: 'مسئول پذیرش درمانگاه شفا',
    role: 'shopkeeper',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-mot3',
    phone: '09123333333',
    username: 'mot3',
    password: 'admin',
    full_name: 'منشی مطب دکتر رضایی',
    role: 'shopkeeper',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-baz1',
    phone: '09124444444',
    username: 'baz1',
    password: 'admin',
    full_name: 'مهندس رضایی (بازاریاب منطقه ۱)',
    role: 'marketer',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-baz2',
    phone: '09125555555',
    username: 'baz2',
    password: 'admin',
    full_name: 'خانم احمدی (بازاریاب منطقه ۲)',
    role: 'marketer',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-mosh1',
    phone: '09126666661',
    username: 'mosh1',
    password: 'admin',
    full_name: 'علی محمدی (مشتری)',
    role: 'customer',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-mosh2',
    phone: '09126666662',
    username: 'mosh2',
    password: 'admin',
    full_name: 'سارا ناصری (مشتری)',
    role: 'customer',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-mosh3',
    phone: '09126666663',
    username: 'mosh3',
    password: 'admin',
    full_name: 'حسین حسینی (مشتری)',
    role: 'customer',
    created_at: new Date().toISOString()
  }
];

export const DEFAULT_SHOPS: Shop[] = [
  {
    id: 'shop-barekat-sangak',
    name: 'نانوایی سنگکی سنتی برکت',
    slug: 'barekat-sangak',
    category: 'نانوایی',
    subcategory: 'سنگک سنتی',
    address: 'تهران، خیابان آزادی، نرسیده به میدان انقلاب، پلاک ۱۲۴',
    phone: '02166001122',
    latitude: 35.7005,
    longitude: 51.3850,
    is_active: true,
    owner_id: 'user-mot1',
    marketer_id: 'marketer-1',
    created_at: new Date().toISOString(),
    waiting_count: 3,
    current_serving: 104,
    estimated_wait_minutes: 6,
    product_items: [
      { id: 'p-1', name: 'سنگک ساده' },
      { id: 'p-2', name: 'سنگک یک رو کنجد' },
      { id: 'p-3', name: 'سنگک دو رو کنجد' },
      { id: 'p-4', name: 'سنگک پرکنجد سبزیجات' }
    ],
    banner_image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    banner_target_url: 'https://bisaf.ir/shop/barekat-sangak',
    banner_title: 'نان داغ و تازه سنگک برکت - سفارش آنلاین و تحویل سریع بدون صف',
    banner_active: true,
    serve_button_label: '🥖 تحویل نان و نوبت بعدی',
    single_button_label: '+ نوبت تکی (۱ عدد)',
    multi_button_label: '+ نوبت چندتایی'
  },
  {
    id: 'shop-clinic-shafa',
    name: 'کلینیک تخصصی و درمانگاه شبانه‌روزی شفا',
    slug: 'clinic-shafa',
    category: 'پزشکی و سلامت',
    subcategory: 'پزشک عمومی و تخصصی',
    address: 'تهران، خیابان ولیعصر، تقاطع زرتشت، پلاک ۴۵',
    phone: '02188990011',
    latitude: 35.7215,
    longitude: 51.4080,
    is_active: true,
    owner_id: 'user-mot2',
    marketer_id: 'marketer-1',
    created_at: new Date().toISOString(),
    waiting_count: 2,
    current_serving: 208,
    estimated_wait_minutes: 15,
    product_items: [
      { id: 'p-10', name: 'ویزیت پزشک عمومی' },
      { id: 'p-11', name: 'تزریقات و پانسمان' },
      { id: 'p-12', name: 'نوار قلب و سرم‌تراپی' }
    ],
    banner_image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
    banner_target_url: 'https://bisaf.ir/shop/clinic-shafa',
    banner_title: 'نوبت‌دهی آنلاین درمانگاه شفا - کاهش زمان معطلی در سالن انتظار',
    banner_active: true,
    serve_button_label: '🩺 فراخوانی ویزیت بیمار بعدی',
    single_button_label: '+ پذیرش بیمار عادی',
    multi_button_label: '+ پذیرش همراه / اورژانسی'
  },
  {
    id: 'shop-dr-rezaei',
    name: 'مطب دکتر رضایی (متخصص داخلی)',
    slug: 'dr-rezaei',
    category: 'پزشکی و سلامت',
    subcategory: 'مطب تخصصی',
    address: 'تهران، میدان ونک، خیابان حقانی، ساختمان پزشکان پلاک ۱۰',
    phone: '02188776655',
    latitude: 35.7575,
    longitude: 51.4170,
    is_active: true,
    owner_id: 'user-mot3',
    marketer_id: 'marketer-2',
    created_at: new Date().toISOString(),
    waiting_count: 1,
    current_serving: 12,
    estimated_wait_minutes: 20,
    product_items: [
      { id: 'p-20', name: 'ویزیت تخصصی' },
      { id: 'p-21', name: 'چکاپ و مشاوره درمان' }
    ],
    banner_image_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80',
    banner_target_url: 'https://bisaf.ir/shop/dr-rezaei',
    banner_title: 'سامانه پذیرش مراجعین مطب دکتر رضایی',
    banner_active: true,
    serve_button_label: '👨‍⚕️ فراخوانی بیمار بعدی به اتاق پزشک',
    single_button_label: '+ نوبت حضوری',
    multi_button_label: '+ نوبت مشاوره'
  }
];

export const DEFAULT_QUEUE_ITEMS: QueueItem[] = [
  {
    id: 'q-sangak-104',
    shop_id: 'shop-barekat-sangak',
    ticket_number: 104,
    customer_user_id: 'user-mosh1',
    customer_name: 'علی محمدی',
    customer_phone: '09126666661',
    ticket_type: 'in_person_multi',
    quantity: 3,
    items_summary: '۲ عدد سنگک دو رو کنجد، ۱ عدد سنگک ساده',
    status: 'serving',
    position: 0,
    threshold: 3,
    joined_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    called_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'q-sangak-105',
    shop_id: 'shop-barekat-sangak',
    ticket_number: 105,
    customer_user_id: 'user-mosh2',
    customer_name: 'سارا ناصری',
    customer_phone: '09126666662',
    ticket_type: 'in_person_single',
    quantity: 1,
    items_summary: '۱ عدد سنگک ساده',
    status: 'waiting',
    position: 1,
    threshold: 3,
    joined_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'q-sangak-106',
    shop_id: 'shop-barekat-sangak',
    ticket_number: 106,
    customer_name: 'مشتری حضوری',
    ticket_type: 'in_person_multi',
    quantity: 5,
    items_summary: '۵ عدد سنگک ساده',
    status: 'waiting',
    position: 2,
    threshold: 3,
    joined_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 60 * 1000).toISOString()
  },
  {
    id: 'q-sangak-107',
    shop_id: 'shop-barekat-sangak',
    ticket_number: 107,
    customer_user_id: 'user-mosh3',
    customer_name: 'حسین حسینی (آنلاین)',
    customer_phone: '09126666663',
    ticket_type: 'in_person_single',
    quantity: 1,
    items_summary: '۱ عدد سنگک یک رو کنجد',
    status: 'waiting',
    position: 3,
    threshold: 3,
    joined_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString()
  }
];

export const DEFAULT_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-bakery',
    name: 'نانوایی',
    slug: 'bakery',
    icon: 'Store',
    subcategories: [
      { id: 'sub-1', name: 'سنگک سنتی', slug: 'sangak' },
      { id: 'sub-2', name: 'بربری سنتی', slug: 'barbari' },
      { id: 'sub-3', name: 'لواش ماشینی', slug: 'lavash' },
      { id: 'sub-4', name: 'تافتون تنوری', slug: 'taftoon' },
      { id: 'sub-5', name: 'نان فانتزی و باگت', slug: 'fantasy' }
    ]
  },
  {
    id: 'cat-medical',
    name: 'پزشکی و سلامت',
    slug: 'medical',
    icon: 'Activity',
    subcategories: [
      { id: 'sub-6', name: 'پزشک عمومی و تخصصی', slug: 'doctor' },
      { id: 'sub-7', name: 'کلینیک و درمانگاه', slug: 'clinic' },
      { id: 'sub-8', name: 'دندانپزشکی', slug: 'dentist' },
      { id: 'sub-9', name: 'داروخانه', slug: 'pharmacy' },
      { id: 'sub-10', name: 'آزمایشگاه و رادیولوژی', slug: 'lab' }
    ]
  },
  {
    id: 'cat-beauty',
    name: 'زیبایی و سلامت',
    slug: 'beauty',
    icon: 'Sparkles',
    subcategories: [
      { id: 'sub-11', name: 'آرایشگاه مردانه', slug: 'barber' },
      { id: 'sub-12', name: 'سالن زیبایی بانوان', slug: 'salon' },
      { id: 'sub-13', name: 'کلینیک پوست و مو', slug: 'skin' }
    ]
  },
  {
    id: 'cat-food',
    name: 'رستوران و کافه',
    slug: 'food',
    icon: 'Utensils',
    subcategories: [
      { id: 'sub-14', name: 'رستوران سنتی و کبابی', slug: 'restaurant' },
      { id: 'sub-15', name: 'فست‌فود و پیتزا', slug: 'fastfood' },
      { id: 'sub-16', name: 'کافی‌شاپ', slug: 'cafe' },
      { id: 'sub-17', name: 'طباخی و کله‌پزی', slug: 'tabakhi' }
    ]
  }
];

export const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  { id: 'flag-1', key: 'online_booking', enabled: true, description: 'امکان دریافت نوبت غیرحضوری از طریق وب‌اپلیکیشن' },
  { id: 'flag-2', key: 'bot_integration', enabled: true, description: 'اتصال خودکار به ربات‌های پیام‌رسان بله و تلگرام' },
  { id: 'flag-3', key: 'sms_notifications', enabled: true, description: 'ارسال پیامک یادآوری نزدیک شدن نوبت' },
  { id: 'flag-4', key: 'interleaving_queue', enabled: true, description: 'الگوریتم تناوبی هوشمند صف تکی و چندتایی نانوایی' },
  { id: 'flag-5', key: 'audio_announcements', enabled: true, description: 'پخش رادیویی صوتی نوبت خوان در پنل متصدی' },
  { id: 'flag-6', key: 'promotional_banners', enabled: true, description: 'نمایش بنرهای تبلیغاتی کلیک‌خور در صفحات دریافت نوبت' }
];

export const DEFAULT_MARKETERS: Marketer[] = [
  { id: 'marketer-1', user_id: 'user-baz1', full_name: 'بازاریاب تهران (سعید رضایی)', phone: '09123456701', province: 'تهران', city: 'تهران', national_id: '0012345678', sheba_number: 'IR120120000000012345678901', bank_name: 'بانک ملت', commission_rate: 15, status: 'approved', created_at: new Date().toISOString() },
  { id: 'marketer-2', user_id: 'user-baz2', full_name: 'بازاریاب کرج (نرگس حسینی)', phone: '09123456702', province: 'البرز', city: 'کرج', national_id: '0023456789', sheba_number: 'IR340150000000098765432101', bank_name: 'بانک پاسارگاد', commission_rate: 12, status: 'approved', created_at: new Date().toISOString() }
];

// In-memory runtime cache synchronized with Supabase & LocalStorage
let memoryCache: Record<string, any> = {
  [KEYS.PROFILES]: DEFAULT_PROFILES,
  [KEYS.SHOPS]: DEFAULT_SHOPS,
  [KEYS.QUEUE_ITEMS]: DEFAULT_QUEUE_ITEMS,
  [KEYS.SERVICE_CATEGORIES]: DEFAULT_CATEGORIES,
  [KEYS.FEATURE_FLAGS]: DEFAULT_FEATURE_FLAGS,
  [KEYS.MARKETERS]: DEFAULT_MARKETERS,
  [KEYS.FOOTER_CONFIG]: DEFAULT_FOOTER_CONFIG,
  [KEYS.SYSTEM_INTEGRATIONS]: DEFAULT_SYSTEM_INTEGRATIONS,
  [KEYS.PAYMENT_SETTINGS]: DEFAULT_PAYMENT_SETTINGS
};

let isSyncing = false;

// Initial background sync from Supabase into memory cache
export async function initStorageFromSupabase() {
  if (isSyncing) return;
  isSyncing = true;
  try {
    const [
      { data: profiles },
      { data: shops },
      { data: queueItems },
      { data: categories },
      { data: subcategories },
      { data: featureFlags },
      { data: marketers },
      { data: systemSettings },
      { data: auditLogs }
    ] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('shops').select('*'),
      supabase.from('queue_items').select('*'),
      supabase.from('service_categories').select('*'),
      supabase.from('service_subcategories').select('*'),
      supabase.from('feature_flags').select('*'),
      supabase.from('marketers').select('*, profiles(*)'),
      supabase.from('system_settings').select('*'),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200)
    ]);

    if (profiles && profiles.length > 0) {
      // Merge with default seed profiles so standard accounts are never lost
      const mergedProfiles = [...profiles];
      for (const def of DEFAULT_PROFILES) {
        if (!mergedProfiles.some(p => p.id === def.id || p.phone === def.phone)) {
          mergedProfiles.push(def);
        }
      }
      memoryCache[KEYS.PROFILES] = mergedProfiles;
      setItem(KEYS.PROFILES, mergedProfiles);
    }

    if (shops && shops.length > 0) {
      const mergedShops = [...shops];
      for (const def of DEFAULT_SHOPS) {
        if (!mergedShops.some(s => s.id === def.id || s.slug === def.slug)) {
          mergedShops.push(def);
        }
      }
      memoryCache[KEYS.SHOPS] = mergedShops;
      setItem(KEYS.SHOPS, mergedShops);
    }

    if (queueItems && queueItems.length > 0) {
      memoryCache[KEYS.QUEUE_ITEMS] = queueItems;
      setItem(KEYS.QUEUE_ITEMS, queueItems);
    }

    if (featureFlags && featureFlags.length > 0) {
      memoryCache[KEYS.FEATURE_FLAGS] = featureFlags;
      setItem(KEYS.FEATURE_FLAGS, featureFlags);
    }

    if (marketers && marketers.length > 0) {
      memoryCache[KEYS.MARKETERS] = marketers;
      setItem(KEYS.MARKETERS, marketers);
    }

    if (auditLogs && auditLogs.length > 0) {
      memoryCache[KEYS.AUDIT_LOGS] = auditLogs;
      setItem(KEYS.AUDIT_LOGS, auditLogs);
    }

    if (categories && categories.length > 0) {
      const fullCats: ServiceCategory[] = categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon || 'Store',
        subcategories: (subcategories || []).filter(sub => sub.category_id === c.id).map(s => ({
          id: s.id,
          name: s.name,
          slug: s.slug
        }))
      }));
      memoryCache[KEYS.SERVICE_CATEGORIES] = fullCats;
      setItem(KEYS.SERVICE_CATEGORIES, fullCats);
    }

    if (systemSettings && systemSettings.length > 0) {
      for (const s of systemSettings) {
        if (s.key === 'system_integrations' && s.value) {
          memoryCache[KEYS.SYSTEM_INTEGRATIONS] = s.value;
          setItem(KEYS.SYSTEM_INTEGRATIONS, s.value);
        } else if (s.key === 'payment_settings' && s.value) {
          memoryCache[KEYS.PAYMENT_SETTINGS] = s.value;
          setItem(KEYS.PAYMENT_SETTINGS, s.value);
        } else if (s.key === 'footer_config' && s.value) {
          memoryCache[KEYS.FOOTER_CONFIG] = s.value;
          setItem(KEYS.FOOTER_CONFIG, s.value);
        }
      }
    }
  } catch (err) {
    console.warn('Supabase background sync notice (using local offline storage):', err);
  } finally {
    isSyncing = false;
  }
}

// Kick off initial sync immediately
initStorageFromSupabase();

function getItem<T>(key: string, defaultValue: T): T {
  if (memoryCache[key] !== undefined && memoryCache[key] !== null) {
    if (Array.isArray(defaultValue) && Array.isArray(memoryCache[key]) && memoryCache[key].length === 0 && defaultValue.length > 0) {
      return defaultValue;
    }
    return memoryCache[key] as T;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(defaultValue) && Array.isArray(parsed) && parsed.length === 0 && defaultValue.length > 0) {
        memoryCache[key] = defaultValue;
        return defaultValue;
      }
      memoryCache[key] = parsed;
      return parsed as T;
    }
  } catch (e) {
    // fallback
  }
  memoryCache[key] = defaultValue;
  return defaultValue;
}

function setItem<T>(key: string, value: T): void {
  memoryCache[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // fallback
  }
}

export class StorageService {
  static getCurrentUser(): Profile {
    const profiles = this.getProfiles();
    const current = getItem<Profile | null>(KEYS.CURRENT_USER, null);
    if (current) return current;
    const admin = profiles.find(p => p.role === 'admin');
    return admin || profiles[0] || {
      id: 'user-admin',
      phone: '09120000000',
      username: 'admin',
      full_name: 'ادمین ارشد سیستم',
      role: 'admin',
      created_at: new Date().toISOString()
    };
  }

  static setCurrentUser(user: Profile): void {
    setItem(KEYS.CURRENT_USER, user);
  }

  static getProfiles(): Profile[] {
    return getItem<Profile[]>(KEYS.PROFILES, []);
  }

  static async fetchProfilesFromSupabase(): Promise<Profile[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) {
      memoryCache[KEYS.PROFILES] = data;
      return data as Profile[];
    }
    return this.getProfiles();
  }

  static async saveProfile(profile: Profile): Promise<void> {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === profile.id || p.phone === profile.phone);
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...profile, updated_at: new Date().toISOString() };
    } else {
      profiles.push(profile);
    }
    setItem(KEYS.PROFILES, profiles);

    // Save directly to Supabase
    try {
      await supabase.from('profiles').upsert({
        id: profile.id,
        phone: profile.phone,
        username: profile.username,
        full_name: profile.full_name,
        role: profile.role,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString()
      }, { onConflict: 'phone' });
    } catch (e) {
      console.error('Supabase saveProfile error:', e);
    }
  }

  static getShops(): Shop[] {
    return getItem<Shop[]>(KEYS.SHOPS, DEFAULT_SHOPS);
  }

  static getShopBySlug(slug?: string): Shop {
    const shops = this.getShops();
    if (!slug) return shops[0] || DEFAULT_SHOPS[0];
    const found = shops.find(s => s.slug === slug || s.id === slug) || 
                  DEFAULT_SHOPS.find(s => s.slug === slug || s.id === slug);
    return found || shops[0] || DEFAULT_SHOPS[0];
  }

  static getShopById(id?: string): Shop {
    const shops = this.getShops();
    if (!id) return shops[0] || DEFAULT_SHOPS[0];
    const found = shops.find(s => s.id === id || s.slug === id) || 
                  DEFAULT_SHOPS.find(s => s.id === id || s.slug === id);
    return found || shops[0] || DEFAULT_SHOPS[0];
  }

  static async fetchShopsFromSupabase(): Promise<Shop[]> {
    const { data, error } = await supabase.from('shops').select('*');
    if (!error && data) {
      memoryCache[KEYS.SHOPS] = data;
      return data as Shop[];
    }
    return this.getShops();
  }

  static async saveShop(shop: Shop): Promise<void> {
    const shops = this.getShops();
    const idx = shops.findIndex(s => s.id === shop.id || s.slug === shop.slug);
    if (idx >= 0) {
      shops[idx] = { ...shops[idx], ...shop };
    } else {
      shops.push(shop);
    }
    setItem(KEYS.SHOPS, shops);

    // Save directly to Supabase
    try {
      await supabase.from('shops').upsert({
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        category: shop.category,
        subcategory: shop.subcategory,
        address: shop.address,
        phone: shop.phone,
        latitude: shop.latitude,
        longitude: shop.longitude,
        is_active: shop.is_active,
        owner_id: shop.owner_id,
        marketer_id: shop.marketer_id,
        waiting_count: shop.waiting_count,
        current_serving: shop.current_serving,
        estimated_wait_minutes: shop.estimated_wait_minutes,
        product_items: shop.product_items,
        banner_image_url: shop.banner_image_url,
        banner_target_url: shop.banner_target_url,
        banner_title: shop.banner_title,
        banner_active: shop.banner_active,
        serve_button_label: shop.serve_button_label,
        single_button_label: shop.single_button_label,
        multi_button_label: shop.multi_button_label,
        require_operator_password: shop.require_operator_password,
        operator_password: shop.operator_password,
        updated_at: new Date().toISOString()
      }, { onConflict: 'slug' });
    } catch (e) {
      console.warn('Supabase saveShop notice (saved to local fallback):', e);
    }
  }

  static saveShops(shops: Shop[]): void {
    setItem(KEYS.SHOPS, shops);
  }

  static getQueueItems(): QueueItem[] {
    return getItem<QueueItem[]>(KEYS.QUEUE_ITEMS, []);
  }

  static async fetchQueueItemsFromSupabase(): Promise<QueueItem[]> {
    const { data, error } = await supabase.from('queue_items').select('*');
    if (!error && data) {
      memoryCache[KEYS.QUEUE_ITEMS] = data;
      return data as QueueItem[];
    }
    return this.getQueueItems();
  }

  static async saveQueueItem(item: QueueItem): Promise<void> {
    const items = this.getQueueItems();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      items[idx] = item;
    } else {
      items.push(item);
    }
    setItem(KEYS.QUEUE_ITEMS, items);

    // Save directly to Supabase
    try {
      await supabase.from('queue_items').upsert({
        id: item.id,
        shop_id: item.shop_id,
        ticket_number: item.ticket_number,
        customer_user_id: item.customer_user_id,
        customer_name: item.customer_name,
        customer_phone: item.customer_phone,
        ticket_type: item.ticket_type,
        quantity: item.quantity,
        status: item.status,
        position: item.position,
        threshold: item.threshold,
        joined_at: item.joined_at,
        called_at: item.called_at,
        served_at: item.served_at,
        cancelled_at: item.cancelled_at
      });
    } catch (e) {
      console.error('Supabase saveQueueItem error:', e);
    }
  }

  static saveQueueItems(items: QueueItem[]): void {
    setItem(KEYS.QUEUE_ITEMS, items);
  }

  static getFeatureFlags(): FeatureFlag[] {
    return getItem<FeatureFlag[]>(KEYS.FEATURE_FLAGS, []);
  }

  static async saveFeatureFlags(flags: FeatureFlag[]): Promise<void> {
    setItem(KEYS.FEATURE_FLAGS, flags);
    try {
      for (const flag of flags) {
        await supabase.from('feature_flags').upsert({
          key: flag.key,
          enabled: flag.enabled,
          description: flag.description,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      }
    } catch (e) {
      console.error('Supabase saveFeatureFlags error:', e);
    }
  }

  static getFavorites(userId: string): CustomerFavorite[] {
    const favs = getItem<CustomerFavorite[]>(KEYS.FAVORITES, []);
    return favs.filter(f => f.user_id === userId);
  }

  static toggleFavorite(userId: string, shopId: string): boolean {
    const favs = getItem<CustomerFavorite[]>(KEYS.FAVORITES, []);
    const idx = favs.findIndex(f => f.user_id === userId && f.shop_id === shopId);
    let isFav = false;
    if (idx >= 0) {
      favs.splice(idx, 1);
      isFav = false;
      supabase.from('customer_favorites').delete().match({ user_id: userId, shop_id: shopId });
    } else {
      const newFav = {
        id: `fav-${Date.now()}`,
        user_id: userId,
        shop_id: shopId,
        created_at: new Date().toISOString()
      };
      favs.push(newFav);
      isFav = true;
      supabase.from('customer_favorites').insert(newFav);
    }
    setItem(KEYS.FAVORITES, favs);
    return isFav;
  }

  static getMarketers(): Marketer[] {
    return getItem<Marketer[]>(KEYS.MARKETERS, []);
  }

  static saveMarketer(marketer: Marketer): void {
    const list = this.getMarketers();
    const idx = list.findIndex(m => m.id === marketer.id);
    if (idx >= 0) {
      list[idx] = marketer;
    } else {
      list.push(marketer);
    }
    setItem(KEYS.MARKETERS, list);
    supabase.from('marketers').upsert({
      id: marketer.id,
      user_id: marketer.user_id,
      commission_rate: marketer.commission_rate,
      status: marketer.status
    });
  }

  static getReferrals(): Referral[] {
    return getItem<Referral[]>(KEYS.REFERRALS, []);
  }

  static addReferral(ref: Referral): void {
    const list = this.getReferrals();
    list.push(ref);
    setItem(KEYS.REFERRALS, list);
  }

  static getAuditLogs(): AuditLog[] {
    return getItem<AuditLog[]>(KEYS.AUDIT_LOGS, []);
  }

  static addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    setItem(KEYS.AUDIT_LOGS, logs.slice(0, 200));

    // Async push to Supabase
    supabase.from('audit_logs').insert({
      actor_user_id: log.actor_user_id || null,
      action: log.action,
      target_type: log.target_type,
      target_id: log.target_id,
      metadata: log.metadata || {}
    }).then();
  }

  static getPrintTemplate(shopId: string): PrintTemplate {
    const templates = getItem<Record<string, PrintTemplate>>(KEYS.PRINT_TEMPLATES, {});
    return templates[shopId] || {
      id: `pt-${shopId}`,
      shop_id: shopId,
      template_name: 'فیش استاندارد بی‌صف',
      header_text: 'به مرکز خدمت‌رسانی خوش آمدید',
      footer_text: 'از شکیبایی شما سپاسگزاریم.\nسامانه مدیریت صف بی‌صف (BiSaf.ir)',
      font_family: 'Vazirmatn',
      font_size: 14
    };
  }

  static savePrintTemplate(template: PrintTemplate): void {
    const templates = getItem<Record<string, PrintTemplate>>(KEYS.PRINT_TEMPLATES, {});
    templates[template.shop_id] = template;
    setItem(KEYS.PRINT_TEMPLATES, templates);
  }

  static getBanners(): BannerItem[] {
    return getItem<BannerItem[]>(KEYS.BANNERS, DEFAULT_BANNERS);
  }

  static getBannerById(id: string): BannerItem | undefined {
    const banners = this.getBanners();
    return banners.find(b => b.id === id);
  }

  static saveBanner(banner: BannerItem): void {
    const banners = this.getBanners();
    const idx = banners.findIndex(b => b.id === banner.id);
    if (idx >= 0) {
      banners[idx] = { ...banners[idx], ...banner };
    } else {
      banners.unshift(banner);
    }
    setItem(KEYS.BANNERS, banners);
    this.addAuditLog({
      action: `ذخیره/ویرایش بنر تبلیغاتی "${banner.title}"`,
      target_type: 'banner',
      target_id: banner.id
    });
  }

  static deleteBanner(id: string): void {
    const banners = this.getBanners().filter(b => b.id !== id);
    setItem(KEYS.BANNERS, banners);
    this.addAuditLog({
      action: `حذف بنر تبلیغاتی با شناسه ${id}`,
      target_type: 'banner',
      target_id: id
    });
  }

  static getSystemIntegrations(): SystemIntegrationsConfig {
    const saved = getItem<SystemIntegrationsConfig>(KEYS.SYSTEM_INTEGRATIONS, DEFAULT_SYSTEM_INTEGRATIONS);
    return {
      ...saved,
      supabase_url: saved.supabase_url || import.meta.env.VITE_SUPABASE_URL || 'https://jnburxmyrhzjdpzyhqvy.supabase.co',
      supabase_anon_key: saved.supabase_anon_key || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuYnVyeG15cmh6amRwenlocXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NDQ3NDcsImV4cCI6MjEwMjIyMDc0N30.06anmyCEczHdYwxV2l4wthm_3o40ardtIanuPdeCPkE',
      supabase_enabled: saved.supabase_enabled !== undefined ? saved.supabase_enabled : true,
      telegram_token: saved.telegram_token || import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
      bale_token: saved.bale_token || import.meta.env.VITE_BALE_BOT_TOKEN || '',
      eitaa_token: saved.eitaa_token || import.meta.env.VITE_EITAA_BOT_TOKEN || '',
      rubika_token: saved.rubika_token || import.meta.env.VITE_RUBIKA_BOT_TOKEN || '',
      neshan_key: saved.neshan_key || import.meta.env.VITE_NESHAN_KEY || '',
      kavenegar_key: saved.kavenegar_key || import.meta.env.VITE_KAVENEGAR_KEY || '',
    };
  }

  static saveSystemIntegrations(config: SystemIntegrationsConfig): void {
    setItem(KEYS.SYSTEM_INTEGRATIONS, config);
    this.addAuditLog({
      action: 'بروزرسانی توکن‌ها و API های سیستم (ربات‌ها/نقشه/پیامک)',
      target_type: 'system_integrations'
    });
    supabase.from('system_settings').upsert({
      key: 'system_integrations',
      value: config,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' }).then();
  }

  static getPaymentSettings(): PaymentGatewaySettings {
    const saved = getItem<PaymentGatewaySettings>(KEYS.PAYMENT_SETTINGS, DEFAULT_PAYMENT_SETTINGS);
    return {
      ...saved,
      zarinpal_merchant_id: saved.zarinpal_merchant_id || import.meta.env.VITE_ZARINPAL_MERCHANT_ID || '',
      idpay_api_key: saved.idpay_api_key || import.meta.env.VITE_IDPAY_API_KEY || ''
    };
  }

  static savePaymentSettings(settings: PaymentGatewaySettings): void {
    setItem(KEYS.PAYMENT_SETTINGS, settings);
    this.addAuditLog({
      action: 'بروزرسانی تنظیمات و مرچنت‌کد درگاه‌های پرداخت',
      target_type: 'payment_settings'
    });
    supabase.from('system_settings').upsert({
      key: 'payment_settings',
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' }).then();
  }

  // --- Service Categories Management ---
  static getCategories(): ServiceCategory[] {
    return getItem<ServiceCategory[]>(KEYS.SERVICE_CATEGORIES, []);
  }

  static saveCategories(categories: ServiceCategory[]): void {
    setItem(KEYS.SERVICE_CATEGORIES, categories);
  }

  static addCategory(categoryName: string, icon: string = 'Store'): ServiceCategory[] {
    const cats = this.getCategories();
    const newCat: ServiceCategory = {
      id: `cat-${Date.now()}`,
      name: categoryName,
      slug: `cat-${Date.now()}`,
      icon: icon,
      subcategories: []
    };
    cats.push(newCat);
    this.saveCategories(cats);
    this.addAuditLog({
      action: `تعریف صنف/دسته‌بندی اصلی جدید: ${categoryName}`,
      target_type: 'service_category',
      target_id: newCat.id
    });
    supabase.from('service_categories').insert({
      name: newCat.name,
      slug: newCat.slug,
      icon: newCat.icon,
      is_active: true
    }).then();
    return cats;
  }

  static deleteCategory(categoryId: string): ServiceCategory[] {
    const cats = this.getCategories().filter(c => c.id !== categoryId);
    this.saveCategories(cats);
    this.addAuditLog({
      action: `حذف دسته‌بندی اصلی: ${categoryId}`,
      target_type: 'service_category',
      target_id: categoryId
    });
    supabase.from('service_categories').delete().eq('id', categoryId).then();
    return cats;
  }

  static addSubcategory(categoryId: string, subcategoryName: string): ServiceCategory[] {
    const cats = this.getCategories();
    const cat = cats.find(c => c.id === categoryId);
    if (cat) {
      const newSub: ServiceSubcategory = {
        id: `sub-${Date.now()}`,
        name: subcategoryName,
        slug: `sub-${Date.now()}`
      };
      cat.subcategories.push(newSub);
      this.saveCategories(cats);
      this.addAuditLog({
        action: `تعریف زیردسته صنف (${cat.name}): ${subcategoryName}`,
        target_type: 'service_subcategory',
        target_id: newSub.id
      });
      supabase.from('service_subcategories').insert({
        category_id: categoryId,
        name: newSub.name,
        slug: newSub.slug,
        is_active: true
      }).then();
    }
    return cats;
  }

  static deleteSubcategory(categoryId: string, subcategoryId: string): ServiceCategory[] {
    const cats = this.getCategories();
    const cat = cats.find(c => c.id === categoryId);
    if (cat) {
      cat.subcategories = cat.subcategories.filter(s => s.id !== subcategoryId);
      this.saveCategories(cats);
      this.addAuditLog({
        action: `حذف زیردسته صنف (${cat.name}): ${subcategoryId}`,
        target_type: 'service_subcategory',
        target_id: subcategoryId
      });
      supabase.from('service_subcategories').delete().eq('id', subcategoryId).then();
    }
    return cats;
  }

  static deleteProfile(profileId: string): Profile[] {
    const profiles = this.getProfiles().filter(p => p.id !== profileId);
    setItem(KEYS.PROFILES, profiles);
    this.addAuditLog({
      action: `حذف کاربر از سیستم: ${profileId}`,
      target_type: 'profile',
      target_id: profileId
    });
    supabase.from('profiles').delete().eq('id', profileId).then();
    return profiles;
  }

  static deleteMarketer(marketerId: string): Marketer[] {
    const list = this.getMarketers().filter(m => m.id !== marketerId);
    setItem(KEYS.MARKETERS, list);
    this.addAuditLog({
      action: `حذف بازاریاب: ${marketerId}`,
      target_type: 'marketer',
      target_id: marketerId
    });
    supabase.from('marketers').delete().eq('id', marketerId).then();
    return list;
  }

  static deleteShop(shopId: string): Shop[] {
    const shops = this.getShops().filter(s => s.id !== shopId);
    setItem(KEYS.SHOPS, shops);
    this.addAuditLog({
      action: `حذف مرکز/فروشگاه: ${shopId}`,
      target_type: 'shop',
      target_id: shopId
    });
    supabase.from('shops').delete().eq('id', shopId).then();
    return shops;
  }

  static getFooterConfig(): LandingFooterConfig {
    return getItem<LandingFooterConfig>(KEYS.FOOTER_CONFIG, DEFAULT_FOOTER_CONFIG);
  }

  static saveFooterConfig(config: LandingFooterConfig): void {
    setItem(KEYS.FOOTER_CONFIG, config);
    this.addAuditLog({
      action: 'تغییر و بروزرسانی تنظیمات فوتر و محتوای لندینگ',
      target_type: 'footer_config',
      target_id: 'footer'
    });
    supabase.from('system_settings').upsert({
      key: 'footer_config',
      value: config,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' }).then();
  }

  /**
   * Database Studio / Table Manager API (Direct Supabase Integrated)
   */
  static getAvailableTables() {
    return [
      { id: 'profiles', key: KEYS.PROFILES, name: 'کاربران و پرسنل (profiles)', description: 'جدول حساب‌های کاربری، شماره تماس، نقش‌ها و پرسنل (Supabase Cloud)', icon: 'Users', primaryKey: 'id' },
      { id: 'shops', key: KEYS.SHOPS, name: 'مراکز و اصناف (shops)', description: 'جدول اطلاعات نانوایی‌ها، کلینیک‌ها، مطب‌ها و مراکز ثبت‌شده (Supabase Cloud)', icon: 'Store', primaryKey: 'id' },
      { id: 'queue_items', key: KEYS.QUEUE_ITEMS, name: 'نوبت‌ها و فیش‌ها (queue_items)', description: 'جدول سوابق نوبت‌گیری، وضعیت مراجعین و زمان تخمینی (Supabase Cloud)', icon: 'Clock', primaryKey: 'id' },
      { id: 'marketers', key: KEYS.MARKETERS, name: 'بازاریابان و پورسانت (marketers)', description: 'جدول کدهای معرف، پورسانت و بازاریابان فعال سامانه (Supabase Cloud)', icon: 'Award', primaryKey: 'id' },
      { id: 'service_categories', key: KEYS.SERVICE_CATEGORIES, name: 'دسته‌بندی اصناف (categories)', description: 'جدول مشاغل، گروه‌ها و زیردسته‌های مجاز سیستم (Supabase Cloud)', icon: 'Tag', primaryKey: 'id' },
      { id: 'service_subcategories', key: 'bisaf_subcategories', name: 'زیردسته‌های اصناف (subcategories)', description: 'جدول زیردسته‌های اختصاصی هر صنف و گروه شغلی (Supabase Cloud)', icon: 'Tag', primaryKey: 'id' },
      { id: 'feature_flags', key: KEYS.FEATURE_FLAGS, name: 'پرچم‌های قابلیت‌ها (feature_flags)', description: 'جدول فعال/غیرفعال‌سازی ماژول‌های سامانه (Supabase Cloud)', icon: 'ToggleRight', primaryKey: 'key' },
      { id: 'system_integrations', key: KEYS.SYSTEM_INTEGRATIONS, name: 'تنظیمات بات‌ها و سرویس‌ها (integrations)', description: 'جدول توکن‌ها، پیام‌رسان‌ها، پیامک و تنظیمات اتصال (Supabase Cloud)', icon: 'Bot', primaryKey: 'single' },
      { id: 'payment_settings', key: KEYS.PAYMENT_SETTINGS, name: 'درگاه‌های پرداخت (payment_settings)', description: 'جدول مرچنت‌کدها و کلیدهای درگاه پرداخت آنلاین (Supabase Cloud)', icon: 'CreditCard', primaryKey: 'single' },
      { id: 'audit_logs', key: KEYS.AUDIT_LOGS, name: 'لاگ‌های امنیتی و رویدادها (audit_logs)', description: 'جدول تاریخچه تغییرات و رویدادهای سیستم (Supabase Cloud)', icon: 'FileText', primaryKey: 'id' },
      { id: 'bot_dynamic_texts', key: 'bisaf_bot_dynamic_texts', name: 'متون پویا ربات‌ها (bot_dynamic_texts)', description: 'جدول پیام‌های راهنما، خوش‌آمدگویی و الگوهای ربات (Supabase Cloud)', icon: 'Bot', primaryKey: 'id' },
      { id: 'favorites', key: KEYS.FAVORITES, name: 'علاقه‌مندی‌ها (customer_favorites)', description: 'جدول فروشگاه‌های نشان‌شده توسط مشتریان (Supabase Cloud)', icon: 'Star', primaryKey: 'id' },
      { id: 'print_templates', key: KEYS.PRINT_TEMPLATES, name: 'قالب‌های چاپ پوستر و فیش (print_templates)', description: 'جدول تنظیمات چاپ فیش‌ها و پوسترهای A4', icon: 'Layers', primaryKey: 'shop_id' },
      { id: 'footer_config', key: KEYS.FOOTER_CONFIG, name: 'محتوا و تنظیمات لندینگ (footer_config)', description: 'جدول اطلاعات درباره ما، راهنما، تماس و فوتر (Supabase Cloud)', icon: 'Layers', primaryKey: 'single' }
    ];
  }

  static async fetchTableDirectFromSupabase(tableId: string): Promise<any[]> {
    try {
      switch (tableId) {
        case 'profiles': {
          const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
          if (!error && data) {
            memoryCache[KEYS.PROFILES] = data;
            return data;
          }
          break;
        }
        case 'shops': {
          const { data, error } = await supabase.from('shops').select('*').order('created_at', { ascending: false });
          if (!error && data) {
            memoryCache[KEYS.SHOPS] = data;
            return data;
          }
          break;
        }
        case 'queue_items': {
          const { data, error } = await supabase.from('queue_items').select('*').order('joined_at', { ascending: false });
          if (!error && data) {
            memoryCache[KEYS.QUEUE_ITEMS] = data;
            return data;
          }
          break;
        }
        case 'marketers': {
          const { data, error } = await supabase.from('marketers').select('*').order('created_at', { ascending: false });
          if (!error && data) {
            memoryCache[KEYS.MARKETERS] = data;
            return data;
          }
          break;
        }
        case 'service_categories': {
          const { data, error } = await supabase.from('service_categories').select('*').order('created_at', { ascending: true });
          if (!error && data) {
            return data;
          }
          break;
        }
        case 'service_subcategories': {
          const { data, error } = await supabase.from('service_subcategories').select('*').order('created_at', { ascending: true });
          if (!error && data) {
            return data;
          }
          break;
        }
        case 'feature_flags': {
          const { data, error } = await supabase.from('feature_flags').select('*').order('key', { ascending: true });
          if (!error && data) {
            memoryCache[KEYS.FEATURE_FLAGS] = data;
            return data;
          }
          break;
        }
        case 'system_integrations': {
          const { data, error } = await supabase.from('system_settings').select('*').eq('key', 'system_integrations').maybeSingle();
          if (!error && data && data.value) {
            memoryCache[KEYS.SYSTEM_INTEGRATIONS] = data.value;
            return [data.value];
          }
          break;
        }
        case 'payment_settings': {
          const { data, error } = await supabase.from('system_settings').select('*').eq('key', 'payment_settings').maybeSingle();
          if (!error && data && data.value) {
            memoryCache[KEYS.PAYMENT_SETTINGS] = data.value;
            return [data.value];
          }
          break;
        }
        case 'footer_config': {
          const { data, error } = await supabase.from('system_settings').select('*').eq('key', 'footer_config').maybeSingle();
          if (!error && data && data.value) {
            memoryCache[KEYS.FOOTER_CONFIG] = data.value;
            return [data.value];
          }
          break;
        }
        case 'audit_logs': {
          const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
          if (!error && data) {
            memoryCache[KEYS.AUDIT_LOGS] = data;
            return data;
          }
          break;
        }
        case 'bot_dynamic_texts': {
          const { data, error } = await supabase.from('bot_dynamic_texts').select('*').order('created_at', { ascending: true });
          if (!error && data) {
            return data;
          }
          break;
        }
        case 'favorites': {
          const { data, error } = await supabase.from('customer_favorites').select('*').order('created_at', { ascending: false });
          if (!error && data) {
            memoryCache[KEYS.FAVORITES] = data;
            return data;
          }
          break;
        }
        case 'print_templates': {
          const templates = getItem<Record<string, PrintTemplate>>(KEYS.PRINT_TEMPLATES, {});
          return Object.values(templates);
        }
      }
    } catch (err) {
      console.error(`Error querying table ${tableId} from Supabase:`, err);
    }
    // Fallback to local memory cache
    return this.getTableRows(tableId);
  }

  static async fetchTableRowsBySource(tableId: string, source: 'supabase' | 'local'): Promise<any[]> {
    if (source === 'local') {
      return this.getTableRows(tableId);
    }
    return this.fetchTableDirectFromSupabase(tableId);
  }

  static getTableRows(tableId: string): any[] {
    switch (tableId) {
      case 'profiles':
        return this.getProfiles();
      case 'shops':
        return this.getShops();
      case 'queue_items':
        return this.getQueueItems();
      case 'marketers':
        return this.getMarketers();
      case 'service_categories':
        return this.getCategories();
      case 'service_subcategories':
        return getItem<any[]>('bisaf_subcategories', []);
      case 'feature_flags':
        return this.getFeatureFlags();
      case 'system_integrations':
        return [this.getSystemIntegrations()];
      case 'payment_settings':
        return [this.getPaymentSettings()];
      case 'audit_logs':
        return this.getAuditLogs();
      case 'bot_dynamic_texts':
        return getItem<any[]>('bisaf_bot_dynamic_texts', []);
      case 'print_templates': {
        const templates = getItem<Record<string, PrintTemplate>>(KEYS.PRINT_TEMPLATES, {});
        return Object.values(templates);
      }
      case 'footer_config':
        return [this.getFooterConfig()];
      case 'favorites':
        return getItem<CustomerFavorite[]>(KEYS.FAVORITES, []);
      default:
        return getItem<any[]>(`bisaf_${tableId}`, []);
    }
  }

  static setTableRows(tableId: string, rows: any[]): void {
    switch (tableId) {
      case 'profiles':
        setItem(KEYS.PROFILES, rows);
        break;
      case 'shops':
        setItem(KEYS.SHOPS, rows);
        break;
      case 'queue_items':
        setItem(KEYS.QUEUE_ITEMS, rows);
        break;
      case 'marketers':
        setItem(KEYS.MARKETERS, rows);
        break;
      case 'service_categories':
        setItem(KEYS.SERVICE_CATEGORIES, rows);
        break;
      case 'service_subcategories':
        setItem('bisaf_subcategories', rows);
        break;
      case 'feature_flags':
        setItem(KEYS.FEATURE_FLAGS, rows);
        break;
      case 'system_integrations':
        setItem(KEYS.SYSTEM_INTEGRATIONS, rows[0] || DEFAULT_SYSTEM_INTEGRATIONS);
        break;
      case 'payment_settings':
        setItem(KEYS.PAYMENT_SETTINGS, rows[0] || DEFAULT_PAYMENT_SETTINGS);
        break;
      case 'audit_logs':
        setItem(KEYS.AUDIT_LOGS, rows);
        break;
      case 'bot_dynamic_texts':
        setItem('bisaf_bot_dynamic_texts', rows);
        break;
      case 'print_templates': {
        const dict: Record<string, PrintTemplate> = {};
        for (const r of rows) {
          if (r && r.shop_id) {
            dict[r.shop_id] = r;
          }
        }
        setItem(KEYS.PRINT_TEMPLATES, dict);
        break;
      }
      case 'footer_config':
        setItem(KEYS.FOOTER_CONFIG, rows[0] || DEFAULT_FOOTER_CONFIG);
        break;
      case 'favorites':
        setItem(KEYS.FAVORITES, rows);
        break;
      default:
        setItem(`bisaf_${tableId}`, rows);
        break;
    }

    this.addAuditLog({
      action: `ویرایش دستی ردیف‌های جدول دیتابیس: ${tableId}`,
      target_type: `table_${tableId}`,
      target_id: tableId
    });
  }

  static async updateTableRow(tableId: string, rowId: string, updatedFields: Record<string, any>): Promise<boolean> {
    const rows = this.getTableRows(tableId);
    if (tableId === 'system_integrations' || tableId === 'payment_settings' || tableId === 'footer_config') {
      const merged = { ...rows[0], ...updatedFields };
      this.setTableRows(tableId, [merged]);
      if (tableId === 'system_integrations') this.saveSystemIntegrations(merged);
      if (tableId === 'payment_settings') this.savePaymentSettings(merged);
      if (tableId === 'footer_config') this.saveFooterConfig(merged);
      return true;
    }

    const idx = rows.findIndex((r: any) => (r.id === rowId) || (r.shop_id === rowId) || (r.key === rowId));
    if (idx >= 0) {
      const updatedRow = { ...rows[idx], ...updatedFields, updated_at: new Date().toISOString() };
      rows[idx] = updatedRow;
      this.setTableRows(tableId, rows);
      
      // Update directly in Supabase Cloud PostgreSQL
      try {
        if (tableId === 'profiles') await supabase.from('profiles').upsert(updatedRow);
        else if (tableId === 'shops') await supabase.from('shops').upsert(updatedRow);
        else if (tableId === 'queue_items') await supabase.from('queue_items').upsert(updatedRow);
        else if (tableId === 'feature_flags') await supabase.from('feature_flags').upsert(updatedRow);
        else if (tableId === 'marketers') await supabase.from('marketers').upsert(updatedRow);
        else if (tableId === 'service_categories') await supabase.from('service_categories').upsert(updatedRow);
        else if (tableId === 'service_subcategories') await supabase.from('service_subcategories').upsert(updatedRow);
        else if (tableId === 'bot_dynamic_texts') await supabase.from('bot_dynamic_texts').upsert(updatedRow);
        else if (tableId === 'favorites') await supabase.from('customer_favorites').upsert(updatedRow);
      } catch (err) {
        console.error(`Supabase update error on ${tableId}:`, err);
      }
      return true;
    }
    return false;
  }

  static async insertTableRow(tableId: string, newRow: Record<string, any>): Promise<boolean> {
    const rows = this.getTableRows(tableId);
    const idField = newRow.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const rowToInsert = {
      ...newRow,
      id: idField,
      created_at: newRow.created_at || new Date().toISOString()
    };
    rows.unshift(rowToInsert);
    this.setTableRows(tableId, rows);

    // Insert directly into Supabase Cloud PostgreSQL
    try {
      if (tableId === 'profiles') await supabase.from('profiles').insert(rowToInsert);
      else if (tableId === 'shops') await supabase.from('shops').insert(rowToInsert);
      else if (tableId === 'queue_items') await supabase.from('queue_items').insert(rowToInsert);
      else if (tableId === 'feature_flags') await supabase.from('feature_flags').insert(rowToInsert);
      else if (tableId === 'marketers') await supabase.from('marketers').insert(rowToInsert);
      else if (tableId === 'service_categories') await supabase.from('service_categories').insert(rowToInsert);
      else if (tableId === 'service_subcategories') await supabase.from('service_subcategories').insert(rowToInsert);
      else if (tableId === 'bot_dynamic_texts') await supabase.from('bot_dynamic_texts').insert(rowToInsert);
      else if (tableId === 'favorites') await supabase.from('customer_favorites').insert(rowToInsert);
    } catch (err) {
      console.error(`Supabase insert error on ${tableId}:`, err);
    }
    return true;
  }

  static async deleteTableRow(tableId: string, rowId: string): Promise<boolean> {
    const rows = this.getTableRows(tableId);
    const filtered = rows.filter((r: any) => (r.id !== rowId) && (r.shop_id !== rowId) && (r.key !== rowId));
    if (filtered.length !== rows.length) {
      this.setTableRows(tableId, filtered);
      
      // Delete directly from Supabase Cloud PostgreSQL
      try {
        if (tableId === 'profiles') await supabase.from('profiles').delete().eq('id', rowId);
        else if (tableId === 'shops') await supabase.from('shops').delete().eq('id', rowId);
        else if (tableId === 'marketers') await supabase.from('marketers').delete().eq('id', rowId);
        else if (tableId === 'queue_items') await supabase.from('queue_items').delete().eq('id', rowId);
        else if (tableId === 'feature_flags') await supabase.from('feature_flags').delete().eq('key', rowId);
        else if (tableId === 'service_categories') await supabase.from('service_categories').delete().eq('id', rowId);
        else if (tableId === 'service_subcategories') await supabase.from('service_subcategories').delete().eq('id', rowId);
        else if (tableId === 'bot_dynamic_texts') await supabase.from('bot_dynamic_texts').delete().eq('id', rowId);
        else if (tableId === 'favorites') await supabase.from('customer_favorites').delete().eq('id', rowId);
      } catch (err) {
        console.error(`Supabase delete error on ${tableId}:`, err);
      }
      return true;
    }
    return false;
  }

  static async resetTableToDefault(tableId: string): Promise<any[]> {
    await initStorageFromSupabase();
    return await this.fetchTableDirectFromSupabase(tableId);
  }

  static async resetToTestData(): Promise<void> {
    await initStorageFromSupabase();
    this.addAuditLog({
      action: 'بازخوانی کامل داده‌های سیستم از دیتابیس ابری سوپابیس',
      target_type: 'system',
      target_id: 'sync_supabase'
    });
  }

  static async clearAllQueueData(): Promise<void> {
    setItem(KEYS.QUEUE_ITEMS, []);
    await supabase.from('queue_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    this.addAuditLog({
      action: 'حذف کامل تمامی نوبت‌های ثبت‌شده از دیتابیس ابری',
      target_type: 'queue',
      target_id: 'clear'
    });
  }

  static async clearAllDataCompletely(): Promise<void> {
    setItem(KEYS.QUEUE_ITEMS, []);
    setItem(KEYS.SHOPS, []);
    await supabase.from('queue_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('shops').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    this.addAuditLog({
      action: 'پاکسازی نوبت‌ها و فروشگاه‌ها در دیتابیس ابری',
      target_type: 'system',
      target_id: 'wipe'
    });
  }

  // --- DYNAMIC TEXTS ---
  static getDynamicTexts(): Record<string, string> {
    return getItem(KEYS.DYNAMIC_TEXTS, {});
  }
  
  static getDynamicText(key: string, defaultValue: string): string {
    const texts = this.getDynamicTexts();
    return texts[key] !== undefined ? texts[key] : defaultValue;
  }

  static saveDynamicText(key: string, value: string): void {
    const texts = this.getDynamicTexts();
    texts[key] = value;
    setItem(KEYS.DYNAMIC_TEXTS, texts);
    
    // Trigger re-render across tabs
    window.dispatchEvent(new Event('local-storage'));
  }
}
