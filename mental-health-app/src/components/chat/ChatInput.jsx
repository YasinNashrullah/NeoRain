import React from 'react';
import { Send, Mic } from 'lucide-react';

const ChatInput = ({ input, setInput, handleSend, isTyping, userName, currentStyle }) => {
    return (
        <div className="flex-none w-full bg-transparent border-t border-white/5 p-4 pb-6 z-20">
            <div className="flex items-end gap-2">
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[24px] flex items-end px-2 py-2">
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
                        className="flex-1 bg-transparent text-white text-sm px-3 py-1 focus:outline-none resize-none max-h-[100px] scrollbar-hide"
                        style={{ height: 'auto' }}
                    />
                    <Mic className="w-5 h-5 text-slate-400 mx-2 mb-1" />
                </div>
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className={`p-3 rounded-full transition-colors duration-700 ease-in-out ${input.trim() ? `${currentStyle.primary} text-white` : 'bg-slate-800 text-slate-600'}`}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default ChatInput;
