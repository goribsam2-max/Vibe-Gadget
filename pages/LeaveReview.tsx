
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';
import { Product } from '../types';
import { uploadToImgbb } from '../services/imgbb';

const LeaveReview: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
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
    if (!auth.currentUser) return notify("Acquisition ID required", "error");
    if (rating === 0) return notify("Neural rating required", "error");
    if (!comment.trim()) return notify("Narrative required", "error");
    if (!productId || !product) return;

    setLoading(true);
    try {
      let imageUrls: string[] = [];
      for (const file of imageFiles) {
        const url = await uploadToImgbb(file);
        imageUrls.push(url);
      }

      await addDoc(collection(db, 'reviews'), {
        productId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Vibe User',
        userPhoto: auth.currentUser.photoURL || '',
        rating,
        comment: comment.trim(),
        images: imageUrls,
        createdAt: Date.now()
      });

      const oldRating = product.rating || 0;
      const oldNumReviews = product.numReviews || 0;
      const newNumReviews = oldNumReviews + 1;
      const newRating = ((oldRating * oldNumReviews) + rating) / newNumReviews;

      await updateDoc(doc(db, 'products', productId), {
        rating: Number(newRating.toFixed(1)),
        numReviews: newNumReviews
      });

      notify("Review processed!", "success");
      navigate(`/product/${productId}`);
    } catch (err) {
      notify("Data transmission failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!product) return <div className="h-screen flex items-center justify-center animate-spin"><i className="fas fa-circle-notch text-3xl"></i></div>;

  return (
    <div className="p-8 animate-fade-in min-h-screen flex flex-col max-w-md mx-auto bg-white">
       <div className="flex items-center space-x-6 mb-12">
          <button onClick={() => navigate(-1)} className="p-3.5 bg-f-gray rounded-2xl active:scale-90 transition-all shadow-sm">
             <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Feedback Hub</h1>
       </div>

       <div className="bg-f-gray p-6 rounded-[40px] border border-f-light flex items-center space-x-5 mb-12 shadow-sm">
          <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden p-1 shadow-inner ring-1 ring-black/5">
             <img src={product.image} className="w-full h-full object-contain" alt="" />
          </div>
          <div className="flex-1 min-w-0">
             <h4 className="font-bold text-sm truncate tracking-tight">{product.name}</h4>
             <p className="text-[10px] text-f-gray font-bold uppercase tracking-widest opacity-60">{product.category}</p>
          </div>
       </div>

       <div className="text-center mb-12">
          <h3 className="text-xl font-bold mb-3 tracking-tighter">Experience Rating</h3>
          <p className="text-f-gray text-[10px] font-bold uppercase tracking-widest opacity-40 mb-8">Tap a star to sync your sentiment</p>
          <div className="flex justify-center space-x-4">
             {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} onClick={() => setRating(star)} 
                  className={`text-4xl transition-all duration-500 ${star <= rating ? 'text-yellow-400 scale-125' : 'text-gray-100'}`}
                >
                  <i className={`${star <= rating ? 'fas' : 'far'} fa-star`}></i>
                </button>
             ))}
          </div>
       </div>

       <div className="flex-1 space-y-8">
          <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Neural Narrative</label>
             <textarea 
                placeholder="Synchronize your thoughts..." 
                className="w-full bg-f-gray p-6 rounded-[40px] outline-none h-44 border border-transparent focus:border-black transition-all font-medium text-sm shadow-inner"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
             />
          </div>

          <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Visual Evidence (Multiple)</label>
             <input 
                type="file" multiple accept="image/*"
                className="w-full bg-f-gray p-4 rounded-3xl text-[10px] font-bold uppercase shadow-inner"
                onChange={e => e.target.files && setImageFiles(Array.from(e.target.files))}
             />
          </div>
       </div>

       <button 
          disabled={loading}
          onClick={handleSubmit} 
          className="btn-primary w-full mt-12 shadow-2xl shadow-black/10 active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
        >
          {loading ? "Transmitting..." : "Initialize Submission"}
       </button>
    </div>
  );
};

export default LeaveReview;
