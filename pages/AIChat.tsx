
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { useNotify } from '../components/Notifications';

// Local interface for GenAI media parts as the SDK might not export it directly as 'Blob'
interface GenAIBlob {
  data: string;
  mimeType: string;
}

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; isThinking?: boolean }[]>([
    { role: 'bot', text: 'আসসালামু আলাইকুম! আমি Vibe AI। আপনার গ্যাজেট সংক্রান্ত যেকোনো প্রয়োজনে আমি সাহায্য করতে পারি। আমি কি আপনাকে ভয়েস অথবা টেক্সটের মাধ্যমে সাহায্য করবো?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [useThinking, setUseThinking] = useState(true);
  
  // Transcription States
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Audio & Live API Refs
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  // Utility Functions for Audio
  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
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
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Transcription Feature
  const startRecording = async () => {
    if (isLiveMode) stopLiveSession();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(audioBlob);
        transcribeAudio(base64);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      notify("Microphone access denied", "error");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async (base64: string) => {
    setIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { text: "Please transcribe the following audio accurately into Bengali text if spoken in Bengali, or English if spoken in English. Only return the transcribed text." },
          { inlineData: { data: base64, mimeType: 'audio/webm' } }
        ]
      });
      const transcribedText = response.text || "";
      if (transcribedText.trim()) {
        setInput(transcribedText);
      } else {
        notify("Could not understand the audio", "info");
      }
    } catch (error) {
      notify("Transcription failed", "error");
    } finally {
      setIsTyping(false);
    }
  };

  // Live Mode Features
  const startLiveSession = async () => {
    if (isRecording) stopRecording();
    setIsLiveMode(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            const pcmBlob: GenAIBlob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContextRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            const ctx = audioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => setIsLiveMode(false),
        onerror: (e) => console.error("Live API Error", e)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: `আপনি VibeGadget এর নিজস্ব AI। আপনার নির্মাতা এবং মালিক হলেন VibeGadget-এর প্রোপাইটর "সামির" (Samir)। যদি কেউ আপনাকে আপনার পরিচয় জিজ্ঞেস করে, বা জিজ্ঞেস করে আপনাকে কে বানিয়েছে (যেমন Gemini, ChatGPT বা Google কি না), আপনি দৃঢ়ভাবে বলবেন যে আপনি VibeGadget-এর AI এবং আপনাকে সামির বানিয়েছেন। আপনি বলবেন, "আমি VibeGadget-এর AI, আমাকে সামির বানিয়েছেন।" ইউজার যখনই আপনার লোকেশন বা অ্যাড্রেস জানতে চাইবে, আপনি বলবেন: "F.T.C Market (রুম নাম্বার ৫৪), দাগনভূঞা, ফেনী"। আপনি খুব ফ্রেন্ডলি এবং শর্ট রিপ্লাই দিবেন।`
      }
    });

    sessionRef.current = await sessionPromise;
  };

  const stopLiveSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const config: any = {
        systemInstruction: `আপনি VibeGadget-এর নিজস্ব AI। আপনাকে এবং এই ওয়েবসাইটটি বানিয়েছেন VibeGadget-এর প্রোপাইটর "সামির" (Samir)। যদি কেউ আপনার পরিচয়, নির্মাতা বা মালিক সম্পর্কে জিজ্ঞেস করে, আপনি স্পষ্ট করে বলবেন আপনি VibeGadget-এর AI এবং আপনার নির্মাতা সামির। যদি কেউ জিজ্ঞেস করে গুগল আপনাকে বানিয়েছে কি না, আপনি বলবেন "না, আমাকে ভাইব গ্যাজেট-এর সামির বানিয়েছেন"। ইউজার যখনই আপনার লোকেশন বা অ্যাড্রেস জানতে চাইবে, আপনি ঠিক এইভাবে গুছিয়ে বলবেন: "F.T.C Market (রুম নাম্বার ৫৪), দাগনভূঞা, ফেনী"। আপনি একজন টেক এক্সপার্ট এবং কাস্টমার সাপোর্ট এজেন্ট হিসেবে কাজ করবেন। সর্বদা বাংলায় উত্তর দিবেন এবং খুব বিনয়ী হবেন।`,
      };

      if (useThinking) {
        config.thinkingConfig = { thinkingBudget: 32768 };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userMessage,
        config: config,
      });

      const botText = response.text || "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।";
      setMessages(prev => [...prev, { role: 'bot', text: botText, isThinking: useThinking }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "নেটওয়ার্ক সমস্যার কারণে উত্তর দিতে পারছি না।" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto animate-fade-in relative overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-f-light bg-white/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl active:scale-90 transition-transform">
            <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <div>
            <h2 className="font-bold text-base tracking-tight">Vibe Advanced AI</h2>
            <div className="flex items-center">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse mr-2 ${isLiveMode ? 'bg-red-500' : 'bg-green-500'}`}></span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                {isLiveMode ? 'Live Voice Mode' : 'Ready to help'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setUseThinking(!useThinking)}
            className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${useThinking ? 'bg-black text-white shadow-lg shadow-black/20' : 'bg-f-gray text-gray-400'}`}
          >
            {useThinking ? 'Thinking On' : 'Standard'}
          </button>
        </div>
      </div>

      {/* Live Audio Visualizer Overlay */}
      {isLiveMode && (
        <div className="absolute inset-x-0 top-[76px] bottom-0 bg-black/95 z-40 flex flex-col items-center justify-center p-10 animate-fade-in">
          <div className="w-48 h-48 rounded-full border-4 border-white/10 flex items-center justify-center relative shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            <div className="absolute inset-0 bg-white/5 rounded-full animate-ping"></div>
            <div className="absolute inset-4 bg-white/10 rounded-full animate-pulse"></div>
            <i className="fas fa-microphone text-4xl text-white"></i>
          </div>
          <h3 className="text-white font-bold mt-12 tracking-tight text-center">Vibe Live AI is listening...</h3>
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.3em] mt-4">Conversational Mode Active</p>
          <button 
            onClick={stopLiveSession}
            className="mt-20 btn-primary bg-white text-black px-12 shadow-[0_20px_50px_rgba(255,255,255,0.2)] active:scale-95 transition-transform"
          >
            Stop Conversation
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-[#FAFAFA]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[88%] px-6 py-4 rounded-[32px] text-sm leading-relaxed shadow-sm relative ${
              msg.role === 'user' 
              ? 'bg-black text-white rounded-tr-none shadow-xl shadow-black/5' 
              : 'bg-white text-black rounded-tl-none border border-f-light'
            }`}>
              {msg.isThinking && msg.role === 'bot' && (
                <div className="flex items-center space-x-1 mb-2 opacity-40">
                  <i className="fas fa-brain text-[8px]"></i>
                  <span className="text-[7px] font-bold uppercase tracking-widest">Advanced thought process active</span>
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white px-7 py-5 rounded-[32px] rounded-tl-none flex flex-col space-y-2 border border-f-light shadow-sm">
               <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150"></div>
               </div>
               {useThinking && !isRecording && (
                 <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Advanced reasoning in progress...</span>
               )}
               {isRecording && (
                 <span className="text-[7px] font-bold text-red-400 uppercase tracking-widest animate-pulse">Recording Audio...</span>
               )}
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-f-light shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-center space-y-3">
            <button 
                onClick={startLiveSession}
                title="Voice Conversation"
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${isLiveMode ? 'bg-red-500 text-white' : 'bg-f-gray text-black hover:bg-black hover:text-white'}`}
            >
                <i className="fas fa-comment-alt-lines"></i>
            </button>
            <button 
                onClick={isRecording ? stopRecording : startRecording}
                title="Transcribe Voice to Text"
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-f-gray text-black hover:bg-black hover:text-white'}`}
            >
                <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
            </button>
          </div>
          
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex-1 flex items-center bg-f-gray rounded-[28px] p-2 pr-3 border border-f-light">
                <input 
                    type="text" 
                    placeholder={useThinking ? "Ask a complex tech question..." : "Type a message..."} 
                    className="flex-1 bg-transparent px-4 py-3 outline-none text-sm font-medium"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                        input.trim() ? 'bg-black text-white shadow-xl shadow-black/20 scale-100' : 'bg-gray-200 text-gray-400 scale-95'
                    }`}
                >
                    <i className="fas fa-arrow-up text-sm"></i>
                </button>
            </div>
            <p className="text-[7px] text-center text-f-gray font-bold uppercase tracking-[0.4em] opacity-30">Vibegadget all rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
