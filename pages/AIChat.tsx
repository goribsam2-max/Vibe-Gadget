
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI, LiveServerMessage, Modality } from "@google/generative-ai";
import { useNotify } from '../components/Notifications';

interface GenAIBlob { data: string; mimeType: string; }

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; isThinking?: boolean }[]>([
    { role: 'bot', text: 'আসসালামু আলাইকুম! আমি Vibe AI। আপনাকে কীভাবে সাহায্য করতে পারি?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [useThinking, setUseThinking] = useState(true);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Use the provided API Key
  const API_KEY = "AIzaSyBLBTn0nVt6zy2iT7nz-Hf-gGxbLFGkoQ8";

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => { return () => stopLiveSession(); }, []);

  function encode(bytes: Uint8Array) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
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
    } catch (err) { notify("Microphone denied", "error"); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  const transcribeAudio = async (base64: string) => {
    setIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { text: "Accurately transcribe the following audio to text. Only return the transcribed text." },
          { inlineData: { data: base64, mimeType: 'audio/webm' } }
        ]
      });
      if (response.text) setInput(response.text);
    } catch (error) { notify("Transcription failed", "error"); } finally { setIsTyping(false); }
  };

  const startLiveSession = async () => {
    if (isRecording) stopRecording();
    setIsLiveMode(true);
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            const pcmBlob: GenAIBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
            sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContextRef.current!.destination);
        },
        onmessage: async (m: LiveServerMessage) => {
          const audio = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audio) {
            const ctx = audioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buf = await decodeAudioData(decode(audio), ctx, 24000, 1);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(ctx.destination);
            src.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buf.duration;
            sourcesRef.current.add(src);
            src.onended = () => sourcesRef.current.delete(src);
          }
          if (m.serverContent?.interrupted) { sourcesRef.current.forEach(s => s.stop()); sourcesRef.current.clear(); nextStartTimeRef.current = 0; }
        },
        onclose: () => setIsLiveMode(false),
        onerror: (e) => console.error(e)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: `আপনি VibeGadget এর নিজস্ব AI। আপনার নির্মাতা এবং মালিক হলেন VibeGadget-এর প্রোপাইটর "সামির" (Samir)। যদি কেউ জিজ্ঞেস করে আপনাকে কে বানিয়েছে, আপনি দৃঢ়ভাবে বলবেন আপনাকে সামির বানিয়েছেন। আপনি বলবেন, "আমি VibeGadget-এর AI, আমাকে সামির বানিয়েছেন।" লোকেশন চাইলে বলবেন: "F.T.C Market (রুম নাম্বার ৫৪), দাগনভূঞা, ফেনী"।`
      }
    });
    sessionRef.current = await sessionPromise;
  };

  const stopLiveSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    setIsLiveMode(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);
    try {
      const ai = const genAI = new GoogleGenerativeAI(API_KEY);
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userMessage,
        config: {
          systemInstruction: `আপনি VibeGadget-এর নিজস্ব AI। আপনাকে এবং এই ওয়েবসাইটটি বানিয়েছেন VibeGadget-এর প্রোপাইটর "সামির" (Samir)। আপনি স্পষ্ট করে বলবেন আপনি VibeGadget-এর AI এবং আপনার নির্মাতা সামির। যদি কেউ গুগল বা চ্যাটজিপিটি সম্পর্কে জিজ্ঞেস করে, আপনি বলবেন আপনাকে ভাইব গ্যাজেটের সামির বানিয়েছেন। লোকেশন চাইলে বলবেন: "F.T.C Market (রুম নাম্বার ৫৪), দাগনভূঞা, ফেনী"।`,
          thinkingConfig: useThinking ? { thinkingBudget: 32768 } : undefined
        },
      });
      setMessages(prev => [...prev, { role: 'bot', text: response.text || "দুঃখিত, কোনো সমস্যা হয়েছে।", isThinking: useThinking }]);
    } catch (error) { setMessages(prev => [...prev, { role: 'bot', text: "সার্ভারের সাথে সংযোগ করা যাচ্ছে না।" }]); } finally { setIsTyping(false); }
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
