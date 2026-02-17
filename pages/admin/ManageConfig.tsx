
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNotify } from '../../components/Notifications';
import { motion, AnimatePresence } from 'framer-motion';

const ManageConfig: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('firebase');

  const [configs, setConfigs] = useState({
    firebaseApiKey: "AIzaSyC1vnVFbzezdpqAxjU5GXgAxu63DN05eyE",
    telegramToken: "8236254617:AAFFTI9j4pl6U-8-pdJgZigWb2M75oBmyzg",
    telegramChatId: "5494141897",
    oneSignalAppId: "29c39d8a-7be8-404a-8a33-5616086735fa",
    oneSignalApiKey: "",
    googleClientId: "",
    facebookAppId: "",
    appleServiceId: "",
    googleLogin: true,
    facebookLogin: false,
    appleLogin: false
  });

  useEffect(() => {
    getDoc(doc(db, 'settings', 'platform')).then((snap) => {
      if (snap.exists()) {
        setConfigs(prev => ({ ...prev, ...snap.data() }));
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'platform'), configs);
      notify("Settings saved successfully", "success");
    } catch (e) {
      notify("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 pb-48 min-h-screen bg-white font-inter">
      <div className="mb-12 flex items-center space-x-6">
        <button onClick={() => navigate('/admin')} className="p-3 bg-zinc-100 rounded-xl hover:bg-black hover:text-white transition-all">
          <i className="fas fa-arrow-left text-sm"></i>
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">App Settings</h1>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Manage Connections and Keys</p>
        </div>
      </div>

      <div className="space-y-4 mb-12">
        <AccordionSection 
          id="firebase" 
          title="Firebase Settings" 
          icon="fas fa-fire" 
          expanded={expandedSection === 'firebase'} 
          onToggle={() => setExpandedSection(expandedSection === 'firebase' ? null : 'firebase')}
        >
           <Field label="API Key" value={configs.firebaseApiKey} onChange={(v: string) => setConfigs({...configs, firebaseApiKey: v})} />
        </AccordionSection>

        <AccordionSection 
          id="onesignal" 
          title="Notification Settings" 
          icon="fas fa-bell" 
          expanded={expandedSection === 'onesignal'} 
          onToggle={() => setExpandedSection(expandedSection === 'onesignal' ? null : 'onesignal')}
        >
           <Field label="OneSignal App ID" value={configs.oneSignalAppId} onChange={(v: string) => setConfigs({...configs, oneSignalAppId: v})} />
           <Field label="REST API Key" value={configs.oneSignalApiKey} onChange={(v: string) => setConfigs({...configs, oneSignalApiKey: v})} placeholder="XXXX" />
        </AccordionSection>

        <AccordionSection 
          id="telegram" 
          title="Telegram Alerts" 
          icon="fab fa-telegram-plane" 
          expanded={expandedSection === 'telegram'} 
          onToggle={() => setExpandedSection(expandedSection === 'telegram' ? null : 'telegram')}
        >
           <Field label="Bot Token" value={configs.telegramToken} onChange={(v: string) => setConfigs({...configs, telegramToken: v})} />
           <Field label="Chat ID" value={configs.telegramChatId} onChange={(v: string) => setConfigs({...configs, telegramChatId: v})} />
        </AccordionSection>

        <AccordionSection 
          id="auth" 
          title="Login Options" 
          icon="fas fa-key" 
          expanded={expandedSection === 'auth'} 
          onToggle={() => setExpandedSection(expandedSection === 'auth' ? null : 'auth')}
        >
           <div className="space-y-8">
              <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                <Toggle label="Google Login" active={configs.googleLogin} onToggle={() => setConfigs({...configs, googleLogin: !configs.googleLogin})} />
                {configs.googleLogin && <div className="mt-4"><Field label="Google Client ID" value={configs.googleClientId} onChange={(v: string) => setConfigs({...configs, googleClientId: v})} placeholder="apps.googleusercontent.com" /></div>}
              </div>
              <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                <Toggle label="Facebook Login" active={configs.facebookLogin} onToggle={() => setConfigs({...configs, facebookLogin: !configs.facebookLogin})} />
                {configs.facebookLogin && <div className="mt-4"><Field label="Facebook App ID" value={configs.facebookAppId} onChange={(v: string) => setConfigs({...configs, facebookAppId: v})} /></div>}
              </div>
              <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                <Toggle label="Apple Login" active={configs.appleLogin} onToggle={() => setConfigs({...configs, appleLogin: !configs.appleLogin})} />
                {configs.appleLogin && <div className="mt-4"><Field label="Apple Service ID" value={configs.appleServiceId} onChange={(v: string) => setConfigs({...configs, appleServiceId: v})} /></div>}
              </div>
           </div>
        </AccordionSection>
      </div>

      <button 
        disabled={saving}
        onClick={handleSave}
        className="w-full py-5 bg-black text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save All Settings'}
      </button>
    </div>
  );
};

const AccordionSection = ({ title, icon, children, expanded, onToggle }: any) => (
  <div className="border border-zinc-100 rounded-2xl overflow-hidden bg-white">
    <button onClick={onToggle} className="w-full px-6 py-5 flex items-center justify-between hover:bg-zinc-50 transition-colors">
      <div className="flex items-center space-x-4">
        <i className={`${icon} text-zinc-400 w-5`}></i>
        <span className="text-sm font-bold">{title}</span>
      </div>
      <i className={`fas fa-chevron-down text-[10px] transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}></i>
    </button>
    <AnimatePresence>
      {expanded && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6 pt-2 space-y-6">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Field = ({ label, value, onChange, placeholder }: any) => (
  <div>
     <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block tracking-widest">{label}</label>
     <input 
        type="text" 
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder} 
        className="w-full bg-zinc-50 p-4 rounded-xl text-sm font-medium outline-none border border-transparent focus:border-zinc-900 transition-all" 
     />
  </div>
);

const Toggle = ({ label, active, onToggle }: any) => (
  <div className="flex justify-between items-center">
     <span className="text-xs font-bold">{label}</span>
     <div 
        onClick={onToggle}
        className={`w-12 h-7 rounded-full transition-all relative cursor-pointer p-1 ${active ? 'bg-black' : 'bg-zinc-200'}`}
     >
        <motion.div 
            animate={{ x: active ? 20 : 0 }}
            className="w-5 h-5 bg-white rounded-full shadow-sm"
        />
     </div>
  </div>
);

export default ManageConfig;
