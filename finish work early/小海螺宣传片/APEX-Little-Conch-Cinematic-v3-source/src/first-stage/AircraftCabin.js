import * as THREE from 'three';
import { AircraftDoor } from './AircraftDoor.js';
import { START_ALTITUDE } from './FreefallSequence.js';
import { CABIN } from './SceneLayout.js';

export class AircraftCabin {
  constructor(textures) {
    this.root = new THREE.Group(); this.root.name = 'AircraftCabin';
    this.root.position.y = START_ALTITUDE;
    const structure = new THREE.MeshStandardMaterial({ color: 0x242a30, roughness: .78, metalness: .36 });
    const edge = new THREE.MeshStandardMaterial({ color: 0x66727c, roughness: .48, metalness: .72 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x13191f, roughness: .95 });
    const box = (size, pos, mat) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
      m.position.set(...pos); m.castShadow = m.receiveShadow = true; this.root.add(m); return m;
    };
    const { doorWidth: w, doorHeight: h, doorCenterY: cy, floorY: floor } = CABIN;
    // Structural pieces share a perspective camera and an eye level 1.65m above floor.
    for (const sign of [-1, 1]) {
      box([2.8, 4.5, .20], [sign * (w / 2 + 1.4), cy, -1.18], structure);
      box([.14, h + .20, .38], [sign * (w / 2 + .085), cy, -.95], edge);
      box([.035, h + .025, .06], [sign * (w / 2 + .012), cy, -.755], rubber);
      box([.14, 3.0, 6.5], [sign * 1.95, -.2, 2.1], structure);
      for (const z of [.15, 1.55, 3.15, 4.75]) {
        box([.13, 2.8, .085], [sign * 1.82, -.22, z], edge);
        box([.18, .04, 1.0], [sign * 1.79, .94, z], edge);
      }
    }
    for (const y of [floor - .08, cy + h / 2 + .08]) {
      box([w + .31, .16, .38], [0, y, -.95], edge);
      box([w + .04, 1.1, .20], [0, y + (y < 0 ? -.62 : .62), -1.18], structure);
    }
    box([3.9, .12, 7], [0, floor - .06, 2.4], structure);
    box([3.9, .12, 7], [0, 1.27, 2.4], structure);
    // Tread strips and recessed floor rails, with real depth and limited repetition.
    for (let z = -.66; z < 5; z += .45) box([1.7, .012, .025], [0, floor + .008, z], edge);
    for (const x of [-1.08, 1.08]) box([.065, .025, 6.5], [x, floor + .012, 2.1], rubber);
    box([w, .055, .25], [0, floor + .027, -.96], edge);
    // Keep the original placeholder, at its native aspect and behind the real jamb.
    // G0 concept boards are not used as textures. These scratches await A1 replacement.
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 3.4875), new THREE.MeshStandardMaterial({
      map: textures.cabin, transparent: true, alphaTest: .12, roughness: .88, metalness: .18, color: 0x66727c,
    }));
    plate.position.set(0, cy, -1.065); plate.receiveShadow = true; this.root.add(plate);
    this.door = new AircraftDoor(textures.hatch, { normalMap: textures.doorNormal, roughnessMap: textures.doorRoughness, metalnessMap: textures.doorMetalness }); this.root.add(this.door.root);
    this.leftGrip = new THREE.Object3D(); this.leftGrip.name = 'Grip_Frame_Left';
    this.leftGrip.position.set(...CABIN.leftGrip); this.root.add(this.leftGrip);
    const fill = new THREE.PointLight(0x91abc4, 3.2, 7, 2);
    fill.position.set(.8, .75, 1.6); this.root.add(fill);
  }
  update(s) { this.root.visible = s.t < 6; this.door.update(s.door); }
}
