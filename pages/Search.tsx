
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const recent = ['iPhone 15 Pro Case', 'Magsafe Charger', 'AirPods Pro 2', 'Smart Watch Ultra', 'Power Bank 20000mAh'];
  const categories = ['Mobile', 'Accessories', 'Gadgets', 'Audio', 'Chargers'];

  return (
    <div className="p-6 animate-fade-in min-h-screen bg-white max-w-md mx-auto">
       <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <div className="relative flex-1">
             <input 
                autoFocus
                type="text" 
                placeholder="Find gadgets..." 
                className="w-full bg-f-gray py-4 pl-12 pr-4 rounded-2xl text-sm border border-transparent focus:border-black transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
             />
             <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196 7.5 7.5 0 0010.607 10.607z" /></svg>
          </div>
       </div>

       <div className="mb-10">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Categories</h3>
          <div className="flex flex-wrap gap-2">
             {categories.map(cat => (
                <button key={cat} className="px-5 py-2.5 bg-f-gray rounded-2xl text-xs font-bold hover:bg-black hover:text-white transition-all">{cat}</button>
             ))}
          </div>
       </div>

       <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Searches</h3>
          <button className="text-[10px] font-bold text-black underline uppercase tracking-widest opacity-40 hover:opacity-100">Clear</button>
       </div>

       <div className="space-y-4">
          {recent.map((item, i) => (
             <div key={i} className="flex justify-between items-center group cursor-pointer">
                <div className="flex items-center space-x-3">
                   <svg className="w-4 h-4 text-gray-300 group-hover:text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <span className="text-sm font-bold text-f-gray group-hover:text-black transition-colors">{item}</span>
                </div>
                <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
          ))}
       </div>
    </div>
  );
};

export default Search;
