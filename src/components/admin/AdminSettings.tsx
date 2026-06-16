import React, { useState } from 'react';
import { Settings, Save, AlertTriangle, ShieldAlert, Tags, Plus, X } from 'lucide-react';
import { useAdminData } from './AdminDataContext';

export function AdminSettings() {
  const { settings, updateSettings, isFirebaseActive, addToast } = useAdminData();
  const [localSettings, setLocalSettings] = useState(settings);
  const [newTileCategory, setNewTileCategory] = useState('');
  const [newPaintCategory, setNewPaintCategory] = useState('');

  const handleSave = () => {
    updateSettings(localSettings);
    addToast('Global settings updated successfully!', 'success');
  };

  const addCategory = (collection: 'tiles' | 'paints', value: string) => {
    if (!value.trim()) return;
    setLocalSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [collection]: [...prev.categories[collection], value.trim()]
      }
    }));
    if (collection === 'tiles') setNewTileCategory('');
    if (collection === 'paints') setNewPaintCategory('');
  };

  const removeCategory = (collection: 'tiles' | 'paints', idx: number) => {
    setLocalSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [collection]: prev.categories[collection].filter((_, i) => i !== idx)
      }
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl pb-10">
      <div>
        <h1 className="text-3xl font-serif text-royal-purple dark:text-gold-light mb-2">Platform Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 font-sans text-sm">Configure global settings and view platform status.</p>
      </div>

      {/* Global Configurations */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center gap-3">
          <Settings className="text-royal-purple dark:text-gold-light w-5 h-5" />
          <h2 className="font-serif text-xl text-royal-purple dark:text-white">Customer Visibility</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans font-semibold text-gray-900 dark:text-white text-sm">Show Stock Count</h3>
              <p className="font-sans text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">If enabled, customers will see exactly how many items are left in stock.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={localSettings.showStockCount} 
                onChange={e => setLocalSettings({...localSettings, showStockCount: e.target.checked})} 
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xs">
              <h3 className="font-sans font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                Low Stock Threshold <AlertTriangle className="w-4 h-4 text-yellow-500" />
              </h3>
              <p className="font-sans text-xs text-gray-500 dark:text-gray-400 mt-1">Products with stock at or below this number will be highlighted in your dashboard and get a warning badge for customers.</p>
            </div>
            <input 
              type="number" 
              min="0"
              value={localSettings.lowStockThreshold}
              onChange={e => setLocalSettings({...localSettings, lowStockThreshold: parseInt(e.target.value) || 0})}
              className="w-24 text-center font-sans text-sm border border-gray-200 dark:border-white/10 rounded-lg py-2 focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Category Management */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center gap-3">
          <Tags className="text-royal-purple dark:text-gold-light w-5 h-5" />
          <h2 className="font-serif text-xl text-royal-purple dark:text-white">Product Categories</h2>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-8">
          
          {/* Tiles Categories */}
          <div>
            <h3 className="font-sans font-semibold text-gray-900 dark:text-white text-sm mb-4">Tiles & Sanitaryware</h3>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="New Category..." 
                value={newTileCategory}
                onChange={e => setNewTileCategory(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory('tiles', newTileCategory)}
                className="flex-1 font-sans text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none"
              />
              <button 
                onClick={() => addCategory('tiles', newTileCategory)}
                className="bg-royal-purple text-white px-3 py-2 rounded-lg hover:bg-royal-purple/90 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localSettings.categories.tiles.map((cat, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white">
                  {cat}
                  <button onClick={() => removeCategory('tiles', idx)} className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Paints Categories */}
          <div>
            <h3 className="font-sans font-semibold text-gray-900 dark:text-white text-sm mb-4">Paints Collection</h3>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="New Category..." 
                value={newPaintCategory}
                onChange={e => setNewPaintCategory(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory('paints', newPaintCategory)}
                className="flex-1 font-sans text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 focus:border-royal-purple dark:bg-[#121212] dark:text-white outline-none"
              />
              <button 
                onClick={() => addCategory('paints', newPaintCategory)}
                className="bg-pink-600 text-white px-3 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localSettings.categories.paints.map((cat, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300">
                  {cat}
                  <button onClick={() => removeCategory('paints', idx)} className="text-pink-400 hover:text-pink-600 transition-colors cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>
        <div className="p-4 bg-gray-50 dark:bg-white/5 flex justify-end">
          <button 
            onClick={handleSave}
            className="bg-royal-purple dark:bg-divine-gold dark:text-royal-purple text-white px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

    </div>
  );
}
