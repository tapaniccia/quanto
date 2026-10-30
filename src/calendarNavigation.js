export function calendarDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const date=new Date(`${value}T12:00:00Z`);
 return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value?value:null;
}
export function calendarHash(date){const valid=calendarDate(date);return valid?`#calendar?date=${valid}`:'#calendar';}
export function calendarDateFromHash(hash){if(!hash?.startsWith('#calendar?'))return null;return calendarDate(new URLSearchParams(hash.slice(10)).get('date'));}
