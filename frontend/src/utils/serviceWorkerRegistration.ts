// Service Worker and PWA Install Prompt Manager

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const installPromptListeners: Array<(canInstall: boolean) => void> = [];

/**
 * Register Service Worker in production environment or supported browser.
 */
export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    });

    // Listen for PWA Install Prompt Event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      notifyInstallListeners(true);
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      notifyInstallListeners(false);
      console.log('[PWA] PentasLirik was successfully installed');
    });
  }
}

/**
 * Subscribe to PWA installable availability changes.
 */
export function onInstallPromptChange(callback: (canInstall: boolean) => void): () => void {
  installPromptListeners.push(callback);
  callback(deferredPrompt !== null);

  return () => {
    const index = installPromptListeners.indexOf(callback);
    if (index !== -1) {
      installPromptListeners.splice(index, 1);
    }
  };
}

function notifyInstallListeners(canInstall: boolean): void {
  for (const listener of installPromptListeners) {
    listener(canInstall);
  }
}

/**
 * Trigger native PWA install prompt.
 */
export async function promptPwaInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notifyInstallListeners(false);
    return choiceResult.outcome === 'accepted';
  } catch (err) {
    console.error('[PWA] Error triggering install prompt:', err);
    return false;
  }
}
