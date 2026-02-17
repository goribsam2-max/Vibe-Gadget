
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="p-6 md:p-12 pb-48 animate-fade-in bg-white max-w-7xl mx-auto min-h-screen">
       <div className="flex items-center space-x-6 mb-12">
          <button onClick={() => navigate(-1)} className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-sm hover:bg-black hover:text-white transition-all">
             <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Shopping Cart.</h1>
       </div>

       {items.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-zinc-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-zinc-100">
                <i className="fas fa-shopping-cart text-3xl text-zinc-300"></i>
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Your cart is empty</p>
            <button onClick={() => navigate('/')} className="mt-10 btn-primary px-12 text-[10px] uppercase tracking-widest shadow-xl shadow-zinc-200">Start Shopping</button>
         </div>
       ) : (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-8 space-y-6">
             <AnimatePresence mode="popLayout">
               {items.map((item, idx) => (
                 <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, x: 20 }} key={idx} className="bg-zinc-50 p-6 rounded-[2.5rem] flex items-center space-x-6 border border-zinc-100 transition-all hover:bg-white hover:shadow-xl group">
                    <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-[1.5rem] p-3 shadow-inner shrink-0 border border-zinc-100">
                       <img src={item.image} className="w-full h-full object-contain rounded-xl" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm md:text-lg truncate pr-4 tracking-tight">{item.name}</h4>
                          <button onClick={() => removeItem(idx)} className="text-zinc-300 hover:text-red-500 transition-colors p-2">
                             <i className="fas fa-trash text-xs"></i>
                          </button>
                       </div>
                       <div className="flex justify-between items-center mt-6">
                          <p className="font-black text-sm md:text-xl">৳{item.price * item.quantity}</p>
                          <div className="flex items-center space-x-5 bg-white px-4 py-2 rounded-2xl shadow-sm border border-zinc-100">
                             <button onClick={() => updateQuantity(idx, -1)} className="font-black hover:text-zinc-500 transition-colors">−</button>
                             <span className="text-[11px] font-black w-4 text-center">{item.quantity}</span>
                             <button onClick={() => updateQuantity(idx, 1)} className="font-black hover:text-zinc-500 transition-colors">+</button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
           </div>

           <div className="lg:col-span-4">
             <div className="bg-zinc-900 text-white p-10 rounded-[3.5rem] shadow-2xl sticky top-12 border border-white/5">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-10">Order Summary</h3>
                <div className="space-y-6">
                   <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span>৳{total}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      <span>Shipping Fee</span>
                      <span>৳150</span>
                   </div>
                   <div className="h-px bg-white/10 my-6"></div>
                   <div className="flex justify-between items-end">
                      <span className="text-[11px] font-bold uppercase text-white/30 tracking-[0.2em]">Total Amount</span>
                      <span className="text-4xl font-black tracking-tighter">৳{total + 150}</span>
                   </div>
                </div>
                <button onClick={() => navigate('/checkout')} className="w-full mt-12 py-6 bg-white text-black rounded-[2rem] font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                  Checkout Now
                </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default Cart;
