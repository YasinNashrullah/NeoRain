# 🧠 NeoRain - AI Mental Health Tracker

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-11.0-FFCA28?logo=firebase&logoColor=black)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_CDN-3448C5?logo=cloudinary&logoColor=white)

**NeoRain** adalah aplikasi pelacak kesehatan mental modern yang didukung oleh kecerdasan buatan (AI). Aplikasi ini dirancang untuk membantu pengguna memantau suasana hati, mendapatkan analisis mendalam, dan berinteraksi dengan asisten virtual yang empatik.

---

## ✨ Fitur Utama

### 1. 📝 Smart Mood Tracker

Catat perasaan harianmu dengan antarmuka yang intuitif dan menyenangkan.

- **Daily Log**: Pilih suasana hati, aktivitas, dan tambahkan catatan.
- **Calendar View**: Lihat riwayat mood dalam tampilan kalender interaktif.

### 2. 🤖 AI Analysis & Insights

Dapatkan pemahaman lebih dalam tentang kesehatan mentalmu.

- **Radar Chart**: Visualisasi tingkat Depresi, Kecemasan, dan Stres.
- **AI Summary**: Ringkasan naratif yang dibuat oleh AI berdasarkan data mood kamu.
- **Trend Detection**: Deteksi otomatis apakah kondisimu membaik atau butuh perhatian.

### 3. 💬 Emphatic AI Chat

Teman curhat virtual yang selalu ada 24/7.

- **Context Aware**: Mengerti konteks dari riwayat mood dan analisis sebelumnya.
- **Smart Suggestions**: Memberikan saran aktivitas atau coping mechanism yang relevan.

### 4. 📊 Statistics & Reports

- **Weekly & Monthly Stats**: Grafik tren perubahan mood.
- **Activity Correlation**: Cari tahu aktivitas apa yang paling mempengaruhi mood-mu.

---

## 🛠️ Tech Stack

Aplikasi ini dibangun menggunakan teknologi web modern untuk performa dan pengalaman pengguna terbaik:

- **Frontend**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend & Auth**: [Firebase](https://firebase.google.com/) (Auth, Firestore)
- **Image Storage**: [Cloudinary](https://cloudinary.com/) (Profile Photos)
- **AI Integration**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Cara Install & Jalanin Project

Ikuti langkah-langkah berikut untuk menjalankan project ini di komputer lokalmu.

### Prasyarat

Pastikan kamu sudah menginstall:

- [Node.js](https://nodejs.org/) (Versi 18 atau lebih baru)
- [Git](https://git-scm.com/)

### 1. Clone Repository

```bash
git clone https://github.com/username/mental-health-app.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root folder project, lalu copy konfigurasi berikut:

> **Note**: Kamu perlu API Key Firebase sendiri jika ingin menggunakan database pribadi.

```env
# Google AI Studio (Gemini) - Untuk fitur Chatbot & Analisis Analisis
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase Configuration - Untuk Autentikasi & Database
VITE_FIREBASE_API_KEY=your_firebase_api_key

# Cloudinary - Untuk penyimpanan foto profil user
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4. Jalankan Project (Development)

```bash
npm run dev
```

Buka browser dan akses `http://localhost:5173`.

---

## 📂 Struktur Project

```
.
├── public/              # Aset statis (gambar, icon, dll)
├── src/
│   ├── components/      # Komponen UI reusable
│   │   ├── chat/        # Komponen Chat (Input, MessageList, dll)
│   │   ├── tracker/     # Komponen Tracker (Daily, Weekly, Stats, Analysis)
│   │   ├── ui/          # Komponen UI dasar (Skeleton, Toast)
│   │   └── ...          # Komponen global (Navbar, Sidebar, dll)
│   ├── pages/           # Halaman utama aplikasi
│   │   ├── ActionPlan.jsx
│   │   ├── Analyze.jsx
│   │   ├── Chat.jsx
│   │   ├── Home.jsx
│   │   ├── Profile.jsx
│   │   ├── Register.jsx
│   │   ├── Statistics.jsx
│   │   ├── Tracker.jsx
│   │   └── ...
│   ├── utils/           # Helper functions & API configs
│   │   ├── achievements.js
│   │   ├── api.js
│   │   ├── config.js
│   │   └── gamification.js
│   ├── App.jsx          # Main Router
│   └── main.jsx         # Entry point
├── .env                 # Environment variables
└── package.json         # Dependencies
```

---

## 🤝 Kontribusi

Tertarik untuk berkontribusi? Kami sangat terbuka!

1. Fork repository ini.
2. Buat branch fitur baru (`git checkout -b fitur-keren`).
3. Commit perubahanmu (`git commit -m 'Menambahkan fitur keren'`).
4. Push ke branch (`git push origin fitur-keren`).
5. Buat Pull Request.
