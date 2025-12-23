import React from 'react';
import { Home, Heart, MessageCircle, Target, User, Sun, Moon } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab, theme, toggleTheme, currentMood }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tracker', icon: Heart, label: 'Tracker' },
    { id: 'action-plan', icon: Target, label: 'Plan' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  // Mood Configuration
  const moodConfig = {
    happy: {
      primary: 'bg-pink-500',
      primaryHover: 'hover:bg-pink-600',
      text: 'text-pink-600',
      textDark: 'dark:text-pink-400',
      bgLight: 'bg-pink-50',
      bgDark: 'dark:bg-pink-500/10',
      border: 'border-pink-200',
      borderDark: 'dark:border-pink-500/30',
      shadow: 'shadow-[0_4px_20px_rgba(236,72,153,0.4)]',
      glow: 'shadow-[0_0_15px_rgba(236,72,153,0.4)]',
      fill: 'fill-pink-200/50',
      fillDark: 'dark:fill-pink-400/20',
      dropShadow: 'drop-shadow-[0_2px_4px_rgba(236,72,153,0.3)]',
      dot: 'bg-pink-500 dark:bg-pink-400'
    },
    sad: {
      primary: 'bg-indigo-500',
      primaryHover: 'hover:bg-indigo-600',
      text: 'text-indigo-600',
      textDark: 'dark:text-indigo-400',
      bgLight: 'bg-indigo-50',
      bgDark: 'dark:bg-indigo-500/10',
      border: 'border-indigo-200',
      borderDark: 'dark:border-indigo-500/30',
      shadow: 'shadow-[0_4px_20px_rgba(99,102,241,0.4)]',
      glow: 'shadow-[0_0_15px_rgba(99,102,241,0.4)]',
      fill: 'fill-indigo-200/50',
      fillDark: 'dark:fill-indigo-400/20',
      dropShadow: 'drop-shadow-[0_2px_4px_rgba(99,102,241,0.3)]',
      dot: 'bg-indigo-500 dark:bg-indigo-400'
    },
    angry: {
      primary: 'bg-orange-500',
      primaryHover: 'hover:bg-orange-600',
      text: 'text-orange-600',
      textDark: 'dark:text-orange-400',
      bgLight: 'bg-orange-50',
      bgDark: 'dark:bg-orange-500/10',
      border: 'border-orange-200',
      borderDark: 'dark:border-orange-500/30',
      shadow: 'shadow-[0_4px_20px_rgba(249,115,22,0.4)]',
      glow: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]',
      fill: 'fill-orange-200/50',
      fillDark: 'dark:fill-orange-400/20',
      dropShadow: 'drop-shadow-[0_2px_4px_rgba(249,115,22,0.3)]',
      dot: 'bg-orange-500 dark:bg-orange-400'
    },
    calm: {
      primary: 'bg-cyan-500',
      primaryHover: 'hover:bg-cyan-600',
      text: 'text-cyan-600',
      textDark: 'dark:text-cyan-400',
      bgLight: 'bg-cyan-50',
      bgDark: 'dark:bg-cyan-500/10',
      border: 'border-cyan-200',
      borderDark: 'dark:border-cyan-500/30',
      shadow: 'shadow-[0_4px_20px_rgba(6,182,212,0.4)]',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]',
      fill: 'fill-cyan-200/50',
      fillDark: 'dark:fill-cyan-400/20',
      dropShadow: 'drop-shadow-[0_2px_4px_rgba(6,182,212,0.3)]',
      dot: 'bg-cyan-500 dark:bg-cyan-400'
    },
    manic: {
      primary: 'bg-yellow-500',
      primaryHover: 'hover:bg-yellow-600',
      text: 'text-yellow-600',
      textDark: 'dark:text-yellow-400',
      bgLight: 'bg-yellow-50',
      bgDark: 'dark:bg-yellow-500/10',
      border: 'border-yellow-200',
      borderDark: 'dark:border-yellow-500/30',
      shadow: 'shadow-[0_4px_20px_rgba(234,179,8,0.4)]',
      glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]',
      fill: 'fill-yellow-200/50',
      fillDark: 'dark:fill-yellow-400/20',
      dropShadow: 'drop-shadow-[0_2px_4px_rgba(234,179,8,0.3)]',
      dot: 'bg-yellow-500 dark:bg-yellow-400'
    }
  };

  const activeStyle = moodConfig[currentMood] || moodConfig.sad;

  return (
    <div className="absolute bottom-0 w-full z-50">

      {/* floating theme toggle mobile only */}


      {/* Background Bar */}
      <div className="bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-white/5 px-6 py-4 flex justify-between items-center rounded-t-3xl relative shadow-[0_-5px_20px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors duration-700 pb-6">

        {navItems.map((item) => {
          // gap for floating button before action plan
          if (item.id === 'action-plan') {
            return (
              <React.Fragment key={item.id}>
                <div className="w-12"></div>
                <NavBtn item={item} activeTab={activeTab} setActiveTab={setActiveTab} style={activeStyle} />
              </React.Fragment>
            );
          }
          return <NavBtn key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} style={activeStyle} />;
        })}

      </div>

      {/* Floating Center Chat Button */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-[60]">
        <button
          onClick={() => setActiveTab('chat')}
          className={`p-4 rounded-full border-4 border-white dark:border-slate-950 transition-all duration-700 cursor-pointer ${activeTab === 'chat'
            ? 'bg-slate-100 text-slate-800 scale-110'
            : `${activeStyle.primary} text-white hover:scale-105 ${activeStyle.primaryHover} ${activeStyle.shadow}`
            }`}
          aria-label="Open Chat"
        >
          <MessageCircle className={`w-6 h-6 fill-current ${activeTab === 'chat' ? activeStyle.text : ''}`} />
        </button>
      </div>

    </div>
  );
};

const NavBtn = ({ item, activeTab, setActiveTab, style }) => {
  const isActive = activeTab === item.id;

  return (
    <button
      onClick={() => setActiveTab(item.id)}
      className="relative flex flex-col items-center justify-center w-14 h-14 group touch-manipulation"
    >
      {/* active background glow */}
      <div
        className={`absolute inset-0 rounded-2xl transition-all duration-700 ease-out ${isActive
          ? `opacity-100 ${style.bgLight} ${style.bgDark} ${style.glow} border ${style.border} ${style.borderDark} scale-100`
          : 'opacity-0 scale-50'
          }`}
      />

      {/* Icon Container */}
      <div className={`relative z-10 transition-all duration-300 transform flex flex-col items-center gap-1 ${isActive ? '-translate-y-1' : 'group-active:scale-95'}`}>
        <item.icon
          className={`w-6 h-6 transition-all duration-700 ${isActive
            ? `${style.text} ${style.textDark} ${style.fill} ${style.fillDark} filter ${style.dropShadow}`
            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
            }`}
          strokeWidth={isActive ? 2.5 : 1.5}
        />

        {/* Active Dot Indicator */}
        <span
          className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-700 ${isActive ? `opacity-100 scale-100 ${style.dot}` : 'opacity-0 scale-0'
            }`}
        />
      </div>
    </button>
  );
};

export default BottomNav;