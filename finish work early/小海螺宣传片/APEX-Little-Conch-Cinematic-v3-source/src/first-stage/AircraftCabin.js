import * as THREE from 'three';
import { AircraftDoor } from './AircraftDoor.js';
import { START_ALTITUDE } from './FreefallSequence.js';
export class AircraftCabin {
  constructor(textures) {
    this.root = new THREE.Group(); this.root.position.y = START_ALTITUDE;
    const structure = new THREE.MeshStandardMaterial({ color: 0x36484a, roughness: 0.68, metalness: 0.48 });
    const edge = new THREE.MeshStandardMaterial({ color: 0x7b8680, roughness: 0.4, metalness: 0.78 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x111d21, roughness: 0.95 });
    const box = (size, pos, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(...size), mat); m.position.set(...pos); this.root.add(m); return m; };
    // Real jamb depth and floor are separate from the retained V3 artwork.
    box([4.5, 7, 0.28], [-3.63, 0, -1.15], structure);
    box([4.5, 7, 0.28], [3.63, 0, -1.15], structure);
    box([2.8, 1.2, 0.3], [0, 2.65, -1.15], structure);
    box([2.8, 1.2, 0.3], [0, -2.65, -1.15], structure);
    for (const x of [-1.36, 1.36]) {
      box([0.12, 4.35, 0.52], [x, 0, -0.92], edge);
      box([0.055, 4.1, 0.09], [x * 0.96, 0, -0.68], rubber);
    }
    for (const y of [-2.14, 2.14]) box([2.85, 0.12, 0.52], [0, y, -0.92], edge);
    box([8, 0.12, 7.5], [0, -2.18, 2.65], structure);
    for (let z = -0.4; z < 6; z += 0.38) box([6, 0.025, 0.035], [0, -2.105, z], edge);
    // Temporary V3 sidewall image. Replaced by approved art, never by reference assets.
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.625), new THREE.MeshStandardMaterial({ map: textures.cabin, transparent: true, alphaTest: 0.12, roughness: 0.8, metalness: 0.25, color: 0x8c9b9f }));
    plate.position.set(0, 0, -0.65); this.root.add(plate);
    for (const x of [-2.55, 2.55]) {
      for (const z of [0.6, 2.5, 4.5]) {
        box([0.1, 4.7, 0.1], [x, 0, z], edge);
        box([0.16, 0.03, 0.85], [x * 0.97, 1.5, z], new THREE.MeshStandardMaterial({ color: 0xb7d8ce, emissive: 0xadcabf, emissiveIntensity: 0.9 }));
      }
    }
    this.door = new AircraftDoor(textures.hatch); this.root.add(this.door.root);
    const cabinLight = new THREE.PointLight(0xb6d4d9, 30, 12, 2); cabinLight.position.set(0, 1.6, 2); this.root.add(cabinLight);
  }
  update(s) { this.root.visible = s.t < 6; this.door.update(s.door); }
}
