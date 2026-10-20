import {doc,getDoc,runTransaction,onSnapshot} from 'firebase/firestore';
const KEYS=['household-config','finance-records'];
const emit=(name,detail)=>window.dispatchEvent(new CustomEvent(name,{detail}));
export const localData=()=>Object.fromEntries(KEYS.map(key=>[key,localStorage.getItem(`quanto:shared:${key}`)]).filter(([,value])=>value!==null));
export const cloudRef=(db,uid,key)=>doc(db,'users',uid,'data',key);
export async function readCloud(db,uid){
 const snapshots=await Promise.all(KEYS.map(key=>getDoc(cloudRef(db,uid,key))));
 return Object.fromEntries(snapshots.map((snap,i)=>[KEYS[i],snap.exists()?snap.data():null]));
}
export async function initializeCloud(db,uid,values){
 await runTransaction(db,async tx=>{
  const refs=KEYS.map(key=>cloudRef(db,uid,key));
  const existing=await Promise.all(refs.map(ref=>tx.get(ref)));
  if(existing.some(s=>s.exists()))throw new Error('La cuenta ya tiene datos. Recarga antes de importar.');
  for(let i=0;i<KEYS.length;i++)tx.set(refs[i],{value:values[KEYS[i]],revision:1});
 });
}
export function installCloudStorage(db,uid,initial){
 let cache={...initial},pending=0,blocked=KEYS.some(key=>localStorage.getItem(`quanto:cloud-draft:${uid}:${key}`)!==null),stopped=false;
 const remote=()=>emit('quanto-cloud-data',Object.fromEntries(KEYS.map(key=>[key,cache[key]?.value||null])));
 const status=(message,error=false)=>emit('quanto-cloud-status',{message,error,pending:pending>0});
 const storage={cloud:true,uid,draftsAvailable:blocked,
  async get(key){if(!cache[key])throw new Error('No data');return {key,value:cache[key].value,shared:true};},
  async set(key,value){
   if(!KEYS.includes(key)||stopped)throw new Error('Sesión no disponible');
   if(blocked||pending){const e=new Error('Hay cambios pendientes. Descarga una copia y recarga antes de continuar.');status(e.message,true);throw e;}
   try { localStorage.setItem(`quanto:cloud-draft:${uid}:${key}`,value); }
   catch(e){blocked=true;status('No se pudo crear la copia local pendiente. No se ha enviado el cambio a la nube.',true);throw e;}
   const expected=cache[key]?.revision||0; pending++;status('Guardando en la nube…');
   try{
    await runTransaction(db,async tx=>{const ref=cloudRef(db,uid,key),snapshot=await tx.get(ref);const revision=snapshot.exists()?snapshot.data().revision:0;
     if(revision!==expected)throw new Error('Otra sesión cambió estos datos. Tu cambio se conserva en una copia local; descárgala antes de recargar.');
     tx.set(ref,{value,revision:revision+1});
    });
    cache[key]={value,revision:expected+1};
    localStorage.removeItem(`quanto:cloud-draft:${uid}:${key}`);
    status('Guardado en la nube');return {key,value,shared:true};
   }catch(e){blocked=true;status(e.message||'No se pudo guardar. Tu cambio está en la copia local pendiente.',true);throw e;}
   finally{pending--;if(!blocked){status('Guardado en la nube');remote();}else status('No guardado en la nube. Descarga la copia pendiente antes de recargar.',true);}
  },
  async list(prefix=''){return {keys:KEYS.filter(key=>key.startsWith(prefix)),shared:true};},
 };
 window.storage=storage;
 const stops=KEYS.map(key=>onSnapshot(cloudRef(db,uid,key),{includeMetadataChanges:true},snapshot=>{
  if(snapshot.metadata.hasPendingWrites||snapshot.metadata.fromCache||stopped)return;
  const data=snapshot.exists()?snapshot.data():null;
  if(!pending&&!blocked){cache[key]=data;remote();status('Sincronizado con la nube');}
 },()=>{blocked=true;status('Se perdió la sincronización. Descarga la copia pendiente y recarga para reconectar.',true);}));
 return ()=>{stopped=true;stops.forEach(stop=>stop());if(window.storage===storage)delete window.storage;};
}
export function exportPending(uid){
 const values={};for(const key of KEYS){const value=localStorage.getItem(`quanto:cloud-draft:${uid}:${key}`);if(value)values[key]=JSON.parse(value);}
 const url=URL.createObjectURL(new Blob([JSON.stringify({exportedAt:new Date().toISOString(),data:values},null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='quanto-cambios-pendientes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export function clearPending(uid){
 if(!window.confirm('¿Ya guardaste el archivo de cambios pendientes? Se cargará la versión de la nube.'))return;
 for(const key of KEYS)localStorage.removeItem(`quanto:cloud-draft:${uid}:${key}`);
 window.location.reload();
}
