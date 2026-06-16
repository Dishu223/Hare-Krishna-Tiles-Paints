export type ProductCategory = string;

export interface Product {
  id: string;
  name: string;
  collection: 'tiles' | 'paints';
  category: ProductCategory;
  image: string;
  description: string;
  price: number;
  unit?: string;
  stockCount?: number;
  draft?: boolean;
  advanced?: {
    size?: string;
    color?: string;
    dimensions?: string;
    [key: string]: string | undefined;
  };
}

export interface EnquiryForm {
  name: string;
  phone: string;
  email: string;
  productInterest: string;
  message: string;
}

export type AdminRole = 'Mukesh Panwar' | 'Mayank Panwar' | 'Others';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: number;
}

export interface ActivityLog {
  id: string;
  user: AdminRole;
  action: string;
  target: string;
  targetId?: string;
  details: string;
  detailedData?: string;
  timestamp: number;
}

export interface SaleRecord {
  id: string;
  amount: number;
  date: number;
  description: string;
  items?: { name: string; quantity: number; price: number }[];
  loggedBy: AdminRole;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AdminSettings {
  showStockCount: boolean;
  lowStockThreshold: number;
  categories: {
    tiles: string[];
    paints: string[];
  };
}
