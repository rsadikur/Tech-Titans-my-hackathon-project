'use client';

import { useEffect } from 'react';
import ChatRoom from '@/components/chat/ChatRoom';

export default function ChatPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-5rem)] pt-16 lg:pt-20">
      <ChatRoom />
    </div>
  );
}
