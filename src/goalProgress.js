import {expandTransactions,isSavings,transactionValue,parseDate,iso} from './finance.js';
export function savingsGoals(records,config,userId,today){
 const end=parseDate(today);end.setDate(end.getDate()+1);const goals=records.planner?.goals||[],entries=expandTransactions((records.transactions||[]).filter(tx=>!tx.private||tx.ownerId===userId),'1970-01-01',iso(end),records.exceptions||{}).filter(tx=>tx.date&&tx.date<=today&&isSavings(tx));
 return goals.map(goal=>{const linked=entries.filter(tx=>tx.goalId===goal.id||(!tx.goalId&&goal.id===goals[0]?.id)),contributed=linked.reduce((n,tx)=>n+transactionValue(tx,config.isVenezuela),0);return {...goal,manualSaved:Number(goal.saved)||0,contributed,saved:(Number(goal.saved)||0)+contributed};});
}
