import {calendarDate} from './calendarNavigation.js';
export const currencyOptions=[['USD','$'],['EUR','€'],['GBP','£'],['CAD','C$'],['MXN','MX$'],['COP','COL$'],['ARS','AR$'],['CLP','CL$'],['PEN','S/'],['BRL','R$']];
export function validSetup(value){
 if(!/^[A-Z]{3}$/.test(value.currency?.code||'')||!value.currency?.symbol?.trim()||value.currency.symbol.length>12)return false;
 if(value.cycleFrequency==='weekly')return !!calendarDate(value.cycleAnchor);
 const day=Number(value.cycleDay),second=Number(value.cycleSecondDay);
 return ['monthly','semimonthly'].includes(value.cycleFrequency)&&Number.isInteger(day)&&day>=1&&day<=(value.cycleFrequency==='semimonthly'?27:31)&&(value.cycleFrequency!=='semimonthly'||Number.isInteger(second)&&second>day&&second<=31);
}
export function completedSetup(value,now=new Date().toISOString()){
 if(!validSetup(value))throw Error('Invalid setup');
 return {currency:value.isVenezuela?{code:'USD',symbol:'$'}:{code:value.currency.code,symbol:value.currency.symbol.trim()},isVenezuela:!!value.isVenezuela,cycleFrequency:value.cycleFrequency,cycleDay:Number(value.cycleDay),cycleSecondDay:Number(value.cycleSecondDay),cycleAnchor:value.cycleAnchor,onboardingVersion:1,onboardingCompletedAt:now};
}
