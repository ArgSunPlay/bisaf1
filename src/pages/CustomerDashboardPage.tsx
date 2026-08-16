import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Store, Ticket, Heart, Settings, Bell, 
  Share2, User, Lock, Moon, Sun, Smartphone, Gift, 
  CheckCircle2, Sparkles, AlertCircle, Radio, ArrowRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { StorageService } from '../services/storage';
import { QueueService } from '../services/queueService';
import { AuthService } from '../services/authService';
import { Shop, QueueItem, Profile } from '../types';
import { toPersianDigits, formatJalaliDate } from '../utils/jalali';
import { ClickablePromoBanner } from '../components/ClickablePromoBanner';

// Custom Marker Icon for Leaflet
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const CustomerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'map';

  const [currentUser, setCurrentUser] = useState<Profile>(StorageService.getCurrentUser());
  const [shops, setShops] = useState<Shop[]>([]);
  const [userTickets, setUserTickets] = useState<QueueItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Settings state
  const [usernameInput, setUsernameInput] = useState(currentUser.username || '');
  const [fullNameInput, setFullNameInput] = useState(currentUser.full_name || '');
  const [phoneInput, setPhoneInput] = useState(currentUser.phone || '');
  const [settingsMessage, setSettingsMessage] = useState('');

  useEffect(() => {
    const loadedShops = StorageService.getShops();
    setShops(loadedShops);

    const allTickets = StorageService.getQueueItems();
    const myTickets = allTickets.filter(t => t.customer_user_id === currentUser.id || t.customer_phone === currentUser.phone);
    setUserTickets(myTickets);

    const favs = StorageService.getFavorites(currentUser.id);
    setFavorites(favs.map(f => f.shop_id));

    // Generate referral link (Section 51)
    const baseUrl = window.location.origin;
    setReferralLink(`${baseUrl}/login?ref=${currentUser.id}`);
  }, [currentUser]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = AuthService.updateProfile(currentUser.id, {
        username: usernameInput,
        full_name: fullNameInput,
        phone: phoneInput
      });
      setCurrentUser(updated);
      setSettingsMessage('✅ اطلاعات با موفقیت به روز شد.');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err: any) {
      setSettingsMessage(`❌ خطا: ${err.message}`);
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 pt-4 px-4 sm:px-6 max-w-5xl mx-auto space-y-5 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700"
            title="بازگشت به صفحه قبل"
          >
            <ArrowRight className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">بازگشت</span>
          </button>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              سلام، {currentUser.full_name || currentUser.username || 'کاربر بی‌صف'} 👋
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentUser.phone ? toPersianDigits(currentUser.phone) : 'حساب میهمان'}
            </p>
          </div>
        </div>
        <Link
          to="/dashboard?tab=settings"
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      {/* Navigation Sub-Tabs for Desktop & Mobile header */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'map', label: '🗺️ نقشه مراکز', icon: MapPin },
          { id: 'tickets', label: '🎟️ نوبت‌های من', icon: Ticket },
          { id: 'favorites', label: '⭐ مراکز من', icon: Heart },
          { id: 'settings', label: '⚙️ تنظیمات و حساب', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={`flex-1 min-w-[125px] sm:min-w-0 text-center justify-center px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Clickable Promotional Banner */}
      {shops.length > 0 && <ClickablePromoBanner shop={shops[0]} />}

      {/* TAB 1: MAP VIEW */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden h-[420px] relative">
            <MapContainer
              center={[35.7592, 51.4080]}
              zoom={13}
              scrollWheelZoom={false}
              className="w-full h-full rounded-2xl"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {shops.map((s) => (
                <Marker key={s.id} position={[s.latitude, s.longitude]} icon={customIcon}>
                  <Popup>
                    <div className="p-1 space-y-2 text-right">
                      <h4 className="font-extrabold text-sm text-slate-900">{s.name}</h4>
                      <p className="text-xs text-slate-600">{s.category}</p>
                      <p className="text-xs font-bold text-emerald-700">
                        در انتظار: {toPersianDigits(QueueService.getShopQueue(s.id).waitingCount)} نفر
                      </p>
                      <Link
                        to={`/shop/${s.slug}`}
                        className="block w-full py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg text-center mt-2 shadow-sm"
                      >
                        🚀 دریافت نوبت
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
              مراکز خدمت‌رسانی نزدیک شما
            </h3>
            {shops.map((s) => {
              const qInfo = QueueService.getShopQueue(s.id);
              return (
                <div key={s.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{s.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.category} • {s.address}</p>
                    <div className="flex items-center gap-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2">
                      <span>در انتظار: {toPersianDigits(qInfo.waitingCount)} نفر</span>
                      <span>تخمین: {qInfo.estimatedWait.text}</span>
                    </div>
                  </div>
                  <Link
                    to={`/shop/${s.slug}`}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                  >
                    نوبت‌گیری
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            تاریخچه و نوبت‌های فعال شما
          </h3>
          {userTickets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl text-center space-y-3 border border-slate-200 dark:border-slate-800">
              <Ticket className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">هنوز نوبتی ثبت نکرده‌اید.</p>
              <Link to="/dashboard?tab=map" className="inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">
                مشاهده مراکژ روی نقشه
              </Link>
            </div>
          ) : (
            userTickets.map((t) => {
              const targetShop = shops.find(s => s.id === t.shop_id);
              return (
                <div key={t.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {targetShop?.name || 'مرکز خدمات'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      t.status === 'waiting' 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                        : t.status === 'serving'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {t.status === 'waiting' ? 'در صف انتظار' : t.status === 'serving' ? 'در حال تحویل' : 'تحویل شده / لغو'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500">
                      شماره نوبت: <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">#{toPersianDigits(t.ticket_number)}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {t.items_summary ? (
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">🥖 {t.items_summary}</span>
                      ) : (
                        <span>تعداد: <strong className="text-slate-800 dark:text-slate-200">{toPersianDigits(t.quantity)}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: FAVORITES */}
      {activeTab === 'favorites' && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            فروشگاه‌ها و مراکژ مورد علاقه شما
          </h3>
          {favorites.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl text-center space-y-3 border border-slate-200 dark:border-slate-800">
              <Heart className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">هیچ مرکر علاقمندی ثبت نشده است.</p>
            </div>
          ) : (
            shops.filter(s => favorites.includes(s.id)).map((s) => (
              <div key={s.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{s.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.address}</p>
                </div>
                <Link
                  to={`/shop/${s.slug}`}
                  className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  نوبت‌گیری سریع
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: SETTINGS & REFERRAL */}
      {activeTab === 'settings' && (
        <div className="space-y-5">
          {/* Referral Banner (Section 51) */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold">🎁 دعوت از دوستان</h4>
                <p className="text-xs text-emerald-100">با دعوت هر دوست، به‌زودی شارژ هدیه دریافت می‌کنید!</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-2xl border border-white/20">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full bg-transparent text-xs text-white font-mono outline-none px-2 select-all"
              />
              <button
                onClick={handleCopyReferral}
                className="px-3 py-1.5 bg-white text-emerald-800 text-xs font-bold rounded-xl shrink-0 shadow-sm"
              >
                {copiedReferral ? 'کپی شد! ✅' : 'کپی لینک'}
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              ویرایش حساب و نام کاربری
            </h4>

            {settingsMessage && (
              <div className="text-xs font-bold p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {settingsMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام کاربری (جهت ورود بدون شماره)
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="مانند: ali123"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono text-left outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                شماره موبایل
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono text-left outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors text-sm"
            >
              ذخیره تغییرات حساب
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
