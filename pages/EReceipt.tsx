
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
    
    // Use onSnapshot for real-time status updates
    const unsubscribe = onSnapshot(doc(db, 'orders', id), (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
      }
      setLoading(false);
    }, (error) => {
      console.error("Receipt sync error:", error);
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
       <p className="font-bold mb-4">Receipt data not found.</p>
       <button onClick={() => navigate('/')} className="btn-primary w-full">Return Home</button>
    </div>
  );

  const subTotal = order.items.reduce((acc, item) => acc + (item.priceAtPurchase * item.quantity), 0);

  return (
    <div className="p-6 pb-24 animate-fade-in min-h-screen bg-white max-w-md mx-auto print:p-0">
       <div className="flex items-center space-x-4 mb-8 print:hidden">
          <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl active:scale-90 transition-transform">
             <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Order Receipt</h1>
       </div>

       {/* Receipt Content Wrapper */}
       <div id="receipt-area" className="bg-f-gray rounded-[40px] border border-f-light p-8 shadow-sm flex flex-col relative overflow-hidden print:border-0 print:bg-white print:shadow-none print:rounded-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full translate-x-16 -translate-y-16 print:hidden"></div>
          
          {/* Header */}
          <div className="mb-10 w-full flex flex-col items-center">
             <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-xl print:shadow-none">
                <i className="fas fa-bolt text-white text-2xl"></i>
             </div>
             <h2 className="text-xl font-bold tracking-tight mb-1">VibeGadget Invoice</h2>
             <p className="text-[9px] text-f-gray font-bold tracking-[3px] uppercase opacity-60">Verified Purchase</p>
          </div>

          {/* Customer Info (A-Z Section) */}
          <div className="w-full space-y-6 mb-8 border-b border-white/50 pb-8 print:border-gray-100">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-[9px] text-f-gray font-bold uppercase tracking-widest">Customer Info</p>
                   <p className="text-xs font-bold">{order.customerName}</p>
                   <p className="text-[10px] text-gray-500 font-bold leading-tight mt-1">
                      <code className="bg-white px-1.5 py-0.5 rounded border border-black/5 print:border-0">{order.contactNumber}</code>
                   </p>
                </div>
                <div className="text-right space-y-1">
                   <p className="text-[9px] text-f-gray font-bold uppercase tracking-widest">Order ID</p>
                   <p className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2 py-1 rounded inline-block">#{order.id.slice(0, 8)}</p>
                   <p className="text-[10px] text-gray-500 font-medium mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
             </div>
             <div>
                <p className="text-[9px] text-f-gray font-bold uppercase tracking-widest mb-1">Shipping Address</p>
                <p className="text-[10px] text-gray-500 font-medium italic leading-relaxed">{order.shippingAddress}</p>
             </div>
          </div>

          {/* Product Manifest */}
          <div className="w-full space-y-3 mb-8">
             <p className="text-[9px] text-f-gray font-bold uppercase tracking-widest mb-2">Order Items</p>
             {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4 bg-white/60 p-4 rounded-3xl border border-white/40 print:bg-white print:border-gray-50">
                   <div className="w-10 h-10 bg-white rounded-xl overflow-hidden p-1 shrink-0 print:hidden">
                      <img src={item.image} className="w-full h-full object-contain" alt="" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs truncate">{item.name}</h4>
                      <p className="text-[9px] text-f-gray font-bold uppercase">Qty: {item.quantity} × ৳{item.priceAtPurchase}</p>
                   </div>
                   <p className="font-bold text-xs shrink-0">৳{item.priceAtPurchase * item.quantity}</p>
                </div>
             ))}
          </div>

          {/* Payment Configuration (A-Z Section) */}
          <div className="w-full bg-white/40 p-5 rounded-3xl border border-white/60 mb-8 print:bg-white print:border-gray-50">
             <p className="text-[9px] text-f-gray font-bold uppercase tracking-widest mb-4">Payment Config</p>
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-f-gray uppercase">Method</span>
                   <span className="text-[10px] font-bold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-f-gray uppercase">Payment Type</span>
                   <span className="text-[10px] font-bold">{order.paymentOption || 'Cash on Delivery'}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-f-gray uppercase">TrxID</span>
                   <code className="text-[10px] font-mono font-bold text-black uppercase">{order.transactionId || 'N/A'}</code>
                </div>
             </div>
          </div>

          {/* Financial Summary */}
          <div className="w-full space-y-3 mb-8 border-t border-white/50 pt-6 print:border-gray-100">
             <div className="flex justify-between text-[10px] font-bold text-f-gray uppercase">
                <span>Items Sub-Total</span>
                <span className="text-black">৳{subTotal}</span>
             </div>
             <div className="flex justify-between text-[10px] font-bold text-f-gray uppercase">
                <span>Delivery Charge</span>
                <span className="text-black">৳150</span>
             </div>
             <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/20 print:border-gray-50">
                <span>Grand Total</span>
                <span>৳{order.total}</span>
             </div>
          </div>

          {/* Status & Logs */}
          <div className="w-full text-center space-y-4">
             <div className={`py-3 rounded-2xl border font-bold text-[10px] uppercase tracking-widest transition-all duration-500
                ${order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-black text-white border-black'}`}>
                Order Status: {order.status}
             </div>
             <div className="flex justify-center items-center space-x-2 opacity-40">
                <i className="fas fa-shipping-fast text-[8px]"></i>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em]">Partner: Steadfast Courier</p>
             </div>
          </div>
       </div>

       {/* Print/Download Button */}
       <button 
          onClick={handleDownload}
          className="btn-primary w-full mt-10 shadow-2xl shadow-black/10 flex items-center justify-center space-x-3 text-xs uppercase tracking-widest print:hidden"
       >
          <i className="fas fa-file-pdf"></i>
          <span>Download as pdf</span>
       </button>

       {/* Print-only CSS */}
       <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              #receipt-area, #receipt-area * {
                visibility: visible;
              }
              #receipt-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 20px;
              }
              .print\\:hidden {
                display: none !important;
              }
            }
          `}
       </style>
    </div>
  );
};

export default EReceipt;
