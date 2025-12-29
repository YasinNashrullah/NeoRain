import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Smile, Wind, Zap, Frown, CloudRain, Heart
} from 'lucide-react';
import { api } from '../utils/api';
import DailyTab from '../components/tracker/DailyTab';
import WeeklyTab from '../components/tracker/WeeklyTab';
import StatsTab from '../components/tracker/StatsTab';
import AnalysisTab from '../components/tracker/AnalysisTab';

const Tracker = ({ userData, onNavigate, onChatRequest, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'daily');
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // state data
  const [historyLogs, setHistoryLogs] = useState([]);
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [statsRange, setStatsRange] = useState('monthly');

  // state calendar & filter
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // config mood
  const moods = [
    { id: 'happy', label: 'Happy', icon: Smile, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-500/20', border: 'border-pink-200 dark:border-pink-500/50', score: 5 },
    { id: 'grateful', label: 'Grateful', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-500/20', border: 'border-rose-200 dark:border-rose-500/50', score: 5 },
    { id: 'calm', label: 'Calm', icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-500/20', border: 'border-cyan-200 dark:border-cyan-500/50', score: 3 },
    { id: 'manic', label: 'Manic', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-500/20', border: 'border-yellow-200 dark:border-yellow-500/50', score: 4 },
    { id: 'angry', label: 'Angry', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/20', border: 'border-orange-200 dark:border-orange-500/50', score: 1 },
    { id: 'sad', label: 'Sad', icon: CloudRain, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/20', border: 'border-indigo-200 dark:border-indigo-500/50', score: 2 },
  ];

  // fetch data
  const fetchData = async () => {
    if (userData?.uid) {
      const allData = await api.getMoods(userData.uid);
      // Filter out auto-saved mood scanner updates
      const filteredData = allData.filter(log => log.note !== "Mood Scanner Update");
      setHistoryLogs(filteredData);
      setWeeklyLogs(filteredData);
      fetchStats(userData.uid, statsRange, filteredData);
    }
  };

  const fetchStats = async (uid, range, localLogs) => {
    const apiStats = await api.getMoodStatistics(uid, range);
    if (apiStats) {
      setStatsData(apiStats);
    } else {
      calculateFrontendStats(localLogs, range);
    }
  };

  const calculateFrontendStats = (logs, range) => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    let filteredLogs = [];

    // Filter based on range
    if (range === 'daily') {
      filteredLogs = logs.filter(l => new Date(l.created_at) >= todayStart);
    } else if (range === 'weekly') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      filteredLogs = logs.filter(l => new Date(l.created_at) >= weekStart);
    } else {
      // monthly or default - last 30 days
      const monthStart = new Date(now);
      monthStart.setDate(now.getDate() - 30);
      filteredLogs = logs.filter(l => new Date(l.created_at) >= monthStart);
    }

    const sortedLogs = filteredLogs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    if (sortedLogs.length === 0) {
      setStatsData({ average_score: 0, total_logs: 0, most_frequent_mood: null, trend: [], wellness_score: 0, insights: [] });
      return;
    }

    const totalScore = sortedLogs.reduce((acc, log) => {
      const mood = moods.find(m => m.id === log.mood);
      return acc + (mood ? mood.score : 3);
    }, 0);

    const avg = (totalScore / sortedLogs.length).toFixed(1);

    // Most Frequent
    const counts = {};
    sortedLogs.forEach(log => { counts[log.mood] = (counts[log.mood] || 0) + 1; });
    const mostFrequent = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

    // Trend Data for Chart
    const trend = sortedLogs.map(log => {
      const mood = moods.find(m => m.id === log.mood);
      let dateLabel;

      if (range === 'daily') {
        dateLabel = new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      } else {
        dateLabel = new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      }

      return {
        date: dateLabel,
        score: mood ? mood.score : 3,
        mood: log.mood
      };
    });

    // Wellness Score Calculation (simplified for range)
    const moodScore = (parseFloat(avg) / 5) * 60;
    // Consistency: based on unique days in the selected range
    const uniqueDays = new Set(sortedLogs.map(l => new Date(l.created_at).toDateString())).size;

    // Adjust max consistency score based on range
    let consistencyMax = 5;
    if (range === 'daily') consistencyMax = 1;

    let consistencyScore = Math.min((uniqueDays / consistencyMax) * 40, 40);
    // For daily, if we have logs, maximum consistency for that view
    if (range === 'daily' && sortedLogs.length > 0) consistencyScore = 40;

    const wellnessScore = Math.round(moodScore + consistencyScore);

    // Smart Insights
    const insights = [];

    // Streak (Consistency) - Calculate globally from all logs
    let streak = 0;
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);
    const logDates = new Set(logs.map(l => new Date(l.created_at).setHours(0, 0, 0, 0)));
    for (let i = 0; i < 365; i++) {
      const d = new Date(todayTimestamp);
      d.setDate(d.getDate() - i);
      if (logDates.has(d.getTime())) streak++;
      else if (i === 0 && !logDates.has(todayTimestamp)) continue;
      else break;
    }
    insights.push({
      icon: 'Flame',
      text: streak > 0 ? `${streak} Day Streak` : "Start a Streak",
      color: streak > 0 ? 'text-orange-400' : 'text-slate-400',
      bg: streak > 0 ? 'bg-orange-500/10' : 'bg-slate-500/10'
    });

    // Stability
    if (sortedLogs.length >= 2) {
      const scores = sortedLogs.map(l => moods.find(m => m.id === l.mood)?.score || 3);
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;

      if (variance < 0.5) insights.push({ icon: 'Target', text: "Stable Mood", color: 'text-green-400', bg: 'bg-green-500/10' });
      else if (variance > 1.5) insights.push({ icon: 'Activity', text: "Mood Swings", color: 'text-yellow-400', bg: 'bg-yellow-500/10' });
      else insights.push({ icon: 'Wind', text: "Balanced Flow", color: 'text-cyan-400', bg: 'bg-cyan-500/10' });
    } else {
      insights.push({ icon: 'Activity', text: "Track more data", color: 'text-slate-400', bg: 'bg-slate-500/10' });
    }

    // Trend (Progress)
    if (sortedLogs.length >= 2) {
      const currentAvg = sortedLogs.slice(-3).reduce((acc, l) => acc + (moods.find(m => m.id === l.mood)?.score || 3), 0) / Math.min(sortedLogs.length, 3);
      const prevAvg = sortedLogs.length >= 6 ? sortedLogs.slice(-6, -3).reduce((acc, l) => acc + (moods.find(m => m.id === l.mood)?.score || 3), 0) / 3 : currentAvg;

      if (currentAvg > prevAvg + 0.2) insights.push({ icon: 'TrendingUp', text: "Mood Improving", color: 'text-green-400', bg: 'bg-green-500/10' });
      else if (currentAvg < prevAvg - 0.2) insights.push({ icon: 'CloudRain', text: "Taking a Dip", color: 'text-indigo-400', bg: 'bg-indigo-500/10' });
      else insights.push({ icon: 'Smile', text: "Holding Steady", color: 'text-blue-400', bg: 'bg-blue-500/10' });
    } else {
      insights.push({ icon: 'TrendingUp', text: "Not enough data", color: 'text-slate-400', bg: 'bg-slate-500/10' });
    }

    setStatsData({
      average_score: avg,
      total_logs: sortedLogs.length,
      most_frequent_mood: mostFrequent,
      trend: trend,
      wellness_score: wellnessScore,
      insights: insights
    });
  };

  useEffect(() => {
    fetchData();
  }, [userData, activeTab]);

  useEffect(() => {
    if (userData?.uid && activeTab === 'stats') {
      fetchStats(userData.uid, statsRange, historyLogs);
    }
  }, [statsRange, activeTab]);

  // save mood
  const handleSaveMood = async () => {
    if (!selectedMood) return alert("Pilih mood dulu ya!");
    setIsSaving(true);

    const payload = {
      firebase_uid: userData?.uid,
      mood: selectedMood,
      note: note,
    };

    try {
      await api.saveMood(payload);
      setNote('');
      setSelectedMood(null);
      await fetchData();
      alert("Mood berhasil disimpan!");
    } catch (error) {
      alert("Gagal menyimpan mood.");
    } finally {
      setIsSaving(false);
    }
  };

  // helpers
  const getMoodConfig = (moodId) => moods.find(m => m.id === moodId) || moods[0];

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Helper
  const groupLogsByDate = (logs) => {
    return logs.reduce((acc, log) => {
      const date = formatDate(log.created_at);
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    }, {});
  };

  // Filter daily
  const todayLogs = historyLogs.filter(log => {
    const logDate = new Date(log.created_at).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return logDate === today;
  });

  // calendar
  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    clickedDate.setHours(0, 0, 0, 0);

    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      setDateRange({ start: clickedDate, end: null });
    } else {
      if (clickedDate < dateRange.start) {
        setDateRange({ start: clickedDate, end: dateRange.start });
      } else {
        setDateRange({ ...dateRange, end: clickedDate });
      }
    }
  };

  // Filter Mingguan
  const filteredWeeklyLogs = weeklyLogs.filter(log => {
    if (!dateRange.start) return true;

    const logDate = new Date(log.created_at);
    logDate.setHours(0, 0, 0, 0);

    if (dateRange.end) {
      return logDate >= dateRange.start && logDate <= dateRange.end;
    }
    return logDate.getTime() === dateRange.start.getTime();
  });

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

    for (let day = 1; day <= daysInMonth; day++) {
      const thisDate = new Date(year, month, day);
      thisDate.setHours(0, 0, 0, 0);

      const hasLog = historyLogs.some(log => {
        const logDate = new Date(log.created_at);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === thisDate.getTime();
      });

      const isStart = dateRange.start && thisDate.getTime() === dateRange.start.getTime();
      const isEnd = dateRange.end && thisDate.getTime() === dateRange.end.getTime();
      const isInRange = dateRange.start && dateRange.end && thisDate > dateRange.start && thisDate < dateRange.end;

      let bgClass = "hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400";
      if (isStart || isEnd) bgClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 scale-110 z-10 font-bold";
      else if (isInRange) bgClass = "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200";
      else if (hasLog) bgClass = "bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 font-semibold";

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-10 w-10 md:h-12 md:w-full rounded-xl flex flex-col items-center justify-center text-sm transition-all relative ${bgClass}`}
        >
          {day}
          {hasLog && !isStart && !isEnd && (
            <span className="absolute bottom-1 w-1 h-1 bg-green-500 dark:bg-green-400 rounded-full shadow-[0_0_5px_rgba(74,222,128,0.8)]"></span>
          )}
        </button>
      );
    }
    return days;
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  return (
    <div className="w-full h-auto bg-transparent dark:bg-slate-950 text-slate-800 dark:text-white flex flex-col relative overflow-hidden">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-indigo-500/10 dark:bg-indigo-900/20 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="md:px-9 px-6 pt-8 pb-4 relative z-10 flex-none">
        <div className="w-full mx-auto bg-white/80 dark:bg-white/5 p-1.5 rounded-2xl flex gap-2 relative border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-sm dark:shadow-xl">
          {['daily', 'weekly', 'stats', 'analysis'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors relative ${activeTab === tab ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
                }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 capitalize">{tab === 'daily' ? 'Daily' : tab === 'weekly' ? 'Weekly' : tab === 'stats' ? 'Statistics' : 'AI Analysis'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 md:pb-6 scrollbar-hide relative z-10">
        <div className="max-w-6xl mx-auto min-h-full">

          <AnimatePresence mode='wait'>

            {/* Daily */}
            {activeTab === 'daily' && (
              <DailyTab
                moods={moods.filter(m => m.id !== 'grateful')}
                selectedMood={selectedMood}
                setSelectedMood={setSelectedMood}
                note={note}
                setNote={setNote}
                isSaving={isSaving}
                handleSaveMood={handleSaveMood}
                todayLogs={todayLogs}
                getMoodConfig={getMoodConfig}
                formatTime={formatTime}
              />
            )}

            {/* Weekly & calendar */}
            {activeTab === 'weekly' && (
              <WeeklyTab
                currentDate={currentDate}
                changeMonth={changeMonth}
                renderCalendar={renderCalendar}
                dateRange={dateRange}
                setDateRange={setDateRange}
                filteredWeeklyLogs={filteredWeeklyLogs}
                groupLogsByDate={groupLogsByDate}
                getMoodConfig={getMoodConfig}
                formatTime={formatTime}
              />
            )}

            {/* Statistic chart */}
            {activeTab === 'stats' && (
              <StatsTab
                statsRange={statsRange}
                setStatsRange={setStatsRange}
                statsData={statsData}
                onNavigate={onNavigate}
                getMoodConfig={getMoodConfig}
              />
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <AnalysisTab
                userData={userData}
                onChatRequest={onChatRequest}
                onNavigate={onNavigate}
              />
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Tracker;