// Retained V3 engineering placeholders, not final approved artwork.
// G0 concept sheets stay in docs/disign and must never be imported here.
// Replace each null with new URL('../../assets/approved/name.webp', import.meta.url).href.
// These optional slots intentionally have no fabricated/low-resolution fallback.
export const assetManifest = {
  cabin: new URL('../../assets/cabin.webp', import.meta.url).href,
  hatch: new URL('../../assets/hatch.webp', import.meta.url).href,
  doorNormal: null, // assets/approved/aircraft-door-normal.png (linear)
  doorRoughness: null, // assets/approved/aircraft-door-roughness.png (linear)
  doorMetalness: null, // assets/approved/aircraft-door-metalness.png (linear)
  // M2 opaque distant scene plate; the V3 photograph remains in assets for rollback.
  seabed: new URL('../../assets/gemini-m2/opt_abyss.webp', import.meta.url).href,
  handBraceLeft: null,   // assets/approved/hand-brace-left.png
  handBraceRight: null,  // assets/approved/hand-brace-right.png
  handFreefallLeft: null, // assets/approved/hand-freefall-left.png
  handFreefallRight: null, // assets/approved/hand-freefall-right.png
  shellRim: null,
  cloudBank: new URL('../../assets/original/cloud-bank-v1.png', import.meta.url).href,
  oceanLifeAtlas: new URL('../../assets/original/ocean-life-atlas-v1.png', import.meta.url).href,
};
