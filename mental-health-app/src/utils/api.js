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
} from "firebase/firestore";
import { config } from "./config.js";

// Helper untuk format error
const handleError = (context, error) => {
  console.error(`Firebase Error (${context}):`, error);
  return null;
};

export const api = {
  // 1. Sync User (Create/Update user di Firestore)
  syncUser: async (userData) => {
    try {
      if (!userData?.uid) return null;
      const userRef = doc(db, "users", userData.uid);

      // Cek apakah user sudah ada
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Buat baru
        await setDoc(userRef, {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Update login terakhir
        await updateDoc(
          userRef,
          {
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      return { ...userData, ...userSnap.data() };
    } catch (error) {
      return handleError("Sync User", error);
    }
  },

  // 2. Simpan Mood
  saveMood: async (moodData) => {
    try {
      const docRef = await addDoc(collection(db, "moods"), {
        ...moodData,
        created_at: serverTimestamp(), // Pakai timestamp server
      });
      return { id: docRef.id, ...moodData };
    } catch (error) {
      // return handleError("Save Mood", error);
      throw error; // Lempar error agar UI tau
    }
  },

  // 3. Ambil Mood (Harian/Semua)
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
        // Normalisasi tanggal untuk frontend
        created_at:
          doc.data().created_at?.toDate().toISOString() ||
          new Date().toISOString(),
      }));
    } catch (error) {
      return handleError("Get Moods", error) || [];
    }
  },

  // 4. Ambil Mood Mingguan (Logic dipindah ke client/frontend processing)
  getWeeklyMoods: async (firebaseUid) => {
    try {
      // Ambil 30 hari terakhir untuk aman
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

  // 5. Simpan Chat
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

  // 6. Ambil History Chat
  getChats: async (firebaseUid, page = 1) => {
    try {
      const limitPerReq = 20 * page; // Simplifikasi pagination untuk Firestore
      const q = query(
        collection(db, "chats"),
        where("firebase_uid", "==", firebaseUid),
        orderBy("created_at", "desc"), // Chat terbaru dulu
        limit(limitPerReq) // Ambil X terakhir
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        text: doc.data().message, // Map 'message' from DB to 'text' for UI
        created_at: doc.data().created_at?.toDate().toISOString(),
      }));

      return { data, hasMore: false }; // Firestore pagination butuh cursor, simplifikasi dulu
    } catch (error) {
      return handleError("Get Chats", error) || { data: [], hasMore: false };
    }
  },

  // 7. Simpan Hasil Analisis
  saveAssessment: async (data) => {
    try {
      // Konversi object nested jika perlu, tapi Firestore support JSON nested
      const docRef = await addDoc(collection(db, "assessments"), {
        ...data,
        depressi_score: data.depression_score, // Typo guard jika ada legacy
        created_at: serverTimestamp(),
      });

      // Return format yang diharapkan frontend
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Firebase Error (Save Assessment):", error);
      return null;
    }
  },

  // 8. Ambil Analisis Terakhir
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

  // 9. Ambil Semua Riwayat Analisis
  getAssessmentHistory: async (firebaseUid) => {
    try {
      const q = query(
        collection(db, "assessments"),
        where("firebase_uid", "==", firebaseUid),
        orderBy("created_at", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate().toISOString(),
      }));
    } catch (error) {
      return handleError("Get History", error) || [];
    }
  },

  // 10. Ambil Detail User
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

  // 11. Update Profile (Text)
  updateUserProfile: async (data, uid) => {
    try {
      // Cari UID jika tidak dikirim dalam data
      const targetUid = uid || data.firebase_uid;
      if (!targetUid) throw new Error("No UID provided");

      const userRef = doc(db, "users", targetUid);
      await setDoc(
        userRef,
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return { success: true };
    } catch (error) {
      console.error("Error update profile:", error);
      throw error;
    }
  },

  // 12. Upload Foto Profile (Cloudinary)
  uploadProfilePhoto: async (firebaseUid, file) => {
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error(
          "Cloudinary Config Missing! Harap isi VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET di .env"
        );
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "neorain_users");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Upload ke Cloudinary gagal");
      }

      const data = await response.json();
      const downloadURL = data.secure_url;

      const userRef = doc(db, "users", firebaseUid);
      await setDoc(
        userRef,
        {
          photo_url: downloadURL,
          photoURL: downloadURL,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return { url: downloadURL };
    } catch (error) {
      console.error("Error upload photo (Cloudinary):", error);
      throw error;
    }
  },

  // 13. Mood Stats (Client-side calculation for now)
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
        // Daily: Start from today 00:00
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

      // Calculate Stats
      if (logs.length === 0) return null;

      const moodScores = { happy: 5, calm: 4, manic: 3, sad: 2, angry: 1 };

      let totalScore = 0;
      const moodCounts = {};
      const trend = []; // Simple daily trend

      // Group by date for trend
      const dailyScores = {};

      logs.forEach((log) => {
        const score = moodScores[log.mood] || 3;
        totalScore += score;
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;

        const dateKey = new Date(log.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (!dailyScores[dateKey]) {
          dailyScores[dateKey] = { total: 0, count: 0 };
        }
        dailyScores[dateKey].total += score;
        dailyScores[dateKey].count += 1;
      });

      // Format Trend
      Object.keys(dailyScores).forEach((date) => {
        trend.push({
          date,
          score: Number(
            (dailyScores[date].total / dailyScores[date].count).toFixed(1)
          ),
        });
      });
      // Sort trend by date? It's likely mixed order due to object keys.
      // API query is desc, so reverse logs might be easier, but simple object keys might lose order.
      // Re-map from logs for better accuracy if needed, but this is okay for MVP.
      // Better:
      // Sort trend by date
      trend.sort((a, b) => new Date(a.date) - new Date(b.date));

      const average_score = (totalScore / logs.length).toFixed(1);

      const sortedMoods = Object.entries(moodCounts).sort(
        (a, b) => b[1] - a[1]
      );
      const most_frequent_mood = sortedMoods[0] ? sortedMoods[0][0] : null;

      // Insights Calculation
      const insights = [];
      if (Number(average_score) >= 4)
        insights.push({
          icon: "Sun",
          text: "Kondisi mentalmu sangat baik!",
          color: "text-orange-500",
        });
      else if (Number(average_score) <= 2)
        insights.push({
          icon: "CloudRain",
          text: "Kamu mungkin butuh istirahat.",
          color: "text-indigo-500",
        });

      if (most_frequent_mood === "anxious")
        insights.push({
          icon: "Wind",
          text: "Coba latihan pernapasan.",
          color: "text-cyan-500",
        });

      return {
        total_logs: logs.length,
        average_score,
        wellness_score: Math.round((Number(average_score) / 5) * 100),
        most_frequent_mood,
        trend: trend,
        insights,
      };
    } catch (error) {
      console.error("Error getMoodStatistics:", error);
      return null;
    }
  },

  // 14. Get Gamification Data
  getGamification: async (firebaseUid) => {
    try {
      const userRef = doc(db, "users", firebaseUid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().gamification) {
        return userSnap.data().gamification;
      }
      return null;
    } catch (error) {
      return handleError("Get Gamification", error);
    }
  },

  // 15. Save Gamification Data
  saveGamification: async (firebaseUid, data) => {
    try {
      const userRef = doc(db, "users", firebaseUid);
      await setDoc(
        userRef,
        {
          gamification: data,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return { success: true };
    } catch (error) {
      return handleError("Save Gamification", error);
    }
  },

  // 16. Get Current Mood (Latest)
  getCurrentMood: async (firebaseUid) => {
    try {
      const q = query(
        collection(db, "moods"),
        where("firebase_uid", "==", firebaseUid),
        orderBy("created_at", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().mood;
      }
      return "default";
    } catch (error) {
      return handleError("Get Current Mood", error) || "default";
    }
  },

  // 17. Save Daily Plan
  saveDailyPlan: async (firebaseUid, planData) => {
    try {
      const userRef = doc(db, "users", firebaseUid);
      await setDoc(
        userRef,
        {
          daily_plan: planData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return { success: true };
    } catch (error) {
      return handleError("Save Daily Plan", error);
    }
  },

  // 18. Get Daily Plan
  getDailyPlan: async (firebaseUid) => {
    try {
      const userRef = doc(db, "users", firebaseUid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().daily_plan) {
        return userSnap.data().daily_plan;
      }
      return null;
    } catch (error) {
      return handleError("Get Daily Plan", error);
    }
  },

  // 19. Chat with AI (Gemini Integration)
  chatWithAI: async (
    message,
    firebaseUid,
    contextData = null,
    userName = "Teman"
  ) => {
    try {
      const { apiKey, baseUrl, model } = config.gemini;

      // 1. Construct System Prompt
      let systemPrompt = `
        Kamu adalah NeoRain, teman curhat mahasiswa.
        Nama User: ${userName}.
        Gaya Bicara: Santai, gaul, suportif, pakai "aku-kamu" atau "lo-gue". Panggil user dengan nama "${userName}" sesekali agar akrab.
        Tugas: Analisis emosi user dan berikan saran respon selanjutnya.
        Gunakan teks biasa (plain text). JANGAN gunakan format markdown seperti bold (**teks**) atau bullet points (*). Gunakan paragraf santai atau emoji sebagai pengganti poin.
        OUTPUT FORMAT (JSON ONLY):
        {
          "text": "Respon kamu ke user (gunakan emoji)",
          "mood": "happy | sad | angry | manic | calm",
          "suggestions": ["Saran balasan singkat 1", "Saran balasan singkat 2", "Saran balasan singkat 3"] 
        }
      `;

      // 2. Add Context if available
      if (contextData) {
        systemPrompt += `
          \n[DATA KESEHATAN MENTAL USER SAAT INI]
          Tanggal Tes: ${new Date(contextData.date).toLocaleDateString()}
          Skor DASS-21: 
          - Depresi: ${contextData.scores.d} (Skala 0-42)
          - Kecemasan: ${contextData.scores.a} (Skala 0-42)
          - Stres: ${contextData.scores.s} (Skala 0-42)
          
          Ringkasan AI Sebelumnya: "${String(
            contextData.ai_analysis || ""
          ).substring(0, 200)}..."
          
          INSTRUKSI KHUSUS: User bertanya dalam konteks hasil tes ini. Validasi perasaan mereka berdasarkan data ini.
        `;
      }

      // 3. Call Gemini API
      const response = await fetch(
        `${baseUrl}/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: systemPrompt + "\n\nUser: " + message }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2000,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Quota exceeded. Please try again later.");
        }
        throw new Error(`Gemini API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      let parsedResponse = {
        text: "Maaf, aku tidak bisa menjawab sekarang.",
        mood: "default",
        suggestions: [],
      };

      try {
        if (rawText) {
          parsedResponse = JSON.parse(rawText);
        }
      } catch (e) {
        console.error("Failed to parse AI JSON:", e);
        // Fallback cleanup if JSON fails but text exists
        parsedResponse.text = rawText || parsedResponse.text;
      }

      // 4. Save to Firestore (Async)
      // Save User Message
      await api.saveChat({
        firebase_uid: firebaseUid,
        message: message,
        sender: "user",
        created_at: new Date(),
      });

      // Save AI Message
      await api.saveChat({
        firebase_uid: firebaseUid,
        message: parsedResponse.text,
        sender: "ai",
        created_at: new Date(),
        mood: parsedResponse.mood,
      });

      return parsedResponse;
    } catch (error) {
      console.error("Chat With AI Error:", error);
      if (error.message.includes("Quota exceeded")) {
        throw new Error(
          "Maaf, Neo sedang istirahat sebentar (Limit API). Coba 1 menit lagi ya! 😴"
        );
      }
      throw error;
    }
  },
};
