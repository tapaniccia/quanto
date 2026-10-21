import {isExpense,iso,parseDate,periodBounds,inPeriod,expandTransactions,transactionValue} from './finance.js';
const cents=n=>Math.max(0,Math.round((Number(n)||0)*100));
export function cycleBaseline(records,config,today){const bounds=periodBounds(today,'cycle',config.cycleDay||1);const entries=expandTransactions(records.transactions,bounds.start,bounds.end,records.exceptions||{}).filter(t=>t.date<=today);const sum=type=>entries.filter(t=>(type==='egreso'?isExpense(t):t.type===type)).reduce((n,t)=>n+transactionValue(t,config.isVenezuela),0);return {...bounds,income:sum('ingreso'),expenses:sum('egreso')};}
export function projectPlan({debts=[],goals=[],income=0,expenses=0,reserve=0,debtShare=60,strategy='due',start,cycleDay=1,horizon=24}){
 const capacity=Math.max(0,cents(income)-cents(expenses)-cents(reserve));
 const ds=debts.map(d=>({...d,left:cents(d.balance),installmentCents:cents(d.installment),due:d.nextDue,completed:null}));
 const gs=goals.map(g=>({...g,left:Math.max(0,cents(g.target)-cents(g.saved)),initial:cents(g.saved),completed:null}));
 const rows=[];let overdue=0;
 for(let i=0;i<horizon;i++){
  const bounds=periodBounds(start,'cycle',cycleDay,i),lastDate=parseDate(bounds.end);lastDate.setDate(lastDate.getDate()-1);const endDate=iso(lastDate);let cash=capacity,mandatory=0,extra=0,savings=0,shortfall=0;
  // Agreed installments are always funded first, including unpaid dates before the plan start.
  const ordered=ds.filter(d=>d.left>0).sort((a,b)=>a.due.localeCompare(b.due));
  for(const d of ordered){let dueAmount=Math.min(d.left,d.arrears||0),iterations=0;while(d.due<bounds.end&&d.left>0&&iterations++<10000){dueAmount=Math.min(d.left,dueAmount+d.installmentCents);if(i===0&&d.due<bounds.start)overdue++;const next=parseDate(d.due);next.setDate(next.getDate()+Math.max(1,Number(d.everyDays)||1));d.due=iso(next);if(dueAmount>=d.left)break;}const paid=Math.min(cash,dueAmount);cash-=paid;d.left-=paid;mandatory+=paid;shortfall+=dueAmount-paid;d.arrears=dueAmount-paid;if(d.left===0&&!d.completed)d.completed=bounds.start;}
  const remainingDebts=ds.filter(d=>d.left>0).sort((a,b)=>strategy==='smallest'?a.left-b.left:a.due.localeCompare(b.due)||a.left-b.left);
  let debtBudget=gs.some(g=>g.left>0)?Math.round(cash*Math.min(100,Math.max(0,Number(debtShare)))/100):cash;
  for(const d of remainingDebts){const paid=Math.min(d.left,debtBudget);d.left-=paid;debtBudget-=paid;cash-=paid;extra+=paid;if(!d.left&&!d.completed)d.completed=bounds.start;}
  const orderedGoals=gs.filter(g=>g.left>0).sort((a,b)=>a.targetDate.localeCompare(b.targetDate));
  for(let j=0;j<orderedGoals.length;j++){const g=orderedGoals[j];let cycles=1;while(cycles<600&&periodBounds(start,'cycle',cycleDay,i+cycles).start<=g.targetDate)cycles++;const needed=Math.ceil(g.left/cycles);const saved=Math.min(g.left,cash,needed);g.left-=saved;cash-=saved;savings+=saved;if(!g.left&&!g.completed)g.completed=bounds.start;}
  // Spare capacity accelerates the earliest remaining goal, then outstanding debt.
  for(const g of orderedGoals){const saved=Math.min(g.left,cash);g.left-=saved;cash-=saved;savings+=saved;if(!g.left&&!g.completed)g.completed=bounds.start;}
  for(const d of remainingDebts){const paid=Math.min(d.left,cash);d.left-=paid;cash-=paid;extra+=paid;if(!d.left&&!d.completed)d.completed=bounds.start;}
  rows.push({...bounds,label:bounds.start,mandatory:mandatory/100,extra:extra/100,savings:savings/100,unallocated:cash/100,shortfall:shortfall/100,debtRemaining:ds.reduce((n,d)=>n+d.left,0)/100,goalRemaining:gs.reduce((n,g)=>n+g.left,0)/100});
 }
 return {capacity:capacity/100,overdue,rows,debts:ds.map(d=>({...d,remaining:d.left/100})),goals:gs.map(g=>({...g,remaining:g.left/100,projectedSaved:(g.initial+Math.max(0,cents(g.target)-g.initial-g.left))/100,onTime:!g.left&&(cents(g.saved)>=cents(g.target)||g.completed<=g.targetDate)}))};
}
