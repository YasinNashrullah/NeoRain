import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, Mic, MoreVertical, 
  ArrowLeft, Sparkles, Loader2 
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Konfigurasi API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const Chat = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // State Chat History
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Halo! Gue NeoRain. Cerita aja, gue bakal dengerin tapi gak bakal ceramah panjang lebar. Ada apa?", 
      sender: 'ai', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);

  const messagesEndRef = useRef(null);

  // Auto Scroll ke bawah
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // --- FUNGSI KIRIM PESAN KE GEMINI ---
  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Tambahkan pesan user ke UI
    const userMsg = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Setup Model Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Construct History untuk Context (agar AI ingat obrolan sebelumnya)
      // Kita ambil 5 pesan terakhir saja biar hemat token & tetap relevan
      const historyForAI = messages.slice(-5).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // 4. Start Chat Session dengan System Instruction (Lewat Prompt Awal)
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `
              SYSTEM INSTRUCTION:
              Bertindaklah sebagai teman curhat mahasiswa yang asik dan suportif bernama NeoRain.
              Gaya bicara: Santai, pakai "aku-kamu" atau "lo-gue", gaul tapi sopan.
              ATURAN WAJIB: 
              1. JAWABAN HARUS RINGKAS & PENDEK (Maksimal 2-3 kalimat).
              2. Jangan memberi solusi panjang lebar kecuali diminta.
              3. Fokus pada validasi perasaan user.
              4. Jangan pakai format markdown bold/list jika tidak perlu.
            ` }]
          },
          {
            role: "model",
            parts: [{ text: "Oke siap! Gue bakal jadi temen curhat yang asik, ringkas, dan gak bertele-tele. Cerita aja!" }]
          },
          ...historyForAI
        ],
      });

      // 5. Kirim Pesan Baru
      const result = await chat.sendMessage(input);
      const response = await result.response;
      const text = response.text();

      // 6. Tampilkan Balasan AI
      const aiMsg = {
        id: Date.now() + 1,
        text: text,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Error Gemini:", error);
      const errorMsg = {
        id: Date.now() + 1,
        text: "Duh, koneksi gue lagi putus-putus nih. Coba lagi ya?",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col z-[100]">
      
      {/* --- 1. NAVBAR (FIXED TOP) --- */}
      <div className="absolute top-0 left-0 w-full px-4 py-3 pt-8 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 flex justify-between items-center z-50 shadow-lg">
        <div className="flex items-center gap-3">
          {/* Tombol Back */}
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          {/* Profil AI */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=NeoRain" alt="AI" className="w-8 h-8" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full animate-pulse"></div>
          </div>
          
          {/* Info AI */}
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">NeoRain AI</h1>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <p className="text-indigo-400 text-[10px] font-medium">Teman Curhat</p>
            </div>
          </div>
        </div>

        {/* Menu Option */}
        <button className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-full">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* --- 2. CHAT AREA --- */}
      <div className="flex-1 overflow-y-auto p-4 pt-24 pb-24 space-y-4 scrollbar-hide bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md relative ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5'
              }`}>
                {msg.text}
              </div>
              
              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {msg.time}
              </span>

            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-slate-800 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs text-slate-400 ml-1">NeoRain mengetik...</span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* --- 3. INPUT AREA (FIXED BOTTOM) --- */}
      <div className="absolute bottom-0 w-full bg-slate-950/90 backdrop-blur-lg border-t border-white/5 p-4 pb-6 z-50">
        <div className="flex items-end gap-2">
          
          {/* Input Field */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[24px] flex items-center px-2 py-1 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Cerita sini..."
              className="flex-1 bg-transparent text-white text-sm px-3 py-3 focus:outline-none placeholder-slate-500"
              autoComplete="off"
            />
            <button className="p-2 text-slate-400 hover:text-indigo-400 transition-colors">
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Send Button */}
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 ${
              input.trim() && !isTyping
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:scale-105' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Chat;