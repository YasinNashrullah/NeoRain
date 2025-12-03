// URL Backend Laravel
const BASE_URL = "http://127.0.0.1:8000/api";

export const api = {
  // Kirim Data User ke MySQL saat Login
  syncUser: async (userData) => {
    try {
      const response = await fetch(`${BASE_URL}/sync-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      console.error("API Error (Sync User):", error);
    }
  },

  // Simpan Mood ke MySQL
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

  // Ambil History Mood dari MySQL
  getMoods: async (firebaseUid) => {
    try {
      const response = await fetch(`${BASE_URL}/moods?firebase_uid=${firebaseUid}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("API Error (Get Moods):", error);
      return [];
    }
  }
};