import React from 'react';
import { Home, CalendarDays, BarChart2, User, MessageCircle } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tracker', icon: CalendarDays, label: 'Tracker' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    // PENTING: z-50 agar selalu di atas konten scroll
    <div className="absolute bottom-0 w-full z-50">
      
      {/* Background Bar */}
      <div className="bg-slate-950/90 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex justify-between items-center rounded-t-3xl relative">
        
        {navItems.map((item) => {
          // Spacer di tengah untuk tombol Chat
          if (item.id === 'stats') {
            return (
              <React.Fragment key={item.id}>
                <div className="w-12"></div> 
                <NavBtn item={item} activeTab={activeTab} setActiveTab={setActiveTab} />
              </React.Fragment>
            );
          }
          return <NavBtn key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />;
        })}

      </div>

      {/* FLOATING ACTION BUTTON (CHAT) */}
      {/* Posisikan absolute terhadap container BottomNav, bukan screen */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-[60]">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`p-4 rounded-full border-4 border-slate-950 shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all duration-300 cursor-pointer ${
            activeTab === 'chat' 
              ? 'bg-white text-indigo-600 scale-110' 
              : 'bg-indigo-600 text-white hover:scale-105 hover:bg-indigo-500'
          }`}
          aria-label="Open Chat"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
        </button>
      </div>

    </div>
  );
};

const NavBtn = ({ item, activeTab, setActiveTab }) => (
  <button 
    onClick={() => setActiveTab(item.id)} 
    className={`flex flex-col items-center justify-center w-10 h-10 transition-all duration-300 rounded-full ${
      activeTab === item.id 
        ? 'text-white bg-white/10' 
        : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'fill-current' : ''}`} strokeWidth={activeTab === item.id ? 0 : 2} />
  </button>
);

export default BottomNav;