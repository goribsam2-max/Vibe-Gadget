
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';

const EReceipt: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const unsubscribe = onSnapshot(doc(db, 'orders', id), (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
      }
      setLoading(false);
    }, (error) => {
      console.error("Receipt error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleDownload = () => {
    window.print();
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
       <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!order) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 text-center">
       <p className="font-bold mb-4">Invoice not found.</p>
       <button onClick={() => navigate('/')} className="btn-primary w-full px-10">Return Home</button>
    </div>
  );

  const subTotal = order.items.reduce((acc, item) => acc + (item.priceAtPurchase * item.quantity), 0);

  return (
    <div className="p-6 pb-24 animate-fade-in min-h-screen bg-white max-w-md mx-auto print:p-0">
       <div className="flex items-center space-x-6 mb-10 print:hidden">
          <button onClick={() => navigate(-1)} className="p-3 bg-zinc-50 rounded-2xl active:scale-90 transition-transform border border-zinc-100 shadow-sm">
             <i className="fas fa-arrow-left text-sm"></i>
          </button>
          <h1 className="text-xl font-black tracking-tight">E-Receipt</h1>
       </div>

       <div id="receipt-area" className="bg-zinc-50 rounded-[3rem] border border-zinc-100 p-8 shadow-sm flex flex-col relative overflow-hidden print:border-0 print:bg-white print:shadow-none print:rounded-none">
          <div className="mb-10 w-full flex flex-col items-center">
             <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <i className="fas fa-shopping-bag text-white text-xl"></i>
             </div>
             <h2 className="text-2xl font-black tracking-tight mb-1 text-zinc-900">VibeGadget</h2>
             <p className="text-[9px] text-zinc-400 font-bold tracking-[0.2em] uppercase">Official Invoice</p>
          </div>

          <div className="w-full space-y-6 mb-8 border-b border-zinc-200 pb-8">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">Customer</p>
                   <p className="text-xs font-bold text-zinc-900">{order.customerName}</p>
                   <p className="text-[10px] text-zinc-500 font-bold mt-1">{order.contactNumber}</p>
                </div>
                <div className="text-right space-y-1">
                   <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">Order ID</p>
                   <p className="text-[10px] font-mono font-black uppercase bg-white border border-zinc-100 px-2 py-1 rounded">#{order.id.slice(0, 8).toUpperCase()}</p>
                   <p className="text-[10px] text-zinc-500 font-bold mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
             </div>
             <div>
                <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest mb-1">Shipping To</p>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">{order.shippingAddress}</p>
             </div>
          </div>

          <div className="w-full space-y-4 mb-8">
             <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest mb-1">Order Summary</p>
             {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                   <div className="w-10 h-10 bg-zinc-50 rounded-xl overflow-hidden p-1 shrink-0">
                      <img src={item.image} className="w-full h-full object-contain" alt="" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[11px] truncate">{item.name}</h4>
                      <p className="text-[9px] text-zinc-400 font-bold">Qty: {item.quantity} × ৳{item.priceAtPurchase}</p>
                   </div>
                   <p className="font-black text-xs shrink-0">৳{item.priceAtPurchase * item.quantity}</p>
                </div>
             ))}
          </div>

          <div className="w-full bg-white p-5 rounded-2xl border border-zinc-100 mb-8 shadow-sm">
             <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest mb-3">Payment Info</p>
             <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                   <span className="font-bold text-zinc-400">Method</span>
                   <span className="font-bold text-zinc-900">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                   <span className="font-bold text-zinc-400">Transaction ID</span>
                   <span className="font-mono font-bold text-black uppercase">{order.transactionId || 'N/A'}</span>
                </div>
             </div>
          </div>

          <div className="w-full space-y-3 mb-6 border-t border-zinc-200 pt-6">
             <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                <span>Sub-Total</span>
                <span className="text-zinc-900">৳{subTotal}</span>
             </div>
             <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                <span>Delivery Charge</span>
                <span className="text-zinc-900">৳150</span>
             </div>
             <div className="flex justify-between text-3xl font-black pt-4 border-t border-zinc-100 tracking-tighter text-zinc-900">
                <span>Total</span>
                <span>৳{order.total}</span>
             </div>
          </div>

          <div className="w-full text-center">
             <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-300">Thank you for shopping at VibeGadget</p>
          </div>
       </div>

       <button 
          onClick={handleDownload}
          className="w-full mt-10 py-5 bg-black text-white rounded-2xl flex items-center justify-center space-x-3 text-[10px] font-black uppercase tracking-widest print:hidden shadow-lg active:scale-[0.98] transition-all"
       >
          <i className="fas fa-print"></i>
          <span>Download Invoice</span>
       </button>

       <style>
          {`
            @media print {
              body * { visibility: hidden; }
              #receipt-area, #receipt-area * { visibility: visible; }
              #receipt-area {
                position: fixed;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 40px;
                background: white !important;
                border: 1px solid #eee !important;
              }
              .print\\:hidden { display: none !important; }
            }
          `}
       </style>
    </div>
  );
};

export default EReceipt;
