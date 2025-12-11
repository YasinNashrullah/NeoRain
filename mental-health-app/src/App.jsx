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
import Statistics from './pages/Statistics';
import Analyze from './pages/Analyze';
import LandingPage from './pages/LandingPage';

// Components
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import { Loader2 } from 'lucide-react';

const App = () => {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Navigasi Auth
  const [authView, setAuthView] = useState('landing');

  const [activeTab, setActiveTab] = useState('home');
  const [chatContext, setChatContext] = useState(null);
  const [lastAssessment, setLastAssessment] = useState(null);

  // Mood Persistence (Global State untuk Tema)
  const [currentMood, setCurrentMood] = useState(() => {
    return localStorage.getItem('currentMood') || 'default';
  });

  // Chat Persistence
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // --- EFFECTS ---

  // 1. Simpan Mood & Chat ke LocalStorage setiap berubah
  useEffect(() => {
    localStorage.setItem('currentMood', currentMood);
  }, [currentMood]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  // 2. Fungsi Refresh Data User dari MySQL
  const refreshUserData = async (uid) => {
    try {
      const dbUser = await api.getUserDetail(uid);
      if (dbUser) {
        setUserData((prev) => ({
          ...prev,
          ...dbUser,
          name: dbUser.name
        }));
      }
    } catch (error) {
      console.error("Gagal refresh user:", error);
    }
  };

  // 3. Auth Listener & Initial Data Fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userDataObj = {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName,
          role: "Mahasiswa"
        };
        setUserData(userDataObj);

        // Sync ke Database
        await api.syncUser({
          firebase_uid: currentUser.uid,
          name: currentUser.displayName || "User",
          email: currentUser.email
        });

        // Ambil Data Lengkap
        await refreshUserData(currentUser.uid);

        // Ambil Assessment Terakhir
        try {
          const history = await api.getAssessmentHistory(currentUser.uid);
          if (history && history.length > 0) {
            setLastAssessment(history[0]);
          }
        } catch (e) {
          console.error("Failed to fetch history", e);
        }

      } else {
        // Reset State saat Logout (PENTING)
        setUser(null);
        setUserData(null);
        setMessages([]);
        setLastAssessment(null);
        setAuthView('landing');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- HANDLERS ---

  const handleAuthSuccess = (data) => setUserData(data);
  const handleOnboardingFinish = (surveyData) => setUserData((prev) => ({ ...prev, ...surveyData }));

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
    setChatContext(null);

    // Reset Persistence (PENTING AGAR DATA TIDAK BOCOR KE USER LAIN)
    setMessages([]);
    setCurrentMood('default');
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('currentMood');

    setActiveTab('home');
    setAuthView('landing');
  };

  const handleAnalyzeFinish = () => {
    setActiveTab('stats');
  };

  const handleChatWithContext = (assessmentData) => {
    setChatContext(assessmentData);
    setActiveTab('chat');
  };

  const handleStartAnalysis = () => setActiveTab('analyze');

  // --- RENDER ---

  if (loading) return <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-white"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;

  // Jika User BELUM Login
  if (!user) {
    if (authView === 'landing') {
      return (
        <LandingPage
          onLogin={() => setAuthView('login')}
          onRegister={() => setAuthView('register')}
        />
      );
    }

    return (
      <div className="fixed inset-0 w-full h-full bg-black flex justify-center items-center font-sans p-4 overflow-y-auto">
        <div className="w-full h-full sm:h-auto bg-slate-950 relative flex flex-col shadow-2xl sm:rounded-[30px] sm:border sm:border-slate-800">
          {authView === 'login' ? (
            <Login
              onLoginSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setAuthView('register')}
            />
          ) : (
            <Register
              onRegisterSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setAuthView('login')}
            />
          )}
          {/* Tombol Back ke Landing */}
          <button onClick={() => setAuthView('landing')} className="absolute top-4 left-4 text-slate-400 hover:text-white text-xs font-bold z-50">← Back</button>
        </div>
      </div>
    );
  }

  // Jika User sudah Login tapi belum Onboarding
  const hasOnboarded = userData && userData.role;

  return (
    <div className="fixed inset-0 w-full h-full bg-black font-sans flex overflow-hidden">

      {/* Background Blobs */}
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
          />

          <div className="flex-1 relative h-full w-full overflow-hidden flex flex-col">

            {/* Mobile Chat Overlay */}
            {activeTab === 'chat' && (
              <div className="md:hidden fixed inset-0 z-[9999] w-full h-full bg-slate-950">
                <Chat
                  onBack={() => setActiveTab('home')}
                  userData={userData}
                  initialContext={chatContext}
                  messages={messages}
                  setMessages={setMessages}
                  currentMood={currentMood}
                  setCurrentMood={setCurrentMood}
                />
              </div>
            )}

            {/* Desktop Container */}
            <div className="flex-1 w-full h-full flex flex-col md:p-6 transition-all duration-300">
              <div className="flex-1 w-full h-full bg-slate-950 md:bg-slate-950/50 md:backdrop-blur-sm md:border md:border-white/5 md:rounded-[30px] relative overflow-hidden shadow-2xl flex flex-col">

                {/* KONTEN */}
                {activeTab === 'chat' ? (
                  <div className="hidden md:flex flex-1 w-full h-full flex-col min-h-0">
                    <Chat
                      onBack={() => setActiveTab('home')}
                      userData={userData}
                      initialContext={chatContext}
                      messages={messages}
                      setMessages={setMessages}
                      currentMood={currentMood}
                      setCurrentMood={setCurrentMood}
                    />
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
                    <div className="w-full h-full mx-auto">

                      {activeTab === 'analyze' && (
                        <Analyze userData={userData} onFinish={handleAnalyzeFinish} />
                      )}

                      {activeTab === 'home' && (
                        <Home
                          userData={userData}
                          currentMood={currentMood}
                          setCurrentMood={setCurrentMood}
                          onStartAnalysis={handleStartAnalysis}
                          onNavigate={setActiveTab}
                          lastAssessment={lastAssessment}
                        />
                      )}

                      {activeTab === 'tracker' && (
                        <Tracker
                          userData={userData}
                        // Opsional: Jika ingin Tracker mengubah tema global, uncomment ini
                        // onMoodChange={setCurrentMood} 
                        />
                      )}

                      {activeTab === 'stats' && (
                        <Statistics
                          userData={userData}
                          onChatRequest={handleChatWithContext}
                          onNavigate={setActiveTab}
                        />
                      )}

                      {activeTab === 'profile' && (
                        <Profile
                          userData={userData}
                          onLogout={handleLogout}
                          onUpdateProfile={() => refreshUserData(user.uid)}
                        />
                      )}

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