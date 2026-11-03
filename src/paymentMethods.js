export const defaultPaymentMethods=['Tarjeta','Tarjeta internacional','Efectivo','Pago Móvil','Zelle','Binance','Cashea','Wallet'];
export const paymentLabel=(method,lang)=>lang==='es'?method:({Tarjeta:'Card',Efectivo:'Cash','Tarjeta internacional':'International card',Wallet:'Wallet'}[method]||method);
export const enabledMethods=config=>Array.isArray(config.paymentMethods)?[...new Set(config.paymentMethods.map(method=>['paypal','zinli'].includes(method.toLowerCase())?'Wallet':method))]:defaultPaymentMethods;
export const cleanMethods=list=>[...new Set(list.map(value=>String(value).trim()).filter(value=>value&&value.length<=80))];
