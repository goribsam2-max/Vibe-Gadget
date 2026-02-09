import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';
import { OrderStatus, UserProfile } from '../types';
import { sendOrderToTelegram } from '../services/telegram';

const CheckoutPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  
  const [shipping, setShipping] = useState({
    name: '',
    address: localStorage.getItem('vibe_shipping_address') || 'Dhaka, Bangladesh',
    phone: '',
    payment: localStorage.getItem('vibe_preferred_payment') || 'Cash on Delivery'
  });

  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('f_cart') || '[]');
    if (cart.length === 0) { navigate('/'); return; }
    setItems(cart);

    const checkAuth = async () => {
      const user = auth.currentUser;
      if (user) {
        setIsGuest(false);
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setShipping(prev => ({ 
            ...prev, 
            name: data.displayName || '', 
            phone: data.phoneNumber || '',
            address: data.address || prev.address
          }));
        }
      }
    };
    checkAuth();
  }, []);

  const subTotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const deliveryFee = 150; 

  const placeOrder = async () => {
    if (!shipping.name || !shipping.address || !shipping.phone) return notify("Missing required details", "error");
    
    setLoading(true);
    try {
      const orderData = {
        userId: auth.currentUser?.uid || 'guest',
        customerName: shipping.name,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity, priceAtPurchase: i.price, name: i.name, image: i.image })),
        total: subTotal + deliveryFee,
        status: OrderStatus.PROCESSING,
        paymentMethod: shipping.payment,
        shippingAddress: shipping.address,
        contactNumber: shipping.phone,
        courier: 'Steadfast Courier',
        createdAt: Date.now()
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      await sendOrderToTelegram({ ...orderData, id: docRef.id });

      localStorage.removeItem('f_cart');
      notify("Purchase Confirmed!", "success");
      navigate(`/success?orderId=${docRef.id}`);
    } catch (err) {
      notify("Failed to connect", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-8 pb-24 animate-fade-in bg-white">
      <div className="flex items-center space-x-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl">
             <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Checkout Node</h1>
      </div>
      
      <div className="space-y-6">
        <section className="bg-f-gray p-6 rounded-[32px] border border-f-light">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Identity & Logistic Terminal</h2>
          <div className="space-y-4">
             {isGuest && (
               <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Full Name</label>
                  <input 
                      type="text" 
                      placeholder="Receiver Name" 
                      className="w-full bg-white px-4 py-3 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-black"
                      value={shipping.name}
                      onChange={(e) => setShipping({...shipping, name: e.target.value})}
                  />
               </div>
             )}
             <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Active Phone Number</label>
                <input 
                    type="tel" 
                    placeholder="01XXXXXXXXX" 
                    className="w-full bg-white px-4 py-3 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-black"
                    value={shipping.phone}
                    onChange={(e) => setShipping({...shipping, phone: e.target.value})}
                />
             </div>
             <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Shipping Address</label>
                <textarea 
                    placeholder="Detailed Address..." 
                    className="w-full bg-white px-4 py-3 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-black h-20"
                    value={shipping.address}
                    onChange={(e) => setShipping({...shipping, address: e.target.value})}
                />
             </div>
          </div>
        </section>

        <section className="bg-f-gray p-6 rounded-[32px] border border-f-light">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Payment Configuration</h2>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-bold text-xs uppercase">
                {shipping.payment.split(' ')[0]}
            </div>
            <span className="text-sm font-bold">{shipping.payment}</span>
            <button onClick={() => navigate('/payment-methods')} className="ml-auto text-[9px] font-bold underline uppercase">Switch</button>
          </div>
        </section>

        <section className="bg-f-gray p-6 rounded-[32px] border border-f-light">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Pricing Manifest</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold opacity-50 uppercase tracking-tighter">
              <span>Items Sub-Total</span>
              <span>৳{subTotal}</span>
            </div>
            <div className="flex justify-between text-xs font-bold opacity-50 uppercase tracking-tighter">
              <span>Courier Logistics</span>
              <span>৳{deliveryFee}</span>
            </div>
            <div className="h-px bg-white/40 my-3"></div>
            <div className="flex justify-between font-bold text-xl tracking-tighter">
              <span>Grand Total</span>
              <span>৳{subTotal + deliveryFee}</span>
            </div>
          </div>
        </section>
      </div>

      <button 
        disabled={loading}
        onClick={placeOrder}
        className="btn-primary w-full mt-10 shadow-2xl shadow-black/20"
      >
        {loading ? "Processing..." : "Confirm Logistics"}
      </button>
    </div>
  );
};

export default CheckoutPage;
