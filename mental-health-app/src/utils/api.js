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

  // 6. Ambil History Chat
  getChats: async (firebaseUid) => {
    try {
      const response = await fetch(`${BASE_URL}/chats?firebase_uid=${firebaseUid}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("API Warning: Chat history endpoint not found (404). Backend update required.");
          return [];
        }
        console.warn(`API Error (Get Chats): ${response.status} ${response.statusText}`);
        return [];
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("API Error (Get Chats):", error);
      return [];
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
  }
};