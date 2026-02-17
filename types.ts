
export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  HOLD = 'On Hold',
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
  images?: string[]; 
  stock: number;
  rating: number;
  numReviews?: number;
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
  registrationDate: number;
  ipAddress?: string;
  lastActive?: number;
  isp?: string;
  timeZone?: string;
  osName?: string;
  browserName?: string;
  locationName?: string;
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
  paymentOption?: string; // 'Full Payment' or 'Delivery Fee'
  transactionId?: string;
  shippingAddress: string;
  contactNumber: string;
  createdAt: number;
  customerName: string;
  trackingId?: string;
  ipAddress?: string; // Captured at checkout
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  link?: string;
  createdAt: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  image?: string;
  createdAt: number;
}
