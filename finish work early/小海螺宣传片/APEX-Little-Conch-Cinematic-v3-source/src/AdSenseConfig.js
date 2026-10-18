// Public publisher/slot IDs only. Never store OAuth tokens or payment details.
export function validateAdSenseConfig(input) {
  const publisherId=String(input.publisherId||'').trim();
  const adSlot=String(input.adSlot||'').trim();
  if(publisherId&&(!/^ca-pub-\d{16}$/.test(publisherId)||/^(\d)\1{15}$/.test(publisherId.slice(7))))throw new Error('AdSense requires the real owner publisher ID, not a placeholder.');
  if(adSlot&&!/^\d{10}$/.test(adSlot))throw new Error('AdSense adSlot must be the real 10-digit display unit ID.');
  const config={...input,publisherId,adSlot};
  if(config.enabled&&(!publisherId||!adSlot||config.siteStatus!=='ready'||config.consentConfigured!==true))throw new Error('Enable ads only after site approval, real unit creation and consent configuration.');
  return config;
}
export function adsTxt(config) {
  const valid=validateAdSenseConfig(config);
  return valid.publisherId?`google.com, ${valid.publisherId.slice(3)}, DIRECT, f08c47fec0942fa0\n`:null;
}
export function verificationTag(config) {
  const valid=validateAdSenseConfig(config);
  return valid.publisherId?`<meta name="google-adsense-account" content="${valid.publisherId}">`:'';
}
