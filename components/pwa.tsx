'use client';
import { useEffect } from 'react';

// Registers the service worker and holds a screen wake lock while the app
// is visible so event devices never sleep mid-competition.
export default function PwaBoot() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    let lock: any = null;
    let stopped = false;
    async function acquire() {
      try {
        if (!('wakeLock' in navigator)) return;
        lock = await (navigator as any).wakeLock.request('screen');
        lock?.addEventListener?.('release', () => {
          if (!stopped && document.visibilityState === 'visible') acquire();
        });
      } catch {}
    }
    function onVisible() {
      if (document.visibilityState === 'visible') acquire();
    }
    acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      document.removeEventListener('visibilitychange', onVisible);
      try {
        lock?.release?.();
      } catch {}
    };
  }, []);
  return null;
}
