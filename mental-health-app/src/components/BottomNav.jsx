import React from 'react';
import { Home, Heart, MessageCircle, Target, User, Sun, Moon } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab, theme, toggleTheme }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tracker', icon: Heart, label: 'Tracker' },
    { id: 'action-plan', icon: Target, label: 'Plan' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="absolute bottom-0 w-full z-50">

      {/* floating theme toggle mobile only */}
      <button
        onClick={toggleTheme}
        className="absolute bottom-24 right-4 z-[60] p-3 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-lg active:scale-95 transition-all duration-300"
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? (
          <Moon className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
        ) : (
          <Sun className="w-5 h-5 text-orange-500 fill-orange-500/20" />
        )}
      </button>

      {/* Background Bar */}
      <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 px-6 py-4 flex justify-between items-center rounded-t-3xl relative shadow-[0_-5px_20px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors duration-500 pb-6">

        {navItems.map((item) => {
          // gap for floating button before action plan
          if (item.id === 'action-plan') {
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

      {/* Floating Center Chat Button */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-[60]">
        <button
          onClick={() => setActiveTab('chat')}
          className={`p-4 rounded-full border-4 border-white dark:border-slate-950 shadow-[0_4px_20px_rgba(79,70,229,0.4)] transition-all duration-300 cursor-pointer ${activeTab === 'chat'
            ? 'bg-slate-100 text-indigo-600 scale-110'
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

const NavBtn = ({ item, activeTab, setActiveTab }) => {
  const isActive = activeTab === item.id;

  return (
    <button
      onClick={() => setActiveTab(item.id)}
      className="relative flex flex-col items-center justify-center w-14 h-14 group touch-manipulation"
    >
      {/* active background glow */}
      <div
        className={`absolute inset-0 rounded-2xl transition-all duration-500 ease-out ${isActive
          ? 'opacity-100 bg-indigo-50/80 dark:bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-100 dark:border-indigo-500/30 scale-100'
          : 'opacity-0 scale-50'
          }`}
      />

      {/* Icon Container */}
      <div className={`relative z-10 transition-all duration-300 transform flex flex-col items-center gap-1 ${isActive ? '-translate-y-1' : 'group-active:scale-95'}`}>
        <item.icon
          className={`w-6 h-6 transition-all duration-300 ${isActive
            ? 'text-indigo-600 dark:text-indigo-300 fill-indigo-200/50 dark:fill-indigo-400/20 filter drop-shadow-[0_2px_4px_rgba(99,102,241,0.3)]'
            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
            }`}
          strokeWidth={isActive ? 2.5 : 1.5}
        />

        {/* Active Dot Indicator */}
        <span
          className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
        />
      </div>
    </button>
  );
};

export default BottomNav;