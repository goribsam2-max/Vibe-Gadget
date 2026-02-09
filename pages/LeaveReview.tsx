
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';
import { Product } from '../types';

const LeaveReview: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      const snap = await getDoc(doc(db, 'products', productId));
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() } as Product);
    };
    fetchProduct();
  }, [productId]);

  const handleSubmit = async () => {
    if (!auth.currentUser) return notify("Please login to review", "error");
    if (rating === 0) return notify("Please select a rating", "error");
    if (!comment.trim()) return notify("Please add a comment", "error");
    if (!productId || !product) return;

    setLoading(true);
    try {
      // 1. Add Review
      await addDoc(collection(db, 'reviews'), {
        productId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous User',
        userPhoto: auth.currentUser.photoURL || '',
        rating,
        comment: comment.trim(),
        createdAt: Date.now()
      });

      // 2. Update Product Aggregate Rating
      const oldRating = product.rating || 0;
      const oldNumReviews = product.numReviews || 0;
      const newNumReviews = oldNumReviews + 1;
      const newRating = ((oldRating * oldNumReviews) + rating) / newNumReviews;

      await updateDoc(doc(db, 'products', productId), {
        rating: Number(newRating.toFixed(1)),
        numReviews: newNumReviews
      });

      notify("Review submitted successfully!", "success");
      navigate(`/product/${productId}`);
    } catch (err) {
      console.error(err);
      notify("Failed to submit review", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!product) return (
    <div className="h-screen flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-6 animate-fade-in min-h-screen flex flex-col max-w-md mx-auto bg-white">
       <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl">
             <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <h1 className="text-xl font-bold">Write Review</h1>
       </div>

       <div className="bg-f-gray p-5 rounded-3xl border border-f-light flex items-center space-x-4 mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden p-1 shadow-inner">
             <img src={product.image} className="w-full h-full object-contain" alt="" />
          </div>
          <div className="flex-1 min-w-0">
             <h4 className="font-bold text-sm truncate">{product.name}</h4>
             <p className="text-[10px] text-f-gray font-bold uppercase tracking-widest">{product.category}</p>
          </div>
       </div>

       <div className="text-center mb-10">
          <h3 className="text-xl font-bold mb-2">How is your experience?</h3>
          <p className="text-f-gray text-xs mb-6">Tap a star to give your rating</p>
          <div className="flex justify-center space-x-3">
             {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)} 
                  className={`text-4xl transition-all duration-300 ${star <= rating ? 'text-yellow-400 scale-110 drop-shadow-sm' : 'text-gray-200 hover:text-gray-300'}`}
                >
                  <i className={`${star <= rating ? 'fas' : 'far'} fa-star`}></i>
                </button>
             ))}
          </div>
       </div>

       <div className="flex-1 space-y-6">
          <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tell us more</label>
             <textarea 
                placeholder="Share your thoughts about this gadget..." 
                className="w-full bg-f-gray p-6 rounded-[32px] outline-none h-40 resize-none border border-transparent focus:border-black transition-all font-medium text-sm leading-relaxed"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
             />
          </div>
       </div>

       <div className="flex space-x-4 mt-8 pb-4">
          <button 
            disabled={loading}
            onClick={handleSubmit} 
            className="flex-1 btn-primary shadow-xl shadow-black/10 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
       </div>
    </div>
  );
};

export default LeaveReview;
