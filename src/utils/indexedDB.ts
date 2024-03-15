// @ts-nocheck
import { EPlatform } from "@/enum";
export default {
  // 数据库
  db: null,
  indexedDB: window.indexedDB || window.webkitindexedDB || window.msIndexedDB || mozIndexedDB,
  openDB(dbName: string, version = 1) {
    return new Promise((resolve, reject) => {
      const request = this.indexedDB.open(dbName, version);
      request.onerror = e => {
        console.log('indexedDB open error', e);
        reject(e);
      };
      request.onsuccess = e => {
        console.log('indexedDB open success');
        this.db = e.target.result;
        resolve(request.result);
      };
      request.onupgradeneeded = e => {
        console.log('indexedDB onupgradeneeded');
        this.db = e.target.result;
        const initDBs = ['like', 'album', 'collect', 'playlist'];

        // this.db.createObjectStore(objStoreName,{keyPath:'id'});


        for (let i = 0; i < initDBs.length; i++) {
          if (!this.db.objectStoreNames.contains(initDBs[i])) {
            const objectStore = this.db.createObjectStore(initDBs[i], {
              keyPath: 'id',
              // autoIncrement:true
            });
            // 索引创建
          }
        }

        resolve('');
      };
    });
  },
  deleteDB(dbName: string) {
    return new Promise((resolve, reject) => {
      const request = this.indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve();
      request.onerror = e => reject(e);
    });
  },
  closeDB() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
      } else {
        this.db.close();
        this.db = null;
        resolve();
      }
    });
  },
  add(objStoreName, arg) {
    console.log(this.db);
    return new Promise((resolve, reject) => {
      if (!this.db) reject('数据库未连接！');
      console.log(objStoreName, '7777', arg)
      const request = this.db.transaction(objStoreName, 'readwrite').objectStore(objStoreName).add(arg);
      request.onsuccess = () => resolve(request.result);
      request.onerror = e => reject(e);
    });
  },
  get(objStoreName) {
    return new Promise((resolve, reject) => {
      if (!this.db) reject('数据库未连接');
      const request = this.db.transaction([objStoreName], 'readwrite').objectStore(objStoreName).getAll();
      request.onerror = e => reject(e);
      request.onsuccess = e => resolve(request.result);
    });
  },
  forEach(objStoreName: string) {
    return new Promise((resolve, reject) => {
      if (!this.db) reject('数据库未连接');
      const request = this.db.transaction([objStoreName], 'readwrite').objectStore(objStoreName).openCursor();
      request.onerror = e => reject(e);
      request.onsuccess = () => resolve(request.result);
    });
  },
  update(objStoreName, arg) {
    return new Promise((resolve, reject) => {
      if (!this.db) reject('数据库未连接');
      const request = this.db.transaction([objStoreName], 'readwrite').objectStore(objStoreName).put(arg);
      request.onerror = e => reject(e);
      request.onsuccess = () => resolve(request.result);
    });
  },
  remove(objStoreName, index, platform?: EPlatform) {
    return new Promise((resolve, reject) => {
      if (!this.db) reject('数据库未连接');
      const request = this.db.transaction([objStoreName], 'readwrite').objectStore(objStoreName).delete(index);
      request.onerror = e => reject(e);
      request.onsuccess = () => resolve(request.result);
      // 创建游标
      // const cursorRequest = this.db.transaction([objStoreName], 'readwrite').objectStore(objStoreName).openCursor();
      // cursorRequest.onsuccess = e => {
      //   const cursor = e.target.result;
      //   if (cursor) {
      //     if (cursor.value[index] === index && cursor.value.platform === platform) {
      //       cursor.delete();
      //       resolve(cursorRequest.result)
      //     }
      //     cursor.continue();
      //   }
      // }
      // cursorRequest.onerror = e => reject(e);
    });
  },
  searchFromIndex(objStoreName, index, value) {
    return new Promise((resolve, reject) => {
      if (!this.db) reject('数据库未连接');
      const request = this.db.transaction([objStoreName], 'readwrite').objectStore(objStoreName).index(index).getAll(value);
      request.onerror = e => reject(e);
      request.onsuccess = () => resolve(request.result);

    });
  },
  clear(objStoreName) {
    return new Promise((resolve, reject) => {
      if (!this.db) reject('数据库未连接');
      const request = this.db.transaction([objStoreName], 'readwrite').objectStore(objStoreName).clear();
      request.onerror = e => reject(e);
      request.onsuccess = () => resolve(request.result);
    });
  },
};
