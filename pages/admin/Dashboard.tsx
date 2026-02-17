
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const pSnap = await getDocs(collection(db, 'products'));
      const uSnap = await getDocs(collection(db, 'users'));
      const oSnap = await getDocs(collection(db, 'orders'));
      setStats({ products: pSnap.size, users: uSnap.size, orders: oSnap.size });
      const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
      const ordersSnap = await getDocs(qOrders);
      setRecentOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-32 min-h-screen bg-[#FDFDFD]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate('/')} className="p-4 bg-zinc-900 text-white rounded-2xl shadow-xl active:scale-90 transition-all"><i className="fas fa-chevron-left text-xs"></i></button>
          <div><h1 className="text-3xl font-black tracking-tighter">Admin Dashboard.</h1></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
        <StatCard title="Products" value={stats.products} color="bg-blue-500" />
        <StatCard title="Users" value={stats.users} color="bg-purple-500" />
        <StatCard title="Orders" value={stats.orders} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 px-2">Management</h3>
           <div className="grid grid-cols-1 gap-4">
              <AdminNavLink to="products" title="Inventory" icon="fas fa-box" />
              <AdminNavLink to="users" title="User Base" icon="fas fa-users" />
              <AdminNavLink to="orders" title="Order Flow" icon="fas fa-shipping-fast" />
              <AdminNavLink to="banners" title="Hero Banners" icon="fas fa-images" />
              <AdminNavLink to="config" title="System Config" icon="fas fa-cogs" />
           </div>
        </div>

        <div className="lg:col-span-2">
           <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-10">Latest Transactions</h3>
              <div className="space-y-6">
                 {recentOrders.map((order, i) => (
                    <div key={order.id} className="flex items-center justify-between p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate(`orders`)}>
                       <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-zinc-200"><i className="fas fa-shopping-bag text-xs"></i></div>
                          <div><p className="text-xs font-bold">{order.customerName}</p><p className="text-[9px] text-zinc-400 uppercase">#{order.id.slice(0,8)}</p></div>
                       </div>
                       <div className="text-right"><p className="text-sm font-black">৳{order.total}</p><p className="text-[8px] font-black text-green-500 uppercase">{order.status}</p></div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }: any) => (
  <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm flex items-center justify-between group hover:shadow-2xl transition-all duration-500">
    <div><p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3">{title}</p><p className="text-4xl font-black text-zinc-900">{value}</p></div>
    <div className={`w-14 h-14 ${color} rounded-[1.8rem] shadow-lg`}></div>
  </div>
);

const AdminNavLink = ({ to, title, icon }: any) => (
  <Link to={to} className="flex items-center justify-between p-6 bg-white border border-zinc-100 rounded-[2rem] hover:bg-zinc-900 group transition-all duration-300">
    <div className="flex items-center space-x-5">
       <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-colors"><i className={`${icon} text-sm text-zinc-400 group-hover:text-white`}></i></div>
       <h4 className="text-sm font-black tracking-tight group-hover:text-white">{title}</h4>
    </div>
    <i className="fas fa-chevron-right text-[10px] text-zinc-200 group-hover:text-white group-hover:translate-x-2 transition-all"></i>
  </Link>
);

export default AdminDashboard;
