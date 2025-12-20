import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './firebase';
import { api } from './utils/api';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Tracker from './pages/Tracker';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Analyze from './pages/Analyze';
import ActionPlan from './pages/ActionPlan';
import LandingPage from './pages/LandingPage';

// Components
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import { Loader2 } from 'lucide-react';

const App = () => {
  // State Management
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const [activeTab, setActiveTab] = useState('home');
  const [chatContext, setChatContext] = useState(null);
  const [lastAssessment, setLastAssessment] = useState(null);
  const [trackerInitialTab, setTrackerInitialTab] = useState(null);

  // Mood Persistence
  const [currentMood, setCurrentMood] = useState('default');

  // Chat Persistence
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  // --- EFFECTS ---

  // Toggle Theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Apply Theme to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // update mood ke Firestore
  const updateMood = async (mood) => {
    setCurrentMood(mood);
    if (user?.uid) {
      try {
        await api.updateUserProfile({ current_mood: mood }, user.uid);
      } catch (e) {
        console.error("Failed to sync mood", e);
      }
    }
  };

  // Refresh Data User
  const refreshUserData = async (uid) => {
    try {
      const dbUser = await api.getUserDetail(uid);
      console.log("DEBUG: dbUser from Firestore:", dbUser); // Debugging
      if (dbUser) {
        setUserData((prev) => ({
          ...prev,
          ...dbUser,
          name: dbUser.name || dbUser.username || dbUser.displayName || prev.name
        }));
        if (dbUser.current_mood) {
          setCurrentMood(dbUser.current_mood);
        }
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

        // Ambil Data Lengkap dari Firestore (Prioritas Nama dari DB)
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
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- HANDLERS ---

  const handleAuthSuccess = (data) => {
    setUserData(data);
    navigate('/dashboard');
  };

  const handleOnboardingFinish = (surveyData) => setUserData((prev) => ({ ...prev, ...surveyData }));

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
    setChatContext(null);

    // Reset Persistence (PENTING AGAR DATA TIDAK BOCOR KE USER LAIN)
    setMessages([]);
    setCurrentMood('default');

    setActiveTab('home');
    navigate('/');
  };

  const handleAnalyzeFinish = () => {
    setTrackerInitialTab('analysis');
    setActiveTab('tracker');
  };

  const handleChatWithContext = (assessmentData) => {
    setChatContext(assessmentData);
    setActiveTab('chat');
  };

  const handleStartAnalysis = () => setActiveTab('analyze');

  // --- RENDER ---

  if (loading) return <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-white"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;

  const renderDashboard = () => {
    // Jika User sudah Login tapi belum Onboarding
    const hasOnboarded = userData && userData.role;

    if (!hasOnboarded) {
      return (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="w-full h-full sm:h-[90vh] sm:max-w-md bg-slate-950 relative overflow-hidden flex flex-col shadow-2xl sm:rounded-[30px] sm:border sm:border-slate-800">
            <Onboarding onFinish={handleOnboardingFinish} />
          </div>
        </div>
      );
    }

    return (
      <div className={`fixed inset-0 w-full h-full font-sans flex overflow-hidden transition-all duration-500
        ${theme === 'dark'
          ? 'bg-[#0a0a12]'
          : 'bg-[linear-gradient(0deg,#EEF1FF_0%,#D2DAFF_29%,#AAC4FF_66%,#B1B2FF_100%)]'
        }
      `}>

        {/* Background Blobs (Only Dark Mode) */}
        {theme === 'dark' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,_rgba(49,46,129,0.2)_0%,_transparent_70%)]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,_rgba(88,28,135,0.2)_0%,_transparent_70%)]"></div>
          </div>
        )}

        <>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            userData={userData}
            theme={theme}
            toggleTheme={toggleTheme}
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
                  setCurrentMood={updateMood}
                />
              </div>
            )}

            {/* Desktop Container */}
            <div className="flex-1 w-full h-full flex flex-col md:p-6 transition-all duration-300">
              <div className={`flex-1 w-full h-full relative overflow-hidden shadow-2xl flex flex-col
                  dark:bg-slate-950 md:dark:bg-slate-950/80 md:dark:border md:dark:border-white/5 md:dark:rounded-[30px]
                  md:bg-white/10 md:backdrop-blur-sm md:border md:border-white/20 md:rounded-[30px]
              `}>

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
                      setCurrentMood={updateMood}
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
                          setCurrentMood={updateMood}
                          onStartAnalysis={handleStartAnalysis}
                          onNavigate={setActiveTab}
                          lastAssessment={lastAssessment}
                        />
                      )}

                      {activeTab === 'tracker' && (
                        <Tracker
                          userData={userData}
                          initialTab={trackerInitialTab}
                          onChatRequest={handleChatWithContext}
                          onNavigate={setActiveTab}
                        />
                      )}

                      {activeTab === 'action-plan' && (
                        <ActionPlan
                          userData={userData}
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
                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} toggleTheme={toggleTheme} />
              </div>
            )}

          </div>
        </>
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage onLogin={() => navigate('/login')} onRegister={() => navigate('/register')} theme={theme} toggleTheme={toggleTheme} />} />

      <Route
        path="/login"
        element={!user ? <Login onLoginSuccess={handleAuthSuccess} onSwitchToRegister={() => navigate('/register')} /> : <Navigate to="/dashboard" />}
      />

      <Route
        path="/register"
        element={!user ? <Register onRegisterSuccess={handleAuthSuccess} onSwitchToLogin={() => navigate('/login')} /> : <Navigate to="/dashboard" />}
      />

      <Route
        path="/dashboard/*"
        element={user ? renderDashboard() : <Navigate to="/login" />}
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;