import {isExpense,isDebtPayment,spendingCategory,occurrences,iso,parseDate} from './finance.js';

export function normalizeLabels(value){
 const values=Array.isArray(value)?value:String(value??'').split(',');
 const seen=new Set();
 return values.map(label=>String(label).normalize('NFC').trim()).filter(label=>{const key=label.toLocaleLowerCase('es');if(!key||seen.has(key))return false;seen.add(key);return true;});
}
export const labelCategory = tx => `${isExpense(tx)?'expense':tx.type}:${spendingCategory(tx)||'other'}`;

function resolveEntry(records,id){
 const direct=records.transactions.find(tx=>tx.id===id);
 if(direct)return {base:direct,tx:direct};
 const base=records.transactions.find(tx=>id.startsWith(`${tx.id}@`));
 if(!base)return null;
 const day=id.slice(base.id.length+1),next=parseDate(day);
 if(Number.isNaN(next.getTime()))return null;
 next.setDate(next.getDate()+1);
 const occurrence=occurrences(base,day,iso(next)).find(tx=>tx.id===id);
 if(!occurrence||records.exceptions?.[id]?.skipped)return null;
 return {base,tx:{...occurrence,...records.exceptions?.[id]}};
}

export function personalLabelCatalog(records,userId){
 const catalog=Object.fromEntries(Object.entries(records.labelCatalog?.[userId]||{}).map(([key,labels])=>[key,normalizeLabels(labels)]));
 const add=tx=>{if(tx.ownerId!==userId)return;const key=labelCategory(tx);catalog[key]=normalizeLabels([...(catalog[key]||[]),...normalizeLabels(tx.labels)]);};
 const owned=records.transactions.filter(tx=>tx.ownerId===userId),byId=new Map(owned.map(tx=>[tx.id,tx]));
 owned.forEach(add);
 for(const [id,patch] of Object.entries(records.exceptions||{})){
  const base=byId.get(id.slice(0,id.lastIndexOf('@')));
  if(base&&!patch.skipped)add({...base,...patch});
 }
 return Object.fromEntries(Object.entries(catalog).map(([key,labels])=>[key,labels.sort((a,b)=>a.localeCompare(b,'es',{sensitivity:'base'}))]));
}
export const personalLabelOptions=(records,userId,tx)=>personalLabelCatalog(records,userId)[labelCategory(tx)]||[];

export function updateClassification(records,id,change,userId){
 const resolved=resolveEntry(records,id);
 if(!resolved||resolved.base.private&&resolved.base.ownerId!==userId||resolved.tx.private&&resolved.tx.ownerId!==userId)return records;
 const {tx}=resolved,patch={};
 if(typeof change.categoryId==='string'&&change.categoryId){
  if(isExpense(tx)){
   patch.expenseCategory=change.categoryId;
   if(!isDebtPayment(tx))patch.catId=change.categoryId;
   if(tx.cashea)patch.cashea={...tx.cashea,purchaseCategory:change.categoryId};
  }else patch.catId=change.categoryId;
 }
 if(Object.hasOwn(change,'labels'))patch.labels=normalizeLabels(change.labels);
 if(!Object.keys(patch).length)return records;
 const next=tx.seriesId?{...records,exceptions:{...records.exceptions,[id]:{...records.exceptions?.[id],...patch}}}:{...records,transactions:records.transactions.map(item=>item.id===id?{...item,...patch}:item)};
 if(Object.hasOwn(patch,'labels')){
  const key=labelCategory({...tx,...patch}),catalog=records.labelCatalog?.[userId]||{};
  next.labelCatalog={...records.labelCatalog,[userId]:{...catalog,[key]:normalizeLabels([...(catalog[key]||[]),...patch.labels])}};
 }
 return next;
}
