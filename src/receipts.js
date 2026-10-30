export const MAX_RECEIPT_BYTES=200000;
export const validReceiptId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(id);
export function receiptPayload(value){
 const {dataUrl,mime,bytes,createdAt,name}=value||{};
 if(mime!=='image/jpeg'||typeof dataUrl!=='string'||dataUrl.length>280000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(dataUrl)||!Number.isInteger(bytes)||bytes<1||bytes>MAX_RECEIPT_BYTES||typeof name!=='string'||!name||name.length>120||typeof createdAt!=='string'||!Number.isFinite(Date.parse(createdAt)))throw Error('Invalid receipt');
 return {dataUrl,mime,bytes,createdAt,name};
}
export async function prepareReceipt(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('format');
 if(file.size>12000000)throw Error('size');
 const bitmap=await createImageBitmap(file);try{
 if(bitmap.width*bitmap.height>40000000)throw Error('size');
 for(const [edge,quality] of [[1800,.8],[1600,.7],[1400,.6],[1200,.5],[1000,.45]]){
  const scale=Math.min(1,edge/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const dataUrl=canvas.toDataURL('image/jpeg',quality),bytes=Math.floor((dataUrl.length-dataUrl.indexOf(',')-1)*3/4);
  if(bytes<=MAX_RECEIPT_BYTES){const name=(file.name.replace(/\.[^.]+$/,'').replace(/[^\p{L}\p{N} _.-]/gu,'_').slice(0,110)||'factura')+'.jpg';return {id:crypto.randomUUID(),...receiptPayload({dataUrl,mime:'image/jpeg',bytes,name,createdAt:new Date().toISOString()})};}
 }throw Error('size');
 }finally{bitmap.close();}
}
export async function resolveReceiptDrafts(inputs,storage){
 const uploaded=new Map(),out=[];
 for(const tx of inputs){const {receiptDraft,...clean}=tx;if(receiptDraft){if(!storage?.cloud||typeof storage.putReceipt!=='function')throw Error('Receipt storage unavailable');if(!uploaded.has(receiptDraft.id)){await storage.putReceipt(receiptDraft.id,receiptPayload(receiptDraft));uploaded.set(receiptDraft.id,true);}clean.receiptId=receiptDraft.id;}out.push(clean);}
 return out;
}
