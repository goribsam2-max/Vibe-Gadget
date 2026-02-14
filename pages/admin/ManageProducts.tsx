
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToImgbb } from '../../services/imgbb';
import { useNotify, useConfirm } from '../../components/Notifications';
import { Product } from '../../types';

const ManageProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();
  const confirm = useConfirm();

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    category: 'Mobile',
    stock: 10,
    imageFiles: [] as File[]
  });

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, 'products'));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock,
      imageFiles: []
    });
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrls: string[] = [];
      if (formData.imageFiles.length > 0) {
        for (const file of formData.imageFiles) {
          const url = await uploadToImgbb(file);
          imageUrls.push(url);
        }
      }

      const productData: any = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category,
        stock: Number(formData.stock),
      };

      if (imageUrls.length > 0) {
        productData.image = imageUrls[0];
        productData.images = imageUrls;
      }

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        notify("Product updated!", "success");
      } else {
        productData.rating = 5;
        productData.numReviews = 0;
        await addDoc(collection(db, 'products'), productData);
        notify("Product published!", "success");
      }

      setIsAdding(false);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      notify("Failed to save product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "Delete Product?",
      message: "This will permanently remove the item from the catalog.",
      onConfirm: async () => {
        await deleteDoc(doc(db, 'products', id));
        notify("Item deleted", "info");
        fetchProducts();
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center space-x-6">
           <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl active:scale-90 transition-all shadow-sm">
             <i className="fas fa-chevron-left text-sm"></i>
           </button>
           <h1 className="text-3xl font-bold tracking-tight">Catalog Hub</h1>
        </div>
        <button 
          onClick={() => { setIsAdding(!isAdding); setEditingId(null); }}
          className="bg-black text-white px-8 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-[2px] shadow-xl shadow-black/20 active:scale-95 transition-all"
        >
          {isAdding ? "Cancel Entry" : "New Item +"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-f-gray p-10 rounded-[48px] shadow-sm mb-12 space-y-8 max-w-3xl mx-auto border border-f-light animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Item Name</label>
              <input 
                type="text" className="w-full p-5 bg-white rounded-3xl outline-none focus:ring-1 focus:ring-black shadow-inner font-medium" required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Classification</label>
              <select 
                className="w-full p-5 bg-white rounded-3xl outline-none focus:ring-1 focus:ring-black shadow-inner font-bold uppercase text-xs"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>Mobile</option>
                <option>Accessories</option>
                <option>Gadgets</option>
                <option>Chargers</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Pricing (৳)</label>
              <input 
                type="number" className="w-full p-5 bg-white rounded-3xl outline-none focus:ring-1 focus:ring-black shadow-inner font-bold" required
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Inventory Stock</label>
              <input 
                type="number" className="w-full p-5 bg-white rounded-3xl outline-none focus:ring-1 focus:ring-black shadow-inner font-bold" required
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Visual Content (Multiple)</label>
            <input 
              type="file" className="w-full p-5 bg-white rounded-3xl outline-none text-xs shadow-inner" accept="image/*" multiple
              onChange={e => {
                if (e.target.files) {
                  setFormData({...formData, imageFiles: Array.from(e.target.files)});
                }
              }}
            />
            {editingId && <p className="text-[9px] text-f-gray mt-3 uppercase font-bold tracking-widest opacity-40">* Leave empty to retain current visual data</p>}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Product Narrative</label>
            <textarea 
              className="w-full p-6 bg-white rounded-[32px] h-40 outline-none focus:ring-1 focus:ring-black shadow-inner leading-relaxed text-sm"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-6 bg-black text-white rounded-[28px] font-bold uppercase tracking-[3px] text-xs disabled:opacity-50 shadow-2xl shadow-black/20 active:scale-95 transition-transform"
          >
            {loading ? "Processing Data Hub..." : (editingId ? "Update System Entry" : "Establish New Entry")}
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {products.map(p => (
          <div key={p.id} className="bg-f-gray rounded-[40px] p-6 flex flex-col relative group overflow-hidden border border-f-light shadow-sm transition-all hover:shadow-xl">
             <div className="aspect-square rounded-[32px] overflow-hidden mb-5 bg-white p-3 shadow-inner">
                <img src={p.image} className="w-full h-full object-contain" alt="" />
             </div>
             <h4 className="font-bold text-xs truncate mb-2 px-1">{p.name}</h4>
             <p className="text-[10px] font-bold text-black opacity-40 uppercase tracking-tighter px-1">৳{p.price}</p>
             
             <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center space-x-5 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleEdit(p)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black hover:scale-110 active:scale-90 transition-transform">
                   <i className="fas fa-pen-nib text-sm"></i>
                </button>
                <button onClick={() => handleDelete(p.id)} className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-transform shadow-lg shadow-red-500/30">
                   <i className="fas fa-trash-alt text-sm"></i>
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProducts;
