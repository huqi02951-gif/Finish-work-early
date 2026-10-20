import rawConfig from '../config/adsense.json';
import { validateAdSenseConfig } from './AdSenseConfig.js';

// Only the normally scrolling editorial page imports this. No ads, consent
// overlay or remote advertising script can capture the film's touch surface.
export function setupAdSense(doc=document,view=window) {
  const config=validateAdSenseConfig(rawConfig),container=doc.getElementById('editorial-ad');
  if(!container||!config.enabled)return;
  const unit=doc.createElement('ins');unit.className='adsbygoogle';unit.style.display='block';
  unit.dataset.adClient=config.publisherId;unit.dataset.adSlot=config.adSlot;unit.dataset.adFormat='auto';unit.dataset.fullWidthResponsive='true';
  container.hidden=false;container.append(unit);
  const script=doc.createElement('script');script.async=true;script.crossOrigin='anonymous';
  script.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.publisherId}`;
  script.onload=()=>{try{(view.adsbygoogle=view.adsbygoogle||[]).push({});}catch{container.hidden=true;}};
  script.onerror=()=>{container.hidden=true;};doc.head.append(script);
}
