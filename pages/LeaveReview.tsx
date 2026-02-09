
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LeaveReview: React.FC = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);

  return (
    <div className="p-6 animate-fade-in min-h-screen flex flex-col">
       <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-f-gray rounded-xl">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-xl font-bold">Leave Review</h1>
       </div>

       <div className="bg-white p-5 rounded-3xl border border-f-light flex items-center space-x-4 mb-10">
          <div className="w-16 h-16 bg-f-gray rounded-2xl overflow-hidden">
             <img src="https://images.unsplash.com/photo-1594932224828-b4b057b1948d?q=80&w=200" className="w-full h-full object-cover" alt="" />
          </div>
          <div>
             <h4 className="font-bold text-sm">Brown Suite</h4>
             <p className="text-[10px] text-f-gray">Size: XL | Qty: 10pcs</p>
             <button className="text-[10px] font-bold mt-1 px-3 py-1 bg-f-gray rounded-full">Re-Order</button>
          </div>
       </div>

       <div className="text-center mb-10">
          <h3 className="text-xl font-bold mb-4">How is your order?</h3>
          <p className="text-f-gray text-xs mb-6">Your overall rating</p>
          <div className="flex justify-center space-x-2">
             {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
             ))}
          </div>
       </div>

       <div className="flex-1 space-y-6">
          <div>
             <label className="block text-sm font-bold mb-2">Add detailed review</label>
             <textarea placeholder="Enter here" className="w-full bg-f-gray p-4 rounded-3xl outline-none h-32 resize-none" />
          </div>
          <button className="w-full py-4 bg-f-gray rounded-3xl border border-dashed border-gray-300 text-f-gray text-sm flex items-center justify-center space-x-2">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             <span>Add photo</span>
          </button>
       </div>

       <div className="flex space-x-4 mt-8">
          <button onClick={() => navigate(-1)} className="flex-1 btn-secondary">Cancel</button>
          <button onClick={() => navigate('/')} className="flex-1 btn-primary">Submit</button>
       </div>
    </div>
  );
};

export default LeaveReview;
