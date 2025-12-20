import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, MoreVertical, X, FileText } from 'lucide-react';

const ChatHeader = ({
    onBack,
    currentStyle,
    activeContext,
    handleContextChange,
    showHistoryMenu,
    setShowHistoryMenu,
    assessmentHistory
}) => {
    return (
        <div className="flex-none w-full bg-transparent border-b border-slate-200 dark:border-white/10 z-30 relative backdrop-blur-sm">
            <div className="px-4 py-3 pt-8 md:pt-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] shadow-sm">
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=NeoRain" alt="AI" className="w-8 h-8" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-slate-800 dark:text-white font-bold text-sm">NeoRain AI</h1>
                        {activeContext ? (
                            <div className="flex items-center gap-2">
                                <p className="text-green-600 dark:text-green-400 text-[10px] flex items-center gap-1 font-bold">
                                    <FileText className="w-3 h-3" />
                                    Mode Analisis
                                </p>
                                <button
                                    onClick={() => handleContextChange(null)}
                                    className="p-0.5 bg-slate-200 dark:bg-white/10 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400 transition-colors text-slate-500 dark:text-slate-300"
                                    title="Matikan Mode Analisis"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <p className={`${currentStyle.text} text-[10px] font-medium`}>Teman Curhat</p>
                        )}
                    </div>
                </div>

                {/* History selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowHistoryMenu(!showHistoryMenu)}
                        className={`p-2 rounded-full transition-colors ${showHistoryMenu ? 'bg-slate-100 dark:bg-white/20 text-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'}`}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* dropdown menu */}
                    <AnimatePresence>
                        {showHistoryMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden z-50"
                            >
                                <div className="p-3 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pilih Konteks Data</span>
                                    <button onClick={() => setShowHistoryMenu(false)}><X className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white" /></button>
                                </div>

                                <div className="max-h-60 overflow-y-auto scrollbar-hide p-2 space-y-1">
                                    <button
                                        onClick={() => handleContextChange(null)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${!activeContext ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                    >
                                        Tanpa Konteks (Umum)
                                    </button>

                                    {assessmentHistory.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleContextChange(item)}
                                            className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${activeContext?.id === item.id ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5 group'}`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-xs font-bold ${activeContext?.id === item.id ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                                                </span>
                                                <span className={`text-[9px] ${activeContext?.id === item.id ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                                                    {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                {item.stress_score > 18 && <span className="text-[9px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-500/30">Stres</span>}
                                                {item.anxiety_score > 9 && <span className="text-[9px] bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-500/30">Cemas</span>}
                                                {item.depression_score > 13 && <span className="text-[9px] bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-500/30">Depresi</span>}
                                                {item.stress_score <= 18 && item.anxiety_score <= 9 && item.depression_score <= 13 &&
                                                    <span className="text-[9px] bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300 px-1.5 py-0.5 rounded border border-green-200 dark:border-green-500/30">Normal</span>
                                                }
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
