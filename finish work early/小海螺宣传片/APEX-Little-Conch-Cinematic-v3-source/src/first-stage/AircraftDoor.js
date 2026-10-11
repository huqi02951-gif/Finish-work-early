import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp } from './FreefallSequence.js';

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
  constructor(texture) {
    this.root = new THREE.Group(); this.root.position.set(-1.3, 0, -1);
    const metal = new THREE.MeshStandardMaterial({ color: 0x838c88, metalness: 0.68, roughness: 0.54, map: texture });
    this.panel = new THREE.Mesh(new RoundedBoxGeometry(2.6, 4.05, 0.13, 3, 0.055), metal);
    this.panel.position.x = 1.3; this.root.add(this.panel);
    const markings = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.95), new THREE.MeshBasicMaterial({ map: decals(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
    markings.position.set(1.3, 0, 0.077); this.root.add(markings);
    const hardware = new THREE.MeshStandardMaterial({ color: 0xc4bbb0, metalness: 0.87, roughness: 0.26 });
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.027, 8, 28), hardware);
    handle.position.set(2.12, -1.1, 0.16); this.root.add(handle); this.handle = handle;
    for (const y of [-1.45, 1.45]) {
      const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.34, 10), hardware);
      hinge.position.set(0, y, 0.05); this.root.add(hinge);
    }
  }
  update(progress) { this.root.rotation.y = -progress * Math.PI * 0.59; this.handle.rotation.z = -Math.min(progress * 6, 1) * 0.6; }
}
