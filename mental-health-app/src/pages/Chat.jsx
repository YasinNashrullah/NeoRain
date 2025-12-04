import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Mic, MoreVertical,
  ArrowLeft, Sparkles, Loader2
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

const Chat = ({ onBack, userData, currentMood, setCurrentMood, messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Local messages state removed - using props instead

  const messagesEndRef = useRef(null);

  // Load Chat History logic removed - handled in App.jsx


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

    // Save User Message to DB
    if (userData?.uid) {
      api.saveChat({
        firebase_uid: userData.uid,
        message: userMsg.text,
        sender: 'user'
      }).catch(err => console.error("Failed to save user chat:", err));
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const historyForAI = messages.slice(-5).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "SYSTEM: Jawab pendek, santai, gaya mahasiswa. Analisis emosi user dari percakapan. Jika user terlihat bahagia/senang -> 'happy'. Sedih/galau/cemas -> 'sad'. Marah/kesal -> 'angry'. Semangat berapi-api -> 'manic'. Tenang/biasa -> 'calm'. Di AKHIR response, WAJIB sertakan tag mood dalam format: ||MOOD:happy|| atau ||MOOD:sad|| dst. Default 'calm'." }]
          },
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
        if (moodColors[detectedMood]) {
          setCurrentMood(detectedMood);
        }
        // Remove mood tag from text to display
        text = text.replace(/\|\|MOOD:\w+\|\|/, '').trim();
      }

      const aiMsg = {
        id: Date.now() + 1,
        text: text,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);

      // Save AI Message to DB
      if (userData?.uid) {
        api.saveChat({
          firebase_uid: userData.uid,
          message: aiMsg.text,
          sender: 'ai'
        }).catch(err => console.error("Failed to save AI chat:", err));
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now(), text: "Error koneksi.", sender: 'ai', time: 'Now'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const currentStyle = moodColors[currentMood] || moodColors.default;

  return (
    // STRUKTUR: Flex Column Full Height
    <motion.div
      className="flex flex-col w-full h-full relative overflow-hidden"
      animate={{ background: currentStyle.bgGradient }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >

      {/* Animated Bubble Background - Dynamic Colors */}
      <div className="chat-bubbles-container">
        <div
          className="chat-bubble chat-bubble-1"
          style={{ background: currentStyle.bubble1 }}
        ></div>
        <div
          className="chat-bubble chat-bubble-2"
          style={{ background: currentStyle.bubble2 }}
        ></div>
      </div>

      {/* --- 1. HEADER (Static) --- */}
      <div className="flex-none w-full bg-transparent border-b border-white/10 z-20">
        <div className="px-4 py-3 pt-8 md:pt-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=NeoRain" alt="AI" className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">NeoRain AI</h1>
              <p className={`${currentStyle.text} text-[10px] transition-colors duration-700 ease-in-out`}>Teman Curhat</p>
            </div>
          </div>
          <MoreVertical className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* --- 2. CHAT AREA (Scrollable) --- */}
      {/* FIX PENTING: min-h-0 mencegah flex item meluap keluar container */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide relative z-10">
        <div className="p-4 space-y-4 flex flex-col justify-end min-h-full">
          <div className="h-4 flex-none"></div> {/* Spacer atas */}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-md transition-colors duration-700 ease-in-out whitespace-pre-wrap break-words ${msg.sender === 'user'
                ? `${currentStyle.primary} text-white rounded-tr-sm text-left`
                : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5 text-left'
                }`}>
                {msg.text}
                <div className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</div>
              </div>
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
          {/* Elemen target scroll */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* --- 3. INPUT AREA (Static) --- */}
      <div className="flex-none w-full bg-transparent border-t border-white/5 p-4 pb-6 z-20">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[24px] flex items-end px-2 py-2">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; // Max height approx 4 lines
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                  e.target.style.height = 'auto'; // Reset height
                }
              }}
              placeholder="Cerita sini..."
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