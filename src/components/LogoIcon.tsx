'use client';

import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';

interface LogoIconProps {
  size?: number;
  withGlow?: boolean;
}

export default function LogoIcon({ size = 48, withGlow = false }: LogoIconProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';
  const primary = isDark ? '#60A5FA' : '#1E3A5F';
  const accent1 = '#FF9933';
  const accent2 = '#138808';
  const bodyColor = isDark ? '#E2E8F0' : '#0F172A';
  const glowColor = isDark ? 'rgba(96,165,250,0.3)' : 'rgba(30,58,95,0.2)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {withGlow && (
        <circle cx="50" cy="50" r="45" fill={glowColor} opacity="0.5">
          <animate attributeName="r" values="42;46;42" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
      )}

      <path d="M50 12 78 23v23c0 18-12 32-28 42C34 78 22 64 22 46V23L50 12Z" fill={primary} opacity="0.95" />
      <path d="M50 12 78 23v23c0 18-12 32-28 42C34 78 22 64 22 46V23L50 12Z" stroke={accent1} strokeWidth="2" />
      <path d="M29 51h10l6-16 9 31 7-19h10" stroke={isDark ? '#FFFFFF' : '#FFFFFF'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="29" cy="51" r="3" fill={accent1} />
      <circle cx="71" cy="51" r="3" fill={accent2} />
    </svg>
  );
}
