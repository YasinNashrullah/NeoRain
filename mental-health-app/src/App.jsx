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
import { BarChart2, Loader2, BrainCircuit } from 'lucide-react';

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
        await api.syncUser({
          firebase_uid: currentUser.uid,
          name: currentUser.displayName || "User",
          email: currentUser.email
        });
      } else {
        setUser(null);
        setUserData(null);
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
          />

          {/* --- MAIN CONTENT AREA --- */}
          <div className="flex-1 relative h-full w-full overflow-hidden flex flex-col">

            {/* Mobile Chat Overlay */}
            {activeTab === 'chat' && (
              <div className="md:hidden fixed inset-0 z-[9999] w-full h-full bg-slate-950">
                <Chat onBack={() => setActiveTab('home')} userData={userData} />
              </div>
            )}

            {/* Desktop Container - Satu Wrapper untuk Semua */}
            <div className="flex-1 w-full h-full flex flex-col md:p-6 transition-all duration-300">
              <div className="flex-1 w-full h-full bg-slate-950 md:bg-slate-950/50 md:backdrop-blur-sm md:border md:border-white/5 md:rounded-[30px] relative overflow-hidden shadow-2xl flex flex-col">

                {/* KONTEN */}
                {activeTab === 'chat' ? (
                  // Chat Mode (Desktop)
                  <div className="hidden md:flex flex-1 w-full h-full flex-col min-h-0">
                    <Chat onBack={() => setActiveTab('home')} userData={userData} />
                  </div>
                ) : (
                  // Dashboard Mode (Home, Tracker, dll)
                  <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
                    <div className="w-full min-h-full mx-auto">
                      {activeTab === 'analyze' && <Placeholder title="Analyze" icon={BrainCircuit}/>}
                      {activeTab === 'home' && <Home userData={userData} />}
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