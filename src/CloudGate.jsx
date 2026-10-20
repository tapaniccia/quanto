import React,{useEffect,useState} from 'react';
import {initializeApp} from 'firebase/app';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,signOut,sendEmailVerification} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {firebaseConfig} from './firebaseConfig.js';
import {localData,readCloud,initializeCloud,installCloudStorage,exportPending,clearPending} from './cloudStorage.js';
import './cloud.css';
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
function defaultValues(user){
 const member={id:user.uid,name:user.email.split('@')[0],color:'#3b82f6',emoji:'🙂'};
 return {'household-config':JSON.stringify({inviteCode:'',members:[member],currency:{symbol:'$',code:'USD'},isVenezuela:false,cycleDay:1,budget:{needsPct:50,wantsPct:30,savingsPct:20,emergencyMonths:6}}),'finance-records':JSON.stringify({transactions:[],rates:[]})};
}
function authError(e){return ({'auth/invalid-credential':'Correo o contraseña incorrectos.','auth/email-already-in-use':'Ese correo ya tiene una cuenta. Inicia sesión o recupera la contraseña.','auth/weak-password':'Usa una contraseña de al menos 8 caracteres.','auth/network-request-failed':'No hay conexión. Inténtalo de nuevo.','auth/too-many-requests':'Demasiados intentos. Espera antes de volver a intentarlo.','permission-denied':'No se pudo acceder a los datos de tu cuenta.'})[e.code]||'No se pudo completar la operación. Inténtalo de nuevo.';}
export default function CloudGate({children}){
 const [user,setUser]=useState(undefined),[ready,setReady]=useState(false),[empty,setEmpty]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[status,setStatus]=useState({message:'Conectando…',error:false,pending:false});
 const [mode,setMode]=useState('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[reload,setReload]=useState(0);
 useEffect(()=>onAuthStateChanged(auth,value=>{setUser(value);setReady(false);setEmpty(false);setError('');}),[]);
 useEffect(()=>{const listener=e=>setStatus(e.detail);window.addEventListener('quanto-cloud-status',listener);return()=>window.removeEventListener('quanto-cloud-status',listener);},[]);
 useEffect(()=>{
  if(!user)return;let live=true,cleanup;
  setReady(false);setError('');
  readCloud(db,user.uid).then(data=>{if(!live)return;if(!data['household-config']&&!data['finance-records']){setEmpty(true);return;}if(!data['household-config']||!data['finance-records'])throw new Error('incomplete');
   cleanup=installCloudStorage(db,user.uid,data);window.storage.signOut=()=>signOut(auth);setEmpty(false);setReady(true);setStatus(window.storage.draftsAvailable?{message:'Hay cambios de una sesión anterior pendientes de guardar. Descarga la copia antes de cargar los datos de la nube.',error:true,pending:false}:{message:'Sincronizado con la nube',error:false,pending:false});
  }).catch(()=>live&&setError('No se pudieron cargar tus datos. Reintenta la conexión; no se ha reemplazado ningún dato.'));
  return()=>{live=false;cleanup?.();};
 },[user?.uid,reload]);
 const submit=async e=>{e.preventDefault();setBusy(true);setError('');setNotice('');try{
  if(mode==='reset'){await sendPasswordResetEmail(auth,email);setNotice('Si existe una cuenta para ese correo, recibirás instrucciones de recuperación.');}
  else if(mode==='register'){const result=await createUserWithEmailAndPassword(auth,email,password);sendEmailVerification(result.user).catch(()=>{});}
  else await signInWithEmailAndPassword(auth,email,password);
 }catch(e){setError(authError(e));}finally{setBusy(false);setPassword('');}};
 const initialize=async imported=>{setBusy(true);setError('');try{let values=defaultValues(user);if(imported){const old=localData();for(const key of Object.keys(old)){JSON.parse(old[key]);values[key]=old[key];}}
  await initializeCloud(db,user.uid,values);setReload(x=>x+1);
 }catch(e){setError(authError(e));}finally{setBusy(false);}};
 if(user===undefined)return <div className="quanto-cloud-page" role="status">Conectando con tu cuenta…</div>;
 if(!user)return <main className="quanto-cloud-page"><form onSubmit={submit} className="quanto-cloud-card"><h1>Quanto</h1><h2>{mode==='register'?'Crear cuenta':mode==='reset'?'Recuperar contraseña':'Iniciar sesión'}</h2><p>Tus finanzas guardadas en tu cuenta, disponibles en tus dispositivos.</p><label>Correo electrónico<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label>{mode!=='reset'&&<label>Contraseña<input required minLength={mode==='register'?8:1} type="password" autoComplete={mode==='register'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)}/></label>}{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}<button disabled={busy} type="submit">{busy?'Espera…':mode==='register'?'Crear mi cuenta':mode==='reset'?'Enviar instrucciones':'Entrar'}</button><div className="quanto-cloud-actions">{mode!=='login'&&<button type="button" onClick={()=>{setMode('login');setError('');}}>Ya tengo cuenta</button>}{mode!=='register'&&<button type="button" onClick={()=>{setMode('register');setError('');}}>Crear cuenta</button>}{mode!=='reset'&&<button type="button" onClick={()=>{setMode('reset');setError('');}}>Olvidé mi contraseña</button>}</div><p>Los datos guardados anteriormente en este navegador podrán importarse después de entrar.</p></form></main>;
 if(empty)return <main className="quanto-cloud-page"><section className="quanto-cloud-card"><h1>Prepara tu cuenta</h1><p>{user.email}</p><p>Esta cuenta todavía no tiene movimientos guardados.</p>{Object.keys(localData()).length>0&&<><p>Encontramos datos de Quanto en este navegador. Puedes copiarlos a esta cuenta; la copia original del navegador se conserva.</p><button disabled={busy} onClick={()=>initialize(true)}>Importar mis datos de este navegador a mi cuenta</button></>}<button disabled={busy} onClick={()=>initialize(false)}>Empezar con una cuenta vacía</button>{error&&<p role="alert">{error}</p>}<button disabled={busy} onClick={()=>signOut(auth)}>Cerrar sesión</button></section></main>;
 if(!ready)return <main className="quanto-cloud-page"><section className="quanto-cloud-card"><p>{error||'Cargando tus datos de la nube…'}</p>{error&&<button onClick={()=>setReload(x=>x+1)}>Reintentar</button>}<button onClick={()=>signOut(auth)}>Cerrar sesión</button></section></main>;
 return <><header className="quanto-cloud-bar"><span>{user.email} · <span role="status">{status.message}</span></span><button disabled={status.pending} onClick={()=>signOut(auth)}>Cerrar sesión</button></header>{status.error&&<div className="quanto-cloud-alert" role="alert"><p>{status.message}</p><button onClick={()=>exportPending(user.uid)}>Descargar cambios pendientes</button><button onClick={()=>clearPending(user.uid)}>Ya descargué la copia: cargar datos de la nube</button></div>}<div inert={status.error||status.pending?'':undefined}>{children}</div>{status.pending&&<div className="quanto-cloud-saving" role="status">Guardando en la nube…</div>}</>;
}
