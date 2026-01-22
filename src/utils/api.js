import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { config } from "./config.js";

// Helper untuk format error
const handleError = (context, error) => {
  console.error(`Firebase Error (${context}):`, error);
  return null;
};

// Helper Internal: Call Gemini with Key Rotation
const _callGemini = async (payload, keys, contextName = "Gemini API") => {
  const { baseUrl, model } = config.gemini;
  let lastError = null;

  console.log(`[${contextName}] Initializing with ${keys?.length || 0} keys available.`);

  if (!keys || keys.length === 0) {
    throw new Error(`[${contextName}] No API keys configured! Check .env`);
  }

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    try {
      console.log(`[${contextName}] Attempting request with Key #${i + 1} (${apiKey.substring(0, 4)}***)...`);

      const response = await fetch(`${baseUrl}/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Detailed error logging
        const errText = await response.text();
        console.warn(`[${contextName}] Key #${i + 1} Failed. Status: ${response.status}. Response: ${errText.substring(0, 200)}`);

        if (response.status === 429 || response.status === 503 || response.status === 500) {
          console.warn(`[${contextName}] Switching to next key due to limits/server error...`);
          continue;
        }
        throw new Error(`Gemini Error ${response.status}: ${response.statusText} - ${errText}`);
      }

      const data = await response.json();
      // Validate structure
      if (!data.candidates || !data.candidates[0]?.content) {
        throw new Error("Invalid Response Structure: candidates missing");
      }
      console.log(`[${contextName}] Success with Key #${i + 1}`);
      return data.candidates[0].content.parts[0].text;

    } catch (err) {
      console.error(`[${contextName}] Key #${i + 1} Error Chain:`, err);
      lastError = err;
    }
  }

  console.error(`[${contextName}] CRITICAL: All ${keys.length} keys failed.`);
  throw lastError || new Error(`All keys failed for ${contextName}`);
};

export const api = {
  // ==========================================
  // 1. CHAT API (Standardized)
  // ==========================================
  chat: {
    sendMessage: async ({ message, history, context, userData }) => {
      try {
        // 1. Prepare System Prompt
        const systemPrompt = `
          Role: NeoRain (Teman Curhat & Support System Mental Health). 
          User: ${userData?.name || "Teman"}.
          Rule Gaya Bicara:
          1. MIRRORING: Jika user "lo-gue", pakai "lo-gue". Jika "saya-anda" atau sopan, pakai bahasa baku.
          2. ANTI-BEO: JANGAN mengulang/merangkum cerita user ("Jadi kamu merasa sedih karena ..."). ITU MEMBOSANKAN. Langsung tanggapi!
          3. ANTI-KLISE: HINDARI "Aku mengerti perasaanmu". Ganti dengan reaksi natural manusia.
          
          CRITICAL SAFETY PROTOCOL:
          Jika user menyebutkan keinginan bunuh diri (bundir, mati, end game) atau self-harm:
          1. JANGAN bertanya balik "kenapa".
          2. KEMBALIKAN KESADARAN & KEWARASAN mereka dengan lembut tapi tegas. Ingatkan bahwa keberadaan mereka berharga.
          3. Fokus menenangkan, bukan mencari solusi masalah saat ini.
          
          Tugas Normal (Output JSON):
          1. "reply": Tanggapan naturalmu. JANGAN REPETISI.
          2. "mood": Mood user.
          3. "suggestions": 3 opsi balasan SINGKAT untuk User.
             - INI ADALAH KATA-KATA YANG AKAN DIUCAPKAN USER KEPADAMU.
             - HARUS LOGIS: Jangan menyarankan user bertanya hal yang kamu tidak tahu (Misal: "Cerita tentang dia dong" -> KAMU KAN GAK TAU SIAPA "DIA").
             - Jika kamu bertanya -> Saran adalah jawaban ("Iya/Enggak/Mungkin").
             - Jika kamu berpendapat -> Saran adalah tanggapan ("Setuju/Bener juga/Ah masa?").
             - MAX 3-4 KATA.
          
          Konteks Visual (Kamera): ${context?.emotion ? `Ekspresi wajah user terlihat "${context.emotion}". Validasi ini.` : "Tidak ada visual."}
          
          OUTPUT JSON ONLY:
          {
            "reply": "Teks jawabanmu...",
            "mood": "happy|sad|angry|energetic|calm",
            "suggestions": ["Saran 1", "Saran 2", "Saran 3"]
          }
        `;

        const contents = [
          ...history.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          })),
          { role: "user", parts: [{ text: message }] }
        ];

        // 2. Call Gemini
        const rawResponse = await _callGemini(
          {
            contents,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json" }
          },
          config.gemini.chatKeys,
          "Chat API"
        );

        const result = JSON.parse(rawResponse);

        // 3. Fire-and-Forget: Track Mood Background
        // ENABLED as Smart Tracking (Silent)
        api.mood.trackFromChat(message, result.mood, userData?.uid).catch(error => console.warn("Background mood track failed", error));

        // 4. Save Chat to DB
        if (userData?.uid) {
          await api.saveChat({ firebase_uid: userData.uid, message, sender: 'user' });
          await api.saveChat({ firebase_uid: userData.uid, message: result.reply, sender: 'ai', mood: result.mood });
        }

        return result;
      } catch (error) {
        console.error("Chat API Failed:", error);
        throw error;
      }
    }
  },

  // ==========================================
  // 2. ANALYST API (Standardized)
  // ==========================================
  analyst: {
    generateReport: async ({ userData, scores, context }) => {
      try {
        const prompt = `
          Role: Psikolog Klinis Gen Z & Life Coach.
          Data User: Depresi ${scores.depression}, Cemas ${scores.anxiety}, Stres ${scores.stress}.
          Context: ${context?.moodContext || '-'}, ${context?.streakContext || '-'}.
          
          Riwayat Chat Terakhir (Gali Hobi/Minat dari sini):
          ${context?.chatHistory || "Tidak ada riwayat chat."}
          
          Tugas: Buat "Action Plan" berupa Misi Harian yang personal.
          
          Instruksi Khusus untuk "actions" (Wajib 5-7 Misi):
          1. RESTORATIVE: 1-2 Misi untuk menstabilkan mental (contoh: journaling, teknik grounding 5-4-3-2-1).
          2. JOY & HOBBY: 1-2 Misi menyenangkan BERDASARKAN obrolan user di Riwayat Chat. (Analisa hobi mereka! Jika suka masak, beri tantangan masak simpel. Jika suka game, tantangan main santai).
          3. MIND & BODY: 1-2 Misi fisik ringan (Tidur cukup 7 jam, Jalan kaki 10 menit, Minum air 2L).
          4. SOCIAL CONNECT: 1 Misi sosial ringan (Sapa teman lama, Kirim stiker lucu ke grup, atau Curhat tipis orang terpercaya).
          5. FUTURE SELF: 1 Misi produktivitas mikro (Rapikan meja, List 3 hal prioritas besok, Baca 1 artikel seru).
          
          Output JSON:
          {
            "summary": "Ringkasan empatik (max 2 kalimat)",
            "factors": "Kemungkinan penyebab (akademik, sosial, dll)",
            "actions": ["Misi Restorative", "Misi Joy/Hobby (Sebutkan hobi spesifik user jika ada)", "Misi Mind & Body"],
            "education": "Fakta psikologi singkat"
          }
        `;

        const rawResponse = await _callGemini(
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          },
          config.gemini.analyzeKeys,
          "Analyst API"
        );

        let analysis;
        try {
          analysis = JSON.parse(rawResponse);
        } catch (e) {
          // Fallback if clean JSON parsing fails (though _callGemini should return text)
          const cleanText = rawResponse.replace(/```json|```/g, '').trim();
          analysis = JSON.parse(cleanText);
        }

        // Save to DB
        if (userData?.uid) {
          await api.saveAssessment({
            firebase_uid: userData.uid,
            depression_score: scores.depression,
            anxiety_score: scores.anxiety,
            stress_score: scores.stress,
            ai_analysis: analysis
          });
        }

        return analysis;
      } catch (error) {
        console.error("Analyst API Failed:", error);
        throw error;
      }
    },
  },

  // ==========================================
  // 3. MOOD TRACKER API (Standardized)
  // ==========================================
  mood: {
    trackFromChat: async (userMessage, detectedMood, uid) => {
      if (!uid || !detectedMood) return;
      try {
        await api.saveMood({
          firebase_uid: uid,
          mood: detectedMood,
          trigger: "chat_conversation",
          note: "Auto-Mood: Chat Conversation"
        });
      } catch (error) {
        console.error("Mood Tracker Failed:", error);
      }
    },

    generateDailyInsight: async (uid) => {
      // Future implementation
    }
  },

  // ==========================================
  // LEGACY METHODS (Direct Firestore Access)
  // ==========================================

  syncUser: async (userData) => {
    try {
      if (!userData?.uid) return null;
      const userRef = doc(db, "users", userData.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
      }
      return { ...userData, ...userSnap.data() };
    } catch (error) {
      return handleError("Sync User", error);
    }
  },

  saveMood: async (moodData) => {
    try {
      const docRef = await addDoc(collection(db, "moods"), {
        ...moodData,
        created_at: serverTimestamp(),
      });
      return { id: docRef.id, ...moodData };
    } catch (error) {
      throw error;
    }
  },

  getMoods: async (firebaseUid) => {
    try {
      const q = query(
        collection(db, "moods"),
        where("firebase_uid", "==", firebaseUid),
        orderBy("created_at", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate().toISOString() || new Date().toISOString(),
      }));
    } catch (error) {
      return handleError("Get Moods", error) || [];
    }
  },

  getWeeklyMoods: async (firebaseUid) => {
    try {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      const q = query(
        collection(db, "moods"),
        where("firebase_uid", "==", firebaseUid),
        where("created_at", ">=", Timestamp.fromDate(pastDate)),
        orderBy("created_at", "asc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate().toISOString(),
      }));
    } catch (error) {
      return handleError("Get Weekly Moods", error) || [];
    }
  },

  saveChat: async (chatData) => {
    try {
      const docRef = await addDoc(collection(db, "chats"), {
        ...chatData,
        created_at: serverTimestamp(),
      });
      return { id: docRef.id, ...chatData };
    } catch (error) {
      console.error("Firebase Error (Save Chat):", error);
      return null;
    }
  },

  getChats: async (firebaseUid, page = 1) => {
    try {
      const limitPerReq = 20 * page;
      const q = query(
        collection(db, "chats"),
        where("firebase_uid", "==", firebaseUid),
        orderBy("created_at", "desc"),
        limit(limitPerReq)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        text: doc.data().message,
        created_at: doc.data().created_at?.toDate().toISOString(),
      }));
      return { data, hasMore: false };
    } catch (error) {
      return handleError("Get Chats", error) || { data: [], hasMore: false };
    }
  },

  deleteAllChats: async (firebaseUid) => {
    try {
      const q = query(collection(db, "chats"), where("firebase_uid", "==", firebaseUid));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return { success: true, count: 0 };
      const batchSize = 500;
      const chunks = [];
      const docs = snapshot.docs;
      for (let i = 0; i < docs.length; i += batchSize) {
        chunks.push(docs.slice(i, i + batchSize));
      }
      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }
      return { success: true, count: snapshot.size };
    } catch (error) {
      return handleError("Delete All Chats", error);
    }
  },

  // --- SAVE ASSESSMENT (DASS-21) ---
  saveAssessment: async (data) => {
    try {
      const docRef = await addDoc(collection(db, "assessments"), {
        ...data,
        depression_score: data.depression_score, // Ensure consistent naming
        created_at: serverTimestamp(),
      });
      console.log("Assessment saved:", docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Firebase Error (Save Assessment):", error);
      return null;
    }
  },

  // --- GET LATEST ASSESSMENT ---
  getLatestAssessment: async (firebaseUid) => {
    try {
      const q = query(
        collection(db, "assessments"),
        where("firebase_uid", "==", firebaseUid),
        orderBy("created_at", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate().toISOString(),
      };
    } catch (error) {
      return handleError("Get Assessment", error);
    }
  },

  // --- GET ASSESSMENT HISTORY ---
  getAssessmentHistory: async (firebaseUid) => {
    try {
      // Query without sorting to avoid index requirements
      const q = query(
        collection(db, "assessments"),
        where("firebase_uid", "==", firebaseUid)
      );

      const querySnapshot = await getDocs(q);

      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Handle timestamp robustly
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date(doc.data().created_at).toISOString() || new Date().toISOString(),
      }));

      // Sort manually in client (Newest first)
      return docs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    } catch (error) {
      console.error("Error fetching history:", error);
      return [];
    }
  },

  getUserDetail: async (firebaseUid) => {
    try {
      const userRef = doc(db, "users", firebaseUid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return null;
      return userSnap.data();
    } catch (error) {
      return handleError("Get User", error);
    }
  },

  updateUserProfile: async (data, uid) => {
    try {
      const targetUid = uid || data.firebase_uid;
      if (!targetUid) throw new Error("No UID provided");
      const userRef = doc(db, "users", targetUid);
      await setDoc(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("Error update profile:", error);
      throw error;
    }
  },

  uploadProfilePhoto: async (firebaseUid, file) => {
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !uploadPreset) throw new Error("Cloudinary Config Missing!");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "neorain_users");
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Upload ke Cloudinary gagal");
      }
      const data = await response.json();
      const downloadURL = data.secure_url;
      const userRef = doc(db, "users", firebaseUid);
      await setDoc(userRef, { photo_url: downloadURL, photoURL: downloadURL, updatedAt: serverTimestamp() }, { merge: true });
      return { url: downloadURL };
    } catch (error) {
      console.error("Error upload photo (Cloudinary):", error);
      throw error;
    }
  },

  getMoodStatistics: async (firebaseUid, range = "monthly") => {
    try {
      let startDate = new Date();
      if (range === "weekly") {
        const day = startDate.getDay();
        const diff = startDate.getDate() - day;
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
      } else if (range === "monthly") {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      } else {
        startDate.setHours(0, 0, 0, 0);
      }
      const q = query(
        collection(db, "moods"),
        where("firebase_uid", "==", firebaseUid),
        where("created_at", ">=", Timestamp.fromDate(startDate)),
        orderBy("created_at", "desc")
      );
      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate().toISOString(),
      }));
      if (logs.length === 0) return null;
      const moodScores = { happy: 5, calm: 4, energetic: 3, sad: 2, angry: 1 };
      let totalScore = 0;
      const moodCounts = {};
      const trend = [];
      const dailyScores = {};
      logs.forEach((log) => {
        const score = moodScores[log.mood] || 3;
        totalScore += score;
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
        const dateKey = new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!dailyScores[dateKey]) dailyScores[dateKey] = { total: 0, count: 0 };
        dailyScores[dateKey].total += score;
        dailyScores[dateKey].count += 1;
      });
      Object.keys(dailyScores).forEach((date) => {
        trend.push({ date, score: Number((dailyScores[date].total / dailyScores[date].count).toFixed(1)) });
      });
      trend.sort((a, b) => new Date(a.date) - new Date(b.date));
      const average_score = (totalScore / logs.length).toFixed(1);
      const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
      const most_frequent_mood = sortedMoods[0] ? sortedMoods[0][0] : null;
      const insights = [];
      if (Number(average_score) >= 4) insights.push({ icon: "Sun", text: "Kondisi mentalmu sangat baik!", color: "text-orange-500" });
      else if (Number(average_score) <= 2) insights.push({ icon: "CloudRain", text: "Kamu mungkin butuh istirahat.", color: "text-indigo-500" });
      if (most_frequent_mood === "anxious") insights.push({ icon: "Wind", text: "Coba latihan pernapasan.", color: "text-cyan-500" });
      return { total_logs: logs.length, average_score, wellness_score: Math.round((Number(average_score) / 5) * 100), most_frequent_mood, trend, insights };
    } catch (error) {
      console.error("Error getMoodStatistics:", error);
      return null;
    }
  },

  getGamification: async (firebaseUid) => {
    try {
      const userRef = doc(db, "users", firebaseUid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().gamification) return userSnap.data().gamification;
      return null;
    } catch (error) {
      return handleError("Get Gamification", error);
    }
  },

  saveGamification: async (firebaseUid, data) => {
    try {
      const userRef = doc(db, "users", firebaseUid);
      await setDoc(userRef, { gamification: data, updatedAt: serverTimestamp() }, { merge: true });
      return { success: true };
    } catch (error) {
      return handleError("Save Gamification", error);
    }
  },

  getCurrentMood: async (firebaseUid) => {
    try {
      const q = query(
        collection(db, "moods"),
        where("firebase_uid", "==", firebaseUid),
        orderBy("created_at", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) return querySnapshot.docs[0].data().mood;
      return "default";
    } catch (error) {
      return handleError("Get Current Mood", error) || "default";
    }
  },

  saveDailyPlan: async (firebaseUid, planData) => {
    try {
      const userRef = doc(db, "users", firebaseUid);
      await setDoc(userRef, { daily_plan: planData, updatedAt: serverTimestamp() }, { merge: true });
      return { success: true };
    } catch (error) {
      return handleError("Save Daily Plan", error);
    }
  },

  getDailyPlan: async (firebaseUid) => {
    try {
      const userRef = doc(db, "users", firebaseUid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().daily_plan) return userSnap.data().daily_plan;
      return null;
    } catch (error) {
      return handleError("Get Daily Plan", error);
    }
  },

  // Deprecated: Chat with AI (Legacy)
  chatWithAI: async (message, firebaseUid, contextData = null, userName = "Teman") => {
    console.warn("Deprecated: Use api.chat.sendMessage instead");
    // Fallback using new method
    const response = await api.chat.sendMessage({
      message,
      history: [],
      userData: { name: userName, uid: firebaseUid },
      context: contextData
    });
    return { text: response.reply, mood: response.mood, suggestions: response.suggestions };
  },
};
