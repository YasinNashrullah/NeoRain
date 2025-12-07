// URL Backend Laravel kamu
const BASE_URL = "http://127.0.0.1:8000/api";

const headers = {
  "Content-Type": "application/json",
  "Accept": "application/json", // PENTING: Memaksa Laravel return JSON, bukan HTML
};

export const api = {
  // 1. Sync User
  syncUser: async (userData) => {
    try {
      const response = await fetch(`${BASE_URL}/sync-user`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        console.warn(`API Warning (Sync User): ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("API Error (Sync User):", error);
      return null;
    }
  },

  // 2. Simpan Mood ke Database
  saveMood: async (moodData) => {
    try {
      const response = await fetch(`${BASE_URL}/moods`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(moodData),
      });
      return await response.json();
    } catch (error) {
      console.error("API Error (Save Mood):", error);
      throw error;
    }
  },

  // 3. Ambil History Mood Harian
  getMoods: async (firebaseUid) => {
    try {
      const response = await fetch(
        `${BASE_URL}/moods?firebase_uid=${firebaseUid}`,
        { method: "GET", headers: headers } 
      );
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("API Error (Get Moods):", error);
      return [];
    }
  },

  // 4. Ambil Mood Mingguan
  getWeeklyMoods: async (firebaseUid) => {
    try {
      const response = await fetch(
        `${BASE_URL}/moods/weekly?firebase_uid=${firebaseUid}`,
        { method: "GET", headers: headers }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("API Error (Get Weekly):", error);
      return [];
    }
  },

  // 5. Simpan Chat
  saveChat: async (chatData) => {
    try {
      const response = await fetch(`${BASE_URL}/chats`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(chatData),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Error (Save Chat):", error);
    }
  },

  // 6. Ambil History Chat (dengan Pagination)
  getChats: async (firebaseUid, page = 1, limit = 20) => {
    try {
      // Menggunakan endpoint dengan pagination
      const response = await fetch(
        `${BASE_URL}/chats?firebase_uid=${firebaseUid}&page=${page}&limit=${limit}`,
        { method: "GET", headers: headers }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("API Warning: Chat history endpoint not found (404). Backend update required.");
          return { data: [], hasMore: false };
        }
        console.warn(`API Error (Get Chats): ${response.status} ${response.statusText}`);
        return { data: [], hasMore: false };
      }

      const result = await response.json();

      // Handle format response lama (array langsung) vs baru (pagination object)
      if (Array.isArray(result)) {
        return { data: result, hasMore: false };
      }

      return {
        data: result.data || [],
        hasMore: result.meta ? result.meta.current_page < result.meta.last_page : false
      };
    } catch (error) {
      console.error("API Error (Get Chats):", error);
      return { data: [], hasMore: false };
    }
  },

  // 7. Simpan Hasil Analisis
  saveAssessment: async (data) => {
    try {
      const response = await fetch(`${BASE_URL}/assessments`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("API Error (Save Assessment):", error);
    }
  },

  // 8. Ambil Hasil Analisis Terakhir
  getLatestAssessment: async (firebaseUid) => {
    try {
      const response = await fetch(
        `${BASE_URL}/assessments/latest?firebase_uid=${firebaseUid}`,
        { method: "GET", headers: headers }
      );
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("API Error (Get Assessment):", error);
      return null;
    }
  },

  // 9. Ambil Semua Riwayat Analisis
  getAssessmentHistory: async (firebaseUid) => {
    try {
      const response = await fetch(
        `${BASE_URL}/assessments/history?firebase_uid=${firebaseUid}`,
        { method: "GET", headers: headers }
      );
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("API Error (Get History):", error);
      return [];
    }
  },

  // 10. Ambil Detail User
  getUserDetail: async (firebaseUid) => {
    try {
      const response = await fetch(
        `${BASE_URL}/user/detail?firebase_uid=${firebaseUid}`,
        { method: "GET", headers: headers }
      );
      
      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("API Error (Get User):", error);
      return null;
    }
  },

  // 11. Update Profile
  updateUserProfile: async (data) => {
    try {
      const response = await fetch(`${BASE_URL}/user/update`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      return await response.json();
    } catch (error) {
      console.error("API Error (Update Profile):", error);
      throw error;
    }
  },

  // 12. Upload Foto Profile
  uploadProfilePhoto: async (firebaseUid, file) => {
    const formData = new FormData();
    formData.append("firebase_uid", firebaseUid);
    formData.append("photo", file);

    try {
      const response = await fetch(`${BASE_URL}/user/photo`, {
        method: "POST",
        headers: { 
            "Accept": "application/json" 
            // Jangan set Content-Type manual untuk FormData
        }, 
        body: formData,
      });
      
      if (!response.ok) {
         const errText = await response.text();
         throw new Error(errText);
      }

      return await response.json();
    } catch (error) {
      console.error("API Error (Upload Photo):", error);
      throw error;
    }
  },

  // 13. Ambil Statistik Mood (Opsional/Future Use)
  getMoodStatistics: async (firebaseUid, range = 'monthly') => {
    try {
      const response = await fetch(
        `${BASE_URL}/moods/stats?firebase_uid=${firebaseUid}&range=${range}`,
        { method: "GET", headers: headers }
      );
      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.warn("API Error (Get Stats):", error);
      return null;
    }
  }
};