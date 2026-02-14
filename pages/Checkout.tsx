
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
  
  const [shipping, setShipping] = useState({
    name: '',
    address: localStorage.getItem('vibe_shipping_address') || 'Dhaka, Bangladesh',
    phone: '',
    payment: 'Cash on Delivery',
    paymentOption: 'Full Payment' as 'Full Payment' | 'Delivery Fee Only',
    trxId: ''
  });

  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('f_cart') || '[]');
    if (cart.length === 0) { navigate('/'); return; }
    setItems(cart);

    const user = auth.currentUser;
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setShipping(prev => ({ 
            ...prev, 
            name: data.displayName || '', 
            phone: data.phoneNumber || '',
            address: data.address || prev.address
          }));
        }
      });
    }
  }, []);

  const subTotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const deliveryFee = 150; 
  const grandTotal = subTotal + deliveryFee;

  const placeOrder = async () => {
    if (!shipping.name || !shipping.address || !shipping.phone) return notify("Please fill shipping details", "error");
    if (shipping.payment !== 'Cash on Delivery' && !shipping.trxId) return notify("Transaction ID is required", "error");
    
    setLoading(true);
    try {
      const orderData = {
        userId: auth.currentUser?.uid || 'guest',
        customerName: shipping.name,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity, priceAtPurchase: i.price, name: i.name, image: i.image })),
        total: grandTotal,
        status: OrderStatus.PROCESSING,
        paymentMethod: shipping.payment,
        paymentOption: shipping.payment === 'Cash on Delivery' ? null : shipping.paymentOption,
        transactionId: shipping.trxId,
        shippingAddress: shipping.address,
        contactNumber: shipping.phone,
        createdAt: Date.now()
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      await sendOrderToTelegram({ ...orderData, id: docRef.id });

      localStorage.removeItem('f_cart');
      notify("Order Placed Successfully!", "success");
      navigate(`/success?orderId=${docRef.id}`);
    } catch (err) {
      notify("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-8 pb-24 animate-fade-in bg-white min-h-screen">
      <div className="flex items-center space-x-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl active:scale-90 transition-transform shadow-sm">
             <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Checkout</h1>
      </div>
      
      <div className="space-y-8">
        <section className="bg-f-gray p-8 rounded-[40px] border border-f-light">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Shipping Info</h2>
          <div className="space-y-6">
             <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase mb-2 block">Full Name</label>
                <input 
                    type="text" 
                    className="w-full bg-white px-5 py-4 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-black shadow-sm"
                    value={shipping.name}
                    onChange={(e) => setShipping({...shipping, name: e.target.value})}
                />
             </div>
             <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase mb-2 block">Phone Number</label>
                <input 
                    type="tel" 
                    className="w-full bg-white px-5 py-4 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-black shadow-sm"
                    value={shipping.phone}
                    onChange={(e) => setShipping({...shipping, phone: e.target.value})}
                />
             </div>
             <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase mb-2 block">Delivery Address</label>
                <textarea 
                    className="w-full bg-white px-5 py-4 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-black h-24 shadow-sm"
                    value={shipping.address}
                    onChange={(e) => setShipping({...shipping, address: e.target.value})}
                />
             </div>
          </div>
        </section>

        <section className="bg-f-gray p-8 rounded-[40px] border border-f-light">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Payment Details</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-8">
            {['Cash on Delivery', 'bKash'].map(m => (
              <button 
                key={m}
                onClick={() => setShipping({...shipping, payment: m})}
                className={`py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${shipping.payment === m ? 'bg-black text-white shadow-xl shadow-black/20 scale-105' : 'bg-white text-gray-400 border border-transparent'}`}
              >
                {m}
              </button>
            ))}
          </div>

          {shipping.payment === 'bKash' && (
            <div className="space-y-6 animate-fade-in bg-white p-6 rounded-[32px] shadow-inner mb-6">
               <div className="flex justify-between items-center bg-black/5 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase opacity-40">Payment No.</span>
                  <span className="font-bold text-sm tracking-widest">01747708843</span>
               </div>
               
               <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase text-center mb-2">Select Payment Type</p>
                  <div className="flex bg-f-gray p-1 rounded-2xl">
                     <button 
                        onClick={() => setShipping({...shipping, paymentOption: 'Full Payment'})}
                        className={`flex-1 py-3 text-[9px] font-bold uppercase rounded-xl transition-all ${shipping.paymentOption === 'Full Payment' ? 'bg-white shadow-sm' : 'opacity-40'}`}
                     >Full ৳{grandTotal}</button>
                     <button 
                        onClick={() => setShipping({...shipping, paymentOption: 'Delivery Fee Only'})}
                        className={`flex-1 py-3 text-[9px] font-bold uppercase rounded-xl transition-all ${shipping.paymentOption === 'Delivery Fee Only' ? 'bg-white shadow-sm' : 'opacity-40'}`}
                     >Fee ৳150</button>
                  </div>
               </div>

               <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase mb-2 block">Enter Transaction ID (TrxID)</label>
                  <input 
                      type="text" 
                      placeholder="Enter TrxID"
                      className="w-full bg-f-gray px-5 py-4 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-black"
                      value={shipping.trxId}
                      onChange={(e) => setShipping({...shipping, trxId: e.target.value.toUpperCase()})}
                  />
               </div>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-white/40">
            <div className="flex justify-between text-[10px] font-bold opacity-40 uppercase tracking-widest">
              <span>Items Sub-Total</span>
              <span>৳{subTotal}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold opacity-40 uppercase tracking-widest">
              <span>Delivery Charge</span>
              <span>৳{deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-2xl tracking-tighter pt-4">
              <span>Grand Total</span>
              <span>৳{grandTotal}</span>
            </div>
          </div>
        </section>
      </div>

      <button 
        disabled={loading}
        onClick={placeOrder}
        className="btn-primary w-full mt-12 shadow-[0_25px_60px_rgba(0,0,0,0.15)] active:scale-95 transition-all text-xs uppercase tracking-widest"
      >
        {loading ? "Placing Order..." : "Confirm Order"}
      </button>
    </div>
  );
};

export default CheckoutPage;
