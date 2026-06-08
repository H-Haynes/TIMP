import { EPlatform } from "@/enum"

// Vendor-prefixed fallback (legacy browser support)
const w = window as unknown as Record<string, unknown>
const idb: IDBFactory =
  (w.indexedDB as IDBFactory) ?? (w.webkitIndexedDB as IDBFactory) ?? (w.msIndexedDB as IDBFactory) ?? (w.mozIndexedDB as IDBFactory)

export default {
  db: null as IDBDatabase | null,

  openDB(dbName: string, version = 1): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = idb.open(dbName, version)
      request.onerror = e => {
        console.log("indexedDB open error", e)
        reject(e)
      }
      request.onsuccess = e => {
        console.log("indexedDB open success")
        this.db = (e.target as IDBOpenDBRequest).result
        resolve(request.result)
      }
      request.onupgradeneeded = e => {
        console.log("indexedDB onupgradeneeded")
        this.db = (e.target as IDBOpenDBRequest).result
        const initDBs = ["like", "album", "collect", "playlist", "setting"]

        for (let i = 0; i < initDBs.length; i++) {
          if (!this.db.objectStoreNames.contains(initDBs[i])) {
            this.db.createObjectStore(initDBs[i], {
              keyPath: "id"
            })
          }
        }

        resolve(request.result)
      }
    })
  },

  deleteDB(dbName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = idb.deleteDatabase(dbName)
      request.onsuccess = () => resolve()
      request.onerror = e => reject(e)
    })
  },

  closeDB(): Promise<void> {
    return new Promise((resolve, _reject) => {
      if (!this.db) {
        resolve()
      } else {
        this.db.close()
        this.db = null
        resolve()
      }
    })
  },

  add(objStoreName: string, arg: Record<string, unknown>): Promise<unknown> {
    console.log(this.db)
    return new Promise((resolve, reject) => {
      const db = this.db
      if (!db) {
        return reject("数据库未连接！")
      }
      console.log(objStoreName, "7777", arg)
      const request = db.transaction(objStoreName, "readwrite").objectStore(objStoreName).add(arg)
      request.onsuccess = () => resolve(request.result)
      request.onerror = e => reject(e)
    })
  },

  get(objStoreName: string): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      const db = this.db
      if (!db) {
        return reject("数据库未连接")
      }
      const request = db.transaction([objStoreName], "readwrite").objectStore(objStoreName).getAll()
      request.onerror = e => reject(e)
      request.onsuccess = () => resolve(request.result as unknown[])
    })
  },

  forEach(objStoreName: string): Promise<IDBCursorWithValue | null> {
    return new Promise((resolve, reject) => {
      const db = this.db
      if (!db) {
        return reject("数据库未连接")
      }
      const request = db.transaction([objStoreName], "readwrite").objectStore(objStoreName).openCursor()
      request.onerror = e => reject(e)
      request.onsuccess = () => resolve(request.result)
    })
  },

  update(objStoreName: string, arg: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const db = this.db
      if (!db) {
        return reject("数据库未连接")
      }
      const request = db.transaction([objStoreName], "readwrite").objectStore(objStoreName).put(arg)
      request.onerror = e => reject(e)
      request.onsuccess = () => resolve(request.result)
    })
  },

  remove(objStoreName: string, index: IDBValidKey, _platform?: EPlatform): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.db
      if (!db) {
        return reject("数据库未连接")
      }
      const request = db.transaction([objStoreName], "readwrite").objectStore(objStoreName).delete(index)
      request.onerror = e => reject(e)
      request.onsuccess = () => resolve()
    })
  },

  searchFromIndex(objStoreName: string, index: string, value: IDBValidKey | IDBKeyRange): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      const db = this.db
      if (!db) {
        return reject("数据库未连接")
      }
      const request = db.transaction([objStoreName], "readwrite").objectStore(objStoreName).index(index).getAll(value)
      request.onerror = e => reject(e)
      request.onsuccess = () => resolve(request.result as unknown[])
    })
  },

  clear(objStoreName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.db
      if (!db) {
        return reject("数据库未连接")
      }
      const request = db.transaction([objStoreName], "readwrite").objectStore(objStoreName).clear()
      request.onerror = e => reject(e)
      request.onsuccess = () => resolve()
    })
  }
}
