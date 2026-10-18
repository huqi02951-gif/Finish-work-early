import { SCENARIOS } from './StoryChapters.js';
import { setupAdSense } from './AdSense.js';
const host=document.getElementById('scenario-details');
for(const [index,scenario] of SCENARIOS.entries()) {
  const section=document.createElement('section');
  for(const [tag,text] of [['span',`0${index+1} / 04 · ${scenario.cn}`],['h2',scenario.title.replace('\n','')],['p',scenario.desc],['h3','执行'],['p',scenario.steps],['h3','交付'],['p',scenario.deliverable]]) {
    const element=document.createElement(tag);element.textContent=text;if(tag==='span')element.className='eyebrow';section.append(element);
  }
  host.append(section);
}
setupAdSense();
