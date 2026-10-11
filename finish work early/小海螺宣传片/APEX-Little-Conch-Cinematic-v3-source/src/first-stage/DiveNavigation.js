import { CHAPTERS } from '../StoryChapters.js';
import { clamp, smooth } from './FreefallSequence.js';
export function diveDepth(progress) {
  const p=clamp(progress),index=diveChapter(p),a=CHAPTERS[index],b=CHAPTERS[index+1];
  return b ? a.depth+(b.depth-a.depth)*smooth(a.start,b.start,p) : a.depth;
}
export function diveChapter(progress) {
  let index=0;
  for(let i=1;i<CHAPTERS.length;i++)if(progress>=CHAPTERS[i].start)index=i;
  return index;
}
// A large trackpad event cannot skip several skills. Each stop opens the next one
// only once the camera reaches it; movement remains continuous between stops.
export function addDiveInput(progress, target, delta) {
  const index=diveChapter(progress);
  const upper=CHAPTERS[index+1] ? Math.min(1,CHAPTERS[index+1].start+.045) : 1;
  const lower=index>1 ? CHAPTERS[index-1].start+.045 : 0;
  let result=clamp(target+delta, delta<0?lower:0, delta>0?upper:1);
  // Finish an encounter transition rather than leave an unreadable gap when
  // the user releases their wheel just before the next title appears.
  if(delta>0&&CHAPTERS[index+1]&&result>=CHAPTERS[index+1].start-.025)result=upper;
  return result;
}

export const DIVE_PACING={wheelPixels:9000,swipeScreens:6,followRate:1.15,readingSeconds:5};
// A newly encountered skill owns its reading interval. Momentum input cannot
// immediately push it away; reverse input remains available to revisit it.
export class DiveReadingGate {
  constructor(){this.reset();}
  reset(){this.index=0;this.until=0;}
  enter(index,time){if(index!==this.index){this.index=index;this.until=time+DIVE_PACING.readingSeconds;}}
  allows(delta,time){return delta<=0||time>=this.until;}
}
