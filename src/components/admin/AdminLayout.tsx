import React from 'react';
import { PackageOpen, LayoutDashboard, Megaphone, Activity, Settings, LogOut, Menu, X, BarChart3 } from 'lucide-react';
import { AdminRole } from '../../types';
import { ThemeToggleButton3 } from '../ThemeToggleButton3';
import { useAdminData } from './AdminDataContext';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: AdminRole;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isFirebaseActive: boolean;
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products & Stock', icon: PackageOpen },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'activity', label: 'Activity Log', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminLayout({ children, user, currentTab, onTabChange, onLogout, isFirebaseActive }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { toasts, removeToast } = useAdminData();

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#121212] flex flex-col md:flex-row font-sans transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-white/10 p-4 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-royal-purple rounded-lg flex items-center justify-center">
            <PackageOpen className="w-5 h-5 text-divine-gold" />
          </div>
          <span className="font-serif font-bold text-royal-purple dark:text-gold-light">Admin Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggleButton3 />
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 dark:text-gray-400 p-1">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-white/10 transform transition-all duration-300 ease-in-out flex flex-col pt-16 md:pt-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-royal-purple rounded-xl flex items-center justify-center shadow-md">
              <PackageOpen className="w-6 h-6 text-divine-gold" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-royal-purple dark:text-gold-light text-lg leading-tight">Admin Portal</h2>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">Hare Krishna</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 border-b border-gray-100 dark:border-white/5 flex flex-col gap-1">
          <div className="flex justify-between items-center mb-2 ml-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Hi {user.split(' ')[0]}!</p>
            <div className="hidden md:block">
              <ThemeToggleButton3 className="scale-75 origin-right" />
            </div>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-divine-gold/20 flex items-center justify-center text-royal-purple dark:text-gold-light font-bold text-sm">
              {user.charAt(0)}
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActive 
                    ? 'bg-royal-purple text-white shadow-md shadow-royal-purple/20 dark:bg-divine-gold dark:text-royal-purple dark:shadow-divine-gold/20' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-royal-purple dark:hover:text-gold-light'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-divine-gold dark:text-royal-purple' : ''} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-white/5">
          <div className={`mb-4 px-4 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 ${
            isFirebaseActive 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50' 
              : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isFirebaseActive ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
            {isFirebaseActive ? 'Live Sync Active' : 'Local Storage Mode'}
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto relative text-gray-900 dark:text-gray-100 transition-colors duration-300 relative">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {toasts?.map((toast: any) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className={`pointer-events-auto flex items-center justify-between gap-4 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md ${
                  toast.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800 dark:bg-green-900/80 dark:border-green-800 dark:text-green-100' :
                  toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800 dark:bg-red-900/80 dark:border-red-800 dark:text-red-100' :
                  'bg-white/90 border-gray-200 text-gray-800 dark:bg-[#1e1e1e]/90 dark:border-white/10 dark:text-white'
                }`}
              >
                <span className="font-sans text-sm font-medium">{toast.message}</span>
                <button onClick={() => removeToast?.(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
