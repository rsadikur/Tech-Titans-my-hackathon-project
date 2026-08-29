'use client';

import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';
import LogoIcon from './LogoIcon';

interface LogoHorizontalProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export default function LogoHorizontal({ size = 'md', showTagline = true }: LogoHorizontalProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';
  const iconSize = size === 'sm' ? 32 : size === 'lg' ? 56 : 40;

  return (
    <div className="flex items-center gap-3">
      <LogoIcon size={iconSize} withGlow={size === 'lg'} />
      <div className="flex flex-col">
        <span
          className={`font-bold tracking-tight leading-tight ${
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg'
          } ${isDark ? 'text-white' : 'text-primary'}`}
        >
          Civic<span className={isDark ? 'text-amber-400' : 'text-accent-saffron'}>Pulse</span>
        </span>
        {showTagline && (
          <span
            className={`font-medium leading-tight -mt-0.5 ${
              size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-xs' : 'text-[10px]'
            } ${isDark ? 'text-slate-400' : 'text-muted'}`}
          >
            Your Voice Matters
          </span>
        )}
      </div>
    </div>
  );
}
