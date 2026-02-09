
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const options = [
    { label: 'Notification Settings', path: '/notifications' },
    { label: 'Password Manager', path: '/settings/password' },
    { label: 'Delete Account', path: '#', danger: true }
  ];

  return (
    <div className="p-6 pb-24 animate-fade-in min-h-screen">
       <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-f-gray rounded-xl">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
       </div>

       <div className="space-y-4">
          {options.map((opt, i) => (
            <button 
               key={i} 
               onClick={() => opt.path !== '#' && navigate(opt.path)}
               className={`w-full flex justify-between items-center p-5 bg-white border border-f-light rounded-3xl hover:bg-f-gray transition-colors ${opt.danger ? 'text-red-500 border-red-100' : ''}`}
            >
               <span className="font-bold text-sm">{opt.label}</span>
               <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
       </div>
    </div>
  );
};

export default Settings;
