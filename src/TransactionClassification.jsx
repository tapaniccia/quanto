import React,{useEffect,useId,useRef,useState} from 'react';
import {ChevronDown,Plus,Search,Tag,X} from 'lucide-react';
import {normalizeLabels,labelCategory} from './classification.js';
import './transactionClassification.css';

export default function TransactionClassification({tx,lang,categories=[],categoryId,categoryName,options,onChange,labelsOnly=false,draft=false}){
 const es=lang==='es',t=(a,b)=>es?a:b,name=tx.desc||categoryName||t('Movimiento','Transaction');
 const [open,setOpen]=useState(false),[query,setQuery]=useState('');
 const rootRef=useRef(null),buttonRef=useRef(null),inputRef=useRef(null),panelId=useId();
 const selected=normalizeLabels(tx.labels),key=labelCategory(tx);
 const choices=normalizeLabels([...options,...selected]).filter(label=>label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 const matching=normalizeLabels([...options,...selected]).some(label=>label.toLocaleLowerCase()===query.trim().toLocaleLowerCase());
 const close=()=>{setOpen(false);buttonRef.current?.focus();};
 useEffect(()=>{setQuery('');setOpen(false);},[key]);
 useEffect(()=>{
  if(!open)return;
  inputRef.current?.focus();
  const outside=event=>{if(!rootRef.current?.contains(event.target))setOpen(false);};
  const escape=event=>{if(event.key==='Escape'){event.stopPropagation();close();}};
  document.addEventListener('pointerdown',outside);document.addEventListener('focusin',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside);document.removeEventListener('keydown',escape);};
 },[open]);
 const saveLabels=labels=>onChange({labels:normalizeLabels(labels)});
 const create=()=>{if(!query.trim())return;saveLabels([...selected,...normalizeLabels(query)]);setQuery('');inputRef.current?.focus();};
 return <div className="quanto-row-classification" ref={rootRef}>
  {!labelsOnly&&<label className="quanto-inline-category"><span>{t('Categoría','Category')}</span><select aria-label={`${t('Categoría de','Category for')} ${name}`} value={categoryId||''} onChange={event=>onChange({categoryId:event.target.value})}>
   {!categories.some(category=>category.id===categoryId)&&<option value={categoryId||''} disabled>{categoryName||t('Sin categoría','Uncategorized')}</option>}
   {categories.map(category=><option key={category.id} value={category.id}>{category.label}</option>)}
  </select></label>}
  <div className="quanto-inline-labels"><span className="quanto-inline-label-title">{t('Tus etiquetas','Your labels')}</span><div className="quanto-label-selection">
   {selected.map(label=><span key={label.toLocaleLowerCase()} className="quanto-personal-label"><Tag size={12} aria-hidden="true"/><span>{label}</span><button type="button" aria-label={`${t('Quitar etiqueta','Remove label')} ${label} ${t('de','from')} ${name}`} onClick={()=>saveLabels(selected.filter(value=>value!==label))}><X size={12}/></button></span>)}
   <button ref={buttonRef} type="button" className="quanto-label-trigger" aria-label={`${t('Editar etiquetas de','Edit labels for')} ${name}`} aria-expanded={open} aria-controls={panelId} onClick={()=>setOpen(!open)}><Tag size={15}/>{selected.length?t('Editar','Edit'):t('Agregar etiquetas','Add labels')}<ChevronDown size={14}/></button>
  </div></div>
  {open&&<section id={panelId} role="dialog" aria-label={`${t('Etiquetas de','Labels for')} ${name}`} className="quanto-label-popover">
   <header><div><h3>{t('Tus etiquetas','Your labels')}</h3><p>{categoryName} · {draft?t('Se aplican al guardar el movimiento.','Applied when you save the transaction.'):t('Se guardan al elegir.','Saved when selected.')}</p></div><button type="button" onClick={close} aria-label={t('Cerrar etiquetas','Close labels')}><X size={17}/></button></header>
   <label className="quanto-label-search"><Search size={16}/><input ref={inputRef} type="text" aria-label={t('Buscar o crear etiqueta','Search or create label')} placeholder={t('Ej. Carnes, Verduras…','e.g. Meat, Vegetables…')} value={query} maxLength={160} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();create();}}}/></label>
   <div className="quanto-label-options">{choices.map(label=><label key={label.toLocaleLowerCase()}><input type="checkbox" checked={selected.some(value=>value.toLocaleLowerCase()===label.toLocaleLowerCase())} onChange={event=>saveLabels(event.target.checked?[...selected,label]:selected.filter(value=>value.toLocaleLowerCase()!==label.toLocaleLowerCase()))}/><span>{label}</span></label>)}{!choices.length&&<p>{t('Todavía no hay etiquetas que coincidan. Crea las que necesites.','No matching labels yet. Create the ones you need.')}</p>}</div>
   {query.trim()&&!matching&&<button type="button" className="quanto-label-create" onClick={create}><Plus size={17}/>{t('Crear y agregar','Create and add')} «{query.trim()}»</button>}
   <p className="quanto-label-help">{t('Escribe una etiqueta y pulsa Enter. Puedes reutilizar tus etiquetas en otros movimientos de esta categoría.','Type a label and press Enter. Reuse your labels on other transactions in this category.')}</p>
  </section>}
 </div>;
}
