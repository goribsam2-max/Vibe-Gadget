
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('f_cart') || '[]');
    setItems(cart);
  }, []);

  const total = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    setItems(newItems);
    localStorage.setItem('f_cart', JSON.stringify(newItems));
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    localStorage.setItem('f_cart', JSON.stringify(newItems));
  };

  return (
    <div className="p-6 pb-24 animate-fade-in bg-white max-w-md mx-auto">
       <div className="flex items-center space-x-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Your Cart</h1>
       </div>

       {items.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-f-gray rounded-[32px] flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Cart is empty</p>
            <button onClick={() => navigate('/')} className="mt-8 text-black font-bold underline text-xs uppercase tracking-widest">Shop Gadgets</button>
         </div>
       ) : (
         <>
           <div className="space-y-4 mb-10">
             {items.map((item, idx) => (
               <div key={idx} className="bg-white p-4 rounded-[32px] flex items-center space-x-4 border border-f-light shadow-sm">
                  <div className="w-24 h-24 bg-f-gray rounded-3xl overflow-hidden shadow-inner p-2">
                     <img src={item.image} className="w-full h-full object-contain" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm truncate pr-2">{item.name}</h4>
                        <button onClick={() => removeItem(idx)} className="text-gray-300 hover:text-black p-1">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                     </div>
                     <p className="text-[10px] text-f-gray font-bold uppercase tracking-wider mb-3">Unit: ৳{item.price}</p>
                     <div className="flex justify-between items-center">
                        <p className="font-bold text-sm">৳{item.price * item.quantity}</p>
                        <div className="flex items-center space-x-4 bg-f-gray px-4 py-2 rounded-2xl">
                           <button onClick={() => updateQuantity(idx, -1)} className="font-bold text-lg leading-none">-</button>
                           <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                           <button onClick={() => updateQuantity(idx, 1)} className="font-bold text-lg leading-none">+</button>
                        </div>
                     </div>
                  </div>
               </div>
             ))}
           </div>

           <div className="bg-f-gray p-6 rounded-[32px] space-y-4 mb-10">
              <div className="flex justify-between text-xs font-bold">
                 <span className="text-f-gray uppercase tracking-widest">Sub-Total</span>
                 <span>৳{total}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                 <span className="text-f-gray uppercase tracking-widest">Delivery Fee</span>
                 <span>৳150</span>
              </div>
              <div className="h-px bg-white/50"></div>
              <div className="flex justify-between text-xl font-bold">
                 <span>Grand Total</span>
                 <span>৳{total + 150}</span>
              </div>
           </div>

           <button onClick={() => navigate('/checkout')} className="btn-primary w-full flex items-center justify-center space-x-3 shadow-2xl shadow-black/20">
              <span>Checkout Now</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>
           </button>
         </>
       )}
    </div>
  );
};

export default Cart;
