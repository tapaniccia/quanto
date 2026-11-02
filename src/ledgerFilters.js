import {normalizeLabels} from './classification.js';import {spendingCategory} from './finance.js';
export function matchesLedger(tx,filter,value){
 const amount=value(tx);
 if(filter.min!==''&&filter.min!=null&&amount<Number(filter.min))return false;
 if(filter.max!==''&&filter.max!=null&&amount>Number(filter.max))return false;
 if(filter.from&&(!tx.date||tx.date<filter.from)||filter.through&&(!tx.date||tx.date>filter.through))return false;
 if(filter.label&&!normalizeLabels(tx.labels).some(label=>label.toLocaleLowerCase().includes(filter.label.toLocaleLowerCase())))return false;
 if(filter.category&&spendingCategory(tx)!==filter.category)return false;
 if(filter.method&&tx.paymentMethod!==filter.method)return false;
 return true;
}
export function compareLedger(key,direction,value){return (a,b)=>{
 let result=0;
 if(key==='amount')result=value(a)-value(b);
 else if(key==='labels')result=normalizeLabels(a.labels).join(', ').localeCompare(normalizeLabels(b.labels).join(', '));
 else {if(!a.date||!b.date)return a.date?-1:b.date?1:String(a.id).localeCompare(String(b.id));result=a.date.localeCompare(b.date);}
 return result*(direction==='asc'?1:-1)||String(a.id).localeCompare(String(b.id));
};}
