import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowRight, Save } from 'lucide-react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { StorageService } from '../services/storage';
import { Shop, PrintTemplate } from '../types';
import { toPersianDigits } from '../utils/jalali';

export const PrintPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [template, setTemplate] = useState<PrintTemplate | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [message, setMessage] = useState('');
  const ticketRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const shops = StorageService.getShops();
    const found = shops.find(s => s.id === shopId || s.slug === shopId) || shops[0];
    setShop(found);

    if (found) {
      const tmpl = StorageService.getPrintTemplate(found.id);
      setTemplate(tmpl);
      setHeaderText(tmpl.header_text);
      setFooterText(tmpl.footer_text);
      setFontSize(tmpl.font_size);

      // Generate QR code for shop link
      const shopUrl = `${window.location.origin}/shop/${found.slug}`;
      QRCode.toDataURL(shopUrl, { margin: 1, width: 160 })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR code error', err));
    }
  }, [shopId]);

  if (!shop || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PrintTemplate = {
      ...template,
      header_text: headerText,
      footer_text: footerText,
      font_size: fontSize
    };
    StorageService.savePrintTemplate(updated);
    setMessage('✅ قالب فیش و QR کد ذخیره شد.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 120] // thermal receipt size
    });

    doc.setFontSize(12);
    doc.text(shop.name, 40, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Ticket #${toPersianDigits(42)}`, 40, 25, { align: 'center' });

    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', 20, 35, 40, 40);
    }

    doc.setFontSize(8);
    doc.text('BiSaf.ir', 40, 85, { align: 'center' });
    doc.save(`bisaf-ticket-${shop.slug}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-24 pt-4 px-4 max-w-xl mx-auto space-y-5">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-emerald-500" />
          <span>بازگشت به صفحه قبل</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            خروجی PDF
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            چاپ فیش
          </button>
        </div>
      </div>

      {message && (
        <div className="no-print bg-emerald-600 text-white font-bold p-3 rounded-2xl text-xs text-center shadow-md">
          {message}
        </div>
      )}

      {/* Printable Ticket Area */}
      <div className="bg-white text-slate-950 p-6 rounded-3xl shadow-xl max-w-sm mx-auto border-2 border-dashed border-slate-300 space-y-4 text-center" ref={ticketRef}>
        <div className="space-y-1">
          <h2 className="text-base font-black leading-tight">{headerText}</h2>
          <h3 className="text-xl font-extrabold text-slate-900">{shop.name}</h3>
          <p className="text-xs text-slate-600">{shop.category}</p>
        </div>

        <div className="my-4 py-4 border-y-2 border-slate-900 space-y-1">
          <span className="text-xs font-bold text-slate-600">شماره نوبت نمونه</span>
          <div className="text-5xl font-black font-mono tracking-widest text-slate-900">
            #{toPersianDigits(42)}
          </div>
        </div>

        {/* QR Code */}
        {qrDataUrl && (
          <div className="space-y-2">
            <img src={qrDataUrl} alt="QR Code" className="w-36 h-36 mx-auto rounded-xl border border-slate-200" />
            <p className="text-[11px] text-slate-600 font-medium">
              اسکن QR کد جهت دریافت نوبت و مشاهده صف زنده
            </p>
          </div>
        )}

        <div className="text-xs text-slate-600 whitespace-pre-line pt-2 border-t border-slate-200">
          {footerText}
        </div>
      </div>

      {/* Customization Form (hidden when printing) */}
      <form onSubmit={handleSaveTemplate} className="no-print bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
          تنظیمات قالب فیش و متون چاپ
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            متن بالای فیش (Header)
          </label>
          <input
            type="text"
            value={headerText}
            onChange={(e) => setHeaderText(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            متن پایین فیش (Footer)
          </label>
          <textarea
            rows={2}
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <Save className="w-4 h-4" />
          ذخیره تغییرات قالب فیش
        </button>
      </form>

    </div>
  );
};
