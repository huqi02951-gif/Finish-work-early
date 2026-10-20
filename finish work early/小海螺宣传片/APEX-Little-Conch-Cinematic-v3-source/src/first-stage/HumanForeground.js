import * as THREE from 'three';
import { smooth, TIMING } from './FreefallSequence.js';

// Grip UVs are measured from bottom-left. G2 artwork must supply this metadata;
// changing the anchor never stretches the image or moves the physical door handle.
export const HAND_BINDINGS = Object.freeze({
  handBraceLeft: { height: .78, gripUV: [.70, .82] },
  handBraceRight: { height: .78, gripUV: [.30, .82] },
});
export class HumanForeground {
  constructor(camera, textures, cabin) {
    this.camera = camera;
    this.root = new THREE.Group(); camera.add(this.root);
    this.braces = [];
    for (const [key, anchor] of [['handBraceLeft', cabin.leftGrip], ['handBraceRight', cabin.door.rightGrip]]) {
      const texture = textures[key]; if (!texture) continue;
      const { height, gripUV } = HAND_BINDINGS[key];
      const width = height * texture.image.width / texture.image.height;
      const geometry = new THREE.PlaneGeometry(width, height);
      geometry.translate((.5 - gripUV[0]) * width, (.5 - gripUV[1]) * height, .025);
      const mesh = this.make(texture, geometry, true); mesh.name = key; anchor.add(mesh);
      this.braces.push({ key, mesh });
    }
    this.fall = ['handFreefallLeft', 'handFreefallRight'].map((key, i) => {
      if (!textures[key]) return null;
      const mesh = this.make(textures[key], new THREE.PlaneGeometry(1, 1), false);
      mesh.name = key; mesh.position.z = -.65; this.root.add(mesh); return { mesh, side: i ? 1 : -1 };
    }).filter(Boolean);
    this.hasAssets = this.braces.length + this.fall.length > 0;
  }
  make(texture, geometry, depthTest) {
    return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      map: texture, transparent: true, depthTest, depthWrite: false, alphaTest: .015, side: THREE.DoubleSide,
    }));
  }
  update(s) {
    this.root.visible = s.t < TIMING.impact;
    for (const { key, mesh } of this.braces) {
      const release = key === 'handBraceLeft' ? smooth(2.35, 2.8, s.t) : smooth(.40, 1.15, s.t);
      mesh.visible = s.t < TIMING.impact && release < 1;
      mesh.material.opacity = 1 - release;
    }
    const viewHeight = 2 * .65 * Math.tan(this.camera.fov * Math.PI / 360);
    const viewWidth = viewHeight * this.camera.aspect;
    for (const { mesh, side } of this.fall) {
      const ratio = mesh.material.map.image.width / mesh.material.map.image.height;
      const height = Math.min(viewHeight * .22, viewWidth * .28 / ratio);
      mesh.scale.set(height * ratio, height, 1);
      mesh.position.x = side * (viewWidth * .5 - height * ratio * .55);
      mesh.position.y = -viewHeight * .5 + height * .30 - smooth(9.6, TIMING.impact, s.t) * height;
      mesh.rotation.z = side * .06 * Math.sin(s.t * 3) * (1 - s.water);
      mesh.material.opacity = s.hands;
    }
  }
}
