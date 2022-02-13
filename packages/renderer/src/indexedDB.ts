export default {
    // 数据库
    db:null,
    indexedDB: window.indexedDB ||  window.webkitindexedDB || window.msIndexedDB || mozIndexedDB,
    openDB(dbName:string,version=1){
        return new Promise((resolve,reject)=>{
            const request = this.indexedDB.open(dbName,version);
            request.onerror = e => {
                console.log('indexedDB open error',e);
                reject(e);
            };
            request.onsuccess = e => {
                console.log('indexedDB open success',e);
                this.db = e.target.result;
                resolve(request.result);
            };
            request.onupgradeneeded = e => {
                console.log('indexedDB onupgradeneeded',e);
                this.db = e.target.result;
                const initDBs = ['like','album','collect'];


                // this.db.createObjectStore(objStoreName,{keyPath:'id'});

                
                for(let i = 0; i< initDBs.length; i++ ){
                    if(!this.db.objectStoreNames.contains(initDBs[i])){
                        let objectStore = this.db.createObjectStore(initDBs[i],{
                            keyPath:'id',
                            // autoIncrement:true
                        });
                        // 索引创建
                    }
                }
                
                resolve('');
            };
            // request.onupgradeneeded = e => {
            //     console.log('indexedDB open onupgradeneeded',e);
            //     this.db = e.target.result;
            //     if(!this.db.objectStoreNames.contains(objStoreName)){
            //         let objectStore = this.db.createObjectStore(objStoreName,{keyPath:'id',autoIncrement:true});
            //     }
            // }
        });
    },
    deleteDB(dbName:string){
        return new Promise((resolve,reject) => {
            const request = this.indexedDB.deleteDatabase(dbName);
            request.onsuccess = () =>resolve();
            request.onerror = e =>reject(e);
        });
    },
    closeDB(){
        return new Promise((resolve,reject) =>{
            if(!this.db) {
                resolve()
            }else{
                this.db.close();
                this.db = null;
                resolve();
            } 
        });
    },
    add(objStoreName,arg){
        console.log(this.db)
        return new Promise((resolve,reject) =>{
            if(!this.db) reject('数据库未连接！');
            const request = this.db.transaction(objStoreName,'readwrite').objectStore(objStoreName).add(arg);
            request.onsuccess = () => resolve(request.result);
            request.onerror = e => reject(e);
        });
    },
    get(objStoreName){
        return new Promise((resolve,reject)=>{
            if(!this.db) reject('数据库未连接');
            const request = this.db.transaction([objStoreName],'readwrite').objectStore(objStoreName).getAll();
            request.onerror = e => reject(e);
            request.onsuccess = e => resolve(request.result);
        });
    },
    forEach(objStoreName:string){
        return new Promise((resolve,reject)=>{
            if(!this.db) reject('数据库未连接');
            const request = this.db.transaction([objStoreName],'readwrite').objectStore(objStoreName).openCursor();
            request.onerror = e => reject(e);
            request.onsuccess = () => resolve(request.result);
        });
    },
    update(objStoreName,arg){
        return new Promise((resolve,reject)=>{
            if(!this.db) reject('数据库未连接');
            const request = this.db.transaction([objStoreName],'readwrite').objectStore(objStoreName).put(arg);
            request.onerror = e => reject(e);
            request.onsuccess = () => resolve(request.result);
        });
    },
    remove(objStoreName,index){
        return new Promise((resolve,reject)=>{
            if(!this.db) reject('数据库未连接');
            const request = this.db.transaction([objStoreName],'readwrite').objectStore(objStoreName).delete(index);
            request.onerror = e => reject(e);
            request.onsuccess = () => resolve(request.result);
        });
    },
    searchFromIndex(objStoreName,index,value){
        return new Promise((resolve,reject)=>{
            if(!this.db) reject('数据库未连接');
            const request = this.db.transaction([objStoreName],'readwrite').objectStore(objStoreName).index(index).getAll(value);
            request.onerror = e => reject(e);
            request.onsuccess = () => resolve(request.result);
        });
    }
};