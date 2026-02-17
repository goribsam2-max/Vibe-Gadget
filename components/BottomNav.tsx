
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const links = [
    { to: '/', icon: 'fas fa-home', label: 'Home' },
    { to: '/wishlist', icon: 'fas fa-heart', label: 'Saved' },
    { to: '/cart', icon: 'fas fa-shopping-bag', label: 'Cart' },
    { to: '/profile', icon: 'fas fa-user', label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 w-full flex justify-center z-[100] pointer-events-none px-6">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="glass-dark px-1.5 py-1.5 flex justify-between items-center rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.35)] pointer-events-auto min-w-[260px] max-w-sm border border-white/10"
      >
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={`relative flex flex-col items-center justify-center flex-1 py-2 rounded-full transition-all duration-300 ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-white/10 rounded-[2rem] z-0 border border-white/5"
                  transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                />
              )}
              <i className={`${link.icon} text-base relative z-10 transition-transform ${isActive ? 'scale-110 mb-0.5' : 'mb-0'}`}></i>
              <span className={`text-[7px] font-black uppercase tracking-widest relative z-10 transition-all ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 h-0 overflow-hidden'}`}>
                {link.label}
              </span>
            </NavLink>
          );
        })}
      </motion.div>
    </div>
  );
};

export default BottomNav;
