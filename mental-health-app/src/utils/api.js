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
      return await response.json();
    } catch (error) {
      console.error("API Error (Sync User):", error);
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
  }
};