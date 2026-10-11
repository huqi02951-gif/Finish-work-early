// Approved V3 assets only. GPT art handoff: docs/ASSET-REQUESTS.md.
// Replace each null with new URL('../../assets/approved/name.webp', import.meta.url).href.
// These optional slots intentionally have no fabricated/low-resolution fallback.
export const assetManifest = {
  cabin: new URL('../../assets/cabin.webp', import.meta.url).href,
  hatch: new URL('../../assets/hatch.webp', import.meta.url).href,
  seabed: new URL('../../assets/seabed.webp', import.meta.url).href,
  handsBrace: null,
  handsFreefall: null,
  shellRim: null,
};
