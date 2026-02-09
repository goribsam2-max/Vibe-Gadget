
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Order, OrderStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const uid = auth.currentUser?.uid || 'guest';
    
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      data.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(data);
      setLoading(false);
    }, (error) => {
      console.error("Order fetch error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-600';
      case OrderStatus.SHIPPED: return 'bg-blue-100 text-blue-600';
      case OrderStatus.PROCESSING: return 'bg-orange-100 text-orange-600';
      case OrderStatus.PACKAGING: return 'bg-purple-100 text-purple-600';
      case OrderStatus.PENDING: return 'bg-gray-100 text-gray-500';
      case OrderStatus.ON_THE_WAY: return 'bg-yellow-100 text-yellow-600';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-8 pb-24 animate-fade-in min-h-screen bg-white">
      <div className="flex items-center space-x-4 mb-10">
        <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <h1 className="text-xl font-bold tracking-tight">Tech Purchases</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center">
          <div className="w-20 h-20 bg-f-gray rounded-[32px] flex items-center justify-center mb-6">
             <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" /></svg>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No history found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} onClick={() => navigate(`/track-order/${order.id}`)} className="bg-f-gray p-6 rounded-[40px] border border-f-light shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Receipt Ref</p>
                  <p className="text-xs font-mono font-bold">#{order.id.slice(0, 10).toUpperCase()}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 bg-white p-2 rounded-2xl">
                     <img src={item.image} className="w-10 h-10 rounded-xl object-contain bg-f-gray shrink-0" alt="" />
                     <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold truncate tracking-tight">{item.name}</p>
                        <p className="text-[9px] text-f-gray font-bold">Qty: {item.quantity} × ৳{item.priceAtPurchase}</p>
                     </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-white/60">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-lg font-bold">৳{order.total}</p>
                  <p className="text-[8px] text-f-gray font-bold mt-1 uppercase">Method: {order.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <div className="flex items-center space-x-1 text-black font-bold text-[9px] uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl shadow-sm">
                     <span>Review</span>
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
