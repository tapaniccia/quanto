export const BCV_URL='https://rates.dolarvzla.com/bcv/current.json';
export const isUsdRate=rate=>!rate.quoteCurrency||rate.quoteCurrency==='USD';
export function parseBcvReference(payload){const current=payload?.current;if(!current||!/^\d{4}-\d{2}-\d{2}$/.test(current.date)||![current.usd,current.eur].every(v=>typeof v==='number'&&Number.isFinite(v)&&v>0))throw Error('Invalid exchange-rate response');const d=new Date(current.date+'T12:00:00');if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==current.date)throw Error('Invalid reference date');const previous=payload.previous;const previousDate=previous&&new Date(previous.date+'T12:00:00');const validPrevious=previous&&previousDate&&!Number.isNaN(previousDate.getTime())&&previousDate.toISOString().slice(0,10)===previous.date&&/^\d{4}-\d{2}-\d{2}$/.test(previous.date)&&[previous.usd,previous.eur].every(v=>typeof v==='number'&&Number.isFinite(v)&&v>0);return {date:current.date,usd:current.usd,eur:current.eur,...(validPrevious?{previous:{date:previous.date,usd:previous.usd,eur:previous.eur}}:{})};}
export function importBcvReferences(rates,reference){const incoming=[['USD',reference.usd],['EUR',reference.eur]].map(([quoteCurrency,rate])=>({name:`BCV ${quoteCurrency} · DolarVZLA`,date:reference.date,rate,quoteCurrency,source:'dolarvzla-bcv'}));return [...rates.filter(r=>!incoming.some(n=>n.source===r.source&&n.date===r.date&&n.quoteCurrency===(r.quoteCurrency||'USD'))),...incoming];}

export const applicableBcvReference=(reference,today)=>reference.date>today&&reference.previous?.date<=today?reference.previous:reference;

export function parseBcvHistory(payload){
 if(!Array.isArray(payload)||payload.length>1000)throw Error('Invalid history');
 return payload.map(current=>parseBcvReference({current}));
}
export function historyReferences(rows){return rows.flatMap(row=>importBcvReferences([],row));}
export function mergeRateHistory(rates,incoming){
 const map=new Map(rates.map((r,i)=>[r.source==='dolarvzla-bcv'?`${r.source}:${r.date}:${r.quoteCurrency||'USD'}`:`manual:${i}`,r]));
 for(const r of incoming)map.set(`${r.source}:${r.date}:${r.quoteCurrency||'USD'}`,r);
 return [...map.values()];
}
export function selectDatedRate(rates,date,quoteCurrency='USD'){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return null;
 return rates.filter(r=>(r.quoteCurrency||'USD')===quoteCurrency&&r.date<=date&&Number.isFinite(Number(r.rate))&&Number(r.rate)>0).sort((a,b)=>b.date.localeCompare(a.date)||(a.source==='dolarvzla-bcv'?-1:1))[0]||null;
}
const historyRequests=new Map();
export async function fetchBcvYear(year){
 if(!/^\d{4}$/.test(String(year)))throw Error('Invalid year');
 const key=`${year}:${new Date().toDateString()}`,existing=historyRequests.get(key);if(existing)return existing;
 const request=(async()=>{const c=new AbortController(),timer=setTimeout(()=>c.abort(),12000);try{const response=await fetch(`https://rates.dolarvzla.com/bcv/${Number(year)}/list.json`,{signal:c.signal});if(!response.ok)throw Error('History unavailable');return historyReferences(parseBcvHistory(await response.json()));}finally{clearTimeout(timer);}})();
 historyRequests.set(key,request);try{return await request;}catch(e){historyRequests.delete(key);throw e;}
}
