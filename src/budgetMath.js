import {isExpense,expandTransactions,periodBounds,transactionValue,inPeriod,iso,parseDate,budgetBucket} from './finance.js';
export function budgetSummary(records,config,today,budget={},mode='cycle'){
 const period=typeof mode==='object'?mode:periodBounds(today,mode,config.cycleDay||1),all=expandTransactions(records.transactions,period.start,period.end,records.exceptions||{}),posted=all.filter(t=>t.date<=today);const sum=list=>list.reduce((n,t)=>n+transactionValue(t,config.isVenezuela),0);
 const recordedIncome=sum(posted.filter(t=>t.type==='ingreso')),actualExpenses=sum(posted.filter(t=>isExpense(t))),fixed=sum(all.filter(t=>isExpense(t)&&(t.fixedExpense===true||(t.fixedExpense!==false&&t.recurrence))));
 const auto=(value,fallback)=>value===''||value===null||value===undefined?fallback:Number(value);
 const income=auto(budget.incomeOverride,recordedIncome),needs=budget.mode==='amounts'?Number(budget.needsAmount||0):income*Number(budget.needsPct??50)/100,wants=budget.mode==='amounts'?Number(budget.wantsAmount||0):income*Number(budget.wantsPct??30)/100,savings=budget.mode==='amounts'?Number(budget.savingsAmount||0):income*Number(budget.savingsPct??20)/100;
 const fixedExpected=auto(budget.fixedOverride,fixed),needsSpent=sum(posted.filter(t=>budgetBucket(t)==='needs')),wantsSpent=sum(posted.filter(t=>budgetBucket(t)==='wants')),savingsRecorded=sum(posted.filter(t=>budgetBucket(t)==='savings'));
 const scheduled=Object.fromEntries(['needs','wants','savings'].map(key=>[key,sum(all.filter(tx=>tx.date>today&&budgetBucket(tx)===key))]));
 const base=auto(budget.emergencyBase,Math.max(fixedExpected,needsSpent)),emergencyTarget=auto(budget.emergencyTarget,base*Number(budget.emergencyMonths??3));
 const nextDay=parseDate(today);nextDay.setDate(nextDay.getDate()+1);const allPosted=expandTransactions(records.transactions,'1970-01-01',iso(nextDay),records.exceptions||{}).filter(t=>t.date<=today),emergencyCurrent=sum(allPosted.filter(t=>t.type==='activo'&&t.catId==='fondo_emergencia')),invested=sum(allPosted.filter(t=>t.type==='activo'&&t.catId==='inversion'));
 const remaining=Math.max(0,emergencyTarget-emergencyCurrent),investment=auto(budget.investmentContribution,emergencyTarget>0&&remaining===0?savings:0),emergencyContribution=auto(budget.emergencyContribution,Math.min(Math.max(0,savings-investment),remaining));
 return {scheduled,period,recordedIncome,actualExpenses,fixed,fixedExpected,needsSpent,wantsSpent,savingsRecorded,income,needs,wants,savings,unallocated:income-needs-wants-savings,base,emergencyTarget,emergencyCurrent,remaining,emergencyContribution,investment,otherSavings:savings-emergencyContribution-investment,invested,fixedItems:all.filter(t=>isExpense(t)&&(t.fixedExpense===true||(t.fixedExpense!==false&&t.recurrence)))};
}

export function saveBudgetSnapshot(config,budget,month,userId,timestamp=new Date().toISOString(),totals=null){
 const next={...budget,configured:true},previous=config.budgets?.[month]||config.budget||{};
 const history=[...(config.budgetHistory||[])];
 if(JSON.stringify(previous)===JSON.stringify(next)&&config.budgets?.[month]&&(!totals||JSON.stringify([...history].reverse().find(item=>item.month===month)?.totals)===JSON.stringify(totals)))return config;
 if(!history.length&&previous.configured)history.push({id:`${timestamp}:previous`,savedAt:timestamp,month,userId,initial:true,budget:{...previous},unit:config.isVenezuela?'USD':config.currency.code});
 history.push({id:`${timestamp}:${history.length}`,savedAt:timestamp,month,userId,budget:next,totals,unit:config.isVenezuela?'USD':config.currency.code});
 return {...config,...(month===iso(new Date()).slice(0,7)?{budget:next}:{}),budgets:{...config.budgets,[month]:next},budgetHistory:history};
}
