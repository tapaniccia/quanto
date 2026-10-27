import {isExpense,spendingCategory,inPeriod,transactionValue} from './finance.js';
import {normalizeLabels} from './classification.js';
export const chartCategory=tx=>tx.expenseCategory?spendingCategory(tx):tx.customCategory||spendingCategory(tx);
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
