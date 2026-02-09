
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const pSnap = await getDocs(collection(db, 'products'));
      const uSnap = await getDocs(collection(db, 'users'));
      const oSnap = await getDocs(collection(db, 'orders'));
      setStats({
        products: pSnap.size,
        users: uSnap.size,
        orders: oSnap.size
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-gray-500">Logged in as: admin@vibe.shop</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <AdminCard title="Total Products" value={stats.products} color="bg-black" icon="📦" />
        <AdminCard title="Total Users" value={stats.users} color="bg-black" icon="👥" />
        <AdminCard title="Total Orders" value={stats.orders} color="bg-black" icon="🚚" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-f-light">
          <h2 className="text-xl font-bold mb-6">Management</h2>
          <div className="grid grid-cols-2 gap-4">
            <ActionLink to="/admin/products" title="Products" desc="Add/Edit Products" icon="✨" />
            <ActionLink to="/admin/users" title="Users" desc="Manage Accounts" icon="🔒" />
            <ActionLink to="/admin/orders" title="Orders" desc="Steadfast Courier" icon="🚛" />
            <ActionLink to="/admin/banners" title="Banners" desc="Home Banners" icon="🖼️" />
          </div>
        </div>
        
        <div className="bg-[#1F2029] text-white p-8 rounded-3xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">System Overview</h2>
          <p className="opacity-70 mb-6 text-sm">Real-time connection with Steadfast Courier is active. Manage all store settings from here.</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
               <span className="text-xs font-bold uppercase tracking-widest opacity-40">System Status</span>
               <span className="text-xs px-3 py-1 bg-green-500 rounded-full font-bold">Live</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
               <span className="text-xs font-bold uppercase tracking-widest opacity-40">Store Access</span>
               <span className="text-xs font-bold">Verified</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-xs font-bold uppercase tracking-widest opacity-40">Courier API</span>
               <span className="text-xs font-mono opacity-60">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminCard = ({ title, value, color, icon }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm flex items-center space-x-4 border border-f-light">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-2xl shadow-lg text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const ActionLink = ({ to, title, desc, icon }: any) => (
  <Link to={to} className="p-5 border border-f-light rounded-2xl hover:border-black hover:bg-f-gray transition-all">
    <span className="text-2xl block mb-2">{icon}</span>
    <h3 className="font-bold text-sm">{title}</h3>
    <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">{desc}</p>
  </Link>
);

export default AdminDashboard;
