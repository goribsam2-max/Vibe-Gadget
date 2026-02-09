
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotify } from '../components/Notifications';

const AuthSelector: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();

  const socialNotice = () => notify("This feature isn’t available in your location", "info");

  return (
    <div className="h-screen flex flex-col p-8 items-center justify-center animate-fade-in text-center bg-white max-w-md mx-auto">
      <div className="w-24 h-24 bg-black rounded-[32px] flex items-center justify-center mb-10 shadow-2xl shadow-black/20">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-10 leading-tight tracking-tighter">Vibe Gadget: Premium Tech Starts Here</h1>
      
      <div className="w-full space-y-4">
        <button onClick={() => navigate('/signup')} className="btn-primary w-full shadow-xl shadow-black/10 uppercase text-xs tracking-widest">Register Node</button>
        <button onClick={() => navigate('/signin')} className="btn-secondary w-full uppercase text-xs tracking-widest">Enter Portal</button>
      </div>
      
      <div className="mt-16 w-full">
         <div className="flex items-center space-x-4 mb-8">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sync via Network</span>
            <div className="flex-1 h-px bg-gray-100"></div>
         </div>
         <div className="flex justify-center space-x-6">
            <button onClick={socialNotice} className="w-14 h-14 bg-f-gray rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm active:scale-90">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            <button onClick={socialNotice} className="w-14 h-14 bg-f-gray rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm active:scale-90">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
            </button>
            <button onClick={socialNotice} className="w-14 h-14 bg-f-gray rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm active:scale-90">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.35 2.219c1.14 0 2.062.925 2.062 2.065 0 1.14-.922 2.065-2.063 2.065-1.14 0-2.062-.925-2.062-2.065 0-1.14.922-2.065 2.063-2.065zM12 24c-6.627 0-12-5.373-12-12s5.373-12 12-12 12 5.373 12 12-5.373 12-12 12z"/></svg>
            </button>
         </div>
         <p className="mt-8 text-[10px] font-bold text-f-gray uppercase tracking-widest opacity-40">System Node: EXPRESS-TERMINAL-01</p>
      </div>
    </div>
  );
};

export default AuthSelector;
