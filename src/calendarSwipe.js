import {iso,parseDate} from './finance.js';
export function swipeStep(dx,dy,elapsed){return elapsed<=900&&Math.abs(dx)>=60&&Math.abs(dx)>Math.abs(dy)*1.5?(dx<0?1:-1):0;}
export function shiftCalendarDay(day,step){const next=parseDate(day);next.setDate(next.getDate()+step);return iso(next);}
