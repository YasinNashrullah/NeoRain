// URL Backend Laravel kamu
const BASE_URL = "http://127.0.0.1:8000/api";

export const api = {
  // 1. Kirim Data User ke Database saat Login
  syncUser: async (userData) => {
    try {
      const response = await fetch(`${BASE_URL}/sync-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        // Silently fail or log warning if backend is not ready
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moodData)
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
      const response = await fetch(`${BASE_URL}/moods?firebase_uid=${firebaseUid}`);
      const result = await response.json();
      return result.data || []; // Pastikan return array
    } catch (error) {
      console.error("API Error (Get Moods):", error);
      return [];
    }
  },

  // 4. Ambil Mood Mingguan (Endpoint Baru)
  getWeeklyMoods: async (firebaseUid) => {
    try {
      const response = await fetch(`${BASE_URL}/moods/weekly?firebase_uid=${firebaseUid}`);

      // Cek jika response tidak OK (misal 404 atau 500)
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatData)
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("API Warning: Chat endpoint not found (404). Please update backend.");
          return null;
        }
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
      const response = await fetch(`${BASE_URL}/chats?firebase_uid=${firebaseUid}&page=${page}&limit=${limit}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("API Warning: Chat history endpoint not found (404). Backend update required.");
          return { data: [], hasMore: false };
        }
        console.warn(`API Error (Get Chats): ${response.status} ${response.statusText}`);
        return { data: [], hasMore: false };
      }
      const result = await response.json();

      // Handle format response baru (dengan meta) atau lama (array langsung)
      if (Array.isArray(result)) {
        return { data: result, hasMore: false }; // Old format fallback
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

  // 5. Simpan Hasil Analisis
  saveAssessment: async (data) => {
    try {
      const response = await fetch(`${BASE_URL}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error("API Error (Save Assessment):", error);
    }
  },

  // 6. Ambil Hasil Analisis Terakhir
  getLatestAssessment: async (firebaseUid) => {
    try {
      const response = await fetch(`${BASE_URL}/assessments/latest?firebase_uid=${firebaseUid}`);
      const result = await response.json();
      return result.data; // Bisa null jika belum pernah tes
    } catch (error) {
      console.error("API Error (Get Assessment):", error);
      return null;
    }
  },

  // 7. Ambil Semua Riwayat Analisis
  getAssessmentHistory: async (firebaseUid) => {
    try {
      const response = await fetch(`${BASE_URL}/assessments/history?firebase_uid=${firebaseUid}`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("API Error (Get History):", error);
      return [];
    }
  },

  // 8. Ambil Statistik Mood
  getMoodStatistics: async (firebaseUid, range = 'monthly') => {
    try {
      const response = await fetch(`${BASE_URL}/moods/stats?firebase_uid=${firebaseUid}&range=${range}`);
      if (!response.ok) return null; // Fallback to frontend calc if 404
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.warn("API Error (Get Stats):", error);
      return null;
    }
  }
};