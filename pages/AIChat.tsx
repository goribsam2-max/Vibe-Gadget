
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNotify } from '../components/Notifications';

// Local interface for GenAI media parts
interface GenAIBlob {
  data: string;
  mimeType: string;
}

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; isThinking?: boolean }[]>([
    { role: 'bot', text: 'আসসালামু আলাইকুম! আমি Vibe AI। আপনার গ্যাজেট সংক্রান্ত যেকোনো প্রয়োজনে আমি সাহায্য করতে পারি। আমি কি আপনাকে ভয়েস অথবা টেক্সটের মাধ্যমে সাহায্য করবো?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [useThinking, setUseThinking] = useState(true);
  
  const isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // API Key (এটি পরে .env ফাইলে নেওয়া উচিত)
  const API_KEY = "AIzaSyBLBTn8nvt6zy2i7nz-Hf-gGxbLFGkoQ8";

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => { stopLiveSession(); };
  }, []);

  function encode(bytes: Uint8Array) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) { binary += String.fromCharCode(bytes[i]); }
    return btoa(binary);
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = async () => {
    if (isLiveMode) stopLiveSession();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(audioBlob);
        transcribeAudio(base64);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { notify("Microphone access denied", "error"); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async (base64: string) => {
    setIsTyping(true);
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([
        "Please transcribe this audio accurately into Bengali or English text. Only return the text.",
        { inlineData: { data: base64, mimeType: "audio/webm" } }
      ]);
      const transcribedText = result.response.text();
      if (transcribedText.trim()) setInput(transcribedText);
    } catch (error) { notify("Transcription failed", "error"); }
    finally { setIsTyping(false); }
  };

  const startLiveSession = async () => {
    notify("Live mode is being updated. Use text for now.", "info");
    // Live mode currently requires complex SDK setup, keeping it simple to fix build error.
  };

  const stopLiveSession = () => { setIsLiveMode(false); };

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: useThinking ? "gemini-2.0-flash-thinking-exp-01-21" : "gemini-1.5-flash",
        systemInstruction: "আপনি VibeGadget-এর নিজস্ব AI। আপনার নির্মাতা সামির। আপনি টেক এক্সপার্ট হিসেবে বাংলায় বিনয়ী উত্তর দিবেন।"
      });

      const result = await model.generateContent(userMessage);
      const botText = result.response.text();
      setMessages(prev => [...prev, { role: 'bot', text: botText, isThinking: useThinking }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "দুঃখিত, এখন উত্তর দিতে পারছি না।" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FDFDFD] max-w-5xl mx-auto animate-fade-in relative overflow-hidden shadow-2xl">
      <div className="px-6 md:px-10 py-6 flex items-center justify-between border-b border-f-light bg-white/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-5">
          <button onClick={() => navigate(-1)} className="p-3.5 bg-f-gray rounded-2xl shadow-sm"><i className="fas fa-chevron-left text-sm"></i></button>
          <h2 className="font-bold text-lg md:text-xl tracking-tight">Vibe AI Chat</h2>
        </div>
        <button 
          onClick={() => setUseThinking(!useThinking)}
          className={`px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${useThinking ? 'bg-black text-white shadow-xl' : 'bg-f-gray text-gray-400'}`}
        >
          {useThinking ? 'Expert Mode' : 'Standard'}
        </button>
      </div>

      {isLiveMode && (
        <div className="absolute inset-x-0 top-[88px] bottom-0 bg-black/98 z-40 flex flex-col items-center justify-center p-10">
          <div className="w-56 h-56 rounded-full border-4 border-white/10 flex items-center justify-center relative animate-pulse shadow-[0_0_50px_rgba(255,255,255,0.1)]"><i className="fas fa-microphone text-5xl text-white"></i></div>
          <h3 className="text-white text-xl font-bold mt-16">Vibe is listening...</h3>
          <button onClick={stopLiveSession} className="mt-20 btn-primary bg-white text-black px-16 py-5 shadow-2xl">Stop Call</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 no-scrollbar bg-[#FAFAFA]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[90%] md:max-w-[70%] px-7 py-5 rounded-[40px] text-sm md:text-base shadow-sm relative ${msg.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-white text-black rounded-tl-none border border-f-light'}`}>
              {msg.isThinking && msg.role === 'bot' && <div className="flex items-center space-x-2 mb-3 opacity-40 text-[8px] font-bold uppercase tracking-widest"><i className="fas fa-brain"></i><span>AI Reasoning Active</span></div>}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && <div className="bg-white px-8 py-6 rounded-[40px] rounded-tl-none border border-f-light shadow-sm w-fit animate-pulse text-xs font-bold text-gray-400 uppercase tracking-widest">Thinking...</div>}
        <div ref={scrollRef} />
      </div>

      <div className="p-6 md:p-10 bg-white border-t border-f-light shadow-inner">
        <div className="flex items-end space-x-5 max-w-4xl mx-auto">
          <div className="flex flex-col space-y-3">
            <button onClick={startLiveSession} className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all ${isLiveMode ? 'bg-red-500 text-white' : 'bg-f-gray'}`}><i className="fas fa-phone-alt"></i></button>
            <button onClick={isRecording ? stopRecording : startRecording} className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-f-gray'}`}><i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i></button>
          </div>
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex items-center bg-f-gray rounded-[32px] p-2 pr-4 border border-f-light">
                <input type="text" placeholder="Type your message..." className="flex-1 bg-transparent px-5 py-4 outline-none text-sm" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
                <button onClick={handleSendMessage} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${input.trim() ? 'bg-black text-white shadow-xl' : 'bg-gray-200 text-gray-400'}`}><i className="fas fa-arrow-up"></i></button>
            </div>
            <p className="text-[8px] text-center text-f-gray font-bold uppercase tracking-[0.5em] opacity-30">Vibegadget all rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
