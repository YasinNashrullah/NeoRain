import {
    Star, Flame, Trophy, Rocket, Smile, HeartHandshake, Camera, Zap, Medal, Crown,
    Calendar, Target, Sun, Moon, BookOpen, Share2, Award, TrendingUp, Shield
} from 'lucide-react';

export const ACHIEVEMENTS_LIST = [
    // --- ONBOARDING & PROFILE ---
    {
        id: 'langkah_awal',
        label: 'NeoRain Initiate',
        desc: 'Langkah pertama menuju versi terbaik dirimu.',
        icon: Rocket,
        condition: () => true
    },
    {
        id: 'supporter',
        label: 'Profile Completed',
        desc: 'Identitasmu kini lengkap dan siap melangkah.',
        icon: HeartHandshake,
        condition: (data) => data.hasLocation && data.hasGender
    },
    {
        id: 'verified',
        label: 'Identity Verified',
        desc: 'Tampil beda dengan foto profil unikmu.',
        icon: Camera,
        condition: (data) => data.hasCustomPhoto
    },

    // --- STREAKS (CONSISTENCY) ---
    {
        id: 'on_fire',
        label: 'Streak Ignited',
        desc: 'Konsistensi 3 hari! Api semangat mulai menyala.',
        icon: Flame,
        condition: (data) => (data.streak || 0) >= 3
    },
    {
        id: 'pejuang_minggu',
        label: 'Week Warrior',
        desc: 'Satu minggu penuh dedikasi tanpa putus.',
        icon: Calendar,
        condition: (data) => (data.streak || 0) >= 7
    },
    {
        id: 'konsisten_sejati',
        label: 'Consistency Master',
        desc: '30 Hari! Kamu adalah definisi ketekunan.',
        icon: Crown,
        condition: (data) => (data.streak || 0) >= 30
    },

    // --- TASKS & ACTION PLAN ---
    {
        id: 'first_step',
        label: 'Action Taker',
        desc: 'Satu tugas selesai, ribuan langkah maju.',
        icon: Star,
        condition: (data) => (data.completedCount || 0) >= 1
    },
    {
        id: 'task_hunter',
        label: 'Task Hunter',
        desc: '10 Misi terselesaikan dengan gemilang.',
        icon: Target,
        condition: (data) => (data.completedCount || 0) >= 10
    },
    {
        id: 'productivity_king',
        label: 'Productivity King',
        desc: '50 Misi! Produktivitasmu tak terbendung.',
        icon: Zap,
        condition: (data) => (data.completedCount || 0) >= 50
    },

    // --- SCORING (XP) ---
    {
        id: 'novice_earner',
        label: 'Novice Earner',
        desc: '100 Poin pertama. Perjalanan baru dimulai.',
        icon: Trophy,
        condition: (data) => (data.score || 0) >= 100
    },
    {
        id: 'pro_earner',
        label: 'Pro Earner',
        desc: '500 Poin! Kamu semakin ahli.',
        icon: Medal,
        condition: (data) => (data.score || 0) >= 500
    },
    {
        id: 'elite_earner',
        label: 'Elite Earner',
        desc: '1000 Poin! Legenda baru telah lahir.',
        icon: Award,
        condition: (data) => (data.score || 0) >= 1000
    },

    // --- MOOD TRACKING ---
    {
        id: 'mood_starter',
        label: 'Mood Aware',
        desc: 'Mulai menyadari dan mencatat perasaanmu.',
        icon: Smile,
        condition: (data) => (data.moodCount || 0) >= 1
    },
    {
        id: 'mood_master',
        label: 'Mood Master',
        desc: '20 Catatan mood. Pemahaman diri meningkat.',
        icon: BookOpen,
        condition: (data) => (data.moodCount || 0) >= 20
    },
    {
        id: 'self_aware',
        label: 'Self Discovery',
        desc: '50 Catatan. Kamu benar-benar mengenal dirimu.',
        icon: BrainCircuit,
        condition: (data) => (data.moodCount || 0) >= 50
    },

    // --- WELLNESS ---
    {
        id: 'early_bird',
        label: 'Early Bird',
        desc: 'Menyapa dunia dengan semangat pagi.',
        icon: Sun,
        condition: (data) => {
            const hour = new Date().getHours();
            return hour >= 5 && hour < 9;
        }
    },
    {
        id: 'night_owl',
        label: 'Night Owl',
        desc: 'Menjaga ketenangan di keheningan malam.',
        icon: Moon,
        condition: (data) => {
            const hour = new Date().getHours();
            return hour >= 20;
        }
    }
];

// Helper to get BrainCircuit if not imported above (it was in ActionPlan imports, let's add it to imports)
import { BrainCircuit } from 'lucide-react';

export const getLevel = (score) => {
    if (score < 100) return { label: 'Novice', color: 'text-slate-400', border: 'border-slate-400', bg: 'bg-slate-400/10', icon: Star, next: 100 };
    if (score < 500) return { label: 'Apprentice', color: 'text-indigo-400', border: 'border-indigo-400', bg: 'bg-indigo-400/10', icon: Zap, next: 500 };
    if (score < 1000) return { label: 'Expert', color: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-400/10', icon: Medal, next: 1000 };
    return { label: 'Master', color: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400/10', icon: Crown, next: 2000 };
};
