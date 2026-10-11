import * as THREE from 'three';
import { SUN } from './SceneLayout.js';
import { Sky } from 'three/addons/objects/Sky.js';
export class Atmosphere {
  constructor(mobile) {
    this.root = new THREE.Group();
    const sky = new Sky(); sky.scale.setScalar(4500);
    Object.assign(sky.material.uniforms.turbidity, { value: 2.4 });
    sky.material.uniforms.rayleigh.value = 2.1;
    sky.material.uniforms.mieCoefficient.value = 0.007;
    sky.material.uniforms.mieDirectionalG.value = 0.87;
    sky.material.uniforms.sunPosition.value.set(...SUN.direction).normalize();
    this.root.add(sky);
    this.clouds = [];
  }
  setCloudTexture(texture) {
    const geometry=new THREE.PlaneGeometry(1,1);
    const count=innerWidth<640?14:24;
    for(let i=0;i<count;i++) {
      const band=i%3, side=i%2?-1:1;
      const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,alphaTest:.002,side:THREE.DoubleSide,opacity:band===2?.83:.91});
      const cloud=new THREE.Mesh(geometry,material);
      const width=band===0?230+(i%4)*45:band===1?100+(i%3)*28:48+(i%3)*14;
      cloud.position.set(side*(band===0?150+(i*43%280):band===1?52+(i*17%72):17+(i*7%22)),38+(i*31%190),band===0?-340-(i*89%700):band===1?-110-(i*19%150):-38-(i*7%36));
      cloud.scale.set(width,width*texture.image.height/texture.image.width,1);
      cloud.userData.baseX=cloud.position.x;cloud.userData.bank=band;
      this.root.add(cloud);this.clouds.push(cloud);
    }
  }
  update(s, camera) {
    this.root.visible = s.y > -1;
    for (const cloud of this.clouds) {
      cloud.quaternion.copy(camera.quaternion);
      cloud.position.x=cloud.userData.baseX+Math.sin(s.t*.12+cloud.userData.baseX)*.45;
    }
  }
}
