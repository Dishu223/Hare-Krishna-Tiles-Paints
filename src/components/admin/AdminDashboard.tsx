import React, { useState } from 'react';
import { PackageOpen, Megaphone, AlertTriangle, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useAdminData } from './AdminDataContext';
import { formatDistanceToNow } from 'date-fns';

interface AdminDashboardProps {
  onNavigate?: (tab: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { products, announcements, activityLogs, settings, setTargetProductId } = useAdminData();
  const [isLowStockExpanded, setIsLowStockExpanded] = useState(false);

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => (p.stockCount ?? 0) <= settings.lowStockThreshold);
  const activeAnnouncements = announcements.filter(a => a.isActive).length;
  
  const recentLogs = activityLogs.slice(0, 5);

  const handleProductClick = (id: string) => {
    if (onNavigate) {
      setTargetProductId(id);
      onNavigate('products');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-serif text-royal-purple dark:text-gold-light mb-2">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-300 font-sans text-sm font-medium">Welcome back. Here's a quick summary of your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => onNavigate && onNavigate('products')}
          className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252525]"
        >
          <div className="w-12 h-12 bg-royal-purple/5 dark:bg-gold-light/10 rounded-xl flex items-center justify-center text-royal-purple dark:text-gold-light">
            <PackageOpen size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Total Products</p>
            <p className="text-2xl font-serif text-gray-900 dark:text-white">{totalProducts}</p>
          </div>
        </div>

        <div 
          className={`bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col transition-all duration-300 ${isLowStockExpanded ? 'col-span-1 md:col-span-2 lg:col-span-full' : ''}`}
        >
          <div 
            onClick={() => setIsLowStockExpanded(!isLowStockExpanded)}
            className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${isLowStockExpanded ? '' : 'hover:bg-red-50/50 dark:hover:bg-red-900/10'} rounded-2xl`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-500 dark:text-red-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Low / Out of Stock</p>
                <p className="text-2xl font-serif text-gray-900 dark:text-white">{lowStockProducts.length}</p>
              </div>
            </div>
            <div className="text-gray-400 dark:text-gray-500">
              {isLowStockExpanded ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>

          {isLowStockExpanded && (
            <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-white/5 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-lg text-royal-purple dark:text-white flex items-center gap-2">
                  Products Requiring Attention
                </h2>
                <span 
                  onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate('settings'); }}
                  className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                >
                  Low Stock Limit: {settings.lowStockThreshold}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {lowStockProducts.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 py-4 col-span-full">All products are well stocked.</p>
                ) : (
                  lowStockProducts.map(prod => (
                    <div 
                      key={prod.id} 
                      onClick={() => handleProductClick(prod.id)}
                      className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl cursor-pointer hover:border-royal-purple dark:hover:border-gold-light transition-all group"
                    >
                      <div className="w-16 h-16 bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                        {prod.image ? <img src={prod.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <PackageOpen className="w-6 h-6 text-gray-400 dark:text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{prod.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{prod.category}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          prod.stockCount === 0 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {prod.stockCount === 0 ? 'Out of Stock' : `Low: ${prod.stockCount} left`}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Activity Widget */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-6 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg text-royal-purple dark:text-white flex items-center gap-2">
              <Activity className="text-royal-purple dark:text-gold-light w-5 h-5" />
              Recent Activity
            </h2>
          </div>

          <div className="space-y-4">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 py-4 text-center">No recent activity.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent dark:border-white/5">
                  <div className="mt-1">
                    <span className="w-2 h-2 rounded-full bg-royal-purple dark:bg-gold-light block"></span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {log.user} <span className="text-gray-600 dark:text-gray-400 font-normal">{log.action.toLowerCase()}</span> {log.target}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{log.details}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-2 font-semibold">
                      {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
