
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, OrderStatus } from '../types';
import { getSteadfastStatus } from '../services/steadfast';

const TrackOrder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [sfStatus, setSfStatus] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, 'orders', id));
        if (snap.exists()) {
          const orderData = { id: snap.id, ...snap.data() } as Order;
          setOrder(orderData);
          
          if (orderData.steadfastId) {
            const result = await getSteadfastStatus(orderData.steadfastId);
            // documentation says response format: { status: 200, delivery_status: "..." }
            if (result && result.status === 200 && result.delivery_status) {
                const currentStatus = result.delivery_status;
                setSfStatus(currentStatus);
                
                // If local status differs from courier status, sync it
                if (currentStatus !== orderData.status) {
                    await updateDoc(doc(db, 'orders', id), { 
                        status: currentStatus,
                        steadfastStatus: currentStatus 
                    });
                    setOrder(prev => prev ? { ...prev, status: currentStatus } : null);
                }
            }
          }
        }
      } catch (e) {
        console.error("Error tracking order", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
       <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!order) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 text-center">
       <p className="font-bold mb-4">No tracking data found.</p>
       <button onClick={() => navigate('/')} className="btn-primary w-full">Go Back Home</button>
    </div>
  );

  const statusLower = order.status.toLowerCase();

  // Unified visual steps based on Packzy delivery statuses
  const steps = [
    { label: 'Order Received', active: true },
    { label: 'Processing', active: ['in_review', 'shipped', 'delivered', 'partial_delivered', 'delivered_approval_pending'].includes(statusLower) },
    { label: 'Handed Over', active: ['shipped', 'delivered', 'partial_delivered', 'delivered_approval_pending'].includes(statusLower) },
    { label: 'Delivered', active: ['delivered', 'partial_delivered', 'delivered_approval_pending'].includes(statusLower) }
  ];

  return (
    <div className="p-6 pb-24 animate-fade-in min-h-screen bg-white max-w-md mx-auto">
       <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Tracking Package</h1>
       </div>

       <div className="space-y-4 mb-10">
          {order.items.map((item, idx) => (
            <div key={idx} className="bg-f-gray p-4 rounded-[28px] flex items-center space-x-4 border border-f-light">
              <div className="w-14 h-14 bg-white rounded-xl overflow-hidden p-1 shadow-sm shrink-0">
                 <img src={item.image} className="w-full h-full object-contain" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="font-bold text-xs truncate">{item.name}</h4>
                 <p className="text-[10px] text-f-gray font-bold uppercase tracking-wider">Qty: {item.quantity} | ৳{item.priceAtPurchase}</p>
              </div>
            </div>
          ))}
       </div>

       <div className="space-y-8 mb-10 pl-8 border-l-2 border-f-gray relative ml-4 mt-6">
          {steps.map((step, i) => (
             <div key={i} className="relative">
                <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white z-10 transition-colors duration-500 ${step.active ? 'bg-black shadow-lg shadow-black/20' : 'bg-gray-200'}`}></div>
                <div className="flex justify-between items-start">
                   <div>
                      <h4 className={`font-bold text-sm mb-1 ${step.active ? 'text-black' : 'text-gray-300 opacity-60'}`}>{step.label}</h4>
                      <p className="text-[9px] text-f-gray font-bold uppercase tracking-widest">Real-time Sync</p>
                   </div>
                   {step.active && (
                      <div className="bg-green-50 text-green-600 p-1 rounded-lg">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      </div>
                   )}
                </div>
             </div>
          ))}
       </div>

       <div className="bg-f-gray p-6 rounded-[32px] border border-f-light">
          <div className="flex justify-between items-center mb-6">
             <h4 className="font-bold text-[10px] text-f-gray uppercase tracking-widest">Courier Status</h4>
             <div className="flex items-center space-x-1 px-3 py-1 bg-white rounded-xl">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-bold uppercase tracking-tighter">Packzy Live</span>
             </div>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-f-gray uppercase">Tracking ID</span>
                <span className="text-xs font-mono font-bold tracking-tight">{order.steadfastId || 'Processing...'}</span>
             </div>
             <div className="flex justify-between items-center pt-4 border-t border-white/50">
                <span className="text-[10px] font-bold text-f-gray uppercase">Current Stage</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl uppercase tracking-tighter">
                    {(sfStatus || order.status).replace(/_/g, ' ')}
                </span>
             </div>
          </div>
       </div>
    </div>
  );
};

export default TrackOrder;
