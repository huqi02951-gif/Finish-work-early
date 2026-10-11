import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp } from './FreefallSequence.js';
import { CABIN } from './SceneLayout.js';

export class DoorGesture {
  start(x, y) { this.origin = { x, y }; this.progress = 0; }
  move(x, y) {
    if (!this.origin) return 0;
    this.distance = Math.hypot(x - this.origin.x, y - this.origin.y);
    this.progress = clamp((x - this.origin.x) / 150);
    return this.progress;
  }
  end(x, y) {
    if (!this.origin) return false;
    this.move(x, y);
    const commit = this.distance < 8 || this.progress >= 0.45;
    this.cancel();
    return commit;
  }
  cancel() { this.origin = null; this.distance = 0; this.progress = 0; }
}

function decals() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1536;
  const c = canvas.getContext('2d');
  c.fillStyle = '#e8dfc7'; c.font = '24px monospace'; c.fillText('APEX EXPEDITION / 001', 95, 115);
  c.save(); c.translate(108, 380); c.rotate(-0.035);
  c.font = 'bold 124px Helvetica'; c.fillText('APEX.', 0, 0);
  c.font = '32px monospace'; c.fillText('STUDIO', 5, 49); c.restore();
  c.save(); c.translate(116, 618); c.rotate(0.025); c.fillStyle = '#d3cbb4'; c.fillRect(0, 0, 638, 164);
  c.fillStyle = '#293632'; c.font = 'bold 53px Helvetica'; c.fillText('DIVE DEEPER.', 25, 74);
  c.font = '20px monospace'; c.fillText('THE LITTLE CONCH / FIRST SIGNAL', 27, 128); c.restore();
  c.save(); c.translate(615, 879); c.rotate(-0.12); c.strokeStyle = '#df885c'; c.lineWidth = 3; c.strokeRect(0,0,264,124);
  c.fillStyle = '#df885c'; c.font = 'bold 26px monospace'; c.fillText('BORN TO',20,49); c.fillText('EXPLORE',20,87); c.restore();
  c.fillStyle = '#d4cbb4'; c.font = '18px monospace'; c.fillText('HATCH 01   /   PULL TO RELEASE', 109, 1390);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
export class AircraftDoor {
  constructor(texture, { decalTexture = decals(), normalMap = null, roughnessMap = null, metalnessMap = null } = {}) {
    const { doorWidth: w, doorHeight: h, doorThickness: d } = CABIN;
    this.root = new THREE.Group(); this.root.name = 'Door_Hinge';
    this.root.position.set(CABIN.hingeX, CABIN.doorCenterY, CABIN.doorZ);
    const metal = new THREE.MeshStandardMaterial({ color: 0x66727c, metalness: metalnessMap ? 1 : .62, roughness: roughnessMap ? 1 : .64, map: texture, normalMap, roughnessMap, metalnessMap });
    this.panel = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, .035), metal);
    this.panel.name = 'Door_Panel'; this.panel.position.x = w / 2;
    this.panel.castShadow = this.panel.receiveShadow = true; this.root.add(this.panel);
    if (decalTexture) {
      const markings = new THREE.Mesh(new THREE.PlaneGeometry(w - .08, h - .10), new THREE.MeshBasicMaterial({ map: decalTexture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
      markings.position.set(w / 2, 0, d / 2 + .008); this.root.add(markings);
    }
    const hardware = new THREE.MeshStandardMaterial({ color: 0x87929a, metalness: .84, roughness: .33 });
    const mount = new THREE.Mesh(new THREE.BoxGeometry(.13, .30, .035), hardware);
    mount.position.set(CABIN.handle[0], CABIN.handle[1], d / 2 + .025); mount.castShadow = true; this.root.add(mount);
    this.handle = new THREE.Group(); this.handle.name = 'Latch'; this.handle.position.set(...CABIN.handle); this.root.add(this.handle);
    const lever = new THREE.Mesh(new THREE.BoxGeometry(.045, .19, .045), new THREE.MeshStandardMaterial({ color: 0xd68c45, roughness: .52, metalness: .45 }));
    lever.position.y = -.055; lever.castShadow = true; this.handle.add(lever);
    this.rightGrip = new THREE.Object3D(); this.rightGrip.name = 'Grip_Handle_Right'; this.handle.add(this.rightGrip);
    for (const y of [-.95, 0, .95]) {
      const hinge = new THREE.Mesh(new THREE.CylinderGeometry(.036, .036, .22, 10), hardware);
      hinge.position.set(0, y, .015); hinge.castShadow = true; this.root.add(hinge);
    }
  }
  update(progress) {
    // Swing out of the aircraft. An inward 106 degree swing intersected the left jamb.
    this.root.rotation.y = progress * CABIN.openingAngle;
    this.handle.rotation.z = -Math.min(progress * 6, 1) * .6;
  }
}
