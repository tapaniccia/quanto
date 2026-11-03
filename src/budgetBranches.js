import {budgetBucket,isExpense,spendingCategory} from './finance.js';
export const budgetBranches=['needs','wants','savings'];
export function categoryBudgetBucket(tx,budget){if(tx.type==='ingreso')return null;const override=budget.categoryBranches?.[spendingCategory(tx)];return budgetBranches.includes(override)&&(isExpense(tx)||tx.type==='activo')?override:budgetBucket(tx);}
export function assignCategoryBranch(budget,categoryId,branch){if(!categoryId||!budgetBranches.includes(branch))throw Error('Invalid branch');return {...budget,categoryBranches:{...budget.categoryBranches,[categoryId]:branch},details:(budget.details||[]).map(row=>row.categoryId===categoryId?{...row,bucket:branch}:row)};}
