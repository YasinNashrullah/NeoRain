import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, MoreVertical, X, FileText, Trash2, Camera } from 'lucide-react';

const ChatHeader = ({
    onBack,
    currentStyle,
    activeContext,
    handleContextChange,
    showHistoryMenu,
    setShowHistoryMenu,
    assessmentHistory,
    onDeleteChat,
    isCameraActive,
    onToggleCamera,
    detectedEmotion
}) => {
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);

    return (
        <>
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

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {/* Camera Status Indicator */}
                        <AnimatePresence>
                            {isCameraActive && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, width: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, width: 0, scale: 0.8 }}
                                    className="overflow-hidden mr-2"
                                >
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md ${detectedEmotion
                                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                                        : 'bg-slate-500/10 border-slate-500/20 text-slate-500 dark:text-slate-400'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${detectedEmotion ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                        <span className="text-[10px] font-bold whitespace-nowrap">
                                            {detectedEmotion ? `Terdeteksi: ${detectedEmotion}` : 'Mencari wajah...'}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Camera Toggle */}
                        <button
                            onClick={onToggleCamera}
                            className={`p-2 rounded-full transition-colors ${isCameraActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'}`}
                            title={isCameraActive ? "Matikan Kamera" : "Aktifkan Kamera"}
                        >
                            <Camera className="w-5 h-5" />
                        </button>

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
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-14 w-72 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                                    >
                                        {/* Header */}
                                        <div className="px-4 py-3 flex justify-between items-center border-b border-white/5">
                                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Riwayat Sesi</span>
                                            <button
                                                onClick={() => setShowHistoryMenu(false)}
                                                className="text-slate-400 hover:text-white transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="p-2 space-y-2">
                                            {/* Default Option */}
                                            <button
                                                onClick={() => handleContextChange(null)}
                                                className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3
                                                ${!activeContext
                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                                        : 'hover:bg-white/5 text-slate-400'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!activeContext ? 'bg-white/20' : 'bg-white/5'}`}>
                                                    <Sparkles className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-bold">Mode Umum</span>
                                                    <span className={`text-[10px] ${!activeContext ? 'text-indigo-200' : 'text-slate-500'}`}>Tanpa konteks</span>
                                                </div>
                                            </button>

                                            {/* History List */}
                                            <div className="max-h-[240px] overflow-y-auto scrollbar-hide space-y-1">
                                                {assessmentHistory.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => handleContextChange(item)}
                                                        className={`w-full p-2.5 rounded-xl text-left transition-all border
                                                        ${activeContext?.id === item.id
                                                                ? 'bg-white/10 border-indigo-500/30 text-white'
                                                                : 'bg-transparent border-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs font-bold">
                                                                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                            <span className="text-[10px] opacity-60">
                                                                {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>

                                                        <div className="flex gap-1">
                                                            {item.stress_score > 18 && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Stres"></span>}
                                                            {item.anxiety_score > 9 && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" title="Cemas"></span>}
                                                            {item.depression_score > 13 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Depresi"></span>}
                                                            {item.stress_score <= 18 && item.anxiety_score <= 9 && item.depression_score <= 13 && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Sehat"></span>
                                                            )}
                                                            <span className="text-[10px] ml-1 opacity-60 truncate max-w-[120px]">
                                                                {item.stress_score > 18 ? 'Stres Tinggi' : 'Kondisi Stabil'}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="p-2 border-t border-white/5">
                                            <button
                                                onClick={() => {
                                                    setShowHistoryMenu(false);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                <span>Hapus Semua Chat</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowDeleteModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-200 dark:border-white/10"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400">
                                    <Trash2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Hapus Semua Chat?</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    Semua riwayat percakapan kamu akan dihapus permanen dan tidak bisa dikembalikan. Yakin?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDeleteChat();
                                            setShowDeleteModal(false);
                                        }}
                                        className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all transform active:scale-95"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatHeader;
