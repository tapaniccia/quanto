import React from 'react';
import {ArrowRightLeft} from 'lucide-react';
export default function RegionSettings({config,saveConfig,lang,compact=false}){
 const es=lang==='es',t=(a,b)=>es?a:b;
 return <section className={`quanto-region-settings ${compact?'':'quanto-panel'}`}><h2><ArrowRightLeft size={20}/>{t('Modo Venezuela','Venezuela mode')}</h2><p>{t('Registra en dólares o bolívares y consulta referencias USD, EUR y USDT. Los totales se calculan en USD.','Record in dollars or bolívares and use USD, EUR and USDT references. Totals are calculated in USD.')}</p><label className="quanto-region-toggle"><input type="checkbox" checked={!!config.isVenezuela} onChange={e=>saveConfig({...config,isVenezuela:e.target.checked})}/><span>{config.isVenezuela?t('Activado · USD + Bs','Enabled · USD + Bs'):t('Activar Modo Venezuela','Enable Venezuela mode')}</span></label><small>{t('Las tasas se consultan en la sección Tasas al activarlo. Puedes añadir tus propias referencias.','Enable it to access Rates. You can add your own references.')}</small></section>;
}
