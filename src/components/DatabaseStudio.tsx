import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, Table, Search, Plus, Trash2, Edit3, Download, Upload, 
  RefreshCw, Check, X, AlertTriangle, Copy, ArrowUpDown, ChevronLeft, 
  ChevronRight, Filter, Eye, FileText, Server, Sparkles, CheckCircle2,
  ExternalLink, Layers, ArrowLeft
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { toPersianDigits } from '../utils/jalali';

interface DatabaseStudioProps {
  onBack?: () => void;
  isEmbedded?: boolean;
}

export const DatabaseStudio: React.FC<DatabaseStudioProps> = ({ onBack, isEmbedded = false }) => {
  const tables = useMemo(() => StorageService.getAvailableTables(), []);
  const [selectedTableId, setSelectedTableId] = useState<string>('profiles');
  const [rows, setRows] = useState<any[]>([]);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Modals & Feedback
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [viewingJsonRow, setViewingJsonRow] = useState<any | null>(null);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dbSources, setDbSources] = useState<Record<string, 'supabase' | 'local'>>({});

  const currentSource = dbSources[selectedTableId] || 'supabase';

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadCurrentTableData = async (tableIdToLoad: string = selectedTableId, sourceToUse?: 'supabase' | 'local') => {
    setIsLoading(true);
    const source = sourceToUse || dbSources[tableIdToLoad] || 'supabase';
    try {
      const data = await StorageService.fetchTableRowsBySource(tableIdToLoad, source);
      setRows(data);
      setTableCounts(prev => ({ ...prev, [tableIdToLoad]: data.length }));
    } catch (err) {
      console.error(`Error fetching table ${tableIdToLoad} from ${source}:`, err);
      const fallback = StorageService.getTableRows(tableIdToLoad);
      setRows(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSource = async (newSource: 'supabase' | 'local') => {
    setDbSources(prev => ({ ...prev, [selectedTableId]: newSource }));
    await loadCurrentTableData(selectedTableId, newSource);
    const currentTableMeta = tables.find(t => t.id === selectedTableId);
    showToast(
      newSource === 'supabase'
        ? `🌐 داده‌های جدول «${currentTableMeta?.name}» از دیتابیس اصلی Supabase دریافت شد.`
        : `💾 داده‌های جدول «${currentTableMeta?.name}» از دیتابیس محلی (Local Cache) دریافت شد.`,
      'info'
    );
  };

  useEffect(() => {
    loadCurrentTableData(selectedTableId);
    setCurrentPage(1);
    setSearchTerm('');
    setEditingRow(null);
    setIsCreatingNew(false);
  }, [selectedTableId]);

  // Extract all distinct column keys from rows
  const columns = useMemo(() => {
    if (!rows || rows.length === 0) return ['id', 'created_at'];
    const keysSet = new Set<string>();
    // Prioritize standard keys first
    const priority = ['id', 'name', 'full_name', 'username', 'phone', 'role', 'status', 'category', 'ticket_number', 'key', 'enabled'];
    priority.forEach(k => {
      if (rows.some(r => r && r[k] !== undefined)) {
        keysSet.add(k);
      }
    });

    rows.forEach(r => {
      if (r && typeof r === 'object') {
        Object.keys(r).forEach(k => keysSet.add(k));
      }
    });
    return Array.from(keysSet);
  }, [rows]);

  // Filtered & Sorted Rows
  const processedRows = useMemo(() => {
    let result = [...rows];

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(r => {
        if (!r) return false;
        return Object.values(r).some(val => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') {
            return JSON.stringify(val).toLowerCase().includes(q);
          }
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    if (sortField) {
      result.sort((a, b) => {
        let valA = a ? a[sortField] : '';
        let valB = b ? b[sortField] : '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rows, searchTerm, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processedRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, currentPage, pageSize]);

  const handleSort = (column: string) => {
    if (sortField === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(column);
      setSortOrder('desc');
    }
  };

  const handleCopyValue = (val: string, keyName: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    const rowIdentifier = editingRow.id || editingRow.shop_id || editingRow.key;
    setIsLoading(true);
    const success = await StorageService.updateTableRow(selectedTableId, rowIdentifier, editingRow);
    if (success) {
      await loadCurrentTableData(selectedTableId);
      setEditingRow(null);
      showToast(`✅ ردیف با شناسه «${rowIdentifier}» در دیتابیس ابری Supabase با موفقیت ویرایش شد.`);
    } else {
      setIsLoading(false);
      showToast(`❌ خطا در ذخیره تغییرات ردیف`, 'error');
    }
  };

  const handleCreateNewRow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await StorageService.insertTableRow(selectedTableId, newRowData);
    if (success) {
      await loadCurrentTableData(selectedTableId);
      setIsCreatingNew(false);
      setNewRowData({});
      showToast(`✅ ردیف جدید با موفقیت به جدول ${selectedTableId} در دیتابیس ابری افزوده شد.`);
    } else {
      setIsLoading(false);
      showToast(`❌ خطا در افزودن ردیف جدید`, 'error');
    }
  };

  const handleDeleteRow = async (rowIdentifier: string) => {
    setIsLoading(true);
    const success = await StorageService.deleteTableRow(selectedTableId, rowIdentifier);
    if (success) {
      await loadCurrentTableData(selectedTableId);
      setDeletingRowId(null);
      showToast(`✅ ردیف با شناسه «${rowIdentifier}» از دیتابیس ابری حذف شد.`);
    } else {
      setIsLoading(false);
      showToast(`❌ خطا در حذف ردیف`, 'error');
    }
  };

  const handleResetTable = async () => {
    setIsLoading(true);
    setIsResetConfirmOpen(false);
    try {
      if (currentSource === 'supabase') {
        const freshData = await StorageService.resetTableToDefault(selectedTableId);
        setRows(freshData);
        setTableCounts(prev => ({ ...prev, [selectedTableId]: freshData.length }));
        showToast(`✅ اطلاعات جدول ${selectedTableId} مستقیماً از دیتابیس اصلی Supabase مجدداً خوانده و بازنشانی شد.`);
      } else {
        const freshData = StorageService.getTableRows(selectedTableId);
        setRows(freshData);
        setTableCounts(prev => ({ ...prev, [selectedTableId]: freshData.length }));
        showToast(`✅ داده‌های جدول ${selectedTableId} در دیتابیس محلی مجدداً بازنشانی و بارگذاری شدند.`);
      }
    } catch (e) {
      showToast(`❌ خطا در بازخوانی اطلاعات جدول`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(rows, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bisaf_${selectedTableId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`📥 خروجی داده‌های جدول ${selectedTableId} با فرمت JSON دانلود شد.`);
  };

  const handleExportCSV = () => {
    if (rows.length === 0) {
      showToast('⚠️ جدولی خالی است و ردیفی برای استخراج وجود ندارد.', 'info');
      return;
    }
    const header = columns.join(',');
    const csvRows = rows.map(r => {
      return columns.map(col => {
        let val = r[col];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') val = JSON.stringify(val).replace(/"/g, '""');
        else val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      }).join(',');
    });
    const csvContent = '\uFEFF' + [header, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bisaf_${selectedTableId}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`📥 خروجی CSV جدول ${selectedTableId} دانلود شد.`);
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed) && typeof parsed === 'object') {
        StorageService.setTableRows(selectedTableId, [parsed]);
      } else if (Array.isArray(parsed)) {
        StorageService.setTableRows(selectedTableId, parsed);
      } else {
        throw new Error('فرمت داده باید یک آرایه یا شیء معتبر JSON باشد.');
      }
      loadCurrentTableData();
      setIsImportModalOpen(false);
      setImportJsonText('');
      showToast(`✅ داده‌های وارد شده با موفقیت در جدول ${selectedTableId} ثبت و جایگزین شدند.`);
    } catch (err: any) {
      showToast(`❌ خطا در خواندن JSON: ${err.message || 'فرمت نامعتبر'}`, 'error');
    }
  };

  const currentTableMeta = tables.find(t => t.id === selectedTableId) || tables[0];

  return (
    <div className="space-y-5 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg border animate-bounce ${
          notification.type === 'error'
            ? 'bg-rose-500 text-white border-rose-600'
            : notification.type === 'info'
            ? 'bg-indigo-600 text-white border-indigo-700'
            : 'bg-emerald-600 text-white border-emerald-700'
        }`}>
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            {notification.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="بازگشت"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                مدیریت جداول و پایگاه داده (Database Studio)
              </h1>
              {currentSource === 'supabase' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>متصل به پایگاه داده اصلی Supabase PostgreSQL</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[11px] font-extrabold flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>متصل به پایگاه داده محلی (Local Storage / Fallback)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              مشاهده زنده سطرها و ستون‌های دیتابیس، سوئیچ بین دیتابیس سوپابیس و محلی، ویرایش اطلاعات ردیف‌ها و خروجی/ورودی JSON
            </p>
          </div>
        </div>

        {/* Global DB Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadCurrentTableData(selectedTableId)}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>تازه‌سازی داده‌ها</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-500" />
            <span>ورود JSON</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>خروجی JSON</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-purple-500" />
            <span>خروجی CSV</span>
          </button>

          <button
            onClick={() => {
              setNewRowData({ id: `rec_${Date.now()}` });
              setIsCreatingNew(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن ردیف جدید</span>
          </button>
        </div>
      </div>

      {/* Table Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {tables.map(tbl => {
            const isSelected = tbl.id === selectedTableId;
            const tblSource = dbSources[tbl.id] || 'supabase';
            const count = tableCounts[tbl.id] !== undefined ? tableCounts[tbl.id] : StorageService.getTableRows(tbl.id).length;
            return (
              <button
                key={tbl.id}
                onClick={() => setSelectedTableId(tbl.id)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md font-black scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>{tbl.name}</span>
                <span className="text-[10px]" title={tblSource === 'supabase' ? 'سوپابیس ابری' : 'دیتابیس محلی'}>
                  {tblSource === 'supabase' ? '🌐' : '💾'}
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {toPersianDigits(count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Table Summary & Filter Tools */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                جدول: {currentTableMeta.name}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                ({toPersianDigits(processedRows.length)} ردیف از {toPersianDigits(rows.length)})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentTableMeta.description}</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Database Source Switcher for this Table */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleToggleSource('supabase')}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currentSource === 'supabase'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>🌐 سوپابیس (Supabase)</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleSource('local')}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currentSource === 'local'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>💾 محلی (Local DB)</span>
              </button>
            </div>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>بازنشانی به پیش‌فرض</span>
            </button>
          </div>
        </div>

        {/* Search and Column Settings */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="جستجو در تمام فیلدها و ستون‌های این جدول..."
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>تعداد در صفحه:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none"
              >
                <option value={10}>۱۰</option>
                <option value={15}>۱۵</option>
                <option value={30}>۳۰</option>
                <option value={50}>۵۰</option>
                <option value={100}>۱۰۰</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table Grid */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 scrollbar-thin">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 w-12 text-center">#</th>
                {columns.map(col => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="p-3 whitespace-nowrap cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      {sortField === col && (
                        <span className="text-[10px] text-indigo-600 font-black">
                          {sortOrder === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="p-3 w-28 text-center sticky left-0 bg-slate-100 dark:bg-slate-800 shadow-md">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="p-8 text-center text-slate-400">
                    {searchTerm ? 'هیچ ردیفی با این عبارت یافت نشد.' : 'این جدول در حال حاضر هیچ داده‌ای ندارد.'}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  const rowId = row?.id || row?.shop_id || row?.key || `idx_${idx}`;
                  return (
                    <tr
                      key={rowId}
                      className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors group"
                    >
                      <td className="p-3 text-center text-slate-400 font-mono text-[11px]">
                        {toPersianDigits((currentPage - 1) * pageSize + idx + 1)}
                      </td>

                      {columns.map(col => {
                        const val = row ? row[col] : undefined;
                        const isNull = val === null || val === undefined;
                        const isBool = typeof val === 'boolean';
                        const isObj = typeof val === 'object' && !isNull;

                        return (
                          <td key={col} className="p-3 max-w-xs truncate text-[11px]">
                            {isNull ? (
                              <span className="text-slate-300 dark:text-slate-600 italic">null</span>
                            ) : isBool ? (
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                val
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              }`}>
                                {val ? 'true (فعال)' : 'false (غیرفعال)'}
                              </span>
                            ) : isObj ? (
                              <button
                                onClick={() => setViewingJsonRow({ column: col, data: val })}
                                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] hover:bg-indigo-100 transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3 text-indigo-500" />
                                <span>JSON ({Array.isArray(val) ? `آرایه: ${val.length}` : 'شیء'})</span>
                              </button>
                            ) : col === 'id' || col.endsWith('_id') ? (
                              <div className="flex items-center gap-1 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                                <span className="truncate max-w-[120px]">{String(val)}</span>
                                <button
                                  onClick={() => handleCopyValue(String(val), `${rowId}_${col}`)}
                                  className="text-slate-400 hover:text-indigo-600"
                                  title="کپی شناسه"
                                >
                                  {copiedKey === `${rowId}_${col}` ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ) : col.includes('role') ? (
                              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold text-[10px]">
                                {String(val)}
                              </span>
                            ) : col.includes('status') ? (
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">
                                {String(val)}
                              </span>
                            ) : (
                              <span className="text-slate-800 dark:text-slate-200">
                                {typeof val === 'string' && val.length > 50 ? `${val.substring(0, 50)}...` : String(val)}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Row Action Buttons */}
                      <td className="p-3 text-center sticky left-0 bg-white/95 dark:bg-slate-900/95 shadow-sm group-hover:bg-indigo-50/95 dark:group-hover:bg-indigo-950/95 transition-colors">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingRow({ ...row })}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-950 rounded-lg transition-colors"
                            title="ویرایش این ردیف"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setViewingJsonRow({ column: 'کل ردیف', data: row })}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="مشاهده JSON کامل"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeletingRowId(rowId)}
                            className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg transition-colors"
                            title="حذف این ردیف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500">
              صفحه {toPersianDigits(currentPage)} از {toPersianDigits(totalPages)}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-xs font-bold"
              >
                اولین
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {toPersianDigits(pageNum)}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-xs font-bold"
              >
                آخرین
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT ROW MODAL */}
      {editingRow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  ویرایش ردیف در جدول {selectedTableId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(editingRow).map(key => {
                const val = editingRow[key];
                const isBool = typeof val === 'boolean';
                const isObj = typeof val === 'object' && val !== null;
                const isNum = typeof val === 'number';

                return (
                  <div
                    key={key}
                    className={`space-y-1.5 ${isObj ? 'md:col-span-2' : ''}`}
                  >
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-mono">
                      {key}:
                    </label>

                    {isBool ? (
                      <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                          <input
                            type="checkbox"
                            checked={val}
                            onChange={(e) => setEditingRow({ ...editingRow, [key]: e.target.checked })}
                            className="w-4 h-4 rounded text-indigo-600"
                          />
                          <span>{val ? 'فعال (True)' : 'غیرفعال (False)'}</span>
                        </label>
                      </div>
                    ) : isObj ? (
                      <div>
                        <textarea
                          rows={4}
                          value={JSON.stringify(val, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              setEditingRow({ ...editingRow, [key]: parsed });
                            } catch {
                              // keep raw if not yet valid
                            }
                          }}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs outline-none dir-ltr text-left"
                        />
                        <span className="text-[10px] text-slate-400">مقدار JSON را در صورت نیاز ویرایش نمایید.</span>
                      </div>
                    ) : (
                      <input
                        type={isNum ? 'number' : 'text'}
                        value={val !== null && val !== undefined ? val : ''}
                        onChange={(e) => setEditingRow({
                          ...editingRow,
                          [key]: isNum ? Number(e.target.value) : e.target.value
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                ذخیره تغییرات در دیتابیس
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE NEW ROW MODAL */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <form
            onSubmit={handleCreateNewRow}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  افزودن ردیف جدید به جدول {selectedTableId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {columns.map(col => (
                <div key={col} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-mono">
                    {col}:
                  </label>
                  <input
                    type="text"
                    value={newRowData[col] !== undefined ? newRowData[col] : ''}
                    onChange={(e) => setNewRowData({ ...newRowData, [col]: e.target.value })}
                    placeholder={`مقدار ${col}...`}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                ثبت و درج در دیتابیس
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW JSON DETAILS MODAL */}
      {viewingJsonRow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>نمایش جزئیات {viewingJsonRow.column}</span>
              </h3>
              <button
                onClick={() => setViewingJsonRow(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto dir-ltr text-left max-h-96">
                {JSON.stringify(viewingJsonRow.data, null, 2)}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(viewingJsonRow.data, null, 2));
                  showToast('📋 کد JSON در حافظه کپی شد.');
                }}
                className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-mono flex items-center gap-1 border border-slate-700"
              >
                <Copy className="w-3 h-3" />
                <span>کپی JSON</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingJsonRow(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingRowId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                تأیید حذف ردیف از دیتابیس
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                شناسه ردیف: {deletingRowId}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingRowId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                انصراف
              </button>
              <button
                onClick={() => handleDeleteRow(deletingRowId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                حذف قطعی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET TABLE MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                بازخوانی و بازنشانی جدول {selectedTableId} از دیتابیس ابری؟
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                این عملیات آخرین داده‌های موجود در پایگاه داده ابری Supabase را مستقیماً مجدداً خوانده و جدول را با دیتابیس همگام می‌سازد.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                انصراف
              </button>
              <button
                onClick={handleResetTable}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
              >
                بازخوانی و بازنشانی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT JSON MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  ورود فایل یا متن JSON به جدول {selectedTableId}
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                محتوای JSON ردیف‌ها (آرایه یا شیء):
              </label>
              <textarea
                rows={8}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[ { "id": "sample_1", ... } ]'
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs outline-none dir-ltr text-left"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <label className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                <span>انتخاب فایل .json</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setImportJsonText(String(event.target?.result || ''));
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  onClick={handleImportJSON}
                  disabled={!importJsonText.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold"
                >
                  ثبت و ذخیره در جدول
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
