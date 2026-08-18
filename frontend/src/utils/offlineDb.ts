import { Song, Setlist, LiveState } from '../types';

const DB_NAME = 'PentasLirikOfflineDB';
const DB_VERSION = 1;

export interface OfflineMeta {
  key: string;
  value: any;
  updatedAt: string;
}

/**
 * Open and initialize IndexedDB database for offline caching.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('songs')) {
        db.createObjectStore('songs', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('setlists')) {
        db.createObjectStore('setlists', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('display_presets')) {
        db.createObjectStore('display_presets', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Check if IndexedDB is supported in current browser context.
 */
export function isIndexedDbSupported(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

/**
 * Cache songs and lyric chunks into IndexedDB.
 */
export async function saveSongsToOfflineCache(songs: Song[]): Promise<void> {
  if (!isIndexedDbSupported() || !songs || songs.length === 0) return;

  try {
    const db = await openDB();
    const tx = db.transaction(['songs', 'meta'], 'readwrite');
    const store = tx.objectStore('songs');
    const metaStore = tx.objectStore('meta');

    // Clear old records & insert new
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const song of songs) {
      store.put(song);
    }

    metaStore.put({
      key: 'songs_last_synced',
      value: songs.length,
      updatedAt: new Date().toISOString(),
    });

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[OfflineDB] Failed to save songs to offline cache:', err);
  }
}

/**
 * Retrieve cached songs from IndexedDB.
 */
export async function getSongsFromOfflineCache(): Promise<Song[]> {
  if (!isIndexedDbSupported()) return [];

  try {
    const db = await openDB();
    const tx = db.transaction('songs', 'readonly');
    const store = tx.objectStore('songs');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as Song[] || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[OfflineDB] Failed to load songs from offline cache:', err);
    return [];
  }
}

/**
 * Cache setlists and rundown items into IndexedDB.
 */
export async function saveSetlistsToOfflineCache(setlists: Setlist[]): Promise<void> {
  if (!isIndexedDbSupported() || !setlists) return;

  try {
    const db = await openDB();
    const tx = db.transaction(['setlists', 'meta'], 'readwrite');
    const store = tx.objectStore('setlists');
    const metaStore = tx.objectStore('meta');

    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const setlist of setlists) {
      store.put(setlist);
    }

    metaStore.put({
      key: 'setlists_last_synced',
      value: setlists.length,
      updatedAt: new Date().toISOString(),
    });

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[OfflineDB] Failed to save setlists to offline cache:', err);
  }
}

/**
 * Retrieve cached setlists from IndexedDB.
 */
export async function getSetlistsFromOfflineCache(): Promise<Setlist[]> {
  if (!isIndexedDbSupported()) return [];

  try {
    const db = await openDB();
    const tx = db.transaction('setlists', 'readonly');
    const store = tx.objectStore('setlists');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as Setlist[] || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[OfflineDB] Failed to load setlists from offline cache:', err);
    return [];
  }
}

/**
 * Cache display presets into IndexedDB.
 */
export async function savePresetsToOfflineCache(presets: any[]): Promise<void> {
  if (!isIndexedDbSupported() || !presets || presets.length === 0) return;

  try {
    const db = await openDB();
    const tx = db.transaction('display_presets', 'readwrite');
    const store = tx.objectStore('display_presets');

    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const preset of presets) {
      store.put(preset);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[OfflineDB] Failed to save presets to offline cache:', err);
  }
}

/**
 * Retrieve cached display presets from IndexedDB.
 */
export async function getPresetsFromOfflineCache(): Promise<any[]> {
  if (!isIndexedDbSupported()) return [];

  try {
    const db = await openDB();
    const tx = db.transaction('display_presets', 'readonly');
    const store = tx.objectStore('display_presets');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[OfflineDB] Failed to load presets from offline cache:', err);
    return [];
  }
}

/**
 * Save last live display state to offline cache.
 */
export async function saveLastLiveStateToOfflineCache(state: LiveState): Promise<void> {
  if (!isIndexedDbSupported() || !state) return;

  try {
    const db = await openDB();
    const tx = db.transaction('meta', 'readwrite');
    const store = tx.objectStore('meta');

    store.put({
      key: 'last_live_state',
      value: state,
      updatedAt: new Date().toISOString(),
    });

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[OfflineDB] Failed to save live state to offline cache:', err);
  }
}

/**
 * Retrieve last live display state from offline cache.
 */
export async function getLastLiveStateFromOfflineCache(): Promise<LiveState | null> {
  if (!isIndexedDbSupported()) return null;

  try {
    const db = await openDB();
    const tx = db.transaction('meta', 'readonly');
    const store = tx.objectStore('meta');

    return new Promise((resolve, reject) => {
      const request = store.get('last_live_state');
      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[OfflineDB] Failed to load last live state from offline cache:', err);
    return null;
  }
}
