import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Play, Pause, SkipForward, SkipBack, RotateCcw, X, 
  Sparkles, CheckCircle2, ChevronRight, ArrowRight, 
  Store, User, Shield, Award, MapPin, Ticket, ListOrdered, 
  Database, Radio, Lock, RefreshCw, Volume2, MessageSquare, 
  QrCode, Check, Eye, Sliders, ExternalLink, HelpCircle, Activity,
  GripHorizontal, Move, ChevronUp, ChevronDown, PanelBottom, Pin, PinOff,
  Maximize2, Minimize2, Info
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { QueueService } from '../services/queueService';
import { AuthService } from '../services/authService';
import { toPersianDigits } from '../utils/jalali';
import { Shop, QueueItem, Profile } from '../types';

export type TestScenarioType = 'e2e_full' | 'guest' | 'customer' | 'shopkeeper' | 'marketer' | 'admin';

export interface TestStep {
  id: string;
  scenario: TestScenarioType;
  title: string;
  route: string;
  roleToLogin?: string; // profile username or 'guest'
  whatHappened: string; // چه کاری انجام شد
  whyImportant: string; // چرا این بخش مهم است
  actualResult: string; // نتیجه واقعی ثبت شده
  actionFn: () => void | Promise<void>;
}

interface InteractiveSystemTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialScenario?: TestScenarioType;
}

type DockMode = 'bottom' | 'floating' | 'mini';

export const InteractiveSystemTestModal: React.FC<InteractiveSystemTestModalProps> = ({
  isOpen,
  onClose,
  initialScenario = 'e2e_full'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeScenario, setActiveScenario] = useState<TestScenarioType>(initialScenario);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [dockMode, setDockMode] = useState<DockMode>('bottom'); // Default to bottom dock so user sees full screen
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(3500); // Default 3.5s
  const [lastActionTime, setLastActionTime] = useState<string>('');

  // Floating drag position state
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 20,
    initialY: 80
  });

  const timerRef = useRef<any>(null);
  const currentStepIndexRef = useRef<number>(0);
  currentStepIndexRef.current = currentStepIndex;

  const isPlayingRef = useRef<boolean>(false);
  isPlayingRef.current = isPlaying;

  // Define All Test Steps across Scenarios
  const allSteps: TestStep[] = [
    // === SCENARIO 1: GUEST FLOW ===
    {
      id: 'g1',
      scenario: 'guest',
      title: '۱. ورود کاربر مهمان به سامانه و انتخاب نانوایی',
      route: '/',
      roleToLogin: 'guest',
      whatHappened: 'کاربر مهمان بدون نیاز به ثبت‌نام وارد صفحه اصلی شد و نانوایی سنگکی سنتی برکت را جهت دریافت نوبت انتخاب کرد.',
      whyImportant: 'کاربران بدون اتلاف وقت و بدون نیاز به فرم‌های طولانی اولیه، بلافاصله می‌توانند مراکز را ببینند و نوبت بگیرند.',
      actualResult: 'اطلاعات فروشگاه با موفقیت لود شد و کاربر به صفحه اختصاصی نوبت‌گیری هدایت می‌شود.',
      actionFn: () => {
        AuthService.logout();
        navigate('/');
      }
    },
    {
      id: 'g2',
      scenario: 'guest',
      title: '۲. انتخاب سفارش (۲ عدد نان کنجدی) و ثبت نوبت آنلاین',
      route: '/shop/barekat-sangak',
      whatHappened: 'در صفحه نانوایی برکت، کاربر ۲ عدد سنگک دو رو کنجد انتخاب کرد و دکمه دریافت نوبت آنلاین را فشرد.',
      whyImportant: 'مشخص بودن نوع نان و تعداد سفارش باعث محاسبه دقیق زمان انتظار نانوایی و تنظیم سرعت پخت شاطر می‌شود.',
      actualResult: 'نوبت جدید شماره ۱۰۵ در دیتابیس صف ثبت شد و زمان انتظار تقریبی ۶ دقیقه تعیین گردید.',
      actionFn: () => {
        navigate('/shop/barekat-sangak');
        const shop = StorageService.getShops().find(s => s.slug === 'barekat-sangak') || StorageService.getShops()[0];
        const nextTicket = (shop.current_serving || 100) + (shop.waiting_count || 1) + 1;
        const newQueue: QueueItem = {
          id: `test-guest-queue-${Date.now()}`,
          shop_id: shop.id,
          ticket_number: nextTicket,
          ticket_type: 'online',
          quantity: 2,
          threshold: 3,
          joined_at: new Date().toISOString(),
          status: 'waiting',
          created_at: new Date().toISOString(),
          customer_phone: '09129990001',
          position: (shop.waiting_count || 2) + 1,
          ordered_items: [
            { name: 'سنگک دو رو کنجد', quantity: 2 }
          ]
        };
        const all = StorageService.getQueueItems();
        all.push(newQueue);
        StorageService.saveQueueItems(all);
      }
    },
    {
      id: 'g3',
      scenario: 'guest',
      title: '۳. صدور فیش دیجیتال نوبت و تبدیل آسان به عضو دائمی',
      route: '/shop/barekat-sangak',
      whatHappened: 'فیش دیجیتال نوبت همراه با QR کد رهگیری به کاربر نشان داده شد و فرم تبدیل به عضو دائمی تست شد.',
      whyImportant: 'کاربر می‌تواند فیش خود را ذخیره کند یا با یک کلیک عضو دائمی بی‌صف شود تا نوبت‌های بعدی بدون شماره‌گیری ثبت شوند.',
      actualResult: 'شناسه فیش صادر شد و قابلیت دانلود فیش نوبت فعال گردید.',
      actionFn: () => {
        StorageService.addAuditLog({
          action: 'تست موفق صدور فیش دیجیتال و نوبت آنلاین کاربر مهمان',
          target_type: 'queue',
          target_id: 'guest-ticket-105'
        });
      }
    },

    // === SCENARIO 2: CUSTOMER FLOW ===
    {
      id: 'c1',
      scenario: 'customer',
      title: '۱. ورود مشتری و مشاهده داشبورد نوبت‌های زنده',
      route: '/dashboard',
      roleToLogin: 'mosh1',
      whatHappened: 'مشتری «علی محمدی» وارد داشبورد خود شد و نقشه زنده مراکز و نوبت‌های فعال خود را مشاهده کرد.',
      whyImportant: 'مشتری در یک نگاه متوجه می‌شود چند نفر جلوتر از او در صف هستند و دقیقاً چه ساعتی باید به مرکز برسد.',
      actualResult: 'نوبت‌های در صف به رنگ سبز و هشدار زمان تخمینی روی داشبورد نمایش داده شدند.',
      actionFn: () => {
        const user = StorageService.getProfiles().find(p => p.username === 'mosh1') || StorageService.getProfiles()[6];
        StorageService.setCurrentUser(user);
        navigate('/dashboard');
      }
    },
    {
      id: 'c2',
      scenario: 'customer',
      title: '۲. تنظیم آستانه هشدار پیامکی (وقتی ۳ نفر مانده خبرم کن)',
      route: '/dashboard',
      whatHappened: 'مشتری آستانه هشدار پیامکی را روی ۳ نفر تنظیم کرد و مرکز را به لیست علاقه‌مندی‌ها افزود.',
      whyImportant: 'نیازی نیست مشتری مدام گوشی را چک کند؛ سامانه ۳ نفر مانده به نوبت خودکار برای او پیامک هشدار می‌فرستد.',
      actualResult: 'تنظیمات هشدار در بخش علاقه‌مندی‌های کاربر (Favorites) با موفقیت ذخیره شد.',
      actionFn: () => {
        const shop = StorageService.getShops()[0];
        if (shop) {
          StorageService.toggleFavorite('user-mosh1', shop.id);
        }
      }
    },

    // === SCENARIO 3: SHOPKEEPER / OPERATOR FLOW ===
    {
      id: 's1',
      scenario: 'shopkeeper',
      title: '۱. ورود شاطر/متصدی به پنل مدیریت صف نانوایی',
      route: '/panel/shop-sangak-1',
      roleToLogin: 'mot1',
      whatHappened: 'متصدی نانوایی وارد پنل اختصاصی مدیریت صف شد و لیست مشتریان در انتظار و دکمه‌های فراخوانی را باز کرد.',
      whyImportant: 'پنل متصدی دارای دکمه‌های فوق‌العاده بزرگ و لمسی است تا شاطر پای تنور یا منشی با یک لمس ساده صف را کنترل کند.',
      actualResult: 'پنل با آمار زنده صف باز شد و کنترل‌های فراخوانی آماده استفاده هستند.',
      actionFn: () => {
        const motUser = StorageService.getProfiles().find(p => p.username === 'mot1') || StorageService.getProfiles()[1];
        StorageService.setCurrentUser(motUser);
        sessionStorage.setItem('op_auth_shop-sangak-1', 'true');
        sessionStorage.setItem('op_auth_shop-barekat-sangak', 'true');
        navigate('/panel/shop-sangak-1');
      }
    },
    {
      id: 's2',
      scenario: 'shopkeeper',
      title: '۲. فراخوانی و تحویل نوبت بعدی با دکمه بزرگ فراخوانی',
      route: '/panel/shop-sangak-1',
      whatHappened: 'متصدی دکمه بزرگ سبز «تحویل سفارش و فراخوانی نوبت بعدی» را زد.',
      whyImportant: 'نوبت قبلی به وضعیت تحویل‌شده (Served) می‌رود، نوبت بعدی روی نمایشگر صوتی و پیامکی صدا زده می‌شود و صف ۱ واحد جلو می‌رود.',
      actualResult: 'نوبت شماره ۱۰۴ به تحویل‌شده تغییر کرد و نوبت ۱۰۵ به عنوان نوبت در حال پاسخگویی فعال شد.',
      actionFn: () => {
        navigate('/panel/shop-sangak-1');
        const shop = StorageService.getShops()[0];
        const nextServing = (shop.current_serving || 104) + 1;
        const updatedShop = {
          ...shop,
          current_serving: nextServing,
          waiting_count: Math.max(0, (shop.waiting_count || 3) - 1)
        };
        StorageService.saveShop(updatedShop);
      }
    },
    {
      id: 's3',
      scenario: 'shopkeeper',
      title: '۳. صدور سریع نوبت حضوری برای مشتری پای باجه (تکی و چندتایی)',
      route: '/panel/shop-sangak-1',
      whatHappened: 'متصدی برای مشتری حضوری که گوشی ندارد، دکمه سریع «نوبت تک‌تایی» را زد و نوبت در صف نشست.',
      whyImportant: 'عدالت در صف برقرار می‌ماند و هم مشتریان اینترنتی و هم مراجعان حضوری به صورت منظم نان یا خدمت خود را دریافت می‌کنند.',
      actualResult: 'نوبت حضوری جدید صادر و بلافاصله به صف نانوایی اضافه شد.',
      actionFn: () => {
        navigate('/panel/shop-sangak-1');
        const shop = StorageService.getShops()[0];
        const newServing = (shop.current_serving || 104) + 2;
        const newQueue: QueueItem = {
          id: `walkin-${Date.now()}`,
          shop_id: shop.id,
          ticket_number: newServing,
          ticket_type: 'in_person_single',
          quantity: 1,
          threshold: 3,
          joined_at: new Date().toISOString(),
          status: 'waiting',
          created_at: new Date().toISOString(),
          position: 1
        };
        const all = StorageService.getQueueItems();
        all.push(newQueue);
        StorageService.saveQueueItems(all);
      }
    },

    // === SCENARIO 4: MARKETER FLOW ===
    {
      id: 'm1',
      scenario: 'marketer',
      title: '۱. ورود بازاریاب و مشاهده داشبورد پورسانت و فروشگاه‌ها',
      route: '/marketer',
      roleToLogin: 'baz1',
      whatHappened: 'بازاریاب وارد پنل خود شد و نمودار پورسانت‌های نقدی و فروشگاه‌های زیرمجموعه خود را بررسی کرد.',
      whyImportant: 'بازاریاب با ثبت مراکز جدید به ازای هر نوبت ثبت‌شده درآمد مستمر کسب می‌کند و انگیزه بالایی برای توسعه سیستم دارد.',
      actualResult: 'آمار ۲ فروشگاه متصل و پورسانت محاسبه‌شده ۳۵,۰۰۰ تومانی امروز نمایش داده شد.',
      actionFn: () => {
        const bazUser = StorageService.getProfiles().find(p => p.username === 'baz1') || StorageService.getProfiles()[4];
        StorageService.setCurrentUser(bazUser);
        navigate('/marketer');
      }
    },
    {
      id: 'm2',
      scenario: 'marketer',
      title: '۲. ثبت یک فروشگاه و نانوایی جدید در سامانه',
      route: '/marketer',
      whatHappened: 'بازاریاب فرم ثبت نانوایی جدید «کافه نان بهارستان» را همراه با شماره شاطر و آدرس ثبت کرد.',
      whyImportant: 'فروشگاه بلافاصله در نقشه و پایگاه داده فعال شده و کد QR اختصاصی آن جهت چاپ پوستر ایجاد می‌گردد.',
      actualResult: 'فروشگاه جدید ثبت و به لیست فروشگاه‌های تحت نظارت بازاریاب اضافه شد.',
      actionFn: () => {
        navigate('/marketer');
        const newShop: Shop = {
          id: `shop-baharestan-${Date.now()}`,
          name: 'کافه نان و سنگک بهارستان',
          slug: 'baharestan-bread',
          category: 'نانوایی',
          address: 'تهران، میدان بهارستان، جنب خیابان صفی علی‌شاه',
          phone: '02177665544',
          latitude: 35.6892,
          longitude: 51.3890,
          is_active: true,
          marketer_id: 'user-baz1',
          created_at: new Date().toISOString(),
          waiting_count: 0,
          current_serving: 1
        };
        StorageService.saveShop(newShop);
      }
    },

    // === SCENARIO 5: ADMIN & DATABASE STUDIO FLOW ===
    {
      id: 'a1',
      scenario: 'admin',
      title: '۱. ورود مدیر ارشد و بررسی سلامت ارتباط سامانه‌ها',
      route: '/admin',
      roleToLogin: 'admin',
      whatHappened: 'مدیر ارشد وارد پنل ادمین شد و اتصال پیامک، ربات‌ها و نقشه را بررسی کرد.',
      whyImportant: 'مدیر می‌تواند وضعیت اتصال به سرورها و کلیدهای API را نظارت و تست زنده انجام دهد.',
      actualResult: 'داشبورد مدیریتی با تمامی ماژول‌های فعال و گزارشات لاگ‌ها لود شد.',
      actionFn: () => {
        const adminUser = StorageService.getProfiles().find(p => p.role === 'admin') || StorageService.getProfiles()[0];
        StorageService.setCurrentUser(adminUser);
        navigate('/admin');
      }
    },
    {
      id: 'a2',
      scenario: 'admin',
      title: '۲. تست سوئیچینگ دیتابیس ابری Supabase و کش محلی در استودیو دیتابیس',
      route: '/database',
      whatHappened: 'مدیر وارد استودیو دیتابیس شد و منبع داده جدول فروشگاه‌ها را بین Supabase و Local Storage سوئیچ کرد.',
      whyImportant: 'در صورت قطعی اینترنت یا دسترسی به سرور، سامانه بدون هیچ اختلالی روی حافظه محلی کار می‌کند و بعداً همگام می‌شود.',
      actualResult: 'داده‌ها به صورت زنده از دیتابیس ابری خوانده شد و وضعیت اتصال سبز است.',
      actionFn: () => {
        navigate('/database');
      }
    },
    {
      id: 'a3',
      scenario: 'admin',
      title: '۳. تغییر وضعیت قفل رمز عبور متصدیان فروشگاه‌ها',
      route: '/admin',
      whatHappened: 'مدیر کلید امنیتی الزام رمز عبور متصدی را برای یک فروشگاه فعال کرد تا ورود امن بررسی شود.',
      whyImportant: 'برای فروشگاه‌های حساس می‌توان الزام رمز گذاشت تا افراد غیرمجاز نتوانند صف را دستکاری کنند.',
      actualResult: 'تنظیمات امنیتی فروشگاه در دیتابیس ذخیره و لاگ امنیتی (Audit Log) ثبت شد.',
      actionFn: () => {
        navigate('/admin');
        const shops = StorageService.getShops();
        if (shops.length > 0) {
          const s = shops[0];
          StorageService.saveShop({
            ...s,
            require_operator_password: true,
            operator_password: 'admin'
          });
        }
      }
    }
  ];

  // Filter steps based on active scenario
  const scenarioSteps = activeScenario === 'e2e_full'
    ? allSteps
    : allSteps.filter(s => s.scenario === activeScenario);

  const scenarioStepsRef = useRef<TestStep[]>(scenarioSteps);
  scenarioStepsRef.current = scenarioSteps;

  const currentStep = scenarioSteps[currentStepIndex] || scenarioSteps[0];

  // Execute a specific step by index safely
  const executeStep = async (index: number, stepsToUse?: TestStep[]) => {
    const steps = stepsToUse || scenarioStepsRef.current;
    if (index < 0 || index >= steps.length) return;
    const step = steps[index];

    setCurrentStepIndex(index);
    currentStepIndexRef.current = index;
    setLastActionTime(new Date().toLocaleTimeString('fa-IR'));

    // Execute step logic asynchronously to avoid blocking React reconciliation
    setTimeout(async () => {
      try {
        if (step.roleToLogin) {
          if (step.roleToLogin === 'guest') {
            AuthService.logout();
          } else {
            const profile = StorageService.getProfiles().find(p => p.username === step.roleToLogin || p.id === step.roleToLogin);
            if (profile) {
              StorageService.setCurrentUser(profile);
            }
          }
        }
        await step.actionFn();
      } catch (e) {
        console.error('Error executing test step:', e);
      }
    }, 0);
  };

  // Dragging event listeners for floating & mini modes
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag on left click / touch on drag handle
    if (dockMode !== 'floating' && dockMode !== 'mini') return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: dragPos.x,
      initialY: dragPos.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    
    // Calculate new position bounded inside screen
    const maxX = Math.max(20, window.innerWidth - 320);
    const maxY = Math.max(20, window.innerHeight - 100);

    const newX = Math.min(Math.max(10, dragStartRef.current.initialX + deltaX), maxX);
    const newY = Math.min(Math.max(10, dragStartRef.current.initialY + deltaY), maxY);

    setDragPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // Safe ignore
      }
    }
  };

  // Sync initial scenario when modal is opened
  useEffect(() => {
    if (isOpen) {
      setActiveScenario(initialScenario);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [isOpen, initialScenario]);

  // Timer loop for auto play - cleanly triggers next step without setState inside setter
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      const nextIdx = currentStepIndexRef.current + 1;
      const totalSteps = scenarioStepsRef.current.length;
      if (nextIdx < totalSteps) {
        executeStep(nextIdx);
      } else {
        setIsPlaying(false);
      }
    }, speedMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, isPlaying, speedMs]);

  // Handle Scenario Change
  const handleSelectScenario = (sc: TestScenarioType) => {
    setActiveScenario(sc);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    const targetSteps = sc === 'e2e_full' ? allSteps : allSteps.filter(s => s.scenario === sc);
    if (targetSteps.length > 0) {
      executeStep(0, targetSteps);
    }
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      // If at end, restart
      if (currentStepIndexRef.current >= scenarioSteps.length - 1) {
        executeStep(0);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (currentStepIndex + 1 < scenarioSteps.length) {
      executeStep(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    if (currentStepIndex - 1 >= 0) {
      executeStep(currentStepIndex - 1);
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    executeStep(0);
  };

  if (!isOpen) return null;

  const progressPercent = Math.round(((currentStepIndex + 1) / scenarioSteps.length) * 100);

  // ==========================================
  // VIEW 1: MINI FLOATING PILL (Ultra-compact)
  // ==========================================
  if (dockMode === 'mini') {
    return (
      <div 
        style={{ left: `${dragPos.x}px`, top: `${dragPos.y}px` }}
        className="fixed z-50 select-none animate-fade-in touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center gap-1.5 p-1.5 pr-2.5 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white border-2 border-emerald-500 shadow-2xl shadow-emerald-950/60">
          <GripHorizontal className="w-4 h-4 text-emerald-400 opacity-70" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-[11px] font-black text-emerald-300">
            گام {toPersianDigits(currentStepIndex + 1)}/{toPersianDigits(scenarioSteps.length)}
          </span>

          {/* Quick Play/Pause */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePlay();
            }}
            className="p-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            title={isPlaying ? 'توقف' : 'ادامه'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          {/* Quick Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextStep();
            }}
            disabled={currentStepIndex >= scenarioSteps.length - 1}
            className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
            title="گام بعد"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Expand to Bottom Bar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDockMode('bottom');
            }}
            className="px-2 py-1 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold border border-emerald-700/60 flex items-center gap-1"
            title="باز کردن نوار تست در پایین صفحه"
          >
            <PanelBottom className="w-3 h-3" />
            <span>نوار کامل</span>
          </button>

          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300"
            title="بستن"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: BOTTOM DOCK BAR OR DRAGGABLE CARD
  // ==========================================
  const isBottomDock = dockMode === 'bottom';

  return (
    <>
      {/* Container: Either docked at bottom-0 or floating draggable */}
      <div 
        style={!isBottomDock ? { left: `${dragPos.x}px`, top: `${dragPos.y}px` } : undefined}
        className={
          isBottomDock
            ? "fixed bottom-0 left-0 right-0 z-50 select-none animate-slide-up"
            : "fixed z-50 select-none max-w-xl w-[92vw] sm:w-[540px] animate-fade-in"
        }
      >
        {/* Details Drawer / Popover (Shows when user clicks 'توضیحات مرحله') */}
        {showDetails && currentStep && (
          <div className="mx-auto max-w-4xl px-3 pb-2 animate-fade-in">
            <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-lg text-white rounded-3xl p-3.5 shadow-2xl border-2 border-emerald-500/70 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>{currentStep.title}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-slate-800 px-2 py-0.5 rounded-lg dir-ltr">
                    مسیر: {currentStep.route}
                  </span>
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 3 Plain Persian Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-sky-400 text-[11px] flex items-center gap-1">
                    <span>📌 چه کاری انجام شد؟</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {currentStep.whatHappened}
                  </p>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-emerald-400 text-[11px] flex items-center gap-1">
                    <span>💡 چرا مهم است؟</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {currentStep.whyImportant}
                  </p>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-purple-400 text-[11px] flex items-center gap-1">
                    <span>🎯 نتیجه واقعی در سامانه:</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {currentStep.actualResult}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* The Main Control HUD */}
        <div 
          className={
            isBottomDock
              ? "bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white border-t-2 border-emerald-500/80 shadow-2xl p-2.5 sm:p-3"
              : "bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white rounded-3xl border-2 border-emerald-500/80 shadow-2xl p-3 space-y-2.5 shadow-emerald-950/60"
          }
        >
          {/* Top Bar / Drag Handle in Floating Mode */}
          {!isBottomDock && (
            <div 
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="flex items-center justify-between pb-1 border-b border-slate-800 cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                <Move className="w-3.5 h-3.5 text-emerald-400" />
                <span>پنل تست شناور (برای جابجایی بکشید)</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDockMode('bottom')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 flex items-center gap-1"
                  title="چسباندن به نوار پایین صفحه"
                >
                  <PanelBottom className="w-3 h-3" />
                  <span>چسباندن به پایین</span>
                </button>
                <button
                  onClick={() => setDockMode('mini')}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="کوچک‌سازی به دکمه مینی"
                >
                  <Minimize2 className="w-3 h-3" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300"
                  title="بستن"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Content Row: Scenario, Step Title, Controls, Details Button */}
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
            
            {/* Step info & Progress */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-[11px] font-black text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-xl border border-emerald-700/60 whitespace-nowrap">
                  گام {toPersianDigits(currentStepIndex + 1)} از {toPersianDigits(scenarioSteps.length)}
                </span>
              </div>

              {/* Title & Route */}
              <div className="min-w-0 flex-1 flex items-center gap-2">
                <p className="text-xs sm:text-sm font-black text-amber-300 truncate" title={currentStep?.title}>
                  {currentStep?.title}
                </p>
                <span className="hidden lg:inline text-[10px] text-slate-400 font-mono bg-slate-800/80 px-1.5 py-0.5 rounded dir-ltr shrink-0">
                  {currentStep?.route}
                </span>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between md:justify-end gap-1.5 flex-wrap shrink-0">
              
              {/* Toggle Details Button */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border ${
                  showDetails 
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="مشاهده جزئیات و نتایج این مرحله"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{showDetails ? 'بستن توضیحات' : 'توضیحات گام'}</span>
              </button>

              {/* Prev */}
              <button
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                title="مرحله قبل"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">قبل</span>
              </button>

              {/* Play / Pause */}
              <button
                onClick={handleTogglePlay}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                  isPlaying 
                    ? 'bg-amber-400 hover:bg-amber-500 text-slate-950' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>توقف</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>ادامه خودکار</span>
                  </>
                )}
              </button>

              {/* Next */}
              <button
                onClick={handleNextStep}
                disabled={currentStepIndex >= scenarioSteps.length - 1}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                title="مرحله بعد"
              >
                <span className="hidden sm:inline">بعد</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {/* Restart */}
              <button
                onClick={handleRestart}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                title="شروع مجدد سناریو"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Scenario Selector */}
              <select
                value={activeScenario}
                onChange={(e) => handleSelectScenario(e.target.value as TestScenarioType)}
                className="px-2 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold outline-none cursor-pointer max-w-[130px] sm:max-w-[170px] truncate"
              >
                <option value="e2e_full">🚀 کل سامانه (E2E)</option>
                <option value="guest">🥖 ۱. مهمان و فیش</option>
                <option value="customer">👤 ۲. مشتری و پیامک</option>
                <option value="shopkeeper">👨‍🍳 ۳. شاطر و صف</option>
                <option value="marketer">📈 ۴. بازاریاب</option>
                <option value="admin">👑 ۵. ادمین و DB</option>
              </select>

              {/* Speed dropdown */}
              <select
                value={speedMs}
                onChange={(e) => setSpeedMs(Number(e.target.value))}
                className="hidden sm:block px-1.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold outline-none cursor-pointer"
                title="سرعت اجرای تست"
              >
                <option value={5000}>۵ ثانیه</option>
                <option value={3500}>۳.۵ ثانیه</option>
                <option value={2000}>۲ ثانیه</option>
              </select>

              {/* Bottom Dock specific toggles: Floating Mode & Mini Mode & Close */}
              {isBottomDock && (
                <div className="flex items-center gap-1 border-r border-slate-800 pr-1">
                  <button
                    onClick={() => setDockMode('floating')}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="تبدیل به پنل شناور با قابلیت جابجایی"
                  >
                    <Move className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDockMode('mini')}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="تبدیل به دکمه مینیاتوری"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800"
                    title="بستن تست"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Sleek Mini Progress Line */}
          <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

        </div>
      </div>
    </>
  );
};
