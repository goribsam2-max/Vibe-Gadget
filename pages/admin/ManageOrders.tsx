
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Order, OrderStatus } from '../../types';
import { useNotify } from '../../components/Notifications';
import { sendOrderToSteadfast } from '../../services/steadfast';

const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const notify = useNotify();

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      notify("Order updated!", "success");
    } catch (err) {
      notify("Could not update status", "error");
    }
  };

  const handleSendToSteadfast = async (order: Order) => {
    setSyncingId(order.id);
    try {
        const result = await sendOrderToSteadfast(order);
        
        // Packzy returns status 200 on success with consignment details
        if (result && result.status === 200 && result.consignment) {
            await updateDoc(doc(db, 'orders', order.id), { 
                steadfastId: result.consignment.tracking_code,
                steadfastStatus: result.consignment.status,
                status: OrderStatus.SHIPPED
            });
            notify("Order sent to courier!", "success");
        } else {
            // Detailed error message if available
            const errorMsg = result?.message || "Courier portal rejected the request";
            notify(errorMsg, "error");
            console.error("API Rejected:", result);
        }
    } catch (e) {
        notify("Network error or CORS block. Check API console.", "error");
    } finally {
        setSyncingId(null);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-600';
      case OrderStatus.SHIPPED: return 'bg-blue-100 text-blue-600';
      case OrderStatus.PROCESSING: return 'bg-orange-100 text-orange-600';
      case OrderStatus.PENDING: return 'bg-gray-100 text-gray-500';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-xs text-f-gray font-bold uppercase tracking-widest mt-1">Track and Ship Customer Packages</p>
      </div>

      <div className="space-y-8">
        {orders.map(order => (
          <div key={order.id} className="bg-f-gray rounded-[48px] border border-f-light overflow-hidden shadow-sm flex flex-col md:flex-row">
            <div className="p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-white/50 space-y-6">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Receipt ID</p>
                    <p className="text-sm font-mono font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
                 </div>
                 <span className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                    {order.status}
                 </span>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-f-gray uppercase">Customer</p>
                       <p className="text-xs font-bold tracking-tight">{order.customerName}</p>
                    </div>
                 </div>
                 <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-f-gray uppercase">Contact</p>
                       <p className="text-xs font-bold tracking-tight">{order.contactNumber}</p>
                    </div>
                 </div>
              </div>

              <div className="pt-4 border-t border-white/50">
                 <p className="text-[10px] font-bold text-f-gray uppercase mb-3">Update Status</p>
                 <select 
                   value={order.status}
                   onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                   className="w-full bg-white px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-none outline-none shadow-sm cursor-pointer"
                 >
                   {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
            </div>

            <div className="p-8 flex-1 space-y-8 flex flex-col justify-between">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Order Details</h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto no-scrollbar pr-2">
                       {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-3 bg-white/50 p-3 rounded-2xl border border-white/20 shadow-sm">
                             <img src={item.image} className="w-10 h-10 rounded-xl object-contain bg-white shrink-0" alt="" />
                             <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">{item.name}</p>
                                <p className="text-[10px] text-f-gray font-bold">Qty: {item.quantity} × ৳{item.priceAtPurchase}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
                 <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Shipping Address</h4>
                    <div className="p-5 bg-white rounded-3xl border border-white/20 shadow-sm text-xs font-medium leading-relaxed italic">
                       {order.shippingAddress}
                    </div>
                    <div className="mt-4 p-4 bg-black text-white rounded-[24px] flex justify-between items-center shadow-xl shadow-black/10">
                       <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Total Cash</span>
                       <span className="text-lg font-bold">৳{order.total}</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/50">
                 <div>
                    <p className="text-[10px] font-bold text-f-gray uppercase tracking-widest mb-1">Courier Service</p>
                    <div className="flex items-center space-x-2">
                       <span className="text-xs font-bold">Steadfast / Packzy</span>
                       {order.steadfastId && (
                          <span className="text-[9px] font-mono bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">Code: {order.steadfastId}</span>
                       )}
                    </div>
                 </div>
                 {order.steadfastId ? (
                   <div className="flex items-center space-x-2 text-green-500 bg-green-50 px-4 py-2 rounded-xl">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Handed Over</span>
                   </div>
                 ) : (
                   <button 
                     disabled={syncingId === order.id}
                     onClick={() => handleSendToSteadfast(order)}
                     className="px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-black/10 flex items-center space-x-2 active:scale-95 transition-transform disabled:opacity-50"
                   >
                     {syncingId === order.id ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                     )}
                     <span>Create Courier Order</span>
                   </button>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageOrders;
