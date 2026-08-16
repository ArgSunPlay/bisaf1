import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Store, ToggleLeft, ToggleRight, Settings, 
  CreditCard, Send, Lock, Unlock, FileText, CheckCircle2, AlertTriangle, ChevronDown, ArrowRight,
  Bot, Smartphone, MapPin, MessageSquare, ExternalLink, RefreshCw,
  Plus, Trash2, UserPlus, Tag, Percent, Briefcase, Award, Clock,
  ChevronUp, Layers, FolderPlus, Search, Check, X, AlertCircle, Key, Server, Database, Table,
  Printer, Sparkles, ShoppingBag
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { PaymentService } from '../services/paymentService';
import { 
  FeatureFlag, Profile, Shop, AuditLog, SystemIntegrationsConfig, 
  PaymentGatewaySettings, ServiceCategory, Marketer, BannerItem 
} from '../types';
import { toPersianDigits } from '../utils/jalali';
import { EnvTesterService, EnvVarStatus } from '../utils/envTester';
import { syncEnvVariablesWithBackend } from '../services/envService';
import { BotService } from '../services/botService';
import { BotCore, BotSendMessagePayload } from '../services/botCore';
import { DynamicTextEditor } from '../components/DynamicTextEditor';
import { DatabaseStudio } from '../components/DatabaseStudio';
import { PasswordInput } from '../components/PasswordInput';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<
    'overview' | 'database' | 'env_status' | 'users' | 'categories' | 'shops' | 'banners' | 'integrations' | 'payment' | 'flags' | 'audit' | 'data'
  >('overview');

  // Interactive In-App Confirmation Modal for System Buttons
  const [systemConfirmAction, setSystemConfirmAction] = useState<'reset_data' | 'clear_queues' | 'wipe_all' | null>(null);

  // Environment Variables & Integrations Diagnostic State
  const [envStatuses, setEnvStatuses] = useState<EnvVarStatus[]>([]);
  const [isTestingEnv, setIsTestingEnv] = useState<boolean>(false);
  const [quickKeyInput, setQuickKeyInput] = useState<Record<string, string>>({});

  // Main Data States
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [message, setMessage] = useState('');

  // Banner Management State
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitleInput, setBannerTitleInput] = useState('');
  const [bannerImageUrlInput, setBannerImageUrlInput] = useState('');
  const [bannerTargetUrlInput, setBannerTargetUrlInput] = useState('');
  const [bannerActiveInput, setBannerActiveInput] = useState(true);

  // Shop Banner & Printer assignment states
  const [newShopBannerId, setNewShopBannerId] = useState('');
  const [newShopThermalPrinter, setNewShopThermalPrinter] = useState(false);
  const [newShopDynamicMenu, setNewShopDynamicMenu] = useState(false);

  // User Management State
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'marketer' | 'shopkeeper' | 'customer' | 'admin'>('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Forms Visibility & Data
  const [showAddMarketer, setShowAddMarketer] = useState(false);
  const [newMarketerName, setNewMarketerName] = useState('');
  const [newMarketerPhone, setNewMarketerPhone] = useState('');
  const [newMarketerCommission, setNewMarketerCommission] = useState(10);
  const [newMarketerStatus, setNewMarketerStatus] = useState<'approved' | 'pending'>('approved');
  const [newMarketerCity, setNewMarketerCity] = useState('');
  const [newMarketerProvince, setNewMarketerProvince] = useState('تهران');
  const [selectedMarketerDetail, setSelectedMarketerDetail] = useState<Marketer | null>(null);
  const [editCommissionInput, setEditCommissionInput] = useState<number>(10);

  const [showAddShopkeeper, setShowAddShopkeeper] = useState(false);
  const [newShopkeeperName, setNewShopkeeperName] = useState('');
  const [newShopkeeperPhone, setNewShopkeeperPhone] = useState('');
  const [newShopkeeperUsername, setNewShopkeeperUsername] = useState('');
  const [assignedShopForKeeper, setAssignedShopForKeeper] = useState('');

  // Category Forms State
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Store');
  
  const [activeCatForSub, setActiveCatForSub] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');

  // Shop Creation Form State
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopCat, setNewShopCat] = useState('');
  const [newShopSubcat, setNewShopSubcat] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  
  // New shop owner fields
  const [newShopOwnerName, setNewShopOwnerName] = useState('');
  const [newShopOwnerUsername, setNewShopOwnerUsername] = useState('');
  const [newShopOwnerPassword, setNewShopOwnerPassword] = useState('');
  const [newShopOwnerPhone, setNewShopOwnerPhone] = useState('');
  const [newShopRequirePassword, setNewShopRequirePassword] = useState(false);
  const [newShopOperatorPassword, setNewShopOperatorPassword] = useState('');
  
  const [newShopOwnerId, setNewShopOwnerId] = useState('');
  const [newShopMarketerId, setNewShopMarketerId] = useState('');

  // System Integrations Config state
  const [integrations, setIntegrations] = useState<SystemIntegrationsConfig>({
    telegram_token: '',
    telegram_username: 'BiSafBot',
    telegram_enabled: true,
    bale_token: '',
    bale_username: 'BiSafBot',
    bale_enabled: true,
    eitaa_token: '',
    eitaa_username: 'BiSafBot',
    eitaa_enabled: true,
    rubika_token: '',
    rubika_username: 'BiSafBot',
    rubika_enabled: true,
    whatsapp_token: '',
    whatsapp_instance: '',
    whatsapp_enabled: false,
    neshan_key: '',
    kavenegar_key: '',
    melipayamak_key: '',
    ghasedak_key: '',
    farazsms_key: '',
    sms_provider: 'kavenegar',
    sms_sender_line: '10008000'
  });

  // Payment Gateway Config state
  const [paymentSettings, setPaymentSettings] = useState<PaymentGatewaySettings>({
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
  });

  // Bot Simulator Interactive State
  const [botSimProvider, setBotSimProvider] = useState<'telegram' | 'bale'>('telegram');
  const [botSimRole, setBotSimRole] = useState<'guest' | 'customer' | 'shopkeeper' | 'marketer' | 'admin'>('guest');
  const [botSimInput, setBotSimInput] = useState<string>('/start');
  const [botSimHistory, setBotSimHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string; markup?: any }>>([
    {
      sender: 'bot',
      text: '👋 سلام! به سامانه نوبت‌دهی هوشمند بی‌صف خوش آمدید. جهت تست روی دکمه‌های زیر کلیک کنید یا دستور دلخواه را بنویسید:'
    }
  ]);

  const handleSendBotSim = async (inputText?: string) => {
    const text = inputText || botSimInput;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: 'user' as const, text };
    setBotSimHistory(prev => [...prev, userMsg]);
    setBotSimInput('');

    // Prepare simulated session
    const chatId = 99887766;
    const session = BotCore.getSession(botSimProvider, chatId);
    session.current_role = botSimRole;

    const mockUpdate = {
      update_id: Date.now(),
      message: {
        message_id: Date.now(),
        from: { id: chatId, first_name: 'مدیر تست' },
        chat: { id: chatId, type: 'private' as const },
        date: Math.floor(Date.now() / 1000),
        text
      }
    };

    const reply = await BotCore.handleUpdate(botSimProvider, mockUpdate);
    if (reply) {
      setBotSimHistory(prev => [...prev, {
        sender: 'bot',
        text: reply.text,
        markup: reply.reply_markup
      }]);
    }
  };

  const [testPaymentResult, setTestPaymentResult] = useState<string | null>(null);
  const [baleWebhookUrl, setBaleWebhookUrl] = useState('');
  const [tgWebhookUrl, setTgWebhookUrl] = useState('');
  const [botActionStatus, setBotActionStatus] = useState<{ provider: string; text: string; success: boolean } | null>(null);

  const handleRegisterWebhook = async (provider: 'telegram' | 'bale') => {
    const token = provider === 'telegram' ? integrations.telegram_token : integrations.bale_token;
    if (!token || !token.trim()) {
      setBotActionStatus({ provider, text: '❌ توکن ربات وارد نشده است.', success: false });
      return;
    }
    const customUrl = provider === 'telegram' ? tgWebhookUrl : baleWebhookUrl;
    const defaultBase = integrations.supabase_url || import.meta.env.VITE_SUPABASE_URL || '';
    const defaultWebhook = defaultBase 
      ? `${defaultBase.replace(/\/$/, '')}/functions/v1/bot-webhook/${provider}`
      : '';
    const urlToUse = customUrl.trim() || defaultWebhook;

    if (!urlToUse) {
      setBotActionStatus({ 
        provider, 
        text: '❌ آدرس وب‌هوک مشخص نیست. لطفا آدرس HTTPS یا آدرس Supabase را وارد کنید.', 
        success: false 
      });
      return;
    }

    setBotActionStatus({ provider, text: 'در حال ارسال درخواست به API پیام‌رسان...', success: true });
    const res = await BotService.setBotWebhook(provider, token, urlToUse);
    if (res.success) {
      setBotActionStatus({ provider, text: `✅ ${res.message} (آدرس: ${urlToUse})`, success: true });
      runEnvTests(integrations, paymentSettings);
    } else {
      setBotActionStatus({ provider, text: `❌ خطا در ثبت وب‌هوک: ${res.error}`, success: false });
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const runEnvTests = async (customInteg?: SystemIntegrationsConfig, customPay?: PaymentGatewaySettings) => {
    setIsTestingEnv(true);
    const currentInteg = customInteg || StorageService.getSystemIntegrations();
    const currentPay = customPay || StorageService.getPaymentSettings();
    const results = await EnvTesterService.testAllIntegrations(currentInteg, currentPay);
    setEnvStatuses(results);
    setIsTestingEnv(false);
  };

  const loadAllData = () => {
    setFeatureFlags(StorageService.getFeatureFlags());
    setProfiles(StorageService.getProfiles());
    setShops(StorageService.getShops());
    setCategories(StorageService.getCategories());
    setMarketers(StorageService.getMarketers());
    setBanners(StorageService.getBanners());
    setAuditLogs(StorageService.getAuditLogs());
    const integ = StorageService.getSystemIntegrations();
    const pay = StorageService.getPaymentSettings();
    setIntegrations(integ);
    setPaymentSettings(pay);
    runEnvTests(integ, pay);
  };

  const syncAllEnvToDisk = (integ: SystemIntegrationsConfig, pay: PaymentGatewaySettings) => {
    syncEnvVariablesWithBackend({
      VITE_SUPABASE_URL: integ.supabase_url || import.meta.env.VITE_SUPABASE_URL || '',
      VITE_SUPABASE_ANON_KEY: integ.supabase_anon_key || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
      SUPABASE_URL: integ.supabase_url || import.meta.env.VITE_SUPABASE_URL || '',
      SUPABASE_PUBLISHABLE_KEY: integ.supabase_anon_key || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
      VITE_KAVENEGAR_KEY: integ.kavenegar_key || '',
      VITE_NESHAN_KEY: integ.neshan_key || '',
      VITE_TELEGRAM_BOT_TOKEN: integ.telegram_token || '',
      VITE_BALE_BOT_TOKEN: integ.bale_token || '',
      VITE_EITAA_BOT_TOKEN: integ.eitaa_token || '',
      VITE_RUBIKA_BOT_TOKEN: integ.rubika_token || '',
      VITE_ZARINPAL_MERCHANT_ID: pay.zarinpal_merchant_id || '',
      VITE_IDPAY_API_KEY: pay.idpay_api_key || ''
    });
  };

  const handleQuickFixEnvKey = (statusObj: EnvVarStatus, newKeyValue: string) => {
    if (!newKeyValue || !newKeyValue.trim()) return;

    let updatedInteg = { ...integrations };
    let updatedPay = { ...paymentSettings };

    if (statusObj.id === 'supabase') {
      const trimmed = newKeyValue.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        updatedInteg.supabase_url = trimmed;
      } else {
        updatedInteg.supabase_anon_key = trimmed;
      }
    } else if (statusObj.id === 'kavenegar') {
      updatedInteg.kavenegar_key = newKeyValue.trim();
    } else if (statusObj.id === 'telegram') {
      updatedInteg.telegram_token = newKeyValue.trim();
      updatedInteg.telegram_enabled = true;
    } else if (statusObj.id === 'bale') {
      updatedInteg.bale_token = newKeyValue.trim();
      updatedInteg.bale_enabled = true;
    } else if (statusObj.id === 'eitaa') {
      updatedInteg.eitaa_token = newKeyValue.trim();
      updatedInteg.eitaa_enabled = true;
    } else if (statusObj.id === 'rubika') {
      updatedInteg.rubika_token = newKeyValue.trim();
      updatedInteg.rubika_enabled = true;
    } else if (statusObj.id === 'neshan') {
      updatedInteg.neshan_key = newKeyValue.trim();
    } else if (statusObj.id === 'zarinpal') {
      updatedPay.zarinpal_merchant_id = newKeyValue.trim();
    } else if (statusObj.id === 'idpay') {
      updatedPay.idpay_api_key = newKeyValue.trim();
    }

    StorageService.saveSystemIntegrations(updatedInteg);
    StorageService.savePaymentSettings(updatedPay);
    setIntegrations(updatedInteg);
    setPaymentSettings(updatedPay);
    syncAllEnvToDisk(updatedInteg, updatedPay);

    setQuickKeyInput(prev => ({ ...prev, [statusObj.id]: '' }));
    showNotification(`✅ کلید ${statusObj.name} بروزرسانی و در فایل .env ذخیره شد. در حال تست خودکار اتصال...`);
    runEnvTests(updatedInteg, updatedPay);
  };

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3500);
  };

  // --- HANDLERS FOR MARKETERS & SHOPKEEPERS ---
  const handleAddMarketer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarketerPhone || !newMarketerName) return;

    // Check if profile exists or create new
    let existingProfile = profiles.find(p => p.phone === newMarketerPhone);
    let userId = existingProfile?.id;

    if (!existingProfile) {
      const newProfile: Profile = {
        id: `user-m-${Date.now()}`,
        phone: newMarketerPhone,
        full_name: newMarketerName,
        username: `marketer_${newMarketerPhone.slice(-4)}`,
        role: 'marketer',
        created_at: new Date().toISOString()
      };
      userId = newProfile.id;
      const updatedProfiles = [...profiles, newProfile];
      setProfiles(updatedProfiles);
      localStorage.setItem('bisaf_profiles', JSON.stringify(updatedProfiles));
      existingProfile = newProfile;
    } else {
      // Update role to marketer
      existingProfile.role = 'marketer';
      existingProfile.full_name = newMarketerName;
      localStorage.setItem('bisaf_profiles', JSON.stringify(profiles));
    }

    const newMarketerObj: Marketer = {
      id: `marketer-${Date.now()}`,
      user_id: userId!,
      full_name: newMarketerName,
      phone: newMarketerPhone,
      province: newMarketerProvince,
      city: newMarketerCity.trim() || 'تهران',
      commission_rate: newMarketerCommission,
      status: newMarketerStatus,
      created_at: new Date().toISOString(),
      profile: existingProfile
    };

    StorageService.saveMarketer(newMarketerObj);
    StorageService.addAuditLog({
      action: `تعریف بازاریاب جدید: ${newMarketerName} (${newMarketerPhone}) در ${newMarketerCity || 'تهران'} با پورسانت ${newMarketerCommission}%`,
      target_type: 'marketer',
      target_id: newMarketerObj.id
    });

    setMarketers(StorageService.getMarketers());
    setProfiles(StorageService.getProfiles());
    setShowAddMarketer(false);
    setNewMarketerName('');
    setNewMarketerPhone('');
    setNewMarketerCity('');
    showNotification('✅ بازاریاب جدید با موفقیت در سیستم تعریف شد.');
  };

  const handleDeleteMarketer = (marketerId: string, name: string) => {
    if (window.confirm(`آیا از حذف بازاریاب "${name}" اطمینان دارید؟`)) {
      const updated = StorageService.deleteMarketer(marketerId);
      setMarketers(updated);
      showNotification('✅ بازاریاب با موفقیت حذف شد.');
    }
  };

  const handleToggleMarketerStatus = (marketer: Marketer) => {
    const updatedStatus = marketer.status === 'approved' ? 'pending' : 'approved';
    const updated: Marketer = { ...marketer, status: updatedStatus };
    StorageService.saveMarketer(updated);
    setMarketers(StorageService.getMarketers());
    if (selectedMarketerDetail?.id === marketer.id) {
      setSelectedMarketerDetail(updated);
    }
    showNotification(`✅ وضعیت بازاریاب به "${updatedStatus === 'approved' ? 'تایید شده' : 'در انتظار'}" تغییر یافت.`);
  };

  const handleUpdateMarketerCommission = (marketer: Marketer, newRate: number) => {
    const rate = Math.max(1, Math.min(100, Number(newRate) || 10));
    const updated: Marketer = { ...marketer, commission_rate: rate, status: 'approved' };
    StorageService.saveMarketer(updated);
    setMarketers(StorageService.getMarketers());
    if (selectedMarketerDetail?.id === marketer.id) {
      setSelectedMarketerDetail(updated);
    }
    showNotification(`✅ درصد پورسانت بازاریاب "${marketer.full_name || marketer.profile?.full_name}" به ${toPersianDigits(rate)}٪ تعیین و وضعیت تایید شد.`);
  };

  const handleAddShopkeeper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopkeeperPhone || !newShopkeeperName) return;

    let existingProfile = profiles.find(p => p.phone === newShopkeeperPhone);
    let userId = existingProfile?.id;

    if (!existingProfile) {
      const newProfile: Profile = {
        id: `user-k-${Date.now()}`,
        phone: newShopkeeperPhone,
        full_name: newShopkeeperName,
        username: newShopkeeperUsername || `shopkeeper_${newShopkeeperPhone.slice(-4)}`,
        role: 'shopkeeper',
        created_at: new Date().toISOString()
      };
      userId = newProfile.id;
      const updatedProfiles = [...profiles, newProfile];
      setProfiles(updatedProfiles);
      localStorage.setItem('bisaf_profiles', JSON.stringify(updatedProfiles));
    } else {
      existingProfile.role = 'shopkeeper';
      existingProfile.full_name = newShopkeeperName;
      localStorage.setItem('bisaf_profiles', JSON.stringify(profiles));
    }

    // Assign to shop if selected
    if (assignedShopForKeeper) {
      const allShops = StorageService.getShops();
      const shop = allShops.find(s => s.id === assignedShopForKeeper);
      if (shop) {
        shop.owner_id = userId;
        StorageService.saveShop(shop);
        setShops(StorageService.getShops());
      }
    }

    StorageService.addAuditLog({
      action: `تعریف متصدی/پذیرنده جدید: ${newShopkeeperName} (${newShopkeeperPhone})`,
      target_type: 'shopkeeper',
      target_id: userId!
    });

    setProfiles(StorageService.getProfiles());
    setShowAddShopkeeper(false);
    setNewShopkeeperName('');
    setNewShopkeeperPhone('');
    setNewShopkeeperUsername('');
    setAssignedShopForKeeper('');
    showNotification('✅ متصدی/پذیرنده جدید با موفقیت تعریف شد.');
  };

  const handleDeleteProfile = (profileId: string, name: string) => {
    if (window.confirm(`آیا از حذف کاربر/پذیرنده "${name}" اطمینان دارید؟`)) {
      const updated = StorageService.deleteProfile(profileId);
      setProfiles(updated);
      showNotification('✅ کاربر با موفقیت از سیستم حذف شد.');
    }
  };

  // --- HANDLERS FOR SERVICE CATEGORIES ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const updatedCats = StorageService.addCategory(newCatName.trim(), newCatIcon);
    setCategories(updatedCats);
    setNewCatName('');
    setShowAddCatModal(false);
    showNotification(`✅ صنف/دسته‌بندی اصلی "${newCatName}" با موفقیت اضافه شد.`);
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    if (window.confirm(`آیا از حذف کامل صنف "${catName}" و تمامی زیردسته‌های آن اطمینان دارید؟`)) {
      const updatedCats = StorageService.deleteCategory(catId);
      setCategories(updatedCats);
      showNotification(`✅ دسته‌بندی "${catName}" با موفقیت حذف شد.`);
    }
  };

  const handleAddSubcategory = (e: React.FormEvent, catId: string) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const updatedCats = StorageService.addSubcategory(catId, newSubName.trim());
    setCategories(updatedCats);
    setNewSubName('');
    setActiveCatForSub(null);
    showNotification(`✅ نوع صنف/زیردسته "${newSubName}" با موفقیت اضافه شد.`);
  };

  const handleDeleteSubcategory = (catId: string, subId: string, subName: string) => {
    if (window.confirm(`آیا از حذف زیردسته "${subName}" اطمینان دارید؟`)) {
      const updatedCats = StorageService.deleteSubcategory(catId, subId);
      setCategories(updatedCats);
      showNotification(`✅ زیردسته "${subName}" با موفقیت حذف شد.`);
    }
  };

  // --- HANDLERS FOR SHOPS ---
  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim() || !newShopAddress.trim()) return;

    // Check if username already exists
    const profiles = StorageService.getProfiles();
    if (newShopOwnerUsername && profiles.some(p => p.username === newShopOwnerUsername)) {
      alert('این نام کاربری متصدی از قبل وجود دارد. لطفاً نام کاربری دیگری انتخاب کنید.');
      return;
    }

    // Create the shopkeeper profile if details are provided
    let createdOwnerId = newShopOwnerId;
    if (newShopOwnerUsername) {
      createdOwnerId = `user-mot-${Date.now()}`;
      const newOwner = {
        id: createdOwnerId,
        full_name: newShopOwnerName,
        username: newShopOwnerUsername,
        password: newShopOwnerPassword || 'admin',
        phone: newShopOwnerPhone || newShopPhone,
        role: 'shopkeeper' as const,
        created_at: new Date().toISOString()
      };
      StorageService.saveProfile(newOwner);
    }

    const slug = newShopName.toLowerCase().replace(/\s+/g, '-');
    const newShopObj: Shop = {
      id: `shop-${Date.now()}`,
      name: newShopName,
      slug,
      category: newShopCat || 'نانوایی‌ها',
      subcategory: newShopSubcat || undefined,
      address: newShopAddress,
      phone: newShopPhone,
      latitude: 35.6892,
      longitude: 51.3890,
      is_active: true,
      owner_id: createdOwnerId || undefined,
      marketer_id: newShopMarketerId || undefined,
      require_operator_password: newShopRequirePassword,
      operator_password: newShopOperatorPassword.trim() ? newShopOperatorPassword.trim() : undefined,
      banner_id: newShopBannerId || undefined,
      thermal_printer_enabled: newShopThermalPrinter,
      has_dynamic_menu: newShopDynamicMenu,
      created_at: new Date().toISOString()
    };

    StorageService.saveShop(newShopObj);
    StorageService.addAuditLog({
      action: `ثبت مرکز جدید توسط مدیر: ${newShopName} (${newShopCat})`,
      target_type: 'shop',
      target_id: newShopObj.id
    });

    setShops(StorageService.getShops());
    setShowAddShopModal(false);
    setNewShopName('');
    setNewShopAddress('');
    setNewShopPhone('');
    setNewShopOwnerName('');
    setNewShopOwnerUsername('');
    setNewShopOwnerPassword('');
    setNewShopOwnerPhone('');
    setNewShopRequirePassword(false);
    setNewShopOperatorPassword('');
    setNewShopBannerId('');
    setNewShopThermalPrinter(false);
    showNotification(`✅ مرکز/کسب‌وکار "${newShopName}" و متصدی با موفقیت ثبت شد.`);
  };

  const handleToggleShopOperatorPassword = (targetShop: Shop) => {
    const nextVal = !targetShop.require_operator_password;
    const updated: Shop = {
      ...targetShop,
      require_operator_password: nextVal
    };
    StorageService.saveShop(updated);
    setShops(StorageService.getShops());
    StorageService.addAuditLog({
      action: `تغییر وضعیت قفل رمز عبور متصدی برای مرکز: ${targetShop.name} (${nextVal ? 'فعال' : 'غیرفعال'})`,
      target_type: 'shop',
      target_id: targetShop.id
    });
    showNotification(
      nextVal 
        ? `🔐 الزام رمز عبور متصدی برای مرکز «${targetShop.name}» فعال شد.`
        : `🔓 ورود مستقیم متصدی برای مرکز «${targetShop.name}» تنظیم شد (بدون نیاز به رمز عبور).`
    );
  };

  const handleToggleShopThermalPrinter = (targetShop: Shop) => {
    const nextVal = !targetShop.thermal_printer_enabled;
    const updated: Shop = {
      ...targetShop,
      thermal_printer_enabled: nextVal
    };
    StorageService.saveShop(updated);
    setShops(StorageService.getShops());
    StorageService.addAuditLog({
      action: `تغییر وضعیت پرینتر حرارتی فیش برای مرکز: ${targetShop.name} (${nextVal ? 'فعال' : 'غیرفعال'})`,
      target_type: 'shop',
      target_id: targetShop.id
    });
    showNotification(
      nextVal 
        ? `🖨️ پرینتر حرارتی برای مرکز «${targetShop.name}» فعال شد.`
        : `⚪ پرینتر حرارتی برای مرکز «${targetShop.name}» غیرفعال شد.`
    );
  };

  const handleSetShopBanner = (targetShop: Shop, bannerId: string) => {
    const updated: Shop = {
      ...targetShop,
      banner_id: bannerId || undefined
    };
    StorageService.saveShop(updated);
    setShops(StorageService.getShops());
    showNotification(`🎨 بنر مرکز «${targetShop.name}» با موفقیت به‌روزرسانی شد.`);
  };

  const handleDeleteShop = (shopId: string, shopName: string) => {
    if (window.confirm(`آیا از حذف مرکز "${shopName}" اطمینان دارید؟`)) {
      const updated = StorageService.deleteShop(shopId);
      setShops(updated);
      showNotification(`✅ مرکز "${shopName}" حذف شد.`);
    }
  };

  // --- BANNER MANAGEMENT HANDLERS ---
  const handleOpenAddBannerModal = () => {
    setEditingBannerId(null);
    setBannerTitleInput('');
    setBannerImageUrlInput('');
    setBannerTargetUrlInput('');
    setBannerActiveInput(true);
    setShowAddBannerModal(true);
  };

  const handleOpenEditBannerModal = (banner: BannerItem) => {
    setEditingBannerId(banner.id);
    setBannerTitleInput(banner.title);
    setBannerImageUrlInput(banner.image_url);
    setBannerTargetUrlInput(banner.target_url || '');
    setBannerActiveInput(banner.is_active !== false);
    setShowAddBannerModal(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitleInput.trim() || !bannerImageUrlInput.trim()) {
      alert('لطفاً عنوان بنر و آدرس تصویر را وارد نمایید.');
      return;
    }

    const bannerObj: BannerItem = {
      id: editingBannerId || `banner-${Date.now()}`,
      title: bannerTitleInput.trim(),
      image_url: bannerImageUrlInput.trim(),
      target_url: bannerTargetUrlInput.trim() || undefined,
      is_active: bannerActiveInput,
      created_at: new Date().toISOString()
    };

    StorageService.saveBanner(bannerObj);
    setBanners(StorageService.getBanners());
    setShowAddBannerModal(false);
    setEditingBannerId(null);
    showNotification(`✅ بنر تبلیغاتی «${bannerObj.title}» با موفقیت ذخیره شد.`);
  };

  const handleDeleteBanner = (bannerId: string, title: string) => {
    if (window.confirm(`آیا از حذف بنر «${title}» اطمینان دارید؟`)) {
      StorageService.deleteBanner(bannerId);
      setBanners(StorageService.getBanners());
      showNotification(`✅ بنر «${title}» با موفقیت حذف شد.`);
    }
  };

  // --- OTHER CONFIG HANDLERS ---
  const handleToggleFlag = (key: string) => {
    const updated = featureFlags.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f);
    setFeatureFlags(updated);
    StorageService.saveFeatureFlags(updated);
    StorageService.addAuditLog({
      action: 'تغییر وضعیت پرچم ویژگی',
      target_type: 'feature_flag',
      target_id: key
    });
    showNotification(`✅ وضعیت پرچم ${key} تغییر یافت.`);
  };

  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSystemIntegrations(integrations);
    syncAllEnvToDisk(integrations, paymentSettings);
    setAuditLogs(StorageService.getAuditLogs());
    showNotification('✅ تنظیمات، کلیدها و متغیرها با موفقیت ذخیره و در فایل .env اعمال شدند.');
    runEnvTests(integrations, paymentSettings);
  };

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.savePaymentSettings(paymentSettings);
    syncAllEnvToDisk(integrations, paymentSettings);
    setAuditLogs(StorageService.getAuditLogs());
    showNotification('✅ تنظیمات درگاه‌های پرداخت ذخیره و در فایل .env ذخیره شدند.');
    runEnvTests(integrations, paymentSettings);
  };

  const handleTestPaymentGateway = async () => {
    setTestPaymentResult('در حال ایجاد و استعلام تراکنش تست درگاه...');
    const result = await PaymentService.createOrder(50000, undefined, 'تست اتصال درگاه در پنل مدیریت');
    if (result.success && result.authority) {
      const verify = await PaymentService.verifyPayment(result.authority, paymentSettings.default_gateway);
      setTestPaymentResult(`✅ تست موفقیت‌آمیز درگاه ${paymentSettings.default_gateway.toUpperCase()}: ${verify.message}`);
    } else {
      setTestPaymentResult(`❌ خطا در تست درگاه: ${result.message}`);
    }
  };

  // Filtering users
  const filteredProfiles = profiles.filter(p => {
    const matchesRole = userRoleFilter === 'all' || p.role === userRoleFilter;
    const matchesSearch = !userSearchTerm || 
      (p.full_name && p.full_name.includes(userSearchTerm)) || 
      p.phone.includes(userSearchTerm) ||
      (p.username && p.username.includes(userSearchTerm));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 pt-4 px-4 max-w-4xl mx-auto space-y-5 animate-fade-in">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-purple-500" />
          <span>بازگشت</span>
        </button>

        <span className="text-xs font-bold text-slate-500 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
          سامانه مدیریت جامع بی‌صف
        </span>
      </div>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 text-white rounded-3xl p-5 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Shield className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <h2 className="text-base font-black">پنل مدیریت ارشد سامانه بی‌صف (Admin Dashboard)</h2>
              <p className="text-xs text-purple-200">مدیریت متصدیان، بازاریابان، اصناف، ربات‌ها و تنظیمات فنی</p>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-600 text-white font-bold p-3.5 rounded-2xl text-xs text-center shadow-md animate-fade-in flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* System Environment Variables Alert Banner */}
      {envStatuses.length > 0 && (
        <div className="animate-fade-in">
          {envStatuses.some(s => s.status === 'missing' || s.status === 'error') ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <span>🔴 هشدار: برخی متغیرهای محیطی و کلیدهای API غیرفعال یا ناقص هستند!</span>
                  </h3>
                  <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                    تعداد <strong className="font-extrabold text-rose-600 dark:text-rose-400">{toPersianDigits(envStatuses.filter(s => s.status === 'missing' || s.status === 'error').length)}</strong> متغیر/سرویس نیاز به مقداردهی یا بررسی خطا دارد. لطفاً جهت عملکرد صحیح سرویس پیامک، ربات‌ها و درگاه‌ها آن‌ها را تنظیم کنید.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSection('env_status')}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm transition-colors self-end sm:self-center"
              >
                <Key className="w-4 h-4" />
                <span>بررسی و برطرف‌سازی خطاها</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-black">
                  ✅ تمامی متغیرهای محیطی و APIهای ارتباطی سیستم فعال و متصل هستند.
                </span>
              </div>
              <button
                onClick={() => setActiveSection('env_status')}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-800"
              >
                مشاهده جزئیات
              </button>
            </div>
          )}
        </div>
      )}

      {/* Admin Section Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-11 gap-1.5 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {[
          { id: 'overview', label: '📊 آمار' },
          { id: 'database', label: '🗄️ استودیو دیتابیس' },
          { id: 'env_status', label: '🔑 متغیرهای محیطی' },
          { id: 'texts', label: '📝 متن‌ها' },
          { id: 'users', label: '👥 کاربران' },
          { id: 'categories', label: '🏪 اصناف' },
          { id: 'shops', label: '🏬 مراکز' },
          { id: 'banners', label: '🎨 بنرها' },
          { id: 'integrations', label: '🤖 ربات‌ها' },
          { id: 'payment', label: '💳 درگاه‌ها' },
          { id: 'flags', label: '⚙️ پرچم‌ها' },
          { id: 'audit', label: '📜 لاگ‌ها' }
        ].map((tab) => {
          const hasEnvError = tab.id === 'env_status' && envStatuses.some(s => s.status === 'missing' || s.status === 'error');
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`py-2.5 px-2 text-[11px] font-bold rounded-xl transition-all text-center flex flex-col items-center justify-center gap-1 relative ${
                activeSection === tab.id
                  ? 'bg-purple-600 text-white shadow-md font-black scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {hasEnvError && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Confirmation Modal for System Operations */}
      {systemConfirmAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center animate-scale-up">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
              systemConfirmAction === 'wipe_all'
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                : systemConfirmAction === 'clear_queues'
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600'
            }`}>
              {systemConfirmAction === 'wipe_all' ? (
                <AlertTriangle className="w-8 h-8" />
              ) : systemConfirmAction === 'clear_queues' ? (
                <Trash2 className="w-8 h-8" />
              ) : (
                <RefreshCw className="w-8 h-8" />
              )}
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {systemConfirmAction === 'reset_data' && 'تأیید تولید و بازنشانی داده‌های نمونه؟'}
                {systemConfirmAction === 'clear_queues' && 'تأیید حذف تمامی نوبت‌ها از دیتابیس؟'}
                {systemConfirmAction === 'wipe_all' && '⚠️ هشدار بسیار مهم: حذف کامل کلیه داده‌ها؟'}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {systemConfirmAction === 'reset_data' && 'تمامی جداول با داده‌های تستی استاندارد، مشتریان نمونه، نوبت‌های در انتظار و سوابق تحویل‌شده جایگزین خواهند شد.'}
                {systemConfirmAction === 'clear_queues' && 'تمام نوبت‌های ثبت‌شده در تمامی مراکز و اصناف پاک شده و صف‌ها از صفر شروع می‌شوند.'}
                {systemConfirmAction === 'wipe_all' && 'تمامی مراکز، اصناف، بازاریابان، نوبت‌ها و مشتریان آزمایشی از دیتابیس پاک شده و تنها کاربر ادمین اصلی باقی می‌ماند.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSystemConfirmAction(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (systemConfirmAction === 'reset_data') {
                    await StorageService.resetToTestData();
                    setShops(StorageService.getShops());
                    setProfiles(StorageService.getProfiles());
                    setAuditLogs(StorageService.getAuditLogs());
                    setCategories(StorageService.getCategories());
                    setMarketers(StorageService.getMarketers());
                    showNotification('✅ داده‌های سیستم مستقیماً از پایگاه داده ابری Supabase بازخوانی و همگام‌سازی شدند.');
                  } else if (systemConfirmAction === 'clear_queues') {
                    await StorageService.clearAllQueueData();
                    setAuditLogs(StorageService.getAuditLogs());
                    showNotification('✅ تمامی نوبت‌های ثبت‌شده با موفقیت از دیتابیس ابری Supabase پاک شدند.');
                  } else if (systemConfirmAction === 'wipe_all') {
                    await StorageService.clearAllDataCompletely();
                    setShops([]);
                    setProfiles(StorageService.getProfiles());
                    setAuditLogs(StorageService.getAuditLogs());
                    showNotification('⚠️ تمامی مراکز و نوبت‌ها از دیتابیس ابری Supabase حذف گردیدند.');
                  }
                  setSystemConfirmAction(null);
                }}
                className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md ${
                  systemConfirmAction === 'wipe_all'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : systemConfirmAction === 'clear_queues'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                تأیید و اعمال در دیتابیس
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-xs text-slate-500 block">تعداد کل مراکز فعال</span>
              <span className="block text-2xl font-black text-purple-600 font-mono mt-1">
                {toPersianDigits(shops.length)}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-xs text-slate-500 block">بازاریابان فعال</span>
              <span className="block text-2xl font-black text-indigo-600 font-mono mt-1">
                {toPersianDigits(marketers.length)}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-xs text-slate-500 block">اصناف تعریف‌شده</span>
              <span className="block text-2xl font-black text-amber-600 font-mono mt-1">
                {toPersianDigits(categories.length)}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-xs text-slate-500 block">کل کاربران ثبت‌شده</span>
              <span className="block text-2xl font-black text-emerald-600 font-mono mt-1">
                {toPersianDigits(profiles.length)}
              </span>
            </div>
          </div>

          {/* Database Studio Quick Action Card */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Database className="w-6 h-6 text-indigo-300" />
                <h3 className="text-base font-black">استودیو مدیریت جداول دیتابیس (Database Studio)</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-700/80 text-[11px] font-bold text-indigo-200">
                  ۱۲ جدول فعال
                </span>
              </div>
              <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
                مشاهده مستقیم سطرها و ستون‌های تمام جداول دیتابیس، جستجو و مرتب‌سازی، ویرایش سریع سلول‌ها، ایجاد رکوردهای جدید و خروجی JSON/CSV.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveSection('database')}
                className="px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5"
              >
                <Table className="w-4 h-4 text-indigo-700" />
                <span>مشاهده و ویرایش جداول دیتابیس</span>
              </button>
              <button
                onClick={() => navigate('/admin/database')}
                className="px-3.5 py-2.5 bg-indigo-800/80 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-indigo-700"
                title="باز کردن در صفحه تمام‌عرض"
              >
                <ExternalLink className="w-4 h-4" />
                <span>صفحه مستقل</span>
              </button>
            </div>
          </div>

          {/* Quick Environment Variables Status Card in Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  وضعیت اتصالات و متغیرهای محیطی
                </h3>
              </div>
              <button
                onClick={() => setActiveSection('env_status')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>مدیریت کامل</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">اتصال موفق و فعال</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">
                    {toPersianDigits(envStatuses.filter(s => s.status === 'connected').length)} متغیر
                  </span>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block">مقداردهی نشده (Missing)</span>
                  <span className="text-xl font-black text-rose-600 font-mono">
                    {toPersianDigits(envStatuses.filter(s => s.status === 'missing').length)} متغیر
                  </span>
                </div>
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">خطای احراز هویت / شبکه</span>
                  <span className="text-xl font-black text-amber-600 font-mono">
                    {toPersianDigits(envStatuses.filter(s => s.status === 'error').length)} مورد
                  </span>
                </div>
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Test Data Management & Reset Control Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    مدیریت و ایجاد داده‌های نمونه و آزمایشی
                  </h3>
                  <p className="text-xs text-slate-500">تولید داده‌های تست (چند مشتری، نوبت‌ها و داده‌های تحویل‌شده ۱-۲ روز گذشته جهت تحلیل زمان انتظار) یا حذف کامل آنها</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSystemConfirmAction('reset_data')}
                className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-right hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors space-y-1 group"
              >
                <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span>تولید / بازنشانی داده‌های نمونه</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ایجاد مشتریان، مراکز، نوبت‌های در انتظار و سوابق زمان انتظار جهت تست کامل سیستم.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSystemConfirmAction('clear_queues')}
                className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-right hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors space-y-1"
              >
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold text-xs">
                  <Trash2 className="w-4 h-4" />
                  <span>حذف تمامی نوبت‌ها</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  پاک کردن تمامی نوبت‌های در انتظار، در حال فراخوانی و تحویل‌شده جهت شروع از صفر.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSystemConfirmAction('wipe_all')}
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-right hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors space-y-1"
              >
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>حذف کامل کلیه داده‌ها</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  پاکسازی کامل تمام جداول و استوریج پروژه (به‌جز کاربر مدیر اصلی).
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1.5: ENVIRONMENT VARIABLES & INTEGRATIONS DIAGNOSTIC STATUS */}
      {activeSection === 'env_status' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-600" />
                  پایش خودکار و تست زنده متغیرهای محیطی و کلیدهای API
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  شناسایی متغیرهای قرمز و مقداردهی‌نشده و بررسی خودکار اتصال با نشان دادن علل دقیق خطا
                </p>
              </div>

              <button
                onClick={() => runEnvTests()}
                disabled={isTestingEnv}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isTestingEnv ? 'animate-spin' : ''}`} />
                <span>{isTestingEnv ? 'در حال تست اتصالات...' : 'تست مجدد هوشمند اتصالات'}</span>
              </button>
            </div>

            {/* DIAGNOSTIC CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {envStatuses.map((item) => {
                const isError = item.status === 'missing' || item.status === 'error';
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isError
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 shadow-sm'
                        : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 shadow-sm'
                    }`}
                  >
                    {/* Header: Title & Badge */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5 dir-ltr text-right">
                          {item.envKey}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        {item.status === 'connected' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-sm">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>ارتباط فعال (✅)</span>
                          </span>
                        ) : item.status === 'missing' ? (
                          <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-sm animate-pulse">
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                            <span>مقداردهی نشده (🔴)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-sm">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>خطای اتصال (🔴)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Box & Error Cause */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500 font-sans">مقدار فعلی:</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 dir-ltr">
                          {item.value || 'پوچ / خالی'}
                        </span>
                      </div>

                      {/* Error or Success Message */}
                      {isError ? (
                        <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100 text-xs font-bold space-y-1">
                          <div className="flex items-center gap-1.5 font-black text-rose-700 dark:text-rose-300">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>علت دقیق عدم برقراری ارتباط:</span>
                          </div>
                          <p className="text-[11px] font-normal leading-relaxed text-rose-800 dark:text-rose-200 pr-5">
                            {item.errorMessage}
                          </p>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-[11px]">{item.successMessage}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Fix / Quick Update Input */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 block">
                        تنظیم سریع مقدار جدید و تست لحظه‌ای:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={quickKeyInput[item.id] || ''}
                          onChange={(e) => setQuickKeyInput({ ...quickKeyInput, [item.id]: e.target.value })}
                          placeholder="ورود مقدار یا کلید جدید API..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono outline-none text-left dir-ltr"
                        />
                        <button
                          onClick={() => handleQuickFixEnvKey(item, quickKeyInput[item.id])}
                          disabled={!quickKeyInput[item.id]}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
                        >
                          ثبت و تست
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION TEXTS: CMS FOR DYNAMIC TEXTS */}
      {activeSection === 'texts' && (
        <DynamicTextEditor />
      )}

      {/* SECTION 2: MARKETERS & SHOPKEEPERS MANAGEMENT */}
      {activeSection === 'users' && (
        <div className="space-y-5">
          {/* Action Header & Modals Buttons */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  مدیریت متصدیان صنف، بازاریابان و کاربران
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  امکان تعریف بازاریاب جدید، تعیین متصدی صنف، مشاهده اطلاعات کامل و مدیریت دسترسی‌ها
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate('/marketer')}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <ExternalLink className="w-4 h-4 text-indigo-500" />
                  <span>پرتال بازاریابی و ثبت مراکز</span>
                </button>

                <button
                  onClick={() => setShowAddMarketer(true)}
                  className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Award className="w-4 h-4" />
                  <span>تعریف بازاریاب جدید</span>
                </button>

                <button
                  onClick={() => setShowAddShopkeeper(true)}
                  className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>تعریف متصدی صنف</span>
                </button>
              </div>
            </div>

            {/* FORM: ADD NEW MARKETER */}
            {showAddMarketer && (
              <form onSubmit={handleAddMarketer} className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    تعریف و ایجاد حساب بازاریاب جدید
                  </h4>
                  <button type="button" onClick={() => setShowAddMarketer(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">نام و نام خانوادگی</label>
                    <input
                      type="text"
                      required
                      value={newMarketerName}
                      onChange={(e) => setNewMarketerName(e.target.value)}
                      placeholder="مثال: علی محمدی"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">شماره همراه</label>
                    <input
                      type="tel"
                      required
                      value={newMarketerPhone}
                      onChange={(e) => setNewMarketerPhone(e.target.value)}
                      placeholder="09123456789"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-left outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">درصد پورسانت (%)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={newMarketerCommission}
                      onChange={(e) => setNewMarketerCommission(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">وضعیت حساب</label>
                    <select
                      value={newMarketerStatus}
                      onChange={(e) => setNewMarketerStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                    >
                      <option value="approved">تایید شده (فعال)</option>
                      <option value="pending">در انتظار تایید</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs">
                    ثبت و ذخیره بازاریاب
                  </button>
                </div>
              </form>
            )}

            {/* FORM: ADD NEW SHOPKEEPER / ATTENDANT */}
            {showAddShopkeeper && (
              <form onSubmit={handleAddShopkeeper} className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    تعریف و ایجاد حساب متصدی صنف (پذیرنده)
                  </h4>
                  <button type="button" onClick={() => setShowAddShopkeeper(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">نام متصدی / مسئول</label>
                    <input
                      type="text"
                      required
                      value={newShopkeeperName}
                      onChange={(e) => setNewShopkeeperName(e.target.value)}
                      placeholder="مثال: رضا علوی (نانوا)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">شماره همراه</label>
                    <input
                      type="tel"
                      required
                      value={newShopkeeperPhone}
                      onChange={(e) => setNewShopkeeperPhone(e.target.value)}
                      placeholder="09121112233"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-left outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">نام کاربری اختصاصی</label>
                    <input
                      type="text"
                      value={newShopkeeperUsername}
                      onChange={(e) => setNewShopkeeperUsername(e.target.value)}
                      placeholder="ebrahimi_bakery"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">انتخاب مرکز مربوطه</label>
                    <select
                      value={assignedShopForKeeper}
                      onChange={(e) => setAssignedShopForKeeper(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                    >
                      <option value="">بدون تخصیص اولیه</option>
                      {shops.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs">
                    ثبت و تعریف متصدی
                  </button>
                </div>
              </form>
            )}

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="relative w-full sm:w-auto sm:flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="جستجو بر اساس نام، شماره همراه یا نام کاربری..."
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
                {[
                  { id: 'all', label: 'همه' },
                  { id: 'marketer', label: 'بازاریاب‌ها' },
                  { id: 'shopkeeper', label: 'متصدیان صنف' },
                  { id: 'customer', label: 'مشتریان' },
                  { id: 'admin', label: 'مدیران' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setUserRoleFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                      userRoleFilter === f.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PROFILES & MARKETERS TABLE / CARDS */}
            <div className="space-y-2.5 pt-2">
              {filteredProfiles.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">کاربری با این مشخصات یافت نشد.</p>
              ) : (
                filteredProfiles.map((user) => {
                  const marketerRecord = marketers.find(m => m.user_id === user.id || m.profile?.phone === user.phone);
                  const userShops = shops.filter(s => s.owner_id === user.id || s.marketer_id === user.id);

                  return (
                    <div
                      key={user.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {user.full_name || user.username || 'کاربر سیستم'}
                          </span>

                          {/* Role Badge */}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                            user.role === 'marketer' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                            user.role === 'shopkeeper' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                            'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {user.role === 'admin' ? 'مدیر ارشد' :
                             user.role === 'marketer' ? 'بازاریاب' :
                             user.role === 'shopkeeper' ? 'متصدی صنف' : 'مشتری'}
                          </span>

                          {marketerRecord && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              marketerRecord.status === 'approved' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'
                            }`}>
                              {marketerRecord.status === 'approved' ? 'تایید شده' : 'در انتظار تایید'}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-mono">📱 {toPersianDigits(user.phone)}</span>
                          {user.username && <span className="font-mono">👤 @{user.username}</span>}
                          {marketerRecord && (
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              💰 پورسانت: {toPersianDigits(marketerRecord.commission_rate)}٪
                            </span>
                          )}
                          {userShops.length > 0 && (
                            <span className="text-purple-600 dark:text-purple-400 font-bold">
                              🏢 {toPersianDigits(userShops.length)} مرکز مرتبط
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons for profile */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                        {(marketerRecord || user.role === 'marketer') && (
                          <button
                            onClick={() => navigate(`/marketer?id=${marketerRecord?.id || user.id}`)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors border border-indigo-200 dark:border-indigo-800"
                            title="مشاهده مراکز ثبت‌شده و اطلاعات کامل بازاریاب"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>مراکز و اطلاعات</span>
                          </button>
                        )}

                        {marketerRecord && (
                          <>
                            <button
                              onClick={() => handleToggleMarketerStatus(marketerRecord)}
                              className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-bold hover:bg-slate-300 transition-colors"
                            >
                              {marketerRecord.status === 'approved' ? 'تعلیق بازاریاب' : 'تایید بازاریاب'}
                            </button>
                            <button
                              onClick={() => { setSelectedMarketerDetail(marketerRecord); setEditCommissionInput(marketerRecord.commission_rate); }}
                              className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-lg text-[11px] font-bold hover:bg-amber-100 transition-colors flex items-center gap-1 border border-amber-200 dark:border-amber-800"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <span>مدیریت مالی</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDeleteProfile(user.id, user.full_name || user.phone)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="حذف کاربر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SERVICE CATEGORIES & SUBCATEGORIES MANAGEMENT */}
      {activeSection === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-500" />
                  تعریف و مدیریت اصناف، مراکز و زیرمجموعه‌ها
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  دسته‌بندی‌های پیش‌فرض مراکز تشکیل صف در ایران (نانوایی، مطب، بانک، معاینه فنی...) با امکان اضافه و حذف تک‌تک آن‌ها
                </p>
              </div>

              <button
                onClick={() => setShowAddCatModal(true)}
                className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن صنف/دسته‌بندی جدید</span>
              </button>
            </div>

            {/* MODAL / FORM FOR ADDING MAIN CATEGORY */}
            {showAddCatModal && (
              <form onSubmit={handleAddCategory} className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-200">افزودن صنف یا دسته‌بندی اصلی جدید</h4>
                  <button type="button" onClick={() => setShowAddCatModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">نام صنف / مرکز (مثلاً نانوایی‌ها)</label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="نام صنف جدید..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">ایکون یا نماد</label>
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                    >
                      <option value="Store">فروشگاه / صنف (Store)</option>
                      <option value="Stethoscope">پزشکی و درمان (Stethoscope)</option>
                      <option value="Building">اداری و عمومی (Building)</option>
                      <option value="Car">خودرو و حمل‌ونقل (Car)</option>
                      <option value="Utensils">خوراکی و غذا (Utensils)</option>
                      <option value="Scissors">زیبایی و آرایش (Scissors)</option>
                      <option value="Package">پست و مرسولات (Package)</option>
                      <option value="Ticket">تفریح و ورزش (Ticket)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs">
                    ثبت دسته‌بندی اصلی
                  </button>
                </div>
              </form>
            )}

            {/* CATEGORIES & SUBCATEGORIES TREE LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        {toPersianDigits(cat.subcategories.length)} نوع/زیردسته
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                      title="حذف این صنف و زیردسته‌های آن"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subcategories Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        <span>{sub.name}</span>
                        <button
                          onClick={() => handleDeleteSubcategory(cat.id, sub.id, sub.name)}
                          className="text-slate-400 hover:text-rose-500 transition-colors ml-0.5"
                          title="حذف این زیردسته"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Form to Add Subcategory to this Category */}
                  {activeCatForSub === cat.id ? (
                    <form onSubmit={(e) => handleAddSubcategory(e, cat.id)} className="flex items-center gap-2 pt-2 animate-fade-in">
                      <input
                        type="text"
                        required
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        placeholder="نام نوع/زیردسته جدید..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                      />
                      <button type="submit" className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs">
                        ثبت
                      </button>
                      <button type="button" onClick={() => setActiveCatForSub(null)} className="p-1.5 text-slate-400">
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => { setActiveCatForSub(cat.id); setNewSubName(''); }}
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن زیردسته به {cat.name}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SHOPS MANAGEMENT */}
      {activeSection === 'shops' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-purple-600" />
                  مدیریت مراکز، فروشگاه‌ها و صنف‌ها ({toPersianDigits(shops.length)} مرکز)
                </h3>
              </div>

              <button
                onClick={() => setShowAddShopModal(true)}
                className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت مرکز جدید توسط مدیر</span>
              </button>
            </div>

            {/* FORM FOR ADDING NEW SHOP */}
            {showAddShopModal && (
              <form onSubmit={handleAddShop} className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-purple-900 dark:text-purple-200">ثبت مرکز یا کسب‌وکار جدید در سیستم</h4>
                  <button type="button" onClick={() => setShowAddShopModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">نام کامل کسب‌وکار</label>
                    <input
                      type="text"
                      required
                      value={newShopName}
                      onChange={(e) => setNewShopName(e.target.value)}
                      placeholder="مثال: درمانگاه شبانه‌روزی شفا"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">صنف / دسته‌بندی اصلی</label>
                    <select
                      value={newShopCat}
                      onChange={(e) => {
                        setNewShopCat(e.target.value);
                        const c = categories.find(cat => cat.name === e.target.value);
                        if (c && c.subcategories.length > 0) setNewShopSubcat(c.subcategories[0].name);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">نوع صنف / زیردسته</label>
                    <select
                      value={newShopSubcat}
                      onChange={(e) => setNewShopSubcat(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                    >
                      {categories.find(c => c.name === (newShopCat || categories[0]?.name))?.subcategories.map(sub => (
                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">تلفن تماس مرکز</label>
                    <input
                      type="tel"
                      value={newShopPhone}
                      onChange={(e) => setNewShopPhone(e.target.value)}
                      placeholder="02188888888"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-left outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">آدرس کامل مرکز</label>
                  <input
                    type="text"
                    required
                    value={newShopAddress}
                    onChange={(e) => setNewShopAddress(e.target.value)}
                    placeholder="تهران، خیابان..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                  />
                </div>

                {/* Banner & Thermal Printer Config in Shop Creation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-purple-200/50 dark:border-purple-800/50 pt-3">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-200 mb-1">
                      بنر تبلیغاتی اختصاصی مرکز:
                    </label>
                    <select
                      value={newShopBannerId}
                      onChange={(e) => setNewShopBannerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                    >
                      <option value="">بدون بنر اختصاصی (پیش‌فرض سیستم)</option>
                      {banners.map(b => (
                        <option key={b.id} value={b.id}>{b.title} {b.is_active ? '🟢' : '⚪ (غیرفعال)'}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <span className="flex items-center gap-1.5">
                        <Printer className="w-4 h-4 text-purple-600" />
                        <span>فعال‌سازی چاپ فیش حرارتی متصل به صندوق:</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={newShopThermalPrinter}
                        onChange={(e) => setNewShopThermalPrinter(e.target.checked)}
                        className="w-4 h-4 accent-purple-600 cursor-pointer"
                      />
                    </label>
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <span>فعال‌سازی منوی محصولات/رستوران:</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={newShopDynamicMenu}
                        onChange={(e) => setNewShopDynamicMenu(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-purple-200/50 dark:border-purple-800/50 pt-3 mt-2">
                  <h4 className="text-[11px] font-extrabold text-purple-900 dark:text-purple-200 mb-2">
                    مشخصات متصدی مرکز (در صورت نیاز به ایجاد اکانت جدید)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <input
                        type="text"
                        value={newShopOwnerName}
                        onChange={(e) => setNewShopOwnerName(e.target.value)}
                        placeholder="نام متصدی"
                        className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        value={newShopOwnerPhone}
                        onChange={(e) => setNewShopOwnerPhone(e.target.value)}
                        placeholder="موبایل (0912...)"
                        className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-mono text-left outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={newShopOwnerUsername}
                        onChange={(e) => setNewShopOwnerUsername(e.target.value)}
                        placeholder="نام کاربری (الزامی)"
                        className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-mono text-left outline-none"
                      />
                    </div>
                    <div>
                      <PasswordInput
                        value={newShopOwnerPassword}
                        onChange={(e) => setNewShopOwnerPassword(e.target.value)}
                        placeholder="رمز عبور (پیش‌فرض: admin)"
                        className="py-1.5 text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-purple-200/50 dark:border-purple-800/50 pt-3 mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-1.5 cursor-pointer">
                      <Lock className="w-3.5 h-3.5 text-purple-600" />
                      <span>الزام ورود با رمز عبور متصدی (پیش‌فرض: غیرفعال / خاموش)</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={newShopRequirePassword}
                      onChange={(e) => setNewShopRequirePassword(e.target.checked)}
                      className="w-4 h-4 accent-purple-600"
                    />
                  </div>
                  {newShopRequirePassword && (
                    <div className="animate-fade-in">
                      <PasswordInput
                        value={newShopOperatorPassword}
                        onChange={(e) => setNewShopOperatorPassword(e.target.value)}
                        placeholder="رمز عبور متصدی (اختیاری - در صورت خالی بودن، رمز اکانت متصدی اعمال می‌شود)"
                        className="border-purple-300 dark:border-purple-700"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs">
                    ثبت نهایی مرکز
                  </button>
                </div>
              </form>
            )}

            {/* SHOPS LIST */}
            <div className="space-y-2.5">
              {shops.map((s) => {
                const assignedMarketer = marketers.find(m => m.id === s.marketer_id || m.user_id === s.marketer_id);
                const marketerProfileObj = assignedMarketer?.profile || profiles.find(p => p.id === s.marketer_id);
                const assignedBanner = banners.find(b => b.id === s.banner_id);

                return (
                  <div
                    key={s.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">{s.name}</span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold">
                            {s.category} {s.subcategory ? `• ${s.subcategory}` : ''}
                          </span>
                          {marketerProfileObj && (
                            <button
                              onClick={() => navigate(`/marketer?id=${assignedMarketer?.id || s.marketer_id}`)}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold hover:underline flex items-center gap-1"
                              title="مشاهده پنل بازاریاب این مرکز"
                            >
                              <Award className="w-3 h-3 text-indigo-500" />
                              <span>بازاریاب: {marketerProfileObj.full_name || marketerProfileObj.username || 'مشاهده'}</span>
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{s.address || 'بدون آدرس ثبت‌شده'}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Thermal POS Printer Per-Shop Toggle */}
                        <button
                          onClick={() => handleToggleShopThermalPrinter(s)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors border ${
                            s.thermal_printer_enabled
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                          }`}
                          title="فعال‌سازی یا غیرفعال‌سازی چاپ فیش حرارتی متصل به صندوق"
                        >
                          <Printer className={`w-3.5 h-3.5 ${s.thermal_printer_enabled ? 'text-purple-600' : 'text-slate-400'}`} />
                          <span>فیش حرارتی: {s.thermal_printer_enabled ? 'فعال' : 'غیرفعال'}</span>
                        </button>

                        {/* Operator Password Security Quick Toggle Button */}
                        {s.require_operator_password ? (
                          <button
                            onClick={() => handleToggleShopOperatorPassword(s)}
                            className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                            title="رمز عبور متصدی فعال است. کلیک کنید تا غیرفعال شود."
                          >
                            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>رمز متصدی: الزامی</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleShopOperatorPassword(s)}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="ورود متصدی مستقیم و بدون رمز است. کلیک کنید تا قفل رمز فعال شود."
                          >
                            <Unlock className="w-3.5 h-3.5 text-slate-400" />
                            <span>ورود متصدی: مستقیم</span>
                          </button>
                        )}

                        {s.marketer_id && (
                          <button
                            onClick={() => navigate(`/marketer?id=${assignedMarketer?.id || s.marketer_id}`)}
                            className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-slate-300 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>پنل بازاریاب</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteShop(s.id, s.name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg transition-colors"
                          title="حذف مرکز"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Shop Banner Selection Row */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 shrink-0">
                        🎨 بنر تبلیغاتی مرکز:
                      </span>
                      <select
                        value={s.banner_id || ''}
                        onChange={(e) => handleSetShopBanner(s, e.target.value)}
                        className="flex-1 max-w-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                      >
                        <option value="">پیش‌فرض سامانه</option>
                        {banners.map(b => (
                          <option key={b.id} value={b.id}>{b.title} {b.is_active ? '🟢' : '⚪ (غیرفعال)'}</option>
                        ))}
                      </select>
                      {assignedBanner && (
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold truncate">
                          ({assignedBanner.title})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: BANNER MANAGEMENT STUDIO (بخش اختصاصی مدیریت بنرهای تبلیغاتی) */}
      {activeSection === 'banners' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  مدیریت بنرهای تبلیغاتی کلیک‌خور و هوشمند ({toPersianDigits(banners.length)} بنر)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  تعریف بنرهای تبلیغاتی با حفظ دقیق تناسب تصویر (Aspect Ratio) بدون بیرون‌زدگی یا دفرمگی و اتصال به مراکز
                </p>
              </div>

              <button
                onClick={handleOpenAddBannerModal}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ ایجاد بنر تبلیغاتی جدید</span>
              </button>
            </div>

            {/* Standard Size Guidelines Box */}
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 space-y-1.5 text-xs">
              <h4 className="font-black flex items-center gap-1.5">
                <span>📐 راهنمای ابعاد و استانداردهای طراحی بنر:</span>
              </h4>
              <p className="text-[11px] leading-relaxed text-purple-800 dark:text-purple-300">
                • <strong>ابعاد پیشنهادی استاندارد:</strong> ۱۲۰۰ در ۴۰۰ پیکسل (نسبت ابعاد ۳:۱ - Aspect Ratio 3:1).<br />
                • <strong>حفظ کامل تناسب تصویر:</strong> سیستم بی‌صف به طور هوشمند از قابلیت تطبیق خودکار کانتینر استفاده می‌کند تا هیچ عکسی دفرمه یا کشیده نشود و تصویر به طور کامل در کادر نمایش داده شود.
              </p>
            </div>

            {/* BANNERS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((banner) => {
                const assignedCount = shops.filter(s => s.banner_id === banner.id).length;
                return (
                  <div 
                    key={banner.id} 
                    className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {banner.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          banner.is_active 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                          {banner.is_active ? '🟢 فعال' : '⚪ غیرفعال'}
                        </span>
                      </div>

                      {/* Aspect Ratio Preserved Live Image Preview */}
                      <div className="w-full bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-700 flex items-center justify-center min-h-[90px] max-h-[140px]">
                        <img 
                          src={banner.image_url} 
                          alt={banner.title} 
                          className="max-h-[130px] w-auto max-w-full object-contain mx-auto"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>

                      {banner.target_url && (
                        <div className="text-[11px] text-slate-500 font-mono truncate flex items-center gap-1">
                          <ExternalLink className="w-3 h-3 shrink-0 text-purple-500" />
                          <span className="truncate">{banner.target_url}</span>
                        </div>
                      )}

                      <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                        🏢 تخصیص‌یافته به {toPersianDigits(assignedCount)} مرکز
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => handleOpenEditBannerModal(banner)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                      >
                        ویرایش
                      </button>

                      <button
                        onClick={() => handleDeleteBanner(banner.id, banner.title)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                        title="حذف بنر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT BANNER MODAL */}
      {showAddBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {editingBannerId ? 'ویرایش بنر تبلیغاتی' : 'ایجاد و ثبت بنر تبلیغاتی جدید'}
              </h3>
              <button onClick={() => setShowAddBannerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان بنر:
                </label>
                <input
                  type="text"
                  required
                  value={bannerTitleInput}
                  onChange={(e) => setBannerTitleInput(e.target.value)}
                  placeholder="مثال: جشنواره تخفیف ویژه بهاره نان داغ"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  آدرس تصویر بنر (Image URL):
                </label>
                <input
                  type="url"
                  required
                  value={bannerImageUrlInput}
                  onChange={(e) => setBannerImageUrlInput(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                />
              </div>

              {/* Real-time Aspect Ratio Preview */}
              {bannerImageUrlInput.trim() && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">پیش‌نمایش زنده با حفظ کامل نسبت تصویر:</span>
                  <div className="w-full bg-slate-900 rounded-2xl p-2 border border-slate-700 flex items-center justify-center min-h-[100px] max-h-[160px] overflow-hidden">
                    <img 
                      src={bannerImageUrlInput} 
                      alt="پیش‌نمایش بنر" 
                      className="max-h-[140px] w-auto max-w-full object-contain mx-auto rounded-lg shadow"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  لینک مقصد کلیک (Target Link - اختیاری):
                </label>
                <input
                  type="url"
                  value={bannerTargetUrlInput}
                  onChange={(e) => setBannerTargetUrlInput(e.target.value)}
                  placeholder="https://bisaf.ir یا https://t.me/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">وضعیت فعال بودن بنر:</span>
                <input
                  type="checkbox"
                  checked={bannerActiveInput}
                  onChange={(e) => setBannerActiveInput(e.target.checked)}
                  className="w-4 h-4 accent-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBannerModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs"
                >
                  ذخیره بنر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 5: SYSTEM BOTS & INTEGRATIONS CONFIG */}
      {activeSection === 'integrations' && (
        <form onSubmit={handleSaveIntegrations} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                تنظیمات ربات‌ها و APIهای ارتباطی سیستم
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                توکن ربات‌های تلگرام، بله، ایتا، روبیکا، واتساپ و کلیدهای نقشه و سامانه پیامک
              </p>
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              ذخیره تمامی توکن‌ها
            </button>
          </div>

          {/* Messenger Bots Tokens */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 border-r-4 border-purple-600 pr-2">
              ۱. توکن ربات‌های پیام‌رسان
            </h4>

            {botActionStatus && (
              <div className={`p-3 rounded-2xl text-xs font-bold border ${botActionStatus.success ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/40 text-red-600 border-red-200 dark:border-red-800'}`}>
                {botActionStatus.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Telegram */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    ✈️ ربات تلگرام (Telegram)
                  </span>
                  <input
                    type="checkbox"
                    checked={integrations.telegram_enabled}
                    onChange={(e) => setIntegrations({ ...integrations, telegram_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">توکن ربات (Bot Token):</label>
                  <input
                    type="text"
                    value={integrations.telegram_token}
                    onChange={(e) => setIntegrations({ ...integrations, telegram_token: e.target.value })}
                    placeholder="Bot Token (e.g. 123456789:ABCdef...)"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">آدرس وب‌هوک (Webhook URL):</label>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      value={tgWebhookUrl}
                      onChange={(e) => setTgWebhookUrl(e.target.value)}
                      placeholder={integrations.supabase_url ? `${integrations.supabase_url}/functions/v1/bot-webhook/telegram` : "https://..."}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRegisterWebhook('telegram')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                    >
                      ثبت Webhook
                    </button>
                  </div>
                </div>
              </div>

              {/* Bale */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    🌴 ربات پیام‌رسان بله (Bale)
                  </span>
                  <input
                    type="checkbox"
                    checked={integrations.bale_enabled}
                    onChange={(e) => setIntegrations({ ...integrations, bale_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">توکن ربات بله (Bale Bot Token):</label>
                  <input
                    type="text"
                    value={integrations.bale_token}
                    onChange={(e) => setIntegrations({ ...integrations, bale_token: e.target.value })}
                    placeholder="Bale Token (e.g. 123456789:ABCdef...)"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">آدرس وب‌هوک بله (Webhook URL):</label>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      value={baleWebhookUrl}
                      onChange={(e) => setBaleWebhookUrl(e.target.value)}
                      placeholder={integrations.supabase_url ? `${integrations.supabase_url}/functions/v1/bot-webhook/bale` : "https://..."}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRegisterWebhook('bale')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                    >
                      ثبت Webhook بله
                    </button>
                  </div>
                </div>
              </div>

              {/* Eitaa */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    🟠 ربات ایتا (Eitaa)
                  </span>
                  <input
                    type="checkbox"
                    checked={integrations.eitaa_enabled}
                    onChange={(e) => setIntegrations({ ...integrations, eitaa_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                </div>
                <input
                  type="text"
                  value={integrations.eitaa_token}
                  onChange={(e) => setIntegrations({ ...integrations, eitaa_token: e.target.value })}
                  placeholder="Eitaa API Token..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                />
              </div>

              {/* Rubika */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    🟣 ربات روبیکا (Rubika)
                  </span>
                  <input
                    type="checkbox"
                    checked={integrations.rubika_enabled}
                    onChange={(e) => setIntegrations({ ...integrations, rubika_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                </div>
                <input
                  type="text"
                  value={integrations.rubika_token}
                  onChange={(e) => setIntegrations({ ...integrations, rubika_token: e.target.value })}
                  placeholder="Rubika Auth Key..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                />
              </div>

              {/* WhatsApp */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    🟢 ربات / اعلان واتساپ (WhatsApp)
                  </span>
                  <input
                    type="checkbox"
                    checked={integrations.whatsapp_enabled}
                    onChange={(e) => setIntegrations({ ...integrations, whatsapp_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                </div>
                <input
                  type="text"
                  value={integrations.whatsapp_token}
                  onChange={(e) => setIntegrations({ ...integrations, whatsapp_token: e.target.value })}
                  placeholder="WhatsApp API Token / Instance Key..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                />
              </div>
            </div>

            {/* Live Interactive Bot Simulator (Telegram & Bale Dispatcher Tester) */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-indigo-500/50 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-indigo-600/80 text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                      <span>🤖 شبیه‌ساز و تست زنده عملکرد ربات (Live Bot Tester)</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        موتور BotCore فعال
                      </span>
                    </h4>
                    <p className="text-[11px] text-indigo-200">
                      تست رفتاری و منطقی منوها بر اساس نقش کاربر (مهمان، مشتری، متصدی، بازاریاب، ادمین)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={botSimProvider}
                    onChange={(e) => setBotSimProvider(e.target.value as any)}
                    className="px-2.5 py-1 rounded-xl bg-indigo-900 text-xs font-bold border border-indigo-700 text-indigo-100 outline-none"
                  >
                    <option value="telegram">✈️ ربات تلگرام</option>
                    <option value="bale">🌴 ربات بله</option>
                  </select>

                  <select
                    value={botSimRole}
                    onChange={(e) => {
                      const newR = e.target.value as any;
                      setBotSimRole(newR);
                      handleSendBotSim('/start');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-indigo-900 text-xs font-bold border border-indigo-700 text-indigo-100 outline-none"
                  >
                    <option value="guest">نقش: کاربر مهمان</option>
                    <option value="customer">نقش: مشتری</option>
                    <option value="shopkeeper">نقش: متصدی نانوایی</option>
                    <option value="marketer">نقش: بازاریاب</option>
                    <option value="admin">نقش: مدیر ارشد</option>
                  </select>
                </div>
              </div>

              {/* Chat messages log */}
              <div className="max-h-60 overflow-y-auto space-y-2.5 p-3 rounded-xl bg-slate-950/80 border border-indigo-900/80 text-xs font-sans">
                {botSimHistory.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col ${item.sender === 'user' ? 'items-start' : 'items-end'}`}
                  >
                    <div 
                      className={`max-w-[85%] p-2.5 rounded-2xl whitespace-pre-line text-right leading-relaxed ${
                        item.sender === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none'
                      }`}
                    >
                      {item.text}
                    </div>

                    {/* Interactive Bot Reply Keyboard Buttons if any */}
                    {item.markup?.keyboard && (
                      <div className="mt-1.5 flex flex-wrap gap-1 max-w-[85%] justify-end">
                        {item.markup.keyboard.flat().map((btn: any, bIdx: number) => (
                          <button
                            key={bIdx}
                            onClick={() => handleSendBotSim(btn.text)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-900/90 hover:bg-indigo-700 text-[11px] font-bold text-indigo-200 border border-indigo-700 transition-colors shadow-sm"
                          >
                            {btn.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input row */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={botSimInput}
                  onChange={(e) => setBotSimInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendBotSim()}
                  placeholder="دستور یا پیام خود را تایپ کنید (مثلاً /start یا 📍 فروشگاه‌های اطراف)..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-indigo-800 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => handleSendBotSim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ارسال به ربات</span>
                </button>
              </div>
            </div>
          </div>

          {/* Map & SMS API Keys */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 border-r-4 border-indigo-600 pr-2">
              ۲. کلیدهای نقشه و پنل‌های پیامکی
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    📍 کلید API نقشه نشان / بلد (Neshan API Key)
                  </label>
                  <input
                    type="checkbox"
                    checked={integrations.neshan_enabled ?? false}
                    onChange={(e) => setIntegrations({ ...integrations, neshan_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                </div>
                <input
                  type="text"
                  value={integrations.neshan_key}
                  onChange={(e) => setIntegrations({ ...integrations, neshan_key: e.target.value })}
                  placeholder="service.neshan.api_key..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    📱 کلید API پنل پیامکی کاوه‌نگار / ملی‌پامک / فراز
                  </label>
                  <input
                    type="checkbox"
                    checked={integrations.sms_enabled ?? false}
                    onChange={(e) => setIntegrations({ ...integrations, sms_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                </div>
                <input
                  type="text"
                  value={integrations.kavenegar_key}
                  onChange={(e) => setIntegrations({ ...integrations, kavenegar_key: e.target.value })}
                  placeholder="Kavenegar / SMS API Key..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                />
              </div>
            </div>
          </div>

          {/* Database / Supabase Config */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-r-4 border-emerald-600 pr-2">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                ۳. دیتابیس و پایگاه داده ابری Supabase
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">فعال‌سازی اتصالات Supabase:</span>
                <input
                  type="checkbox"
                  checked={integrations.supabase_enabled ?? false}
                  onChange={(e) => setIntegrations({ ...integrations, supabase_enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  🌐 آدرس Supabase URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="text"
                  value={integrations.supabase_url || ''}
                  onChange={(e) => setIntegrations({ ...integrations, supabase_url: e.target.value })}
                  placeholder="https://xyz.supabase.co"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  🔑 کلید عمومی Supabase Anon / Publishable Key
                </label>
                <input
                  type="text"
                  value={integrations.supabase_anon_key || ''}
                  onChange={(e) => setIntegrations({ ...integrations, supabase_anon_key: e.target.value })}
                  placeholder="sb_publishable_... or eyJhbGci..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* SECTION 6: PAYMENT GATEWAY CONFIG */}
      {activeSection === 'payment' && (
        <form onSubmit={handleSavePaymentSettings} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                تنظیمات درگاه‌های پرداخت آنلاین (ZarinPal / IDPay / NextPay)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                تنظیم مرچنت‌کدها، کلیدهای اتصال و تست آنلاین شبکه پرداخت شتاب
              </p>
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              ذخیره درگاه‌ها
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ZarinPal */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                🟡 درگاه زرین‌پال (ZarinPal)
              </h4>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">مرچنت کد (Merchant ID)</label>
                <input
                  type="text"
                  value={paymentSettings.zarinpal_merchant_id}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, zarinpal_merchant_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <input
                  type="checkbox"
                  checked={paymentSettings.zarinpal_sandbox}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, zarinpal_sandbox: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600"
                />
                <span>حالت آزمایشی (Sandbox) فعال باشد</span>
              </div>
            </div>

            {/* IDPay */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                🔵 درگاه آیدی‌پی (IDPay)
              </h4>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">کلید API (API Key)</label>
                <input
                  type="text"
                  value={paymentSettings.idpay_api_key}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, idpay_api_key: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <input
                  type="checkbox"
                  checked={paymentSettings.idpay_sandbox}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, idpay_sandbox: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600"
                />
                <span>حالت آزمایشی (Sandbox) فعال باشد</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-900 dark:text-purple-200">تست صحت اتصال درگاه پرداخت</span>
              <button
                type="button"
                onClick={handleTestPaymentGateway}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                اجرای تراکنش تست ۵۰,۰۰۰ ریال
              </button>
            </div>

            {testPaymentResult && (
              <p className="text-xs font-mono text-purple-800 dark:text-purple-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800">
                {testPaymentResult}
              </p>
            )}
          </div>
        </form>
      )}

      {/* SECTION 7: FEATURE FLAGS */}
      {activeSection === 'flags' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            مدیریت پرچم‌های ویژگی (Feature Flags)
          </h3>

          <div className="space-y-3">
            {featureFlags.map((flag) => (
              <div key={flag.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white font-mono">{flag.key}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{flag.description}</p>
                </div>

                <button onClick={() => handleToggleFlag(flag.key)} className="text-purple-600 hover:scale-105 transition-transform">
                  {flag.enabled ? <ToggleRight className="w-8 h-8 text-purple-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION DATABASE: FULL DATABASE STUDIO WITH ROWS/COLUMNS EDITOR */}
      {(activeSection === 'database' || activeSection === 'data') && (
        <div className="space-y-4 animate-fade-in">
          <DatabaseStudio isEmbedded={true} />
        </div>
      )}

      {/* SECTION 8: AUDIT LOGS */}
      {activeSection === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            لاگ‌های امنیتی و تغییرات سیستم ({toPersianDigits(auditLogs.length)})
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date(log.created_at).toLocaleString('fa-IR')}</span>
                </div>
                {log.target_type && (
                  <p className="text-[11px] text-slate-500">نوع هدف: {log.target_type} {log.target_id ? `(${log.target_id})` : ''}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MARKETER DETAILS & COMMISSION MODAL */}
      {selectedMarketerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" />
                <span>اطلاعات بازاریاب و تعیین پورسانت</span>
              </h3>
              <button
                onClick={() => setSelectedMarketerDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">نام و نام خانوادگی:</span>
                  <div className="font-extrabold text-slate-900 dark:text-white">
                    {selectedMarketerDetail.full_name || selectedMarketerDetail.profile?.full_name || 'ثبت نشده'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">شماره موبایل:</span>
                  <div className="font-extrabold text-slate-900 dark:text-white font-mono" dir="ltr">
                    {toPersianDigits(selectedMarketerDetail.phone || selectedMarketerDetail.profile?.phone || '')}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">استان و شهر:</span>
                  <div className="font-extrabold text-slate-900 dark:text-white">
                    {selectedMarketerDetail.province || 'تهران'} - {selectedMarketerDetail.city || 'ثبت نشده'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">کد ملی:</span>
                  <div className="font-extrabold text-slate-900 dark:text-white font-mono" dir="ltr">
                    {toPersianDigits(selectedMarketerDetail.national_id || 'ثبت نشده')}
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">اطلاعات بانکی:</span>
                  <div className="font-extrabold text-slate-900 dark:text-white font-mono text-left bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50 mt-1">
                    {selectedMarketerDetail.bank_name || 'نامشخص'} - {selectedMarketerDetail.sheba_number || 'شماره شبا ثبت نشده'}
                  </div>
                </div>
                {selectedMarketerDetail.experience_description && (
                  <div className="space-y-1 col-span-2">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">رزومه و توضیحات:</span>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 mt-1 leading-relaxed">
                      {selectedMarketerDetail.experience_description}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  درصد پورسانت اختصاصی (٪)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editCommissionInput}
                      onChange={(e) => setEditCommissionInput(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-center"
                      dir="ltr"
                    />
                    <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                  </div>
                  <button
                    onClick={() => {
                      handleUpdateMarketerCommission(selectedMarketerDetail, editCommissionInput);
                      setSelectedMarketerDetail(null);
                    }}
                    className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors text-xs"
                  >
                    تایید و ذخیره
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  پس از ذخیره پورسانت، وضعیت بازاریاب به صورت خودکار "تایید شده" تغییر می‌کند.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
