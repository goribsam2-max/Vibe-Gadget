
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Order, OrderStatus } from '../../types';
import { useNotify } from '../../components/Notifications';
import { motion } from 'framer-motion';

const ManageOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const notify = useNotify();

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      notify(`Order status: ${status}`, "success");
    } catch (e) {
      notify("Update failed", "error");
    }
  };

  const updateTrackingId = async (orderId: string, trackingId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { trackingId: trackingId.trim() });
      notify("Tracking ID synced", "success");
    } catch (e) {
      notify("Update failed", "error");
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10 pb-32 min-h-screen bg-[#FDFDFD]">
      <div className="mb-12 flex items-center space-x-6">
        <button onClick={() => navigate('/admin')} className="p-4 bg-zinc-900 text-white rounded-2xl shadow-xl active:scale-95 transition-all"><i className="fas fa-chevron-left text-xs"></i></button>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Order Ops.</h1>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em] mt-1">Manual Logistics Management</p>
        </div>
      </div>

      <div className="space-y-8">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-[3.5rem] border border-zinc-100 p-8 md:p-12 shadow-sm flex flex-col lg:flex-row gap-12 transition-all hover:shadow-2xl">
             <div className="lg:w-1/3">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-1">Ref Node</p>
                      <p className="font-mono font-black text-xs uppercase bg-zinc-50 px-2 py-1 rounded">#{order.id.slice(0,10)}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-1">Status</p>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === OrderStatus.DELIVERED ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}>{order.status}</span>
                   </div>
                </div>
                <div className="space-y-3 mb-10 p-5 bg-zinc-50 rounded-[2rem] border border-zinc-100/50">
                   <p className="text-sm font-black tracking-tight">{order.customerName}</p>
                   <p className="text-xs font-bold text-zinc-400">{order.contactNumber}</p>
                   <p className="text-[10px] text-zinc-400 font-medium leading-relaxed italic line-clamp-2">{order.shippingAddress}</p>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-zinc-300 uppercase tracking-widest px-1">Phase Transition</label>
                  <select 
                    className="w-full p-5 bg-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest border-none outline-none cursor-pointer focus:ring-2 focus:ring-black transition-all"
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  >
                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
             </div>

             <div className="flex-1 space-y-10">
                <div className="flex flex-col md:flex-row gap-10">
                   <div className="flex-1">
                      <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-4 px-1">Manual Tracking ID</p>
                      <input 
                        type="text" 
                        placeholder="Assign Custom ID..."
                        className="w-full bg-zinc-50 p-5 rounded-[1.5rem] text-[11px] font-black outline-none border-2 border-transparent focus:border-black transition-all shadow-inner uppercase"
                        defaultValue={order.trackingId}
                        onBlur={(e) => updateTrackingId(order.id, e.target.value)}
                      />
                   </div>
                   <div className="text-right flex flex-col justify-end">
                      <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-2">Grand Total Sync</p>
                      <p className="text-4xl font-black tracking-tighter">৳{order.total}</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 pt-10 border-t border-zinc-100">
                   {order.items.map((item, i) => (
                      <div key={i} className="flex flex-col items-center p-4 bg-zinc-50 rounded-[2rem] border border-white/50 shadow-sm group">
                         <div className="w-14 h-14 bg-white rounded-2xl p-2 mb-4 shadow-inner group-hover:scale-110 transition-transform">
                            <img src={item.image} className="w-full h-full object-contain" alt="" />
                         </div>
                         <p className="text-[9px] font-black text-center truncate w-full uppercase tracking-tighter">{item.name}</p>
                         <p className="text-[8px] font-bold text-zinc-400 mt-1">QTY: {item.quantity}</p>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        ))}
        {orders.length === 0 && <div className="py-40 text-center text-zinc-300 font-black uppercase tracking-[0.5em]">No log found in database</div>}
      </div>
    </div>
  );
};

export default ManageOrders;
