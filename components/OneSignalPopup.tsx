import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';

const OneSignalPopup: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show popup if user is logged in and hasn't seen it in this session
    const checkStatus = () => {
      const isLogged = !!auth.currentUser;
      const alreadyShown = sessionStorage.getItem('vibe_notif_prompt_shown');
      
      if (isLogged && !alreadyShown) {
        // Delay slightly for better UX
        setTimeout(() => setShow(true), 2000);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) checkStatus();
    });

    return () => unsubscribe();
  }, []);

  const handleAllow = () => {
    sessionStorage.setItem('vibe_notif_prompt_shown', 'true');
    setShow(false);
    
    // Trigger OneSignal SDK
    const OneSignal = (window as any).OneSignal;
    if (OneSignal) {
      OneSignal.Notifications.requestPermission();
    }
  };

  const handleCancel = () => {
    sessionStorage.setItem('vibe_notif_prompt_shown', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-8 animate-fade-in">
      <div className="bg-white rounded-[40px] p-8 w-full max-w-xs shadow-2xl border border-white/20 text-center">
        <div className="w-20 h-20 bg-f-gray rounded-[30px] flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
           🔔
        </div>
        <h3 className="text-xl font-bold mb-2 tracking-tight">Stay Synced!</h3>
        <p className="text-[11px] text-f-gray font-medium leading-relaxed mb-8 px-2">
          Enable push notifications to receive real-time order tracking and exclusive tech drops.
        </p>
        <div className="space-y-3">
           <button 
              onClick={handleAllow}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all shadow-xl shadow-black/10"
           >
              Allow Alerts
           </button>
           <button 
              onClick={handleCancel}
              className="w-full py-4 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] active:scale-[0.98]"
           >
              Maybe Later
           </button>
        </div>
      </div>
    </div>
  );
};

export default OneSignalPopup;