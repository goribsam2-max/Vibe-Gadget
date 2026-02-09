
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-10 text-center animate-fade-in">
      <div className="w-24 h-24 bg-f-gray rounded-[40px] flex items-center justify-center text-black mb-8 shadow-2xl shadow-black/5 ring-1 ring-gray-100">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
      </div>
      <h1 className="text-2xl font-bold mb-2 tracking-tight">Order Confirmed</h1>
      <p className="text-f-gray text-xs font-medium leading-relaxed mb-10">Your gadget is on its way. You can view the digital receipt or track it in your history.</p>
      
      <div className="space-y-4 w-full max-w-xs">
        <Link to={`/e-receipt/${orderId}`} className="block w-full py-4 bg-[#1F2029] text-white rounded-2xl font-bold shadow-xl shadow-black/10 text-sm uppercase tracking-widest">Digital Receipt</Link>
        <Link to="/" className="block w-full py-4 border-2 border-f-light text-f-gray rounded-2xl font-bold text-sm uppercase tracking-widest hover:border-black hover:text-black transition-all">Continue Exploring</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
