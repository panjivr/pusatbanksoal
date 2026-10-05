// Completed conversions remain on this device until explicitly cleared.
let database;
async function db(){if(!database)database=new Promise((resolve,reject)=>{const r=indexedDB.open('bekal-markdown-results',1);r.onupgradeneeded=()=>r.result.createObjectStore('results');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});return database;}
async function request(mode,fn){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('results',mode),r=fn(tx.objectStore('results'));tx.oncomplete=()=>resolve(r.result);tx.onerror=tx.onabort=()=>reject(tx.error||Error('Hasil belum dapat disimpan.'));});}
export const saveResult=data=>request('readwrite',s=>s.put(data,'latest'));
export const readResult=()=>request('readonly',s=>s.get('latest'));
export const clearResult=()=>request('readwrite',s=>s.delete('latest'));
