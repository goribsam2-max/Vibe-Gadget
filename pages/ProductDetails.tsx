
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Review } from '../types';
import { useNotify } from '../components/Notifications';

// Watermarking helper component
const WatermarkedImage: React.FC<{ src: string; className?: string; alt?: string; onClick?: () => void }> = ({ src, className, alt, onClick }) => {
  const [watermarkedSrc, setWatermarkedSrc] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Add Tiled Watermark
      ctx.rotate(-45 * Math.PI / 180);
      ctx.font = `${Math.floor(img.width / 15)}px Inter`;
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.textAlign = "center";

      const stepX = img.width / 3;
      const stepY = img.height / 3;

      for (let x = -img.width; x < img.width * 2; x += stepX) {
        for (let y = -img.height; y < img.height * 2; y += stepY) {
          ctx.fillText("VibeGadget", x, y);
        }
      }

      setWatermarkedSrc(canvas.toDataURL('image/png'));
    };
  }, [src]);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {watermarkedSrc ? (
        <img src={watermarkedSrc} className={className} alt={alt} onClick={onClick} />
      ) : (
        <div className={`animate-pulse bg-gray-100 ${className}`}></div>
      )}
    </>
  );
};

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null);
  
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
        
        const qRelated = query(
            collection(db, 'products'),
            where('category', '==', productData.category),
            limit(6)
        );
        onSnapshot(qRelated, (snapshot) => {
            const filtered = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Product))
                .filter(p => p.id !== id);
            setRelatedProducts(filtered);
        });
      }
    };
    fetchProduct();

    if (id) {
      const q = query(collection(db, 'reviews'), where('productId', '==', id));
      onSnapshot(q, (snapshot) => {
        const reviewList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        reviewList.sort((a, b) => b.createdAt - a.createdAt);
        setReviews(reviewList);
      });
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

  if (!product) return <div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>;

  const images = product.images || [product.image];

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-32 max-w-5xl mx-auto md:flex md:items-start md:p-10 md:gap-16">
      
      {/* Image Gallery */}
      <div className="md:w-1/2 md:sticky md:top-10">
        <div className="relative aspect-square bg-f-gray rounded-b-[48px] md:rounded-[48px] overflow-hidden shadow-sm group">
          <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-10 p-3 bg-white/40 backdrop-blur-md rounded-2xl text-black shadow-sm active:scale-90 transition-transform md:hidden">
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <WatermarkedImage 
            src={images[activeImg]} 
            className="w-full h-full object-contain p-8 cursor-zoom-in group-hover:scale-105 transition-transform duration-700"
            onClick={() => setFullScreenImg(images[activeImg])}
          />
          
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
              {images.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeImg ? 'w-8 bg-black' : 'w-2 bg-black/20'}`}></div>
              ))}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex justify-center space-x-4 mt-6 px-6">
            {images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImg(i)}
                className={`w-16 h-16 rounded-2xl border-2 p-1 bg-f-gray transition-all ${i === activeImg ? 'border-black scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
              >
                <img src={img} className="w-full h-full object-contain" alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-8 flex-1">
        <div className="mb-10">
           <p className="text-[10px] text-f-gray font-bold uppercase tracking-[0.3em] mb-3">{product.category}</p>
           <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">{product.name}</h1>
           <div className="flex items-center space-x-6">
              <p className="text-3xl font-bold">৳{product.price}</p>
              <div className="flex items-center space-x-2 bg-f-gray px-4 py-2 rounded-2xl">
                 <i className="fas fa-star text-yellow-400 text-xs"></i>
                 <span className="text-xs font-bold">{product.rating}</span>
                 <span className="text-[10px] font-bold text-gray-400 uppercase">({product.numReviews} Reviews)</span>
              </div>
           </div>
        </div>

        <div className="mb-12">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-f-gray mb-4">Description</h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed font-medium">
              {product.description || "Premium gadget designed to elevate your daily tech experience."}
            </p>
        </div>

        {/* Customer Reviews */}
        <div className="mb-12">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Customer Reviews</h3>
              <button onClick={() => navigate(`/leave-review?productId=${product.id}`)} className="text-[10px] font-bold text-black underline uppercase tracking-widest">Write a Review</button>
           </div>

           <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-f-gray p-6 rounded-[40px] border border-f-light animate-fade-in shadow-sm">
                   <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-4">
                         <img src={review.userPhoto || `https://ui-avatars.com/api/?name=${review.userName}`} className="w-10 h-10 rounded-2xl border-2 border-white shadow-sm" alt="" />
                         <div>
                            <p className="text-xs font-bold">{review.userName}</p>
                            <div className="flex text-[8px] text-yellow-400 mt-1">
                               {[...Array(5)].map((_, i) => <i key={i} className={`${i < review.rating ? 'fas' : 'far'} fa-star mr-0.5`}></i>)}
                            </div>
                         </div>
                      </div>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</span>
                   </div>
                   <p className="text-xs text-gray-600 font-medium italic mb-4 leading-relaxed">"{review.comment}"</p>
                   {review.images && review.images.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pt-2">
                         {review.images.map((img, i) => (
                           <img 
                            key={i} src={img} 
                            className="w-16 h-16 rounded-2xl object-cover border border-white shadow-sm cursor-zoom-in shrink-0" 
                            onClick={() => setFullScreenImg(img)}
                            alt="" 
                           />
                         ))}
                      </div>
                   )}
                </div>
              ))}
              {reviews.length === 0 && <div className="py-12 bg-f-gray rounded-[40px] text-center opacity-30 uppercase font-bold text-[10px] tracking-widest">No reviews yet</div>}
           </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-xl border-t border-f-light z-50 md:relative md:bg-transparent md:border-0 md:p-0 md:mt-10">
           <button onClick={addToCart} className="btn-primary w-full max-w-md mx-auto flex items-center justify-center space-x-4 shadow-2xl shadow-black/20">
              <i className="fas fa-shopping-bag text-sm"></i>
              <span>Add to Cart</span>
           </button>
        </div>
      </div>

      {/* Full-Screen Gallery Overlay */}
      {fullScreenImg && (
        <div 
          className="fixed inset-0 bg-black/98 z-[10000] flex items-center justify-center animate-fade-in p-6"
          onClick={() => setFullScreenImg(null)}
        >
          <button className="absolute top-10 right-10 text-white p-4 bg-white/10 rounded-full hover:bg-white/20 transition-all">
            <i className="fas fa-times text-xl"></i>
          </button>
          <img src={fullScreenImg} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" alt="" />
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
