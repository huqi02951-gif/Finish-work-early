import * as THREE from 'three';
export class FirstPersonCamera {
  constructor(aspect) {
    this.camera = new THREE.PerspectiveCamera(64, aspect, 0.035, 6000);
    this.camera.rotation.order = 'YXZ';
    this.look = new THREE.Vector2();
  }
  update(s, pointer, dt, reducedMotion, storyProgress = 0) {
    this.look.lerp(pointer, 1 - Math.exp(-dt * 4));
    const gain = reducedMotion ? 0.2 : 1;
    const shake = gain * 0.003 * Math.min(1, s.speed / 40) * (1 - s.water);
    this.camera.position.set(s.x, s.y - storyProgress * 6, s.z - storyProgress * 7);
    this.camera.rotation.set(
      s.pitch + this.look.y * 0.035 * gain + Math.sin(s.t * 29) * shake,
      s.yaw - this.look.x * 0.045 * gain,
      s.roll + Math.sin(s.t * 17.4) * shake,
    );
    this.camera.fov = s.fov;
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }
  resize(w, h) { this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
}
