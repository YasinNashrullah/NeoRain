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

export const config = {
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY, // Keep for backward compat if needed
    apiKeys: getApiKeys(),
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    model: "gemini-2.5-flash-lite",
  },
};

// Validation to help debugging
if (!config.gemini.apiKey) {
  console.warn("⚠️ VITE_GEMINI_API_KEY is missing. AI features will not work.");
}
