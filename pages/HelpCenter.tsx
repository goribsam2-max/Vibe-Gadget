
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HelpCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('FAQ');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    { q: 'How do I track my gadget delivery?', a: 'You can track your order in the "Purchase History" section of your profile. Once shipped, a tracking ID will be visible.' },
    { q: 'What is the warranty on Vibe products?', a: 'Most accessories come with a 6-month replacement warranty. Gadgets like smartwatches have a 1-year brand warranty.' },
    { q: 'How do I pay via bKash/Nagad?', a: 'During checkout, select your preferred provider. You can choose to pay the delivery charge in advance or the full amount.' },
    { q: 'Can I return an accessory if it doesn\'t fit?', a: 'Yes, we have a 3-day return policy if the product is in its original packaging and unused.' },
    { q: 'Is cash on delivery available?', a: 'Yes, we offer COD nationwide. However, for some high-value gadgets, a small partial payment might be required.' }
  ];

  const contactOptions = [
    { label: 'Customer Hotline', svg: <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />, action: () => window.open('tel:01747708843') },
    { label: 'WhatsApp Support', svg: <path d="M2 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c-1.707 0-3.305-.426-4.704-1.175L2 22l1.175-5.296A9.963 9.963 0 012 12z" />, action: () => window.open('https://wa.me/8801747708843') },
    { label: 'Vibe Facebook Page', svg: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" />, action: () => window.open('https://facebook.com') }
  ];

  return (
    <div className="p-6 pb-24 animate-fade-in bg-white max-w-md mx-auto min-h-screen">
       <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Support Desk</h1>
       </div>

       <div className="flex bg-f-gray p-1.5 rounded-[24px] mb-8">
          {['FAQ', 'Contact'].map(tab => (
             <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold rounded-2xl transition-all ${activeTab === tab ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}
             >
                {tab}
             </button>
          ))}
       </div>

       {activeTab === 'FAQ' ? (
         <div className="space-y-4">
            {faqs.map((faq, i) => (
               <div key={i} className="border border-f-light rounded-[32px] overflow-hidden transition-all bg-white">
                  <button 
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full p-6 flex justify-between items-center text-left"
                  >
                    <span className="text-xs font-bold leading-relaxed">{faq.q}</span>
                    <svg className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${expandedFaq === i ? 'rotate-180 text-black' : ''}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  <div className={`px-6 transition-all duration-300 overflow-hidden ${expandedFaq === i ? 'pb-6 max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-xs text-f-gray leading-relaxed font-medium">{faq.a}</p>
                  </div>
               </div>
            ))}
         </div>
       ) : (
         <div className="space-y-4">
            {contactOptions.map((opt, i) => (
               <div 
                  key={i} 
                  onClick={opt.action}
                  className="p-6 bg-white border border-f-light rounded-[32px] flex justify-between items-center hover:bg-f-gray cursor-pointer transition-colors shadow-sm active:scale-95 transition-transform"
               >
                  <div className="flex items-center space-x-4">
                     <div className="w-10 h-10 bg-f-gray rounded-2xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{opt.svg}</svg>
                     </div>
                     <span className="text-xs font-bold tracking-tight">{opt.label}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-200" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
               </div>
            ))}
         </div>
       )}
    </div>
  );
};

export default HelpCenter;
