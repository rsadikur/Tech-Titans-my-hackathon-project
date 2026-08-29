'use client';

import { useTheme } from '@/hooks/useTheme';

interface CockroachLogoProps {
  className?: string;
  variant?: 'default' | 'light' | 'dark';
}

export default function CockroachLogo({ className = "w-6 h-6", variant = 'default' }: CockroachLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  let primary: string;
  let bodyColor: string;
  let accentSvg: string;

  if (variant === 'light') {
    primary = '#FFFFFF';
    bodyColor = '#E2E8F0';
    accentSvg = '#FFFFFF';
  } else if (variant === 'dark') {
    primary = '#0F172A';
    bodyColor = '#1E293B';
    accentSvg = '#0F172A';
  } else {
    primary = isDark ? '#60A5FA' : '#1E3A5F';
    bodyColor = isDark ? '#E2E8F0' : '#0F172A';
    accentSvg = isDark ? '#60A5FA' : '#1E3A5F';
  }

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 12 78 23v23c0 18-12 32-28 42C34 78 22 64 22 46V23L50 12Z" fill={accentSvg} opacity="0.95" />
      <path d="M50 12 78 23v23c0 18-12 32-28 42C34 78 22 64 22 46V23L50 12Z" stroke="#FF9933" strokeWidth="2" />
      <path d="M29 51h10l6-16 9 31 7-19h10" stroke={variant === 'light' ? '#0F172A' : '#FFFFFF'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="29" cy="51" r="3" fill="#FF9933" />
      <circle cx="71" cy="51" r="3" fill="#138808" />
    </svg>
  );
}
