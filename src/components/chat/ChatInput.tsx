'use client';

import { useEffect, useRef, useState } from 'react';
import { FiSend, FiSmile } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = [
  ['😀', '😂', '🥹', '😍', '🤩', '😎', '🙌', '🔥'],
  ['👍', '👎', '👏', '💪', '🤝', '✌️', '💯', '🫡'],
  ['❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍'],
  ['🎉', '🎊', '✨', '🌟', '⭐', '🏆', '💡', '🚀'],
  ['🙏', '🫂', '💬', '🗣️', '👀', '🤔', '😤', '🥳'],
  ['🇮🇳', '🌍', '🌱', '📢', '⚡', '💥', '🛡️', '🤝'],
];

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSend: (text: string) => void;
  onTyping: () => void;
  disabled?: boolean;
}

export default function ChatInput({ input, setInput, onSend, onTyping, disabled }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [showEmoji]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setShowEmoji(false);
  };

  const insertEmoji = (emoji: string) => {
    const el = inputRef.current;
    if (!el) {
      setInput(input + emoji);
    } else {
      const start = el.selectionStart ?? input.length;
      const end = el.selectionEnd ?? input.length;
      const newVal = input.slice(0, start) + emoji + input.slice(end);
      setInput(newVal);
      requestAnimationFrame(() => {
        el.setSelectionRange(start + emoji.length, start + emoji.length);
        el.focus();
      });
    }
    onTyping();
  };

  return (
    <div className="px-3 pb-3 pt-1.5 bg-gradient-to-t from-white/90 via-white/80 to-transparent dark:from-[#0a0a14]/90 dark:via-[#0a0a14]/70 dark:to-transparent relative">
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            ref={emojiRef}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-3 right-3 mb-2 p-3 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-200/60 dark:border-white/[0.06] shadow-xl shadow-black/5 z-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Emojis</span>
              <button
                type="button"
                onClick={() => setShowEmoji(false)}
                className="text-[10px] text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
              >
                Close
              </button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide">
              {EMOJIS.map((row, i) => (
                <div key={i} className="flex gap-1">
                  {row.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="w-9 h-9 flex items-center justify-center text-lg rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-end gap-1.5 bg-gray-100 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200/60 dark:border-white/[0.06] shadow-sm focus-within:shadow-md focus-within:border-indigo-300/60 dark:focus-within:border-indigo-500/30 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-300">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className={`p-2.5 pl-3.5 transition-colors shrink-0 ${showEmoji ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400'}`}
          >
            <FiSmile className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); onTyping(); }}
            placeholder={disabled ? 'Sign in to join the chat' : 'Type a message...'}
            disabled={disabled}
            className="flex-1 bg-transparent py-3 pr-2 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="m-1 p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100 shrink-0"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
