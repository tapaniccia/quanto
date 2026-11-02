export const defaultPaymentMethods=['Tarjeta','Tarjeta internacional','Efectivo','Pago Móvil','Zelle','Binance','Cashea','Wallet','PayPal','Zinli'];
export const paymentLabel=(method,lang)=>lang==='es'?method:({Tarjeta:'Card',Efectivo:'Cash','Tarjeta internacional':'International card',Wallet:'Wallet (PayPal, Zinli…)'}[method]||method);
export const enabledMethods=config=>Array.isArray(config.paymentMethods)?config.paymentMethods:defaultPaymentMethods;
export const cleanMethods=list=>[...new Set(list.map(value=>String(value).trim()).filter(value=>value&&value.length<=80))];
