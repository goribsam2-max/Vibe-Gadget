
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Review } from '../types';
import { useNotify } from '../components/Notifications';

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const notify = useNotify();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) {
        const productData = { id: snap.id, ...snap.data() } as Product;
        setProduct(productData);
        
        // Fetch related products from same category
        const qRelated = query(
            collection(db, 'products'),
            where('category', '==', productData.category),
            limit(6)
        );
        const unsubscribeRelated = onSnapshot(qRelated, (snapshot) => {
            const filtered = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Product))
                .filter(p => p.id !== id);
            setRelatedProducts(filtered);
        });

        return () => unsubscribeRelated();
      }
    };
    fetchProduct();

    if (id) {
      // Removed orderBy from query to avoid missing index error (client-side sort instead)
      const q = query(
        collection(db, 'reviews'), 
        where('productId', '==', id)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reviewList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        // Sort client-side: newest first to handle potential missing index for server-side orderBy
        reviewList.sort((a, b) => b.createdAt - a.createdAt);
        setReviews(reviewList);
      }, (error) => {
        console.error("Reviews snapshot error:", error);
      });
      return () => unsubscribe();
    }
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('f_cart') || '[]');
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
    <div className="animate-fade-in bg-white min-h-screen pb-32 max-w-md mx-auto">
      <div className="relative aspect-square bg-f-gray">
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-10 p-3 bg-white/40 backdrop-blur-md rounded-2xl text-black shadow-sm active:scale-90 transition-transform">
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="absolute top-6 right-6 z-10 p-3 bg-white/40 backdrop-blur-md rounded-2xl text-black shadow-sm active:scale-90 transition-transform">
          <i className="far fa-heart"></i>
        </button>
        <img src={product.image} className="w-full h-full object-contain p-8" alt={product.name} />
      </div>

      <div className="px-6 py-8">
        <div className="flex justify-between items-start mb-6">
           <div>
              <p className="text-[10px] text-f-gray font-bold uppercase tracking-widest mb-2">{product.category}</p>
              <h1 className="text-2xl font-bold tracking-tight mb-1">{product.name}</h1>
              <div className="flex items-center space-x-2">
                 <div className="flex items-center text-xs font-bold bg-f-gray px-2 py-1 rounded-lg">
                    <i className="fas fa-star text-yellow-400 mr-1 text-[8px]"></i>
                    {product.rating}
                 </div>
                 <span className="text-[10px] font-bold text-f-gray uppercase tracking-widest">({product.numReviews || 0} Reviews)</span>
              </div>
           </div>
           <p className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">In Stock: {product.stock}</p>
        </div>

        <div className="mb-10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-f-gray mb-3">Product Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description || "No description provided for this premium gadget."}
            </p>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest">Customer Reviews</h3>
              <button 
                onClick={() => navigate(`/leave-review?productId=${product.id}`)}
                className="text-[10px] font-bold text-black underline uppercase tracking-widest"
              >
                Write Review
              </button>
           </div>

           {reviews.length > 0 ? (
             <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-f-gray p-5 rounded-[32px] border border-f-light">
                     <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-3">
                           <img 
                              src={review.userPhoto || `https://ui-avatars.com/api/?name=${review.userName}&background=fff&color=000`} 
                              className="w-8 h-8 rounded-xl object-cover border border-white" 
                              alt="" 
                           />
                           <div>
                              <p className="text-[11px] font-bold">{review.userName}</p>
                              <p className="text-[8px] text-f-gray uppercase font-bold">{new Date(review.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <div className="flex text-[8px] text-yellow-400">
                           {[...Array(5)].map((_, i) => (
                             <i key={i} className={`${i < review.rating ? 'fas' : 'far'} fa-star mr-0.5`}></i>
                           ))}
                        </div>
                     </div>
                     <p className="text-xs text-gray-600 font-medium leading-relaxed italic">"{review.comment}"</p>
                  </div>
                ))}
             </div>
           ) : (
             <div className="py-10 bg-f-gray rounded-[32px] text-center opacity-40">
                <i className="far fa-comment-dots text-2xl mb-2"></i>
                <p className="text-[10px] font-bold uppercase tracking-widest">No reviews yet</p>
             </div>
           )}
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest">Related Products</h3>
                <Link to="/all-products" state={{ category: product.category }} className="text-[10px] font-bold text-gray-400 uppercase">Explore All</Link>
             </div>
             <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4">
                {relatedProducts.map((p) => (
                    <Link 
                        key={p.id} 
                        to={`/product/${p.id}`}
                        className="min-w-[160px] w-[160px] block animate-fade-in"
                    >
                        <div className="bg-f-gray rounded-[28px] p-3 mb-2 aspect-square flex items-center justify-center overflow-hidden border border-f-light shadow-sm">
                            <img src={p.image} className="w-full h-full object-contain hover:scale-105 transition-transform" alt="" />
                        </div>
                        <h4 className="font-bold text-[11px] truncate mb-0.5">{p.name}</h4>
                        <p className="text-[10px] font-bold text-black opacity-60">৳{p.price}</p>
                    </Link>
                ))}
             </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-f-light pt-6 fixed bottom-0 left-0 right-0 px-6 pb-6 bg-white/95 backdrop-blur-lg z-50 max-w-md mx-auto">
           <div>
              <p className="text-[10px] text-f-gray font-bold uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-2xl font-bold">৳{product.price}</p>
           </div>
           <button onClick={addToCart} className="btn-primary flex items-center space-x-3 px-10 shadow-2xl shadow-black/20 active:scale-95 transition-transform">
              <i className="fas fa-shopping-bag text-sm"></i>
              <span>Add to Cart</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
