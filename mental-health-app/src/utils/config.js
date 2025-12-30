export const config = {
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    model: "gemini-2.5-flash-lite",
  },
};

// Validation to help debugging
if (!config.gemini.apiKey) {
  console.warn("⚠️ VITE_GEMINI_API_KEY is missing. AI features will not work.");
}
