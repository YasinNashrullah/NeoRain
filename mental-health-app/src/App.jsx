import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './firebase';
import { api } from './utils/api';

// Pages
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Tracker from './pages/Tracker';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Components
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import { BarChart2, Loader2 } from 'lucide-react';

const Placeholder = ({ title, icon: Icon }) => (
  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
    <div className="p-6 bg-white/5 rounded-full mb-4 animate-pulse">
      <Icon className="w-12 h-12 opacity-50" />
    </div>
    <h1 className="text-xl font-bold text-slate-400">{title}</h1>
    <p className="text-sm">Fitur ini sedang dikembangkan.</p>
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authPage, setAuthPage] = useState('login');
  const [activeTab, setActiveTab] = useState('home');
  const [currentMood, setCurrentMood] = useState(localStorage.getItem('lastMood') || 'default');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Halo! Gue NeoRain. Cerita aja, gue bakal dengerin tapi gak bakal ceramah panjang lebar. Ada apa?",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Global Theme Configuration
  const themeConfig = {
    default: { // Happy & Calm -> Default
      primary: 'from-pink-500 via-purple-600 to-indigo-600',
      accent: 'text-cyan-400',
      bgGradient: 'bg-slate-950', // Default dark background
      sidebarBg: 'bg-[#0a0a12]',
      activeBorder: 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)',
      activeBg: 'bg-[#1e1b4b]/80',
      glowColor: 'rgba(168,85,247,0.6)'
    },
    angry: {
      primary: 'from-orange-500 via-red-600 to-rose-600',
      accent: 'text-orange-400',
      bgGradient: 'bg-gradient-to-br from-slate-950 via-[#331408] to-slate-950',
      sidebarBg: 'bg-[#1a0500]',
      activeBorder: 'linear-gradient(90deg, #f97316, #dc2626, #e11d48)',
      activeBg: 'bg-[#450a0a]/80',
      glowColor: 'rgba(220, 38, 38, 0.6)'
    },
    sad: {
      primary: 'from-slate-500 via-slate-600 to-slate-700',
      accent: 'text-slate-300',
      bgGradient: 'bg-gradient-to-br from-slate-950 via-[#0f172a] to-slate-950',
      sidebarBg: 'bg-[#020617]',
      activeBorder: 'linear-gradient(90deg, #94a3b8, #475569, #334155)',
      activeBg: 'bg-[#1e293b]/80',
      glowColor: 'rgba(71, 85, 105, 0.6)'
    },
    manic: {
      primary: 'from-yellow-400 via-amber-500 to-orange-500',
      accent: 'text-yellow-300',
      bgGradient: 'bg-gradient-to-br from-slate-950 via-[#422006] to-slate-950',
      sidebarBg: 'bg-[#1c1917]',
      activeBorder: 'linear-gradient(90deg, #facc15, #f59e0b, #ea580c)',
      activeBg: 'bg-[#451a03]/80',
      glowColor: 'rgba(234, 88, 12, 0.6)'
    }
  };

  // Map specific moods to themes
  const getTheme = (mood) => {
    if (mood === 'happy' || mood === 'calm') return themeConfig.default;
    if (mood === 'angry') return themeConfig.angry;
    if (mood === 'sad') return themeConfig.sad;
    if (mood === 'manic') return themeConfig.manic;
    return themeConfig.default;
  };

  const currentTheme = getTheme(currentMood);

  const moodTimeoutRef = React.useRef(null);

  // Handle Mood Change (Persist to DB & LocalStorage)
  const handleMoodChange = async (newMood) => {
    // 1. Update UI & LocalStorage Instantly
    setCurrentMood(newMood);
    localStorage.setItem('lastMood', newMood);

    // 2. Clear previous timeout (Debounce)
    if (moodTimeoutRef.current) {
      clearTimeout(moodTimeoutRef.current);
    }

    // 3. Set new timeout to save to DB after 6 seconds
    moodTimeoutRef.current = setTimeout(async () => {
      if (user) {
        try {
          await api.saveMood({
            firebase_uid: user.uid,
            mood: newMood,
            note: "Mood Scanner Update"
          });
          console.log("Mood saved to DB:", newMood);
        } catch (error) {
          console.error("Failed to save mood:", error);
        }
      }
    }, 6000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDataObj = {
          uid: currentUser.uid,
          name: currentUser.displayName,
          email: currentUser.email,
          role: "Mahasiswa"
        };
        setUserData(userDataObj);

        // Sync User
        await api.syncUser({
          firebase_uid: currentUser.uid,
          name: currentUser.displayName || "User",
          email: currentUser.email
        });

        // Fetch Last Mood from DB
        try {
          const history = await api.getMoods(currentUser.uid);
          if (history && history.length > 0) {
            const lastMood = history[0]?.mood;
            if (lastMood) {
              setCurrentMood(lastMood);
              localStorage.setItem('lastMood', lastMood);
            }
          }
        } catch (e) {
          console.error("Failed to fetch mood history", e);
        }

        // Fetch Chat History
        try {
          const chatHistory = await api.getChats(currentUser.uid);
          if (chatHistory && chatHistory.length > 0) {
            const formattedHistory = chatHistory.map(msg => ({
              id: msg.id,
              text: msg.message,
              sender: msg.sender,
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setMessages(formattedHistory);
          }
        } catch (e) {
          console.error("Failed to fetch chat history", e);
        }

      } else {
        setUser(null);
        setUserData(null);
        localStorage.removeItem('lastMood');
        // Reset messages on logout
        setMessages([{
          id: 1,
          text: "Halo! Gue NeoRain. Cerita aja, gue bakal dengerin tapi gak bakal ceramah panjang lebar. Ada apa?",
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (data) => setUserData(data);
  const handleOnboardingFinish = (surveyData) => setUserData((prev) => ({ ...prev, ...surveyData }));
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
    setActiveTab('home');
    setAuthPage('login');
  };

  if (loading) return <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-white"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;

  if (!user) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex justify-center items-center font-sans p-4">
        <div className="w-full h-full sm:h-auto sm:max-w-md bg-slate-950 relative overflow-hidden flex flex-col shadow-2xl sm:rounded-[30px] sm:border sm:border-slate-800">
          {authPage === 'login' ? (
            <Login onLoginSuccess={handleAuthSuccess} onSwitchToRegister={() => setAuthPage('register')} />
          ) : (
            <Register onRegisterSuccess={handleAuthSuccess} onSwitchToLogin={() => setAuthPage('login')} />
          )}
        </div>
      </div>
    );
  }

  const hasOnboarded = userData && userData.role;

  return (
    <div className="fixed inset-0 w-full h-full bg-black font-sans flex overflow-hidden">

      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[150px] pointer-events-none"></div>

      {!hasOnboarded ? (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="w-full h-full sm:h-[90vh] sm:max-w-md bg-slate-950 relative overflow-hidden flex flex-col shadow-2xl sm:rounded-[30px] sm:border sm:border-slate-800">
            <Onboarding onFinish={handleOnboardingFinish} />
          </div>
        </div>
      ) : (
        <>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            userData={userData}
            currentTheme={currentTheme}
          />

          {/* --- MAIN CONTENT AREA --- */}
          <div className="flex-1 relative h-full w-full overflow-hidden flex flex-col">

            {/* Mobile Chat Overlay */}
            {activeTab === 'chat' && (
              <div className={`md:hidden fixed inset-0 z-[9999] w-full h-full ${currentTheme.bgGradient}`}>
                <Chat
                  onBack={() => setActiveTab('home')}
                  userData={userData}
                  currentMood={currentMood}
                  setCurrentMood={handleMoodChange}
                  messages={messages}
                  setMessages={setMessages}
                />
              </div>
            )}

            {/* Desktop Container - Satu Wrapper untuk Semua */}
            <div className="flex-1 w-full h-full flex flex-col md:p-6 transition-all duration-300">
              <div className="flex-1 w-full h-full bg-slate-950 md:bg-slate-950/50 md:backdrop-blur-sm md:border md:border-white/5 md:rounded-[30px] relative overflow-hidden shadow-2xl flex flex-col">

                {/* KONTEN */}
                {activeTab === 'chat' ? (
                  // Chat Mode (Desktop)
                  <div className="hidden md:flex flex-1 w-full h-full flex-col min-h-0">
                    <Chat
                      onBack={() => setActiveTab('home')}
                      userData={userData}
                      currentMood={currentMood}
                      setCurrentMood={handleMoodChange}
                      messages={messages}
                      setMessages={setMessages}
                    />
                  </div>
                ) : (
                  // Dashboard Mode (Home, Tracker, dll)
                  <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
                    <div className="w-full min-h-full mx-auto">
                      {activeTab === 'home' && <Home userData={userData} currentMood={currentMood} setCurrentMood={handleMoodChange} />}
                      {activeTab === 'tracker' && <Tracker userData={userData} />}
                      {activeTab === 'stats' && <Placeholder title="Statistik Mood" icon={BarChart2} />}
                      {activeTab === 'profile' && <Profile userData={userData} onLogout={handleLogout} />}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {activeTab !== 'chat' && (
              <div className="md:hidden">
                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
};

export default App;