
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useNotify } from '../components/Notifications';

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const notify = useNotify();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() } as Product);
    };
    fetchProduct();
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('f_cart') || '[]');
    // Check if product already in cart
    const existingIndex = cart.findIndex((item: any) => item.id === product?.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('f_cart', JSON.stringify(cart));
    notify("Added to cart!", "success");
    navigate('/cart');
  };

  if (!product) return (
    <div className="h-screen flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-24">
      <div className="relative aspect-square bg-f-gray">
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-10 p-3 bg-white/40 backdrop-blur-md rounded-2xl text-black shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <button className="absolute top-6 right-6 z-10 p-3 bg-white/40 backdrop-blur-md rounded-2xl text-black shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
        </button>
        <img src={product.image} className="w-full h-full object-contain p-8" alt={product.name} />
      </div>

      <div className="px-6 py-8">
        <div className="flex justify-between items-start mb-6">
           <div>
              <p className="text-[10px] text-f-gray font-bold uppercase tracking-widest mb-2">{product.category}</p>
              <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
           </div>
           <div className="flex flex-col items-end">
              <div className="flex items-center text-sm font-bold bg-f-gray px-3 py-1.5 rounded-xl">
                 <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                 {product.rating}
              </div>
              <p className="text-[10px] text-green-500 font-bold mt-2 uppercase tracking-tighter">In Stock: {product.stock}</p>
           </div>
        </div>

        <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-f-gray mb-3">Product Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description || "No description provided for this premium gadget."}
            </p>
        </div>

        <div className="flex items-center justify-between border-t border-f-light pt-8">
           <div>
              <p className="text-[10px] text-f-gray font-bold uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-2xl font-bold">৳{product.price}</p>
           </div>
           <button onClick={addToCart} className="btn-primary flex items-center space-x-3 px-10 shadow-2xl shadow-black/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" /></svg>
              <span>Add to Cart</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
