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
