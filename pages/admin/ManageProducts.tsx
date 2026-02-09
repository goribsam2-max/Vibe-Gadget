
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToImgbb } from '../../services/imgbb';
import { useNotify } from '../../components/Notifications';
import { Product } from '../../types';

const ManageProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    category: 'Cases',
    stock: 10,
    imageFile: null as File | null
  });

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, 'products'));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageFile) return notify("Please select an image", "error");
    
    setLoading(true);
    try {
      const imageUrl = await uploadToImgbb(formData.imageFile);
      const productData = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category,
        stock: Number(formData.stock),
        image: imageUrl,
        rating: 4.5,
      };
      await addDoc(collection(db, 'products'), productData);
      notify("Product added!", "success");
      setIsAdding(false);
      fetchProducts();
    } catch (err) {
      notify("Failed to add product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this product?")) {
      await deleteDoc(doc(db, 'products', id));
      notify("Deleted", "info");
      fetchProducts();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#1F2029] text-white px-6 py-2 rounded-xl font-bold"
        >
          {isAdding ? "Cancel" : "Add New Product"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm mb-12 space-y-4 max-w-2xl mx-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input 
              type="text" className="w-full p-4 bg-gray-50 rounded-xl" required
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (৳)</label>
              <input 
                type="number" className="w-full p-4 bg-gray-50 rounded-xl" required
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input 
                type="number" className="w-full p-4 bg-gray-50 rounded-xl" required
                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select 
              className="w-full p-4 bg-gray-50 rounded-xl"
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option>Cases</option>
              <option>Chargers</option>
              <option>Headphones</option>
              <option>Smartwatches</option>
              <option>Gadgets</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <input 
              type="file" className="w-full p-4 bg-gray-50 rounded-xl" accept="image/*"
              onChange={e => setFormData({...formData, imageFile: e.target.files?.[0] || null})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              className="w-full p-4 bg-gray-50 rounded-xl h-24"
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <button 
            disabled={loading}
            className="w-full py-4 bg-[#704F38] text-white rounded-2xl font-bold disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Publish Product"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-400">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 flex items-center space-x-3">
                  <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                  <span className="font-bold text-sm">{p.name}</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-[#704F38]">৳{p.price}</td>
                <td className="px-6 py-4 text-sm">{p.stock}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProducts;
