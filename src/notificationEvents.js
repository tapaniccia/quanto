import {isExpense,availableBalance,iso,parseDate,periodBounds,expandTransactions,transactionValue} from './finance.js';
export function notificationEvents(records,config,today,options={}){
 const d=parseDate(today);d.setDate(d.getDate()+1);const end=iso(d);
 const es=options.lang!=='en',owner=options.ownerId||config.members?.[0]?.id;const visible=records.transactions.filter(t=>!t.private||t.ownerId===owner);
 const events=expandTransactions(visible,'1970-01-01',end,records.exceptions||{});
 const due=events.filter(t=>t.date===today&&!t.casheaSettlement&&!t.debtPaid),format=n=>new Intl.NumberFormat(es?'es':'en',{style:'currency',currency:config.isVenezuela?'USD':config.currency?.code||'USD'}).format(n);
 const sum=list=>list.reduce((n,t)=>n+transactionValue(t,config.isVenezuela),0),out=[];
 const income=due.filter(t=>t.type==='ingreso'),expenses=due.filter(isExpense);
 if(options.expenses!==false&&expenses.length)out.push({kind:'expenses',title:es?'Tus pagos de hoy':'Today’s payments',body:es?`Hoy tienes ${expenses.length} ${expenses.length===1?'gasto programado':'gastos programados'}${options.showAmounts?` por ${format(sum(expenses))}`:''}. Revisa tu calendario.`:`You have ${expenses.length} scheduled ${expenses.length===1?'expense':'expenses'} today${options.showAmounts?` totaling ${format(sum(expenses))}`:''}. Check your calendar.`});
 if(options.income!==false&&income.length)out.push({kind:'income',title:es?'¡Hoy cobras!':'Payday today!',body:es?`Tienes ${income.length} ${income.length===1?'ingreso programado':'ingresos programados'} para hoy${options.showAmounts?`: ${format(sum(income))}`:''}.`:`You have ${income.length} scheduled ${income.length===1?'income entry':'income entries'} today${options.showAmounts?`: ${format(sum(income))}`:''}.`});
 const cycle=periodBounds(today,'cycle',config.cycleDay||1),previous=periodBounds(today,'cycle',config.cycleDay||1,-1);
 if(options.cycleClose!==false&&cycle.start===today){const past=events.filter(t=>t.date<today),hadCycle=past.some(t=>t.date>=previous.start&&(t.type==='ingreso'||isExpense(t))),balance=availableBalance(past,config.isVenezuela,today).balance;if(hadCycle&&balance>0)out.push({kind:'cycle',title:es?'¡Cerraste el ciclo en positivo!':'You closed the cycle in positive territory!',body:es?(options.showAmounts?`Tu saldo disponible al cierre fue ${format(balance)}. ¡Buen trabajo!`:'Cerraste tu ciclo con saldo disponible positivo. ¡Buen trabajo!'):(options.showAmounts?`Available balance at cycle close was ${format(balance)}. Well done!`:'Your cycle closed with a positive available balance. Well done!')});}
 return out;
}
