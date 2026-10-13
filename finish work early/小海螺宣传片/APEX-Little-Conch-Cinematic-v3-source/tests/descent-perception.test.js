import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {UnderwaterPOV} from '../src/first-stage/UnderwaterPOV.js';
import {FirstPersonCamera} from '../src/first-stage/FirstPersonCamera.js';
import {sampleSequence} from '../src/first-stage/FreefallSequence.js';

test('diving moves the distant scenery past the eye instead of carrying it with the camera',()=>{
 const rig=new FirstPersonCamera(390/844),backdrop={root:new THREE.Group(),particles:{material:{uniforms:{time:{value:0}}}}};
 const relative=[];
 for(const progress of [0,.825]){
  const state=sampleSequence(19);rig.update(state,new THREE.Vector2(),.016,false,progress);
  UnderwaterPOV.prototype.update.call(backdrop,state,progress);
  relative.push(backdrop.root.position.y-rig.camera.position.y);
 }
 assert.ok(Math.abs(relative[1]-relative[0])>50,'deep exploration must have observable vertical parallax; a HUD change alone is insufficient');
});
