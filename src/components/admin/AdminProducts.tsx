import React, { useState, useMemo } from 'react';
import { PackageOpen, Plus, Edit2, Trash2, Image as ImageIcon, Search, EyeOff, Eye, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useAdminData } from './AdminDataContext';
import { Product } from '../../types';

export function AdminProducts() {
  const { products, updateProduct, addProduct, deleteProduct, updateStock, toggleProductDraft, settings, targetProductId, setTargetProductId } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  React.useEffect(() => {
    if (targetProductId) {
      const p = products.find(prod => prod.id === targetProductId);
      if (p) {
        setEditingProduct(p);
      }
      setTargetProductId(null);
    }
  }, [targetProductId, products, setTargetProductId]);

  const [collectionFilter, setCollectionFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.collection?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCollection = collectionFilter === 'all' || p.collection === collectionFilter;
      
      return matchesSearch && matchesCollection;
    });
  }, [products, searchQuery, collectionFilter]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-royal-purple dark:text-gold-light mb-2">Products Management</h1>
          <p className="text-gray-500 dark:text-gray-400 font-sans text-sm">Add, edit, or manage stock for your catalog.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-royal-purple dark:bg-divine-gold dark:text-royal-purple text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 w-fit"
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col transition-colors">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center gap-4 bg-gray-50/50 dark:bg-white/5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:border-royal-purple outline-none transition-all dark:text-white"
            />
          </div>
          <select 
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:border-royal-purple outline-none transition-all dark:text-white"
          >
            <option value="all">All Products</option>
            <option value="tiles">Tiles & Sanitaryware</option>
            <option value="paints">Paints</option>
          </select>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{filteredProducts.length} items</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[500px] md:min-w-[800px]">
            <thead>
              <tr className="bg-white dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-white/10">
                <th className="py-3 px-4 md:px-6 font-sans text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">Product</th>
                <th className="py-3 px-6 font-sans text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold hidden md:table-cell">Category</th>
                <th className="py-3 px-2 md:px-6 font-sans text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">Price</th>
                <th className="py-3 px-2 md:px-6 font-sans text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold text-center">Stock</th>
                <th className="py-3 px-6 font-sans text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold text-center hidden sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr 
                  key={p.id} 
                  onClick={() => setEditingProduct(p)}
                  className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="py-3 px-4 md:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#121212] border border-gray-200 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
                      </div>
                      <div>
                        <p className="font-sans font-semibold text-gray-900 dark:text-white text-sm md:text-base group-hover:text-royal-purple dark:group-hover:text-gold-light transition-colors">{p.name}</p>
                        <p className="font-sans text-[11px] md:text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest">{p.collection === 'paints' ? 'Paints' : 'Tiles & San.'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 hidden md:table-cell">
                    <span className="font-sans text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md">{p.category}</span>
                  </td>
                  <td className="py-3 px-2 md:px-6 font-sans text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                    ₹ {p.price?.toLocaleString('en-IN') || 0}
                    {p.unit && <span className="text-[10px] text-gray-500 font-normal ml-1 whitespace-nowrap">{p.unit}</span>}
                  </td>
                  <td className="py-3 px-2 md:px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-center justify-center gap-1.5 md:gap-2">
                      <select
                        value={p.stockCount === 0 ? 'out' : 'in'}
                        onChange={(e) => updateStock(p.id, e.target.value === 'in' ? (p.stockCount === 0 ? 100 : p.stockCount || 100) : 0)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded outline-none border ${p.stockCount === 0 ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50'}`}
                      >
                        <option value="in" className="bg-white text-gray-900 dark:bg-[#121212] dark:text-white">In Stock</option>
                        <option value="out" className="bg-white text-gray-900 dark:bg-[#121212] dark:text-white">Out of Stock</option>
                      </select>
                      
                      <div className="flex items-center justify-center gap-1 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-full p-0.5">
                        <button 
                          onClick={() => updateStock(p.id, Math.max(0, (p.stockCount || 0) - 1))}
                          className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors text-sm font-medium"
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          min="0" 
                          value={p.stockCount === 0 ? '' : p.stockCount}
                          placeholder="0"
                          onChange={(e) => updateStock(p.id, parseInt(e.target.value) || 0)}
                          className="w-8 text-center font-sans text-[10px] md:text-xs bg-transparent outline-none dark:text-white"
                        />
                        <button 
                          onClick={() => updateStock(p.id, (p.stockCount || 0) + 1)}
                          className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors text-sm font-medium"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-center hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => toggleProductDraft(p.id, !p.draft)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        p.draft 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                      }`}
                    >
                      {p.draft ? <EyeOff size={12} /> : <Eye size={12} />}
                      {p.draft ? 'Draft' : 'Published'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400 font-sans text-sm">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(isAdding || editingProduct) && (
        <ProductModal 
          product={editingProduct} 
          categoriesData={settings.categories}
          onClose={() => { setIsAdding(false); setEditingProduct(null); }}
          onSave={(p) => {
            if (editingProduct) updateProduct(p as Product);
            else addProduct(p);
            setIsAdding(false);
            setEditingProduct(null);
          }}
          onDelete={(id) => {
            deleteProduct(id);
            setIsAdding(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, categoriesData, onClose, onSave, onDelete }: { product: Product | null, categoriesData: { tiles: string[], paints: string[] }, onClose: () => void, onSave: (p: any) => void, onDelete?: (id: string) => void }) {
  const { activityLogs } = useAdminData();
  const [activeTab, setActiveTab] = useState<'edit' | 'history'>('edit');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    name: '', collection: 'tiles', category: categoriesData.tiles[0] || 'Tiles', image: '', description: '', price: 0, stockCount: 100, draft: false, advanced: {}
  });

  const currentCategories = formData.collection === 'paints' ? categoriesData.paints : categoriesData.tiles;

  // Auto-update category if collection changes
  const handleCollectionChange = (collection: 'tiles' | 'paints') => {
    setFormData({
      ...formData,
      collection,
      category: collection === 'paints' ? categoriesData.paints[0] || 'Interior Paints' : categoriesData.tiles[0] || 'Tiles'
    });
  };

  const productLogs = useMemo(() => {
    if (!product) return [];
    return activityLogs.filter(log => log.targetId === product.id).sort((a, b) => b.timestamp - a.timestamp);
  }, [activityLogs, product]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-royal-purple dark:text-gold-light">{product ? 'Manage Product' : 'Add New Product'}</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>
          {product && (
            <div className="flex gap-4 border-b border-gray-200 dark:border-white/10">
              <button 
                onClick={() => setActiveTab('edit')}
                className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'edit' ? 'border-royal-purple dark:border-gold-light text-royal-purple dark:text-gold-light' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              >
                Edit Details
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`pb-2 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'history' ? 'border-royal-purple dark:border-gold-light text-royal-purple dark:text-gold-light' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              >
                Activity History
                <span className="bg-gray-100 dark:bg-white/10 text-[10px] px-1.5 py-0.5 rounded-full">{productLogs.length}</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'edit' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Product Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none text-sm transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Collection *</label>
                  <select 
                    value={formData.collection} 
                    onChange={e => handleCollectionChange(e.target.value as 'tiles' | 'paints')}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none text-sm transition-colors"
                  >
                    <option value="tiles">Tiles & Sanitaryware</option>
                    <option value="paints">Paints</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Category *</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none text-sm transition-colors"
                  >
                    {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  value={formData.image} 
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none text-sm transition-colors"
                />
                {formData.image && (
                  <div className="mt-2 w-32 h-32 rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden relative group">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none text-sm resize-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2 col-span-1 md:col-span-1">
                  <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Price (₹)</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.price === 0 ? '' : formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value === '' ? 0 : parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none text-sm transition-colors"
                  />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-1">
                  <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Unit (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. / box"
                    value={formData.unit || ''} 
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none text-sm transition-colors"
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-2">
                  <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Initial Stock</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    value={formData.stockCount === 0 ? '' : formData.stockCount} 
                    onChange={e => setFormData({...formData, stockCount: e.target.value === '' ? 0 : parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none text-sm transition-colors"
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-4 flex flex-col justify-center pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" checked={formData.draft} onChange={e => setFormData({...formData, draft: e.target.checked})} />
                      <div className="w-11 h-6 bg-blue-100 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400 dark:peer-checked:bg-gold-light"></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Save as Draft (Hidden)</span>
                  </label>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="pt-6 border-t border-gray-100 dark:border-white/10 mt-6">
                <div 
                  className="flex items-center justify-between cursor-pointer group"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                >
                  <h3 className="text-sm font-bold text-royal-purple dark:text-gold-light uppercase tracking-widest group-hover:opacity-80 transition-opacity">
                    Advanced Settings
                  </h3>
                  <div className="text-gray-400 dark:text-gray-500">
                    {isAdvancedOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                
                {isAdvancedOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Size</label>
                      <input 
                        type="text"
                        placeholder="e.g. 600x1200 mm"
                        value={formData.advanced?.size || ''} 
                        onChange={e => setFormData({...formData, advanced: { ...formData.advanced, size: e.target.value }})}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none text-sm transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Color</label>
                      <input 
                        type="text"
                        placeholder="e.g. Ivory White"
                        value={formData.advanced?.color || ''} 
                        onChange={e => setFormData({...formData, advanced: { ...formData.advanced, color: e.target.value }})}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none text-sm transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Dimensions</label>
                      <input 
                        type="text"
                        placeholder="e.g. 1L, 4L, 20L"
                        value={formData.advanced?.dimensions || ''} 
                        onChange={e => setFormData({...formData, advanced: { ...formData.advanced, dimensions: e.target.value }})}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none text-sm transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* DANGER ZONE */}
              {product && (
                <div className="pt-6 border-t border-red-100 dark:border-red-900/30 mt-6">
                  <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-4 uppercase tracking-widest">Danger Zone</h3>
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
                    <p className="text-xs text-red-600/80 dark:text-red-400/80 mb-4 font-semibold">
                      Deleting this product is irreversible. Type <span className="font-mono bg-red-100 dark:bg-red-900/30 px-1 rounded text-red-700 dark:text-red-300">delete</span> to confirm.
                    </p>
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        placeholder="Type 'delete'"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        className="flex-1 max-w-[200px] px-3 py-1.5 border border-red-200 dark:border-red-900/30 rounded-lg focus:border-red-500 outline-none text-sm bg-white dark:bg-[#121212] text-red-700 dark:text-red-400"
                      />
                      <button 
                        disabled={deleteConfirm.toLowerCase() !== 'delete'}
                        onClick={() => {
                          if (deleteConfirm.toLowerCase() === 'delete') {
                            onDelete?.(product.id);
                          }
                        }}
                        className="px-4 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Delete Product
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {productLogs.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400 font-sans text-sm">
                  No activity history found for this product.
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-white/10 before:to-transparent">
                  {productLogs.map((log) => (
                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-[#1e1e1e] bg-gray-100 dark:bg-[#121212] text-royal-purple dark:text-gold-light shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        {log.action === 'ADD' ? <PackageOpen size={16} /> : log.action === 'EDIT' ? <Edit2 size={16} /> : <Eye size={16} />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#121212] shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-royal-purple dark:text-gold-light text-sm">{log.user}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3 bg-gray-50 dark:bg-white/5 transition-colors">
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
            Cancel
          </button>
          {activeTab === 'edit' && (
            <button 
              onClick={() => onSave(formData)}
              disabled={!formData.name}
              className="px-6 py-2 rounded-xl text-sm font-semibold bg-royal-purple dark:bg-divine-gold dark:text-royal-purple text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {product ? 'Publish Changes' : 'Publish Product'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
