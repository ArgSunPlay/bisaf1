import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Shop } from '../../types';
import { toJpeg, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Printer, Download, Settings, X, AlignLeft, AlignCenter, AlignRight, ScanLine, Eye, SlidersHorizontal, Loader2, ArrowRight } from 'lucide-react';

import widgetLensImg from '../../assets/images/bisaf_widget_fill_bw_1786653703772.jpg';
import browserLensImg from '../../assets/images/bisaf_browser_fill_bw_1786653722038.jpg';
import qrScannedImg from '../../assets/images/bisaf_qr_scanned_1786508755478.jpg';
import stepTicketImg from '../../assets/images/bisaf_ticket_fill_bw_1786653735045.jpg';

const GoogleLensIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mx-1 align-text-bottom" style={{ width: '1.2em', height: '1.2em' }}>
    <path d="M4.5 9.5V6.5C4.5 5.39543 5.39543 4.5 6.5 4.5H9.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.5 4.5H17.5C18.6046 4.5 19.5 5.39543 19.5 6.5V9.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.5 14.5V17.5C19.5 18.6046 18.6046 19.5 17.5 19.5H14.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.5 19.5H6.5C5.39543 19.5 4.5 18.6046 4.5 17.5V14.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
    <circle cx="17.5" cy="17.5" r="1.5" fill="currentColor"/>
  </svg>
);

interface QrPrintStudioProps {
  shop: Shop;
  custQr?: string;
  opQr?: string;
  onClose: () => void;
}

const FONTS = [
  { name: 'Vazirmatn', label: 'وزیرمتن (Vazirmatn)' },
  { name: 'Lalezar', label: 'لاله‌زار (Lalezar)' },
  { name: 'Markazi Text', label: 'مرکزی (Markazi)' },
  { name: 'Readex Pro', label: 'ریدکس (Readex)' },
  { name: 'Amiri', label: 'امیری (Amiri)' },
  { name: 'Tahoma', label: 'تاهوما (Tahoma)' },
  { name: 'Arial', label: 'آریال (Arial)' },
  { name: 'B Titr, Titr', label: 'تیتر (B Titr)' },
  { name: 'B Yekan, Yekan', label: 'یکان (B Yekan)' },
  { name: 'B Nazanin, Nazanin', label: 'نازنین (B Nazanin)' }
];

export const QrPrintStudio: React.FC<QrPrintStudioProps> = ({ shop, custQr, opQr, onClose }) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'operator'>('customer');
  const [mobileTab, setMobileTab] = useState<'preview' | 'settings'>('preview');
  const [isExporting, setIsExporting] = useState<'pdf' | 'image' | null>(null);
  
  // Dynamic QR Code generation state
  const [generatedCustQr, setGeneratedCustQr] = useState<string>(custQr || '');
  const [generatedOpQr, setGeneratedOpQr] = useState<string>(opQr || '');
  
  // Settings State
  const [fontFamily, setFontFamily] = useState('Vazirmatn');
  const [titleSize, setTitleSize] = useState(48);
  const [subtitleSize, setSubtitleSize] = useState(24);
  const [guideSize, setGuideSize] = useState(18);
  const [footerSize, setFooterSize] = useState(16);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');
  
  const [titleText, setTitleText] = useState(shop.name);
  const [subtitleText, setSubtitleText] = useState(`${shop.category} ${shop.subcategory ? `- ${shop.subcategory}` : ''}`);
  const [guideTitleText, setGuideTitleText] = useState('راهنمای اسکن سریع، بدون نصب هیچ نرم‌افزاری');
  const [footerText, setFooterText] = useState('این پوستر را جهت اسکن مشتریان در محل مناسب نصب فرمایید');
  
  const printRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.5);

  // Auto-switch footer text & guide title when active tab changes
  useEffect(() => {
    if (activeTab === 'customer') {
      setFooterText('این پوستر را جهت اسکن مشتریان در محل مناسب نصب فرمایید');
      setGuideTitleText('راهنمای اسکن سریع، بدون نصب هیچ نرم‌افزاری');
    } else {
      setFooterText('این کد فقط مخصوص ورود متصدی و مدیریت سامانه می‌باشد');
      setGuideTitleText('راهنمای اسکن سریع متصدی، بدون نیاز به نصب نرم‌افزار');
    }
  }, [activeTab]);

  // Dynamically calculate optimal scale so poster fills container with zero wasted margin
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth <= 0 || clientHeight <= 0) return;

      const isMobile = window.innerWidth < 640;
      const paddingX = isMobile ? 12 : 32;
      const paddingY = isMobile ? 24 : 48;

      const availW = Math.max(100, clientWidth - paddingX);
      const availH = Math.max(100, clientHeight - paddingY);

      // A4 at 96 DPI is 794 x 1123
      const scaleX = availW / 794;
      const scaleY = availH / 1123;

      const calculated = Math.min(scaleX, scaleY);
      setScale(Math.max(0.18, calculated));
    };

    calculateScale();

    const observer = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', calculateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calculateScale);
    };
  }, [mobileTab, activeTab]);

  // Generate QR codes dynamically if missing or changed
  useEffect(() => {
    const generateQrs = async () => {
      try {
        const custUrl = `${window.location.origin}/shop/${shop.slug || shop.id}`;
        const opUrl = `${window.location.origin}/panel/${shop.id}?auto_login=true`;
        
        const cQr = await QRCode.toDataURL(custUrl, { width: 360, margin: 1 });
        const oQr = await QRCode.toDataURL(opUrl, { width: 360, margin: 1 });
        
        setGeneratedCustQr(cQr);
        setGeneratedOpQr(oQr);
      } catch (err) {
        console.error('Error generating QR codes in Studio:', err);
      }
    };
    generateQrs();
  }, [shop, custQr, opQr]);
  
  // Load fonts dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Lalezar&family=Markazi+Text:wght@400;700&family=Readex+Pro:wght@400;700&family=Vazirmatn:wght@400;700;900&display=swap';
    link.rel = 'stylesheet';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const getExportOptions = () => ({
    quality: 0.98,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    skipFonts: true,
    cacheBust: true,
    filter: (node: HTMLElement) => {
      // Exclude script or internal unneeded nodes if any
      return node.tagName !== 'SCRIPT';
    }
  });

  const handleExportPDF = async () => {
    if (!printRef.current || isExporting) return;
    try {
      setIsExporting('pdf');
      await new Promise(r => setTimeout(r, 100));

      let imgData: string;
      try {
        imgData = await toJpeg(printRef.current, getExportOptions());
      } catch (err) {
        console.warn('toJpeg failed for PDF, attempting toPng fallback:', err);
        imgData = await toPng(printRef.current, getExportOptions());
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`bisaf_${shop.name}_${activeTab}_QR.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('خطا در تولید PDF - لطفاً مجدداً تلاش کنید.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportImage = async () => {
    if (!printRef.current || isExporting) return;
    try {
      setIsExporting('image');
      await new Promise(r => setTimeout(r, 100));

      let imgData: string;
      try {
        imgData = await toJpeg(printRef.current, getExportOptions());
      } catch (err) {
        console.warn('toJpeg failed, attempting toPng fallback:', err);
        imgData = await toPng(printRef.current, getExportOptions());
      }

      const link = document.createElement('a');
      link.download = `bisaf_qr_${shop.name.replace(/\s+/g, '_')}_${activeTab}.jpg`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Image export error:', err);
      alert('خطا در دانلود تصویر - لطفاً مجدداً تلاش کنید.');
    } finally {
      setIsExporting(null);
    }
  };

  const activeQrSrc = activeTab === 'customer' ? (generatedCustQr || custQr) : (generatedOpQr || opQr);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col md:flex-row-reverse overflow-hidden">
      {/* Mobile Top View Switcher Header */}
      <div className="flex md:hidden items-center justify-between px-3 py-2 bg-slate-900 text-white border-b border-slate-800 shrink-0 z-30">
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl flex-1 ml-2">
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all ${mobileTab === 'preview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Eye className="w-3.5 h-3.5" />
            پیش‌نمایش زنده
          </button>
          <button
            onClick={() => setMobileTab('settings')}
            className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all ${mobileTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            تنظیمات چاپ
          </button>
        </div>
        <button 
          onClick={onClose} 
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white rounded-xl text-xs font-bold shrink-0 transition-all border border-slate-700/80"
          title="بازگشت به صفحه قبل"
        >
          <ArrowRight className="w-4 h-4 text-indigo-400" />
          <span>بازگشت</span>
        </button>
      </div>

      {/* Sidebar Controls */}
      <div className={`w-full md:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-col h-full shrink-0 overflow-y-auto z-20 ${mobileTab === 'settings' ? 'flex' : 'hidden md:flex'}`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-sm font-extrabold flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-500" />
            تنظیمات پوستر (QR Code)
          </h2>
          <button 
            onClick={onClose} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
            title="بازگشت به صفحه قبل"
          >
            <ArrowRight className="w-4 h-4 text-indigo-500" />
            <span>بازگشت</span>
          </button>
        </div>

        <div className="p-4 space-y-5 flex-1">
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'customer' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              کد مشتری (نوبت‌گیری)
            </button>
            <button
              onClick={() => setActiveTab('operator')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'operator' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              کد متصدی (ورود)
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">متن تیتر بالا</label>
              <input 
                type="text" 
                value={titleText} 
                onChange={e => setTitleText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">متن زیرتیتر</label>
              <input 
                type="text" 
                value={subtitleText} 
                onChange={e => setSubtitleText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">نوع فونت صفحه</label>
              <select
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              >
                {FONTS.map(f => (
                  <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>{f.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">اندازه تیتر اصلی ({titleSize}px)</label>
              <input type="range" min="20" max="100" value={titleSize} onChange={e => setTitleSize(Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">اندازه زیرتیتر ({subtitleSize}px)</label>
              <input type="range" min="12" max="60" value={subtitleSize} onChange={e => setSubtitleSize(Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">اندازه متن راهنما ({guideSize}px)</label>
              <input type="range" min="10" max="40" value={guideSize} onChange={e => setGuideSize(Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان بخش راهنما</label>
                <input 
                  type="text" 
                  value={guideTitleText} 
                  onChange={e => setGuideTitleText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">متن پاورقی (توضیحات پایین)</label>
                <textarea 
                  rows={2}
                  value={footerText} 
                  onChange={e => setFooterText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold resize-none"
                  placeholder="جهت اسکن مشتریان..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">اندازه متن پاورقی ({footerSize}px)</label>
                <input type="range" min="12" max="36" value={footerSize} onChange={e => setFooterSize(Number(e.target.value))} className="w-full accent-indigo-600" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">تراز متن</label>
              <div className="flex gap-2">
                <button onClick={() => setAlign('right')} className={`flex-1 py-1.5 flex justify-center rounded-lg border ${align === 'right' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-500'}`}><AlignRight className="w-4 h-4" /></button>
                <button onClick={() => setAlign('center')} className={`flex-1 py-1.5 flex justify-center rounded-lg border ${align === 'center' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-500'}`}><AlignCenter className="w-4 h-4" /></button>
                <button onClick={() => setAlign('left')} className={`flex-1 py-1.5 flex justify-center rounded-lg border ${align === 'left' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-500'}`}><AlignLeft className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
            <button 
              onClick={handleExportPDF} 
              disabled={isExporting !== null}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
            >
              {isExporting === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              دریافت PDF (سایز A4)
            </button>
            <button 
              onClick={handleExportImage} 
              disabled={isExporting !== null}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
            >
              {isExporting === 'image' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              دانلود به صورت عکس (JPG)
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className="md:hidden w-full py-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 mt-2"
            >
              <Eye className="w-3.5 h-3.5" />
              مشاهده پیش‌نمایش پوستر
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span>بازگشت به صفحه قبل</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area (Auto-Fit Scaled A4) */}
      <div 
        ref={containerRef}
        className={`flex-1 h-full bg-slate-800 dark:bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden relative z-10 ${mobileTab === 'preview' ? 'flex' : 'hidden md:flex'}`}
      >
        <button
          onClick={onClose}
          className="hidden md:flex items-center gap-2 absolute top-4 left-4 text-xs font-bold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl z-20 backdrop-blur-md shadow-md border border-slate-700/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 text-indigo-400" />
          <span>بازگشت به پنل</span>
        </button>

        <p className="hidden md:block absolute top-4 right-4 text-xs font-bold text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-full z-20 backdrop-blur-md shadow-xs border border-slate-700/50">
          پیش‌نمایش زنده پوستر (A4)
        </p>

        {/* Mobile floating quick download bar */}
        <div className="flex md:hidden absolute top-3 left-3 right-3 justify-between items-center z-30 gap-2">
          <button 
            onClick={() => setMobileTab('settings')}
            className="px-3 py-1.5 bg-slate-900/90 text-indigo-400 text-xs font-extrabold rounded-full shadow-md flex items-center gap-1 backdrop-blur-md border border-slate-700/80"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            تنظیمات
          </button>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={handleExportPDF} 
              disabled={isExporting !== null}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-extrabold rounded-full shadow-md flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-60"
            >
              {isExporting === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
              PDF
            </button>
            <button 
              onClick={handleExportImage} 
              disabled={isExporting !== null}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-extrabold rounded-full shadow-md flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-60"
            >
              {isExporting === 'image' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              عکس
            </button>
          </div>
        </div>
        
        {/* Scaling container - Exact bounding dimensions based on scale */}
        <div 
          className="relative flex items-center justify-center my-auto shadow-2xl rounded-sm overflow-hidden border border-slate-700/40 bg-white transition-all duration-200"
          style={{ 
            width: `${Math.round(794 * scale)}px`, 
            height: `${Math.round(1123 * scale)}px`, 
          }}
        >
          <div 
            style={{ 
              width: '794px', 
              height: '1123px', // A4 at 96 DPI
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
              fontFamily: fontFamily
            }}
          >
            {/* PRINT CONTENT */}
            <div 
              ref={printRef}
              className="w-full h-full flex flex-col justify-between"
              style={{ padding: '55px 60px', textAlign: align, backgroundColor: '#ffffff', color: '#000000' }}
            >
              {/* Header */}
              <div>
                <h1 style={{ fontSize: `${titleSize}px`, fontWeight: 900, lineHeight: 1.2, margin: 0 }}>{titleText}</h1>
                <h2 style={{ fontSize: `${subtitleSize}px`, fontWeight: 600, color: '#444444', marginTop: '12px' }}>{subtitleText}</h2>
              </div>

              {/* QR Code Container */}
              <div className={`flex ${align === 'center' ? 'justify-center' : align === 'left' ? 'justify-start' : 'justify-end'} my-4`}>
                <div className="p-5 rounded-3xl inline-block relative border-4 border-black bg-white shadow-sm">
                  {activeQrSrc ? (
                    <img 
                      src={activeQrSrc} 
                      alt="QR Code" 
                      className="w-80 h-80" 
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <div className="w-80 h-80 flex items-center justify-center bg-slate-100 text-slate-500 font-bold">
                      در حال ساخت QR کد...
                    </div>
                  )}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full font-black text-lg whitespace-nowrap bg-black text-white shadow-md">
                    {activeTab === 'customer' ? 'اسکن کنید' : 'ورود متصدی'}
                  </div>
                </div>
              </div>

              {/* Instructions Guide (3 Step Process with Real Assets) */}
              <div className="pt-6 border-t-2 border-dashed border-slate-300">
                <h3 className="font-extrabold mb-5 flex items-center gap-2 text-black" style={{ fontSize: `${guideSize + 4}px`, justifyContent: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end' }}>
                  <ScanLine size={guideSize + 4} color="#000000" />
                  {guideTitleText}
                </h3>
                
                <div className="grid grid-cols-3 gap-6 text-center" style={{ fontSize: `${guideSize}px` }}>
                  {/* Step 1 */}
                  <div className="space-y-3">
                    <div className="aspect-square rounded-2xl flex items-center justify-between overflow-hidden shadow-xs relative gap-1">
                      <div className="w-[49%] h-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 border-r-2 border-slate-300">
                        <img src={widgetLensImg} alt="گوگل لنز در ویجت" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 left-0 right-0 bg-slate-900 text-white text-[9px] font-black py-0.5 text-center">ویجت</span>
                      </div>
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black text-slate-900 bg-white border border-slate-300 px-1.5 py-1 rounded-full shadow-md z-10">یا</span>
                      <div className="w-[49%] h-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-50">
                        <img src={browserLensImg} alt="گوگل لنز در مرورگر" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 left-0 right-0 bg-slate-900 text-white text-[9px] font-black py-0.5 text-center">مرورگر</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto font-black text-sm bg-black text-white">۱</div>
                    <p className="font-bold text-slate-800 leading-relaxed">
                      روی آیکون اسکن سریع <GoogleLensIcon /> در مرورگر یا ویجت بزنید.
                    </p>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="space-y-3">
                    <div className="aspect-square rounded-2xl flex items-center justify-center p-1.5 bg-white border-2 border-slate-300 overflow-hidden shadow-xs">
                      <img src={qrScannedImg} alt="اسکن کد و زدن روی لینک" className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto font-black text-sm bg-black text-white">۲</div>
                    <p className="font-bold text-slate-800">دوربین را روی کد بگیرید و روی لینک مشکی ظاهرشده بزنید.</p>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="space-y-3">
                    <div className="aspect-square rounded-2xl flex items-center justify-center bg-white overflow-hidden shadow-xs border border-slate-200">
                      <img src={stepTicketImg} alt="صفحه اختصاصی فروشگاه" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto font-black text-sm bg-black text-white">۳</div>
                    <p className="font-bold text-slate-800">
                      {activeTab === 'customer' 
                        ? 'وارد صفحه اختصاصی فروشگاه شده و نوبت خود را دریافت کنید.' 
                        : 'وارد پنل مدیریت فروشگاه شده و نوبت‌ها را مدیریت کنید.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-6 text-center font-bold text-slate-600" style={{ fontSize: `${footerSize}px`, lineHeight: 1.4 }}>
                <div>{footerText}</div>
                <div className="font-black text-slate-900 mt-1">بی‌صف بدون معطلی نوبت بگیرید</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

