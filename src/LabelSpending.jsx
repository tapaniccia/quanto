import React,{useMemo,useState} from 'react';
import {PieChart,Pie,Cell,ResponsiveContainer,Tooltip} from 'recharts';
import {labelSpending,chartCategory} from './labelSpending.js';
import {isExpense,inPeriod} from './finance.js';
export default function LabelSpending({transactions,bounds,venezuela,lang,categories,C,money}){
 const es=lang==='es';const [selected,setSelected]=useState('alimentacion');
 const options=useMemo(()=>{const list=categories.map(c=>({id:c.id,name:es?c.es:c.en}));for(const tx of transactions){const id=chartCategory(tx);if(isExpense(tx)&&inPeriod(tx,bounds)&&id&&!list.some(c=>c.id===id))list.push({id,name:id});}return list;},[categories,transactions,bounds.start,bounds.end,es]);
 const category=options.some(c=>c.id===selected)?selected:options[0]?.id;
 const result=useMemo(()=>labelSpending(transactions,category,bounds,venezuela),[transactions,category,bounds.start,bounds.end,venezuela]);
 const data=result.entries.map(item=>({...item,name:item.name??(es?'Sin etiquetas':'Untagged')}));
 const colors=[C.teal,'#4F86D9',C.gold,'#B875C6','#DC7864','#2B9CA3','#9B895F','#8A79CF'];
 const percentage=value=>new Intl.NumberFormat(es?'es-ES':'en-US',{maximumFractionDigits:1}).format(value)+'%';
 const end=new Date(bounds.end+'T12:00:00');end.setDate(end.getDate()-1);
 const date=value=>new Date(value+'T12:00:00').toLocaleDateString(es?'es-ES':'en-US',{day:'numeric',month:'short',year:'numeric'});
 return <section aria-labelledby="label-spending-title">
  <h2 id="label-spending-title" className="text-base font-semibold" style={{color:C.text}}>{es?'Gastos por etiqueta':'Expenses by label'}</h2>
  <p className="text-xs mt-1" style={{color:C.muted}}>{es?'Ciclo actual':'Current cycle'}: {date(bounds.start)} – {date(end.toISOString().slice(0,10))}</p>
  <label htmlFor="label-spending-category" className="block text-sm mt-4" style={{color:C.text}}>{es?'Categoría del gasto':'Expense category'}</label>
  <select id="label-spending-category" className="w-full mt-2 rounded-lg border p-3" style={{background:C.card,color:C.text,borderColor:C.border,minHeight:44}} value={category||''} onChange={e=>setSelected(e.target.value)}>{options.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
  <p className="text-2xl font-semibold mt-4" style={{color:C.teal}}>{money(result.total)}</p>
  <p className="text-xs mt-1" style={{color:C.muted}}>{es?'Total de la categoría registrado hasta hoy':'Category total recorded through today'}</p>
  {!data.length?<p className="text-sm py-8" role="status" style={{color:C.muted}}>{es?'No hay gastos en esta categoría durante este ciclo. Agrega movimientos o elige otra categoría.':'No expenses in this category during this cycle. Add transactions or choose another category.'}</p>:<>
   <div role="img" aria-label={data.map(d=>d.name+': '+money(d.value)+' ('+percentage(d.percent)+')').join('; ')}><ResponsiveContainer width="100%" height={240}><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95} paddingAngle={2} isAnimationActive={false}>{data.map((d,i)=><Cell key={d.key} fill={colors[i%colors.length]}/>)}</Pie><Tooltip contentStyle={{background:C.card,color:C.text,border:'1px solid '+C.border,borderRadius:8}} formatter={(value,name,item)=>[money(value)+' · '+percentage(item.payload.percent),name]}/></PieChart></ResponsiveContainer></div>
   <ul className="space-y-3">{data.map((d,i)=><li key={d.key} className="flex items-center gap-2 text-sm" style={{color:C.text}}><span aria-hidden="true" className="w-3 h-3 rounded-full shrink-0" style={{background:colors[i%colors.length]}}/><span className="flex-1 min-w-0" style={{overflowWrap:'anywhere'}}>{d.name}</span><span className="text-right shrink-0">{money(d.value)}<span className="block text-xs" style={{color:C.muted}}>{percentage(d.percent)}</span></span></li>)}</ul>
  </>}
  <p className="text-xs mt-4 leading-relaxed" style={{color:C.muted}}>{es?'Si un gasto tiene varias etiquetas, su monto se reparte por igual entre ellas para no contarlo dos veces. Los gastos sin etiquetas se agrupan aparte. Incluye deudas, Cashea y comisiones de esta categoría; excluye fechas futuras y movimientos sin fecha.':'Expenses with multiple labels are split equally between them to avoid counting them twice. Untagged expenses form a separate group. Includes debts, Cashea and fees in this category; excludes future and undated transactions.'}</p>
 </section>;
}
