'use client';

import { FiUsers, FiChevronLeft, FiCircle } from 'react-icons/fi';
import Link from 'next/link';
import LogoIcon from '@/components/LogoIcon';

interface ChatHeaderProps {
  groupName: string;
  onlineCount: number;
}

export default function ChatHeader({ groupName, onlineCount }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/80 dark:bg-[#0f0f1a]/90 border-b border-gray-200/60 dark:border-white/5 backdrop-blur-xl">
      <Link href="/" className="lg:hidden p-1 -ml-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
        <FiChevronLeft className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
      </Link>
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 shadow-sm">
        <LogoIcon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {groupName}
        </h1>
        <div className="flex items-center gap-1.5 text-[11px]">
          <FiCircle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
          <span className="text-gray-500 dark:text-zinc-400">{onlineCount} online</span>
        </div>
      </div>
      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-zinc-400">
        <FiUsers className="w-4 h-4" />
      </button>
    </div>
  );
}
