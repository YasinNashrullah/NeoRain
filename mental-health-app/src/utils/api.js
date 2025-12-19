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
      // Fetch last 30 days for stats
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);

      const q = query(
        collection(db, "moods"),
        where("firebase_uid", "==", firebaseUid),
        where("created_at", ">=", Timestamp.fromDate(pastDate)),
        orderBy("created_at", "desc")
      );

      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate().toISOString(),
      }));

      return null;
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
};
