
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500',
    title: 'The Gadget Hub That Empowers Your Tech Life',
    desc: 'Discover premium mobile accessories, cutting-edge gadgets, and exclusive audio gear.'
  },
  {
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=500',
    title: 'Seamless Shopping for Modern Tech',
    desc: 'Browse, compare, and order your favorite tech essentials with a single tap.'
  },
  {
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=500',
    title: 'Swift and Secure Express Delivery',
    desc: 'Fast shipping across Bangladesh. Get your gadgets delivered safely to your doorstep.'
  }
];

const Onboarding: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleFinish = () => {
    localStorage.setItem('vibe_onboarded', 'true');
    onFinish();
    navigate('/auth-selector');
  };

  const next = () => {
    if (current === slides.length - 1) {
      handleFinish();
    } else {
      setCurrent(current + 1);
    }
  };

  return (
    <div className="h-screen flex flex-col p-8 animate-fade-in bg-white max-w-md mx-auto">
      <div className="flex justify-end">
        <button onClick={handleFinish} className="text-sm font-bold uppercase tracking-widest text-black opacity-40 hover:opacity-100 transition-opacity">Skip</button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-full aspect-[4/5] bg-f-gray rounded-[48px] mb-10 overflow-hidden relative shadow-2xl shadow-black/5">
          <img src={slides[current].image} className="w-full h-full object-cover" alt="" />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black/10 backdrop-blur rounded-full"></div>
        </div>
        
        <h1 className="text-2xl font-bold mb-4 leading-tight tracking-tight px-2">{slides[current].title}</h1>
        <p className="text-f-gray text-xs leading-relaxed mb-12 px-6">{slides[current].desc}</p>
        
        <div className="flex space-x-2 mb-10">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-black' : 'w-2 bg-gray-200'}`}></div>
          ))}
        </div>
      </div>

      <button onClick={next} className="btn-primary w-full shadow-2xl shadow-black/10">
        {current === slides.length - 1 ? "Get Started" : "Continue"}
      </button>
      
      {current === 0 && (
        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-f-gray">
          Already a member? <button onClick={() => navigate('/signin')} className="text-black underline">Sign In</button>
        </p>
      )}
    </div>
  );
};

export default Onboarding;
