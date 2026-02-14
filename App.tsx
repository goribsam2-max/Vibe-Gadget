
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ToastProvider } from './components/Notifications';
import { UserProfile } from './types';

// Page Imports
import AuthSelector from './pages/AuthSelector';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import NotificationsPage from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import VerifyCode from './pages/VerifyCode';
import LocationAccess from './pages/LocationAccess';
import PaymentSuccess from './pages/PaymentSuccess';
import CheckoutPage from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import CompleteProfile from './pages/CompleteProfile';
import NewPassword from './pages/NewPassword';
import Wishlist from './pages/Wishlist';
import ShippingAddress from './pages/ShippingAddress';
import Coupon from './pages/Coupon';
import PaymentMethods from './pages/PaymentMethods';
import AddCard from './pages/AddCard';
import Search from './pages/Search';
import TrackOrder from './pages/TrackOrder';
import LeaveReview from './pages/LeaveReview';
import EReceipt from './pages/EReceipt';
import Settings from './pages/Settings';
import HelpCenter from './pages/HelpCenter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PasswordManager from './pages/PasswordManager';
import AllProducts from './pages/AllProducts';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrders from './pages/admin/ManageOrders';
import ManageBanners from './pages/admin/ManageBanners';

// Components
import BottomNav from './components/BottomNav';
import OneSignalPopup from './components/OneSignalPopup';

const AppContent: React.FC = () => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserProfile);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hideNav = [
    '/onboarding', 
    '/auth-selector', 
    '/signin', 
    '/signup', 
    '/verify', 
    '/location', 
    '/complete-profile',
    '/ai-assistant'
  ].includes(location.pathname) || 
  location.pathname.startsWith('/admin') || 
  location.pathname.startsWith('/product/') ||
  location.pathname.startsWith('/e-receipt/') ||
  location.pathname.startsWith('/track-order/');

  return (
    <div className="min-h-screen bg-white">
      <OneSignalPopup />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding onFinish={() => {}} />} />
        <Route path="/auth-selector" element={<AuthSelector />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify" element={<VerifyCode />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/location" element={<LocationAccess />} />
        
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<OrderSuccess />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        
        <Route path="/profile" element={<Profile userData={userData} />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/search" element={<Search />} />
        <Route path="/all-products" element={<AllProducts />} />
        <Route path="/track-order/:id" element={<TrackOrder />} />
        <Route path="/e-receipt/:id" element={<EReceipt />} />
        <Route path="/leave-review" element={<LeaveReview />} />
        <Route path="/ai-assistant" element={<AIChat />} />
        
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/password" element={<PasswordManager />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        
        <Route path="/shipping-address" element={<ShippingAddress />} />
        <Route path="/payment-methods" element={<PaymentMethods />} />
        <Route path="/coupon" element={<Coupon />} />
        <Route path="/add-card" element={<AddCard />} />
        <Route path="/new-password" element={<NewPassword />} />

        {/* Admin Routes */}
        <Route path="/admin" element={userData?.role === 'admin' || userData?.email === 'admin@vibe.shop' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/admin/products" element={userData?.role === 'admin' || userData?.email === 'admin@vibe.shop' ? <ManageProducts /> : <Navigate to="/" />} />
        <Route path="/admin/users" element={userData?.role === 'admin' || userData?.email === 'admin@vibe.shop' ? <ManageUsers /> : <Navigate to="/" />} />
        <Route path="/admin/orders" element={userData?.role === 'admin' || userData?.email === 'admin@vibe.shop' ? <ManageOrders /> : <Navigate to="/" />} />
        <Route path="/admin/banners" element={userData?.role === 'admin' || userData?.email === 'admin@vibe.shop' ? <ManageBanners /> : <Navigate to="/" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
};

export default App;
