import { StorageStrategy } from './types';

export class WebStorage implements StorageStrategy {
  private readonly backupDbName = 'authBackup';
  private readonly backupStoreName = 'keyValuePairs';

  async get(key: string): Promise<string | null> {
    // まずLocalStorageから取得を試みる
    const value = localStorage.getItem(key);
    if (value) return value;

    // バックアップから取得を試みる
    return new Promise((resolve) => {
      const request = indexedDB.open(this.backupDbName, 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.backupStoreName)) {
          db.createObjectStore(this.backupStoreName);
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = db.transaction(this.backupStoreName, 'readonly');
        const store = tx.objectStore(this.backupStoreName);
        const request = store.get(key);
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      };

      request.onerror = () => resolve(null);
    });
  }

  async set(key: string, value: string): Promise<void> {
    // LocalStorageに保存
    localStorage.setItem(key, value);
    
    // IndexedDBにバックアップ
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.backupDbName, 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.backupStoreName)) {
          db.createObjectStore(this.backupStoreName);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.backupStoreName, 'readwrite');
      const store = tx.objectStore(this.backupStoreName);
      const request = store.put(value, key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}