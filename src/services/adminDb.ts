/**
 * Minimal promise wrapper over IndexedDB for the demo admin.
 * Two stores: `kv` (JSON documents) and `images` (uploaded Blobs).
 * Everything lives in THIS browser only — it is a presentation tool, not a backend.
 */

const DB_NAME = 'brk-admin';
const DB_VERSION = 1;
export type StoreName = 'kv' | 'images';

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB unavailable'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if (!db.objectStoreNames.contains('images')) db.createObjectStore('images');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(store: StoreName, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = run(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export const idb = {
  get: <T>(store: StoreName, key: string) => tx<T | undefined>(store, 'readonly', (s) => s.get(key) as IDBRequest<T | undefined>),
  set: (store: StoreName, key: string, value: unknown) => tx(store, 'readwrite', (s) => s.put(value, key)),
  del: (store: StoreName, key: string) => tx(store, 'readwrite', (s) => s.delete(key)),
  clear: (store: StoreName) => tx(store, 'readwrite', (s) => s.clear()),
  keys: (store: StoreName) => tx<IDBValidKey[]>(store, 'readonly', (s) => s.getAllKeys()),
  async entries<T>(store: StoreName): Promise<Array<[string, T]>> {
    const [keys, values] = await Promise.all([this.keys(store), tx<T[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>)]);
    return keys.map((k, i) => [String(k), values[i]]);
  },
};
