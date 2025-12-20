import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { config } from '../utils/config';
import '../App.css';

// Sub-components
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import SuggestionChips from '../components/chat/SuggestionChips';
import ChatInput from '../components/chat/ChatInput';

// Mood color mapping
const moodColors = {
  happy: {
    bubble1: 'rgba(236, 72, 153, 0.05)',
    bubble2: 'rgba(244, 114, 182, 0.04)',
    primary: 'bg-pink-500', // Slightly lighter for better contrast
    text: 'text-pink-600 dark:text-pink-400',
    bgGradient: 'radial-gradient(circle at center, #3f1a28 0%, #020617 100%)',
    bgGradientLight: 'radial-gradient(circle at center, #fce7f3 0%, #f8fafc 100%)' // Pink-50 to Slate-50
  },
  calm: {
    bubble1: 'rgba(34, 211, 238, 0.05)',
    bubble2: 'rgba(6, 182, 212, 0.04)',
    primary: 'bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-400',
    bgGradient: 'radial-gradient(circle at center, #0e2a35 0%, #020617 100%)',
    bgGradientLight: 'radial-gradient(circle at center, #ecfeff 0%, #f8fafc 100%)' // Cyan-50 to Slate-50
  },
  manic: {
    bubble1: 'rgba(250, 204, 21, 0.05)',
    bubble2: 'rgba(234, 179, 8, 0.04)',
    primary: 'bg-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400',
    bgGradient: 'radial-gradient(circle at center, #2e2408 0%, #020617 100%)',
    bgGradientLight: 'radial-gradient(circle at center, #fefce8 0%, #f8fafc 100%)' // Yellow-50 to Slate-50
  },
  angry: {
    bubble1: 'rgba(251, 146, 60, 0.05)',
    bubble2: 'rgba(249, 115, 22, 0.04)',
    primary: 'bg-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
    bgGradient: 'radial-gradient(circle at center, #331408 0%, #020617 100%)',
    bgGradientLight: 'radial-gradient(circle at center, #fff7ed 0%, #f8fafc 100%)' // Orange-50 to Slate-50
  },
  sad: {
    bubble1: 'rgba(99, 102, 241, 0.05)',
    bubble2: 'rgba(79, 70, 229, 0.04)',
    primary: 'bg-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400',
    bgGradient: 'radial-gradient(circle at center, #141430 0%, #020617 100%)',
    bgGradientLight: 'radial-gradient(circle at center, #eef2ff 0%, #f8fafc 100%)' // Indigo-50 to Slate-50
  },
  default: {
    bubble1: 'rgba(99, 102, 241, 0.05)',
    bubble2: 'rgba(139, 92, 246, 0.04)',
    primary: 'bg-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400',
    bgGradient: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
    bgGradientLight: 'radial-gradient(circle at center, #f1f5f9 0%, #f8fafc 100%)' // Slate-100 to Slate-50
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

  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load History & Initial Messages
  useEffect(() => {
    const initData = async () => {
      if (userData?.uid && !historyLoaded) {
        // 1. Load Assessment History
        const history = await api.getAssessmentHistory(userData.uid);
        setAssessmentHistory(history);

        // 2. Load Chat History
        const { data, hasMore: more } = await api.getChats(userData.uid, 1);

        if (data.length > 0) {
          // If history exists, show it
          const validMessages = data.filter(m => m.text && m.text.trim() !== "");
          setMessages(validMessages.reverse());
          setHasMore(more);
          setPage(2);
        } else {
          // If NO history, show Welcome Message or Context Message
          if (initialContext) {
            handleContextChange(initialContext);
          } else {
            setMessages([{
              id: 'welcome',
              text: `Halo ${userName}! Aku NeoRain 🌧️.\nApa yang sedang kamu rasakan hari ini?`,
              sender: 'ai',
              time: 'Now'
            }]);
            generateSuggestions([]);
          }
        }
        setHistoryLoaded(true);
      } else if (initialContext && historyLoaded) {
        // If coming from "Chat AI" button on Analysis page AFTER chat is loaded
        handleContextChange(initialContext);
      }
    };
    initData();
  }, [userData, initialContext]);

  // Infinite Scroll Load
  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore || !userData?.uid) return;
    setIsLoadingMore(true);

    try {
      const { data, hasMore: more } = await api.getChats(userData.uid, page);
      if (data.length > 0) {
        setMessages(prev => [...data.reverse(), ...prev]);
        setPage(prev => prev + 1);
        setHasMore(more);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error("Load more error", e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Change Context
  const handleContextChange = (context) => {
    setActiveContext(context);
    setShowHistoryMenu(false);

    let contextMsg = "";
    if (context) {
      const date = new Date(context.created_at).toLocaleDateString("id-ID");
      contextMsg = `[SYSTEM] Mengubah konteks ke hasil analisis tanggal ${date}.\nSkor: D:${context.depression_score} A:${context.anxiety_score} S:${context.stress_score}.`;
    } else {
      contextMsg = `[SYSTEM] Mode obrolan umum diaktifkan.`;
    }

    const sysMsg = { id: Date.now(), text: contextMsg, sender: 'system' };
    setMessages(prev => [...prev, sysMsg]);

    // Trigger AI greeting based on context
    if (context) {
      setTimeout(() => {
        handleSend(`Halo Neo, saya ingin membahas hasil analisis saya tanggal ${new Date(context.created_at).toLocaleDateString("id-ID")}.`, true);
      }, 500);
    }
  };


  // Suggestion Generator (Gemini)
  const generateSuggestions = async (history) => {
    setLoadingSuggestions(true);
    try {
      const { apiKey, baseUrl, model } = config.gemini;
      const recentContext = history.slice(-3).map(m => `${m.sender}: ${m.text}`).join('\n');

      const prompt = `
        Context conversation:
        ${recentContext}
        
        Suggest 3 short, relevant, empathy-based responses for the USER (Indonesia Gaul).
        Max 5 words each.
        Output JSON: { "suggestions": ["text1", "text2", "text3"] }
      `;

      const response = await fetch(`${baseUrl}/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      setSuggestions(result.suggestions || []);

    } catch (e) {
      console.error("Suggestion Error", e);
      setSuggestions(["Ceritakan lebih lanjut", "Aku sedih..", "Saran kamu?"]);
    } finally {
      setLoadingSuggestions(false);
    }
  };


  // Send Message Logic
  const handleSend = async (manualText = null, hidden = false) => {
    const textToSend = manualText || input;
    if (!textToSend.trim()) return;

    if (!hidden) {
      const newUserMsg = { id: Date.now(), text: textToSend, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages((prev) => [...prev, newUserMsg]);
      scrollToBottom();
    }

    setInput('');
    setIsTyping(true);
    setSuggestions([]); // clear old suggestions

    try {
      // Prepare Context for AI
      const contextData = activeContext ? {
        scores: { d: activeContext.depression_score, a: activeContext.anxiety_score, s: activeContext.stress_score },
        ai_analysis: activeContext.ai_analysis,
        date: activeContext.created_at
      } : null;

      // Call API
      const aiResponseText = await api.chatWithAI(textToSend, userData.uid, contextData);

      const newAiMsg = { id: Date.now() + 1, text: aiResponseText, sender: 'ai', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages((prev) => [...prev, newAiMsg]);

      // Detect Mood Change
      const detectedMood = await detectMood(aiResponseText, textToSend);
      if (detectedMood && detectedMood !== currentMood) {
        setCurrentMood(detectedMood);
      }

      // Generate next suggestions
      generateSuggestions([...messages, { text: textToSend, sender: 'user' }, newAiMsg]);

    } catch (error) {
      console.error("Chat Error", error);
      setMessages((prev) => [...prev, { id: Date.now(), text: "Maaf, Neo sedang pusing 😵. Coba lagi ya.", sender: 'ai', time: 'Now' }]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };


  const detectMood = async (aiText, userText) => {
    // Simple verification - real implementation would check intent
    const keywords = {
      happy: ['senang', 'bahagia', 'semangat', 'keren', 'hebat', 'bersyukur'],
      sad: ['sedih', 'kecewa', 'nangis', 'lelah', 'capek', 'sakit'],
      angry: ['marah', 'kesal', 'benci', 'emosi', 'gila'],
      calm: ['tenang', 'santai', 'damai', 'oke', 'baik'],
      manic: ['energi', 'fokus', 'produktif', 'cepat']
    };

    const text = (aiText + " " + userText).toLowerCase();
    for (const [mood, words] of Object.entries(keywords)) {
      if (words.some(w => text.includes(w))) return mood;
    }
    return null; // keep current
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const currentStyle = moodColors[currentMood] || moodColors.default;

  return (
    <div className="fixed inset-0 z-50 flex flex-col transition-all duration-1000 ease-in-out bg-slate-50 dark:bg-slate-950">
      {/* Background Gradient Layer */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style={{
          background: currentStyle.bgGradientLight, // Default to light gradient
          opacity: 1 // Always visible base
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out dark:opacity-100 opacity-0"
        style={{
          background: currentStyle.bgGradient // Dark gradient overlay
        }}
      />

      {/* Floating Orbs (Optional for extra flair) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
          style={{ backgroundColor: currentStyle.bubble1 }}
        ></div>
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
          style={{ backgroundColor: currentStyle.bubble2 }}
        ></div>
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
        onLoadMore={handleLoadMore}
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
        handleSend={() => handleSend()}
        isTyping={isTyping}
        userName={userName}
        currentStyle={currentStyle}
      />
    </div>
  );
};

export default Chat;