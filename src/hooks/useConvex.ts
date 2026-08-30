'use client';

import { useConvex as useConvexClient } from 'convex/react';

export function useConvexReady() {
  return true;
}

export function useConvex() {
  return useConvexClient();
}
