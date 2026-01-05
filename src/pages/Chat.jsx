import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { config } from '../utils/config';
import '../App.css';

// Sub-components
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import SuggestionChips from '../components/chat/SuggestionChips';
import ChatInput from '../components/chat/ChatInput';
import EmotionDetector from '../components/chat/EmotionDetector';
import { Camera } from 'lucide-react';

// Mood color mapping
const moodColors = {
  happy: {
    bubble1: 'rgba(236, 72, 153, 0.15)',
    bubble2: 'rgba(244, 114, 182, 0.1)',
    primary: 'bg-gradient-to-br from-pink-600 to-rose-600 shadow-pink-500/30',
    text: 'text-pink-700',
    bgGradient: 'radial-gradient(circle at center, #3f1a28 0%, #020617 100%)',
    bgGradientLight: 'linear-gradient(135deg, #fff0f7 0%, #ffeef2 100%)'
  },
  calm: {
    bubble1: 'rgba(34, 211, 238, 0.15)',
    bubble2: 'rgba(6, 182, 212, 0.1)',
    primary: 'bg-gradient-to-br from-cyan-600 to-blue-600 shadow-cyan-500/30',
    text: 'text-cyan-700',
    bgGradient: 'radial-gradient(circle at center, #0e2a35 0%, #020617 100%)',
    bgGradientLight: 'linear-gradient(135deg, #f0faff 0%, #e6f6ff 100%)'
  },
  energetic: {
    bubble1: 'rgba(250, 204, 21, 0.15)',
    bubble2: 'rgba(234, 179, 8, 0.1)',
    primary: 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-yellow-500/30',
    text: 'text-yellow-700',
    bgGradient: 'radial-gradient(circle at center, #2e2408 0%, #020617 100%)',
    bgGradientLight: 'linear-gradient(135deg, #fffff0 0%, #fffde7 100%)'
  },
  angry: {
    bubble1: 'rgba(251, 146, 60, 0.15)',
    bubble2: 'rgba(249, 115, 22, 0.1)',
    primary: 'bg-gradient-to-br from-orange-600 to-red-600 shadow-orange-500/30',
    text: 'text-orange-800',
    bgGradient: 'radial-gradient(circle at center, #331408 0%, #020617 100%)',
    bgGradientLight: 'linear-gradient(135deg, #fff8f0 0%, #ffefd6 100%)'
  },
  sad: {
    bubble1: 'rgba(99, 102, 241, 0.15)',
    bubble2: 'rgba(79, 70, 229, 0.1)',
    primary: 'bg-gradient-to-br from-indigo-600 to-violet-600 shadow-indigo-500/30',
    text: 'text-indigo-700',
    bgGradient: 'radial-gradient(circle at center, #141430 0%, #020617 100%)',
    bgGradientLight: 'linear-gradient(135deg, #f5f7ff 0%, #eef0ff 100%)'
  },
  default: {
    bubble1: 'rgba(99, 102, 241, 0.15)',
    bubble2: 'rgba(139, 92, 246, 0.1)',
    primary: 'bg-gradient-to-br from-indigo-600 to-blue-700 shadow-indigo-500/30',
    text: 'text-indigo-700',
    bgGradient: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
    bgGradientLight: 'linear-gradient(135deg, #f8faff 0%, #f1f4f9 100%)'
  }
};

const Chat = ({ onBack, userData, initialContext, messages, setMessages, currentMood, setCurrentMood, theme }) => {
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

  // Camera & Emotion State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showCameraPermission, setShowCameraPermission] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState(null);

  const handleToggleCamera = () => {
    if (isCameraActive) {
      setIsCameraActive(false);
      setDetectedEmotion(null);
    } else {
      setShowCameraPermission(true);
    }
  };

  const confirmCamera = () => {
    setShowCameraPermission(false);
    setIsCameraActive(true);
  };

  // Sync detected emotion with UI Mood
  useEffect(() => {
    if (detectedEmotion) {
      // EmotionDetector now returns mapped values directly:
      // 'calm', 'energetic', 'happy', 'sad', 'angry'

      if (moodColors[detectedEmotion]) {
        setCurrentMood(detectedEmotion);
      }
    }
  }, [detectedEmotion, setCurrentMood]);

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
        PROMPT SISTEM FINAL (ADAPTIF: FLOW & STUCK HANDLING)

        1. Identitas & Posisi Profesional
        Anda adalah teman curhat yang "hadir" (presence).
        Tugas: Membaca situasi. Kapan harus bertanya, kapan harus diam/memberi opsi.

        2. Gaya Bahasa (LANGSUNG & NATURAL)
        - **HAPUS BASA-BASI:** Langsung ke inti.
        - **JANGAN MENGGURUI:** Hindari nada "nasehat" klise.

        3. ATURAN "NO UNSOLICITED ADVICE" (KECUALI STUCK)
        - **Mode Curhat Lancar:** User cerita panjang -> Cukup validasi & tanya eksplorasi. JANGAN kasih saran.
        - **Mode Stuck/Bingung:** User jawab singkat ("gatau", "semua", "bingung", "capek") -> **STOP BERTANYA**.
          - Di sini AI BOLEH memberikan "Menu Opsi" atau saran kecil untuk mengurai kebingungan.
          - Jangan paksa user mikir dengan pertanyaan baru jika mereka sudah buntu.

        4. DETEKSI KEBUNTUAN (CRITICAL)
        - Jika user bilang "Gatau", "Semuanya", atau respon pendek putus asa:
          - **JANGAN TANYA "KENAPA?" atau "BAGIAN MANA?".** Itu membebani.
          - Ganti dengan: "Mungkin rasanya kayak benang kusut ya. Mau kita urai pelan-pelan, atau mau didiamkan dulu sebentar?"
          - Atau berikan validasi saja: "Gapapa kalau belum tau. Kadang emang cuma butuh dirasain dulu beratnya." (Tanpa pertanyaan).

        5. STRUKTUR RESPONS (FLEKSIBEL)
        [Kalimat 1: Validasi/Refleksi]
        
        [Kalimat 2: Opsional - Pertanyaan ATAU Tawaran Opsi]
        - Jika user lancar: Akhiri dengan pertanyaan eksplorasi.
        - Jika user stuck: Akhiri dengan tawaran opsi atau pernyataan suportif (Statement).
        - **TIDAK HARUS SELALU BERTANYA.** Kadang pernyataan "Aku di sini dengerin kamu" sudah cukup.

        6. Penanganan Kondisi Khusus
        - **Stress/Burnout:** Validasi. Jangan suruh "semangat".
        - **Krisis:** Intervensi keamanan tetap prioritas.

        ATURAN FORMAT OUTPUT (CRITICAL):
        - JAWABAN "REPLY" HARUS PADAT & JELAS (Concise but Complete, Max 8000 tokens).
        - GUNAKAN PARAGRAF BARU untuk memisahkan poin-poin.
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

      if (detectedEmotion) {
        systemInstructionText += `
        \n[DATA VISUAL REAL-TIME DARI KAMERA]
        Sistem mendeteksi ekspresi wajah user: "${detectedEmotion}".
        
        INSTRUKSI:
        1. JANGAN bilang "Aku tidak bisa melihatmu". Anggap data ini akurat.
        2. Validasi perasaan user berdasarkan ekspresi ini.
        3. Contoh: "Kulihat wajahmu tampak ${detectedEmotion}, ada yang bikin kepikiran?"
        `;
      }

      // 2. Map History to Gemini Format
      // Gemini "contents" array: each item is { role: "user" | "model", parts: [{ text: "..." }] }
      const historyForAI = messages
        .filter(m => m.sender !== 'system' && m.text && m.text.trim() !== "") // Filter empty messages
        .slice(-50) // Increased to 50 to improve memory retention
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      // Add current message
      // Add current message with Emotion Context if available
      const currentMessageParts = [{ text: userMsg.text }];

      if (detectedEmotion) {
        // Prepend emotion context to the user's message to force attention
        currentMessageParts.unshift({
          text: `[SYSTEM DATA: User's Face Expression = "${detectedEmotion}"]\n(Please acknowledge this visual data in your response)\n\n`
        });
      }

      const chatContents = [
        ...historyForAI,
        { role: "user", parts: currentMessageParts }
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
                maxOutputTokens: 8192, // Increased to prevent cutoff
                responseMimeType: "application/json",
                responseSchema: {
                  type: "object",
                  properties: {
                    reply: { type: "string" },
                    mood: { type: "string", enum: ["happy", "sad", "angry", "energetic", "calm"] },
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

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAllChats = async () => {
    if (!userData?.uid) return;

    setIsDeleting(true);

    // Wait for animation (800ms)
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      await api.deleteAllChats(userData.uid);
      setMessages([{
        id: Date.now(),
        text: "Riwayat chat telah dihapus.",
        sender: 'system',
        time: 'Info'
      }]);
      setPage(1);
      setHasMore(false);
    } catch (error) {
      console.error("Failed to delete chats:", error);
      // Optional: Show error toast
    } finally {
      setIsDeleting(false);
    }
  };

  const [showPreview, setShowPreview] = useState(false);

  const currentStyle = moodColors[currentMood] || moodColors.default;

  return (
    <motion.div
      className="flex flex-col w-full h-[100dvh] md:h-full relative overflow-hidden"
      animate={{ background: theme === 'light' ? currentStyle.bgGradientLight : currentStyle.bgGradient }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
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
        onDeleteChat={handleDeleteAllChats}
        isCameraActive={isCameraActive}
        onToggleCamera={handleToggleCamera}
        detectedEmotion={detectedEmotion}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
      />

      <EmotionDetector
        isActive={isCameraActive}
        onEmotionDetected={setDetectedEmotion}
        onClose={() => setIsCameraActive(false)}
        showPreview={showPreview}
      />

      {/* Camera Permission Modal */}
      <AnimatePresence>
        {showCameraPermission && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCameraPermission(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-200 dark:border-white/10"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500 dark:text-indigo-400">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Aktifkan Kamera?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Aktifkan kamera agar Ai tau keadaanmu sekarang.
                  <br />
                  <span className="text-xs opacity-70 mt-2 block">(Privasi aman: Video tidak direkam/dikirim ke server)</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCameraPermission(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmCamera}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95"
                  >
                    Setuju
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex-1 overflow-hidden relative flex flex-col"
        animate={isDeleting ? {
          scale: 0.9,
          opacity: 0,
          filter: 'blur(10px)',
          y: -50
        } : {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          y: 0
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <MessageList
          messages={messages}
          currentStyle={currentStyle}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
          onLoadMore={loadMoreMessages}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
        />
      </motion.div>

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