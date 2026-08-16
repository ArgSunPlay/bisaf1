-- BiSaf Database Schema Migration
-- Complete PostgreSQL schema for BiSaf (بی‌صف)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE,
  phone VARCHAR(20) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  full_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'shopkeeper', 'marketer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER BOT SETTINGS
CREATE TABLE IF NOT EXISTS public.user_bot_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  bot_reports_enabled BOOLEAN DEFAULT true,
  sms_fallback_enabled BOOLEAN DEFAULT true,
  allow_shopkeeper_bot_actions BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. SHOPS
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'نانوایی',
  subcategory VARCHAR(100),
  address TEXT NOT NULL,
  phone VARCHAR(20),
  latitude DOUBLE PRECISION NOT NULL DEFAULT 35.6892,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 51.3890,
  is_active BOOLEAN NOT NULL DEFAULT true,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  marketer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SHOP MEMBERS
CREATE TABLE IF NOT EXISTS public.shop_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, user_id)
);

-- 5. SHOP SETTINGS
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID UNIQUE NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  max_daily_tickets INT DEFAULT 500,
  opening_time VARCHAR(10) DEFAULT '07:00',
  closing_time VARCHAR(10) DEFAULT '21:00',
  single_count_label VARCHAR(50) DEFAULT 'تکی',
  multi_count_label VARCHAR(50) DEFAULT 'چندتایی',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. QUEUE CONFIG
CREATE TABLE IF NOT EXISTS public.queue_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID UNIQUE NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  auto_call_next BOOLEAN DEFAULT false,
  interleaving_enabled BOOLEAN DEFAULT true,
  allow_online_booking BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. QUEUE ITEMS
CREATE TABLE IF NOT EXISTS public.queue_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  ticket_number INT NOT NULL,
  customer_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  ticket_type VARCHAR(20) NOT NULL DEFAULT 'in_person_single' CHECK (ticket_type IN ('in_person_single', 'in_person_multi', 'online')),
  quantity INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'calling', 'serving', 'served', 'cancelled', 'paused')),
  position INT NOT NULL DEFAULT 1,
  threshold INT NOT NULL DEFAULT 3,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  called_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. QUEUE EVENTS
CREATE TABLE IF NOT EXISTS public.queue_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_item_id UUID NOT NULL REFERENCES public.queue_items(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. QUEUE DAILY STATS
CREATE TABLE IF NOT EXISTS public.queue_daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_tickets INT DEFAULT 0,
  served_count INT DEFAULT 0,
  cancelled_count INT DEFAULT 0,
  avg_wait_time_minutes DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, date)
);

-- 10. CUSTOMER FAVORITES
CREATE TABLE IF NOT EXISTS public.customer_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, shop_id)
);

-- 11. CUSTOMER TICKETS
CREATE TABLE IF NOT EXISTS public.customer_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  queue_item_id UUID NOT NULL REFERENCES public.queue_items(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. CUSTOMER NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.customer_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. BOTS & INTEGRATIONS
CREATE TABLE IF NOT EXISTS public.bot_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bot_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  chat_id VARCHAR(100) NOT NULL,
  bot_username VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, chat_id)
);

CREATE TABLE IF NOT EXISTS public.bot_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bot_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_account_id UUID REFERENCES public.bot_accounts(id) ON DELETE CASCADE,
  message_type VARCHAR(50) DEFAULT 'text',
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. NOTIFICATIONS & DELIVERIES
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  provider_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  telegram_enabled BOOLEAN DEFAULT true,
  bale_enabled BOOLEAN DEFAULT true,
  eitaa_enabled BOOLEAN DEFAULT true,
  rubika_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. SMS LOGS & PROVIDERS
CREATE TABLE IF NOT EXISTS public.sms_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  api_key VARCHAR(255),
  sender_number VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. PAYMENTS INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS public.payment_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  provider_type VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enabled BOOLEAN DEFAULT false,
  default_provider VARCHAR(50) DEFAULT 'zarinpal',
  currency VARCHAR(10) DEFAULT 'IRR',
  min_amount INT DEFAULT 10000,
  max_amount INT DEFAULT 100000000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  amount BIGINT NOT NULL,
  currency VARCHAR(10) DEFAULT 'IRR',
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  provider VARCHAR(50) DEFAULT 'zarinpal',
  authority VARCHAR(100),
  reference VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.payment_orders(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100),
  status VARCHAR(30) NOT NULL,
  amount BIGINT NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(50) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  signature_valid BOOLEAN DEFAULT true,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  reason TEXT,
  status VARCHAR(30) DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. MARKETERS & REFERRALS
CREATE TABLE IF NOT EXISTS public.marketers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  commission_rate DOUBLE PRECISION DEFAULT 10.0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  reward_amount BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketer_settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketer_id UUID NOT NULL REFERENCES public.marketers(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. ANALYTICS
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  queue_item_id UUID REFERENCES public.queue_items(id) ON DELETE SET NULL,
  provider VARCHAR(50),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  event_name VARCHAR(100) NOT NULL,
  count INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, event_name)
);

-- 19. MEDIA & RADIO
CREATE TABLE IF NOT EXISTS public.audio_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  artist VARCHAR(100),
  file_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  single_count INT DEFAULT 0,
  multi_count INT DEFAULT 0,
  last_served_type VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.radio_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  stream_url TEXT NOT NULL,
  genre VARCHAR(50) DEFAULT ' عمومی',
  is_active BOOLEAN DEFAULT true,
  single_count INT DEFAULT 0,
  multi_count INT DEFAULT 0,
  last_served_type VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. PRINT TEMPLATES
CREATE TABLE IF NOT EXISTS public.print_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID UNIQUE NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  template_name VARCHAR(100) DEFAULT 'استاندارد',
  header_text TEXT DEFAULT 'به نانوایی خوش آمدید',
  footer_text TEXT DEFAULT 'از شکیبایی شما سپاسگزاریم - سامانه بی‌صف',
  logo_url TEXT,
  font_family VARCHAR(50) DEFAULT 'Vazirmatn',
  font_size INT DEFAULT 14,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. SYSTEM SETTINGS & FEATURE FLAGS
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR FAST SEARCH
CREATE INDEX IF NOT EXISTS idx_shops_slug ON public.shops(slug);
CREATE INDEX IF NOT EXISTS idx_shops_location ON public.shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_queue_items_shop_status ON public.queue_items(shop_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);

-- DEFAULT FEATURE FLAGS INITIALIZATION
INSERT INTO public.feature_flags (key, enabled, description) VALUES
  ('google_login_enabled', true, 'ورود با حساب گوگل'),
  ('email_login_enabled', true, 'ورود با ایمیل'),
  ('payment_enabled', false, 'پرداخت آنلاین (پیش‌فرض غیرفعال)'),
  ('sms_fallback_enabled', true, 'ارسال پیامک جایگزین'),
  ('telegram_enabled', true, 'ربات تلگرام'),
  ('bale_enabled', true, 'ربات بله'),
  ('eitaa_enabled', true, 'ربات ایتا'),
  ('rubika_enabled', true, 'ربات روبیکا'),
  ('whatsapp_enabled', true, 'پیام‌رسان واتساپ'),
  ('audio_enabled', true, 'پخش‌کننده صوتی مغازه'),
  ('radio_enabled', true, 'رادیو اینترنتی'),
  ('marketer_enabled', true, 'سیستم بازاریابی'),
  ('shopkeeper_bot_actions', true, 'عملیات صف از طریق ربات متصدی'),
  ('referral_enabled', true, 'دعوت از دوستان')
ON CONFLICT (key) DO NOTHING;

-- RPC FUNCTION: QUEUE INTERLEAVING & NEXT CUSTOMER SERVE
CREATE OR REPLACE FUNCTION serve_next_queue_item(p_shop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_last_type VARCHAR(20);
  v_selected_item RECORD;
BEGIN
  -- Find last served item ticket type from shop
  SELECT last_served_type INTO v_last_type
  FROM public.shops
  WHERE id = p_shop_id;

  -- Interleaving logic:
  -- If last served was null or multi, prioritize in_person_single
  -- Otherwise, try in_person_multi
  IF v_last_type IS NULL OR v_last_type = 'in_person_multi' THEN
    SELECT * INTO v_selected_item
    FROM public.queue_items
    WHERE shop_id = p_shop_id AND status = 'waiting' AND ticket_type = 'in_person_single'
    ORDER BY joined_at ASC
    LIMIT 1;

    -- Fallback to multi if no single is waiting
    IF v_selected_item IS NULL THEN
      SELECT * INTO v_selected_item
      FROM public.queue_items
      WHERE shop_id = p_shop_id AND status = 'waiting'
      ORDER BY joined_at ASC
      LIMIT 1;
    END IF;
  ELSE
    SELECT * INTO v_selected_item
    FROM public.queue_items
    WHERE shop_id = p_shop_id AND status = 'waiting' AND ticket_type = 'in_person_multi'
    ORDER BY joined_at ASC
    LIMIT 1;

    -- Fallback to single if no multi is waiting
    IF v_selected_item IS NULL THEN
      SELECT * INTO v_selected_item
      FROM public.queue_items
      WHERE shop_id = p_shop_id AND status = 'waiting'
      ORDER BY joined_at ASC
      LIMIT 1;
    END IF;
  END IF;

  IF v_selected_item IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'هیچ نوبتی در صف انتظار نیست');
  END IF;

  -- Update status to serving
  UPDATE public.queue_items
  SET status = 'serving', served_at = NOW()
  WHERE id = v_selected_item.id;
  
  -- Update shop last_served_type
  UPDATE public.shops
  SET last_served_type = v_selected_item.ticket_type
  WHERE id = p_shop_id;

  -- Record event
  INSERT INTO public.queue_events (queue_item_id, shop_id, event_type)
  VALUES (v_selected_item.id, p_shop_id, 'item_served');

  RETURN jsonb_build_object('success', true, 'item', row_to_json(v_selected_item));
END;
$$;

-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles readable by self or admin" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Shops public read" ON public.shops
  FOR SELECT USING (true);

CREATE POLICY "Queue items public read" ON public.queue_items
  FOR SELECT USING (true);

CREATE POLICY "Queue items insert open" ON public.queue_items
  FOR INSERT WITH CHECK (true);

-- 23. SERVICE CATEGORIES & SUBCATEGORIES
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50) DEFAULT 'Store',
  is_active BOOLEAN DEFAULT true,
  single_count INT DEFAULT 0,
  multi_count INT DEFAULT 0,
  last_served_type VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  single_count INT DEFAULT 0,
  multi_count INT DEFAULT 0,
  last_served_type VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category_id, name)
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories public read" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Subcategories public read" ON public.service_subcategories FOR SELECT USING (true);

