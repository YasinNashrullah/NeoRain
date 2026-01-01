import React from 'react';
import { Send, Mic } from 'lucide-react';

const ChatInput = ({ input, setInput, handleSend, isTyping, userName, currentStyle }) => {
    return (
        <div className="flex-none w-full bg-transparent border-t border-slate-200 dark:border-white/5 p-4 pb-6 z-20 backdrop-blur-sm">
            <div className="flex items-end gap-2">
                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] flex items-end px-2 py-2 shadow-sm focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
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
                    <Mic className="w-5 h-5 text-slate-400 hover:text-indigo-500 transition-colors mx-2 mb-1 cursor-pointer" />
                </div>
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className={`p-3 rounded-full shadow-md ${input.trim()
                        ? `${currentStyle.primary} text-white hover:scale-110 active:scale-95`
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                        }`}
                    style={{ transition: 'background-color 1500ms ease-in-out, transform 300ms ease-in-out, opacity 300ms' }}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default ChatInput;
