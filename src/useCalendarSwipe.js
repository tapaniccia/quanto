import {useRef} from 'react';
import {swipeStep} from './calendarSwipe.js';
export default function useCalendarSwipe(onSwipe){
 const gesture=useRef(null),suppress=useRef(0);
 const reset=element=>{element.style.transform='';gesture.current=null;};
 return {style:{touchAction:'pan-y pinch-zoom'},
 onPointerDown:e=>{if(e.pointerType!=='touch'||!window.matchMedia('(max-width:767px)').matches)return;if(gesture.current){reset(e.currentTarget);return;}if(e.target.closest('button,input,select,textarea,a,article,[draggable="true"]'))return;gesture.current={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now(),vertical:false};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}},
 onPointerMove:e=>{const g=gesture.current;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){g.vertical=true;e.currentTarget.style.transform='';}if(!g.vertical&&Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.5)e.currentTarget.style.transform='translateX('+Math.max(-32,Math.min(32,dx*0.25))+'px)';},
 onPointerUp:e=>{const g=gesture.current;if(!g||g.id!==e.pointerId)return;const step=g.vertical?0:swipeStep(e.clientX-g.x,e.clientY-g.y,performance.now()-g.time);reset(e.currentTarget);if(step){e.stopPropagation();suppress.current=performance.now()+400;onSwipe(step);}},
 onPointerCancel:e=>reset(e.currentTarget),
 onClickCapture:e=>{if(performance.now()<suppress.current){e.preventDefault();e.stopPropagation();}}
 };
}
