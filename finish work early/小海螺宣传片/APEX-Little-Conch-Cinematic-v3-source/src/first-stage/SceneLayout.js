// Metres, Y up, forward -Z. The cabin's world altitude is applied by its parent only.
// Export GLBs in these local coordinates, never with START_ALTITUDE baked in.
export const CABIN = Object.freeze({
  eyeHeight: 1.65,
  floorY: -1.65,
  doorZ: -1,
  doorWidth: 1.8,
  doorHeight: 2.6,
  doorCenterY: -0.35,
  doorThickness: 0.10,
  hingeX: -0.9,
  openingAngle: Math.PI * 0.59,
  handle: Object.freeze([1.46, -0.40, 0.12]), // In the hinged door's coordinates.
  leftGrip: Object.freeze([-0.96, -0.24, -0.72]), // In cabin coordinates.
});
export const CAMERA = Object.freeze({ fov: 64, initialZ: 1.65, pitch: -0.13 });
export const SUN = Object.freeze({ direction: [-0.55, 0.28, -0.78], color: 0xf3c68c });

export function cabinCameraZ(aspect) {
  // Keep jambs within 76% of portrait width; do not distort FOV or artwork.
  return Math.max(CAMERA.initialZ, 1.18 / Math.tan(CAMERA.fov * Math.PI / 360) / Math.max(aspect, 0.35) + CABIN.doorZ);
}
