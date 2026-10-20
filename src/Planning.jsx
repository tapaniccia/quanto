import React,{useState} from 'react';
import {iso,parseDate,periodBounds,inPeriod,transactionValue,expandTransactions,calendarBalances,shiftCalendarMonth} from './finance.js';
import './planning.css';
import {Wallet,TrendingUp,TrendingDown,Sparkles,CalendarDays,ChevronLeft,ChevronRight,Plus,List,Clock3} from 'lucide-react';
const EVENT_COLORS = {ingreso:'#22c55e',egreso:'#ef4444',activo:'#3b82f6',pasivo:'#a855f7'};
const eventColor = tx => /^#[0-9a-f]{6}$/i.test(tx.calendarColor || '') ? tx.calendarColor : (EVENT_COLORS[tx.type] || '#64748b');
const eventLabel = (type,es) => ({ingreso:es?'Ingreso':'Income',egreso:es?'Gasto':'Expense',activo:es?'Activo':'Asset',pasivo:es?'Deuda':'Liability'}[type] || type);
export function ExtraFields({value,setValue,rates,venezuela,lang,type}) {
 const es=lang==='es', text=(a,b)=>es?a:b;
 const field=(key,label,type='text')=><label>{label}<input placeholder={({customCategory:text('Ej. Suscripciones','e.g. Subscriptions'),beneficiary:text('Ej. Mis perros','e.g. My dogs'),group:text('Ej. Casa o Business','e.g. Home or Business'),labels:text('Ej. mensual, compartido','e.g. monthly, shared'),feePercent:'0',feeFixed:'0',repeatEvery:'1'})[key]} type={type} min={type==='number'?0:undefined} step={type==='number'?'any':undefined} value={value[key]??''} onChange={e=>setValue({...value,[key]:e.target.value})}/></label>;
 return <div className="quanto-extra">
  <fieldset className="quanto-color-picker"><legend>{text('Color en el calendario','Calendar color')}</legend><label className="quanto-color-toggle"><input type="checkbox" checked={!!value.calendarColor} onChange={e=>setValue({...value,calendarColor:e.target.checked?(EVENT_COLORS[type] || '#3b82f6'):''})}/>{text('Usar un color personalizado','Use a custom color')}</label>{value.calendarColor?<label>{text('Elige el color','Choose color')}<input type="color" value={eventColor({...value,type})} onChange={e=>setValue({...value,calendarColor:e.target.value})}/></label>:<p>{text('Automático: verde para ingresos, rojo para gastos, azul para activos y violeta para deudas.','Automatic: green income, red expenses, blue assets, purple liabilities.')}</p>}</fieldset>
  {field('customCategory',text('Categoría personalizada','Custom category'))}
  {field('beneficiary',text('Para quién / dependiente','Beneficiary / dependent'))}
  {field('group',text('Grupo de gastos','Expense group'))}
  {field('labels',text('Etiquetas (separadas por comas)','Tags (comma separated)'))}
  <label>{text('Método de pago','Payment method')}<input placeholder={text('Selecciona o escribe un método','Select or enter a method')} list="payment-methods" value={value.paymentMethod||''} onChange={e=>setValue({...value,paymentMethod:e.target.value})}/><datalist id="payment-methods">{['Tarjeta','Binance','Zelle','Efectivo','Pago Móvil'].map(x=><option key={x}>{x}</option>)}</datalist></label>
  <div className="quanto-columns">{field('feePercent',text('Comisión (%)','Fee (%)'),'number')}{field('feeFixed',text('Comisión fija (moneda del movimiento)','Fixed fee (transaction currency)'),'number')}</div>
  {venezuela&&<label>{text('Tasa guardada (opcional)','Saved exchange rate (optional)')}<select value="" onChange={e=>{if(!e.target.value)return;const r=rates[Number(e.target.value)]; if(r)setValue({...value,rateName:r.name||'Personalizada',selectedRate:r.rate});}}><option value="">{text('Seleccionar una tasa','Choose a rate')}</option>{rates.map((r,i)=><option key={i} value={i}>{r.name||text('Personalizada','Custom')} · {r.date} · {r.rate} Bs/USD</option>)}</select><span>{value.rateName}</span></label>}
  <label>{text('Repetición','Repeat')}<select value={value.repeatUnit||''} onChange={e=>setValue({...value,repeatUnit:e.target.value})}><option value="">{text('No se repite','Does not repeat')}</option><option value="days">{text('Días','Days')}</option><option value="weeks">{text('Semanas','Weeks')}</option><option value="months">{text('Meses','Months')}</option></select></label>
  {value.repeatUnit&&<div className="quanto-columns">{field('repeatEvery',text('Cada cuántos','Every'),'number')}{field('repeatUntil',text('Hasta (opcional)','Until (optional)'),'date')}</div>}
 </div>;
}
export function Comparison({transactions,config,lang}) {
 const [mode,setMode]=useState('cycle'),[date,setDate]=useState(iso(new Date())); const es=lang==='es';
 const now=periodBounds(date,mode,config.cycleDay||1),prev=periodBounds(date,mode,config.cycleDay||1,-1);
 const sum=(b,type)=>transactions.filter(t=>t.type===type&&inPeriod(t,b)).reduce((s,t)=>s+transactionValue(t,config.isVenezuela),0);
 const format=n=>new Intl.NumberFormat(es?'es':'en',{style:'currency',currency:config.isVenezuela?'USD':config.currency.code}).format(n);
 return <section className="quanto-panel"><h2>{es?'Comparar períodos':'Compare periods'}</h2><div className="quanto-columns"><label>{es?'Período':'Period'}<select value={mode} onChange={e=>setMode(e.target.value)}>{[['week','Semanal','Weekly'],['month','Mensual','Monthly'],['quarter','Trimestral','Quarterly'],['cycle','Ciclo de cobro','Pay cycle']].map(([v,a,b])=><option key={v} value={v}>{es?a:b}</option>)}</select></label><label>{es?'Fecha de referencia':'Reference date'}<input type="date" value={date} onChange={e=>e.target.value&&setDate(e.target.value)}/></label></div><p>{now.start} → {now.end} ({es?'fin excluido':'end excluded'})</p><div className="overflow-x-auto"><table><thead><tr><th>{es?'Indicador':'Metric'}</th><th>{es?'Seleccionado':'Selected'}</th><th>{es?'Anterior':'Previous'}</th><th>Δ</th></tr></thead><tbody>{['ingreso','egreso','balance'].map(type=>{const get=b=>type==='balance'?sum(b,'ingreso')-sum(b,'egreso'):sum(b,type);const a=get(now),b=get(prev);return <tr key={type}><th>{type==='ingreso'?(es?'Ingresos':'Income'):type==='egreso'?(es?'Gastos':'Expenses'):'Balance'}</th><td>{format(a)}</td><td>{format(b)}</td><td>{format(a-b)} {b!==0?`(${((a-b)/Math.abs(b)*100).toFixed(1)}%)`:'—'}</td></tr>})}</tbody></table></div></section>;
}
export function Planning({records,saveRecords,config,lang,onEdit,onNew,currentUser,categoryLabel,theme='dark'}) {
  const es=lang==='es', text=(a,b)=>es?a:b;
  const today=iso(new Date());
  const [month,setMonth]=useState(today.slice(0,7));
  const [view,setView]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(max-width:640px)').matches?'list':'month');
  const [selectedDate,setSelectedDate]=useState(today);
  const bounds=periodBounds(`${month}-01`);
  const visible=records.transactions.filter(t=>!t.private||t.ownerId===currentUser.id);
  const events=expandTransactions(visible,bounds.start,bounds.end,records.exceptions||{});
  const pending=visible.filter(t=>!t.date);
  const ledger=calendarBalances(visible,month,config.isVenezuela,records.exceptions||{});
  const money=value=>new Intl.NumberFormat(es?'es':'en',{style:'currency',currency:config.isVenezuela?'USD':config.currency.code,maximumFractionDigits:2}).format(value);
  const monthName=parseDate(bounds.start).toLocaleDateString(es?'es':'en',{month:'long',year:'numeric'});
  const count=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate();
  const days=Array.from({length:count},(_,i)=>`${month}-${String(i+1).padStart(2,'0')}`);
  const activeDate=selectedDate.startsWith(month)?selectedDate:bounds.start;
  const dateLabel=date=>parseDate(date).toLocaleDateString(es?'es':'en',{weekday:'long',day:'numeric',month:'long'});
  const changeMonth=value=>{setMonth(value);setSelectedDate(`${value}-01`);};
  const reschedule=(id,date)=>{
    const tx=visible.find(t=>t.id===id);
    if(!date&&!tx)return;
    if(!id||(!tx&&!visible.some(t=>id.startsWith(`${t.id}@`))))return;
    if(tx)saveRecords({...records,transactions:records.transactions.map(t=>t.id===id?{...t,date}:t)});
    else saveRecords({...records,exceptions:{...records.exceptions,[id]:{...records.exceptions?.[id],date}}});
  };
  const edit=t=>onEdit(t.seriesId?visible.find(x=>x.id===t.seriesId):t);
  const entry=t=>(
    <article key={t.id} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',t.id)} className="quanto-event" style={{'--event-color':eventColor(t)}}>
      <button className="quanto-event-main" onClick={()=>edit(t)} aria-label={`${text('Editar','Edit')} ${t.desc||t.customCategory||eventLabel(t.type,es)}`}>
        <span className="quanto-event-kind"><i aria-hidden="true"/>{eventLabel(t.type,es)}{t.seriesId&&<span title={text('Recurrente','Recurring')}> · ↻</span>}</span>
        <strong>{t.desc||t.customCategory||categoryLabel?.(t)||eventLabel(t.type,es)}</strong>
        <span className="quanto-event-amount">{t.type==='egreso'?'−':t.type==='ingreso'?'+':''}{money(transactionValue(t,config.isVenezuela))}</span>
      </button>
      <details className="quanto-event-actions"><summary>{text('Cambiar fecha','Reschedule')}</summary><label>{text('Fecha del movimiento','Transaction date')}<input type="date" value={t.date||''} onChange={e=>{if(e.target.value||!t.seriesId)reschedule(t.id,e.target.value);}}/></label></details>
    </article>
  );
  const drop=(e,date)=>{e.preventDefault();reschedule(e.dataTransfer.getData('text/plain'),date);};
  const stats=[
    {name:text('Saldo inicial','Opening balance'),value:ledger.opening,color:'blue',icon:Wallet,projected:bounds.start>today},
    {name:text('Ingresos del mes','Monthly income'),value:ledger.income,color:'green',icon:TrendingUp,projected:bounds.end>today},
    {name:text('Gastos del mes','Monthly expenses'),value:ledger.expenses,color:'coral',icon:TrendingDown,projected:bounds.end>today},
    {name:text('Saldo al cierre','Closing balance'),value:ledger.closing,color:'gold',icon:Sparkles,projected:bounds.end>today},
  ];
  return <section className="quanto-calendar-page" data-theme={theme}>
    <header className="quanto-calendar-heading"><div><span className="quanto-eyebrow">{text('TU DINERO, DÍA A DÍA','YOUR MONEY, DAY BY DAY')}</span><h1>{text('Calendario','Calendar')}</h1><p>{text('Organiza tus pagos y mira cómo cambia tu saldo.','Plan payments and see your balance change.')}</p></div><span className="quanto-calendar-heading-icon" aria-hidden="true"><CalendarDays size={26}/></span></header>
    <div className="quanto-calendar-balances">{stats.map(({name,value,color,icon:Icon,projected})=><div className={`quanto-balance-card quanto-tone-${color}`} key={name}><span className="quanto-balance-icon"><Icon size={18}/></span><span className="quanto-balance-label">{name}</span><strong>{money(value)}</strong><span className="quanto-balance-meta">{projected?text('Incluye programados','Includes scheduled'):text('Movimientos registrados','Recorded transactions')}</span></div>)}</div>
    <details className="quanto-balance-help"><summary>{text('¿Cómo se calcula el saldo?','How is the balance calculated?')}</summary><p>{text('Saldo inicial + ingresos − gastos, incluyendo comisiones. Conserva el saldo de meses anteriores. Los días futuros son proyecciones de los movimientos programados. Los movimientos sin fecha no se incluyen.','Opening balance + income − expenses, including fees and previous months. Future days project scheduled transactions. Undated entries are excluded.')}</p></details>
    <section className="quanto-calendar-surface" aria-label={text('Calendario de movimientos','Transaction calendar')}>
      <div className="quanto-calendar-toolbar">
        <div className="quanto-month-heading"><div className="quanto-month-arrows"><button type="button" onClick={()=>changeMonth(shiftCalendarMonth(month,-1))} aria-label={text('Mes anterior','Previous month')}><ChevronLeft size={20}/></button><button type="button" onClick={()=>changeMonth(shiftCalendarMonth(month,1))} aria-label={text('Mes siguiente','Next month')}><ChevronRight size={20}/></button></div><h2 aria-live="polite">{monthName}</h2><button className="quanto-today-button" onClick={()=>{setMonth(today.slice(0,7));setSelectedDate(today);}}>{text('Hoy','Today')}</button></div>
        <div className="quanto-calendar-controls"><label className="quanto-month-field"><span>{text('Mes y año','Month and year')}</span><input type="month" value={month} onChange={e=>/^\d{4}-\d{2}$/.test(e.target.value)&&changeMonth(e.target.value)}/></label><button className="quanto-add-button" onClick={onNew}><Plus size={18}/><span>{text('Agregar transacción','Add transaction')}</span></button><div className="quanto-view-switch" role="group" aria-label={text('Vista del calendario','Calendar view')}><button aria-pressed={view==='month'} onClick={()=>setView('month')}><CalendarDays size={16}/>{text('Mes','Month')}</button><button aria-pressed={view==='list'} onClick={()=>setView('list')}><List size={16}/>{text('Lista','List')}</button></div></div>
      </div>
      {view==='month'?<>
        <div className="quanto-calendar" aria-label={text('Vista mensual de lunes a domingo','Monthly view Monday to Sunday')}>
          {(es?['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']:['Mon','Tue','Wed','Thu','Fri','Sat','Sun']).map((day,i)=><div key={day} className={`quanto-weekday ${i>4?'quanto-weekend':''}`}>{day}</div>)}
          {Array.from({length:(parseDate(bounds.start).getDay()+6)%7},(_,i)=><div key={`blank-${i}`} className="quanto-calendar-blank" aria-hidden="true"/>)}
          {days.map(date=>{const daily=events.filter(t=>t.date===date);return <div key={date} className={`quanto-day ${date===today?'quanto-is-today':''} ${date===activeDate?'quanto-is-selected':''}`} onDragOver={e=>e.preventDefault()} onDrop={e=>drop(e,date)}><button className="quanto-day-number" onClick={()=>setSelectedDate(date)} aria-pressed={date===activeDate} aria-label={`${dateLabel(date)} · ${money(ledger.balances[date])} · ${daily.length} ${text('movimientos','transactions')}`}>{Number(date.slice(-2))}</button><div className="quanto-day-balance"><span>{date>today?text('Proyectado','Projected'):text('Saldo','Balance')}</span><strong>{money(ledger.balances[date])}</strong></div><div className="quanto-desktop-events">{daily.map(entry)}</div><div className="quanto-mobile-dots" aria-hidden="true">{daily.slice(0,3).map(t=><i key={t.id} style={{background:eventColor(t)}}/>)}{daily.length>3&&<span>+</span>}</div></div>;})}
        </div>
        <section className="quanto-selected-day"><div className="quanto-agenda-heading"><h3>{dateLabel(activeDate)}</h3><strong>{money(ledger.balances[activeDate])}</strong></div>{events.filter(t=>t.date===activeDate).length?events.filter(t=>t.date===activeDate).map(entry):<p className="quanto-empty">{text('No hay movimientos para este día.','No transactions for this day.')}</p>}</section>
      </>:<div className="quanto-agenda">{days.map(date=>{const daily=events.filter(t=>t.date===date);return <section className={`quanto-agenda-day ${date===today?'quanto-is-today':''}`} key={date} onDragOver={e=>e.preventDefault()} onDrop={e=>drop(e,date)}><header className="quanto-agenda-heading"><div><span>{parseDate(date).toLocaleDateString(es?'es':'en',{weekday:'long'})}</span><h3>{parseDate(date).toLocaleDateString(es?'es':'en',{day:'numeric',month:'short'})}</h3></div><div className="quanto-agenda-balance"><span>{date>today?text('Saldo proyectado','Projected balance'):text('Saldo al día','Daily balance')}</span><strong>{money(ledger.balances[date])}</strong></div></header>{daily.length?<div className="quanto-agenda-entries">{daily.map(entry)}</div>:<p className="quanto-empty">{text('Sin movimientos','No transactions')}</p>}</section>;})}</div>}
      <div className="quanto-calendar-legend" aria-label={text('Leyenda de colores','Color legend')}>{Object.entries(EVENT_COLORS).map(([type,color])=><span key={type}><i aria-hidden="true" style={{backgroundColor:color}}/>{eventLabel(type,es)}</span>)}</div>
    </section>
    <details className="quanto-pending" open={pending.length>0}><summary><span><Clock3 size={18}/>{text('Pendientes de fecha','Unscheduled transactions')}</span><span className="quanto-count">{pending.length}</span></summary><div className="quanto-unscheduled" onDragOver={e=>e.preventDefault()} onDrop={e=>drop(e,'')}>{pending.length?pending.map(entry):<p className="quanto-empty">{text('Todo está organizado. No tienes movimientos sin fecha.','All organized. No unscheduled transactions.')}</p>}</div></details>
  </section>;
}

export function CycleSettings({config,saveConfig,lang}) {return <section className="quanto-panel"><label>{lang==='es'?'Día de inicio del ciclo de cobro':'Pay cycle start day'}<input type="number" min="1" max="31" value={config.cycleDay||1} onChange={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=1&&n<=31)saveConfig({...config,cycleDay:n});}}/></label><p>{lang==='es'?'Si el mes tiene menos días, se utiliza su último día.':'Short months use their last day.'}</p></section>}
export function CustomRates({rates,saveRates,lang}) {
 const es=lang==='es';const [draft,setDraft]=useState({name:'',date:iso(new Date()),rate:''}),[editing,setEditing]=useState(null);
 return <section className="quanto-panel"><h1>{es?'Tus tasas de cambio':'Your exchange rates'}</h1><p>{es?'Agrega tantas tasas como quieras. 1 USD = X Bs. Los movimientos conservan la tasa que usaste al guardarlos.':'Add as many named rates as you need. 1 USD = X Bs. Transactions retain their saved rate.'}</p><form onSubmit={e=>{e.preventDefault();if(!draft.name.trim()||!draft.date||!Number.isFinite(Number(draft.rate))||Number(draft.rate)<=0)return;const r={...draft,name:draft.name.trim(),rate:Number(draft.rate)};saveRates(editing===null?[...rates,r]:rates.map((x,i)=>i===editing?r:x));setDraft({name:'',date:iso(new Date()),rate:''});setEditing(null);}}><div className="quanto-columns"><label>{es?'Nombre':'Name'}<input required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>{es?'Fecha':'Date'}<input required type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></label><label>Bs / USD<input required type="number" min="0.000001" step="any" value={draft.rate} onChange={e=>setDraft({...draft,rate:e.target.value})}/></label></div><button type="submit">{es?'Guardar tasa':'Save rate'}</button>{editing!==null&&<button type="button" onClick={()=>{setEditing(null);setDraft({name:'',date:iso(new Date()),rate:''})}}>{es?'Cancelar':'Cancel'}</button>}</form>{rates.map((r,i)=><div className="quanto-rate" key={i}><span>{r.name||'Personalizada'} · {r.date} · {r.rate} Bs/USD</span><button onClick={()=>{setEditing(i);setDraft(r)}}>{es?'Editar':'Edit'}</button><button onClick={()=>{if(window.confirm(es?'¿Eliminar esta tasa? Los movimientos guardados no cambian.':'Delete this rate? Saved transactions stay unchanged.')){saveRates(rates.filter((_,j)=>i!==j));setEditing(null)}}}>{es?'Eliminar':'Delete'}</button></div>)}</section>;
}
