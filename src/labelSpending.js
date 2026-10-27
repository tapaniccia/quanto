import {isExpense,spendingCategory,inPeriod,transactionValue,periodBounds,parseDate,iso} from './finance.js';
import {normalizeLabels} from './classification.js';
export const chartCategory=tx=>{const category=spendingCategory(tx);return !category||['deudas','cashea'].includes(category)?'uncategorized':category;};
// Split integer cents so multi-label entries conserve the category total exactly.
export function labelSpending(transactions,category,bounds,venezuela){
 const groups=new Map();let total=0,count=0;
 for(const tx of transactions){
  if(!isExpense(tx)||chartCategory(tx)!==category||!inPeriod(tx,bounds))continue;
  const value=transactionValue(tx,venezuela);if(!Number.isFinite(value)||value<=0)continue;
  const cents=Math.round(value*100),labels=normalizeLabels(tx.labels),names=labels.length?labels:[null];
  total+=cents;count++;
  names.forEach((name,index)=>{const key=name===null?'untagged':'label:'+name.toLocaleLowerCase('es');const previous=groups.get(key)||{key,name,cents:0};previous.cents+=Math.floor(cents/names.length)+(index<cents%names.length?1:0);groups.set(key,previous);});
 }
 return {total:total/100,count,entries:[...groups.values()].filter(item=>item.cents>0).sort((a,b)=>b.cents-a.cents).map(({cents,...item})=>({...item,value:cents/100,percent:total?cents/total*100:0}))};
}

export function labelPeriod(mode,anchor,cycleDay,start,end){
 if(mode==='custom'){
  if(!start||!end||start>end)return null;
  const exclusive=parseDate(end);exclusive.setDate(exclusive.getDate()+1);
  return {start,end:iso(exclusive)};
 }
 if(!anchor)return null;
 if(mode==='year')return {start:anchor.slice(0,4)+'-01-01',end:String(Number(anchor.slice(0,4))+1)+'-01-01'};
 return periodBounds(anchor,mode,cycleDay);
}
