import { clamp } from './FreefallSequence.js';

// One source of truth: the browser's document scroll position. No wheel/touch
// interception, pointer capture, synthetic inertia, or timed reading lock.
export class NativeDiveScroll {
  constructor(view = window, doc = document) {
    this.view = view; this.doc = doc; this.enabled = false; this.lastProgress = 0;
    this.spacer = doc.createElement('div'); this.spacer.id = 'dive-scroll-space';
    this.spacer.setAttribute('aria-hidden', 'true'); doc.body.append(this.spacer);
    this.width = view.innerWidth; this.travel = 0;
    view.history.scrollRestoration = 'manual';
  }
  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.travel = Math.max(568, this.view.innerHeight) * 14;
    this.width = this.view.innerWidth;
    this.doc.documentElement.classList.add('dive-scroll');
    this.spacer.style.height = `${this.travel + this.view.innerHeight}px`;
    this.goTo(0, false);
  }
  read() {
    if (!this.enabled) return 0;
    this.lastProgress = clamp(this.view.scrollY / this.travel);
    return this.lastProgress;
  }
  goTo(progress, smooth = true) {
    if (!this.enabled) return;
    const reduced = this.view.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.view.scrollTo({top:clamp(progress) * this.travel, behavior:smooth && !reduced ? 'smooth' : 'instant'});
  }
  resize() {
    if (!this.enabled) return;
    // Address-bar changes must not remap the timeline mid-swipe on iOS/Android.
    if (Math.abs(this.view.innerWidth - this.width) > 2) {
      this.width = this.view.innerWidth;
      this.travel = Math.max(568, this.view.innerHeight) * 14;
      this.spacer.style.height = `${this.travel + this.view.innerHeight}px`;
      this.goTo(this.lastProgress, false);
    } else this.spacer.style.height = `${this.travel + this.view.innerHeight}px`;
  }
  pause(paused) { this.doc.documentElement.classList.toggle('dive-paused', paused); }
  disable() {
    this.goTo(0, false);
    this.enabled = false; this.lastProgress = 0;
    this.doc.documentElement.classList.remove('dive-scroll', 'dive-paused');
    this.spacer.style.height = '0px';
  }
}
