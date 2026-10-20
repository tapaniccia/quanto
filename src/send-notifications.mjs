import {initializeApp,cert} from 'firebase-admin/app';
import {getFirestore,Timestamp,FieldValue} from 'firebase-admin/firestore';
import webpush from 'web-push';
import {notificationEvents} from './notificationEvents.js';
const required=['FIREBASE_SERVICE_ACCOUNT','VAPID_PUBLIC_KEY','VAPID_PRIVATE_KEY','VAPID_SUBJECT'];
if(required.some(key=>!process.env[key])){console.log('Notification service has not been configured. No messages sent.');process.exit(0);}
const account=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if(account.project_id!=='quanto-89274')throw Error('Unexpected Firebase project');
initializeApp({credential:cert(account),projectId:account.project_id});const db=getFirestore();
webpush.setVapidDetails(process.env.VAPID_SUBJECT,process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
const validEndpoint=endpoint=>{try{const u=new URL(endpoint);return u.protocol==='https:'&& !u.username&&!u.password&& !u.port&&(['fcm.googleapis.com','web.push.apple.com','updates.push.services.mozilla.com','push.services.mozilla.com'].includes(u.hostname)||u.hostname.endsWith('.notify.windows.com'));}catch{return false;}};
await db.doc('public/notifications').set({enabled:true,vapidPublicKey:process.env.VAPID_PUBLIC_KEY,checkedAt:FieldValue.serverTimestamp()});
const snapshot=await db.collectionGroup('notifications').where('enabled','==',true).get();let sent=0,failed=0,skipped=0;const cached=new Map();
for(const device of snapshot.docs){let claimed=false;try{
 const p=device.data(),uid=device.ref.parent.parent?.id;if(!uid||!/^users\/[^/]+\/notifications\/[^/]+$/.test(device.ref.path)){skipped++;continue;}
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:p.timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
 const today=`${parts.year}-${parts.month}-${parts.day}`;if(Number(parts.hour)!==p.hour||p.lastSentDate===today){skipped++;continue;}
 const subscription=JSON.parse(p.subscription);if(!validEndpoint(subscription.endpoint)||!subscription.keys?.p256dh||!subscription.keys?.auth)throw Error('Invalid push subscription');
 if(!cached.has(uid)){const docs=await Promise.all(['household-config','finance-records'].map(key=>db.doc(`users/${uid}/data/${key}`).get()));cached.set(uid,docs.every(x=>x.exists)?docs.map(x=>JSON.parse(x.data().value)):null);}
 const data=cached.get(uid);if(!data){skipped++;continue;}const events=notificationEvents(data[1],data[0],today,p);
 const canSend=await db.runTransaction(async tx=>{const latest=await tx.get(device.ref),v=latest.data();if(!v?.enabled||v.lastSentDate===today||(v.leaseUntil?.toMillis?.()||0)>Date.now())return false;tx.update(device.ref,{leaseUntil:Timestamp.fromMillis(Date.now()+180000)});return true;});
 if(!canSend){skipped++;continue;}claimed=true;
 if(events.length){await webpush.sendNotification(subscription,JSON.stringify({title:events.map(x=>x.title).join(' · '),body:events.map(x=>x.body).join('\n'),tag:`quanto-${today}`}),{TTL:21600,urgency:'normal',timeout:15000});sent++;}
 await device.ref.update({lastSentDate:today,leaseUntil:FieldValue.delete(),lastSuccessAt:FieldValue.serverTimestamp()});
 }catch(e){failed++;if(e.statusCode===404||e.statusCode===410)await device.ref.update({enabled:false,leaseUntil:FieldValue.delete()});else if(claimed)await device.ref.update({leaseUntil:FieldValue.delete()});console.error(`Device delivery failed (${e.statusCode||'configuration or connection'}).`);}}
console.log(JSON.stringify({sent,failed,skipped}));if(failed)process.exitCode=1;
