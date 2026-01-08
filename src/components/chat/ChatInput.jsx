import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

const ChatInput = ({ input, setInput, handleSend, isTyping, userName, currentStyle }) => {
    return (
        <div className="flex-none w-full bg-transparent border-t border-slate-200 dark:border-white/5 p-4 pb-6 z-20 backdrop-blur-sm">
            <div className="flex items-end gap-2">
                <div className="flex-1 bg-white/90 dark:bg-slate-900/90 border border-white/50 dark:border-white/10 rounded-[24px] flex items-end px-2 py-2 shadow-lg dark:shadow-none focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all backdrop-blur-xl">
                    <textarea
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                                e.target.style.height = 'auto';
                            }
                        }}
                        placeholder={`Cerita sini, ${userName}...`}
                        rows={1}
                        className="flex-1 bg-transparent text-slate-800 dark:text-white text-sm px-3 py-1 focus:outline-none resize-none max-h-[100px] scrollbar-hide placeholder:text-slate-400"
                        style={{ height: 'auto' }}
                    />
                </div>
                <motion.button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className={`p-3 rounded-full shadow-md ${input.trim()
                        ? `text-white hover:scale-110 active:scale-95`
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                        }`}
                    animate={{
                        background: input.trim() ? currentStyle.primaryGradient : undefined,
                        backgroundColor: !input.trim() ? (currentStyle.theme === 'dark' ? '#1e293b' : '#e2e8f0') : undefined
                    }}
                    transition={{ duration: 1.5 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Send className="w-5 h-5" />
                </motion.button>
            </div>
        </div>
    );
};

export default ChatInput;
