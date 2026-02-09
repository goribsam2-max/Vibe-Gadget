
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';
import { OrderStatus, UserProfile } from '../types';
import { sendOrderToTelegram } from '../services/telegram';

const CheckoutPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [payFull, setPayFull] = useState(false);
  
  const [shipping, setShipping] = useState({
    address: localStorage.getItem('vibe_shipping_address') || 'Dhaka, Bangladesh',
    phone: '',
    payment: localStorage.getItem('vibe_preferred_payment') || 'Cash on Delivery'
  });

  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('f_cart') || '[]');
    if (cart.length === 0) {
        notify("Your cart is empty", "info");
        navigate('/');
        return;
    }
    setItems(cart);

    const fetchUser = async () => {
      if (!auth.currentUser) return;
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setUserData(data);
        if(data.address) setShipping(s => ({ ...s, address: data.address || s.address }));
        if(data.phoneNumber) setShipping(s => ({ ...s, phone: data.phoneNumber || s.phone }));
      }
    };
    fetchUser();
    
    if (navigator.geolocation && !localStorage.getItem('vibe_shipping_address')) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const addr = `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} (Auto-detected Address)`;
        setShipping(s => ({ ...s, address: addr }));
        localStorage.setItem('vibe_shipping_address', addr);
      });
    }
  }, []);

  const subTotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const deliveryFee = 150; 
  const currentPayable = (shipping.payment === 'Cash on Delivery' || !payFull) ? deliveryFee : (subTotal + deliveryFee);

  const placeOrder = async () => {
    if (!shipping.address || !shipping.phone) return notify("Please fill all details", "error");
    
    setLoading(true);
    try {
      const orderData = {
        userId: auth.currentUser?.uid || 'guest',
        customerName: userData?.displayName || 'Guest User',
        items: items.map(i => ({
            productId: i.id,
            quantity: i.quantity,
            priceAtPurchase: i.price,
            name: i.name,
            image: i.image
        })),
        total: subTotal + deliveryFee,
        paidAmount: currentPayable,
        status: OrderStatus.PROCESSING,
        paymentMethod: shipping.payment,
        paymentOption: payFull ? 'Full Payment' : 'Delivery Only',
        shippingAddress: shipping.address,
        contactNumber: shipping.phone,
        courier: 'Steadfast Courier',
        createdAt: Date.now()
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Send Telegram Notification with A-Z details
      await sendOrderToTelegram({ ...orderData, id: docRef.id });

      localStorage.removeItem('f_cart');
      notify("Order confirmed!", "success");
      navigate(`/success?orderId=${docRef.id}`);
    } catch (err) {
      notify("Order failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-8 pb-24 animate-fade-in bg-white">
      <div className="flex items-center space-x-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Checkout Summary</h1>
      </div>
      
      <div className="space-y-6">
        <section className="bg-f-gray p-6 rounded-[32px] border border-f-light shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Details</h2>
            <button onClick={() => navigate('/shipping-address')} className="text-[10px] font-bold text-black underline uppercase">Edit</button>
          </div>
          <div className="space-y-4">
             <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                </div>
                <p className="text-xs font-bold leading-relaxed">{shipping.address}</p>
             </div>
             <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                </div>
                <input 
                    type="tel" 
                    placeholder="Contact Phone Number" 
                    className="flex-1 bg-white px-3 py-1.5 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-black"
                    value={shipping.phone}
                    onChange={(e) => setShipping({...shipping, phone: e.target.value})}
                />
             </div>
             <div className="flex items-center space-x-2 text-[10px] text-f-gray font-bold uppercase pt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.508 1.129-1.125V11.25c0-.447-.406-.807-.846-.727l-1.547.283a.994.994 0 00-.81.822l-.242 1.564M15 12V4.875A1.125 1.125 0 0013.875 3.75h-3.75A1.125 1.125 0 009 4.875V12m6 0h1.125a1.125 1.125 0 011.125 1.125V18" /></svg>
                <span>Via Steadfast Courier</span>
             </div>
          </div>
        </section>

        <section className="bg-f-gray p-6 rounded-[32px] border border-f-light shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</h2>
            <button onClick={() => navigate('/payment-methods')} className="text-[10px] font-bold text-black underline uppercase">Switch</button>
          </div>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2">
                {shipping.payment === 'bKash' ? <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" className="w-full h-full object-contain" /> : 
                 shipping.payment === 'Nagad' ? <img src="https://www.logo.wine/a/logo/Nagad/Nagad-Logo.wine.svg" className="w-full h-full object-contain" /> : 
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            </div>
            <span className="text-sm font-bold">{shipping.payment}</span>
          </div>

          {(shipping.payment === 'bKash' || shipping.payment === 'Nagad') && (
            <div className="space-y-4">
               <div className="p-4 bg-white/50 rounded-2xl border border-black/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Instruction:</p>
                  <p className="text-xs font-bold text-black">Send Money to: <span className="text-blue-600">01747708843</span></p>
                  <p className="text-[9px] text-f-gray mt-1 font-bold">Please use order ID as reference.</p>
               </div>
               <div className="flex space-x-2">
                  <button 
                    onClick={() => setPayFull(false)}
                    className={`flex-1 p-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest border transition-all ${!payFull ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100'}`}
                  >
                    Pay Fee (৳150)
                  </button>
                  <button 
                    onClick={() => setPayFull(true)}
                    className={`flex-1 p-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest border transition-all ${payFull ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100'}`}
                  >
                    Full Payment
                  </button>
               </div>
            </div>
          )}
        </section>

        <section className="bg-f-gray p-6 rounded-[32px] border border-f-light shadow-sm">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Price Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold">
              <span className="opacity-40 uppercase tracking-tighter">Items Total</span>
              <span>৳{subTotal}</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="opacity-40 uppercase tracking-tighter">Steadfast Courier</span>
              <span>৳{deliveryFee}</span>
            </div>
            <div className="h-px bg-white/40 my-4"></div>
            <div className="flex justify-between font-bold text-lg">
              <span className="text-xs opacity-60 uppercase tracking-wider">Payable Now</span>
              <span>৳{currentPayable}</span>
            </div>
            {currentPayable < (subTotal + deliveryFee) && (
              <p className="text-[9px] text-f-gray text-center font-bold tracking-tight bg-white/30 py-2 rounded-lg">Pay ৳{subTotal} on delivery (COD)</p>
            )}
          </div>
        </section>
      </div>

      <button 
        disabled={loading}
        onClick={placeOrder}
        className="btn-primary w-full mt-10 shadow-2xl shadow-black/20"
      >
        {loading ? "Confirming..." : "Confirm Purchase"}
      </button>
    </div>
  );
};

export default CheckoutPage;
