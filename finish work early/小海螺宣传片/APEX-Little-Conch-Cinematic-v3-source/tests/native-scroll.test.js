import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const film=readFileSync(new URL('../src/film.js',import.meta.url),'utf8');

test('touch scroll cannot change first-person look through the real pointer handler',()=>{
 const source=film.slice(film.indexOf('function followPointer(e)'),film.indexOf('function keys(e)'));
 const input=new Function(`let targetX=0,targetY=0,curWidth=390,curHeight=844;const clamp=v=>Math.max(0,Math.min(1,v));const director={pointer:{set(x,y){this.x=x;this.y=y;},x:0,y:0}};${source};return {move:followPointer,look:()=>[targetX,targetY,director.pointer.x,director.pointer.y]};`)();
 input.move({pointerType:'touch',clientX:180,clientY:640});
 input.move({pointerType:'touch',clientX:180,clientY:260});
 assert.deepEqual(input.look(),[0,0,0,0]);
 input.move({pointerType:'mouse',clientX:260,clientY:310});
 assert.notDeepEqual(input.look(),[0,0,0,0]);
});

import { NativeDiveScroll } from '../src/first-stage/NativeDiveScroll.js';
function browserBoundary(){
 const classes=new Set(),spacer={style:{},setAttribute(){}};
 const doc={createElement:()=>spacer,body:{append(){}},documentElement:{classList:{add(...xs){xs.forEach(x=>classes.add(x));},remove(...xs){xs.forEach(x=>classes.delete(x));},toggle(x,on){on?classes.add(x):classes.delete(x);}}}};
 const view={innerWidth:390,innerHeight:844,scrollY:0,history:{},reduced:false,matchMedia(){return {matches:this.reduced};},scrollTo(options){this.scrollY=options.top;this.lastScroll=options;}};
 return {view,doc,classes,spacer,scroll:new NativeDiveScroll(view,doc)};
}
test('native document position is the sole timeline: exact, reversible and clamped',()=>{
 const {scroll,view,spacer,classes}=browserBoundary();scroll.enable();
 assert.ok(classes.has('dive-scroll'));assert.equal(parseFloat(spacer.style.height),844*15);
 for(const p of [0,.18,.32,.9,.99,.6,.2,0]){view.scrollY=p*scroll.travel;assert.ok(Math.abs(scroll.read()-p)<1e-12);}
 view.scrollY=-20;assert.equal(scroll.read(),0);view.scrollY=scroll.travel+200;assert.equal(scroll.read(),1);
 scroll.disable();assert.equal(view.scrollY,0);assert.equal(spacer.style.height,'0px');assert.equal(scroll.read(),0);assert.equal(classes.size,0);
});
test('numbered navigation moves the same page; reduced motion avoids animated navigation',()=>{
 const {scroll,view}=browserBoundary();scroll.enable();scroll.goTo(.32);
 assert.equal(view.lastScroll.behavior,'smooth');assert.ok(Math.abs(scroll.read()-.32)<1e-12);
 view.reduced=true;scroll.goTo(.87);assert.equal(view.lastScroll.behavior,'instant');assert.ok(Math.abs(scroll.read()-.87)<1e-12);
});
test('address-bar changes preserve the runway; rotation preserves the current scene',()=>{
 const {scroll,view,spacer}=browserBoundary();scroll.enable();view.scrollY=.46*scroll.travel;scroll.read();const travel=scroll.travel;
 view.innerHeight=780;scroll.resize();assert.equal(scroll.travel,travel);assert.equal(parseFloat(spacer.style.height),travel+780);assert.ok(Math.abs(scroll.read()-.46)<1e-12);
 view.innerWidth=844;view.innerHeight=390;scroll.resize();assert.ok(Math.abs(scroll.read()-.46)<1e-12);
});
test('pause locks native input without changing scroll progress; replay unlocks and resets',()=>{
 const {scroll,classes,view}=browserBoundary();scroll.enable();view.scrollY=.605*scroll.travel;
 scroll.pause(true);assert.ok(classes.has('dive-paused'));assert.ok(Math.abs(scroll.read()-.605)<1e-12);
 scroll.pause(false);assert.equal(classes.has('dive-paused'),false);scroll.pause(true);scroll.disable();assert.equal(classes.size,0);
});
