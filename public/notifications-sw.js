self.addEventListener('push',event=>{
 let payload={};try{payload=event.data?.json()||{};}catch{}
 event.waitUntil(self.registration.showNotification(payload.title||'Quanto',{body:payload.body||'Revisa los movimientos de tu calendario.',tag:payload.tag||'quanto-calendar',icon:new URL('favicon.svg',self.registration.scope).href,badge:new URL('favicon.svg',self.registration.scope).href,data:{url:self.registration.scope},renotify:false}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const windows=await clients.matchAll({type:'window',includeUncontrolled:true});const url=self.registration.scope;for(const client of windows){if(client.url.startsWith(url)&&'focus'in client)return client.focus();}return clients.openWindow(url);})());});
