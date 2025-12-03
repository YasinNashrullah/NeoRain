import React from 'react';
import { 
  Home, CalendarDays, BarChart2, User, 
  MessageCircle, LogOut, Sparkles 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, userData }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Beranda' },
    { id: 'tracker', icon: CalendarDays, label: 'Tracker' },
    { id: 'stats', icon: BarChart2, label: 'Statistik' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 h-full bg-slate-950/50 backdrop-blur-xl border-r border-white/10 p-6 relative z-50">
      
      {/* 1. LOGO AREA */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">MindSpace</h1>
          <p className="text-[10px] text-indigo-400 font-medium">Mental Health AI</p>
        </div>
      </div>

      {/* 2. NAVIGATION MENU */}
      <div className="flex-1 space-y-2">
        <p className="text-xs font-bold text-slate-500 px-4 mb-2 uppercase tracking-wider">Menu</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
            <span className="text-sm font-medium">{item.label}</span>
            
            {/* Active Indicator (Dot) */}
            {activeTab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
            )}
          </button>
        ))}

        {/* Chat Button Special */}
        <button
          onClick={() => setActiveTab('chat')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mt-4 border border-dashed ${
            activeTab === 'chat'
              ? 'bg-white text-indigo-900 border-transparent font-bold'
              : 'border-white/20 text-slate-300 hover:border-white/50 hover:bg-white/5'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">Chat AI</span>
        </button>
      </div>

      {/* 3. USER PROFILE MINI */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || 'User'}`} 
            alt="User" 
            className="w-10 h-10 rounded-full bg-slate-800"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{userData?.name || 'Pengguna'}</p>
            <p className="text-xs text-slate-500 truncate">{userData?.email || 'user@mail.com'}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-500 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;