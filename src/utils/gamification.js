export const checkStreak = (lastLoginDate, currentStreak) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const last = new Date(lastLoginDate).setHours(0, 0, 0, 0);
  const oneDay = 24 * 60 * 60 * 1000;

  if (today === last) {
    return currentStreak; // Login di hari yang sama, streak tetap
  } else if (today - last === oneDay) {
    return currentStreak + 1; // Login besoknya, streak nambah
  } else {
    return 1; // reset ke 1
  }
};

export const achievementsList = [
  { id: 'first_step', label: 'Langkah Awal', desc: 'Bergabung dengan NeoRain', icon: '🚀', condition: (user) => true },
  { id: 'week_warrior', label: 'Pejuang Minggu', desc: 'Streak 7 Hari', icon: '🔥', condition: (user) => user.streak >= 7 },
  { id: 'mood_master', label: 'Mood Master', desc: 'Input 10x Mood', icon: '🎭', condition: (user) => user.mood_count >= 10 },
  { id: 'zen_mode', label: 'Zen Mode', desc: 'Rata-rata stres rendah', icon: '🧘', condition: (user) => user.avg_stress < 15 },
];