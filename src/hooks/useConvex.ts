'use client';

import { useConvex as useConvexClient } from '@/lib/convexDisconnected';

export function useConvexReady() {
  return false;
}

export function useConvex() {
  return useConvexClient();
}
