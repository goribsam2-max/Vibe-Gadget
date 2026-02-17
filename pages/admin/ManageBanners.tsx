
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToImgbb } from '../../services/imgbb';
import { useNotify, useConfirm } from '../../components/Notifications';

interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  link?: string;
  createdAt: number;
}

const ManageBanners: React.FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const notify = useNotify();
  const confirm = useConfirm();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    imageFile: null as File | null
  });

  const fetchBanners = async () => {
    const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner)));
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setFormData({ title: banner.title, description: banner.description, link: banner.link || '', imageFile: null });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = '';
      if (formData.imageFile) {
        imageUrl = await uploadToImgbb(formData.imageFile);
      }

      const bannerData: any = {
        title: formData.title,
        description: formData.description,
        link: formData.link
      };

      if (imageUrl) bannerData.imageUrl = imageUrl;

      if (editingId) {
        await updateDoc(doc(db, 'banners', editingId), bannerData);
        notify("Banner updated successfully", "success");
      } else {
        if (!imageUrl) throw new Error("An image is required for new banners");
        bannerData.createdAt = Date.now();
        await addDoc(collection(db, 'banners'), bannerData);
        notify("New banner published", "success");
      }

      setEditingId(null);
      setFormData({ title: '', description: '', link: '', imageFile: null });
      fetchBanners();
    } catch (err: any) {
      notify(err.message || "Failed to save banner", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "Remove Banner?",
      message: "Are you sure you want to remove this banner from the homepage?",
      onConfirm: async () => {
        await deleteDoc(doc(db, 'banners', id));
        notify("Banner removed", "info");
        fetchBanners();
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-[#FDFDFD] min-h-screen pb-32">
      <div className="mb-12 flex items-center space-x-6">
        <button onClick={() => navigate('/admin')} className="p-4 bg-zinc-900 text-white rounded-2xl active:scale-90 transition-all shadow-xl">
           <i className="fas fa-chevron-left text-xs"></i>
        </button>
        <div>
           <h1 className="text-3xl md:text-5xl font-black tracking-tighter">Banners.</h1>
           <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Homepage Visual Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <form onSubmit={handleAdd} className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 space-y-8 shadow-sm sticky top-10">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">{editingId ? 'Edit' : 'Create New'} Banner</h2>
            
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-3 px-1">Main Title</label>
              <input 
                type="text" required
                placeholder="e.g. Smart Watch Sale"
                className="w-full bg-zinc-50 p-5 rounded-2xl outline-none focus:ring-1 focus:ring-black transition-all font-bold shadow-inner"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-3 px-1">Description</label>
              <input 
                type="text" required
                placeholder="e.g. Up to 50% Off"
                className="w-full bg-zinc-50 p-5 rounded-2xl outline-none focus:ring-1 focus:ring-black transition-all font-medium text-sm shadow-inner"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-3 px-1">Action Link (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. /product/123 or /all-products"
                className="w-full bg-zinc-50 p-5 rounded-2xl outline-none focus:ring-1 focus:ring-black transition-all font-medium text-sm shadow-inner"
                value={formData.link}
                onChange={e => setFormData({...formData, link: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-3 px-1">Banner Image</label>
              <input 
                type="file" accept="image/*"
                className="w-full bg-zinc-50 p-5 rounded-2xl outline-none text-[10px] font-bold uppercase shadow-inner cursor-pointer"
                onChange={e => setFormData({...formData, imageFile: e.target.files?.[0] || null})}
              />
            </div>

            <button 
                disabled={uploading}
                className="btn-primary w-full shadow-2xl disabled:opacity-50 text-[10px] uppercase tracking-widest py-6 rounded-[1.5rem]"
            >
              {uploading ? "Uploading..." : (editingId ? "Update Banner" : "Create Banner")}
            </button>
            {editingId && (
              <button 
                onClick={() => { setEditingId(null); setFormData({title: '', description: '', link: '', imageFile: null}); }} 
                className="w-full text-[10px] font-black uppercase text-zinc-400 tracking-widest mt-2 hover:text-black transition-colors"
              >
                Cancel Editing
              </button>
            )}
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {banners.map(banner => (
              <div key={banner.id} className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-sm transition-all hover:shadow-2xl">
                <div className="h-56 relative">
                  <img src={banner.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                     <button onClick={() => handleEdit(banner)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"><i className="fas fa-pen text-black"></i></button>
                     <button onClick={() => handleDelete(banner.id)} className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"><i className="fas fa-trash text-white"></i></button>
                  </div>
                </div>
                <div className="p-8">
                   <h3 className="font-black text-lg tracking-tight mb-2">{banner.title}</h3>
                   <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-4">{banner.description}</p>
                   {banner.link && <p className="text-[10px] font-mono text-zinc-300">Link: {banner.link}</p>}
                </div>
              </div>
            ))}
            {banners.length === 0 && <div className="col-span-full py-32 text-center text-zinc-300 font-black uppercase tracking-widest">No banners active</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBanners;
