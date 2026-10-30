export const LEGAL_VERSION='2026-10-29';
export const LEGAL_CONTACT='services@evasconsulting.com';
export const LEGAL_OWNER="EVA's Consulting";
export function acceptanceRecord(lang,method){return {version:LEGAL_VERSION,acceptedAt:new Date().toISOString(),language:lang==='en'?'en':'es',method,termsAccepted:true,privacyAcknowledged:true};}
export function withLegalAcceptance(config,record){
 if(!record||record.version!==LEGAL_VERSION||record.termsAccepted!==true||record.privacyAcknowledged!==true||!record.acceptedAt)throw Error('Missing legal acceptance');
 if(config.legalAcceptance?.version===LEGAL_VERSION)return config;
 const previous=config.legalAcceptance;
 return {...config,legalAcceptance:record,...(previous?{legalAcceptanceHistory:[...(config.legalAcceptanceHistory||[]),previous]}:{})};
}
