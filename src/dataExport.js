export async function collectAccountData(storage,uid,local){
 if(!uid||!storage?.cloud||storage.uid!==uid)throw Error('No authenticated storage');
 const data={},pendingDrafts={};
 for(const key of ['household-config','finance-records']){data[key]=JSON.parse((await storage.get(key)).value);const raw=local.getItem('quanto:cloud-draft:'+uid+':'+key);if(raw)pendingDrafts[key]=JSON.parse(raw);}
 const ids=new Set(),collect=records=>{for(const tx of [...(records?.transactions||[]),...Object.values(records?.exceptions||{})])if(tx?.receiptId)ids.add(tx.receiptId);};collect(data['finance-records']);collect(pendingDrafts['finance-records']);const receipts={},attachmentErrors=[];for(const id of ids){try{const receipt=await storage.getReceipt?.(id);if(!receipt)throw Error('missing');receipts[id]=receipt;}catch{attachmentErrors.push(id);}}
 return {exportedAt:new Date().toISOString(),data,pendingDrafts,receipts,attachmentErrors};
}
