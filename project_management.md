# project_management.md — BiSaf (بی‌صف) Architecture & Element Map

## 📌 1. Project Overview & Existing Documentation Integration
- **Name**: BiSaf (بی‌صف) — Smart Mobile-First Queue & Ticket Management System
- **Framework**: React 18 (Vite) + TypeScript + Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL + RLS + Client SDK) + LocalStorage Sync & Fallback
- **PWA Capabilities**: Service Worker (`public/sw.js`), Web Manifest, Offline Shell Support
- **Messaging & Bots**: Multi-bot core (Telegram, Bale, Eitaa, Rubika, WhatsApp) + SMS Fallback (Kavenegar, Melipayamak)
- **Existing Docs**: `README.md` (High-level introduction), `.env.example` (Environment variables template), `supabase/migrations/20260808000000_bisaf_schema.sql` (PostgreSQL schema & RLS policies). All architecture details are consolidated here as the single index-like reference map.

---

## 🗺️ 2. Functional Element Registry Map

Format: `ID | Path | Purpose | Input | Output | State | Dependencies`

### 2.1 Application Core & Infrastructure
| ID | Path | Purpose | Input | Output | State | Dependencies |
|---|---|---|---|---|---|---|
| `MAIN_ENTRY` | `/src/main.tsx` | App bootstrapper, DOM root renderer, ServiceWorker registration | Browser DOM | React Tree | Runtime Init | `react`, `react-dom`, `./App.tsx` |
| `APP_ROOT` | `/src/App.tsx` | Router container (`BrowserRouter`), dark/light theme state, Nav wrapper | Window location | JSX View | `isDark`, `currentUser` | `react-router-dom`, `COMP_NAVBAR`, `COMP_BOTTOM_NAV`, `SRV_STORAGE` |
| `TYPES_DEF` | `/src/types.ts` | Shared TypeScript interfaces, types, system integration toggles, and domain models | N/A | Type Definitions | N/A | None |
| `VITE_CONFIG` | `/vite.config.ts` | Vite config, Tailwind plugin, server middleware `/api/save-env` | HTTP POST `/api/save-env` | File `.env` write | Server middleware | `@vitejs/plugin-react`, `@tailwindcss/vite`, `fs`, `path` |
| `DB_MIGRATION_SCHEMA` | `/supabase/migrations/20260808000000_bisaf_schema.sql` | PostgreSQL schema, tables, triggers, indexes & RLS policies | SQL DDL | DB Tables | Schema State | PostgreSQL, Supabase |
| `DB_BOT_SCHEMA` | `/supabase/migrations/20260810100000_bot_tables.sql` | Bot mappings and dynamic texts for webhook handlers | SQL DDL | DB Tables | Schema State | PostgreSQL, Supabase |

### 2.2 Pages / Views
| ID | Path | Purpose | Input | Output | State | Dependencies |
|---|---|---|---|---|---|---|
| `PAGE_LANDING` | `/src/pages/LandingPage.tsx` | Landing page, feature highlights, shop registration CTA | User Clicks | Landing UI | Modal toggle | `lucide-react`, `react-router-dom`, `COMP_REGISTRATION_CONVERSION_MODAL` |
| `PAGE_LOGIN` | `/src/pages/LoginPage.tsx` | Auth page (Unified Standard Iranian Flow: Promotes Bot Registration as primary CTA, followed by unified Mobile OTP & Password login/register) | Auth Credentials | User Session | `loginMethod`, `identifier`, `password`, `otpCode` | `lucide-react`, `react-router-dom`, `SRV_STORAGE`, `SRV_AUTH`, `SRV_BOTS` |
| `PAGE_REGISTER` | `/src/pages/RegisterPage.tsx` | New user registration with standard mobile and password fields, redirecting by role | User Details | Registered Profile | `formData`, `loading` | `lucide-react`, `react-router-dom`, `SRV_AUTH`, `SRV_STORAGE` |
| `PAGE_MARKETER_REGISTER` | `/src/pages/MarketerRegisterPage.tsx` | Dedicated marketer registration providing instructions and capturing identity (Bank, National ID) | Form Fields | Marketer Profile | `formData`, `isSuccess` | `lucide-react`, `react-router-dom`, `SRV_AUTH`, `SRV_STORAGE` |
| `DOC_BLUEPRINT` | `/پروژه_بی‌صف.md` | Comprehensive reverse-engineered project documentation and blueprint for AI agents | N/A | Markdown Blueprint | N/A | None |
| `PAGE_CUSTOMER_DASHBOARD` | `/src/pages/CustomerDashboardPage.tsx` | Customer dashboard: shop map (Leaflet / Neshan), my active tickets, wait times | User Location, Query | Interactive Map & Ticket Cards | `activeTickets`, `shops`, `searchQuery` | `lucide-react`, `leaflet`, `react-router-dom`, `SRV_STORAGE`, `SRV_QUEUE_ENGINE`, `UTIL_JALALI` |
| `PAGE_PUBLIC_SHOP` | `/src/pages/PublicShopPage.tsx` | Public online ticket booking page for shop, dynamic bread/product selection dropdowns (1-20), interleaving single/multi options, PDF download | `shopSlug` parameter | Issued Ticket / PDF | `shop`, `itemQuantities`, `threshold`, `activeTicket` | `lucide-react`, `jspdf`, `qrcode`, `SRV_STORAGE`, `SRV_QUEUE_ENGINE`, `COMP_REGISTRATION_CONVERSION_MODAL`, `UTIL_JALALI` |
| `PAGE_SHOPKEEPER_PANEL` | `/src/pages/ShopkeeperPanelPage.tsx` | Ergonomic one-handed operator panel: prominent red Serve/Next button at top, in-person ticket creation below, interactive queue list below, operator password gate, settings modal trigger | `shopId` parameter | Serving Ticket, Audio, Saved Products | `shopQueue`, `selectedBreadType`, `customMultiQty`, `isPasswordUnlocked`, `showSettingsModal`, `showQrModal` | `lucide-react`, `react-router-dom`, `SRV_STORAGE`, `SRV_QUEUE_ENGINE`, `COMP_PASSWORD_INPUT`, `COMP_SHOPKEEPER_SETTINGS_MODAL`, `COMP_QR_PRINT_STUDIO`, `UTIL_JALALI` |
| `PAGE_MARKETER` | `/src/pages/MarketerPage.tsx` | Marketer panel: register shops, commission logs, owner password toggle | Marketer Form | New Shop Record | `myShops`, `commissions`, `formData` | `lucide-react`, `SRV_STORAGE`, `COMP_PASSWORD_INPUT`, `UTIL_JALALI` |
| `PAGE_ADMIN` | `/src/pages/AdminPage.tsx` | Super-Admin panel: user management, shop operator password security toggles, Database Studio, feature flags, audit logs, marketer commission config | Admin Forms, Inputs | Updated System Config | `integrations`, `paymentSettings`, `selectedMarketerDetail` | `lucide-react`, `SRV_STORAGE`, `COMP_PASSWORD_INPUT`, `COMP_DATABASE_STUDIO`, `UTIL_ENV_TESTER`, `SRV_ENV_SYNC` |
| `PAGE_DATABASE_STUDIO` | `/src/pages/DatabaseStudioPage.tsx` | Standalone Database Management Studio Page (`/admin/database` and `/database`) | N/A | Full Database Grid | None | `react-router-dom`, `COMP_DATABASE_STUDIO` |
| `PAGE_PRINT` | `/src/pages/PrintPage.tsx` | Thermal receipt print layout & PDF print generator with QR code | `ticketId` parameter | Printable Receipt | `ticket`, `shop` | `lucide-react`, `qrcode`, `SRV_STORAGE`, `UTIL_JALALI` |

### 2.3 Components
| ID | Path | Purpose | Input | Output | State | Dependencies |
|---|---|---|---|---|---|---|
| `COMP_NAVBAR` | `/src/components/Navbar.tsx` | Dynamic role-based navigation bar, small shop name between clock & calendar, dynamic hamburger menu drawer for all user roles | Router Props | Nav Header | `isMenuOpen`, `time`, `activeSettingsShop`, `activeQrShop` | `lucide-react`, `react-router-dom`, `SRV_STORAGE`, `COMP_SHOPKEEPER_SETTINGS_MODAL`, `COMP_QR_PRINT_STUDIO`, `UTIL_JALALI` |
| `COMP_PASSWORD_INPUT` | `/src/components/PasswordInput.tsx` | Standardized password input with eye/eye-off visibility toggle, optional lock icon, and RTL support | Input attributes, `showLockIcon` | Input with Eye Toggle JSX | `showPassword` | `lucide-react` |
| `COMP_SHOPKEEPER_SETTINGS_MODAL` | `/src/components/ShopkeeperSettingsModal.tsx` | Multi-tab modal/drawer for shopkeeper tools: A4/Thermal printing, audio announcer, product items, button label customizations, banner setup, operator password | `shop`, `onClose`, `onOpenQrStudio`, `onSettingsUpdated` | Settings Modal JSX | `activeTab`, form fields, `savedSuccess` | `lucide-react`, `SRV_STORAGE`, `COMP_AUDIO_RADIO_PLAYER`, `COMP_PASSWORD_INPUT`, `UTIL_JALALI` |
| `COMP_BOTTOM_NAV` | `/src/components/BottomNav.tsx` | Mobile fixed bottom menu bar | Router Path | Bottom Navigation | N/A | `lucide-react`, `react-router-dom`, `SRV_STORAGE` |
| `COMP_CLICKABLE_PROMO_BANNER` | `/src/components/ClickablePromoBanner.tsx` | Clickable promotional banner for shops & universal BiSaf registration CTA | `shop?: Shop` | Interactive Banner JSX | N/A | `lucide-react`, `react-router-dom` |
| `COMP_DATABASE_STUDIO` | `/src/components/DatabaseStudio.tsx` | Live Direct Supabase Database Table Inspector & Editor (Realtime Supabase Cloud CRUD with per-table data source selector: Supabase Cloud vs Local Cache, JSON & CSV Export/Import, Live Queries, Pagination, Reset to Defaults) | `onBack?`, `isEmbedded?` | Database Table Grid & Modals | `selectedTableId`, `dbSources`, `rows`, `isLoading`, `tableCounts`, `editingRow`, `newRowData` | `lucide-react`, `SRV_STORAGE`, `UTIL_JALALI` |
| `COMP_REGISTRATION_CONVERSION_MODAL` | `/src/components/RegistrationConversionModal.tsx` | 3-Step contractual registration conversion modal | `isOpen`, `onClose` | Registered Shop | `step`, `agreed`, `credentials` | `lucide-react`, `SRV_STORAGE`, `SRV_AUTH` |
| `COMP_AUDIO_RADIO_PLAYER` | `/src/components/AudioRadioPlayer.tsx` | Audio queue call generator & sound effects | `ticketNumber` | Synthesized Audio | `isPlaying` | `lucide-react` |

### 2.4 Services & Business Logic
| ID | Path | Purpose | Input | Output | State | Dependencies |
|---|---|---|---|---|---|---|
| `SRV_STORAGE` | `/src/services/storage.ts` | Central persistence layer with LocalStorage fallback, seed dataset, and test data management (`resetToTestData`, `clearAllQueueData`, `clearAllDataCompletely`) | Storage Key, Value | Domain Objects | Local Storage Sync | `TYPES_DEF`, `SRV_MOCK_DATA` |
| `SRV_SUPABASE_CLIENT` | `/src/services/supabaseClient.ts` | Supabase SDK client initializer | `VITE_SUPABASE_URL`, `ANON_KEY` | Supabase Client | Connection State | `@supabase/supabase-js` |
| `SRV_QUEUE_ENGINE` | `/src/services/queueService.ts` | Core queue logic, interleaving algorithm, wait time calculation | Ticket Params, `shopId` | `QueueItem`, Queue Status | Queue Collections | `TYPES_DEF`, `SRV_STORAGE`, `SRV_SUPABASE_CLIENT`, `SRV_ANALYTICS` |
| `SRV_AUTH` | `/src/services/authService.ts` | User login, registration, password verification, profile management | Phone/Username, Password | `Profile`, Auth Token | User Session | `TYPES_DEF`, `SRV_STORAGE`, `SRV_SUPABASE_CLIENT` |
| `SRV_BOTS` | `/src/services/botService.ts` | Multi-bot dispatcher (Telegram, Bale, Eitaa, Rubika, WhatsApp) | Bot Token, Message | API Response | Bot Config | `TYPES_DEF`, `SRV_STORAGE` |
| `SRV_PAYMENT` | `/src/services/paymentService.ts` | Payment gateway interface (ZarinPal, IDPay) | Amount, Callback URL | Gateway Redirect URL | Payment Config | `TYPES_DEF`, `SRV_STORAGE` |
| `SRV_NOTIFICATIONS` | `/src/services/notificationService.ts` | Customer queue alerts, in-app notifications, SMS fallback | `QueueItem`, Threshold | Alert Sent Status | Alert Logs | `TYPES_DEF`, `SRV_STORAGE`, `SRV_BOTS` |
| `SRV_ANALYTICS` | `/src/services/analyticsService.ts` | Queue analytics & daily stats accumulator | Event Name, Payload | Tracked Event Log | Analytics Records | `TYPES_DEF`, `SRV_STORAGE` |
| `SRV_ENV_SYNC` | `/src/services/envService.ts` | Backend `.env` sync service via `/api/save-env` | Record of env key-values | Success / Failure | HTTP Request | Browser `fetch` API |
| `SRV_MOCK_DATA` | `/src/services/mockData.ts` | Seed dataset for shops, categories, queue items | N/A | Initial Objects | N/A | `TYPES_DEF` |

### 2.5 Utilities
| ID | Path | Purpose | Input | Output | State | Dependencies |
|---|---|---|---|---|---|---|
| `UTIL_JALALI` | `/src/utils/jalali.ts` | Jalali date/time formatting & Persian digit conversion | JS Date / Numbers | Persian Formatted String | N/A | Native JS Date |
| `UTIL_ENV_TESTER` | `/src/utils/envTester.ts` | Environment variable & integration health checker | Integration Config | Test Result Summary | N/A | `SRV_STORAGE`, `TYPES_DEF` |
| `UTIL_ERROR_TRANSLATOR` | `/src/utils/errorTranslator.ts` | Persian error translator for Supabase/backend errors | Raw Error Code | Persian Message | N/A | None |

---

## ⚙️ 3. Important Business Functions Map

| ID | Path | Function Signature | Purpose | Inputs | Output | Dependencies |
|---|---|---|---|---|---|---|
| `FN_CREATE_TICKET` | `/src/services/queueService.ts` | `createTicket(params: CreateTicketParams)` | Issue a new ticket with auto-calculated number, position, wait time & itemized bread orders | `{ shop_id, customer_name, customer_phone, ticket_type, quantity, threshold, orderedItems, itemsSummary }` | `Promise<QueueItem>` | `SRV_STORAGE`, `SRV_SUPABASE_CLIENT`, `SRV_ANALYTICS`, `SRV_NOTIFICATIONS` |
| `FN_SERVE_NEXT` | `/src/services/queueService.ts` | `serveNext(shopId: string)` | Serve next ticket applying interleaving algorithm (`in_person_single` vs `in_person_multi`) | `shopId: string` | `Promise<QueueItem \| null>` | `SRV_STORAGE`, `SRV_SUPABASE_CLIENT`, `SRV_ANALYTICS`, `COMP_AUDIO_RADIO_PLAYER` |
| `FN_COMPLETE_TICKET` | `/src/services/queueService.ts` | `completeTicket(ticketId: string)` | Set ticket status to `served`, set `served_at`, update average wait times | `ticketId: string` | `Promise<boolean>` | `SRV_STORAGE`, `SRV_SUPABASE_CLIENT`, `SRV_ANALYTICS` |
| `FN_CANCEL_TICKET` | `/src/services/queueService.ts` | `cancelTicket(ticketId: string, reason?: string)` | Cancel active ticket & shift remaining waiting queue positions | `ticketId: string`, `reason?: string` | `Promise<boolean>` | `SRV_STORAGE`, `SRV_SUPABASE_CLIENT`, `SRV_ANALYTICS` |
| `FN_CALC_WAIT_TIME` | `/src/services/queueService.ts` | `calculateEstimatedWaitTime(shopId: string, position: number)` | Calculate wait time based on average service duration of last 20 served tickets | `shopId: string`, `position: number` | `number` (Minutes) | `SRV_STORAGE` |
| `FN_AUTH_LOGIN` | `/src/services/authService.ts` | `login(identifier: string, pass: string)` | Authenticate user via phone number or username | `identifier: string`, `pass: string` | `Promise<{ success, user, error }>` | `SRV_STORAGE`, `SRV_ANALYTICS` |
| `FN_AUTH_OTP_LOGIN` | `/src/services/authService.ts` | `loginWithOTP(phone: string, otp: string)` | Authenticate or register user via OTP phone verification | `phone: string`, `otp: string` | `Promise<{ success, user, error }>` | `SRV_STORAGE`, `SRV_ANALYTICS` |
| `FN_AUTH_SHOPKEEPER_QR` | `/src/services/authService.ts` | `loginAsShopkeeper(shopId: string)` | Auto-authenticate operator via Shop QR Code scan | `shopId: string` | `Promise<{ success, user, error }>` | `SRV_STORAGE`, `SRV_ANALYTICS` |
| `FN_AUTH_REGISTER` | `/src/services/authService.ts` | `register(params)` | Register new customer/shopkeeper profile | `{ phone, password, username, fullName, role }` | `Profile` | `SRV_STORAGE`, `SRV_ANALYTICS` |
| `FN_ANALYTICS_GET_DETAILED_STATS` | `/src/services/analyticsService.ts` | `getShopDetailedStats(shopId: string)` | Aggregate per-shop daily breakdown stats (tickets, guest conversions, operator usages) | `shopId: string` | `DetailedShopStats` object | `SRV_STORAGE` |
| `FN_GEN_RAND_PASS` | `/src/services/authService.ts` | `generateRandomPassword()` | Generate random 6-digit numeric credentials for step 3 conversion | None | `string` (6 digits) | None |
| `FN_SYNC_ENV` | `/src/services/envService.ts` | `syncEnvVariablesWithBackend(vars)` | POST updated variables to Node.js express middleware to update `.env` | `Record<string, string>` | `Promise<{ success, message }>` | `VITE_CONFIG` (`/api/save-env`) |
| `FN_GET_ACTIVE_BOTS` | `/src/services/botService.ts` | `getActiveBotProviders()` | Returns list of bot providers that are connected or enabled in Admin Panel API settings | None | `ActiveBotProviderInfo[]` | `SRV_STORAGE`, `TYPES_DEF` |
| `FN_SEND_BOT_NOTIF` | `/src/services/botService.ts` | `getBotDeepLink(provider, username, slug)` | Format provider deep links for messenger bot integration | `provider`, `botUsername`, `shopSlug` | `string` (URL) | `SRV_STORAGE` |
| `FN_LANDING_SMART_CTA` | `/src/pages/LandingPage.tsx` | Smart CTA Section Logic | Dynamically route guest to `/login`, customer to `/dashboard`, and hide for non-customer roles | `currentUser: Profile` | `JSX.Element \| null` | `SRV_STORAGE`, `COMP_NAVBAR` |
| `FN_DYNAMIC_BOTTOM_NAV` | `/src/components/BottomNav.tsx` | Role-based Bottom Navigation | Render role-specific navigation tabs, guest registration conversion trigger & interactive feature preview modal | `currentUser: Profile`, `location: Location` | `JSX.Element` | `SRV_STORAGE`, `PAGE_LANDING`, `PAGE_DASHBOARD`, `PAGE_PANEL` |
| `FN_REGISTER_WEBHOOK` | `/src/services/botService.ts` | `setBotWebhook(provider, token, url)` | Set Webhook URL on Telegram/Bale Bot API server | `provider`, `token`, `webhookUrl` | `Promise<{ success, message, error }>` | Native `fetch` API (`https://tapi.bale.ai/bot<token>/setWebhook`) |
| `FN_BOT_WEBHOOK` | `/supabase/functions/bot-webhook/index.ts` | Bot Core Router | Receives Telegram/Bale webhooks, validates user mapping, auto-registers guests, routes commands dynamically via `bot_dynamic_texts` | Webhook JSON Payload | HTTP 200 OK | `SRV_BOTS`, `user_bot_mappings`, `bot_dynamic_texts` |

---

## 🏗️ 3.1 Architectural Decisions & Refactoring Log

- **Removal of Unused Dependencies**:
  - `@tanstack/react-query`: Removed to eliminate duplicate data fetching logic and parallel state management. The app relies on a unified Supabase client + LocalStorage fallback architecture.
  - `zod` & `validators.ts`: Refactored to lightweight native TypeScript type guards.
  - `dotenv`, `express`, `@types/express`, `@google/genai`: Cleaned up unused server dependencies.
- **Complete Supabase Cloud Database Migration & Local Storage Purge**:
  - Successfully migrated 100% of data (Profiles, Shops, Active Queue Tickets, Service Categories, Subcategories, Marketers, Feature Flags, System Settings, Audit Logs) from local storage and mock constants into Supabase Cloud PostgreSQL tables.
  - Verified full integrity and row counts across all 10 tables on Supabase (`profiles`: 11, `shops`: 3, `queue_items`: 5, `service_categories`: 8, `service_subcategories`: 38, `marketers`: 2, `feature_flags`: 14, `system_settings`: 3, `audit_logs`: 1, `bot_dynamic_texts`: 8).
  - Consolidated and populated all environment variables directly in `.env` and `.env.example`.
  - Removed `src/services/mockData.ts` completely from the codebase and re-wired `StorageService` and `AuthService` to synchronize directly with Supabase Cloud PostgreSQL.
- **Production User Seeding & Authentication Cleanup**:
  - Replaced all mock/placeholder users with real target accounts (`admin`, `baz1`, `baz2`, `mot1`..`mot3`, `mosh1`..`mosh5`).
  - Standardized authentication password handling (`admin` for pre-seeded users).
  - Fixed profile cache resolution in `StorageService.getProfiles()` to dynamically merge seed accounts into `localStorage` if missing, preventing stale cache login failures.
  - Resolved `AuthService.login` to support case-insensitive username (`admin`) and phone matching with fallback to initial seed profiles.
  - Implemented role-based post-login navigation in `LoginPage.tsx` redirecting `admin` directly to senior admin panel (`/admin`).
- **UI Harmonization**:
  - Added Lucide `Clock` icon to the top navbar time display, styled and aligned consistently with the Jalali `Calendar` icon across mobile, tablet, and desktop viewports.
- **Service Activation Toggles & Connectivity Verification**:
  - Added dedicated activation toggles (`supabase_enabled`, `telegram_enabled`, `bale_enabled`, `eitaa_enabled`, `rubika_enabled`, `whatsapp_enabled`, `neshan_enabled`, `sms_enabled`) in `SystemIntegrationsConfig` and `AdminPage.tsx`.
  - Configured all services to default `false` (disabled) initially.
  - Enabled and verified live connectivity for Telegram Bot, Bale Bot, and Supabase Database in `UTIL_ENV_TESTER`.
- **Bot Webhook Management Architecture**:
  - Integrated live `getMe`, `getWebhookInfo`, and `setWebhook` API calls in `BotService`.
  - Added interactive Webhook setup in `AdminPage` and live status diagnosis in `EnvTesterService`.
- **Responsive Jalali Date Display**:
  - Implemented dual responsive formatting in `src/utils/jalali.ts` (`formatShortJalaliDate` for mobile and `formatLongJalaliDate` for tablet/desktop: e.g. «جمعه ۲۳ مرداد ماه ۱۴۰۵»).
  - Integrated into `src/components/Navbar.tsx` using Tailwind breakpoint classes (`hidden sm:inline` and `inline sm:hidden`).
- **Marketer Portal & Super-Admin Integration**:
  - Refactored `MarketerPage.tsx` with dynamic URL parameter routing (`?id=...` / `?marketerId=...`).
  - Added Super-Admin header banner and live marketer switcher dropdown with option to view all shops or a specific marketer's registered shops.
  - Added a Marketer Profile Summary card at the top displaying full name, phone number, username, commission rate, and registration date.
  - Added direct quick links in `AdminPage.tsx` (Users section header, user card rows, and shops list) to navigate directly to any marketer's portfolio.
  - Fully verified all database-backed operations (registering shops with marketer attribution, editing shop data, deleting shops, and toggling marketer approval status).
- **QR Print Studio & Export Engine Optimization**:
  - Rebuilt `QrPrintStudio.tsx` with dynamic self-generating base64 QR codes (`QRCode.toDataURL`), eliminating missing or blank QR code render bugs.
  - Directly connected the exact specified image files in `src/assets/images/` for the 3-step scan guide:
    - Step 1: `bisaf_widget_fill_bw_1786653703772.jpg` (Full mobile home screen showing widget) & `bisaf_browser_fill_bw_1786653722038.jpg` (Full mobile Chrome browser showing search box). Both feature precise edge-to-edge layouts filling their containers perfectly with `object-cover`.
    - Step 2: `bisaf_qr_scanned_1786508755478.jpg` (Scanning poster QR code with link popup overlay and arrow)
    - Step 3: `bisaf_ticket_fill_bw_1786653735045.jpg` (Full mobile mockup of queue PWA perfectly filling a square layout).
  - Updated step descriptions with clear, attractive Persian instructions matched to the exact visual guide photos.
  - Resolved `html-to-image` CORS and image download issues by adding fallback from `toJpeg` to `toPng`, appending download links to DOM, and adding interactive loading indicators (`isExporting`).
  - Enhanced Mobile & Desktop UX:
    - Added dynamic auto-fit container calculation (`ResizeObserver` on wrapper) that scales the A4 poster (`Math.min(scaleX, scaleY)`) to fill 100% of available viewport space tightly, eliminating all blank empty spaces top/bottom/sides across Mobile, Tablet, and Desktop displays.
    - Added customizable footer text (`footerText`), footer font size control (`footerSize`), and positioned the slogan ("بی‌صف بدون معطلی نوبت بگیرید") cleanly as the bottom-most line in the poster footer.
    - Integrated dual QR code modes (Customer Queue QR & Shopkeeper/Operator Login QR) seamlessly in `QrPrintStudio.tsx` with auto-adjusting footer and guide defaults.
    - Added dedicated, prominent "بازگشت" (Back) buttons across all views in `QrPrintStudio.tsx` (top mobile bar, sidebar header, bottom of sidebar settings, and top of desktop preview canvas) for intuitive navigation back to caller pages.
- **Responsive Jalali Date Display (CSS Breakpoint Isolation)**:
  - Added `formatLongJalaliDate` (e.g. `جمعه ۲۳ مرداد ماه ۱۴۰۵`) and `formatShortJalaliDate` (e.g. `۲۳ مرداد`) helper utilities in `src/utils/jalali.ts`.
  - Implemented responsive CSS isolation using Tailwind breakpoints in `Navbar.tsx`:
    - Mobile View (`< 768px` / `md:hidden`): Displays compact short date (`compactJalaliDate`).
    - Tablet & Desktop View (`>= 768px` / `hidden md:inline`): Displays full long date with weekday, day, month name, and year (`جمعه ۲۳ مرداد ماه ۱۴۰۵`).
- **General Instructions & Agent Guardrails (`AGENTS.md`)**:
  - Created root `AGENTS.md` specifying mandatory pre-change `project_management.md` inspection, asset preservation rules, and verification workflow to prevent regressions.


---

## 🔄 4. End-to-End Data Flows

### 4.1 Ticket Creation Flow
`PAGE_PUBLIC_SHOP` / `PAGE_SHOPKEEPER_PANEL` (User Form Input)
  → `FN_CREATE_TICKET`
  → Read existing tickets for `shop_id` from `SRV_STORAGE` / Supabase DB
  → Calculate `ticket_number = max + 1`, `position = queue.length + 1`, `estimated_wait_time = FN_CALC_WAIT_TIME()`
  → **DB Mutation**: Insert into Supabase `queue_items` table (or LocalStorage `bisaf_queue`)
  → **Realtime / Side Effects**:
      - Trigger `SRV_ANALYTICS.trackEvent('ticket_create')`
      - Evaluate `position <= alert_threshold` → Call `SRV_NOTIFICATIONS` / `SRV_BOTS`
      - Dispatch `window.dispatchEvent(new Event('storage'))` & Supabase Postgres Channel `queue_items`
  → **Destination**: Return `QueueItem` to `PAGE_PUBLIC_SHOP`, trigger PDF/QR receipt download & update `PAGE_CUSTOMER_DASHBOARD`

### 4.2 Ticket Serving (Interleaving Algorithm) Flow
`PAGE_SHOPKEEPER_PANEL` (Operator Clicks "Serv Next / تحویل بعدی")
  → `FN_SERVE_NEXT(shopId)`
  → Retrieve waiting tickets for `shop_id`
  → Check last served ticket type (`in_person_single` vs `in_person_multi`):
      - If last served was `in_person_single`, pick next `in_person_multi` if available; otherwise pick `in_person_single`.
      - If current serving ticket exists, mark it `served` (`served_at = ISO string`).
  → Set selected ticket `status = 'serving'`, `called_at = ISO string`
  → **DB Mutation**: Update Supabase `queue_items` table (or LocalStorage `bisaf_queue`)
  → Shift remaining waiting tickets `position = position - 1`
  → **Realtime / Side Effects**:
      - Trigger `COMP_AUDIO_RADIO_PLAYER` audio announcement ("شماره X به باجه Y")
      - Dispatch bot notification / SMS alert to customer
      - Trigger `SRV_ANALYTICS.trackEvent('ticket_served')`
  → **Destination**: Re-render `PAGE_SHOPKEEPER_PANEL` active ticket display & live update `PAGE_CUSTOMER_DASHBOARD` position

### 4.3 Ticket Completion Flow
`PAGE_SHOPKEEPER_PANEL` (Operator Clicks "Complete / اتمام نوبت")
  → `FN_COMPLETE_TICKET(ticketId)`
  → Set ticket `status = 'served'`, `served_at = ISO string`
  → **DB Mutation**: Update `queue_items` record in Supabase / LocalStorage
  → Recalculate average service duration across last 20 served tickets
  → Update `SRV_ANALYTICS` daily statistics in `queue_daily_stats` / `bisaf_analytics`
  → **Destination**: Clear active ticket box in `PAGE_SHOPKEEPER_PANEL`, recalculate wait times on `PAGE_CUSTOMER_DASHBOARD`

### 4.4 Ticket Cancellation Flow
`PAGE_PUBLIC_SHOP` / `PAGE_CUSTOMER_DASHBOARD` / `PAGE_SHOPKEEPER_PANEL` (User/Operator Clicks "Cancel / انصراف")
  → `FN_CANCEL_TICKET(ticketId, reason)`
  → Set ticket `status = 'cancelled'`, `cancelled_at = ISO string`, `cancellation_reason = reason`
  → **DB Mutation**: Update `queue_items` in Supabase / LocalStorage
  → Recalculate and re-index `position = position - 1` for all subsequent `waiting` tickets in queue
  → **Realtime / Side Effects**: Dispatch storage event / Supabase channel notification
  → **Destination**: Update `PAGE_CUSTOMER_DASHBOARD` active tickets list & `PAGE_SHOPKEEPER_PANEL` queue counters

### 4.5 User Authentication Flow
`PAGE_LOGIN` / `COMP_REGISTRATION_CONVERSION_MODAL` (Form Submit)
  → `FN_AUTH_LOGIN(identifier, pass)` or `FN_AUTH_REGISTER(params)`
  → Verify credentials against `SRV_STORAGE.getProfiles()` / Supabase `auth.users` & `profiles`
  → On Success: `SRV_STORAGE.setCurrentUser(user)`
  → **Storage Mutation**: Save to LocalStorage `bisaf_user` and `bisaf_profiles`
  → **Side Effect**: `SRV_ANALYTICS.trackEvent('login')` or `'registration'`
  → **Destination**: Update `currentUser` state in `APP_ROOT`, update `COMP_NAVBAR` user badge, redirect to role dashboard (`PAGE_CUSTOMER_DASHBOARD` or `PAGE_SHOPKEEPER_PANEL`)

### 4.6 Environment Variable Sync Flow
`PAGE_ADMIN` (Admin Edits Integrations & Clicks "Save & Sync / ثبت و اعمال")
  → `SRV_ENV_SYNC.syncEnvVariablesWithBackend(vars)`
  → Send HTTP `POST /api/save-env` to Node.js backend middleware in `vite.config.ts`
  → Node.js filesystem `fs.writeFileSync('.env')` updates root `.env` file
  → Update LocalStorage `bisaf_system_integrations`
  → Execute `UTIL_ENV_TESTER.runEnvTests()` health pings (Supabase, SMS Gateway, Bot endpoints)
  → **Destination**: Re-render `PAGE_ADMIN` integration health status tags

---

## 🔀 5. Entity State Transitions

### 5.1 Queue Ticket State Transitions (`QueueItem.status`)
```
[ created ] ──► (status = 'waiting', position = N)
                       │
                       ├───────► Event: cancelTicket() ──────► [ status = 'cancelled' ]
                       │
                       ▼
             Event: serveNext() [Interleaving Algorithm]
                       │
                       ▼
               [ status = 'serving' / 'calling' ]
                       │
                       ├───────► Event: cancelTicket() ──────► [ status = 'cancelled' ]
                       │
                       ▼
             Event: completeTicket() / Next serve
                       │
                       ▼
                [ status = 'served' ]
```

### 5.2 User Auth Session State Transitions (`currentUser`)
```
[ null / Unauthenticated ]
        │
        ├───► Event: FN_AUTH_LOGIN() ────────► [ Profile (role: 'customer' | 'shopkeeper' | 'marketer' | 'admin') ]
        │
        ├───► Event: FN_AUTH_REGISTER() ─────► [ Profile (role: 'customer' | 'shopkeeper') ]
        │
        └───► Event: Logout / Clear Storage ──► [ null ]
```

---

## 🎯 6. Source of Truth Matrix

| Data Domain | Primary Source of Truth | Secondary / Local Cache | Component UI State | Realtime / Sync Mechanism |
|---|---|---|---|---|
| **Queue Items (`QueueItem`)** | Supabase Cloud PostgreSQL (`queue_items` table) | LocalStorage `bisaf_queue` | `activeTickets` (`PAGE_CUSTOMER_DASHBOARD`), `shopQueue` (`PAGE_SHOPKEEPER_PANEL`) | Supabase Realtime `postgres_changes` + `window.addEventListener('storage')` |
| **Shops (`Shop`)** | Supabase Cloud PostgreSQL (`shops` table) | LocalStorage `bisaf_shops` + `SRV_MOCK_DATA` seed | `shops` (`PAGE_CUSTOMER_DASHBOARD`), `shop` (`PAGE_PUBLIC_SHOP`) | LocalStorage `storage` event broadcast |
| **User Profiles (`Profile`)** | Supabase Auth (`auth.users`) & `profiles` table | LocalStorage `bisaf_profiles` & `bisaf_user` | `currentUser` (`APP_ROOT`), `user` (`PAGE_LOGIN`) | LocalStorage `storage` event sync |
| **System Integrations / Keys** | Root `.env` file (written via `/api/save-env`) | LocalStorage `bisaf_system_integrations` | `integrations` (`PAGE_ADMIN`) | `UTIL_ENV_TESTER` health pings |
| **Analytics & Daily Stats** | Supabase Cloud PostgreSQL (`queue_daily_stats`) | LocalStorage `bisaf_analytics` | `stats` (`PAGE_SHOPKEEPER_PANEL`, `PAGE_ADMIN`) | LocalStorage write + React state |

---

## 💥 7. Impact Map & Affected Components

| Change / Operation Target | Affected Pages | Affected Components | Affected Services | DB Table / Storage Key Affected | Realtime / Notifications Triggered | Affected Analytics |
|---|---|---|---|---|---|---|
| **`FN_CREATE_TICKET`** | `PAGE_PUBLIC_SHOP`, `PAGE_CUSTOMER_DASHBOARD`, `PAGE_SHOPKEEPER_PANEL` | `COMP_NAVBAR` | `SRV_QUEUE_ENGINE`, `SRV_STORAGE`, `SRV_NOTIFICATIONS` | DB: `queue_items` / LS: `bisaf_queue` | Supabase Postgres Channel + `storage` event + SMS/Bot alert | Event: `ticket_create` |
| **`FN_SERVE_NEXT`** | `PAGE_SHOPKEEPER_PANEL`, `PAGE_CUSTOMER_DASHBOARD`, `PAGE_PUBLIC_SHOP` | `COMP_AUDIO_RADIO_PLAYER`, `COMP_NAVBAR` | `SRV_QUEUE_ENGINE`, `SRV_STORAGE`, `SRV_BOTS` | DB: `queue_items` / LS: `bisaf_queue` | Web Audio Synthesizer + Supabase Realtime + Customer SMS/Bot alert | Event: `ticket_served` |
| **`FN_COMPLETE_TICKET`** | `PAGE_SHOPKEEPER_PANEL`, `PAGE_CUSTOMER_DASHBOARD` | `COMP_NAVBAR` | `SRV_QUEUE_ENGINE`, `SRV_STORAGE`, `SRV_ANALYTICS` | DB: `queue_items`, `queue_daily_stats` / LS: `bisaf_queue`, `bisaf_analytics` | Supabase Realtime + `storage` event | Event: `ticket_completed`, wait time update |
| **`FN_CANCEL_TICKET`** | `PAGE_PUBLIC_SHOP`, `PAGE_CUSTOMER_DASHBOARD`, `PAGE_SHOPKEEPER_PANEL` | N/A | `SRV_QUEUE_ENGINE`, `SRV_STORAGE`, `SRV_ANALYTICS` | DB: `queue_items` / LS: `bisaf_queue` | Supabase Realtime + `storage` event | Event: `ticket_cancel` |
| **`FN_AUTH_LOGIN` / `REGISTER`** | `PAGE_LOGIN`, `PAGE_LANDING`, `PAGE_CUSTOMER_DASHBOARD`, `PAGE_SHOPKEEPER_PANEL` | `COMP_NAVBAR`, `COMP_BOTTOM_NAV`, `COMP_REGISTRATION_CONVERSION_MODAL` | `SRV_AUTH`, `SRV_STORAGE` | DB: `profiles`, `auth.users` / LS: `bisaf_user`, `bisaf_profiles` | LocalStorage session event | Event: `login`, `registration` |
| **`FN_SYNC_ENV`** | `PAGE_ADMIN` | N/A | `SRV_ENV_SYNC`, `UTIL_ENV_TESTER` | File: `.env` / LS: `bisaf_system_integrations` | Backend `/api/save-env` endpoint | N/A |

---

## 🔑 8. Environment Variables Registry & Security Status Audit

| NAME | Used By | Purpose | Security Exposure Level | Status |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | `SRV_SUPABASE_CLIENT`, `SRV_STORAGE`, `UTIL_ENV_TESTER`, `PAGE_ADMIN` | Supabase cloud endpoint URL (`https://jnburxmyrhzjdpzyhqvy.supabase.co`) | Public Client Variable | `CONNECTED` |
| `VITE_SUPABASE_ANON_KEY` | `SRV_SUPABASE_CLIENT`, `SRV_STORAGE`, `UTIL_ENV_TESTER`, `PAGE_ADMIN` | Supabase public anon key (`jnburxmyrhzjdpzyhqvy`) | Public Client Variable | `CONNECTED` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `SRV_SUPABASE_CLIENT`, `SRV_STORAGE` | Alias for anon key | Public Client Variable | `CONNECTED` |
| `SUPABASE_URL` | `.env`, `/api/save-env` | Server-side environment record | Server Only | `CONNECTED` |
| `SUPABASE_PUBLISHABLE_KEY` | `.env`, `/api/save-env` | Server-side publishable key record | Server Only | `CONNECTED` |
| `SUPABASE_SECRET_KEY` | `.env` | Server-side JWT/secret key | Server Only | `CONNECTED` |
| `SUPABASE_JWKS_URL` | `.env` | JWKS verification endpoint | Server Only | `CONNECTED` |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env`, `.env.example` | Elevated service role key | Server Only | `CONNECTED` |
| `VITE_NESHAN_KEY` / `NESHAN_API_KEY` | `SRV_STORAGE`, `UTIL_ENV_TESTER`, `PAGE_ADMIN` | Neshan Maps key (Fallback: Leaflet OpenStreetMap) | Public Client Variable | `OPTIONAL` |
| `VITE_TELEGRAM_BOT_TOKEN` | `SRV_STORAGE`, `UTIL_ENV_TESTER`, `PAGE_ADMIN`, `SRV_BOTS` | Telegram bot API token | ⚠️ Exposed in Client / LocalStorage | `OPTIONAL` |
| `VITE_BALE_BOT_TOKEN` | `SRV_STORAGE`, `UTIL_ENV_TESTER`, `PAGE_ADMIN`, `SRV_BOTS` | Bale messenger bot token | ⚠️ Exposed in Client / LocalStorage | `OPTIONAL` |
| `VITE_EITAA_BOT_TOKEN` | `SRV_STORAGE`, `UTIL_ENV_TESTER`, `PAGE_ADMIN`, `SRV_BOTS` | Eitaa messenger bot token | ⚠️ Exposed in Client / LocalStorage | `OPTIONAL` |
| `VITE_RUBIKA_BOT_TOKEN` | `SRV_STORAGE`, `UTIL_ENV_TESTER`, `PAGE_ADMIN`, `SRV_BOTS` | Rubika messenger bot token | ⚠️ Exposed in Client / LocalStorage | `OPTIONAL` |
| `WHATSAPP_ACCESS_TOKEN` | `SRV_BOTS` | WhatsApp Business API token | Server / Admin Config | `OPTIONAL` |
| `VITE_KAVENEGAR_KEY` | `SRV_STORAGE`, `UTIL_ENV_TESTER`, `PAGE_ADMIN` | Kavenegar SMS Gateway key | ⚠️ Exposed in Client / LocalStorage | `OPTIONAL` |
| `MELIPAYAMAK_API_KEY` | `SRV_STORAGE`, `UTIL_ENV_TESTER` | Melipayamak SMS Gateway key | ⚠️ Exposed in Client / LocalStorage | `OPTIONAL` |
| `VITE_ZARINPAL_MERCHANT_ID` | `SRV_STORAGE`, `SRV_PAYMENT`, `PAGE_ADMIN` | ZarinPal payment merchant ID | ⚠️ Exposed in Client / LocalStorage | `OPTIONAL` |
| `VITE_IDPAY_API_KEY` | `SRV_STORAGE`, `SRV_PAYMENT`, `PAGE_ADMIN` | IDPay payment gateway key | ⚠️ Exposed in Client / LocalStorage | `OPTIONAL` |
| `DISABLE_HMR` | `vite.config.ts` | Dev server HMR toggle | Server Dev Environment | `CONNECTED` |

---

## ⚠️ 9. Known Issues & Security / Architectural Audit Registry

### ⚠️ Security & Architectural Issues (`KNOWN ISSUE`)
1. **Client-Exposed Third-Party Secrets**: Bot tokens (`VITE_TELEGRAM_BOT_TOKEN`, `VITE_BALE_BOT_TOKEN`, etc.), SMS keys (`VITE_KAVENEGAR_KEY`), and Payment API keys (`VITE_IDPAY_API_KEY`) are read via `import.meta.env.VITE_*` and persisted in browser `LocalStorage` (`bisaf_system_integrations`).
   - *Impact*: Secrets can be inspected via browser DevTools or XSS vulnerabilities.
   - *Architectural Recommendation*: Proxy all third-party bot/SMS/payment calls through server-side Express `/api/*` routes rather than direct browser HTTP dispatches.
2. **Payment Callback Webhook Stub**: `src/services/paymentService.ts` configures ZarinPal & IDPay parameters, but live bank callback IPN redirection routes run in mock mode (`is_mock: true`).
3. **WhatsApp Direct API Token**: `src/services/botService.ts` contains the WhatsApp notification builder, but direct Cloud API HTTP dispatch requires a live Facebook Graph access token in `.env`.
4. **PWA Background Sync**: Service Worker (`public/sw.js`) provides asset caching and offline shell, but background queue sync requires a user gesture upon reconnection.

### `UNKNOWN`
- None. All source code routes, state variables, component hierarchies, database schemas, and service functions are 100% verified directly from source code.

---

## 🚀 10. Interactive Test Runner & Unified Bot Engine Extensions

### 🧪 Interactive System Test Runner (`InteractiveSystemTestModal.tsx`)
- **Location**: `/src/components/InteractiveSystemTestModal.tsx`
- **Trigger**: Floating action button (FAB) `🧪 آزمایش و تور هوشمند سامانه` + Navbar drawer menu.
- **Features**:
  - Full E2E & Role-specific guided simulations (Guest Scan, Customer Dashboard, Shopkeeper/Operator, Marketer, Admin/Database).
  - Play, Pause, Step Forward, Step Backward, Speed Selection (1x, 2x, 0.5x), Role Switcher.
  - **Dock to Bottom Mode**: Slim, non-intrusive bottom control bar allowing 100% full view of active page changes and live UI interactions.
  - **Draggable Floating Card Mode**: Pointer-drag handle enabling the user to drag and position the HUD anywhere across the viewport.
  - **Mini Pill Mode**: Ultra-compact draggable status pill.
  - **Expandable Details Drawer**: On-demand popover displaying non-technical explanations (What happened, Why it matters, Actual result) without cluttering the screen.

### 🤖 Unified Bot Engine (`BotCore` & Webhooks)
- **Core Dispatcher**: `/src/services/botCore.ts` (Telegram & Bale unified session & keyboard state machine).
- **Webhooks**: `/api/bot/telegram.ts` and `/api/bot/bale.ts` (Serverless HTTP webhook handlers).
- **Admin Simulator**: Live in-app Bot Tester in `/src/pages/AdminPage.tsx` (Integrations tab).

---

## 🎨 11. Banners & Thermal Printer Configuration Map

### 🏷️ Banner Management Engine
- **Storage Layer**: `StorageService.getBanners()`, `saveBanner()`, `deleteBanner()`, `getBannerById()`. Stored in LocalStorage under key `bisaf_banners`.
- **Admin Panel Control**: Dedicated 'بنرهای تبلیغاتی' tab in `AdminPage.tsx` with full CRUD, live image preview, click target URL, active status toggle, and standard aspect ratio guidance (1200x400 px, 3:1 ratio).
- **Per-Shop Assignment**: Configurable via `banner_id` in Admin shop creation/edit modal and `ShopkeeperSettingsModal.tsx`.
- **Public Display**: `ClickablePromoBanner.tsx` renders either the specific shop banner or default universal BiSaf promotion with preserved aspect ratio (`object-contain`) and click-through navigation.

### 🖨️ Thermal Printer Controls
- **Toggle Location**: Admin Panel per-shop configuration (`thermal_printer_enabled` boolean in `Shop` interface).
- **Shopkeeper View**: `ShopkeeperSettingsModal.tsx` displays thermal printer status badge and directs operator to Admin if disabled.
- **Printing Page**: `/print/:ticketId` formats standard 58mm/80mm thermal receipt with dynamic QR code.

### 📲 PWA Section Cleanup
- **Layout Enhancement**: Removed the redundant "نصب و عضویت" (Install & Join) button from Section 3 of `PublicShopPage.tsx` to streamline customer visual queue experience, eliminating redundant call-to-actions when the universal promo banner is active.

