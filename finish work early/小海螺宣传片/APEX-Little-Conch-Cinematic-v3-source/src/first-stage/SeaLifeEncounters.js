import * as THREE from 'three';
import { CHAPTERS } from '../StoryChapters.js';
import { diveDepth } from './DiveNavigation.js';
import { smooth } from './FreefallSequence.js';

// Original, alpha-checked atlas. Sprites retain their square cell aspect and live
// in world space, so descent, nearby bubbles and distant scenery have parallax.
export class SeaLifeEncounters {
  constructor(texture) {
    this.root=new THREE.Group(); this.root.name='OceanLife'; this.creatures=[];
    for(let i=0;i<6;i++) {
      const map=texture.clone();map.repeat.set(1/3,1/2);map.offset.set((i%3)/3,i<3?.5:0);map.needsUpdate=true;
      const material=new THREE.SpriteMaterial({map,transparent:true,depthWrite:false,opacity:0,alphaTest:.015});
      const sprite=new THREE.Sprite(material);
      const at=CHAPTERS[i+1].start+.045;
      sprite.position.set(0,-diveDepth(at),-36-i*.8);sprite.scale.setScalar(i===1?2.0:2.4);
      sprite.userData={at,baseY:sprite.position.y,index:i+1};this.root.add(sprite);this.creatures.push(sprite);
    }
  }
  update(state, progress, camera, time, reducedMotion) {
    this.root.visible=state.t>=11.8;
    for(const sprite of this.creatures) {
      const {at,baseY,index}=sprite.userData;
      const start=CHAPTERS[index].start, end=CHAPTERS[index+1].start;
      const reveal=smooth(start,start+.025,progress);
      const opacity=reveal*(1-smooth(end-.025,end+.025,progress));
      sprite.material.opacity=opacity*.96; sprite.visible=opacity>.01;
      const distance=Math.max(3,Math.abs(sprite.position.z-camera.position.z));
      const halfHeight=distance*Math.tan(camera.fov*Math.PI/360),halfWidth=halfHeight*camera.aspect;
      const portrait=camera.aspect<1,side=index%2?-1:1;
      sprite.position.x=camera.position.x+(portrait?0:halfWidth*.45*side);
      const swim=smooth(start,start+.025,progress);
      sprite.position.y=baseY+(-diveDepth(progress)-baseY)*swim+Math.sin(camera.rotation.x)*distance+halfHeight*(portrait?.22:.04)+(reducedMotion?0:Math.sin(time*.7+index)*.10);
      // Encounters are hero-sized: picture beside the skill on desktop, above it on phones.
      const size=halfHeight*(portrait?.56:.86);
      sprite.scale.set(size,size,1);sprite.material.rotation=reducedMotion?0:Math.sin(time*.45+index)*.045;
    }
  }
}
