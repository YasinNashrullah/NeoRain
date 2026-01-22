const getApiKeys = () => {
  const keys = [];
  // Primary key
  if (import.meta.env.VITE_GEMINI_API_KEY)
    keys.push(import.meta.env.VITE_GEMINI_API_KEY);

  // Secondary keys (up to 10 for now)
  for (let i = 2; i <= 10; i++) {
    const key = import.meta.env[`VITE_GEMINI_API_KEY_${i}`];
    if (key) keys.push(key);
  }
  return keys;
};

// Helper: Filter & validasi keys
const validKeys = (keys) => keys.filter((k) => k && typeof k === "string");

export const config = {
  gemini: {
    // Legacy keys (keep for backward compatibility)
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    apiKeys: getApiKeys(),

    // New Specific Key Groups
    chatKeys: validKeys([
      import.meta.env.VITE_GEMINI_API_KEY_RESPONS_CHAT_1,
      import.meta.env.VITE_GEMINI_API_KEY_RESPONS_CHAT_2,
      import.meta.env.VITE_GEMINI_API_KEY,   // Emergency 1
      import.meta.env.VITE_GEMINI_API_KEY_2  // Emergency 2
    ]),

    analyzeKeys: validKeys([
      import.meta.env.VITE_GEMINI_API_KEY_RESPONS_ANALYZE_1,
      import.meta.env.VITE_GEMINI_API_KEY_RESPONS_ANALYZE_2,
      import.meta.env.VITE_GEMINI_API_KEY,
      import.meta.env.VITE_GEMINI_API_KEY_2
    ]),

    trackKeys: validKeys([
      import.meta.env.VITE_GEMINI_API_KEY_RESPONS_TRACK_FROM_CHAT_1,
      import.meta.env.VITE_GEMINI_API_KEY_RESPONS_TRACK_FROM_CHAT_2,
      import.meta.env.VITE_GEMINI_API_KEY,
      import.meta.env.VITE_GEMINI_API_KEY_2
    ]),

    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    model: "gemini-2.5-flash-lite",
  },
};

// Validation to help debugging
if (!config.gemini.chatKeys.length) {
  console.warn("⚠️ No Chat API Keys found! AI features will fail.");
}
