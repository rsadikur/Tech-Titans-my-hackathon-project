'use client';

import { ReactNode } from 'react';

const disconnectedApi = new Proxy({}, {
  get: () => disconnectedApi,
});

export const api = disconnectedApi as any;

export function useQuery(_reference: unknown, _args?: unknown): any {
  return undefined;
}

export function useMutation(_reference: unknown): (...args: unknown[]) => Promise<undefined> {
  return async () => undefined;
}

export function useConvex(): null {
  return null;
}

export function ConvexProvider({ children }: { children: ReactNode }) {
  return children;
}
