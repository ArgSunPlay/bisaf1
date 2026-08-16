import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Award, Store, DollarSign, Plus, CheckCircle2, Clock, ArrowRight, 
  Edit3, Trash2, BarChart3, QrCode, Copy, Check, Users, UserCheck, Smartphone, Eye, Calendar, MapPin,
  Shield, ExternalLink, Phone, User, CheckCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { StorageService } from '../services/storage';
import { AnalyticsService } from '../services/analyticsService';
import { Shop, Marketer, ServiceCategory, Profile } from '../types';
import { toPersianDigits, formatLongJalaliDate } from '../utils/jalali';
import { MapLocationPicker } from '../components/marketer/MapLocationPicker';
import { QrPrintStudio } from '../components/marketer/QrPrintStudio';
import { PasswordInput } from '../components/PasswordInput';

export const MarketerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMarketerId = searchParams.get('id') || searchParams.get('marketerId');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'shops' | 'register'>('dashboard');
  
  const [currentUser] = useState(StorageService.getCurrentUser());
  const isAdmin = currentUser?.role === 'admin';

  const [allMarketers, setAllMarketers] = useState<Marketer[]>([]);
  const [marketerInfo, setMarketerInfo] = useState<Marketer | null>(null);
  const [marketerProfile, setMarketerProfile] = useState<Profile | null>(null);
  const [assignedShops, setAssignedShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Register Shop Form
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('نانوایی‌ها');
  const [subcategory, setSubcategory] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  
  // Coordinates for Map
  const [shopLat, setShopLat] = useState<number>(35.7500);
  const [shopLng, setShopLng] = useState<number>(51.4000);
  
  const [message, setMessage] = useState('');

  // Editing Shop Modal
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubcategory, setEditSubcategory] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Detailed Stats Modal State
  const [selectedShopStats, setSelectedShopStats] = useState<{ shop: Shop; stats: ReturnType<typeof AnalyticsService.getShopDetailedStats> } | null>(null);

  // Dual QR Modal State
  const [selectedShopQr, setSelectedShopQr] = useState<{ shop: Shop; opQr: string; custQr: string } | null>(null);

  useEffect(() => {
    const marketers = StorageService.getMarketers();
    const profiles = StorageService.getProfiles();
    setAllMarketers(marketers);

    let activeMarketer: Marketer | undefined;

    if (queryMarketerId) {
      activeMarketer = marketers.find(m => m.id === queryMarketerId || m.user_id === queryMarketerId);
    }

    if (!activeMarketer) {
      if (isAdmin) {
        activeMarketer = marketers[0];
      } else {
        activeMarketer = marketers.find(m => m.user_id === currentUser.id) || marketers[0];
      }
    }

    setMarketerInfo(activeMarketer || null);

    if (activeMarketer) {
      const prof = profiles.find(p => p.id === activeMarketer?.user_id) || activeMarketer.profile;
      setMarketerProfile(prof || null);
      refreshShops(activeMarketer.user_id, activeMarketer.id);
    } else {
      refreshShops(currentUser.id);
    }

    const cats = StorageService.getCategories();
    setCategories(cats);
    if (cats.length > 0) {
      setCategory(cats[0].name);
      if (cats[0].subcategories && cats[0].subcategories.length > 0) {
        setSubcategory(cats[0].subcategories[0].name);
      }
    }
  }, [currentUser, queryMarketerId, isAdmin]);

  const refreshShops = (mUserId?: string, mId?: string) => {
    const shops = StorageService.getShops();
    if (mUserId || mId) {
      const filtered = shops.filter(s => 
        s.marketer_id === mUserId || 
        s.marketer_id === mId || 
        (s.marketer_id === undefined && mUserId === 'user-baz1')
      );
      setAssignedShops(filtered);
    } else {
      setAssignedShops(shops);
    }
  };

  const handleSwitchMarketer = (newMId: string) => {
    if (newMId === 'all') {
      setSearchParams({});
      const shops = StorageService.getShops();
      setAssignedShops(shops);
      setMarketerInfo(null);
      setMarketerProfile(null);
    } else {
      setSearchParams({ id: newMId });
    }
  };

  const handleCopyReferral = () => {
    const refCode = marketerInfo?.id || marketerInfo?.user_id || 'MARKETER';
    const link = `${window.location.origin}/register?ref=${refCode}`;
    navigator.clipboard.writeText(link);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const handleCategoryChange = (catName: string) => {
    setCategory(catName);
    const selected = categories.find(c => c.name === catName);
    if (selected && selected.subcategories && selected.subcategories.length > 0) {
      setSubcategory(selected.subcategories[0].name);
    } else {
      setSubcategory('');
    }
  };

  const handleRegisterShop = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if username already exists
    const profiles = StorageService.getProfiles();
    if (ownerUsername && profiles.some(p => p.username === ownerUsername)) {
      alert('این نام کاربری از قبل وجود دارد. لطفاً نام کاربری دیگری انتخاب کنید.');
      return;
    }

    // Create the shopkeeper profile
    const newOwnerId = `user-mot-${Date.now()}`;
    const newOwner = {
      id: newOwnerId,
      full_name: ownerName,
      username: ownerUsername,
      password: ownerPassword || 'admin',
      phone: ownerPhone || phone,
      role: 'shopkeeper' as const,
      created_at: new Date().toISOString()
    };
    StorageService.saveProfile(newOwner);

    const targetMarketerId = marketerInfo?.user_id || marketerInfo?.id || currentUser.id;

    const slug = shopName.toLowerCase().replace(/\s+/g, '-');
    const newShop: Shop = {
      id: `shop-${Date.now()}`,
      name: shopName,
      slug,
      category,
      subcategory,
      address,
      phone,
      latitude: shopLat,
      longitude: shopLng,
      is_active: true,
      owner_id: newOwnerId,
      marketer_id: targetMarketerId,
      created_at: new Date().toISOString()
    };

    StorageService.saveShop(newShop);
    setMessage(`✅ فروشگاه "${shopName}" با موفقیت به نام این بازاریاب ثبت گردید.`);
    setShopName('');
    setAddress('');
    setPhone('');
    setOwnerName('');
    setOwnerUsername('');
    setOwnerPassword('');
    setOwnerPhone('');

    refreshShops(marketerInfo?.user_id, marketerInfo?.id);
    setTimeout(() => {
      setMessage('');
      setActiveTab('shops'); // go to shops list
    }, 2000);
  };

  // Delete Shop
  const handleDeleteShop = (shopId: string, sName: string) => {
    if (window.confirm(`آیا از حذف فروشگاه "${sName}" اطمینان دارید؟`)) {
      const shops = StorageService.getShops().filter(s => s.id !== shopId);
      StorageService.saveShops(shops);
      setMessage(`🗑️ فروشگاه ${sName} با موفقیت حذف گردید.`);
      refreshShops(marketerInfo?.user_id, marketerInfo?.id);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Open Edit Modal
  const openEditModal = (shop: Shop) => {
    setEditingShop(shop);
    setEditName(shop.name);
    setEditCategory(shop.category);
    setEditSubcategory(shop.subcategory || '');
    setEditAddress(shop.address);
    setEditPhone(shop.phone || '');
  };

  // Save Edit Shop
  const handleSaveEditShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop) return;

    const updated: Shop = {
      ...editingShop,
      name: editName,
      category: editCategory,
      subcategory: editSubcategory,
      address: editAddress,
      phone: editPhone,
      updated_at: new Date().toISOString()
    };

    StorageService.saveShop(updated);
    setMessage(`✅ اطلاعات فروشگاه ${editName} ویرایش و ذخیره گردید.`);
    setEditingShop(null);
    refreshShops(marketerInfo?.user_id, marketerInfo?.id);
    setTimeout(() => setMessage(''), 3000);
  };

  // Open Dual QR Modal
  const openQrModal = async (shop: Shop) => {
    const opUrl = `${window.location.origin}/panel/${shop.id}?auto_login=true`;
    const custUrl = `${window.location.origin}/shop/${shop.slug}`;

    try {
      const opQr = await QRCode.toDataURL(opUrl, { width: 220, margin: 1 });
      const custQr = await QRCode.toDataURL(custUrl, { width: 220, margin: 1 });
      setSelectedShopQr({ shop, opQr, custQr });
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate total tickets across marketer's shops
  const allQueueItems = StorageService.getQueueItems();
  const totalMarketerTickets = assignedShops.reduce((acc, shop) => {
    return acc + allQueueItems.filter(q => q.shop_id === shop.id).length;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 pt-4 px-4 max-w-2xl mx-auto space-y-5 animate-fade-in">
      
      {/* Top Header & Admin Mode Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (activeTab !== 'dashboard') setActiveTab('dashboard');
              else if (isAdmin) navigate('/admin');
              else navigate(-1);
            }}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-indigo-500" />
            <span>{activeTab === 'dashboard' ? (isAdmin ? 'بازگشت به پنل مدیریت' : 'بازگشت') : 'بازگشت به داشبورد بازاریاب'}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="px-3 py-1.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:bg-purple-200 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>پنل مدیریت ارشد</span>
            </button>
          )}
        </div>

        {/* ADMIN MODE SELECTOR BANNER */}
        {isAdmin && (
          <div className="p-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-lg border border-purple-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">دسترسی مدیریت ارشد به بازاریابان</h4>
                  <p className="text-[11px] text-purple-200">مشاهده و بررسی عملکرد و فروشگاه‌های هر بازاریاب</p>
                </div>
              </div>

              {/* Marketer Switcher Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-purple-200 shrink-0">انتخاب بازاریاب:</label>
                <select
                  value={marketerInfo?.id || (marketerInfo?.user_id) || 'all'}
                  onChange={(e) => handleSwitchMarketer(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800/90 border border-purple-400/50 rounded-xl text-xs text-white font-bold outline-none cursor-pointer"
                >
                  {allMarketers.map((m) => {
                    const prof = m.profile || StorageService.getProfiles().find(p => p.id === m.user_id);
                    return (
                      <option key={m.id} value={m.id}>
                        {prof?.full_name || prof?.username || m.user_id} (پورسانت: {toPersianDigits(m.commission_rate)}٪)
                      </option>
                    );
                  })}
                  <option value="all">⚡ نمایش همه فروشگاه‌ها (تمام بازاریابان)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {message && (
        <div className="bg-emerald-600 text-white font-bold p-3 rounded-2xl text-xs text-center shadow-md">
          {message}
        </div>
      )}

      {/* MARKETER INFORMATION CARD (Always at Top) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {marketerProfile?.full_name || marketerProfile?.username || (marketerInfo ? `بازاریاب ${marketerInfo.id}` : 'مدیر کل / تمام بازاریابان')}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  بازاریاب رسمی بی‌صف
                </span>
                {marketerInfo && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    marketerInfo.status === 'approved' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {marketerInfo.status === 'approved' ? 'تایید شده و فعال' : 'در انتظار تایید'}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                {marketerProfile?.phone && (
                  <span className="font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {toPersianDigits(marketerProfile.phone)}
                  </span>
                )}
                {marketerProfile?.username && (
                  <span className="font-mono flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    @{marketerProfile.username}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Referral Button */}
          {marketerInfo && (
            <button
              onClick={handleCopyReferral}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-indigo-200 dark:border-indigo-800 shrink-0"
              title="کپی لینک اختصاصی بازاریاب"
            >
              {copiedReferral ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReferral ? 'لینک کپی شد!' : 'کپی لینک معرفی بازاریاب'}</span>
            </button>
          )}
        </div>

        {/* Marketer Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">🏢 مراکز ثبت‌شده</span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {toPersianDigits(assignedShops.length)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">💰 پورسانت مصوب</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {toPersianDigits(marketerInfo?.commission_rate || 10)}٪
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">👥 کل نوبت‌های مراکز</span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {toPersianDigits(totalMarketerTickets)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">📅 تاریخ عضویت</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block pt-1">
              {marketerInfo?.created_at ? formatLongJalaliDate(marketerInfo.created_at) : '—'}
            </span>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            داشبورد بازاریاب
          </button>

          <button
            onClick={() => setActiveTab('shops')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'shops'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>فروشگاه‌های ثبت‌شده</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'shops' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
              {toPersianDigits(assignedShops.length)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-colors ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            + ثبت مرکز جدید
          </button>
        </div>
      </div>

      {/* VIEW: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('shops')}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-7 h-7" />
              </div>
              <div className="text-center">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">لیست مراکز و فروشگاه‌ها</h3>
                <p className="text-[11px] text-slate-500 mt-1">{toPersianDigits(assignedShops.length)} فروشگاه ثبت‌شده توسط این بازاریاب</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-indigo-600 rounded-3xl shadow-md hover:bg-indigo-700 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7" />
              </div>
              <div className="text-center">
                <h3 className="font-extrabold text-white text-sm">ثبت مرکز و فروشگاه جدید</h3>
                <p className="text-[11px] text-indigo-100 mt-1">افزودن مرکز و تخصیص مستقیم به این بازاریاب</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* VIEW: SHOPS LIST */}
      {activeTab === 'shops' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-500" />
                فروشگاه‌های ثبت‌شده توسط {marketerProfile?.full_name || 'این بازاریاب'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                مراکز و اصنافی که توسط این بازاریاب وارد سامانه بی‌صف شده‌اند
              </p>
            </div>
            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1 rounded-xl text-xs font-black">
              {toPersianDigits(assignedShops.length)} مرکز
            </span>
          </div>

          {assignedShops.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Store className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">هنوز هیچ فروشگاهی برای این بازاریاب ثبت نشده است.</p>
              <button 
                onClick={() => setActiveTab('register')}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                + ثبت اولین فروشگاه
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {assignedShops.map((s) => {
                const shopQueueItems = allQueueItems.filter(q => q.shop_id === s.id);
                const activeQueue = shopQueueItems.filter(q => q.status === 'waiting' || q.status === 'serving').length;

                return (
                  <div key={s.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{s.name}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold">
                            {s.category} {s.subcategory ? `• ${s.subcategory}` : ''}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                            {activeQueue > 0 ? `${toPersianDigits(activeQueue)} نفر در صف` : 'صف خلوت'}
                          </span>
                        </div>

                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-slate-500 line-clamp-1">{s.address}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                          {s.phone && <span className="font-mono">تلفن: {toPersianDigits(s.phone)}</span>}
                          <span>شناسه: <code className="font-mono">{s.slug}</code></span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-2 bg-slate-200/70 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-700 dark:hover:bg-indigo-900/50 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                          title="ویرایش فروشگاه"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteShop(s.id, s.name)}
                          className="p-2 bg-slate-200/70 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-700 dark:hover:bg-rose-900/50 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                          title="حذف فروشگاه"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Attribution & Action buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex-wrap">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>ثبت‌شده توسط: {marketerProfile?.full_name || 'این بازاریاب'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const stats = AnalyticsService.getShopDetailedStats(s.id);
                            setSelectedShopStats({ shop: s, stats });
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>گزارش و آمار</span>
                        </button>

                        <button
                          onClick={() => openQrModal(s)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR کدها و چاپ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: REGISTER SHOP */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegisterShop} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                ثبت فروشگاه یا مرکز جدید
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                این مرکز به نام بازاریاب «{marketerProfile?.full_name || 'فعلی'}» ثبت و پورسانت به ایشان تخصیص داده می‌شود.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              نام کامل مرکز / کسب‌وکار
            </label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="مثال: نانوایی بربری نمونه"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                دسته‌بندی اصلی مرکز (صنف)
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نوع صنف / زیردسته
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
              >
                {categories
                  .find(c => c.name === category)
                  ?.subcategories.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  )) || <option value="">بدون زیردسته</option>}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              آدرس دقیق
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="تهران، خیابان..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              شماره تماس مرکز
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="02188888888"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono text-left outline-none"
            />
          </div>

          {/* Map Location Picker */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <MapLocationPicker
              position={[shopLat, shopLng]}
              onPositionChange={(pos) => {
                setShopLat(pos[0]);
                setShopLng(pos[1]);
              }}
            />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              مشخصات متصدی مرکز (مدیر فروشگاه)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نام و نام خانوادگی متصدی
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="مثال: علی رضایی"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  شماره موبایل متصدی
                </label>
                <input
                  type="tel"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="09121234567"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono text-left outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نام کاربری عبور متصدی
                </label>
                <input
                  type="text"
                  required
                  value={ownerUsername}
                  onChange={(e) => setOwnerUsername(e.target.value)}
                  placeholder="مثال: mot5"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono text-left outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  کلمه عبور متصدی
                </label>
                <PasswordInput
                  required
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="پیش‌فرض: admin"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-colors text-sm"
          >
            🚀 ثبت نهایی مرکز به نام بازاریاب
          </button>
        </form>
      )}

      {/* EDIT SHOP MODAL */}
      {editingShop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={handleSaveEditShop} className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500" />
                ویرایش اطلاعات فروشگاه
              </h3>
              <button
                type="button"
                onClick={() => setEditingShop(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام فروشگاه
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  صنف اصلی
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  زیردسته
                </label>
                <input
                  type="text"
                  value={editSubcategory}
                  onChange={(e) => setEditSubcategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                آدرس
              </label>
              <textarea
                required
                rows={2}
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                شماره تلفن
              </label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono text-left outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingShop(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                ذخیره تغییرات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAILED STATS MODAL */}
      {selectedShopStats && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    گزارش تفکیک‌شده و آمار روزانه: {selectedShopStats.shop.name}
                  </h3>
                  <p className="text-xs text-slate-500">گزارش کامل فعالیت، نوبت‌ها و عملکرد متصدی</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedShopStats(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Core KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 space-y-1 text-center">
                <div className="flex items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <Users className="w-4 h-4" />
                  <span className="text-[11px] font-bold">تعداد دریافت نوبت</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {toPersianDigits(selectedShopStats.stats.totalTickets)}
                </div>
                <div className="text-[10px] text-slate-500">امروز: {toPersianDigits(selectedShopStats.stats.todayTickets)} نوبت</div>
              </div>

              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 space-y-1 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-[11px] font-bold">مهمان به مشتری</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {toPersianDigits(selectedShopStats.stats.guestConversions)}
                </div>
                <div className="text-[10px] text-slate-500">مشتریان ثبت‌نام‌شده</div>
              </div>

              <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-900/60 space-y-1 text-center col-span-2 sm:col-span-1">
                <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[11px] font-bold">استفاده متصدی</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {toPersianDigits(selectedShopStats.stats.operatorUsages)}
                </div>
                <div className="text-[10px] text-slate-500">فراخوانی و ورود به اپ</div>
              </div>

            </div>

            {/* Secondary Metrics */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-around text-center text-xs">
              <div>
                <span className="text-slate-500 block">نوبت‌های تحویل‌شده</span>
                <span className="font-extrabold text-emerald-600 text-sm font-mono">{toPersianDigits(selectedShopStats.stats.servedTickets)}</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-slate-500 block">نوبت‌های لغوشده</span>
                <span className="font-extrabold text-rose-500 text-sm font-mono">{toPersianDigits(selectedShopStats.stats.cancelledTickets)}</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-slate-500 block">میانگین زمان انتظار</span>
                <span className="font-extrabold text-indigo-600 text-sm font-mono">{toPersianDigits(selectedShopStats.stats.avgWaitMinutes)} دقیقه</span>
              </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" />
                آمار تفکیک‌شده روزانه
              </h4>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-[11px] text-right">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-2.5">تاریخ</th>
                      <th className="p-2.5">کل نوبت‌ها</th>
                      <th className="p-2.5">تحویل‌شده</th>
                      <th className="p-2.5">لغوشده</th>
                      <th className="p-2.5">مهمان به مشتری</th>
                      <th className="p-2.5">استفاده متصدی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedShopStats.stats.dailyBreakdown.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400">اطلاعاتی برای روزهای قبل ثبت نشده است.</td>
                      </tr>
                    ) : (
                      selectedShopStats.stats.dailyBreakdown.map((row) => (
                        <tr key={row.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2.5 font-bold font-mono">{toPersianDigits(row.jalaliDate)}</td>
                          <td className="p-2.5 font-mono">{toPersianDigits(row.ticketsCount)}</td>
                          <td className="p-2.5 font-mono text-emerald-600">{toPersianDigits(row.servedCount)}</td>
                          <td className="p-2.5 font-mono text-rose-500">{toPersianDigits(row.cancelledCount)}</td>
                          <td className="p-2.5 font-mono text-indigo-600">{toPersianDigits(row.guestConversions)}</td>
                          <td className="p-2.5 font-mono text-purple-600">{toPersianDigits(row.operatorUsages)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setSelectedShopStats(null)}
                className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                بستن گزارش
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QrPrintStudio replaces DUAL QR MODAL */}
      {selectedShopQr && (
        <QrPrintStudio 
          shop={selectedShopQr.shop} 
          custQr={selectedShopQr.custQr} 
          opQr={selectedShopQr.opQr} 
          onClose={() => setSelectedShopQr(null)} 
        />
      )}

    </div>
  );
};

export default MarketerPage;
