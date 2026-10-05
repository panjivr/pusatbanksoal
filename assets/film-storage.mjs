let database;
function db(){return database||=new Promise((resolve,reject)=>{const r=indexedDB.open('bekal-film-studio',1);r.onupgradeneeded=()=>r.result.createObjectStore('project');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function transact(mode,fn){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('project',mode),r=fn(tx.objectStore('project'));tx.oncomplete=()=>resolve(r.result);tx.onerror=tx.onabort=()=>reject(tx.error);});}
export const save=data=>transact('readwrite',s=>s.put(data,'current'));
export const load=()=>transact('readonly',s=>s.get('current'));
export const clear=()=>transact('readwrite',s=>s.delete('current'));
