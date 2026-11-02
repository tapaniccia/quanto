import React from 'react';import {CircleHelp} from 'lucide-react';
export default function Help({children,text,label='Ayuda / Help'}){return <details className="quanto-help"><summary aria-label={label}><CircleHelp size={17}/><span className="sr-only">{label}</span></summary><div className="quanto-help-content" role="note">{text||children}</div></details>;}
