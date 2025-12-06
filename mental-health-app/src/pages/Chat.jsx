import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from '../utils/api';
import '../App.css';

// Sub-components
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import SuggestionChips from '../components/chat/SuggestionChips';
import ChatInput from '../components/chat/ChatInput';

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

const Chat = ({ onBack, userData, initialContext, messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Removed local messages state
  const [currentMood, setCurrentMood] = useState('default');

  // State Context
  const [activeContext, setActiveContext] = useState(initialContext || null);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  // Suggestions State
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

  // Generate Smart Suggestions
  useEffect(() => {
    const generateSuggestions = async () => {
      // Avoid re-generating if typing or no API key
      if (!import.meta.env.VITE_GEMINI_API_KEY) return;

      const lastMsg = messages[messages.length - 1];
      const isAiLast = lastMsg?.sender === 'ai';

      // If AI just replied, generate relevant follow-ups
      if (isAiLast) {
        setLoadingSuggestions(true);
        try {
          const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

          const prompt = `
            Context: User is chatting with an AI therapist.
            AI just said: "${lastMsg.text}"
            
            Generate 3 short, natural, deep/reflective Indonesian replies (max 6 words) for the USER to say next.
            Tone: Vulnerable, honest, or curious.
            Constraint: NO EMOJIS. Plain text only.
            Example: ["Aku merasa sedikit lega", "Tapi sulit melupakannya", "Apa saranmu?"].
            Output ONLY a JSON array of strings.
          `;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text().replace(/```json|```/g, '').trim();

          const aiSuggestions = JSON.parse(text);
          if (Array.isArray(aiSuggestions) && aiSuggestions.length > 0) {
            setSuggestions(aiSuggestions);
          }
        } catch (error) {
          console.error("Failed to generate follow-up suggestions", error);
        } finally {
          setLoadingSuggestions(false);
        }
        return; // Exit after handling AI response
      }

      // If no messages or last was user (waiting for AI), show defaults/context
      if (messages.length === 0 || lastMsg?.sender === 'user') {
        if (suggestions.length > 0 && lastMsg?.sender === 'user') return;
      }

      setLoadingSuggestions(true);

      // 1. Default Suggestions (Deep & Reflective - No Emojis)
      let defaultSuggestions = [
        "Rasanya berat sekali hari ini",
        "Aku merasa sendirian di keramaian",
        "Bagaimana cara berdamai dengan diri sendiri?",
        "Aku butuh seseorang yang mengerti",
        "Pikiranku tidak bisa diam",
        "Aku lelah berpura-pura kuat",
        "Apa arti dari semua ini?"
      ];

      // 2. Context-based Suggestions (Rule-based Fallback)
      if (activeContext) {
        const { stress_score, anxiety_score, depression_score } = activeContext;
        defaultSuggestions = []; // Reset defaults

        if (stress_score > 14) defaultSuggestions.push("Kenapa dadaku terasa sesak terus?");
        if (anxiety_score > 7) defaultSuggestions.push("Bagaimana menghentikan rasa takut ini?");
        if (depression_score > 9) defaultSuggestions.push("Aku merasa hampa dan kosong");
        defaultSuggestions.push("Jelaskan apa yang terjadi padaku");
        defaultSuggestions.push("Aku ingin merasa lebih baik");
        defaultSuggestions.push("Apakah ini akan berlalu?");
      }

      setSuggestions(defaultSuggestions); // Show immediate fallback

      // 3. AI-based Suggestions (Personalized Context)
      if (activeContext && import.meta.env.VITE_GEMINI_API_KEY) {
        try {
          const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

          const prompt = `
            Based on this mental health data:
            Depression: ${activeContext.depression_score}, Anxiety: ${activeContext.anxiety_score}, Stress: ${activeContext.stress_score}.
            Summary: ${activeContext.ai_analysis?.summary || '-'}.
            
            Generate 6 deep, emotional, and reflective Indonesian conversation starters (max 8 words) for the user to say to their AI therapist.
            Tone: Vulnerable, seeking understanding, heart-to-heart.
            Constraint: NO EMOJIS. Plain text only.
            Output ONLY a JSON array of strings.
          `;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text().replace(/```json|```/g, '').trim();

          const aiSuggestions = JSON.parse(text);
          if (Array.isArray(aiSuggestions) && aiSuggestions.length > 0) {
            setSuggestions(aiSuggestions);
          }
        } catch (error) {
          console.error("Failed to generate AI suggestions", error);
        }
      }

      setLoadingSuggestions(false);
    };

    generateSuggestions();
  }, [activeContext, messages]);

  useEffect(() => {
    // Only set initial message if history is empty
    if (messages.length > 0) return;

    if (initialContext) {
      setActiveContext(initialContext);
      setMessages([{
        id: 'sys-init',
        text: `Mode Analisis Aktif: Menggunakan data tanggal ${new Date(initialContext.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}. Silakan tanya tentang hasil ini.`,
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
      api.saveChat({ firebase_uid: userData.uid, message: userMsg.text, sender: 'user' }).catch(err => { });
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
        api.saveChat({ firebase_uid: userData.uid, message: aiMsg.text, sender: 'ai' }).catch(err => { });
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

      <ChatHeader
        onBack={onBack}
        currentStyle={currentStyle}
        activeContext={activeContext}
        handleContextChange={handleContextChange}
        showHistoryMenu={showHistoryMenu}
        setShowHistoryMenu={setShowHistoryMenu}
        assessmentHistory={assessmentHistory}
      />

      <MessageList
        messages={messages}
        currentStyle={currentStyle}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
      />

      <SuggestionChips
        suggestions={suggestions}
        loadingSuggestions={loadingSuggestions}
        setInput={setInput}
      />

      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        isTyping={isTyping}
        userName={userName}
        currentStyle={currentStyle}
      />

    </motion.div>
  );
};

export default Chat;