import React, { useState } from 'react';
import { ProductItem, OrderItem, CustomerItem } from '../../backend/database/store.ts';
import {
  ShoppingBag,
  Plus,
  Sparkles,
  TrendingUp,
  Package,
  Users,
  AlertCircle,
  CheckCircle2,
  Share2,
  Copy,
  Check,
} from 'lucide-react';

interface BusinessViewProps {
  products: ProductItem[];
  orders: OrderItem[];
  customers: CustomerItem[];
  onAddProduct: (prod: Omit<ProductItem, 'id'>) => Promise<void>;
  onDecideApproval: (id: string, decision: 'approved' | 'rejected') => Promise<void>;
}

export const BusinessView: React.FC<BusinessViewProps> = ({
  products,
  orders,
  customers,
  onAddProduct,
  onDecideApproval,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'customers' | 'ai_copy'>('inventory');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dates & Food');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [description, setDescription] = useState('');

  // AI Copywriting generator state
  const [selectedProductForCopy, setSelectedProductForCopy] = useState(products[0]?.name || '');
  const [keyFeatures, setKeyFeatures] = useState('100% natural, direct imported, healthy sunnah food, cash on delivery all over Bangladesh');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [copied, setCopied] = useState(false);

  // Financial statistics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalProfit = orders.reduce((sum, o) => sum + o.profit, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending_approval').length;

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !sellingPrice) return;

    await onAddProduct({
      sku,
      name,
      category,
      sellingPrice: Number(sellingPrice),
      costPrice: Number(costPrice) || 0,
      stockQuantity: Number(stockQuantity) || 0,
      description,
      isActive: true,
    });

    setSku('');
    setName('');
    setSellingPrice('');
    setCostPrice('');
    setStockQuantity('');
    setDescription('');
    setIsModalOpen(false);
  };

  const handleGenerateCopy = async () => {
    if (!selectedProductForCopy) return;
    setIsGeneratingPost(true);
    try {
      const res = await fetch('/api/business/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: selectedProductForCopy,
          keyFeatures,
        }),
      });
      const data = await res.json();
      setGeneratedPost(data.post || 'Could not generate post.');
    } catch (err) {
      console.error(err);
      setGeneratedPost('Error connecting to Gemini copywriting assistant.');
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              🛍️
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Barakah Shop BD (Agent 03)
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            E-commerce command center: Inventory control, customer database, financial profits, and AI copy generation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Total Revenue
          </span>
          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            ৳{totalRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Delivered & confirmed</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Net Profit
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ৳{totalProfit.toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-500">Margin calculated</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Products In Catalog
          </span>
          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {products.length}
          </div>
          <span className="text-[10px] text-zinc-500">Active inventory SKUs</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Pending Orders
          </span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {pendingOrdersCount}
          </div>
          <span className="text-[10px] text-amber-600">Requires owner approval</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {[
          { id: 'inventory', label: 'Products Inventory', icon: <Package className="w-4 h-4" /> },
          { id: 'orders', label: 'Orders & Approvals', icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'customers', label: 'Customer DB', icon: <Users className="w-4 h-4" /> },
          { id: 'ai_copy', label: 'AI Facebook Post Drafter', icon: <Sparkles className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Products Inventory */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const margin = p.sellingPrice - p.costPrice;
            const marginPct = Math.round((margin / p.sellingPrice) * 100);
            return (
              <div
                key={p.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-sm hover:border-amber-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      {p.sku}
                    </span>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-1">
                      {p.name}
                    </h3>
                    <span className="text-xs text-zinc-500">{p.category}</span>
                  </div>

                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      p.stockQuantity > 10
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    Stock: {p.stockQuantity}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {p.description}
                </p>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Price / Cost</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">৳{p.sellingPrice}</strong>{' '}
                    <span className="text-zinc-400 line-through text-[11px]">৳{p.costPrice}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-500 block text-[10px]">Net Margin</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      +৳{margin} ({marginPct}%)
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Orders & Approvals */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className={`p-4 rounded-2xl border transition-all ${
                o.status === 'pending_approval'
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
              } shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Order #{o.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      o.status === 'pending_approval'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : o.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {o.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  Customer: <strong>{o.customerName}</strong> ({o.customerPhone})
                </p>
                <div className="text-xs text-zinc-500">
                  {o.items.map((it, i) => `${it.productName} (x${it.quantity})`).join(', ')}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    ৳{o.totalAmount.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">Profit: ৳{o.profit}</span>
                </div>

                {o.requiresApproval && o.status === 'pending_approval' && (
                  <button
                    onClick={() => onDecideApproval(o.id, 'approved')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Customer DB */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {customers.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-2 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300">
                  {c.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{c.fullName}</h4>
                  <p className="text-[11px] text-zinc-500">{c.phone}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500">📍 {c.district}</p>
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-xs">
                <span>Orders: {c.totalOrders}</span>
                <strong className="text-emerald-600 dark:text-emerald-400">
                  Spent: ৳{c.totalSpent.toLocaleString()}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: AI Facebook Post Drafter */}
      {activeTab === 'ai_copy' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Ethical Facebook Sales Post Drafter (Agent 03)
              </h3>
              <p className="text-xs text-zinc-500">
                Crafts authentic, non-deceptive, high-converting social media posts adhering to Islamic business guidelines.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Select Product
              </label>
              <select
                value={selectedProductForCopy}
                onChange={(e) => setSelectedProductForCopy(e.target.value)}
                className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} (৳{p.sellingPrice})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Key Selling Highlights
              </label>
              <input
                type="text"
                value={keyFeatures}
                onChange={(e) => setKeyFeatures(e.target.value)}
                className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateCopy}
            disabled={isGeneratingPost}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingPost ? 'Generating Post via Gemini 3.8...' : 'Draft Facebook Post'}</span>
          </button>

          {generatedPost && (
            <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Ready-to-Post Copy (Bengali / English)
                </span>
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Post'}</span>
                </button>
              </div>
              <pre className="text-xs whitespace-pre-wrap font-sans text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {generatedPost}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                Add Product to Barakah Shop BD
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="BSBD-001"
                    className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Madinah Ajwa Dates (500g)"
                  className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Selling (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="1200"
                    className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Cost (৳)
                  </label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="800"
                    className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="50"
                    className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Authentic details, sourcing info..."
                  className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
