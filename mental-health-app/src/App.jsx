import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './firebase';
import { api } from './utils/api';

// Import Pages
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Tracker from './pages/Tracker';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Import Components
import BottomNav from './components/BottomNav';
import { BarChart2, Loader2 } from 'lucide-react';

// Placeholder untuk halaman yang belum jadi
const Placeholder = ({ title, icon: Icon }) => (
  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950">
    <div className="p-6 bg-white/5 rounded-full mb-4 animate-pulse">
      <Icon className="w-12 h-12 opacity-50" />
    </div>
    <h1 className="text-xl font-bold text-slate-400">{title}</h1>
    <p className="text-sm">Fitur ini sedang dikembangkan.</p>
  </div>
);

const App = () => {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState(null); // User dari Firebase Auth
  const [userData, setUserData] = useState(null); // Data tambahan (Survey/Role)
  const [loading, setLoading] = useState(true); // Loading awal cek auth
  const [authPage, setAuthPage] = useState('login'); // login atau register
  const [activeTab, setActiveTab] = useState('home'); // Tab navigasi aktif

  // --- CEK STATUS LOGIN (PERSISTENCE) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { // Tambah async
      if (currentUser) {
        setUser(currentUser);
        
        const userDataObj = {
          uid: currentUser.uid,
          name: currentUser.displayName,
          email: currentUser.email,
          role: "Mahasiswa"
        };

        setUserData(userDataObj);

        // Kirim data ke Laravel agar tersimpan di tabel users
        await api.syncUser({
          firebase_uid: currentUser.uid,
          name: currentUser.displayName || "User Tanpa Nama",
          email: currentUser.email
        });
        // ---------------------------------------------

      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  
  // Saat Login/Register Berhasil
  const handleAuthSuccess = (data) => {
    setUserData(data); 
  };

  // Saat Selesai Survey Onboarding
  const handleOnboardingFinish = (surveyData) => {
    setUserData((prev) => ({ ...prev, ...surveyData }));
  };

  // Saat Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      setActiveTab('home');
      setAuthPage('login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // --- RENDER LOADING SCREEN ---
  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  // --- RENDER AUTH PAGES (LOGIN/REGISTER) ---
  if (!user) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex justify-center items-center font-sans">
        <div className="w-full h-full sm:h-[90vh] sm:max-w-md bg-slate-950 relative overflow-hidden flex flex-col shadow-2xl sm:rounded-[30px] sm:border sm:border-slate-800">
          {authPage === 'login' ? (
            <Login 
              onLoginSuccess={handleAuthSuccess} 
              onSwitchToRegister={() => setAuthPage('register')} 
            />
          ) : (
            <Register 
              onRegisterSuccess={handleAuthSuccess} 
              onSwitchToLogin={() => setAuthPage('login')} 
            />
          )}
        </div>
      </div>
    );
  }

  // Cek apakah user sudah punya data survey (role/struggle)?
  const hasOnboarded = userData && userData.role; 

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex justify-center items-center font-sans">
      <div className="w-full h-full sm:h-[90vh] sm:max-w-md bg-slate-950 relative overflow-hidden flex flex-col shadow-2xl sm:rounded-[30px] sm:border sm:border-slate-800">
        
        {!hasOnboarded ? (
          // SURVEY (ONBOARDING)
          <Onboarding onFinish={handleOnboardingFinish} />
        ) : (
          // APLIKASI UTAMA
          <>
            <div className="flex-1 w-full h-full overflow-hidden relative z-0">
              
              {/* HOME */}
              {activeTab === 'home' && <Home userData={userData} />}
              
              {/* TRACKER */}
              {activeTab === 'tracker' && <Tracker userData={userData} />}
              
              {/* STATS (Placeholder) */}
              {activeTab === 'stats' && <Placeholder title="Statistik Mood" icon={BarChart2} />}
              
              {/* PROFILE */}
              {activeTab === 'profile' && (
                <Profile userData={userData} onLogout={handleLogout} />
              )}

            </div>

            {/* CHAT PAGE (OVERLAY FULLSCREEN) */}
            {activeTab === 'chat' && (
              <div className="absolute inset-0 z-[100] w-full h-full">
                <Chat onBack={() => setActiveTab('home')} />
              </div>
            )}

            {/* BOTTOM NAVIGATION (Sembunyi saat di Chat) */}
            {activeTab !== 'chat' && (
              <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default App;