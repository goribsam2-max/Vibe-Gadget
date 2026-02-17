
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Order, OrderStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const StatusIconSmall = ({ status }: { status: OrderStatus }) => {
  const base = "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] shadow-sm ";
  switch (status) {
    case OrderStatus.HOLD: return <div className={base + "bg-yellow-50 text-yellow-600"}><i className="fas fa-pause"></i></div>;
    case OrderStatus.PROCESSING: return <div className={base + "bg-blue-50 text-blue-600"}><i className="fas fa-sync-alt animate-spin-slow"></i></div>;
    case OrderStatus.SHIPPED: return <div className={base + "bg-orange-50 text-orange-600"}><i className="fas fa-truck-moving"></i></div>;
    case OrderStatus.DELIVERED: return <div className={base + "bg-green-50 text-green-600"}><i className="fas fa-check"></i></div>;
    default: return <div className={base + "bg-zinc-50 text-zinc-400"}><i className="fas fa-box"></i></div>;
  }
};

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const uid = auth.currentUser?.uid || 'guest';
    const q = query(collection(db, 'orders'), where('userId', '==', uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      data.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 pb-40 animate-fade-in min-h-screen bg-white">
      <div className="flex items-center space-x-6 mb-12">
        <button onClick={() => navigate(-1)} className="p-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl">
          <i className="fas fa-chevron-left text-xs"></i>
        </button>
        <h1 className="text-2xl font-black tracking-tighter uppercase">My Orders.</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center">
          <div className="w-24 h-24 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 flex items-center justify-center mb-8">
             <i className="fas fa-shopping-bag text-3xl text-zinc-200"></i>
          </div>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No order history found</p>
          <button onClick={() => navigate('/')} className="mt-10 btn-primary px-10 text-[10px] uppercase tracking-widest">Start Shopping</button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <motion.div 
              whileTap={{ scale: 0.98 }}
              key={order.id} 
              onClick={() => navigate(`/track-order/${order.id}`)} 
              className="bg-zinc-50 p-8 rounded-[3rem] border border-zinc-100 shadow-sm hover:bg-white hover:shadow-xl transition-all cursor-pointer relative group"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4">
                  <StatusIconSmall status={order.status} />
                  <div>
                    <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-1">Order Ref</p>
                    <p className="text-[11px] font-mono font-black uppercase">#{order.id.slice(0, 10)}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{order.status}</p>
                   <p className="text-[9px] text-zinc-400 font-bold mt-1 uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center -space-x-3 mb-8 overflow-hidden">
                {order.items.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="w-12 h-12 rounded-2xl bg-white p-1 border-2 border-zinc-50 shadow-sm shrink-0">
                     <img src={item.image} className="w-full h-full object-contain rounded-lg" alt="" />
                  </div>
                ))}
                {order.items.length > 4 && (
                   <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center text-[10px] font-black border-2 border-zinc-50">
                      +{order.items.length - 4}
                   </div>
                )}
              </div>

              <div className="flex justify-between items-end pt-6 border-t border-zinc-200/50">
                <div>
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Amount</p>
                  <p className="text-xl font-black tracking-tighter">৳{order.total}</p>
                </div>
                <button className="px-6 py-2.5 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg group-hover:scale-105 transition-transform">
                   Track Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
