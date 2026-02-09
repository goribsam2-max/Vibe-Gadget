
export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  PACKAGING = 'Packaging',
  SHIPPED = 'Shipped',
  ON_THE_WAY = 'On the Way',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  stock: number;
  rating: number;
  featured?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  address?: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  isBanned: boolean;
  createdAt: number;
  ipAddress?: string; // Captured for admin view
}

export interface CartItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  name: string;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingAddress: string;
  contactNumber: string;
  createdAt: number;
  customerName: string;
  steadfastId?: string; // ID returned by Steadfast API
  steadfastStatus?: string;
  paymentOption?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  image?: string;
  userId: string | 'all';
  read: boolean;
  createdAt: number;
}
