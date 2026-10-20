// Keep the viewport readable on high-density phones without unbounded GPU buffers.
export function renderPixelRatio(width, height, deviceRatio, degraded = false) {
  const mobile = width < 640;
  const cap = degraded ? (mobile ? 1.35 : 1) : (mobile ? 2 : 1.5);
  const budget = mobile ? 2000000 : 3000000;
  return Math.max(1, Math.min(deviceRatio || 1, cap, Math.sqrt(budget / Math.max(1, width * height))));
}
