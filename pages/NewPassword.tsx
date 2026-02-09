
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NewPassword: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 animate-fade-in h-screen flex flex-col">
       <button onClick={() => navigate(-1)} className="p-2 bg-f-gray rounded-full self-start mb-10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
       </button>
       
       <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">New Password</h1>
          <p className="text-f-gray text-sm mb-10">Your new password must be different from previously used passwords.</p>
          
          <div className="space-y-6">
             <div>
                <label className="block text-sm font-bold mb-2">Password</label>
                <input type="password" placeholder="••••••••••••" className="w-full bg-f-gray p-4 rounded-2xl outline-none" />
             </div>
             <div>
                <label className="block text-sm font-bold mb-2">Confirm Password</label>
                <input type="password" placeholder="••••••••••••" className="w-full bg-f-gray p-4 rounded-2xl outline-none" />
             </div>
          </div>
       </div>

       <button onClick={() => navigate('/signin')} className="btn-primary w-full">Create New Password</button>
    </div>
  );
};

export default NewPassword;
