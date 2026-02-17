
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ToastProvider } from './components/Notifications';
import { UserProfile } from './types';
import { motion, AnimatePresence } from 'framer-motion';

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
import ManageConfig from './pages/admin/ManageConfig';

// Components
import BottomNav from './components/BottomNav';
import OneSignalPopup from './components/OneSignalPopup';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -15 }} 
    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} 
    className="w-full min-h-screen"
  >
    {children}
  </motion.div>
);

const AppContent: React.FC = () => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const unsubProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserProfile);
          }
          setLoading(false);
        });
        return () => unsubProfile();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} 
        transition={{ repeat: Infinity, duration: 2 }} 
        className="text-2xl font-black tracking-tighter"
      >
        VibeGadget
      </motion.div>
    </div>
  );

  const showNav = ['/', '/profile', '/cart', '/wishlist', '/all-products'].includes(location.pathname);
  const isAdmin = userData?.role === 'admin' || userData?.email === 'admin@vibe.shop';

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white">
      <OneSignalPopup />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/onboarding" element={<PageWrapper><Onboarding onFinish={() => {}} /></PageWrapper>} />
          <Route path="/auth-selector" element={<PageWrapper><AuthSelector /></PageWrapper>} />
          <Route path="/signin" element={<PageWrapper><SignIn /></PageWrapper>} />
          <Route path="/signup" element={<PageWrapper><SignUp /></PageWrapper>} />
          <Route path="/verify" element={<PageWrapper><VerifyCode /></PageWrapper>} />
          <Route path="/complete-profile" element={<PageWrapper><CompleteProfile /></PageWrapper>} />
          <Route path="/location" element={<PageWrapper><LocationAccess /></PageWrapper>} />
          <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
          <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
          <Route path="/checkout" element={<PageWrapper><CheckoutPage /></PageWrapper>} />
          <Route path="/success" element={<PageWrapper><OrderSuccess /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile userData={userData} /></PageWrapper>} />
          <Route path="/orders" element={<PageWrapper><MyOrders /></PageWrapper>} />
          <Route path="/notifications" element={<PageWrapper><NotificationsPage /></PageWrapper>} />
          <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
          <Route path="/search" element={<PageWrapper><Search /></PageWrapper>} />
          <Route path="/all-products" element={<PageWrapper><AllProducts /></PageWrapper>} />
          <Route path="/track-order/:id" element={<PageWrapper><TrackOrder /></PageWrapper>} />
          <Route path="/e-receipt/:id" element={<PageWrapper><EReceipt /></PageWrapper>} />
          <Route path="/leave-review" element={<PageWrapper><LeaveReview /></PageWrapper>} />
          <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
          <Route path="/settings/password" element={<PageWrapper><PasswordManager /></PageWrapper>} />
          <Route path="/help-center" element={<PageWrapper><HelpCenter /></PageWrapper>} />
          <Route path="/privacy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
          <Route path="/shipping-address" element={<PageWrapper><ShippingAddress /></PageWrapper>} />
          <Route path="/payment-methods" element={<PageWrapper><PaymentMethods /></PageWrapper>} />
          <Route path="/coupon" element={<PageWrapper><Coupon /></PageWrapper>} />
          <Route path="/add-card" element={<PageWrapper><AddCard /></PageWrapper>} />
          <Route path="/new-password" element={<PageWrapper><NewPassword /></PageWrapper>} />
          
          <Route path="/admin/*" element={isAdmin ? (
             <Routes>
                <Route index element={<PageWrapper><AdminDashboard /></PageWrapper>} />
                <Route path="products" element={<PageWrapper><ManageProducts /></PageWrapper>} />
                <Route path="users" element={<PageWrapper><ManageUsers /></PageWrapper>} />
                <Route path="orders" element={<PageWrapper><ManageOrders /></PageWrapper>} />
                <Route path="banners" element={<PageWrapper><ManageBanners /></PageWrapper>} />
                <Route path="config" element={<PageWrapper><ManageConfig /></PageWrapper>} />
             </Routes>
          ) : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      {showNav && <BottomNav />}
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
