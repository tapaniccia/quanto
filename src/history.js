import {isExpense,iso,parseDate,periodBounds,inPeriod,transactionValue} from './finance.js';
export function historyBounds(date,unit,cycleDay=1,offset=0){
 if(unit==='year'){const year=parseDate(date).getFullYear()+offset;return {start:`${year}-01-01`,end:`${year+1}-01-01`};}
 return periodBounds(date,unit,cycleDay,offset);
}
export function historyRows(transactions,periods,venezuela,today=iso(new Date())){
 return periods.map(bounds=>{const items=transactions.filter(t=>inPeriod(t,bounds)&&t.date<=today);const sum=type=>items.filter(t=>(type==='egreso'?isExpense(t):t.type===type)).reduce((n,t)=>n+transactionValue(t,venezuela),0);const income=sum('ingreso'),expenses=sum('egreso');return {...bounds,income,expenses,net:income-expenses,count:items.filter(t=>(t.type==='ingreso'||isExpense(t))).length,partial:bounds.start<=today&&bounds.end>today};});
}
export function samePeriod(date,unit,year,cycleDay=1){
 const d=parseDate(date);
 if(unit==='week'){// Match ISO week number across years, Monday to Sunday.
  const monday=parseDate(periodBounds(date,'week').start),thursday=new Date(monday);thursday.setDate(thursday.getDate()+3);
  const weekYear=thursday.getFullYear(),first=parseDate(periodBounds(`${weekYear}-01-04`,'week').start);
  const week=Math.round((monday-first)/604800000);
  const target=parseDate(periodBounds(`${year}-01-04`,'week').start);target.setDate(target.getDate()+week*7);
  const check=new Date(target);check.setDate(check.getDate()+3);if(check.getFullYear()!==year)return null;
  return historyBounds(iso(target),unit,cycleDay);
 }
 const day=Math.min(d.getDate(),new Date(year,d.getMonth()+1,0).getDate());
 return historyBounds(`${year}-${String(d.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,unit,cycleDay);
}
