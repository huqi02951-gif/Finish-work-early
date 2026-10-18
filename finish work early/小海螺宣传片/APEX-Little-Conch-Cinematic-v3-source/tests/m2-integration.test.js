import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createConchGeometry, ConchBeacon } from '../src/first-stage/ConchBeacon.js';
import { AutoExplore } from '../src/first-stage/AutoExplore.js';
import { TASK_DEMOS } from '../src/ExperiencePanels.js';
import { PerspectiveCamera } from 'three';

test('M2 shell geometry is finite and framed at desktop and phone aspects',()=>{
 const geometry=createConchGeometry();
 assert.ok(geometry.index.count>20000);assert.ok(geometry.boundingSphere.radius>0);
 assert.ok(Array.from(geometry.attributes.position.array).every(Number.isFinite));
 const beacon=new ConchBeacon();
 for(const aspect of [1440/900,390/844,320/568]){
  const camera=new PerspectiveCamera(64,aspect,.1,500);camera.updateMatrixWorld();
  beacon.update({t:19},0,camera,19,true);assert.ok(beacon.root.visible);
  assert.ok(beacon.root.position.clone().project(camera).length()<2);
  beacon.update({t:19},.3,camera,19,true);assert.equal(beacon.root.visible,false);
 }
 geometry.dispose();
});
test('optional cruise never starts a flight and advances the same reversible native scroll',()=>{
 let progress=.2;const scroll={enabled:false,read:()=>progress,goTo:p=>{progress=p;}};
 const cruise=new AutoExplore(scroll);cruise.set(true);assert.equal(cruise.active,false);
 scroll.enabled=true;cruise.set(true);cruise.tick(.02);assert.ok(progress>.2);
 progress=.1;cruise.tick(.02);assert.ok(progress<.11);
 cruise.set(false);const before=progress;cruise.tick(1);assert.equal(progress,before);
 cruise.set(true);progress=.98;cruise.tick(.02);assert.equal(cruise.active,false);
});
test('M2 task demos cover the four tasks without making a real execution or signature claim',()=>{
 assert.equal(TASK_DEMOS.length,4);assert.ok(TASK_DEMOS.every(d=>d.steps.length===3&&d.result));
 assert.match(TASK_DEMOS[0].steps.join(),/工商异常.*行政处罚.*司法涉诉/);
 assert.match(TASK_DEMOS[1].steps.join(),/OCR/);
 assert.match(TASK_DEMOS[3].result,/客户经理核验/);
 assert.match(TASK_DEMOS[3].sample[1][1],/仅演示计算/);
});

test('the M2 distant plate covers the complete entry and reverse dive camera arc',async()=>{
 const THREE=await import('three');
 const {createBackdropGeometry,UnderwaterPOV}=await import('../src/first-stage/UnderwaterPOV.js');
 const {FirstPersonCamera}=await import('../src/first-stage/FirstPersonCamera.js');
 const {sampleSequence}=await import('../src/first-stage/FreefallSequence.js');
 const backdrop=new THREE.Group(),mesh=new THREE.Mesh(createBackdropGeometry(),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));backdrop.add(mesh);
 const proxy={root:backdrop,particles:{material:{uniforms:{time:{value:0}}}}};
 const ray=new THREE.Raycaster();
 for(const aspect of [1440/900,390/844,320/568])for(const t of [10.81,10.94,11.5,13.6,19])for(const p of t===19?[0,.33,.71,.99]:[0]){
  const rig=new FirstPersonCamera(aspect),state=sampleSequence(t,{aspect});
  rig.update(state,new THREE.Vector2(),.016,false,p);UnderwaterPOV.prototype.update.call(proxy,state,p);backdrop.updateMatrixWorld(true);
  for(const x of [-.99,0,.99])for(const y of [-.99,0,.99]){ray.setFromCamera(new THREE.Vector2(x,y),rig.camera);assert.ok(ray.intersectObject(mesh).length,`uncovered view ${aspect}, t=${t}, p=${p}, ${x},${y}`);}
 }
 mesh.geometry.dispose();mesh.material.dispose();
});
