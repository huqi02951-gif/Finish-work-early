import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {ConchIsland,ISLAND,islandHeight,islandView} from '../src/first-stage/ConchIsland.js';
import {sampleSequence} from '../src/first-stage/FreefallSequence.js';

test('the island has real land above water, submerged shores and visible 3D geometry',()=>{
 const island=new ConchIsland();assert.equal(island.root.name,'LittleConchIsland');
 let high=0,low=0;const p=island.terrain.geometry.attributes.position;
 for(let i=0;i<p.count;i++){if(p.getZ(i)>2)high++;if(p.getZ(i)<-2)low++;}
 assert.ok(high>1500&&low>1500);assert.ok(island.root.children.length>=4);assert.ok(islandHeight(0,ISLAND.z)>5);
 island.update(sampleSequence(19));assert.equal(island.root.visible,false);
 island.update(sampleSequence(0));assert.equal(island.root.visible,true);
});
test('the opening trajectory stays in open water and cannot collide with the island',()=>{
 for(let t=0;t<=19;t+=.05){const s=sampleSequence(t);assert.ok(islandHeight(s.x,s.z)<-5);}
});
test('the overview keeps the island centre within desktop and phone viewports',()=>{
 for(const aspect of [1440/900,390/844,320/568]){
  const camera=new THREE.PerspectiveCamera(64,aspect,.035,6000);islandView(camera,0,true);
  const centre=new THREE.Vector3(0,4,ISLAND.z).project(camera);assert.ok(Math.abs(centre.x)<.8&&Math.abs(centre.y)<.8);
  assert.ok(camera.position.y>50);assert.equal(camera.fov,50);
 }
});
