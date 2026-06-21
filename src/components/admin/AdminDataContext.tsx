import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Announcement, ActivityLog, AdminSettings, AdminRole, SaleRecord, ToastMessage } from '../../types';
import { db } from '../../firebase';
import { ref, onValue, set, get } from 'firebase/database';
import { products as initialProductsData } from '../../data';

interface AdminDataContextType {
  products: Product[];
  announcements: Announcement[];
  activityLogs: ActivityLog[];
  sales: SaleRecord[];
  settings: AdminSettings;
  isFirebaseActive: boolean;
  user: AdminRole | null;
  toasts: ToastMessage[];
  setUser: (user: AdminRole | null) => void;
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, newCount: number) => void;
  toggleProductDraft: (id: string, draft: boolean) => void;
  addAnnouncement: (title: string, content: string) => void;
  toggleAnnouncement: (id: string, isActive: boolean) => void;
  deleteAnnouncement: (id: string) => void;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  logActivity: (action: string, target: string, details: string, targetId?: string, detailedData?: string) => void;
  addSale: (sale: Omit<SaleRecord, 'id' | 'loggedBy'>) => void;
  deleteSale: (id: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  targetProductId: string | null;
  setTargetProductId: (id: string | null) => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

const PAINTS_INITIAL: Product[] = [
  { id: 'paint-1', name: 'Royal Luxury Emulsion', collection: 'paints', category: 'Interior Paints', image: '', description: 'Premium interior emulsion.', price: 1500 },
  { id: 'paint-2', name: 'WeatherGuard Exterior', collection: 'paints', category: 'Exterior Paints', image: '', description: 'Durable exterior paint.', price: 2000 },
  { id: 'paint-3', name: 'Satin Smooth Enamel', collection: 'paints', category: 'Enamels', image: '', description: 'Glossy finish enamel.', price: 500 },
  { id: 'paint-4', name: 'Acrylic Wall Putty', collection: 'paints', category: 'Primers & Putty', image: '', description: 'Smooth wall base.', price: 300 },
];

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const isFirebaseActive = !!db;
  const [user, setUser] = useState<AdminRole | null>(null);
  const [targetProductId, setTargetProductId] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [settings, setSettings] = useState<AdminSettings>({
    showStockCount: false,
    lowStockThreshold: 10,
    categories: {
      tiles: ['Tiles', 'Sanitaryware', 'Bath Fittings', 'Marble & Granite', 'Mosaic & Accents'],
      paints: ['Interior Paints', 'Exterior Paints', 'Enamels', 'Primers & Putty']
    }
  });

  useEffect(() => {
    const DEFAULT_SETTINGS = {
      showStockCount: false,
      lowStockThreshold: 10,
      categories: {
        tiles: ['Tiles', 'Sanitaryware', 'Bath Fittings', 'Marble & Granite', 'Mosaic & Accents'],
        paints: ['Interior Paints', 'Exterior Paints', 'Enamels', 'Primers & Putty']
      }
    };

    if (isFirebaseActive && db) {
      const productsRef = ref(db, 'products');
      const annRef = ref(db, 'announcements');
      const logsRef = ref(db, 'activityLogs');
      const salesRef = ref(db, 'sales');
      const settingsRef = ref(db, 'settings');

      // Initialize default products if empty
      get(productsRef).then((snapshot) => {
        if (!snapshot.exists()) {
          const combined = [...initialProductsData, ...PAINTS_INITIAL];
          const initialObj: Record<string, Product> = {};
          combined.forEach(p => {
            initialObj[p.id] = { ...p, stockCount: 100, draft: false };
          });
          set(productsRef, initialObj);
        }
      });

      const unsubProducts = onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const parsed = Object.values(data) as Product[];
          // Bulletproof relative image paths for dev and GitHub Pages
          const sanitized = parsed.map(p => {
            let imgPath = p.image;
            if (imgPath) {
              // Extract filename at the end of the path (e.g. "jubin-white.png" from whatever path format)
              const match = imgPath.match(/\/([^/]+)$/);
              const filename = match ? match[1] : imgPath;
              imgPath = `products/${filename}`;
            }
            return {
              ...p,
              image: imgPath
            };
          });
          setProducts(sanitized);
        }
      });

      const unsubAnn = onValue(annRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Sort by newest first
          const arr = Object.values(data) as Announcement[];
          setAnnouncements(arr.sort((a, b) => b.createdAt - a.createdAt));
        } else {
          setAnnouncements([]);
        }
      });

      const unsubLogs = onValue(logsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const arr = Object.values(data) as ActivityLog[];
          setActivityLogs(arr.sort((a, b) => b.timestamp - a.timestamp));
        } else {
          setActivityLogs([]);
        }
      });

      const unsubSales = onValue(salesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const arr = Object.values(data) as SaleRecord[];
          setSales(arr.sort((a, b) => b.date - a.date));
        } else {
          setSales([]);
        }
      });

      const unsubSettings = onValue(settingsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
            categories: {
              ...DEFAULT_SETTINGS.categories,
              ...(data.categories || {})
            }
          });
        }
      });

      return () => {
        unsubProducts();
        unsubAnn();
        unsubLogs();
        unsubSales();
        unsubSettings();
      };
    } else {
      // Local Storage Fallback
      const loadLocal = () => {
        let localProducts = JSON.parse(localStorage.getItem('hk_products') || 'null');
        if (!localProducts) {
          const combined = [...initialProductsData, ...PAINTS_INITIAL];
          localProducts = combined.map(p => ({ ...p, stockCount: 100, draft: false }));
          localStorage.setItem('hk_products', JSON.stringify(localProducts));
        }
        
        // Migrate old products without collection and sanitize images
        localProducts = localProducts.map((p: any) => {
          let imgPath = p.image;
          if (imgPath) {
            const match = imgPath.match(/\/([^/]+)$/);
            const filename = match ? match[1] : imgPath;
            imgPath = `products/${filename}`;
          }
          return {
            ...p,
            image: imgPath,
            collection: p.collection || (['Tiles', 'Sanitaryware', 'Bath Fittings', 'Marble & Granite', 'Mosaic & Accents'].includes(p.category) ? 'tiles' : 'paints')
          };
        });
        
        setProducts(localProducts);
        setAnnouncements(JSON.parse(localStorage.getItem('hk_announcements') || '[]'));
        setActivityLogs(JSON.parse(localStorage.getItem('hk_activityLogs') || '[]'));
        setSales(JSON.parse(localStorage.getItem('hk_sales') || '[]'));
        
        const localSettings = JSON.parse(localStorage.getItem('hk_settings') || 'null');
        if (localSettings) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...localSettings,
            categories: {
              ...DEFAULT_SETTINGS.categories,
              ...(localSettings.categories || {})
            }
          });
        }
      };
      loadLocal();
    }
  }, [isFirebaseActive]);

  const logActivity = (action: string, target: string, details: string, targetId?: string, detailedData?: string) => {
    if (!user) return;
    const log: ActivityLog = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      user,
      action,
      target,
      targetId,
      details,
      detailedData,
      timestamp: Date.now(),
    };

    if (isFirebaseActive && db) {
      const logsRef = ref(db, 'activityLogs/' + log.id);
      set(logsRef, log);
    } else {
      const current = JSON.parse(localStorage.getItem('hk_activityLogs') || '[]');
      const updated = [log, ...current];
      localStorage.setItem('hk_activityLogs', JSON.stringify(updated));
      setActivityLogs(updated);
    }
  };

  const saveProducts = (updated: Product[]) => {
    if (isFirebaseActive && db) {
      const obj: Record<string, Product> = {};
      updated.forEach(p => obj[p.id] = p);
      set(ref(db, 'products'), obj);
    } else {
      localStorage.setItem('hk_products', JSON.stringify(updated));
      setProducts(updated);
    }
  };

  const updateProduct = (product: Product) => {
    const oldProduct = products.find(p => p.id === product.id);
    const updated = products.map(p => p.id === product.id ? product : p);
    saveProducts(updated);
    
    let details = 'Updated product details';
    if (oldProduct) {
       const changes = [];
       if (oldProduct.price !== product.price) changes.push(`Price from ₹${oldProduct.price||0} to ₹${product.price||0}`);
       if (oldProduct.stockCount !== product.stockCount) changes.push(`Stock from ${oldProduct.stockCount||0} to ${product.stockCount||0}`);
       if (oldProduct.draft !== product.draft) changes.push(`Status to ${product.draft ? 'Draft' : 'Published'}`);
       if (oldProduct.name !== product.name) changes.push(`Name to "${product.name}"`);
       if (oldProduct.category !== product.category) changes.push(`Category to ${product.category}`);
       if (changes.length > 0) details = changes.join(', ');
    }
    
    logActivity('EDIT', product.name, details, product.id, JSON.stringify(product));
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now() + Math.random().toString(36).substring(7),
      stockCount: productData.stockCount ?? 0,
      draft: productData.draft ?? false
    };
    const updated = [...products, newProduct];
    saveProducts(updated);
    logActivity('ADD', newProduct.name, 'Added new product to catalog', newProduct.id, JSON.stringify(newProduct));
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
    logActivity('DELETE', prod.name, 'Removed product from catalog', prod.id);
  };

  const updateStock = (id: string, newCount: number) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    const count = Math.max(0, newCount);
    const updated = products.map(p => p.id === id ? { ...p, stockCount: count } : p);
    saveProducts(updated);
    logActivity('EDIT', prod.name, `Stock changed from ${prod.stockCount || 0} to ${count}`, prod.id);
  };

  const toggleProductDraft = (id: string, draft: boolean) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    const updated = products.map(p => p.id === id ? { ...p, draft } : p);
    saveProducts(updated);
    logActivity('EDIT', prod.name, `Product marked as ${draft ? 'Draft' : 'Published'}`, prod.id);
  };

  const saveAnnouncements = (updated: Announcement[]) => {
    if (isFirebaseActive && db) {
      const obj: Record<string, Announcement> = {};
      updated.forEach(a => obj[a.id] = a);
      set(ref(db, 'announcements'), obj);
    } else {
      localStorage.setItem('hk_announcements', JSON.stringify(updated));
      setAnnouncements(updated.sort((a, b) => b.createdAt - a.createdAt));
    }
  };

  const addAnnouncement = (title: string, content: string) => {
    const newAnn: Announcement = {
      id: 'ann-' + Date.now(),
      title,
      content,
      isActive: true,
      createdAt: Date.now(),
    };
    const updated = [...announcements, newAnn];
    saveAnnouncements(updated);
    logActivity('ANNOUNCEMENT', title, 'Created new announcement');
  };

  const toggleAnnouncement = (id: string, isActive: boolean) => {
    const ann = announcements.find(a => a.id === id);
    if (!ann) return;
    const updated = announcements.map(a => a.id === id ? { ...a, isActive } : a);
    saveAnnouncements(updated);
    logActivity('ANNOUNCEMENT', ann.title, `Set active status to ${isActive}`);
  };

  const deleteAnnouncement = (id: string) => {
    const ann = announcements.find(a => a.id === id);
    if (!ann) return;
    const updated = announcements.filter(a => a.id !== id);
    saveAnnouncements(updated);
    logActivity('DELETE', ann.title, 'Deleted announcement');
  };

  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    const updated = { ...settings, ...newSettings };
    if (isFirebaseActive && db) {
      set(ref(db, 'settings'), updated);
    } else {
      localStorage.setItem('hk_settings', JSON.stringify(updated));
      setSettings(updated);
    }
    logActivity('SETTINGS', 'Admin Settings', 'Updated global settings');
  };

  const saveSales = (updated: SaleRecord[]) => {
    if (isFirebaseActive && db) {
      const obj: Record<string, SaleRecord> = {};
      updated.forEach(s => obj[s.id] = s);
      set(ref(db, 'sales'), obj);
    } else {
      localStorage.setItem('hk_sales', JSON.stringify(updated));
      setSales(updated.sort((a, b) => b.date - a.date));
    }
  };

  const addSale = (saleData: Omit<SaleRecord, 'id' | 'loggedBy'>) => {
    if (!user) return;
    const newSale: SaleRecord = {
      ...saleData,
      id: 'sale-' + Date.now() + Math.random().toString(36).substring(7),
      loggedBy: user
    };
    const updated = [...sales, newSale];
    saveSales(updated);
    logActivity('SALE', `Sale of ₹${newSale.amount}`, newSale.description);
  };

  const deleteSale = (id: string) => {
    const sale = sales.find(s => s.id === id);
    if (!sale) return;
    const updated = sales.filter(s => s.id !== id);
    saveSales(updated);
    logActivity('DELETE', 'Removed Sale', `Deleted sale of ₹${sale.amount}`);
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AdminDataContext.Provider value={{
      products, announcements, activityLogs, sales, settings, isFirebaseActive, user, toasts, setUser,
      updateProduct, addProduct, deleteProduct, updateStock, toggleProductDraft,
      addAnnouncement, toggleAnnouncement, deleteAnnouncement, updateSettings, logActivity,
      addSale, deleteSale,
      addToast,
      removeToast,
      targetProductId,
      setTargetProductId
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used within an AdminDataProvider');
  return context;
};
