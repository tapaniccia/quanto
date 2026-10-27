import React,{useState,useRef,useEffect} from 'react';
import {Menu,X} from 'lucide-react';
import './mobileNav.css';
export default function MobileNav({items,active,onChange,lang,C}){
 const [open,setOpen]=useState(false),trigger=useRef(null),panel=useRef(null);const es=lang==='es';
 const primary=items.filter(item=>['overview','calendar','transactions'].includes(item.id)),other=items.filter(item=>!primary.includes(item));
 useEffect(()=>{setOpen(false);},[active]);
 useEffect(()=>{if(!open)return;panel.current?.querySelector('button')?.focus();const escape=e=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus();}};document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);},[open]);
 const close=()=>{setOpen(false);trigger.current?.focus();};
 return <div className="quanto-mobile-navigation md:hidden" style={{'--nav-surface':C.card,'--nav-border':C.border,'--nav-text':C.text,'--nav-muted':C.muted,'--nav-active':C.teal}}>
  {open&&<><button className="quanto-mobile-nav-backdrop" type="button" aria-label={es?'Cerrar menú':'Close menu'} onClick={close}/><nav ref={panel} id="quanto-more-navigation" className="quanto-mobile-more" aria-label={es?'Más secciones':'More sections'}><div className="quanto-mobile-more-heading"><strong>{es?'Más secciones':'More sections'}</strong><button type="button" aria-label={es?'Cerrar menú':'Close menu'} onClick={close}><X size={20}/></button></div><div className="quanto-mobile-more-grid">{other.map(item=><button key={item.id} type="button" aria-current={active===item.id?'page':undefined} onClick={()=>{onChange(item.id);setOpen(false);}}><item.icon size={22}/><span>{item.label}</span></button>)}</div></nav></>}
  <nav className="quanto-mobile-bottom" aria-label={es?'Navegación principal':'Main navigation'}>{primary.map(item=><button key={item.id} type="button" aria-current={active===item.id?'page':undefined} onClick={()=>{onChange(item.id);setOpen(false);}}><item.icon size={22}/><span>{item.label}</span></button>)}<button ref={trigger} type="button" aria-expanded={open} aria-controls="quanto-more-navigation" aria-current={other.some(item=>item.id===active)?'page':undefined} onClick={()=>setOpen(!open)}><Menu size={22}/><span>{es?'Más':'More'}</span></button></nav>
 </div>;
}
