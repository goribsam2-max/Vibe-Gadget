
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';

const EReceipt: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, 'orders', id));
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() } as Order);
        }
      } catch (e) {
        console.error("Receipt error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
       <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!order) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 text-center">
       <p className="font-bold mb-4">Receipt not available.</p>
       <button onClick={() => navigate('/')} className="btn-primary w-full">Return Home</button>
    </div>
  );

  return (
    <div className="p-6 pb-24 animate-fade-in min-h-screen bg-white max-w-md mx-auto">
       <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Vibe Digital Receipt</h1>
       </div>

       <div id="receipt-content" className="bg-f-gray rounded-[40px] border border-f-light p-8 shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full translate-x-16 -translate-y-16"></div>
          
          <div className="mb-10 w-full flex flex-col items-center">
             <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
             </div>
             <div className="w-full h-16 bg-white rounded-2xl flex items-center justify-center font-mono text-lg tracking-[8px] mb-3 shadow-inner">
                {order.id.slice(0, 8).toUpperCase()}
             </div>
             <p className="text-[10px] text-f-gray font-bold tracking-[3px] uppercase">Official Vibe Transaction</p>
          </div>

          <div className="w-full space-y-4 mb-10 border-b border-white/50 pb-6">
             <div className="flex justify-between items-start">
                <div className="space-y-1">
                   <p className="text-[9px] text-f-gray font-bold uppercase tracking-widest">Billed To</p>
                   <p className="text-xs font-bold">{order.customerName}</p>
                   <p className="text-[10px] text-gray-500 font-medium leading-tight max-w-[150px]">{order.shippingAddress}</p>
                </div>
                <div className="text-right space-y-1">
                   <p className="text-[9px] text-f-gray font-bold uppercase tracking-widest">Network Node</p>
                   <p className="text-xs font-bold">Express-SF-01</p>
                   <p className="text-[10px] text-gray-500 font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
             </div>
          </div>

          <div className="w-full space-y-3 mb-10">
             <p className="text-[10px] text-f-gray font-bold uppercase tracking-widest mb-4">Inventory Manifest</p>
             {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4 bg-white/60 p-4 rounded-[24px] border border-white/40">
                   <div className="w-12 h-12 bg-white rounded-xl overflow-hidden p-1 shrink-0">
                      <img src={item.image} className="w-full h-full object-contain" alt="" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs truncate">{item.name}</h4>
                      <p className="text-[9px] text-f-gray font-bold">QTY: {item.quantity} UNIT: ৳{item.priceAtPurchase}</p>
                   </div>
                   <p className="font-bold text-sm shrink-0">৳{item.priceAtPurchase * item.quantity}</p>
                </div>
             ))}

             <div className="space-y-3 pt-6">
                <div className="flex justify-between text-xs font-bold text-f-gray">
                   <span className="uppercase tracking-tighter">Items Sub-Total</span>
                   <span className="text-black">৳{order.total - 150}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-f-gray">
                   <span className="uppercase tracking-tighter">Steadfast Logistics Fee</span>
                   <span className="text-black">৳150.00</span>
                </div>
                <div className="h-px bg-white/60 my-2"></div>
                <div className="flex justify-between text-xl font-bold">
                   <span className="tracking-tight">Grand Total</span>
                   <span>৳{order.total}</span>
                </div>
             </div>
          </div>

          <div className="w-full pt-6 border-t border-white/50 text-center">
             <p className="text-[9px] font-bold text-f-gray uppercase tracking-[4px] mb-2 opacity-60">Payment Method: {order.paymentMethod}</p>
             <div className="bg-white/40 py-2 rounded-xl border border-white/20">
                <p className="text-[10px] font-bold text-black uppercase tracking-widest">Status: {order.status}</p>
             </div>
          </div>
       </div>

       <button onClick={() => window.print()} className="btn-primary w-full mt-10 shadow-2xl shadow-black/10 text-xs uppercase tracking-[2px]">Export as Logistics PDF</button>
    </div>
  );
};

export default EReceipt;
