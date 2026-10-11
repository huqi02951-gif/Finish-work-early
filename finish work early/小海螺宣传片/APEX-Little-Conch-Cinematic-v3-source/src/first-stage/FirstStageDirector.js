import * as THREE from 'three';
import { gsap } from 'gsap';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FirstPersonCamera } from './FirstPersonCamera.js';
import { AircraftCabin } from './AircraftCabin.js';
import { Atmosphere } from './Atmosphere.js';
import { OceanSurface } from './OceanSurface.js';
import { UnderwaterPOV } from './UnderwaterPOV.js';
import { WaterTransition } from './WaterTransition.js';
import { sampleSequence, START_ALTITUDE } from './FreefallSequence.js';
import { assetManifest } from './assetManifest.js';
import { CABIN, SUN } from './SceneLayout.js';
import { SeaLifeEncounters } from './SeaLifeEncounters.js';
import { HumanForeground } from './HumanForeground.js';
export class FirstStageDirector {
  constructor({ host, hatch, onFailure }) {
    this.host = host; this.hatch = hatch; this.onFailure = onFailure;
    this.ready = false; this.pointer = new THREE.Vector2(); this.manual = { value: 0 };
    this.media = matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.media.matches;
    this.onMotion = e => { this.reducedMotion = e.matches; };
    this.media.addEventListener('change', this.onMotion);
    this.scene = new THREE.Scene();
    this.rig = new FirstPersonCamera(innerWidth / innerHeight);
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x052435); this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.94; this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.id = 'cinematic-canvas'; this.renderer.domElement.setAttribute('aria-hidden', 'true');
    host.prepend(this.renderer.domElement);
    this.lost = event => { event.preventDefault(); this.ready = false; onFailure('图形设备连接中断。请重新载入，或直接继续水下故事。'); };
    this.renderer.domElement.addEventListener('webglcontextlost', this.lost);
    this.scene.add(new THREE.HemisphereLight(0xa8bed6, 0x111820, .5));
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const sun = new THREE.DirectionalLight(SUN.color, 2.6);
    sun.target.position.set(0, START_ALTITUDE, 0);
    sun.position.copy(sun.target.position).add(new THREE.Vector3(...SUN.direction).normalize().multiplyScalar(12));
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 28 });
    sun.shadow.bias = -.0003; sun.shadow.normalBias = .012;
    this.scene.add(sun, sun.target); this.sun = sun;
    const pmrem = new THREE.PMREMGenerator(this.renderer), room = new RoomEnvironment();
    this.environment = pmrem.fromScene(room, 0.02); this.scene.environment = this.environment.texture; this.scene.environmentIntensity = .30;
    room.dispose(); pmrem.dispose();
    this.atmosphere = new Atmosphere(innerWidth < 640); this.scene.add(this.atmosphere.root);
    this.ocean = new OceanSurface(); this.scene.add(this.ocean.mesh);
    this.transition = new WaterTransition(this.renderer, this.scene, this.rig.camera);
    this.resize = this.resize.bind(this); addEventListener('resize', this.resize); this.resize();
    this.load();
    this.samples = []; this.frameCount = 0; this.qualityReduced = false;
  }
  async load() {
    try {
      const loader = new THREE.TextureLoader();
      const entries = await Promise.all(Object.entries(assetManifest).filter(([,url])=>url).map(async ([key, url]) => {
        const texture = await loader.loadAsync(url);
        texture.colorSpace = ['doorNormal', 'doorRoughness', 'doorMetalness'].includes(key) ? THREE.NoColorSpace : THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy()); return [key, texture];
      }));
      if(this.disposed){entries.forEach(([,texture])=>texture.dispose());return;}
      this.textures = Object.fromEntries(entries);
      this.atmosphere.setCloudTexture(this.textures.cloudBank);
      this.cabin = new AircraftCabin(this.textures); this.scene.add(this.cabin.root);
      this.scene.add(this.rig.camera);this.human=new HumanForeground(this.rig.camera,this.textures,this.cabin);
      this.underwater = new UnderwaterPOV(this.textures.seabed, innerWidth < 640); this.scene.add(this.underwater.root);
      this.seaLife=new SeaLifeEncounters(this.textures.oceanLifeAtlas);this.scene.add(this.seaLife.root);
      await this.renderer.compileAsync(this.scene, this.rig.camera);
      if (this.disposed) return;
      this.ready = true; this.host.parentElement.classList.add('webgl-ready');
      this.hatch.disabled = false; this.hatch.setAttribute('aria-label', '点击门把或向右拖动，打开舱门');
    } catch (error) { console.error('First stage initialization failed', error); this.onFailure('场景素材未能载入。请重试，或直接继续水下故事。'); }
  }
  resize() {
    this.dpr = Math.min(devicePixelRatio || 1, innerWidth < 640 ? 1.35 : 1.5);
    if (this.qualityReduced) this.dpr = Math.min(this.dpr, 1);
    this.renderer.setPixelRatio(this.dpr); this.renderer.setSize(innerWidth, innerHeight);
    this.rig.resize(innerWidth, innerHeight); this.transition.resize(innerWidth, innerHeight, this.dpr);
  }
  setManual(value) { gsap.killTweensOf(this.manual); this.manual.value = value * 0.2; }
  commitManual() { gsap.killTweensOf(this.manual); }
  cancelManual() { gsap.to(this.manual, { value: 0, duration: 0.35, ease: 'power2.out', overwrite: true }); }
  reset() { gsap.killTweensOf(this.manual); this.manual.value = 0; this.rig.look.set(0, 0); this.pointer.set(0, 0); }
  pulse(time) { this.transition.pass.uniforms.pulse.value = time; }
  update({ time, dt, progress = 0, active = true, deepTime = 0 }) {
    if (!this.ready) return sampleSequence(time);
    const s = sampleSequence(time, { aspect: innerWidth / innerHeight, manualDoor: this.manual.value, reducedMotion: this.reducedMotion });
    this.rig.update(s, this.pointer, active ? dt : 0, this.reducedMotion, progress);
    this.cabin.update(s); this.human.update(s); this.atmosphere.update(s, this.rig.camera); this.ocean.update({ ...s, t: s.t + deepTime }, this.rig.camera);
    // Extended water clock animates life after arrival without altering the camera trajectory.
    const waterState = { ...s, t: s.t + deepTime };
    this.underwater.update(waterState,progress);this.seaLife.update(s,progress,this.rig.camera,s.t+deepTime,this.reducedMotion); this.transition.update(waterState, this.reducedMotion);
    this.host.parentElement.dataset.shot = s.phase;
    this.host.parentElement.dataset.humanForeground = s.t >= 10.8 ? 'hidden' : this.human.hasAssets ? 'integrated-pending-review' : 'asset-pending';
    this.host.parentElement.dataset.doorProgress = s.door.toFixed(4);
    if (time === 0) this.projectDoor();
    this.hatch.style.visibility = time > 0 ? 'hidden' : 'visible';
    // Shadow maps are needed only while the cabin can be seen.
    this.sun.castShadow = s.t < 6;
    if (this.qaCoordinates) this.updateCoordinateGuide(s);
    this.renderer.info.autoReset=false;this.renderer.info.reset();this.transition.render();
    this.frameCount++;
    if (active && dt > 0 && dt < 0.3) { this.samples.push(dt * 1000); if (this.samples.length > 240) this.samples.shift(); }
    if (!this.qualityReduced && this.samples.length === 180 && this.samples.reduce((a,b) => a+b,0)/180 > 29) {
      this.qualityReduced = true; this.resize();
    }
    if (this.frameCount % 30 === 0) {
      const sorted = [...this.samples].sort((a,b) => a-b);
      const stats = { frames: this.frameCount, medianMs: +(sorted[Math.floor(sorted.length * .5)] || 0).toFixed(1), p95Ms: +(sorted[Math.floor(sorted.length * .95)] || 0).toFixed(1), dpr: this.dpr, calls: this.renderer.info.render.calls, geometries: this.renderer.info.memory.geometries, textures: this.renderer.info.memory.textures };
      document.getElementById('render-stats').textContent = JSON.stringify(stats);
    }
    return s;
  }
  projectDoor() {
    this.cabin.root.updateMatrixWorld(true);
    const points = [[0, -CABIN.doorHeight/2], [CABIN.doorWidth, -CABIN.doorHeight/2], [CABIN.doorWidth, CABIN.doorHeight/2], [0, CABIN.doorHeight/2]].map(([x,y]) => this.cabin.door.root.localToWorld(new THREE.Vector3(x,y,.15)).project(this.rig.camera));
    const xs = points.map(p => (p.x + 1) * innerWidth / 2), ys = points.map(p => (1-p.y) * innerHeight / 2);
    Object.assign(this.hatch.style, { left: `${Math.min(...xs)}px`, top: `${Math.min(...ys)}px`, width: `${Math.max(...xs)-Math.min(...xs)}px`, height: `${Math.max(...ys)-Math.min(...ys)}px` });
  }
  setCoordinateGuide(enabled) {
    this.qaCoordinates = enabled;
    if (!this.coordinateGuide) {
      this.coordinateGuide = document.createElement('div'); this.coordinateGuide.id = 'qa-coordinates';
      this.coordinateGuide.innerHTML = '<i data-anchor="left">L · 框</i><i data-anchor="right">R · 闩</i><output></output>';
      this.host.parentElement.append(this.coordinateGuide);
    }
    this.coordinateGuide.hidden = !enabled;
  }
  updateCoordinateGuide(s) {
    this.scene.updateMatrixWorld(true);
    const anchors = { left: this.cabin.leftGrip, right: this.cabin.door.rightGrip };
    const report = { worldAltitude: START_ALTITUDE, eyeHeight: CABIN.eyeHeight, camera: this.rig.camera.position.toArray(), door: s.door, grips: {} };
    for (const [key, anchor] of Object.entries(anchors)) {
      const point = anchor.getWorldPosition(new THREE.Vector3()); report.grips[key] = point.toArray();
      point.project(this.rig.camera);
      const marker = this.coordinateGuide.querySelector(`[data-anchor="${key}"]`);
      marker.style.left = `${(point.x + 1) * innerWidth / 2}px`; marker.style.top = `${(1-point.y) * innerHeight / 2}px`;
      marker.hidden = s.t > 2.35;
    }
    this.coordinateGuide.querySelector('output').textContent = JSON.stringify(report, null, 2);
  }
  dispose() {
    this.disposed=true; this.coordinateGuide?.remove();
    gsap.killTweensOf(this.manual); removeEventListener('resize', this.resize); this.media.removeEventListener('change', this.onMotion);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.lost);
    const geometries = new Set(), materials = new Set(), textures = new Set(Object.values(this.textures || {}));
    this.scene.traverse(object => { if(object.geometry) geometries.add(object.geometry); if(object.material) for(const mat of [object.material].flat()) materials.add(mat); });
    for(const mat of materials) { for(const value of Object.values(mat)) if(value?.isTexture) textures.add(value); mat.dispose(); }
    geometries.forEach(g => g.dispose()); textures.forEach(t => t.dispose());
    this.transition.dispose(); this.environment.dispose(); this.renderer.dispose(); this.renderer.domElement.remove();
  }
}
