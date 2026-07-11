'use client';
import { useEffect } from 'react';

export function ChunkErrorHandler() {
  useEffect(() => {
    const handler = (event: ErrorEvent | PromiseRejectionEvent) => {
      const message = 'message' in event ? event.message : String((event as PromiseRejectionEvent).reason);
      if (message?.includes('Importing a module script failed') || message?.includes('ChunkLoadError')) {
        window.location.reload();
      }
    };
    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', handler);
    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', handler);
    };
  }, []);
  return null;
}