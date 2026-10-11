import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleSequence, SequenceClock, TIMING, START_ALTITUDE, IMPACT_SPEED } from '../src/first-stage/FreefallSequence.js';
import { DoorGesture } from '../src/first-stage/AircraftDoor.js';

test('the hatch requires an intentional tap or rightward drag; cancellation never commits', () => {
  const gesture = new DoorGesture();
  gesture.start(200,300); assert.equal(gesture.end(201,301),true);
  gesture.start(200,300); assert.equal(gesture.end(240,301),false);
  gesture.start(200,300); assert.equal(gesture.end(110,301),false);
  gesture.start(200,300); assert.equal(gesture.end(201,390),false);
  gesture.start(200,300); assert.equal(gesture.end(280,301),true);
  gesture.start(200,300); gesture.move(290,300); gesture.cancel(); assert.equal(gesture.end(290,300),false);
});
test('no automatic departure; pause and backgrounding do not advance time', () => {
  const clock = new SequenceClock();clock.tick(10);assert.equal(clock.time,0);
  clock.start();clock.tick(.016);assert.equal(clock.time,.016);
  clock.paused=true;clock.tick(.1);assert.equal(clock.time,.016);
  clock.paused=false;clock.tick(.1,false);assert.equal(clock.time,.016);
  clock.tick(30);assert.equal(clock.time,.066);
  clock.seek(10.8);clock.reset();assert.equal(clock.time,0);assert.equal(clock.started,false);
});
test('camera position, orientation, and field of view have no discontinuity at shot boundaries', () => {
  for (const aspect of [16/9,390/844,844/390,320/568]) {
    for(const t of [0.2,1.7,2.35,2.8,4.9,6.2,9.7,10.8,11.2,13.2,18.99]) {
      const left=sampleSequence(t-.00001,{aspect}),right=sampleSequence(t+.00001,{aspect});
      for(const key of ['x','y','z','pitch','yaw','roll','fov','door']) assert.ok(Math.abs(left[key]-right[key])<.002,`${aspect}/${t}/${key}`);
    }
  }
});
test('vertical velocity joins continuously at impact and equals the HUD speed', () => {
  const h=.00001, t=TIMING.impact;
  const a=sampleSequence(t-h),b=sampleSequence(t),c=sampleSequence(t+h);
  assert.ok(Math.abs(b.y)<1e-9);
  assert.ok(Math.abs((a.y-b.y)/h-IMPACT_SPEED)<.005);
  assert.ok(Math.abs((b.y-c.y)/h-IMPACT_SPEED)<.005);
  for(let t=3;t<19;t+=.07){const s=sampleSequence(t);const derivative=(sampleSequence(t-h).y-sampleSequence(t+h).y)/(2*h);assert.ok(Math.abs(derivative-s.speed)<.005);}
});
test('altitude falls monotonically; water visibility and hands respect the water plane', () => {
  let last=START_ALTITUDE;
  for(let t=0;t<=19;t+=.005){const s=sampleSequence(t);assert.ok(s.y<=last+1e-8);last=s.y;assert.ok(Number.isFinite(s.y));if(t>=TIMING.impact)assert.equal(s.hands,0);if(t>11)assert.equal(s.water,1);}
  assert.equal(sampleSequence(19).phase,'underwater');assert.ok(Math.abs(sampleSequence(19).depth-18)<.001);
});
test('reduced motion removes roll, FOV pulse and speed blur without changing the story', () => {
  for(const t of [3.5,6,10.8,15,19]){const a=sampleSequence(t),b=sampleSequence(t,{reducedMotion:true});assert.equal(b.roll,0);assert.equal(b.fov,64);assert.equal(b.blur,0);assert.equal(a.y,b.y);assert.equal(a.phase,b.phase);}
});
test('portrait framing retains the same exit and arrival coordinates', () => {
  const portrait=sampleSequence(0,{aspect:390/844}),desktop=sampleSequence(0);
  assert.ok(portrait.z>desktop.z);
  for(const t of [5,10.8,19])assert.equal(sampleSequence(t,{aspect:390/844}).z,sampleSequence(t).z);
});
