import {categoryBudgetBucket} from './budgetBranches.js';
import {fixedCostSummary} from './fixedCosts.js';
import {isExpense,expandTransactions,periodBounds,transactionValue,inPeriod,iso,parseDate,budgetBucket,cycleMonthlyFactor} from './finance.js';
export function budgetSummary(records,config,today,budget={},mode='cycle'){
 const period=typeof mode==='object'?mode:periodBounds(today,mode,config),all=expandTransactions(records.transactions,period.start,period.end,records.exceptions||{}),posted=all.filter(t=>t.date<=today);const sum=list=>list.reduce((n,t)=>n+transactionValue(t,config.isVenezuela),0);
 const recordedIncome=sum(posted.filter(t=>t.type==='ingreso')),actualExpenses=sum(posted.filter(t=>isExpense(t))),fixed=fixedCostSummary(all.filter(isExpense),budget,config.isVenezuela).total;
 const auto=(value,fallback)=>value===''||value===null||value===undefined?fallback:Number(value);
 const income=auto(budget.incomeOverride,recordedIncome),needs=budget.mode==='amounts'?Number(budget.needsAmount||0):income*Number(budget.needsPct??50)/100,wants=budget.mode==='amounts'?Number(budget.wantsAmount||0):income*Number(budget.wantsPct??30)/100,savings=budget.mode==='amounts'?Number(budget.savingsAmount||0):income*Number(budget.savingsPct??20)/100;
 const fixedExpected=auto(budget.fixedOverride,fixed),needsSpent=sum(posted.filter(t=>categoryBudgetBucket(t,budget)==='needs')),wantsSpent=sum(posted.filter(t=>categoryBudgetBucket(t,budget)==='wants')),savingsRecorded=sum(posted.filter(t=>categoryBudgetBucket(t,budget)==='savings'));
 const scheduled=Object.fromEntries(['needs','wants','savings'].map(key=>[key,sum(all.filter(tx=>tx.date>today&&categoryBudgetBucket(tx,budget)===key))]));
 const base=auto(budget.emergencyBase,Math.max(fixedExpected,needsSpent)*cycleMonthlyFactor(config)),emergencyTarget=auto(budget.emergencyTarget,base*Number(budget.emergencyMonths??3));
 const nextDay=parseDate(today);nextDay.setDate(nextDay.getDate()+1);const allPosted=expandTransactions(records.transactions,'1970-01-01',iso(nextDay),records.exceptions||{}).filter(t=>t.date<=today),emergencyCurrent=sum(allPosted.filter(t=>t.type==='activo'&&t.catId==='fondo_emergencia')),invested=sum(allPosted.filter(t=>t.type==='activo'&&t.catId==='inversion'));
 const remaining=Math.max(0,emergencyTarget-emergencyCurrent),investment=auto(budget.investmentContribution,emergencyTarget>0&&remaining===0?savings:0),emergencyContribution=auto(budget.emergencyContribution,Math.min(Math.max(0,savings-investment),remaining));
 return {scheduled,period,recordedIncome,actualExpenses,fixed,fixedExpected,needsSpent,wantsSpent,savingsRecorded,income,needs,wants,savings,unallocated:income-needs-wants-savings,base,emergencyTarget,emergencyCurrent,remaining,emergencyContribution,investment,otherSavings:savings-emergencyContribution-investment,invested,expenseItems:all.filter(isExpense),fixedItems:fixedCostSummary(all.filter(isExpense),budget,config.isVenezuela).rows.filter(row=>row.included).map(row=>row.tx)};
}

export function saveBudgetSnapshot(config,budget,month,userId,timestamp=new Date().toISOString(),totals=null){
 const next={...budget,configured:true},previous=config.budgets?.[month]||config.budget||{};
 const history=[...(config.budgetHistory||[])];
 if(JSON.stringify(previous)===JSON.stringify(next)&&config.budgets?.[month]&&(!totals||JSON.stringify([...history].reverse().find(item=>item.month===month)?.totals)===JSON.stringify(totals)))return config;
 if(!history.length&&previous.configured)history.push({id:`${timestamp}:previous`,savedAt:timestamp,month,userId,initial:true,budget:{...previous},unit:config.isVenezuela?'USD':config.currency.code});
 history.push({id:`${timestamp}:${history.length}`,savedAt:timestamp,month,userId,budget:next,totals,unit:config.isVenezuela?'USD':config.currency.code});
 return {...config,...(month===iso(new Date()).slice(0,7)?{budget:next}:{}),budgets:{...config.budgets,[month]:next},budgetHistory:history};
}

export function budgetCycle(config,value=iso(new Date())){
 if(value.length===7){const last=new Date(Number(value.slice(0,4)),Number(value.slice(5,7)),0).getDate();value+=`-${String(Math.min(Number(config.cycleDay)||1,last)).padStart(2,'0')}`;}
 return periodBounds(value,'cycle',config);
}
export function cycleBudget(config,period){return config.cycleBudgets?.[`${period.start}:${period.end}`]||config.budgets?.[period.start.slice(0,7)]||config.budget||{};}
export function saveCycleBudgetSnapshot(config,budget,period,userId,timestamp=new Date().toISOString(),totals=null){
 const next={...budget,configured:true},previous=cycleBudget(config,period),history=[...(config.budgetHistory||[])];
 const last=[...history].reverse().find(item=>item.period?.start===period.start);
 if(JSON.stringify(previous)===JSON.stringify(next)&&config.cycleBudgets?.[`${period.start}:${period.end}`]&&JSON.stringify(last?.totals)===JSON.stringify(totals))return config;
 if(!history.length&&previous.configured)history.push({id:`${timestamp}:previous`,savedAt:timestamp,userId,initial:true,budget:{...previous},unit:config.isVenezuela?'USD':config.currency.code});
 history.push({id:`${timestamp}:${history.length}`,savedAt:timestamp,period:{...period},cycleDay:config.cycleDay||1,cycleFrequency:config.cycleFrequency||'monthly',cycleSecondDay:config.cycleSecondDay||16,cycleAnchor:config.cycleAnchor||'',userId,budget:next,totals,unit:config.isVenezuela?'USD':config.currency.code});
 const today=iso(new Date());return {...config,...(today>=period.start&&today<period.end?{budget:next}:{}),cycleBudgets:{...config.cycleBudgets,[`${period.start}:${period.end}`]:next},budgetHistory:history};
}
