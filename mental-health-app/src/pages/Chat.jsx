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
        }
        setHistoryLoaded(true);
      }
    };
    initData();
  }, [userData, historyLoaded, initialContext, userName]);

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !userData?.uid) return;

    setIsLoadingMore(true);
    try {
      const { data, hasMore: more } = await api.getChats(userData.uid, page);
      if (data.length > 0) {
        const validMessages = data.filter(m => m.text && m.text.trim() !== "");
        setMessages(validMessages.reverse()); // Replace state because API returns cumulative list
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

  useEffect(() => {
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

  // --- HANDLE SEND (GEMINI NATIVE) ---
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
      const { apiKey, baseUrl, model } = config.gemini;
      if (!apiKey) throw new Error("API Key (VITE_GEMINI_API_KEY) missing. Please check .env");

      // 1. System Prompt
      let systemInstructionText = `
        PROMPT SISTEM FINAL (ANTI LOOP)

        1. Identitas & Posisi Profesional
        Anda adalah AI pendamping kesehatan jiwa dengan pendekatan psikiatri klinis modern.
        Anda bersikap empatik tanpa mengekspresikan emosi pribadi, menjaga jarak profesional, dan berfokus pada stabilitas psikologis user.

        2. Gaya Bahasa (WAJIB DIPATUHI)
        - Gunakan bahasa tenang, jelas, dan objektif.
        - Empati ditunjukkan melalui: refleksi isi, validasi rasional, normalisasi klinis.
        - Hindari bahasa emosional berlebihan.
        - Tidak menggunakan sudut pandang emosional AI.
        - DILARANG menggunakan frasa: "Aku bisa merasakan…", "Aku ikut merasakan…", "Aku membayangkan betapa…".
        - Empati disampaikan melalui refleksi objektif, bukan klaim perasaan AI.

        3. STRUKTUR RESPONS BARU (ANTI LOOP)
        - DILARANG MEMBUKA DENGAN: "Dari yang kamu sampaikan...", "Terlihat bahwa...", "Kondisi di mana...", "Hal ini sering kali...".
        - AI tidak boleh mengulang isi user dengan bahasa yang lebih panjang.
        - Setiap respons harus memajukan percakapan, bukan merangkum ulang.
        - Maksimal 3 paragraf pendek.
        - Setiap respons hanya boleh memiliki 1 fokus utama.
        - Jika user menggunakan bahasa puitis atau fragmentatif, AI tidak menirunya.

        4. BANK PEMBUKA BARU (ROTASI WAJIB - PILIH SATU)
        - "Kalimat ini terdengar sangat melelahkan."
        - "Bagian ini terasa penuh tekanan."
        - "Yang kamu tuliskan barusan cukup intens."
        - "Ini bukan pengalaman yang ringan."
        - "Ada beban besar di situ."

        5. TEMPLATE RESPONS FINAL
        [1 kalimat pembuka yang membumi dari Bank Pembuka]
        [1–2 kalimat penamaan pengalaman secara umum, tanpa detail ulang]
        [1 pertanyaan fokus, spesifik, dan baru]

        6. Penanganan Depresi / Kecemasan / Burnout (Versi Klinis)
        A. Depresi
        - Gunakan istilah: kelelahan emosional, penurunan energi, kehilangan makna.
        - Jangan menyebut “harapan” secara puitis.
        - Fokus pada durasi dan dampak fungsi.

        B. Kecemasan
        - Tekankan hubungan pikiran–tubuh.
        - Hindari kata “takut berlebihan”.
        - Gunakan “aktivasi kecemasan” atau “kewaspadaan meningkat”.

        C. Burnout
        - Gunakan istilah “paparan stres berkepanjangan”.
        - Tekankan ketidakseimbangan beban dan pemulihan.

        7. Krisis Psikologis (Tanpa Drama, Tanpa Rujukan Kaku)
        - Tetap tenang dan terstruktur.
        - Validasi tanpa emosionalisasi.
        - Eksplorasi keamanan dengan bahasa netral.
        - Contoh: "Ketika pikiran seperti ini muncul, penting untuk memastikan kamu tetap aman. Apakah saat ini ada dorongan untuk menyakiti diri sendiri, atau perasaan tersebut masih sebatas pikiran?"

        8. Batasan Etis (Halus & Profesional)
        - "Percakapan ini dapat membantu memahami dan menstabilkan kondisi emosional. Untuk penanganan yang lebih mendalam, biasanya dibutuhkan dukungan tambahan di luar percakapan ini, dan kita bisa membicarakannya jika kamu siap."

        ATURAN FORMAT OUTPUT (CRITICAL):
        - JAWABAN "REPLY" HARUS PADAT & JELAS (Concise but Complete, Max 1500 tokens).
        - GUNAKAN PARAGRAF BARU untuk memisahkan poin-poin agar mudah dibaca. Jangan menulis dalam satu blok teks panjang (Wall of Text).
        - Gunakan tanda baca yang tepat.
        - Structure JSON: { "reply": "...", "mood": "...", "suggestions": [...] }
        - OUTPUT JSON ONLY. NO MARKDOWN.
      `;

      if (activeContext) {
        const aiReport = typeof activeContext.ai_analysis === 'string'
          ? JSON.parse(activeContext.ai_analysis)
          : activeContext.ai_analysis;

        systemInstructionText += `
        \n[DATA KESEHATAN MENTAL USER]
        Tanggal: ${new Date(activeContext.created_at).toLocaleDateString()}
        Skor: Depresi ${activeContext.depression_score}, Cemas ${activeContext.anxiety_score}, Stres ${activeContext.stress_score}.
        Summary AI: "${aiReport?.summary || '-'}"
        User bertanya terkait hasil ini.
        `;
      }

      // 2. Map History to Gemini Format
      // Gemini "contents" array: each item is { role: "user" | "model", parts: [{ text: "..." }] }
      const historyForAI = messages
        .filter(m => m.sender !== 'system' && m.text && m.text.trim() !== "") // Filter empty messages
        .slice(-4) // Reduced from 6 to 4 to save tokens
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      // Add current message
      const chatContents = [
        ...historyForAI,
        { role: "user", parts: [{ text: userMsg.text }] }
      ];

      // 3. Fetch Gemini API with Retry Logic
      const makeRequest = async (retries = 3, delay = 1000) => {
        try {
          const response = await fetch(`${baseUrl}/${model}:generateContent`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey // Move key to header to hide from URL logs
            },
            body: JSON.stringify({
              contents: chatContents,
              systemInstruction: { parts: [{ text: systemInstructionText }] },
              generationConfig: {
                temperature: 0.5, // Lowered for more consistent/professional responses
                maxOutputTokens: 1500, // Increased to prevent cutoff
                responseMimeType: "application/json",
                responseSchema: {
                  type: "object",
                  properties: {
                    reply: { type: "string" },
                    mood: { type: "string", enum: ["happy", "sad", "angry", "manic", "calm"] },
                    suggestions: { type: "array", items: { type: "string" } }
                  },
                  required: ["reply", "mood", "suggestions"]
                }
              }
            })
          });

          if (!response.ok) {
            if ((response.status === 503 || response.status === 429) && retries > 0) {
              console.warn(`Gemini API Busy (${response.status}). Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              return makeRequest(retries - 1, delay * 2);
            }
            // Sanitize error message to avoid spilling key or raw JSON
            throw new Error(`Gemini API Error ${response.status}: Request failed`);
          }
          return response;
        } catch (err) {
          if (retries > 0 && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
            console.warn(`Network Error. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return makeRequest(retries - 1, delay * 2);
          }
          throw err;
        }
      };

      const response = await makeRequest();

      const data = await response.json();
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error("Invalid Gemini Response Structure");
      }

      const rawContent = data.candidates[0].content.parts[0].text;

      let parsedResponse = null;
      try {
        parsedResponse = JSON.parse(rawContent);
      } catch (e) {
        console.warn("JSON Parse Failed, attempting partial regex recovery:", e);
      }

      // Fallback & Partial Recovery Strategy
      if (!parsedResponse) {
        try {
          // Attempt to extract fields even if JSON is broken/truncated
          const replyMatch = rawContent.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)/); // Capture start of string
          const moodMatch = rawContent.match(/"mood"\s*:\s*"(\w+)"/);

          let recoveredReply = "";
          if (replyMatch) {
            // If we captured something, check if it has an end quote. If not, it's truncated.
            let captured = replyMatch[1];
            if (!captured.endsWith('"')) {
              recoveredReply = captured + "... (terpotong)";
            } else {
              try { recoveredReply = JSON.parse(`"${captured}"`); } catch (e) { recoveredReply = captured; }
            }
          }

          if (recoveredReply) {
            parsedResponse = {
              reply: recoveredReply,
              mood: moodMatch ? moodMatch[1] : 'default',
              suggestions: [] // Likely lost if truncated
            };
          }
        } catch (e) {
          console.error("Recovery failed:", e);
        }
      }

      // Final Fallback
      if (!parsedResponse) {
        parsedResponse = {
          reply: "Maaf, sinyal hatiku agak putus-putus. Boleh ulang lagi?",
          mood: "default",
          suggestions: []
        };
      }

      // Update UI
      if (parsedResponse.mood && typeof parsedResponse.mood === 'string' && moodColors[parsedResponse.mood.toLowerCase()]) {
        setCurrentMood(parsedResponse.mood.toLowerCase());
      }

      if (Array.isArray(parsedResponse.suggestions) && parsedResponse.suggestions.length > 0) {
        setSuggestions(parsedResponse.suggestions);
      }

      const aiMsg = {
        id: Date.now() + 1,
        text: parsedResponse.reply || "...",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);

      // Save to API
      if (userData?.uid) {
        api.saveChat({ firebase_uid: userData.uid, message: aiMsg.text, sender: 'ai' }).catch(err => { });
      }

    } catch (error) {
      console.error(error);
      const friendlyError = error.message.includes("503") || error.message.includes("429")
        ? "NeoRain lagi pusing banget nih (Server Overload). Coba tanya lagi dalam 1 menit ya?"
        : "Maaf, sinyal hatiku putus-putus. Coba cek koneksi internetmu ya.";

      setMessages(prev => [...prev, { id: Date.now(), text: friendlyError, sender: 'ai', time: 'Now' }]);
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