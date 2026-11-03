import {transactionValue} from './finance.js';
export const automaticallyFixed=tx=>tx.fixedExpense===true||(tx.fixedExpense!==false&&!!tx.recurrence);
export function fixedCostSummary(expenses,budget,venezuela){
 const adjustments=budget.fixedAdjustments||{},rows=expenses.map(tx=>{const patch=adjustments[tx.id]||{};return {tx,included:patch.included??automaticallyFixed(tx),actual:transactionValue(tx,venezuela),planned:patch.amount===''||patch.amount==null?transactionValue(tx,venezuela):Number(patch.amount)};});
 const custom=budget.fixedCustomCosts||[];return {rows,total:rows.filter(row=>row.included).reduce((sum,row)=>sum+row.planned,0)+custom.reduce((sum,row)=>sum+(Number(row.amount)||0),0)};
}
export const validFixedCosts=budget=>Object.values(budget.fixedAdjustments||{}).every(row=>row.amount===''||row.amount==null||Number.isFinite(Number(row.amount))&&Number(row.amount)>=0)&&(budget.fixedCustomCosts||[]).every(row=>row.name?.trim()&&Number.isFinite(Number(row.amount))&&Number(row.amount)>=0&&row.amount!=='');
