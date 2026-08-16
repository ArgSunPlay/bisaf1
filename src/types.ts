export type UserRole = 'customer' | 'shopkeeper' | 'marketer' | 'admin';

export interface Profile {
  id: string;
  user_id?: string;
  phone: string;
  username?: string;
  password?: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserBotSettings {
  id: string;
  user_id: string;
  role: UserRole;
  bot_reports_enabled: boolean;
  sms_fallback_enabled: boolean;
  allow_shopkeeper_bot_actions: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price?: number;
  is_active?: boolean;
}

export interface DynamicText {
  id: string; // The key used in code
  value: string; // The text content
  description?: string; // Where it is used
}

export interface BannerItem {
  id: string;
  title: string;
  image_url: string;
  target_url?: string;
  is_active: boolean;
  created_at: string;
  description?: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  owner_id?: string;
  marketer_id?: string;
  created_at: string;
  updated_at?: string;
  
  // Interleaving tracking
  single_count?: number;
  multi_count?: number;
  last_served_type?: TicketType | null;

  waiting_count?: number;
  current_serving?: number;
  estimated_wait_minutes?: number;
  product_items?: ProductItem[];

  // Clickable Promotional Banner
  banner_id?: string;
  banner_image_url?: string;
  banner_target_url?: string;
  banner_title?: string;
  banner_active?: boolean;

  // Custom Action Button Labels (Adaptive by store type)
  serve_button_label?: string;
  single_button_label?: string;
  multi_button_label?: string;

  // Custom Action Button Color Schemes
  serve_button_color?: string;
  single_button_color?: string;
  multi_button_color?: string;

  // Thermal Receipt POS Printer Feature Flag
  thermal_printer_enabled?: boolean;

  // Security / Operator Password Protection
  require_operator_password?: boolean;
  operator_password?: string;
  has_dynamic_menu?: boolean; // Toggle for advanced restaurant/product features
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  slug: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  subcategories: ServiceSubcategory[];
}

export interface ShopSettings {
  id: string;
  shop_id: string;
  max_daily_tickets: number;
  opening_time: string;
  closing_time: string;
  single_count_label: string;
  multi_count_label: string;
}

export interface QueueConfig {
  id: string;
  shop_id: string;
  auto_call_next: boolean;
  interleaving_enabled: boolean;
  allow_online_booking: boolean;
}

export type TicketType = 'in_person_single' | 'in_person_multi' | 'online';
export type TicketStatus = 'waiting' | 'calling' | 'serving' | 'served' | 'cancelled' | 'paused';

export interface OrderedProductItem {
  name: string;
  quantity: number;
}

export interface QueueItem {
  id: string;
  shop_id: string;
  ticket_number: number;
  customer_user_id?: string;
  customer_name?: string;
  customer_phone?: string;
  ticket_type: TicketType;
  quantity: number;
  ordered_items?: OrderedProductItem[];
  items_summary?: string;
  status: TicketStatus;
  position: number;
  threshold: number;
  joined_at: string;
  called_at?: string;
  served_at?: string;
  cancelled_at?: string;
  wait_duration_seconds?: number;
  estimated_wait_minutes?: number;
  created_at: string;
}

export interface QueueDailyStats {
  id: string;
  shop_id: string;
  date: string;
  total_tickets: number;
  served_count: number;
  cancelled_count: number;
  avg_wait_time_minutes: number;
}

export interface CustomerFavorite {
  id: string;
  user_id: string;
  shop_id: string;
  shop?: Shop;
  created_at: string;
}

export interface CustomerNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface BotProvider {
  id: string;
  name: 'telegram' | 'bale' | 'eitaa' | 'rubika' | 'whatsapp';
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface BotAccount {
  id: string;
  provider: string;
  user_id: string;
  chat_id: string;
  bot_username?: string;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  telegram_enabled: boolean;
  bale_enabled: boolean;
  eitaa_enabled: boolean;
  rubika_enabled: boolean;
  whatsapp_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
}

export interface SMSLog {
  id: string;
  recipient_phone: string;
  message: string;
  provider: string;
  status: string;
  created_at: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  provider_type: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface SystemIntegrationsConfig {
  supabase_url?: string;
  supabase_anon_key?: string;
  supabase_enabled?: boolean;
  telegram_token: string;
  telegram_username: string;
  telegram_enabled: boolean;
  bale_token: string;
  bale_username: string;
  bale_enabled: boolean;
  eitaa_token: string;
  eitaa_username: string;
  eitaa_enabled: boolean;
  rubika_token: string;
  rubika_username: string;
  rubika_enabled: boolean;
  whatsapp_token: string;
  whatsapp_instance: string;
  whatsapp_enabled: boolean;
  neshan_key: string;
  neshan_enabled?: boolean;
  kavenegar_key: string;
  melipayamak_key: string;
  ghasedak_key: string;
  farazsms_key: string;
  sms_provider: 'kavenegar' | 'melipayamak' | 'ghasedak' | 'farazsms';
  sms_sender_line: string;
  sms_enabled?: boolean;
}

export interface PaymentGatewaySettings {
  enabled: boolean;
  default_gateway: 'zarinpal' | 'idpay' | 'nextpay';
  currency: 'IRR' | 'IRT';
  zarinpal_merchant_id: string;
  zarinpal_sandbox: boolean;
  zarinpal_callback_url: string;
  idpay_api_key: string;
  idpay_sandbox: boolean;
  idpay_callback_url: string;
  nextpay_api_key: string;
  nextpay_callback_url: string;
}

export interface PaymentOrder {
  id: string;
  user_id?: string;
  shop_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'initiated' | 'authorized' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  provider: string;
  authority?: string;
  reference?: string;
  description?: string;
  created_at: string;
  expires_at?: string;
}

export interface PaymentTransaction {
  id: string;
  order_id: string;
  provider: string;
  transaction_id?: string;
  status: string;
  amount: number;
  verified_at?: string;
  created_at: string;
}

export interface Marketer {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  province?: string;
  city?: string;
  national_id?: string;
  sheba_number?: string;
  bank_name?: string;
  experience_description?: string;
  commission_rate: number;
  status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  approved_by?: string;
  profile?: Profile;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  code: string;
  status: string;
  reward_amount: number;
  created_at: string;
}

export interface MarketerSettlement {
  id: string;
  marketer_id: string;
  amount: number;
  status: string;
  paid_at?: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_name: string;
  user_id?: string;
  shop_id?: string;
  queue_item_id?: string;
  provider?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AudioTrack {
  id: string;
  shop_id?: string;
  title: string;
  artist?: string;
  file_url: string;
  is_active: boolean;
}

export interface RadioStation {
  id: string;
  name: string;
  stream_url: string;
  genre: string;
  is_active: boolean;
}

export interface PrintTemplate {
  id: string;
  shop_id: string;
  template_name: string;
  header_text: string;
  footer_text: string;
  logo_url?: string;
  font_family: string;
  font_size: number;
}

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description?: string;
}

export interface AuditLog {
  id: string;
  actor_user_id?: string;
  action: string;
  target_type?: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface LandingFooterConfig {
  aboutBtnText: string;
  helpBtnText: string;
  supportBtnText: string;
  loginBtnText: string;
  copyrightText: string;
  aboutTitle: string;
  aboutText: string;
  helpTitle: string;
  helpStep1: string;
  helpStep2: string;
  helpStep3: string;
  supportTitle: string;
  supportDesc: string;
  supportPhone: string;
  supportMessengers: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
}
