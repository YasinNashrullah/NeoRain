import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Home from '../pages/Home';
import Tracker from '../pages/Tracker';
import Statistics from '../pages/Statistics';
import Profile from '../pages/Profile';
import Analyze from '../pages/Analyze';
import Chat from '../pages/Chat';
import { BarChart2 } from 'lucide-react';

const Placeholder = ({ title, icon: Icon }) => (
  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
    <div className="p-6 bg-white/5 rounded-full mb-4 animate-pulse">
      <Icon className="w-12 h-12 opacity-50" />
    </div>
    <h1 className="text-xl font-bold text-slate-400">{title}</h1>
    <p className="text-sm">Fitur ini sedang dikembangkan.</p>
  </div>
);

const DashboardLayout = ({ userData, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [chatContext, setChatContext] = useState(null);

  // State Mood & Chat
  const [currentMood, setCurrentMood] = useState(() => localStorage.getItem('currentMood') || 'default');
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Handler
  const handleAnalyzeFinish = () => setActiveTab('stats');

  const handleChatWithContext = (assessmentData) => {
    setChatContext(assessmentData);
    setActiveTab('chat');
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    // Clear chat context if navigating away from chat
    if (tab !== 'chat') {
      setChatContext(null);
    }
  };

  const handleStartAnalysis = () => setActiveTab('analyze');

  return (
    <div className="fixed inset-0 w-full h-full bg-black font-sans flex overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[150px] pointer-events-none"></div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onLogout={onLogout}
        userData={userData}
      />

      <div className="flex-1 relative h-full w-full overflow-hidden flex flex-col">

        {/* Mobile Chat Overlay */}
        {activeTab === 'chat' && (
          <div className="md:hidden fixed inset-0 z-[9999] w-full h-full bg-slate-950">
            <Chat
              onBack={() => handleNavigate('home')}
              userData={userData}
              initialContext={chatContext}
              messages={messages}
              setMessages={setMessages}
              currentMood={currentMood}
              setCurrentMood={setCurrentMood}
            />
          </div>
        )}

        {/* Desktop container */}
        <div className="flex-1 w-full h-full flex flex-col md:p-6 transition-all duration-300">
          <div className="flex-1 w-full h-full bg-slate-950 md:bg-slate-950/50 md:backdrop-blur-sm md:border md:border-white/5 md:rounded-[30px] relative overflow-hidden shadow-2xl flex flex-col">

            {/* content */}
            {activeTab === 'chat' ? (
              <div className="hidden md:flex flex-1 w-full h-full flex-col min-h-0">
                <Chat
                  onBack={() => handleNavigate('home')}
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
                      onNavigate={handleNavigate}
                    />
                  )}

                  {activeTab === 'tracker' && (
                    <Tracker
                      userData={userData}
                      onChatRequest={handleChatWithContext}
                      onNavigate={handleNavigate}
                    />
                  )}

                  {activeTab === 'stats' && (
                    <Statistics
                      userData={userData}
                      onChatRequest={handleChatWithContext}
                      onNavigate={handleNavigate}
                    />
                  )}

                  {activeTab === 'profile' && (
                    <Profile
                      userData={userData}
                      onLogout={onLogout}
                      onUpdateProfile={onUpdateProfile}
                    />
                  )}

                </div>
              </div>
            )}

          </div>
        </div>

        {activeTab !== 'chat' && (
          <div className="md:hidden">
            <BottomNav activeTab={activeTab} setActiveTab={handleNavigate} />
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardLayout;