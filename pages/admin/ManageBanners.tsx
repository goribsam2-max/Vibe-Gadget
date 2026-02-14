
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
    setFormData({ title: banner.title, description: banner.description, imageFile: null });
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
      };

      if (imageUrl) bannerData.imageUrl = imageUrl;

      if (editingId) {
        await updateDoc(doc(db, 'banners', editingId), bannerData);
        notify("Campaign updated!", "success");
      } else {
        if (!imageUrl) throw new Error("A visual asset is mandatory for new campaigns");
        bannerData.createdAt = Date.now();
        await addDoc(collection(db, 'banners'), bannerData);
        notify("Campaign launched!", "success");
      }

      setEditingId(null);
      setFormData({ title: '', description: '', imageFile: null });
      fetchBanners();
    } catch (err) {
      notify("Logistics failure", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "Remove Campaign?",
      message: "This visual will be cleared from the active billboard.",
      onConfirm: async () => {
        await deleteDoc(doc(db, 'banners', id));
        notify("Campaign archived", "info");
        fetchBanners();
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white min-h-screen">
      <div className="mb-12 flex items-center space-x-6">
        <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl active:scale-90 transition-all shadow-sm">
           <i className="fas fa-chevron-left text-sm"></i>
        </button>
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Campaign Billboard</h1>
           <p className="text-xs text-f-gray font-bold uppercase tracking-[2px] mt-1">Billboard content distribution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <form onSubmit={handleAdd} className="bg-f-gray p-10 rounded-[48px] border border-f-light space-y-8 animate-fade-in shadow-sm sticky top-10">
            <h2 className="text-xs font-bold uppercase tracking-[4px] mb-4 opacity-40">{editingId ? 'Modify' : 'Initialize'} Entry</h2>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3 px-2 tracking-widest">Header Headline</label>
              <input 
                type="text" required
                placeholder="Summer Drop 2024"
                className="w-full bg-white p-5 rounded-3xl outline-none focus:ring-1 focus:ring-black transition-all font-bold shadow-inner"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3 px-2 tracking-widest">Supporting Text</label>
              <input 
                type="text" required
                placeholder="The future is now."
                className="w-full bg-white p-5 rounded-3xl outline-none focus:ring-1 focus:ring-black transition-all font-medium text-sm shadow-inner"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3 px-2 tracking-widest">Visual Asset</label>
              <input 
                type="file" accept="image/*"
                className="w-full bg-white p-5 rounded-3xl outline-none text-[10px] shadow-inner"
                onChange={e => setFormData({...formData, imageFile: e.target.files?.[0] || null})}
              />
            </div>

            <button 
                disabled={uploading}
                className="btn-primary w-full shadow-2xl shadow-black/10 disabled:opacity-50 text-[10px] uppercase tracking-[3px] active:scale-95 py-5"
            >
              {uploading ? "Deploying Assets..." : (editingId ? "Commit Updates" : "Deploy Billboard")}
            </button>
            {editingId && (
              <button 
                onClick={() => { setEditingId(null); setFormData({title: '', description: '', imageFile: null}); }} 
                className="w-full text-[9px] font-bold uppercase text-f-gray tracking-[2px] mt-2 hover:text-black transition-colors"
              >
                Abort Changes
              </button>
            )}
          </form>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {banners.map(banner => (
              <div key={banner.id} className="group relative bg-f-gray rounded-[48px] overflow-hidden border border-f-light shadow-sm transition-all hover:shadow-2xl">
                <img src={banner.imageUrl} className="w-full h-56 object-cover transition-transform group-hover:scale-110 duration-700" alt="" />
                <div className="p-10">
                   <h3 className="font-bold text-sm truncate tracking-tight">{banner.title}</h3>
                   <p className="text-[10px] text-f-gray font-bold uppercase tracking-widest mt-3 truncate opacity-50">{banner.description}</p>
                   
                   <div className="flex space-x-6 mt-8">
                      <button onClick={() => handleEdit(banner)} className="text-[10px] font-bold uppercase text-black underline tracking-[2px] hover:opacity-70">Edit</button>
                      <button onClick={() => handleDelete(banner.id)} className="text-[10px] font-bold uppercase text-red-500 underline tracking-[2px] hover:opacity-70">Delete</button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBanners;
