
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 pb-24 animate-fade-in min-h-screen">
       <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-f-gray rounded-xl">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-xl font-bold">Privacy Policy</h1>
       </div>

       <div className="space-y-8 text-xs leading-relaxed text-f-gray">
          <section>
   <h2 className="text-black font-bold text-sm mb-4">বাতিলকরণ নীতিমালা (Cancellation Policy)</h2>
   <p>VibeGadget থেকে অর্ডার করার পর, পণ্যটি ডেলিভারির জন্য পাঠানোর (Shipped) আগে আপনি যেকোনো সময় অর্ডার বাতিল করতে পারবেন। তবে পণ্যটি কুরিয়ারে হ্যান্ডওভার করার পর অর্ডার বাতিল করা হলে, আপনাকে ডেলিভারি চার্জ পরিশোধ করতে হতে পারে।</p>
   <p className="mt-4">যদি কোনো টেকনিক্যাল কারণে বা স্টক না থাকার ফলে আমরা আপনার অর্ডারটি সরবরাহ করতে না পারি, তবে আমাদের পক্ষ থেকে অর্ডারটি বাতিল করা হবে এবং আপনার অগ্রিম প্রদানকৃত টাকা (যদি থাকে) দ্রুত ফেরত দেওয়া হবে।</p>
</section>

<section>
   <h2 className="text-black font-bold text-sm mb-4">শর্তাবলী (Terms & Condition)</h2>
   <p>১. VibeGadget-এ অর্ডার করার মাধ্যমে আপনি আমাদের নির্ধারিত মূল্য এবং ডেলিভারি চার্জ মেনে নিচ্ছেন বলে গণ্য হবে। গ্যাজেট বা এক্সেসরিজের স্টক সীমিত হওয়ার কারণে 'আগে আসলে আগে পাবেন' ভিত্তিতে অর্ডার প্রসেস করা হবে।</p>
   <p className="mt-4">২. আমাদের প্রতিটি পণ্যের গুণগত মান নিশ্চিত করা হয়। তবে কোনো ইলেকট্রনিক পণ্যে ম্যানুফ্যাকচারিং ত্রুটি থাকলে, তা আমাদের রিটার্ন পলিসি অনুযায়ী নির্দিষ্ট সময়ের মধ্যে জানাতে হবে। পণ্যের প্যাকেজিং এবং ইনভয়েস অবশ্যই সংরক্ষণ করতে হবে।</p>
   <p className="mt-4">৩. আমরা যেকোনো সময় আমাদের ওয়েবসাইটের তথ্য, মূল্য বা শর্তাবলী পরিবর্তন করার অধিকার রাখি। বিশেষ অফার বা ডিসকাউন্টের ক্ষেত্রে আমাদের সিদ্ধান্তই চূড়ান্ত বলে গণ্য হবে।</p>
</section>
       </div>
    </div>
  );
};

export default PrivacyPolicy;
