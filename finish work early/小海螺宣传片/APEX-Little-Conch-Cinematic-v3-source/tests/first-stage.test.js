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
    for(const t of [0.2,1.7,2.35,2.8,3.22,4.9,6.2,9.7,10.8,11.2,13.2,18.99]) {
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

// Geometry, contact anchors, and physical clearance are tested independently of artwork.
import * as THREE from 'three';
import { CABIN, cabinCameraZ } from '../src/first-stage/SceneLayout.js';
import { AircraftDoor } from '../src/first-stage/AircraftDoor.js';
import { HumanForeground, HAND_BINDINGS } from '../src/first-stage/HumanForeground.js';

test('GLB local coordinates receive altitude once; the right hand follows the moving latch', () => {
  const cabin = new THREE.Group(); cabin.position.y = START_ALTITUDE;
  const door = new AircraftDoor(null, { decalTexture: null }); cabin.add(door.root);
  const origin = new THREE.Vector3();
  for (const p of [0, .25, .5, 1]) {
    door.update(p); cabin.updateMatrixWorld(true);
    const hinge = door.root.getWorldPosition(new THREE.Vector3());
    assert.ok(Math.abs(hinge.y - (START_ALTITUDE + CABIN.doorCenterY)) < 1e-9);
    const grip = door.rightGrip.getWorldPosition(new THREE.Vector3());
    const expected = new THREE.Vector3(...CABIN.handle).applyMatrix4(door.root.matrixWorld);
    assert.ok(grip.distanceTo(expected) < 1e-9);
    assert.ok(grip.z <= CABIN.doorZ + CABIN.handle[2] + 1e-9, 'handle swings outside, away from camera');
    if(p===0)origin.copy(grip); else assert.ok(grip.distanceTo(origin)>.1);
  }
  assert.equal(-CABIN.floorY, CABIN.eyeHeight);
});

test('the eye clears the threshold before dropping below the cabin floor at every viewport', () => {
  for (const aspect of [1440/900,390/844,320/568,844/390]) {
    assert.ok(cabinCameraZ(aspect)>0);
    for(let t=0;t<5;t+=.005) {
      const s=sampleSequence(t,{aspect});
      if(s.z > CABIN.doorZ-.14) {
        assert.ok(s.y-START_ALTITUDE > CABIN.floorY+.2, `floor collision at ${t}/${aspect}`);
        assert.ok(Math.abs(s.x)<CABIN.doorWidth/2-.15, `jamb collision at ${t}/${aspect}`);
      }
      if(t<=TIMING.doorOpen)assert.equal(s.z,cabinCameraZ(aspect));
    }
  }
});

test('split hand layers preserve grip UV, depth occlusion and aspect; all human layers vanish at water', () => {
  const camera=new THREE.PerspectiveCamera(64,390/844,.035,6000);
  const leftGrip=new THREE.Object3D(),door=new AircraftDoor(null,{decalTexture:null});
  const texture=new THREE.Texture({width:1536,height:2048});
  const textures=Object.fromEntries(['handBraceLeft','handBraceRight','handFreefallLeft','handFreefallRight'].map(key=>[key,texture]));
  const human=new HumanForeground(camera,textures,{leftGrip,door});
  for(const {key,mesh} of human.braces){
    assert.equal(mesh.material.depthTest,true);
    mesh.geometry.computeBoundingBox();const bounds=mesh.geometry.boundingBox;
    const {height,gripUV}=HAND_BINDINGS[key],width=height*.75;
    assert.ok(Math.abs(bounds.min.x+gripUV[0]*width)<1e-7);
    assert.ok(Math.abs(bounds.min.y+gripUV[1]*height)<1e-7);
  }
  human.update(sampleSequence(6));
  for(const {mesh} of human.fall)assert.ok(Math.abs(mesh.scale.x/mesh.scale.y-.75)<1e-9);
  human.update(sampleSequence(TIMING.impact));assert.equal(human.root.visible,false);
  for(const {mesh} of human.braces)assert.equal(mesh.visible,false);
  const empty=new HumanForeground(camera,{}, {leftGrip,door});assert.equal(empty.hasAssets,false);
});


test('forward velocity does not stop or jump at the threshold seam', () => {
  const h=1e-5;
  for(const aspect of [1440/900,390/844,320/568]) {
    const a=sampleSequence(3.22-h,{aspect}),b=sampleSequence(3.22,{aspect}),c=sampleSequence(3.22+h,{aspect});
    assert.ok(Math.abs((b.z-a.z)/h+3.2)<.001);
    assert.ok(Math.abs((c.z-b.z)/h+3.2)<.001);
  }
});

import { createBackdropGeometry } from '../src/first-stage/UnderwaterPOV.js';
test('underwater backdrop triangles never reverse winding across a spherical pole', () => {
  const geometry=createBackdropGeometry(),p=geometry.attributes.position,idx=geometry.index;
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),edge=new THREE.Vector3(),normal=new THREE.Vector3(),centre=new THREE.Vector3(0,-18,-12);
  let sign=0;
  for(let i=0;i<idx.count;i+=3){
    a.fromBufferAttribute(p,idx.getX(i));b.fromBufferAttribute(p,idx.getX(i+1));c.fromBufferAttribute(p,idx.getX(i+2));
    normal.subVectors(b,a).cross(edge.subVectors(c,a));
    assert.ok(normal.length()>.01, 'no collapsed triangle');
    const side=Math.sign(normal.dot(edge.subVectors(a,centre)));sign ||= side;assert.equal(side,sign,'no folded latitude rows');
  }
  geometry.dispose();
});

import { CHAPTERS } from '../src/StoryChapters.js';
import { addDiveInput, diveChapter, diveDepth } from '../src/first-stage/DiveNavigation.js';
import { FirstPersonCamera } from '../src/first-stage/FirstPersonCamera.js';
test('a large wheel gesture cannot skip skills; reversing stops at the preceding skill',()=>{
  for(let i=0;i<CHAPTERS.length-1;i++) {
    const p=CHAPTERS[i].start+.045;
    const next=addDiveInput(p,p,100);
    assert.equal(diveChapter(next),i+1);
    const back=addDiveInput(p,p,-100);
    assert.equal(diveChapter(back),Math.max(0,i-1));
  }
  assert.equal(addDiveInput(0,0,-1),0);
  assert.equal(addDiveInput(1,1,1),1);
});
test('manual descent is monotonic and each skill has a continuous physical depth',()=>{
  let previous=18;
  for(let p=0;p<=1;p+=.0005) {const depth=diveDepth(p);assert.ok(depth>=previous-1e-8);previous=depth;}
  for(const ch of CHAPTERS) {
    assert.equal(diveDepth(ch.start),ch.depth);
    assert.ok(Math.abs(diveDepth(ch.start-.00001)-diveDepth(ch.start+.00001))<.00001);
  }
  const rig=new FirstPersonCamera(390/844);
  for(const p of [0,.18,.32,.46,.605,.74,.87,1]) {
    rig.update(sampleSequence(19),new THREE.Vector2(),.016,false,p);
    assert.ok(Math.abs(-rig.camera.position.y-diveDepth(p))<.001,'HUD depth must match the camera, not just change a number');
  }
});

import { DiveReadingGate, DIVE_PACING } from '../src/first-stage/DiveNavigation.js';
test('a skill gets reading time; momentum cannot leave it, but reverse input remains available',()=>{
  const gate=new DiveReadingGate();
  assert.equal(gate.allows(1,0),true);
  gate.enter(1,10);
  assert.equal(gate.allows(1,10.1),false);
  assert.equal(gate.allows(-1,10.1),true);
  gate.enter(1,12); // repeated frames must not restart the timer
  assert.equal(gate.allows(1,10+DIVE_PACING.readingSeconds),true);
  gate.enter(2,16);assert.equal(gate.allows(1,17),false);
  gate.reset();assert.equal(gate.allows(1,0),true);
});
import { SeaLifeEncounters } from '../src/first-stage/SeaLifeEncounters.js';
test('every numbered skill has one hero encounter and the image remains within desktop and mobile frames',()=>{
  for(const aspect of [1440/900,390/844,320/568]) {
    const texture=new THREE.Texture({width:1536,height:1024});
    const encounters=new SeaLifeEncounters(texture),rig=new FirstPersonCamera(aspect);
    for(let i=1;i<=6;i++) {
      const p=CHAPTERS[i].start+.045;
      const state=sampleSequence(19,{aspect});rig.update(state,new THREE.Vector2(),.016,false,p);
      encounters.update(state,p,rig.camera,19,true);
      const visible=encounters.creatures.filter(x=>x.visible);
      assert.equal(visible.length,1);assert.equal(visible[0].userData.index,i);
      const sprite=visible[0];
      for(const x of [-.5,.5])for(const y of [-.5,.5]) {
        const corner=new THREE.Vector3(x*sprite.scale.x,y*sprite.scale.y,0).applyQuaternion(rig.camera.quaternion).add(sprite.position).project(rig.camera);
        assert.ok(Math.abs(corner.x)<.99&&Math.abs(corner.y)<.99,`clipped icon ${i}/${aspect}`);
      }
    }
  }
});
test('releasing input near the next encounter completes its readable focus instead of a blank gap',()=>{
  for(let i=0;i<6;i++){
    const p=CHAPTERS[i].start+.045,threshold=CHAPTERS[i+1].start-.02;
    assert.equal(addDiveInput(p,threshold,0.0001),CHAPTERS[i+1].start+.045);
  }
});
