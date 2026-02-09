
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="h-screen flex flex-col p-8 items-center justify-center text-center animate-fade-in bg-white max-w-md mx-auto">
       <div className="w-24 h-24 bg-f-gray rounded-[40px] flex items-center justify-center mb-10 shadow-2xl shadow-black/5 ring-1 ring-gray-100">
          <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
       </div>
       <h1 className="text-2xl font-bold mb-2 tracking-tight">Order Confirmed!</h1>
       <p className="text-f-gray text-sm mb-12 px-10">Your tech essentials are being prepared for delivery via Steadfast Courier.</p>
       
       <div className="w-full space-y-4">
          <button onClick={() => navigate('/orders')} className="btn-primary w-full shadow-xl shadow-black/10 uppercase text-xs tracking-widest">Track Logistics</button>
          <button onClick={() => navigate(`/e-receipt/${orderId}`)} className="btn-secondary w-full uppercase text-xs tracking-widest">View Digital Receipt</button>
       </div>
    </div>
  );
};

export default PaymentSuccess;
