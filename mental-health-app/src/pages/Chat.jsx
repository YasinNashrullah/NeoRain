import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, MoreVertical,
  ArrowLeft, Sparkles, Loader2, X, FileText
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from '../utils/api';
import '../App.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Mood color mapping
const moodColors = {
  happy: {
    bubble1: 'rgba(236, 72, 153, 0.05)',
    bubble2: 'rgba(244, 114, 182, 0.04)',
    primary: 'bg-pink-600',
    text: 'text-pink-400',
    bgGradient: 'radial-gradient(circle at center, #3f1a28 0%, #020617 100%)'
  },
  calm: {
    bubble1: 'rgba(34, 211, 238, 0.05)',
    bubble2: 'rgba(6, 182, 212, 0.04)',
    primary: 'bg-cyan-600',
    text: 'text-cyan-400',
    bgGradient: 'radial-gradient(circle at center, #0e2a35 0%, #020617 100%)'
  },
  manic: {
    bubble1: 'rgba(250, 204, 21, 0.05)',
    bubble2: 'rgba(234, 179, 8, 0.04)',
    primary: 'bg-yellow-600',
    text: 'text-yellow-400',
    bgGradient: 'radial-gradient(circle at center, #2e2408 0%, #020617 100%)'
  },
  angry: {
    bubble1: 'rgba(251, 146, 60, 0.05)',
    bubble2: 'rgba(249, 115, 22, 0.04)',
    primary: 'bg-orange-600',
    text: 'text-orange-400',
    bgGradient: 'radial-gradient(circle at center, #331408 0%, #020617 100%)'
  },
  sad: {
    bubble1: 'rgba(99, 102, 241, 0.05)',
    bubble2: 'rgba(79, 70, 229, 0.04)',
    primary: 'bg-indigo-600',
    text: 'text-indigo-400',
    bgGradient: 'radial-gradient(circle at center, #141430 0%, #020617 100%)'
  },
  default: {
    bubble1: 'rgba(99, 102, 241, 0.05)',
    bubble2: 'rgba(139, 92, 246, 0.04)',
    primary: 'bg-indigo-600',
    text: 'text-indigo-400',
    bgGradient: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)'
  }
};

const Chat = ({ onBack, userData, initialContext }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMood, setCurrentMood] = useState('default');
  
  // State Context
  const [activeContext, setActiveContext] = useState(initialContext || null);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  const messagesEndRef = useRef(null);
  const userName = userData?.name?.split(" ")[0] || "Teman"; // Ambil nama depan saja

  // Load History Dropdown
  useEffect(() => {
    const fetchHistory = async () => {
      if (userData?.uid) {
        const history = await api.getAssessmentHistory(userData.uid);
        setAssessmentHistory(history);
      }
    };
    fetchHistory();
  }, [userData]);

  useEffect(() => {
    if (initialContext) {
      setActiveContext(initialContext);
      setMessages([{
        id: 'sys-init',
        text: `Mode Analisis Aktif: Menggunakan data tanggal ${new Date(initialContext.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}. Silakan tanya tentang hasil ini.`,
        sender: 'system',
        time: 'Info'
      }]);
    } else {
      setActiveContext(null);
      setMessages([{ 
        id: 'ai-init', 
        text: `Halo ${userName}! Gue NeoRain. Cerita aja, gue bakal dengerin. Ada yang mengganggu pikiranmu hari ini?`, 
        sender: 'ai', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }
  }, [initialContext, userName]);

  // Handle konteks
  const handleContextChange = (context) => {
    setActiveContext(context);
    setShowHistoryMenu(false);
    
    if (context) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Konteks diubah: Data tanggal ${new Date(context.created_at).toLocaleDateString('id-ID')}.`,
        sender: 'system',
        time: 'Update'
      }]);
    } else {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Mode Umum: Chatting tanpa konteks data analisis.`,
        sender: 'system',
        time: 'Update'
      }]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Save User Message
    if (userData?.uid) {
      api.saveChat({ firebase_uid: userData.uid, message: userMsg.text, sender: 'user' }).catch(err => {});
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // sistem prompt
      let systemInstruction = `
        SYSTEM: Kamu adalah NeoRain, teman curhat mahasiswa.
        Nama User: ${userName}.
        Gaya Bicara: Santai, gaul, suportif, pakai "aku-kamu" atau "lo-gue". Panggil user dengan nama "${userName}" sesekali agar akrab.
        Tugas: Analisis emosi user. Di AKHIR response, WAJIB sertakan tag mood: ||MOOD:happy||, ||MOOD:sad||, dll.
      `;
      
      // Inject Data Analisis jika ada
      if (activeContext) {
        const aiReport = typeof activeContext.ai_analysis === 'string' 
          ? JSON.parse(activeContext.ai_analysis) 
          : activeContext.ai_analysis;

        systemInstruction += `
        \n[DATA KESEHATAN MENTAL USER SAAT INI]
        Tanggal Tes: ${new Date(activeContext.created_at).toLocaleDateString()}
        Skor DASS-21: 
        - Depresi: ${activeContext.depression_score} (Skala 0-42)
        - Kecemasan: ${activeContext.anxiety_score} (Skala 0-42)
        - Stres: ${activeContext.stress_score} (Skala 0-42)
        
        Ringkasan AI Sebelumnya: "${aiReport?.summary || '-'}"
        
        INSTRUKSI KHUSUS: User bertanya dalam konteks hasil tes ini. Berikan jawaban yang relevan dengan skor tersebut. Validasi perasaan mereka berdasarkan data ini.
        `;
      }

      const historyForAI = messages
        .filter(m => m.sender !== 'system')
        .slice(-5)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: systemInstruction }] },
          ...historyForAI
        ],
      });

      const result = await chat.sendMessage(input);
      const response = await result.response;
      let text = response.text();

      // Extract Mood
      const moodMatch = text.match(/\|\|MOOD:(\w+)\|\|/);
      if (moodMatch && moodMatch[1]) {
        const detectedMood = moodMatch[1].toLowerCase();
        if (moodColors[detectedMood]) setCurrentMood(detectedMood);
        text = text.replace(/\|\|MOOD:\w+\|\|/, '').trim();
      }

      const aiMsg = {
        id: Date.now() + 1,
        text: text,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);

      if (userData?.uid) {
        api.saveChat({ firebase_uid: userData.uid, message: aiMsg.text, sender: 'ai' }).catch(err => {});
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now(), text: "Maaf, ada gangguan koneksi.", sender: 'ai', time: 'Now' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const currentStyle = moodColors[currentMood] || moodColors.default;

  return (
    <motion.div
      className="flex flex-col w-full h-full relative overflow-hidden"
      animate={{ background: currentStyle.bgGradient }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* Background Bubbles */}
      <div className="chat-bubbles-container">
        <div className="chat-bubble chat-bubble-1" style={{ background: currentStyle.bubble1 }}></div>
        <div className="chat-bubble chat-bubble-2" style={{ background: currentStyle.bubble2 }}></div>
      </div>

      {/* header */}
      <div className="flex-none w-full bg-transparent border-b border-white/10 z-30 relative">
        <div className="px-4 py-3 pt-8 md:pt-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=NeoRain" alt="AI" className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">NeoRain AI</h1>
              {activeContext ? (
                <p className="text-green-400 text-[10px] flex items-center gap-1 font-bold">
                  <FileText className="w-3 h-3" />
                  Mode Analisis
                </p>
              ) : (
                <p className={`${currentStyle.text} text-[10px]`}>Teman Curhat</p>
              )}
            </div>
          </div>
          
          {/* History selector */}
          <div className="relative">
            <button 
              onClick={() => setShowHistoryMenu(!showHistoryMenu)}
              className={`p-2 rounded-full transition-colors ${showHistoryMenu ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* dropdown menu */}
            <AnimatePresence>
              {showHistoryMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-white/5 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pilih Konteks Data</span>
                    <button onClick={() => setShowHistoryMenu(false)}><X className="w-4 h-4 text-slate-500 hover:text-white"/></button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto scrollbar-hide p-2 space-y-1">
                    <button 
                      onClick={() => handleContextChange(null)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${!activeContext ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                    >
                      Tanpa Konteks (Umum)
                    </button>
                    
                    {assessmentHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleContextChange(item)}
                        className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${activeContext?.id === item.id ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 group'}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold ${activeContext?.id === item.id ? 'text-white' : 'text-slate-200'}`}>
                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                          </span>
                          <span className={`text-[9px] ${activeContext?.id === item.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {new Date(item.created_at).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <div className="flex gap-1">
                           {item.stress_score > 18 && <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">Stres</span>}
                           {item.anxiety_score > 9 && <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded">Cemas</span>}
                           {item.depression_score > 13 && <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Depresi</span>}
                           {item.stress_score <= 18 && item.anxiety_score <= 9 && item.depression_score <= 13 && 
                             <span className="text-[9px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded">Normal</span>
                           }
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide relative z-10">
        <div className="p-4 space-y-4 flex flex-col justify-end min-h-full">
          <div className="h-4 flex-none"></div>
          
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'system' ? (
                <div className="w-full flex justify-center my-2">
                  <span className="text-[10px] bg-white/10 text-slate-300 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    {msg.text}
                  </span>
                </div>
              ) : (
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-md whitespace-pre-wrap break-words ${
                  msg.sender === 'user'
                    ? `${currentStyle.primary} text-white rounded-tr-sm text-left`
                    : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5 text-left'
                }`}>
                  {msg.text}
                  <div className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</div>
                </div>
              )}
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-xs text-slate-400">Mengetik...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* input chat */}
      <div className="flex-none w-full bg-transparent border-t border-white/5 p-4 pb-6 z-20">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[24px] flex items-end px-2 py-2">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                  e.target.style.height = 'auto';
                }
              }}
              placeholder={`Cerita sini, ${userName}...`}
              rows={1}
              className="flex-1 bg-transparent text-white text-sm px-3 py-1 focus:outline-none resize-none max-h-[100px] scrollbar-hide"
              style={{ height: 'auto' }}
            />
            <Mic className="w-5 h-5 text-slate-400 mx-2 mb-1" />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`p-3 rounded-full transition-colors duration-700 ease-in-out ${input.trim() ? `${currentStyle.primary} text-white` : 'bg-slate-800 text-slate-600'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

    </motion.div>
  );
};

export default Chat;