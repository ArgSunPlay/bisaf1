import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Shop, ProductItem } from '../types';
import { Plus, Trash2, Edit2, Image as ImageIcon, Save, X, ShoppingBag } from 'lucide-react';

interface Props {
  shop: Shop;
  onUpdate: () => void;
}

export const ShopProductsManager: React.FC<Props> = ({ shop, onUpdate }) => {
  const [products, setProducts] = useState<ProductItem[]>(shop.product_items || []);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setName('');
    setPrice(0);
    setDescription('');
    setImageUrl('');
    setIsActive(true);
    setIsEditing(null);
    setShowAddForm(false);
  };

  const handleEdit = (product: ProductItem) => {
    setName(product.name);
    setPrice(product.price || 0);
    setDescription(product.description || '');
    setImageUrl(product.image_url || '');
    setIsActive(product.is_active ?? true);
    setIsEditing(product.id);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const newProduct: ProductItem = {
      id: isEditing || `prod-${Date.now()}`,
      name,
      price: price > 0 ? price : undefined,
      description: description.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      is_active: isActive
    };

    let updatedProducts = [...products];

    if (isEditing) {
      updatedProducts = updatedProducts.map(p => p.id === isEditing ? newProduct : p);
    } else {
      updatedProducts.push(newProduct);
    }

    // Save to Shop
    const updatedShop = { ...shop, product_items: updatedProducts };
    StorageService.saveShop(updatedShop);
    
    setProducts(updatedProducts);
    resetForm();
    onUpdate();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('آیا از حذف این محصول اطمینان دارید؟')) return;
    
    const updatedProducts = products.filter(p => p.id !== id);
    const updatedShop = { ...shop, product_items: updatedProducts };
    StorageService.saveShop(updatedShop);
    
    setProducts(updatedProducts);
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          مدیریت محصولات و منو
        </h3>
        
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
          >
            <Plus className="w-4 h-4" /> افزودن محصول
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isEditing ? 'ویرایش محصول' : 'ایجاد محصول جدید'}
            </h4>
            <button onClick={resetForm} className="text-slate-400 hover:text-rose-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">نام محصول / غذا</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                placeholder="مثال: پیتزا پپرونی"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">قیمت (تومان)</label>
              <input
                type="number"
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                placeholder="0"
                dir="ltr"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">توضیحات (ترکیبات، وزن و...)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                placeholder="مثال: پنیر موزارلا، پپرونی، قارچ، فلفل دلمه‌ای"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">لینک تصویر (URL)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="absolute right-2 top-2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full pr-8 pl-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-mono text-left"
                    placeholder="https://example.com/image.jpg"
                    dir="ltr"
                  />
                </div>
                {imageUrl && (
                  <img src={imageUrl} alt="preview" className="w-9 h-9 rounded-md object-cover border border-slate-200" onError={(e) => (e.currentTarget.style.display = 'none')} />
                )}
              </div>
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <label htmlFor="isActive" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                این محصول در منو نمایش داده شود (موجود است)
              </label>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full py-2 mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" /> ذخیره محصول
          </button>
        </div>
      )}

      {/* Products List */}
      {!showAddForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {products.map(product => (
            <div key={product.id} className={`flex items-center gap-3 p-3 rounded-xl border ${product.is_active !== false ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-60'}`}>
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-14 h-14 rounded-lg object-cover bg-slate-100" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-slate-300" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate">{product.name}</h5>
                  {product.price ? (
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded shrink-0">
                      {product.price.toLocaleString()} تومان
                    </span>
                  ) : null}
                </div>
                {product.description && (
                  <p className="text-[10px] text-slate-500 mt-1 truncate">{product.description}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEdit(product)} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> ویرایش
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> حذف
                  </button>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="sm:col-span-2 text-center py-8 text-slate-400">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">هنوز محصولی ثبت نشده است.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
