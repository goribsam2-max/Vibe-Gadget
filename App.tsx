
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ToastProvider } from './components/Notifications';
import { UserProfile } from './types';

// Page Imports
import AuthSelector from './pages/AuthSelector';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import CompleteProfile from './pages/CompleteProfile';
import NewPassword from './pages/NewPassword';
import LocationAccess from './pages/LocationAccess';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ShippingAddress from './pages/ShippingAddress';
import Coupon from './pages/Coupon';
import PaymentMethods from './pages/PaymentMethods';
import AddCard from './pages/AddCard';
import PaymentSuccess from './pages/PaymentSuccess';
import Search from './pages/Search';
import MyOrders from './pages/MyOrders';
import TrackOrder from './pages/TrackOrder';
import LeaveReview from './pages/LeaveReview';
import EReceipt from './pages/EReceipt';
import NotificationsPage from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import HelpCenter from './pages/HelpCenter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import BottomNav from './components/BottomNav';
import PasswordManager from './pages/PasswordManager';

// Admin Imports
import AdminDashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrders from './pages/admin/ManageOrders';
import ManageBanners from './pages/admin/ManageBanners';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
            let ip = "Unknown";
            try {
               const ipRes = await fetch('https://api.ipify.org?format=json');
               const ipData = await ipRes.json();
               ip = ipData.ip;
            } catch(e) {}

            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const data = userSnap.data() as UserProfile;
              setUserData(data);
              if (data.ipAddress !== ip) {
                 await updateDoc(userRef, { ipAddress: ip });
              }
            }
        } catch (e) {
            console.error("Error fetching user profile", e);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const hideNavPaths = [
    '/auth-selector', 
    '/signin', 
    '/signup', 
    '/complete-profile', 
    '/new-password', 
    '/location', 
    '/success', 
    '/e-receipt',
    '/admin'
  ];
  
  const isAdmin = userData?.email === 'admin@vibe.shop' || auth.currentUser?.email === 'admin@vibe.shop';

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-[10px] tracking-[0.3em] uppercase opacity-40">Vibe Gadget</p>
    </div>
  );

  const showBottomNav = !hideNavPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden flex flex-col border-x border-f-light">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth-selector" element={currentUser ? <Navigate to="/" /> : <AuthSelector />} />
          <Route path="/signin" element={currentUser ? <Navigate to="/" /> : <SignIn />} />
          <Route path="/signup" element={currentUser ? <Navigate to="/" /> : <SignUp />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route path="/location" element={<LocationAccess />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/shipping-address" element={<ShippingAddress />} />
          <Route path="/coupon" element={<Coupon />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
          <Route path="/add-card" element={<AddCard />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/search" element={<Search />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/track-order/:id" element={<TrackOrder />} />
          <Route path="/leave-review/:id" element={<LeaveReview />} />
          <Route path="/e-receipt/:id" element={<EReceipt />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<Profile userData={userData} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/password" element={<PasswordManager />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/products" element={isAdmin ? <ManageProducts /> : <Navigate to="/" />} />
          <Route path="/admin/users" element={isAdmin ? <ManageUsers /> : <Navigate to="/" />} />
          <Route path="/admin/orders" element={isAdmin ? <ManageOrders /> : <Navigate to="/" />} />
          <Route path="/admin/banners" element={isAdmin ? <ManageBanners /> : <Navigate to="/" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      {showBottomNav && <BottomNav />}
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
