import {iso,parseDate,periodBounds,expandTransactions,transactionValue} from './finance.js';
export function notificationEvents(records,config,today,options={}){
 const d=parseDate(today);d.setDate(d.getDate()+1);const end=iso(d);
 const owner=config.members?.[0]?.id;const visible=records.transactions.filter(t=>!t.private||t.ownerId===owner);
 const events=expandTransactions(visible,'1970-01-01',end,records.exceptions||{});
 const due=events.filter(t=>t.date===today),format=n=>new Intl.NumberFormat('es',{style:'currency',currency:config.isVenezuela?'USD':config.currency?.code||'USD'}).format(n);
 const sum=list=>list.reduce((n,t)=>n+transactionValue(t,config.isVenezuela),0),out=[];
 const income=due.filter(t=>t.type==='ingreso'),expenses=due.filter(t=>t.type==='egreso');
 if(options.expenses!==false&&expenses.length)out.push({kind:'expenses',title:'Tus pagos de hoy',body:`Hoy tienes ${expenses.length} ${expenses.length===1?'gasto programado':'gastos programados'}${options.showAmounts?` por ${format(sum(expenses))}`:''}. Revisa tu calendario.`});
 if(options.income!==false&&income.length)out.push({kind:'income',title:'¡Hoy cobras!',body:`Tienes ${income.length} ${income.length===1?'ingreso programado':'ingresos programados'} para hoy${options.showAmounts?`: ${format(sum(income))}`:''}.`});
 const cycle=periodBounds(today,'cycle',config.cycleDay||1),previous=periodBounds(today,'cycle',config.cycleDay||1,-1);
 if(options.cycleClose!==false&&cycle.start===today){const past=events.filter(t=>t.date<today),hadCycle=past.some(t=>t.date>=previous.start&&['ingreso','egreso'].includes(t.type)),balance=sum(past.filter(t=>t.type==='ingreso'))-sum(past.filter(t=>t.type==='egreso'));if(hadCycle&&balance>0)out.push({kind:'cycle',title:'¡Cerraste el ciclo en positivo!',body:options.showAmounts?`Tu saldo disponible al cierre fue ${format(balance)}. ¡Buen trabajo!`:'Cerraste tu ciclo con saldo disponible positivo. ¡Buen trabajo!'});}
 return out;
}
