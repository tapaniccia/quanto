export async function collectAccountData(storage,uid,local){
 if(!uid||!storage?.cloud||storage.uid!==uid)throw Error('No authenticated storage');
 const data={},pendingDrafts={};
 for(const key of ['household-config','finance-records']){data[key]=JSON.parse((await storage.get(key)).value);const raw=local.getItem('quanto:cloud-draft:'+uid+':'+key);if(raw)pendingDrafts[key]=JSON.parse(raw);}
 return {exportedAt:new Date().toISOString(),data,pendingDrafts};
}
