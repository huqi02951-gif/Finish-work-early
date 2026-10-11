import * as THREE from 'three';
import { smooth, TIMING } from './FreefallSequence.js';
export class HumanForeground {
  constructor(camera, textures) {
    this.root = new THREE.Group(); camera.add(this.root);
    const make = texture => {
      if (!texture) return null;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }));
      mesh.position.z = -0.65; mesh.renderOrder = 40; this.root.add(mesh); return mesh;
    };
    this.brace = make(textures.handsBrace); this.freefall = make(textures.handsFreefall); this.camera = camera;
  }
  update(s) {
    this.root.visible = s.t < TIMING.impact;
    for(const [mesh, opacity] of [[this.brace, 1-smooth(.5,3.3,s.t)], [this.freefall, s.hands]]) {
      if(!mesh) continue;
      const h=2*.65*Math.tan(this.camera.fov*Math.PI/360);
      // Preserve artwork aspect. Mobile composition must be approved separately.
      const ratio=mesh.material.map.image.width/mesh.material.map.image.height;
      mesh.scale.set(h*ratio,h,1);mesh.material.opacity=opacity;
      mesh.position.y=-smooth(9.6,TIMING.impact,s.t)*.3;
    }
  }
}
