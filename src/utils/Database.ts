import { openDB } from 'idb';

const IDB_STORE = 'learnplaces_database';
const IDB_DATABASE = 'access_token_store';

const dbPromise = openDB(IDB_DATABASE, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(IDB_STORE)) {
      db.createObjectStore(IDB_STORE);
    }
  },
});

const setIndexedDBData = async <T>(key: string, value: T): Promise<void> => {
  const db = await dbPromise;
  await db.put(IDB_STORE, value, key);
};

const getIndexedDBData = async (key: string): Promise<string | null> => {
  const db = await dbPromise;
  return await db.get(IDB_STORE, key);
};

const deleteIndexedDBData = async (key: string): Promise<void> => {
  const db = await dbPromise;
  await db.delete(IDB_STORE, key);
};

export { setIndexedDBData, getIndexedDBData, deleteIndexedDBData };