
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Product, Review } from '../types';
import { useNotify } from '../components/Notifications';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [direction, setDirection] = useState(0); 
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
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
      }
    };
    fetchProduct();

    if (id) {
      const q = query(collection(db, 'reviews'), where('productId', '==', id));
      const unsubscribeReviews = onSnapshot(q, (snapshot) => {
        const reviewList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        reviewList.sort((a, b) => b.createdAt - a.createdAt);
        setReviews(reviewList);
      });

      let unsubscribeWishlist = () => {};
      if (auth.currentUser) {
        const wishlistRef = doc(db, 'users', auth.currentUser.uid, 'wishlist', id);
        unsubscribeWishlist = onSnapshot(wishlistRef, (snap) => {
          setIsWishlisted(snap.exists());
        });
      }

      return () => {
        unsubscribeReviews();
        unsubscribeWishlist();
      }
    }
  }, [id, auth.currentUser]);

  const toggleWishlist = async () => {
    if (!auth.currentUser) return notify("Please sign in to save items", "info");
    if (!product || !id) return;

    const wishlistRef = doc(db, 'users', auth.currentUser.uid, 'wishlist', id);
    try {
      if (isWishlisted) {
        await deleteDoc(wishlistRef);
        notify("Removed from wishlist.", "info");
      } else {
        await setDoc(wishlistRef, {
          productId: id,
          name: product.name,
          image: product.image,
          price: product.price,
          rating: product.rating,
          addedAt: Date.now()
        });
        notify("Added to wishlist!", "success");
      }
    } catch (e) {
      notify("Failed to update wishlist.", "error");
    }
  };

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

  const changeImage = (index: number) => {
    setDirection(index > activeImg ? 1 : -1);
    setActiveImg(index);
  };

  if (!product) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-black border-t-transparent rounded-full" />
    </div>
  );

  const images = product.images || [product.image];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)'
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)'
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)'
    })
  };

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-32 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-start lg:p-12 lg:gap-20">
      
      <div className="w-full lg:w-1/2 lg:sticky lg:top-12">
        <div className="relative aspect-square md:aspect-video lg:aspect-square bg-zinc-50 rounded-b-[3rem] lg:rounded-[4rem] overflow-hidden shadow-inner flex items-center justify-center border border-zinc-100 group">
          <button onClick={() => navigate(-1)} className="absolute top-8 left-8 z-10 p-4 bg-white/70 backdrop-blur-xl rounded-2xl text-black shadow-xl active:scale-90 transition-all">
            <i className="fas fa-chevron-left text-sm"></i>
          </button>

          <button 
            onClick={toggleWishlist}
            className={`absolute top-8 right-8 z-10 p-4 rounded-2xl shadow-xl transition-all active:scale-90 ${isWishlisted ? 'bg-black text-white' : 'bg-white/70 backdrop-blur-xl text-black'}`}
          >
            <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart text-sm`}></i>
          </button>
          
          <AnimatePresence initial={false} custom={direction}>
            <motion.img 
              key={activeImg}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 400, damping: 35 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
                filter: { duration: 0.3 }
              }}
              src={images[activeImg]} 
              className="absolute w-full h-full object-contain p-8 md:p-16 lg:p-24 cursor-zoom-in rounded-[3rem]"
              onClick={() => setFullScreenImg(images[activeImg])}
              alt={product.name}
            />
          </AnimatePresence>
          
          {images.length > 1 && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 bg-white/30 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-xl z-10">
              {images.map((_, i) => (
                <button key={i} onClick={() => changeImage(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === activeImg ? 'w-8 bg-black' : 'w-2 bg-black/20'}`}></button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center flex-wrap gap-5 mt-10 px-8">
          {images.map((img, i) => (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={i} 
              onClick={() => changeImage(i)}
              className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] border-2 p-2 bg-zinc-50 transition-all overflow-hidden relative ${i === activeImg ? 'border-black scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
            >
              <img src={img} className="w-full h-full object-contain rounded-[1.2rem]" alt="" />
              {i === activeImg && (
                <motion.div layoutId="activeThumb" className="absolute inset-0 border-4 border-black rounded-[2rem] z-10" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-8 py-12 lg:py-0 flex-1 max-w-2xl">
        <div className="mb-14">
           <p className="text-xs text-zinc-400 font-bold uppercase tracking-[0.3em] mb-4">{product.category}</p>
           <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[0.95] text-zinc-900">{product.name}</h1>
           <div className="flex items-center space-x-10">
              <p className="text-4xl md:text-5xl font-black tracking-tighter">৳{product.price}</p>
              <div className="flex items-center space-x-3 bg-zinc-50 px-6 py-3 rounded-2xl border border-zinc-100 shadow-sm">
                 <i className="fas fa-star text-yellow-400 text-sm"></i>
                 <span className="text-sm font-black">{product.rating}</span>
                 <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">({product.numReviews || 0} reviews)</span>
              </div>
           </div>
        </div>

        <div className="mb-16">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 mb-6">Product Description</h3>
            <p className="text-base md:text-lg text-zinc-500 leading-relaxed font-medium">
              {product.description || "High-quality premium accessory designed for ultimate performance and style."}
            </p>
        </div>

        <div className="mb-16">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">Customer Reviews</h3>
              <button onClick={() => navigate(`/leave-review?productId=${product.id}`)} className="text-[10px] font-bold text-zinc-400 hover:text-black uppercase tracking-widest transition-all">Write a Review</button>
           </div>

           <div className="space-y-8">
              {reviews.map(review => (
                <div key={review.id} className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100 transition-all hover:bg-white hover:shadow-2xl">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-5">
                         <img src={review.userPhoto || `https://ui-avatars.com/api/?name=${review.userName}&background=000&color=fff`} className="w-14 h-14 rounded-2xl border-4 border-white shadow-md" alt="" />
                         <div>
                            <p className="text-sm font-black tracking-tight">{review.userName}</p>
                            <div className="flex text-[9px] text-yellow-400 mt-1">
                               {[...Array(5)].map((_, i) => <i key={i} className={`${i < review.rating ? 'fas' : 'far'} fa-star mr-1`}></i>)}
                            </div>
                         </div>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-300 uppercase">{new Date(review.createdAt).toLocaleDateString()}</span>
                   </div>
                   <p className="text-sm text-zinc-600 font-medium italic mb-6 leading-relaxed">"{review.comment}"</p>
                   {review.images && review.images.length > 0 && (
                      <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                         {review.images.map((img, i) => (
                           <img 
                            key={i} src={img} 
                            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-4 border-white shadow-xl cursor-zoom-in shrink-0 hover:scale-105 transition-transform" 
                            onClick={() => setFullScreenImg(img)}
                            alt="" 
                           />
                         ))}
                      </div>
                   )}
                </div>
              ))}
              {reviews.length === 0 && <div className="py-20 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-100 text-center text-[11px] font-bold uppercase tracking-widest text-zinc-300">No reviews yet</div>}
           </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-8 md:px-12 bg-white/80 backdrop-blur-2xl border-t border-zinc-100 z-50 lg:relative lg:bg-transparent lg:border-0 lg:p-0 lg:mt-20">
           <motion.button 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={addToCart} 
             className="w-full max-w-xl mx-auto py-6 bg-black text-white rounded-[2rem] flex items-center justify-center space-x-4 shadow-2xl text-sm font-bold uppercase tracking-widest"
           >
              <i className="fas fa-shopping-bag text-sm"></i>
              <span>Add to Cart</span>
           </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {fullScreenImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[40px] z-[10000] flex items-center justify-center p-6 md:p-20"
            onClick={() => setFullScreenImg(null)}
          >
            <motion.button 
              whileHover={{ scale: 1.1 }}
              className="absolute top-10 right-10 text-white p-5 bg-white/10 rounded-full hover:bg-white/20 transition-all z-[10001]"
            >
              <i className="fas fa-times text-2xl"></i>
            </motion.button>
            <motion.img 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              src={fullScreenImg} 
              className="max-w-full max-h-full object-contain rounded-[3rem] md:rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10" 
              alt="Immersive product view" 
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;
