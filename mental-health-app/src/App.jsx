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
import Statistics from './pages/Statistics';

// Components
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import PageTransition from './components/PageTransition';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const App = () => {
  // State Management
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'auto');

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

  // Effects

  // Toggle Theme Helper (for LandingPage/BottomNav)
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Calculate Effective Theme
  const getEffectiveTheme = () => {
    if (theme === 'auto') {
      const hour = new Date().getHours();
      // Dark mode from 5 PM (17:00) to 7 AM (07:00)
      if (hour >= 17 || hour < 7) return 'dark';
      return 'light';
    }
    return theme;
  };

  // Apply Theme to DOM
  useEffect(() => {
    const applyTheme = () => {
      const effectiveTheme = getEffectiveTheme();
      const root = window.document.documentElement;
      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    // Re-check every minute for auto mode
    const interval = setInterval(applyTheme, 60000);
    return () => clearInterval(interval);
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
      // console.log("DEBUG: dbUser from Firestore:", dbUser); // Debugging
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

  // Auth Listener & Initial Data Fetch
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

        // Ambil Data Lengkap dari Firestore
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
        // Reset State saat Logout
        setUser(null);
        setUserData(null);
        setMessages([]);
        setLastAssessment(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // handlers

  const handleAuthSuccess = (data) => {
    setUserData(data);
    navigate('/dashboard');
  };

  const handleOnboardingFinish = async (surveyData) => {
    setUserData((prev) => ({ ...prev, ...surveyData }));
    if (user?.uid) {
      try {
        await api.updateUserProfile(surveyData, user.uid);
      } catch (e) {
        console.error("Failed to save onboarding data", e);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
    setChatContext(null);

    // Reset Persistence
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

  // Handle standard menu navigation 
  const handleMenuNavigation = (tabId) => {
    if (tabId === 'tracker') {
      setTrackerInitialTab(null);
    }
    setActiveTab(tabId);
  };

  // render

  if (loading) return <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-white"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;

  const renderDashboard = () => {
    // Jika User sudah Login tapi belum Onboarding
    const hasOnboarded = userData && userData.role;

    if (!hasOnboarded) {
      return (
        <Onboarding onFinish={handleOnboardingFinish} />
      );
    }

    // Determine effective theme for background rendering
    const effectiveTheme = getEffectiveTheme();

    return (
      <div className={`fixed inset-0 w-full h-full font-sans flex overflow-hidden transition-all duration-500
        ${effectiveTheme === 'dark'
          ? 'bg-[#0a0a12]'
          : 'bg-[linear-gradient(0deg,#EEF1FF_0%,#D2DAFF_29%,#AAC4FF_66%,#B1B2FF_100%)]'
        }
      `}>

        {/* Background Blobs (Only Dark Mode) */}
        {effectiveTheme === 'dark' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,_rgba(49,46,129,0.2)_0%,_transparent_70%)]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,_rgba(88,28,135,0.2)_0%,_transparent_70%)]"></div>
          </div>
        )}

        <>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={handleMenuNavigation}
            onLogout={handleLogout}
            userData={userData}
            theme={theme}
            currentMood={currentMood}
          // Sidebar doesn't need toggleTheme anymore
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
                  theme={effectiveTheme}
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
                      onBack={() => {
                        setTrackerInitialTab(null);
                        setActiveTab('home');
                      }}
                      userData={userData}
                      initialContext={chatContext}
                      messages={messages}
                      setMessages={setMessages}
                      currentMood={currentMood}
                      setCurrentMood={updateMood}
                      theme={effectiveTheme}
                    />
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
                    <div className="w-full h-full mx-auto md:pb-8 pb-3">

                      <AnimatePresence mode='wait'>
                        {activeTab === 'analyze' && (
                          <PageTransition key="analyze">
                            <Analyze userData={userData} onFinish={handleAnalyzeFinish} />
                          </PageTransition>
                        )}

                        {activeTab === 'home' && (
                          <PageTransition key="home">
                            <Home
                              userData={userData}
                              currentMood={currentMood}
                              setCurrentMood={updateMood}
                              onStartAnalysis={handleStartAnalysis}
                              onNavigate={handleMenuNavigation}
                              onVerifyHistory={() => {
                                setTrackerInitialTab('analysis');
                                setActiveTab('tracker');
                              }}
                              lastAssessment={lastAssessment}
                            />
                          </PageTransition>
                        )}

                        {activeTab === 'tracker' && (
                          <PageTransition key="tracker">
                            <Tracker
                              userData={userData}
                              initialTab={trackerInitialTab}
                              onChatRequest={handleChatWithContext}
                              onNavigate={handleMenuNavigation}
                            />
                          </PageTransition>
                        )}

                        {activeTab === 'stats' && (
                          <PageTransition key="stats">
                            <Statistics userData={userData} onNavigate={handleMenuNavigation} />
                          </PageTransition>
                        )}

                        {activeTab === 'action-plan' && (
                          <PageTransition key="action-plan">
                            <ActionPlan
                              userData={userData}
                              onNavigate={handleMenuNavigation}
                            />
                          </PageTransition>
                        )}

                        {activeTab === 'profile' && (
                          <PageTransition key="profile">
                            <Profile
                              userData={userData}
                              onLogout={handleLogout}
                              onUpdateProfile={() => refreshUserData(user.uid)}
                              theme={theme}
                              setTheme={setTheme}
                            />
                          </PageTransition>
                        )}
                      </AnimatePresence>

                    </div>
                  </div>
                )}

              </div>
            </div>

            {activeTab !== 'chat' && (
              <div className="md:hidden">
                <BottomNav activeTab={activeTab} setActiveTab={handleMenuNavigation} theme={theme} toggleTheme={toggleTheme} currentMood={currentMood} />
              </div>
            )}
          </div>
        </>
      </div>
    );
  };

  return (
    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <LandingPage onLogin={() => navigate('/login')} onRegister={() => navigate('/register')} theme={theme} toggleTheme={toggleTheme} />
          </PageTransition>
        } />

        <Route
          path="/login"
          element={!user ? (
            <PageTransition>
              <Login onLoginSuccess={handleAuthSuccess} onSwitchToRegister={() => navigate('/register')} />
            </PageTransition>
          ) : <Navigate to="/dashboard" />}
        />

        <Route
          path="/register"
          element={!user ? (
            <PageTransition>
              <Register onRegisterSuccess={handleAuthSuccess} onSwitchToLogin={() => navigate('/login')} />
            </PageTransition>
          ) : <Navigate to="/dashboard" />}
        />

        <Route
          path="/dashboard/*"
          element={user ? (
            <PageTransition>
              {renderDashboard()}
            </PageTransition>
          ) : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;