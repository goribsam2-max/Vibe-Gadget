
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToImgbb } from '../../services/imgbb';
import { useNotify, useConfirm } from '../../components/Notifications';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        notify("Product updated successfully", "success");
      } else {
        productData.rating = 5;
        productData.numReviews = 0;
        await addDoc(collection(db, 'products'), productData);
        notify("Product added to catalog", "success");
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', price: 0, description: '', category: 'Mobile', stock: 10, imageFiles: [] });
      fetchProducts();
    } catch (err: any) {
      notify(err.message || "Failed to save product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "Delete Product?",
      message: "This product will be permanently removed from the store.",
      onConfirm: async () => {
        await deleteDoc(doc(db, 'products', id));
        notify("Product deleted", "info");
        fetchProducts();
      }
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 pb-32 min-h-screen bg-[#FDFDFD]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div className="flex items-center space-x-6">
           <button onClick={() => navigate('/admin')} className="p-4 bg-zinc-900 text-white rounded-2xl shadow-xl active:scale-90 transition-all">
             <i className="fas fa-chevron-left text-xs"></i>
           </button>
           <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter">Products.</h1>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Catalog Management</p>
           </div>
        </div>
        <button 
          onClick={() => { setIsAdding(!isAdding); setEditingId(null); setFormData({ name: '', price: 0, description: '', category: 'Mobile', stock: 10, imageFiles: [] }); }}
          className={`px-8 py-5 rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${isAdding ? 'bg-red-500 text-white' : 'bg-black text-white'}`}
        >
          {isAdding ? "Cancel Action" : "Add New Product"}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit} 
            className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm mb-16 space-y-10 max-w-4xl mx-auto border border-zinc-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 px-1">Product Name</label>
                <input 
                  type="text" className="w-full p-5 bg-zinc-50 rounded-[1.5rem] outline-none border border-transparent focus:border-black transition-all font-bold shadow-inner" required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 px-1">Category</label>
                <select 
                  className="w-full p-5 bg-zinc-50 rounded-[1.5rem] outline-none border border-transparent focus:border-black transition-all font-bold shadow-inner cursor-pointer"
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
            
            <div className="grid grid-cols-2 gap-10">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 px-1">Price (৳)</label>
                <input 
                  type="number" className="w-full p-5 bg-zinc-50 rounded-[1.5rem] outline-none border border-transparent focus:border-black transition-all font-black shadow-inner" required
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 px-1">Stock Amount</label>
                <input 
                  type="number" className="w-full p-5 bg-zinc-50 rounded-[1.5rem] outline-none border border-transparent focus:border-black transition-all font-black shadow-inner" required
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 px-1">Upload Images (One or More)</label>
              <input 
                type="file" className="w-full p-6 bg-zinc-50 rounded-[2rem] outline-none text-[11px] font-black uppercase shadow-inner border border-dashed border-zinc-200 cursor-pointer" accept="image/*" multiple
                onChange={e => { if (e.target.files) setFormData({...formData, imageFiles: Array.from(e.target.files)}); }}
              />
              {editingId && <p className="text-[10px] text-zinc-300 mt-4 font-bold px-1">Leave empty to keep existing images.</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 px-1">Product Description</label>
              <textarea 
                className="w-full p-8 bg-zinc-50 rounded-[2rem] h-44 outline-none border border-transparent focus:border-black transition-all shadow-inner leading-relaxed text-sm font-medium"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl disabled:opacity-50 transition-all"
            >
              {loading ? "Processing..." : (editingId ? "Update Product" : "Save Product")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
        {products.map(p => (
          <motion.div 
            layout
            key={p.id} 
            className="bg-white rounded-[2.5rem] p-5 flex flex-col relative group border border-zinc-100 shadow-sm transition-all hover:shadow-2xl"
          >
             <div className="aspect-square rounded-[2rem] overflow-hidden mb-5 bg-zinc-50 p-4 shadow-inner flex items-center justify-center">
                <img src={p.image} className="w-full h-full object-contain rounded-[1.5rem]" alt="" />
             </div>
             <div className="px-1">
                <h4 className="font-bold text-xs truncate mb-1.5">{p.name}</h4>
                <div className="flex justify-between items-center">
                   <p className="text-sm font-black text-zinc-900">৳{p.price}</p>
                   <p className="text-[10px] font-bold text-zinc-300 uppercase">Qty: {p.stock}</p>
                </div>
             </div>
             
             <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center space-y-4 opacity-0 group-hover:opacity-100 transition-all rounded-[2.5rem]">
                <button onClick={() => handleEdit(p)} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 active:scale-90 transition-all shadow-xl">
                   <i className="fas fa-pen"></i>
                </button>
                <button onClick={() => handleDelete(p.id)} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-all shadow-xl">
                   <i className="fas fa-trash"></i>
                </button>
             </div>
          </motion.div>
        ))}
        {products.length === 0 && (
           <div className="col-span-full py-40 text-center text-zinc-300 font-black uppercase tracking-[0.4em]">Store inventory empty</div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
