
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToImgbb } from '../../services/imgbb';
import { useNotify } from '../../components/Notifications';

interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  createdAt: number;
}

const ManageBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const notify = useNotify();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageFile: null as File | null
  });

  const fetchBanners = async () => {
    const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner)));
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageFile) return notify("Select an image first", "error");
    
    setUploading(true);
    try {
      const imageUrl = await uploadToImgbb(formData.imageFile);
      await addDoc(collection(db, 'banners'), {
        title: formData.title,
        description: formData.description,
        imageUrl,
        createdAt: Date.now()
      });
      notify("Banner Published!", "success");
      setFormData({ title: '', description: '', imageFile: null });
      fetchBanners();
    } catch (err) {
      notify("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(window.confirm("Remove this banner?")) {
        await deleteDoc(doc(db, 'banners', id));
        notify("Banner Removed", "info");
        fetchBanners();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Banner Management</h1>
        <p className="text-xs text-f-gray font-bold uppercase tracking-widest mt-1">Control Home Screen Visuals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <form onSubmit={handleAdd} className="bg-f-gray p-8 rounded-[40px] border border-f-light space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4">New Campaign</h2>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Headline</label>
              <input 
                type="text" required
                className="w-full bg-white p-4 rounded-2xl outline-none border border-transparent focus:border-black transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Sub-headline</label>
              <input 
                type="text" required
                className="w-full bg-white p-4 rounded-2xl outline-none border border-transparent focus:border-black transition-all"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Asset Upload</label>
              <input 
                type="file" accept="image/*" required
                className="w-full bg-white p-4 rounded-2xl outline-none text-xs"
                onChange={e => setFormData({...formData, imageFile: e.target.files?.[0] || null})}
              />
            </div>

            <button 
                disabled={uploading}
                className="btn-primary w-full shadow-lg shadow-black/10 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Publish Banner"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Active Carousel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map(banner => (
              <div key={banner.id} className="group relative bg-f-gray rounded-[40px] overflow-hidden border border-f-light shadow-sm">
                <img src={banner.imageUrl} className="w-full h-48 object-cover" alt="" />
                <div className="p-6">
                   <h3 className="font-bold text-sm truncate">{banner.title}</h3>
                   <p className="text-[10px] text-f-gray font-bold uppercase tracking-tight mt-1 truncate">{banner.description}</p>
                   <button 
                      onClick={() => handleDelete(banner.id)}
                      className="mt-4 text-[10px] font-bold uppercase text-red-500 underline"
                   >
                      Remove Asset
                   </button>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
                <div className="col-span-2 py-20 bg-f-gray rounded-[40px] flex flex-col items-center opacity-30">
                    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-xs font-bold uppercase">No Banners Active</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBanners;
