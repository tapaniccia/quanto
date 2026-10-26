import {iso,parseDate,transactionValue} from './finance.js';
import {selectDatedRate} from './exchangeRates.js';
export function casheaSchedule({total,downMode='percent',down=40,installments=2,everyDays=14,date,firstDue=''}){
 const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&!Number.isNaN(parseDate(value).getTime())&&iso(parseDate(value))===value;
 const cents=Math.round(Number(total)*100),n=Number(installments),days=Number(everyDays),initial=downMode==='percent'?Math.round(cents*Number(down)/100):Math.round(Number(down)*100);
 if(down===''||down===null||!Number.isSafeInteger(cents)||cents<=0||!Number.isFinite(Number(down))||Number(down)<0||initial<0||initial>cents||!validDate(date)||!Number.isInteger(n)||n<1||n>12||!Number.isInteger(days)||days<1||days>365||!['percent','amount'].includes(downMode)||(downMode==='percent'&&Number(down)>100))throw Error('invalid-plan');
 const remaining=cents-initial;if(remaining>0&&remaining<n)throw Error('small-installments');
 const shift=(d,offset)=>{const value=parseDate(d);value.setDate(value.getDate()+offset);return iso(value);};
 const first=firstDue||shift(date,days);if(!validDate(first)||first<date)throw Error('invalid-date');
 const payments=initial>0?[{amount:initial/100,date,role:'initial',index:0}]:[];
 for(let i=0;remaining>0&&i<n;i++)payments.push({amount:(Math.floor(remaining/n)+(i<remaining%n?1:0))/100,date:shift(first,i*days),role:'installment',index:i+1});
 return {total:cents/100,down:initial/100,remaining:remaining/100,installments:remaining>0?n:0,everyDays:days,payments};
}
export function casheaQuote(tx,rates,today=iso(new Date())){
 if(!tx.cashea)return null;
 const paid=tx.casheaSettlement;
 if(paid&&paid.rate>0&&paid.amountBS>=0)return {rate:paid.rate,amountBS:paid.amountBS,rateDate:paid.rateDate||paid.date,date:paid.date,paid:true,estimated:false};
 const target=tx.date&&tx.date<today?tx.date:today,ref=selectDatedRate(rates,target,'USD');
 return ref?{rate:Number(ref.rate),amountBS:Math.round(transactionValue(tx,false)*Number(ref.rate)*100)/100,rateDate:ref.date,date:tx.date,paid:false,estimated:!tx.date||tx.date>today}:null;
}
