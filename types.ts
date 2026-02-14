
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
  image: string; // Keep for legacy/main image
  images?: string[]; // Multiple images support
  stock: number;
  rating: number;
  numReviews?: number;
  featured?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: number;
  images?: string[]; // Review images
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
  ipAddress?: string;
  pushEnabled?: boolean;
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
  paymentOption?: 'Full Payment' | 'Delivery Fee Only';
  transactionId?: string;
  shippingAddress: string;
  contactNumber: string;
  createdAt: number;
  customerName: string;
  steadfastId?: string;
  steadfastStatus?: string;
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
