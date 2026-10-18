// Optional M2 cruise. It moves the real document, so the existing scroll
// timeline, numbered navigation and reverse reading remain the same system.
export class AutoExplore {
  constructor(scroll,onChange=()=>{}){this.scroll=scroll;this.onChange=onChange;this.active=false;}
  set(active){this.active=Boolean(active&&this.scroll.enabled);this.onChange(this.active);}
  tick(dt){if(!this.active)return;const current=this.scroll.read();if(current>=.975){this.set(false);return;}this.scroll.goTo(Math.min(.98,current+Math.min(dt,.05)/110),false);}
}
