import { CAMERA, cabinCameraZ } from './SceneLayout.js';
// One world metre is one metre in the HUD. Artistic altitude, never a jump simulation.
export const clamp = (x, min = 0, max = 1) => Math.min(max, Math.max(min, x));
export const mix = (a, b, t) => a + (b - a) * t;
export function smooth(a, b, x) {
  const p = clamp((x - a) / (b - a));
  return p * p * p * (p * (p * 6 - 15) + 10);
}
const G = 9.81, TERMINAL = 58;
export const TIMING = Object.freeze({ release: 0.2, doorOpen: 2.35, exit: 2.8, impact: 10.8, settle: 19 });
const fallDistance = t => TERMINAL ** 2 / G * Math.log(Math.cosh(G * t / TERMINAL));
const fallSpeed = t => TERMINAL * Math.tanh(G * t / TERMINAL);
export const START_ALTITUDE = fallDistance(TIMING.impact - TIMING.exit);
export const IMPACT_SPEED = fallSpeed(TIMING.impact - TIMING.exit);

// Quintic Hermite: position, velocity and acceleration agree across the threshold.
function travel(t, fromTime, toTime, from, to, fromSpeed, toSpeed) {
  const duration = toTime - fromTime, u = clamp((t - fromTime) / duration);
  const d = to - from, a = fromSpeed * duration, b = toSpeed * duration;
  return from + a*u + (10*d-6*a-4*b)*u**3 + (-15*d+8*a+7*b)*u**4 + (6*d-3*a-3*b)*u**5;
}

// Absolute sampling makes seeking, pause and replay deterministic; no tween chains.
export function sampleSequence(time, { aspect = 16 / 9, manualDoor = 0, reducedMotion = false } = {}) {
  const t = clamp(time, 0, TIMING.settle), u = Math.max(0, t - TIMING.impact);
  const fallT = Math.max(0, Math.min(t, TIMING.impact) - TIMING.exit);
  const depth = 18 * (1 - Math.exp(-IMPACT_SPEED * u / 18));
  const y = t < TIMING.impact ? START_ALTITUDE - fallDistance(fallT) : -depth;
  const speed = t < TIMING.impact ? fallSpeed(fallT) : IMPACT_SPEED * Math.exp(-IMPACT_SPEED * u / 18);
  // Finish opening before leaning through the jamb. The previous early exit path
  // could lower the eye through the threshold while still inside the aircraft.
  const exit = smooth(TIMING.doorOpen, 4.9, t), water = smooth(-0.22, 0.4, -y);
  const recovery = smooth(TIMING.impact + 0.4, TIMING.settle, t);
  const initialZ = cabinCameraZ(aspect);
  const phase = t === 0 ? 'waiting' : t < TIMING.doorOpen ? 'opening' : t < TIMING.impact ? 'falling' : t < 13.2 ? 'impact' : t < TIMING.settle ? 'descending' : 'underwater';
  return {
    t, phase, y, depth, speed, water, recovery,
    x: 1.1 * smooth(2.2, 6.2, t) + 1.8 * smooth(5, TIMING.settle, t),
    // Cross the threshold horizontally before gravity lowers the eye to floor level.
    z: (t < 3.22 ? travel(t, TIMING.doorOpen, 3.22, initialZ, -1.7, 0, -3.2)
      : travel(t, 3.22, 4.9, -1.7, -12, -3.2, 0)) - 16 * recovery,
    pitch: CAMERA.pitch - 0.995 * smooth(2.7, 9.7, t) + 1.065 * recovery,
    yaw: -0.055 * Math.sin(exit * Math.PI) + 0.035 * recovery,
    roll: reducedMotion ? 0 : 0.08 * Math.sin(exit * Math.PI * 1.4) * (1 - recovery),
    fov: CAMERA.fov + (reducedMotion ? 0 : 11 * smooth(3, 8, t) * (1 - recovery)),
    door: mix(manualDoor, 1, smooth(0, TIMING.doorOpen, t)),
    impact: Math.exp(-(((t - TIMING.impact - 0.16) / 0.46) ** 2)),
    blur: reducedMotion ? 0 : 0.006 * smooth(15, 52, speed) * (1 - water),
    hands: (1 - smooth(TIMING.impact - 0.25, TIMING.impact, t)) * smooth(2.5, 3.5, t),
    shell: smooth(11.7, 15.5, t),
  };
}

// Accumulate only visible active time; a suspended browser cannot skip impact.
export class SequenceClock {
  time = 0;
  started = false;
  paused = false;
  start() { this.started = true; this.time = 0; }
  tick(dt, visible = true) {
    if (this.started && !this.paused && visible) this.time = Math.min(TIMING.settle, this.time + clamp(dt, 0, 0.05));
    return this.time;
  }
  reset() { this.time = 0; this.started = false; this.paused = false; }
  seek(t) { this.started = t > 0; this.time = clamp(t, 0, TIMING.settle); }
}
