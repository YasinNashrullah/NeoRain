import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import '../App.css';

// Sub-components
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import SuggestionChips from '../components/chat/SuggestionChips';
import ChatInput from '../components/chat/ChatInput';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL_NAME = "z-ai/glm-4.5-air:free";

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

const Chat = ({ onBack, userData, initialContext, messages, setMessages, currentMood, setCurrentMood }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // State Context
  const [activeContext, setActiveContext] = useState(initialContext || null);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Suggestions State
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const messagesEndRef = useRef(null);
  const userName = userData?.name?.split(" ")[0] || "Teman";

  // Load History & Initial Messages
  useEffect(() => {
    const initData = async () => {
      if (userData?.uid) {
        const history = await api.getAssessmentHistory(userData.uid);
        setAssessmentHistory(history);

        if (messages.length === 0) {
          const { data, hasMore: more } = await api.getChats(userData.uid, 1);
          if (data.length > 0) {
            setMessages(data.reverse());
            setHasMore(more);
            setPage(2);
          }
        }
      }
    };
    initData();
  }, [userData]);

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !userData?.uid) return;

    setIsLoadingMore(true);
    try {
      const { data, hasMore: more } = await api.getChats(userData.uid, page);
      if (data.length > 0) {
        setMessages(prev => [...data.reverse(), ...prev]);
        setHasMore(more);
        setPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error("Failed to load more chats", e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Generate Smart Suggestions (Optimized: Fallback Only)
  useEffect(() => {
    // NOTE: API call moved to handleSend within the main prompt (Single Pass)
    // This reduces token usage by ~50%

    // Initial/Default suggestions only
    if (messages.length === 0) {
      if (activeContext) {
        const { stress_score, anxiety_score, depression_score } = activeContext;
        let defaultSuggestions = [];
        if (stress_score > 14) defaultSuggestions.push("Kenapa dadaku terasa sesak terus?");
        if (anxiety_score > 7) defaultSuggestions.push("Bagaimana menghentikan rasa takut ini?");
        if (depression_score > 9) defaultSuggestions.push("Aku merasa hampa dan kosong");
        defaultSuggestions.push("Jelaskan apa yang terjadi padaku");
        defaultSuggestions.push("Aku ingin merasa lebih baik");
        setSuggestions(defaultSuggestions);
      } else {
        setSuggestions([
          "Rasanya berat sekali hari ini",
          "Aku merasa sendirian",
          "Bagaimana cara berdamai dengan diri sendiri?",
          "Aku lelah berpura-pura kuat"
        ]);
      }
    }
  }, [activeContext, messages.length]);

  useEffect(() => {
    if (messages.length > 0 || isLoadingMore) return;

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

  // --- HANDLE SEND (OPTIMIZED SINGLE PASS) ---
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

    if (userData?.uid) {
      api.saveChat({ firebase_uid: userData.uid, message: userMsg.text, sender: 'user' }).catch(err => { });
    }

    try {
      if (!OPENROUTER_API_KEY) throw new Error("API Key OpenRouter missing");

      // 1. System Prompt (JSON ENFORCED)
      let systemInstruction = `
        Kamu adalah NeoRain, teman curhat mahasiswa.
        Nama User: ${userName}.
        Gaya Bicara: Santai, gaul, suportif, pakai "aku-kamu" atau "lu-gua". Panggil user dengan nama "${userName}" sesekali agar akrab.
        
        TUGAS UTAMA:
        1. Jawab curhatan user dengan empati.
        2. Analisis mood user.
        3. Berikan 3 saran balasan singkat untuk user (Smart Reply).

        FORMAT RESPON WAJIB JSON (Jangan gunakan markdown block):
        {
          "reply": "Isi balasan kamu ke user di sini...",
          "mood": "happy|sad|angry|manic|calm",
          "suggestions": ["Saran 1", "Saran 2", "Saran 3"]
        }
      `;

      if (activeContext) {
        const aiReport = typeof activeContext.ai_analysis === 'string'
          ? JSON.parse(activeContext.ai_analysis)
          : activeContext.ai_analysis;

        systemInstruction += `
        \n[DATA KESEHATAN MENTAL USER]
        Tanggal: ${new Date(activeContext.created_at).toLocaleDateString()}
        Skor: Depresi ${activeContext.depression_score}, Cemas ${activeContext.anxiety_score}, Stres ${activeContext.stress_score}.
        Summary AI: "${aiReport?.summary || '-'}"
        User bertanya terkait hasil ini.
        `;
      }

      // 2. History Messages (OPTIMIZED: Last 5 Messages)
      const historyForAI = messages
        .filter(m => m.sender !== 'system')
        .slice(-5) // Reduced from 10 to 5 to save tokens
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      const apiMessages = [
        { role: "system", content: systemInstruction },
        ...historyForAI,
        { role: "user", content: userMsg.text }
      ];

      // 3. Fetch OpenRouter
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.href,
          "X-Title": "NeoRain"
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 600, // Slightly increased to accommodate JSON
          response_format: { type: "json_object" } // Safe guard for models that support it
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API Error: ${response.status}`);
      }

      const data = await response.json();
      let rawContent = data.choices[0].message.content;

      // Clean up & Parse
      rawContent = rawContent.replace(/```json|```/g, '').trim();

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(rawContent);
      } catch (e) {
        console.warn("JSON Parse Failed, fallback to raw text", e);
        // Fallback attempts
        const moodMatch = rawContent.match(/mood":\s*"(\w+)"/i);
        parsedResponse = {
          reply: rawContent,
          mood: moodMatch ? moodMatch[1] : 'default',
          suggestions: []
        };
      }

      // Update UI with Parsed Data
      if (parsedResponse.mood && moodColors[parsedResponse.mood.toLowerCase()]) {
        setCurrentMood(parsedResponse.mood.toLowerCase());
      }

      if (Array.isArray(parsedResponse.suggestions) && parsedResponse.suggestions.length > 0) {
        setSuggestions(parsedResponse.suggestions);
      }

      const aiMsg = {
        id: Date.now() + 1,
        text: parsedResponse.reply || "Maaf, aku tidak mengerti.",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);

      if (userData?.uid) {
        // Save only the text reply to DB
        api.saveChat({ firebase_uid: userData.uid, message: aiMsg.text, sender: 'ai' }).catch(err => { });
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now(), text: "Maaf, ada gangguan koneksi ke otak AI.", sender: 'ai', time: 'Now' }]);
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
        onLoadMore={loadMoreMessages}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
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