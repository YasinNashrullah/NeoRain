import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { config } from '../utils/config';
import '../App.css';

// sub components
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import SuggestionChips from '../components/chat/SuggestionChips';
import ChatInput from '../components/chat/ChatInput';

// mood color mapping
const moodColors = {
  happy: {
    bubble1: 'rgba(236, 72, 153, 0.05)',
    bubble2: 'rgba(244, 114, 182, 0.04)',
    primary: 'bg-pink-500',
    text: 'text-pink-600 dark:text-pink-400',
    bgGradient: 'radial-gradient(circle at center, #3f1a28 0%, #020617 100%)',
    bgGradientLight: 'radial-gradient(circle at center, #fce7f3 0%, #f8fafc 100%)'
  },
  calm: {
    bubble1: 'rgba(34, 211, 238, 0.05)',
    bubble2: 'rgba(6, 182, 212, 0.04)',
    primary: 'bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-400',
    bgGradient: 'radial-gradient(circle at center, #0e2a35 0%, #020617 100%)',
    bgGradientLight: 'radial-gradient(circle at center, #ecfeff 0%, #f8fafc 100%)'
  },
  manic: {
    bubble1: 'rgba(250, 204, 21, 0.05)',
    bubble2: 'rgba(234, 179, 8, 0.04)',
    primary: 'bg-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400',
    bgGradient: 'radial-gradient(circle at center, #2e2408 0%, #020617 100%)',
    bgGradientLight: 'radial-gradient(circle at center, #fefce8 0%, #f8fafc 100%)'
  },
  angry: {
    bubble1: 'rgba(251, 146, 60, 0.05)',
    bubble2: 'rgba(249, 115, 22, 0.04)',
    primary: 'bg-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
    bgGradient: 'radial-gradient(circle at center, #331408 0%, #020617 100%)',
    bgGradientLight: 'radial-gradient(circle at center, #fff7ed 0%, #f8fafc 100%)'
  },
  sad: {
    bubble1: 'rgba(99, 102, 241, 0.05)',
    bubble2: 'rgba(79, 70, 229, 0.04)',
    primary: 'bg-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400',
    bgGradient: 'radial-gradient(circle at center, #141430 0%, #020617 100%)',
    bgGradientLight: 'radial-gradient(circle at center, #eef2ff 0%, #f8fafc 100%)'
  },
  default: {
    bubble1: 'rgba(99, 102, 241, 0.05)',
    bubble2: 'rgba(139, 92, 246, 0.04)',
    primary: 'bg-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400',
    bgGradient: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
    bgGradientLight: 'radial-gradient(circle at center, #f1f5f9 0%, #f8fafc 100%)'
  }
};

const Chat = ({ onBack, userData, initialContext, messages, setMessages, currentMood, setCurrentMood }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // state context
  const [activeContext, setActiveContext] = useState(initialContext || null);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  // pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const messagesEndRef = useRef(null);
  const userName = userData?.name?.split(" ")[0] || "Teman";

  const [historyLoaded, setHistoryLoaded] = useState(false);

  // load history initial messages
  useEffect(() => {
    const initData = async () => {
      if (userData?.uid && !historyLoaded) {
        // load assessment history
        const history = await api.getAssessmentHistory(userData.uid);
        setAssessmentHistory(history);

        // load chat history
        const { data, hasMore: more } = await api.getChats(userData.uid, 1);

        if (data.length > 0) {
          // if history exists show it
          const validMessages = data.filter(m => m.text && m.text.trim() !== "");
          setMessages(validMessages.reverse());
          setHasMore(more);
          setPage(2);
        } else {
          // if no history show welcome message or context message
          if (initialContext) {
            handleContextChange(initialContext);
          } else {
            setMessages([{
              id: 'welcome',
              text: `Halo ${userName}! Aku NeoRain 🌧️.\nApa yang sedang kamu rasakan hari ini?`,
              sender: 'ai',
              time: 'Now'
            }]);

          }
        }
        setHistoryLoaded(true);
      } else if (initialContext && historyLoaded) {
        // if coming from chat ai button on analysis page after chat is loaded
        handleContextChange(initialContext);
      }
    };
    initData();
  }, [userData, initialContext]);

  // infinite scroll load
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

  // change context
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

    // trigger AI greeting based on context
    if (context) {
      setTimeout(() => {
        handleSend(`Halo Neo, saya ingin membahas hasil analisis saya tanggal ${new Date(context.created_at).toLocaleDateString("id-ID")}.`, true);
      }, 500);
    }
  };


  // suggestion generator gemini



  // send message logic
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
      // Call API
      // Note: chatWithAI now returns { text, mood, suggestions } in a single call to save RPM
      const { text: aiResponseText, mood, suggestions: newSuggestions } = await api.chatWithAI(textToSend, userData.uid, contextData, userName);

      const newAiMsg = { id: Date.now() + 1, text: aiResponseText, sender: 'ai', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages((prev) => [...prev, newAiMsg]);

      // Mood change from AI
      if (mood && mood !== currentMood && moodColors[mood]) {
        setCurrentMood(mood);
      }

      // Update suggestions from the single API call
      if (newSuggestions && Array.isArray(newSuggestions)) {
        setSuggestions(newSuggestions);
      } else {
        setSuggestions([]);
      }

    } catch (error) {
      console.error("Chat Error", error);
      const errorMessage = error.message.includes("Maaf") ? error.message : "Maaf, Neo sedang pusing 😵. Coba lagi ya.";
      setMessages((prev) => [...prev, { id: Date.now(), text: errorMessage, sender: 'ai', time: 'Now' }]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom controls
    if (!isLoadingMore) {
      scrollToBottom();
    }
  }, [messages, isLoadingMore]);



  const currentStyle = moodColors[currentMood] || moodColors.default;

  return (
    <div className="fixed inset-0 z-50 flex flex-col transition-all duration-1000 ease-in-out bg-slate-50 dark:bg-slate-950">
      {/* background gradient layer */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style={{
          background: currentStyle.bgGradientLight,
          opacity: 1
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out dark:opacity-100 opacity-0"
        style={{
          background: currentStyle.bgGradient
        }}
      />

      {/* floating orbs optional for extra flair */}
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