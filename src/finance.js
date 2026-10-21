// Debt entries represent cash outflows, as configured for this household.
export const isExpense = tx => tx.type === 'egreso' || tx.type === 'pasivo';
export const isSavings = tx => tx.type === 'activo' && (tx.tag === 'ahorro' || ['ahorro_general','fondo_emergencia','inversion'].includes(tx.catId));
export const cashDelta = (tx,venezuela) => tx.type === 'ingreso' ? transactionValue(tx,venezuela) : (isExpense(tx)||isSavings(tx)) ? -transactionValue(tx,venezuela) : 0;
export function positionSummary(transactions,venezuela){
 const sum=predicate=>transactions.filter(predicate).reduce((n,tx)=>n+transactionValue(tx,venezuela),0);
 const cash=transactions.reduce((n,tx)=>n+cashDelta(tx,venezuela),0),assets=sum(tx=>tx.type==='activo');
 return {cash,assets,netWorth:cash+assets,capital:sum(tx=>tx.catId==='aporte_capital')-sum(tx=>tx.catId==='retiro_capital')};
}
export const iso = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const parseDate = (value) => new Date(`${value}T12:00:00`);
export function periodBounds(date, mode='month', cycleDay=1, offset=0) {
  const d=parseDate(date); let start, end;
  const anchor=(y,m)=>new Date(y,m,Math.min(cycleDay,new Date(y,m+1,0).getDate()),12);
  if(mode==='week') { start=new Date(d); start.setDate(d.getDate()-((d.getDay()+6)%7)+offset*7); end=new Date(start); end.setDate(end.getDate()+7); }
  else if(mode==='quarter') { start=new Date(d.getFullYear(),Math.floor(d.getMonth()/3)*3+offset*3,1,12); end=new Date(start.getFullYear(),start.getMonth()+3,1,12); }
  else if(mode==='cycle') { let m=d.getMonth(); if(d<anchor(d.getFullYear(),m))m--; start=anchor(d.getFullYear(),m+offset); end=anchor(d.getFullYear(),m+offset+1); }
  else { start=new Date(d.getFullYear(),d.getMonth()+offset,1,12); end=new Date(start.getFullYear(),start.getMonth()+1,1,12); }
  return {start:iso(start),end:iso(end)};
}
export const inPeriod=(tx,b)=>!!tx.date&&tx.date>=b.start&&tx.date<b.end;
export function transactionValue(tx,venezuela) {
  const fee=Number(tx.feeFixed||0)+Number(tx.amount)*Number(tx.feePercent||0)/100;
  const total=Number(tx.amount)+(isExpense(tx)?fee:tx.type==='ingreso'?-fee:0);
  return venezuela&&tx.currency==='BS'?total/Number(tx.rate||1):total;
}
export function occurrences(tx, start, end) {
  if(!tx.recurrence||!tx.date) return tx.date>=start&&tx.date<end?[tx]:[];
  const {every,unit,until}=tx.recurrence;
  if(!Number.isInteger(every)||every<1)return [];
  const origin=parseDate(tx.date); let out=[];
  for(let i=0;i<100000;i++) {
    let d=new Date(origin);
    if(unit==='months') {const m=origin.getMonth()+every*i; d=new Date(origin.getFullYear(),m,Math.min(origin.getDate(),new Date(origin.getFullYear(),m+1,0).getDate()),12);}
    else d.setDate(origin.getDate()+every*i*(unit==='weeks'?7:1));
    const day=iso(d); if(day>=end||(until&&day>until))break;
    if(day>=start)out.push({...tx,id:`${tx.id}@${day}`,date:day,seriesId:tx.id});
  }
  return out;
}
export function expandTransactions(list,start,end,exceptions={}) {
  return list.flatMap(tx=>{
    const items=occurrences(tx,start,end);
    for(const [id,patch] of Object.entries(exceptions)) {
      if(id.startsWith(`${tx.id}@`) && patch.date>=start && patch.date<end && !items.some(x=>x.id===id)) {
        const original=id.slice(tx.id.length+1);
        const d=parseDate(original);d.setDate(d.getDate()+1);
        const found=occurrences(tx,original,iso(d)).find(x=>x.id===id); if(found)items.push(found);
      }
    }
    return items.map(item=>({...item,...exceptions[item.id]}));
  }).filter(tx=>!tx.skipped && tx.date>=start && tx.date<end);
}

export function availableBalance(transactions, venezuela, asOf = iso(new Date())) {
  const posted = transactions.filter(tx => tx.date && tx.date <= asOf);
  const sum = type => posted.filter(tx => tx.type === type).reduce((total,tx) => total + transactionValue(tx,venezuela),0);
  const income = sum('ingreso'), expenses = posted.filter(isExpense).reduce((n,tx)=>n+transactionValue(tx,venezuela),0);
  const savings=posted.filter(isSavings).reduce((n,tx)=>n+transactionValue(tx,venezuela),0);
  return {income, expenses, savings, balance: income - expenses - savings};
}

export function shiftCalendarMonth(month, offset) {
  const date = parseDate(`${month}-01`);
  date.setMonth(date.getMonth() + offset);
  return iso(date).slice(0,7);
}
export function calendarBalances(transactions, month, venezuela, exceptions = {}) {
  const bounds = periodBounds(`${month}-01`);
  const entries = expandTransactions(transactions, '1970-01-01', bounds.end, exceptions);
  const delta = tx => cashDelta(tx,venezuela);
  const opening = entries.filter(tx => tx.date < bounds.start).reduce((sum,tx) => sum + delta(tx),0);
  const daily = {};
  let income=0, expenses=0;
  for(const tx of entries.filter(tx => inPeriod(tx,bounds))) {
    daily[tx.date] = (daily[tx.date] || 0) + delta(tx);
    if(tx.type === 'ingreso') income += transactionValue(tx,venezuela);
    if(isExpense(tx)) expenses += transactionValue(tx,venezuela);
  }
  const date = parseDate(bounds.start); let running = opening; const balances = {};
  while(iso(date) < bounds.end) {
    const key = iso(date); running += daily[key] || 0; balances[key] = running; date.setDate(date.getDate()+1);
  }
  const monthEntries=entries.filter(tx=>inPeriod(tx,bounds));
  const sum=predicate=>monthEntries.filter(predicate).reduce((n,tx)=>n+transactionValue(tx,venezuela),0);
  return {opening,income,expenses,closing:running,balances,savings:sum(isSavings),debtPayments:sum(tx=>tx.type==='pasivo'||(tx.type==='egreso'&&tx.catId==='deudas')), ...positionSummary(entries,venezuela)};
}
