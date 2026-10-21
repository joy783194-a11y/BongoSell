import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Tag,
  Check,
  X,
  Sparkles,
  Edit2,
  Trash2,
  AlertCircle,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../../lib/database-service';
import { DatabaseProduct } from '../../lib/supabase';

export const DashboardProductsPage: React.FC = () => {
  const { currentWorkspace } = useAuth();
  const { isBangla } = useLanguage();

  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DatabaseProduct | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('Clothing');
  const [formPrice, setFormPrice] = useState('');
  const [formMinPrice, setFormMinPrice] = useState('');
  const [formDiscountLimit, setFormDiscountLimit] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'draft' | 'archived'>('active');

  const workspaceId = currentWorkspace?.id || 'default-ws';

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    const data = await getProducts(workspaceId);
    setProducts(data);
    setIsLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const resetForm = () => {
    setFormName('');
    setFormSku('');
    setFormCategory('Clothing');
    setFormPrice('');
    setFormMinPrice('');
    setFormDiscountLimit('');
    setFormStock('10');
    setFormDescription('');
    setFormStatus('active');
    setEditingProduct(null);
    setActionError(null);
  };

  const handleOpenEdit = (product: DatabaseProduct) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSku(product.sku || '');
    setFormCategory(product.category || 'General');
    setFormPrice(product.price.toString());
    setFormMinPrice(product.minimum_price ? product.minimum_price.toString() : '');
    setFormDiscountLimit(product.discount_limit ? product.discount_limit.toString() : '');
    setFormStock(product.stock_quantity.toString());
    setFormDescription(product.description || '');
    setFormStatus(product.status);
    setActionError(null);
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const priceNum = Number(formPrice);
    if (!formName.trim() || isNaN(priceNum) || priceNum <= 0) {
      setActionError(
        isBangla
          ? 'অনুগ্রহ করে পণ্যের নাম ও সঠিক বিক্রয়মূল্য প্রদান করুন।'
          : 'Please provide a valid product name and price.'
      );
      return;
    }

    const minPriceNum = formMinPrice ? Number(formMinPrice) : null;
    if (minPriceNum !== null && minPriceNum > priceNum) {
      setActionError(
        isBangla
          ? 'সর্বনিম্ন ফ্লোর প্রাইস বিক্রয়মূল্যের চেয়ে বেশি হতে পারে না।'
          : 'Minimum floor price cannot be greater than regular price.'
      );
      return;
    }

    const discountNum = formDiscountLimit ? Number(formDiscountLimit) : null;
    const stockNum = parseInt(formStock, 10) || 0;

    setIsSubmitting(true);

    if (editingProduct) {
      const { error } = await updateProduct(editingProduct.id, {
        name: formName.trim(),
        sku: formSku.trim() || null,
        category: formCategory,
        price: priceNum,
        minimum_price: minPriceNum,
        discount_limit: discountNum,
        stock_quantity: stockNum,
        description: formDescription.trim() || null,
        status: formStatus,
      });

      if (error) {
        setActionError(error);
        setIsSubmitting(false);
        return;
      }

      setActionSuccess(isBangla ? 'পণ্য সফলভাবে আপডেট করা হয়েছে!' : 'Product updated successfully!');
    } else {
      const { error } = await addProduct(workspaceId, {
        name: formName.trim(),
        sku: formSku.trim() || 'SKU-' + Math.floor(100 + Math.random() * 900),
        category: formCategory,
        price: priceNum,
        minimum_price: minPriceNum,
        discount_limit: discountNum,
        stock_quantity: stockNum,
        description: formDescription.trim() || null,
        status: formStatus,
        image_url: null,
      });

      if (error) {
        setActionError(error);
        setIsSubmitting(false);
        return;
      }

      setActionSuccess(isBangla ? 'নতুন পণ্য সফলভাবে ক্যাটালগে যুক্ত হয়েছে!' : 'New product added successfully!');
    }

    setIsSubmitting(false);
    setShowAddModal(false);
    resetForm();
    await loadProducts();
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleDelete = async (productId: string) => {
    if (
      !confirm(
        isBangla
          ? 'আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?'
          : 'Are you sure you want to delete this product?'
      )
    ) {
      return;
    }

    const { error } = await deleteProduct(productId);
    if (error) {
      alert(error);
    } else {
      await loadProducts();
    }
  };

  // Filtered dataset
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['all', 'Clothing', 'Gadgets', 'Cosmetics', 'Jewelry', 'Food', 'General'];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isBangla ? 'প্রোডাক্ট ও ক্যাটালগ রুলস' : 'Product Catalog & Rules'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBangla
              ? 'মাল্টি-টেন্যান্ট ডেটাবেজে পণ্য সংরক্ষণ করুন; ফ্লোর প্রাইস ও স্টক অনুযায়ী এআই মেসেঞ্জারে স্বয়ংক্রিয় উত্তর দেবে'
              : 'Multi-tenant database storage for inventory, prices, floor limits, and AI Messenger grounding'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 cursor-pointer self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isBangla ? 'নতুন পণ্য যোগ করুন' : 'Add New Product'}</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBangla ? 'পণ্যের নাম, বিবরণ বা SKU কোড...' : 'Search name, SKU, or notes...'}
            className="w-full bg-[#131B26] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category & Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-1 bg-[#131B26] border border-slate-800 p-1 rounded-lg">
            {(['all', 'active', 'draft', 'archived'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'all'
                  ? isBangla
                    ? 'সকল'
                    : 'All'
                  : st === 'active'
                  ? isBangla
                    ? 'সক্রিয়'
                    : 'Active'
                  : st === 'draft'
                  ? isBangla
                    ? 'ড্রাফট'
                    : 'Draft'
                  : isBangla
                  ? 'আর্কাইভ'
                  : 'Archived'}
              </button>
            ))}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#131B26] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">{isBangla ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
            {categories.filter((c) => c !== 'all').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs sm:text-sm">
            {isBangla ? 'পণ্য তালিকা লোড হচ্ছে...' : 'Loading catalog from database...'}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-300 font-semibold">
              {isBangla ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isBangla
                ? 'আপনার সার্চ ফিল্টারের সাথে মিলছে না অথবা এখনও কোনো পণ্য যোগ করা হয়নি।'
                : 'Try adjusting your search filters or click "Add New Product" to populate your catalog.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-[#162130]">
                  <th className="py-3 px-4">{isBangla ? 'পণ্যের নাম ও বিবরণ' : 'Product & Category'}</th>
                  <th className="py-3 px-4">{isBangla ? 'SKU কোড' : 'SKU'}</th>
                  <th className="py-3 px-4">{isBangla ? 'বিক্রয়মূল্য' : 'Regular Price'}</th>
                  <th className="py-3 px-4">{isBangla ? 'ফ্লোর প্রাইস (এআই লিমিট)' : 'Floor Price'}</th>
                  <th className="py-3 px-4">{isBangla ? 'স্টক' : 'Stock'}</th>
                  <th className="py-3 px-4">{isBangla ? 'স্থিতি' : 'Status'}</th>
                  <th className="py-3 px-4 text-right">{isBangla ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        <span className="text-indigo-400 font-medium mr-1.5">{p.category}</span>
                        {p.description}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      {p.sku || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white font-mono">
                      ৳{Number(p.price).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">
                      {p.minimum_price ? (
                        <span className="text-emerald-400">৳{Number(p.minimum_price).toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-500">{isBangla ? 'ফিক্সড' : 'Fixed'}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          p.stock_quantity > 0 ? 'text-slate-200' : 'text-red-400'
                        }`}
                      >
                        {p.stock_quantity > 0 ? `${p.stock_quantity} pcs` : isBangla ? 'আউট' : '0'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                          p.status === 'active'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                            : p.status === 'draft'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p.status === 'active'
                          ? isBangla
                            ? 'সক্রিয়'
                            : 'Active'
                          : p.status === 'draft'
                          ? isBangla
                            ? 'ড্রাফট'
                            : 'Draft'
                          : isBangla
                          ? 'আর্কাইভ'
                          : 'Archived'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[#131B26] border border-slate-700 max-w-lg w-full rounded-2xl p-6 space-y-5 text-left relative my-8 shadow-2xl text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingProduct
                  ? isBangla
                    ? 'পণ্য বিবরণ আপডেট করুন'
                    : 'Update Product Details'
                  : isBangla
                  ? 'নতুন পণ্য ক্যাটালগে যুক্ত করুন'
                  : 'Add New Product to Catalog'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  {isBangla ? 'পণ্যের নাম' : 'Product Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="যেমন: কাতান শাড়ী বা এয়ারবাডস"
                  className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    {isBangla ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Clothing">Clothing (পোশাক)</option>
                    <option value="Gadgets">Gadgets (গ্যাজেট)</option>
                    <option value="Cosmetics">Cosmetics (প্রসাধন)</option>
                    <option value="Jewelry">Jewelry (জুয়েলারি)</option>
                    <option value="Food">Food (খাবার)</option>
                    <option value="General">General (সাধারণ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    {isBangla ? 'SKU / কোড' : 'SKU / Code'}
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="JMD-101"
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    {isBangla ? 'বিক্রয়মূল্য (টাকা)' : 'Price (BDT)'} *
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="2500"
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    {isBangla ? 'ফ্লোর প্রাইস (সর্বনিম্ন ছাড়ের সীমা)' : 'Min Floor Price (BDT)'}
                  </label>
                  <input
                    type="number"
                    value={formMinPrice}
                    onChange={(e) => setFormMinPrice(e.target.value)}
                    placeholder="যেমন: 2300"
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    {isBangla ? 'স্টক পরিমাণ (Pcs)' : 'Stock Quantity'}
                  </label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="10"
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    {isBangla ? 'পণ্য স্থিতি' : 'Status'}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="active">{isBangla ? 'সক্রিয় (Active)' : 'Active'}</option>
                    <option value="draft">{isBangla ? 'ড্রাফট (Draft)' : 'Draft'}</option>
                    <option value="archived">{isBangla ? 'আর্কাইভ (Archived)' : 'Archived'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  {isBangla ? 'বিবরণ ও ভ্যারিয়েন্ট (সাইজ, রঙ বা ফিচার)' : 'Description & Variants'}
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={
                    isBangla
                      ? 'যেমন: লাল বর্ডার, ম্যাচিং ব্লাউজ পিস সহ। সাইজ: ৩৮, ৪০, ৪২'
                      : 'e.g. Red border, matching blouse piece included. Sizes: M, L, XL'
                  }
                  className="w-full bg-[#0E131B] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting
                    ? isBangla
                      ? 'সংরক্ষণ হচ্ছে...'
                      : 'Saving...'
                    : editingProduct
                    ? isBangla
                      ? 'আপডেট করুন'
                      : 'Save Changes'
                    : isBangla
                    ? 'যুক্ত করুন'
                    : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
