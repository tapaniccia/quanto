self.addEventListener('push',event=>{
 let payload={};try{payload=event.data?.json()||{};}catch{}
 event.waitUntil(self.registration.showNotification(payload.title||'Quanto',{body:payload.body||'Revisa los movimientos de tu calendario.',tag:payload.tag||'quanto-calendar',icon:new URL('favicon.svg',self.registration.scope).href,badge:new URL('favicon.svg',self.registration.scope).href,data:{url:self.registration.scope},renotify:false}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{
 const scope=new URL(self.registration.scope),requested=event.notification.data||{};
 let date=requested.date;
 if(!date&&requested.url){try{const url=new URL(requested.url,scope);if(url.origin===scope.origin&&url.pathname===scope.pathname&&url.hash.startsWith('#calendar?'))date=new URLSearchParams(url.hash.slice(10)).get('date');}catch{}}
 const parsed=typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)?new Date(`${date}T12:00:00Z`):null;
 if(!parsed||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date){const now=new Date();date=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
 const url=new URL(`#calendar?date=${date}`,scope).href;
 const windows=await clients.matchAll({type:'window',includeUncontrolled:true});
 for(const client of windows){const current=new URL(client.url);if(current.origin===scope.origin&&current.pathname===scope.pathname&&'focus'in client){client.postMessage({type:'quanto-open-calendar',date});return client.focus();}}
 return clients.openWindow(url);
})());});
