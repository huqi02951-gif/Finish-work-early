import React from 'react';
import { BodyPart, BossSpriteState, LevelArtPreset, PunishmentPreset, VillainPhase } from '../types';
import { getLevelArtPreset } from '../artPresets';
import { HELL_LEVELS } from '../data';
import { BODY_PART_LABELS } from '../levelMechanics';

interface MonsterVisualProps {
  styleId: string;
  state: BossSpriteState;
  shredProgress?: number;
  shrinkFactor?: number;
  bossHpPercent?: number;
  uploadedPhotoUrl?: string;
  stickerScale?: number;
  stickerOffsetX?: number;
  stickerOffsetY?: number;
  punishmentPreset?: PunishmentPreset;
  artPreset?: LevelArtPreset;
  villainPhase?: VillainPhase;
  weaknessParts?: BodyPart[];
  playMode?: 'turntable' | 'whack' | 'qte' | 'clicker' | 'deflect';
  activeWhackPart?: BodyPart | null;
  activeQtePart?: BodyPart | null;
  qteScale?: number;
  onWeaknessClick?: (part: BodyPart) => void;
}

const fallbackArt = getLevelArtPreset(HELL_LEVELS[0]);

const weaknessCoords: Record<BodyPart, { x: number; y: number }> = {
  mouth: { x: 50, y: 30 },
  throat: { x: 50, y: 39 },
  eyes: { x: 50, y: 24 },
  hands: { x: 21, y: 55 },
  back: { x: 71, y: 48 },
  heart: { x: 50, y: 51 },
  belly: { x: 50, y: 62 },
  feet: { x: 50, y: 88 },
  head: { x: 50, y: 18 },
  shadow: { x: 74, y: 77 }
};

const stateClassMap: Record<BossSpriteState, string> = {
  idle: 'boss-state-idle',
  hit: 'boss-state-hit',
  hit_heavy: 'boss-state-heavy',
  dizzy: 'boss-state-dizzy',
  crying: 'boss-state-broken',
  kneeling: 'boss-state-broken',
  flattened: 'boss-state-ko',
  flat_dead: 'boss-state-ko',
  shredding: 'boss-state-furnace',
  apologizing: 'boss-state-broken'
};

const AnnoyingFace: React.FC<{ level: number; state: BossSpriteState }> = ({ level, state }) => {
  const isKo = state === 'flat_dead' || state === 'flattened';
  
  const renderEyes = () => {
    if (isKo) {
      return (
        <g stroke="#000" strokeWidth="1.5" strokeLinecap="round">
          <line x1="42" y1="22.5" x2="46" y2="25.5" />
          <line x1="46" y1="22.5" x2="42" y2="25.5" />
          <line x1="54" y1="22.5" x2="58" y2="25.5" />
          <line x1="58" y1="22.5" x2="54" y2="25.5" />
        </g>
      );
    }
    if (state === 'dizzy') {
      return (
        <g stroke="#000" strokeWidth="1" fill="none" strokeLinecap="round">
          <path d="M 42 24 A 2 2 0 1 0 46 24 A 1.5 1.5 0 1 0 43 24 A 1 1 0 1 0 45 24" />
          <path d="M 54 24 A 2 2 0 1 0 58 24 A 1.5 1.5 0 1 0 55 24 A 1 1 0 1 0 57 24" />
        </g>
      );
    }
    if (state === 'hit' || state === 'hit_heavy') {
      return (
        <g stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 41.5 22.5 L 45.5 24 L 41.5 25.5" />
          <path d="M 58.5 22.5 L 54.5 24 L 58.5 25.5" />
        </g>
      );
    }
    if (state === 'crying' || state === 'apologizing' || state === 'kneeling') {
      return (
        <g stroke="#38bdf8" strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d="M 42 25 Q 44.5 22 47 25" />
          <path d="M 53 25 Q 55.5 22 58 25" />
        </g>
      );
    }

    switch (level) {
      case 1:
        return (
          <g>
            <circle cx="44" cy="24" r="2.5" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <circle cx="42.5" cy="24" r="1.2" fill="#000" />
            <circle cx="56" cy="24" r="2.5" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <circle cx="57.5" cy="24" r="1.2" fill="#000" />
          </g>
        );
      case 2:
        return (
          <g stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <path d="M 42.5 24 Q 45 22 47.5 24" />
            <path d="M 52.5 24 Q 55 22 57.5 24" />
          </g>
        );
      case 3:
        return (
          <g>
            <circle cx="44" cy="24" r="2.2" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <circle cx="44" cy="24" r="1" fill="#ef4444" />
            <circle cx="56" cy="24" r="2.2" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <circle cx="56" cy="24" r="1" fill="#ef4444" />
          </g>
        );
      case 4:
        return (
          <g fill="none">
            <path d="M 42 24.5 Q 44.5 21 47 24.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 53 24 Q 55.5 26.5 58 24" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );
      case 5:
        return (
          <g>
            <circle cx="44" cy="24" r="2.2" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <circle cx="44.5" cy="23.5" r="1.2" fill="#000" />
            <circle cx="56" cy="24" r="2.2" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <circle cx="55.5" cy="23.5" r="1.2" fill="#000" />
          </g>
        );
      case 6:
        return (
          <g>
            <circle cx="44" cy="24" r="1" fill="#000" />
            <circle cx="56" cy="24" r="3.2" stroke="#fbbf24" strokeWidth="1.2" fill="rgba(251,191,36,0.18)" />
            <line x1="58.5" y1="26" x2="62" y2="29.5" stroke="#fbbf24" strokeWidth="0.8" />
          </g>
        );
      case 7:
        return null;
      case 8:
        return (
          <g stroke="#000" strokeWidth="1.2" strokeLinecap="round">
            <line x1="42.5" y1="23.5" x2="46.5" y2="23.5" />
            <line x1="53.5" y1="23.5" x2="57.5" y2="23.5" />
          </g>
        );
      case 9:
        return (
          <g>
            <circle cx="44" cy="24" r="2.5" fill="#fff" stroke="#ef4444" strokeWidth="0.6" />
            <circle cx="44" cy="24" r="1" fill="#000" />
            <circle cx="56" cy="24" r="2.5" fill="#fff" stroke="#ef4444" strokeWidth="0.6" />
            <circle cx="56" cy="24" r="1" fill="#000" />
          </g>
        );
      case 10:
        return (
          <g>
            <ellipse cx="44" cy="24" rx="2" ry="2.8" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.5" />
            <circle cx="44" cy="24" r="0.8" fill="#000" />
            <ellipse cx="56" cy="24" rx="2" ry="2.8" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.5" />
            <circle cx="56" cy="24" r="0.8" fill="#000" />
          </g>
        );
      case 11:
        return (
          <g>
            <circle cx="44" cy="24" r="3.2" fill="#fff" stroke="#000" strokeWidth="0.8" />
            <circle cx="44" cy="24" r="1.2" fill="#000" />
            <circle cx="56" cy="24" r="3.2" fill="#fff" stroke="#000" strokeWidth="0.8" />
            <circle cx="56" cy="24" r="1.2" fill="#000" />
          </g>
        );
      case 12:
        return (
          <g stroke="#000" strokeWidth="0.8" fill="none" strokeLinecap="round">
            <path d="M 42 24 A 1.8 1.8 0 1 0 45.6 24 A 1.4 1.4 0 1 0 42.8 24 A 1 1 0 1 0 44.2 24" />
            <path d="M 54 24 A 1.8 1.8 0 1 0 57.6 24 A 1.4 1.4 0 1 0 54.8 24 A 1 1 0 1 0 56.2 24" />
          </g>
        );
      case 13:
        return (
          <g>
            <circle cx="56" cy="24" r="2.5" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <circle cx="55" cy="24.5" r="1.2" fill="#000" />
          </g>
        );
      case 14:
        return (
          <g stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <path d="M 41.5 25.5 Q 44 22.5 46.5 25.5" />
            <path d="M 53.5 25.5 Q 56 22.5 58.5 25.5" />
          </g>
        );
      case 15:
        return (
          <g>
            <circle cx="44" cy="24" r="2.5" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <circle cx="42.5" cy="24" r="1.2" fill="#000" />
            <circle cx="56" cy="24" r="2.5" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <circle cx="54.5" cy="24" r="1.2" fill="#000" />
          </g>
        );
      case 16:
        return (
          <g fill="#f97316" stroke="#ef4444" strokeWidth="0.6">
            <path d="M 41.5 25.5 Q 44 21 44 23 Q 46.5 21 45.5 25.5 Z" />
            <path d="M 54.5 25.5 Q 56 21 56 23 Q 58.5 21 57.5 25.5 Z" />
          </g>
        );
      case 17:
        return (
          <g>
            <circle cx="44" cy="24" r="2.2" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <circle cx="45.2" cy="24" r="1.2" fill="#000" />
            <circle cx="56" cy="24" r="2.2" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <circle cx="54.8" cy="24" r="1.2" fill="#000" />
          </g>
        );
      case 18:
        return (
          <g>
            <rect x="41" y="21.5" width="6" height="5" fill="#000" rx="1.2" />
            <circle cx="44" cy="24" r="1" fill="#ef4444" />
            <rect x="53" y="21.5" width="6" height="5" fill="#000" rx="1.2" />
            <circle cx="56" cy="24" r="1" fill="#ef4444" />
          </g>
        );
      default:
        return (
          <g>
            <circle cx="44" cy="24" r="2.2" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <circle cx="44" cy="24" r="1.2" fill="#000" />
            <circle cx="56" cy="24" r="2.2" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <circle cx="56" cy="24" r="1.2" fill="#000" />
          </g>
        );
    }
  };

  const renderEyebrows = () => {
    if (isKo) return null;
    if (state === 'crying' || state === 'apologizing' || state === 'kneeling') {
      return (
        <g stroke="#000" strokeWidth="1.2" strokeLinecap="round">
          <path d="M 41 21 Q 44.5 21.5 47 23.5" />
          <path d="M 59 21 Q 55.5 21.5 53 23.5" />
        </g>
      );
    }
    if (state === 'hit' || state === 'hit_heavy') {
      return (
        <g stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round">
          <line x1="41" y1="22" x2="47.5" y2="20" />
          <line x1="59" y1="22" x2="52.5" y2="20" />
        </g>
      );
    }

    switch (level) {
      case 2:
      case 15:
        return (
          <g stroke="#000" strokeWidth="1.2" strokeLinecap="round">
            <line x1="41" y1="21.5" x2="47" y2="23.5" />
            <line x1="59" y1="21.5" x2="53" y2="23.5" />
          </g>
        );
      case 3:
      case 5:
      case 9:
      case 10:
      case 16:
        return (
          <g stroke="#000" strokeWidth="1.5" strokeLinecap="round">
            <line x1="41" y1="22" x2="47.5" y2="19.5" />
            <line x1="59" y1="22" x2="52.5" y2="19.5" />
          </g>
        );
      case 6:
        return (
          <g stroke="#000" strokeWidth="1.2" strokeLinecap="round">
            <line x1="41" y1="19.5" x2="46.5" y2="21.5" />
            <line x1="53.5" y1="22" x2="58.5" y2="19" />
          </g>
        );
      case 17:
        return (
          <g stroke="#000" strokeWidth="1" strokeLinecap="round">
            <path d="M 41 21 Q 44 19 47 21" fill="none" />
            <path d="M 53 21 Q 56 19 59 21" fill="none" />
          </g>
        );
      default:
        return (
          <g stroke="#000" strokeWidth="1" strokeLinecap="round">
            <line x1="41.5" y1="21" x2="46.5" y2="21" />
            <line x1="53.5" y1="21" x2="58.5" y2="21" />
          </g>
        );
    }
  };

  const renderMouth = () => {
    if (state === 'crying' || state === 'apologizing' || state === 'kneeling') {
      return (
        <path d="M 45 32 Q 50 28 55 32 Q 50 35 45 32 Z" fill="#7f1d1d" stroke="#000" strokeWidth="1.2" />
      );
    }
    if (state === 'hit' || state === 'hit_heavy') {
      return (
        <ellipse cx="50" cy="31.5" rx="3.5" ry="2" fill="#7f1d1d" stroke="#000" strokeWidth="1.2" />
      );
    }

    switch (level) {
      case 1:
        return (
          <g>
            <path d="M 43 31 Q 50 25 57 31 Q 50 38 43 31 Z" fill="#ef4444" stroke="#000" strokeWidth="0.8" />
            <path d="M 47.5 31.5 Q 50 39 52.5 31.5 Z" fill="#f43f5e" stroke="#000" strokeWidth="0.6" />
          </g>
        );
      case 2:
        return (
          <path d="M 44.5 32 Q 51.5 32.5 55.5 28.5" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        );
      case 3:
        return (
          <g>
            <path d="M 43 30.5 L 57 30.5 L 55 33 L 53 30.5 L 51 33 L 49 30.5 L 47 33 L 45 30.5 Z" fill="#fff" stroke="#000" strokeWidth="0.8" />
            <line x1="43" y1="30.5" x2="57" y2="30.5" stroke="#000" strokeWidth="1" />
          </g>
        );
      case 4:
        return (
          <g stroke="#000" strokeWidth="1.2" fill="none" strokeLinecap="round">
            <path d="M 44.5 31 Q 47.5 33.5 50 31" />
            <path d="M 50 31 Q 52.5 29.5 55.5 31" />
          </g>
        );
      case 5:
        return (
          <circle cx="50" cy="31" r="2.2" fill="#fff" stroke="#000" strokeWidth="1" />
        );
      case 6:
        return (
          <path d="M 45 32.5 Q 50 29 55 32.5" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        );
      case 7:
      case 8:
        return (
          <line x1="45" y1="31" x2="55" y2="31" stroke="#000" strokeWidth="1.8" strokeLinecap="round" />
        );
      case 9:
        return (
          <g>
            <path d="M 44 29.5 H 56 M 46 29.5 L 47 33.5 L 48 29.5 M 52 29.5 L 53 33.5 L 54 29.5" stroke="#000" strokeWidth="1" fill="#fff" strokeLinejoin="round" />
          </g>
        );
      case 10:
        return (
          <g>
            <path d="M 44 29.5 Q 50 32.5 56 29.5" stroke="#000" strokeWidth="1.2" fill="none" />
            <path d="M 45.5 29.5 L 47 34 L 48.5 29.5 M 51.5 29.5 L 53 34 L 54.5 29.5" stroke="#000" strokeWidth="0.8" fill="#fff" strokeLinejoin="round" />
          </g>
        );
      case 11:
        return (
          <ellipse cx="50" cy="32.5" rx="5.2" ry="3.8" fill="#7f1d1d" stroke="#000" strokeWidth="1.2" />
        );
      case 12:
        return (
          <g>
            <line x1="45" y1="29.5" x2="55" y2="29.5" stroke="#000" strokeWidth="1.2" />
            <path d="M 48 29.5 Q 50 35.5 52 29.5 Z" fill="#f43f5e" stroke="#000" strokeWidth="0.8" />
          </g>
        );
      case 13:
        return (
          <path d="M 43.5 29.5 Q 50 36 56.5 29.5 Z" fill="#000" stroke="#000" strokeWidth="0.8" />
        );
      case 14:
        return (
          <path d="M 44 32.5 Q 47 30 50 32.5 Q 53 35 56 32.5" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        );
      case 16:
        return (
          <path d="M 45 33 Q 50 28 55 33 Z" fill="#3f0f0f" stroke="#ef4444" strokeWidth="1" />
        );
      case 17:
        return (
          <g>
            <path d="M 45.5 30 Q 50 33.5 54.5 30" stroke="#000" strokeWidth="1.2" fill="none" />
            <rect x="47.5" y="30" width="2" height="3" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <rect x="50.5" y="30" width="2" height="3" fill="#fff" stroke="#000" strokeWidth="0.6" />
          </g>
        );
      case 18:
        return (
          <path d="M 43 29.5 Q 50 39.5 57 29.5 Q 50 31.5 43 29.5 Z" fill="#000" stroke="#ef4444" strokeWidth="1" />
        );
      default:
        return (
          <path d="M 45 32 Q 50 35 55 32" stroke="#000" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        );
    }
  };

  const renderExtraFeatures = () => {
    if (isKo) return null;
    const items = [];
    
    if (level === 5) {
      items.push(
        <g key="steam" opacity="0.6" fill="#e2e8f0">
          <path d="M 42 34 Q 38 34 37 37 Q 39 39 42 38 Z" />
          <path d="M 58 34 Q 62 34 63 37 Q 61 39 58 38 Z" />
        </g>
      );
    }
    if (level === 7) {
      items.push(
        <g key="blindfold">
          <rect x="37.5" y="21" width="25" height="5.5" fill="#1e293b" rx="1" stroke="#0f172a" strokeWidth="0.6" />
          <line x1="37.5" y1="23.7" x2="62.5" y2="23.7" stroke="#475569" strokeWidth="0.5" />
        </g>
      );
    }
    if (level === 8) {
      items.push(
        <g key="ice-glasses" stroke="#06b6d4" fill="rgba(6,182,212,0.15)">
          <rect x="39" y="21" width="9" height="5.5" strokeWidth="1" rx="0.5" />
          <rect x="52" y="21" width="9" height="5.5" strokeWidth="1" rx="0.5" />
          <line x1="48" y1="23" x2="52" y2="23" strokeWidth="1.2" />
        </g>
      );
    }
    if (level === 10) {
      items.push(
        <g key="vampire-glow" stroke="#c084fc" strokeWidth="0.6" fill="none" opacity="0.7">
          <path d="M 40 18 Q 38 15 41 12" />
          <path d="M 60 18 Q 62 15 59 12" />
        </g>
      );
    }
    if (level === 11) {
      items.push(
        <g key="panic-sweat" stroke="#38bdf8" strokeWidth="0.8" fill="none">
          <path d="M 47 16 Q 46.5 19 45.5 19" />
          <path d="M 53 16 Q 53.5 19 54.5 19" />
          <path d="M 39 26 Q 38.5 28.5 38 28.5" />
          <path d="M 61 26 Q 61.5 28.5 62 28.5" />
        </g>
      );
    }
    if (level === 13) {
      items.push(
        <path key="ink" d="M 36 22 Q 41.5 17.5 45.5 21 Q 48 25.5 42.5 28.5 Q 37.5 29 36 22 Z" fill="#0f172a" />
      );
    }
    if (level === 14) {
      items.push(
        <g key="bandage">
          <path d="M 37.5 21 L 62.5 22.5 L 62.5 19 L 37.5 17.5 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.5" />
          <path d="M 43.5 26.5 V 36" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="1,1" fill="none" />
          <path d="M 56.5 26.5 V 36" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="1,1" fill="none" />
        </g>
      );
    }
    if (level === 15) {
      items.push(
        <g key="schemer-details" fill="none" stroke="#475569" strokeWidth="0.5">
          <path d="M 45 15 L 50 18 L 55 15" />
          <path d="M 48 16.5 L 50 18.5 L 52 16.5" />
          <path d="M 44.5 28 Q 50 30 55.5 28" stroke="#000" strokeWidth="0.8" />
        </g>
      );
    }
    if (level === 16) {
      items.push(
        <g key="angry-veins" stroke="#ef4444" strokeWidth="0.6" fill="none">
          <path d="M 37.5 18 L 39 19.5 L 38 21.5" />
          <path d="M 62.5 18 L 61 19.5 L 62 21.5" />
          <path d="M 40 26.5 L 39 27.5 L 40 29" />
          <path d="M 60 26.5 L 61 27.5 L 60 29" />
        </g>
      );
    }
    if (level === 17) {
      items.push(
        <g key="mud" fill="#78350f" opacity="0.6">
          <circle cx="39" cy="27" r="1.2" />
          <circle cx="61" cy="22" r="1" />
          <circle cx="41" cy="17" r="0.8" />
        </g>
      );
    }
    if (level === 18) {
      items.push(
        <path key="crown" d="M 42 12.5 L 44.5 8 L 47 11.5 L 50 6 L 53 11.5 L 55.5 8 L 58 12.5 Z" fill="#991b1b" stroke="#450a0a" strokeWidth="0.8" />
      );
    }

    return items;
  };

  return (
    <svg
      className="boss-custom-face-svg"
      viewBox="0 0 100 100"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {renderExtraFeatures()}
      {renderEyebrows()}
      {renderEyes()}
      {renderMouth()}
    </svg>
  );
};

const getBossFilter = (level: number, isLowHp: boolean, isKo: boolean, shredProgress: number) => {
  let baseFilter = '';
  switch (level) {
    case 1: baseFilter = 'hue-rotate(20deg) saturate(1.1)'; break;
    case 2: baseFilter = 'hue-rotate(-40deg) saturate(1.3)'; break;
    case 3: baseFilter = 'grayscale(0.3) contrast(1.1) brightness(0.95)'; break;
    case 4: baseFilter = 'hue-rotate(150deg) saturate(0.8)'; break;
    case 5: baseFilter = 'sepia(0.3) saturate(1.4) hue-rotate(10deg)'; break;
    case 6: baseFilter = 'hue-rotate(40deg) saturate(1.6) brightness(1.05)'; break;
    case 7: baseFilter = 'grayscale(0.5) contrast(1.25) brightness(0.85)'; break;
    case 8: baseFilter = 'hue-rotate(190deg) brightness(1.2) saturate(1.4)'; break;
    case 9: baseFilter = 'hue-rotate(95deg) saturate(1.2) brightness(0.9)'; break;
    case 10: baseFilter = 'hue-rotate(320deg) saturate(1.8) brightness(0.85)'; break;
    case 11: baseFilter = 'contrast(0.9) brightness(0.8)'; break;
    case 12: baseFilter = 'hue-rotate(110deg) saturate(0.75) brightness(0.95)'; break;
    case 13: baseFilter = 'contrast(1.6) brightness(0.7)'; break;
    case 14: baseFilter = 'grayscale(0.85) brightness(0.95)'; break;
    case 15: baseFilter = 'hue-rotate(270deg) saturate(1.3) brightness(0.9)'; break;
    case 16: baseFilter = 'hue-rotate(-15deg) saturate(2.2) brightness(1.1)'; break;
    case 17: baseFilter = 'sepia(0.7) saturate(0.9) brightness(0.85)'; break;
    case 18: baseFilter = 'invert(0.12) hue-rotate(330deg) contrast(1.3) brightness(0.75)'; break;
    default: baseFilter = '';
  }

  const blurFilter = shredProgress > 0 ? `blur(${shredProgress * 7}px) grayscale(${shredProgress * 65}%)` : '';
  const lowHpFilter = isLowHp ? 'contrast(1.15) saturate(1.15)' : '';
  const koFilter = isKo ? 'grayscale(0.4) brightness(0.7)' : '';

  return [baseFilter, blurFilter, lowHpFilter, koFilter].filter(Boolean).join(' ');
};

const GothicAccessoryOverlay: React.FC<{ level: number; state: BossSpriteState }> = ({ level, state }) => {
  const isKo = state === 'flat_dead' || state === 'flattened';
  if (isKo) return null;

  const renderAccessories = () => {
    switch (level) {
      case 1:
        return (
          <g>
            <g transform="rotate(-15 38 54)">
              <rect x="33" y="48" width="10" height="14" fill="#fbbf24" stroke="#000" strokeWidth="1.2" />
              <text x="38" y="57" fontFamily="monospace" fontWeight="900" fontSize="5" fill="#000" textAnchor="middle">闲话</text>
              <circle cx="38" cy="51" r="1.2" fill="#475569" stroke="#000" strokeWidth="0.8" />
            </g>
            <g transform="rotate(10 62 64)">
              <rect x="57" y="58" width="10" height="14" fill="#fbbf24" stroke="#000" strokeWidth="1.2" />
              <text x="62" y="67" fontFamily="monospace" fontWeight="900" fontSize="5" fill="#000" textAnchor="middle">嚼舌</text>
              <circle cx="62" cy="61" r="1.2" fill="#475569" stroke="#000" strokeWidth="0.8" />
            </g>
            <g transform="rotate(-5 48 30)">
              <rect x="43" y="24" width="10" height="14" fill="#fbbf24" stroke="#000" strokeWidth="1.2" />
              <text x="48" y="33" fontFamily="monospace" fontWeight="900" fontSize="5" fill="#000" textAnchor="middle">造谣</text>
              <circle cx="48" cy="27" r="1.2" fill="#475569" stroke="#000" strokeWidth="0.8" />
            </g>
          </g>
        );
      case 2:
        return (
          <g stroke="#ef4444" strokeWidth="2.2" fill="none" strokeLinecap="round">
            <path d="M 21 55 Q 35 52 50 51" />
            <path d="M 71 48 Q 50 51 21 55" />
            <path d="M 35 45 Q 50 65 65 45" />
            <path d="M 38 60 Q 50 50 62 60" />
          </g>
        );
      case 3:
        return (
          <g>
            <g stroke="#475569" strokeWidth="1.8">
              <line x1="32" y1="45" x2="24" y2="38" />
              <circle cx="24" cy="38" r="2" fill="#94a3b8" stroke="#000" strokeWidth="0.8" />
              <line x1="68" y1="45" x2="76" y2="38" />
              <circle cx="76" cy="38" r="2" fill="#94a3b8" stroke="#000" strokeWidth="0.8" />
              <line x1="71" y1="48" x2="79" y2="52" />
              <circle cx="79" cy="52" r="2" fill="#94a3b8" stroke="#000" strokeWidth="0.8" />
            </g>
            <g stroke="#334155" strokeWidth="1.2" fill="none">
              <rect x="42" y="52" width="6" height="10" rx="3" transform="rotate(25 45 57)" />
              <rect x="52" y="55" width="6" height="10" rx="3" transform="rotate(-15 55 60)" />
            </g>
          </g>
        );
      case 6:
        return (
          <g>
            <path d="M 47 39 L 45 48 L 50 51" stroke="#ef4444" strokeWidth="1" fill="none" />
            <path d="M 53 39 L 55 48 L 50 51" stroke="#ef4444" strokeWidth="1" fill="none" />
            <g transform="translate(42, 50)">
              <rect x="0" y="0" width="16" height="12" rx="1.5" fill="#ffffff" stroke="#475569" strokeWidth="1.2" />
              <rect x="2" y="2" width="4" height="4" fill="#ef4444" />
              <rect x="8" y="2" width="6" height="1.5" fill="#334155" />
              <text x="8" y="8" fontFamily="monospace" fontSize="3" fontWeight="bold" fill="#d7a84d">VP 授权</text>
              <path d="M 1 1 L 15 11" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" />
            </g>
          </g>
        );
      case 10:
        return (
          <g>
            <path d="M 46 38 L 26 22 L 36 38 Z" fill="#991b1b" stroke="#000" strokeWidth="1.5" />
            <path d="M 46 38 L 26 22 L 36 38 Z" fill="#1e1b4b" clipPath="polygon(0 0, 100% 0, 100% 100%)" opacity="0.3" />
            <path d="M 54 38 L 74 22 L 64 38 Z" fill="#991b1b" stroke="#000" strokeWidth="1.5" />
            <path d="M 54 38 L 74 22 L 64 38 Z" fill="#1e1b4b" clipPath="polygon(0 0, 100% 0, 100% 100%)" opacity="0.3" />
            <path d="M 36 38 Q 50 42 64 38" stroke="#000" strokeWidth="1.5" fill="none" />
          </g>
        );
      case 11:
        return (
          <g>
            <path d="M 28 14 Q 22 2 50 1 Q 78 2 72 14 Q 50 16 28 14 Z" fill="#475569" stroke="#000" strokeWidth="1.5" />
            <path d="M 38 10 L 42 6 L 40 4" stroke="#1e293b" strokeWidth="1" fill="none" />
            <path d="M 60 11 L 57 7 L 61 5" stroke="#1e293b" strokeWidth="1" fill="none" />
            <path d="M 48 13 L 51 9 L 49 7" stroke="#1e293b" strokeWidth="1" fill="none" />
            <text x="50" y="9" fontFamily="monospace" fontSize="5.5" fontWeight="900" fill="#f87171" textAnchor="middle">KPI指标</text>
          </g>
        );
      case 14:
        return (
          <g>
            <line x1="36" y1="54" x2="33" y2="44" stroke="#475569" strokeWidth="2" />
            <line x1="64" y1="54" x2="67" y2="44" stroke="#475569" strokeWidth="2" />
            <circle cx="50" cy="58" r="14" fill="#1e293b" stroke="#000" strokeWidth="1.6" />
            <circle cx="50" cy="58" r="11" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <path d="M 36 58 Q 31 55 36 52" stroke="#000" strokeWidth="1.5" fill="none" />
            <path d="M 64 58 Q 69 55 64 52" stroke="#000" strokeWidth="1.5" fill="none" />
            <text x="50" y="61" fontFamily="monospace" fontSize="6.5" fontWeight="bold" fill="#94a3b8" textAnchor="middle">锅</text>
          </g>
        );
      case 18:
        return (
          <g>
            <path d="M 40 10 L 43 4 L 47 7 L 50 2 L 53 7 L 57 4 L 60 10 Z" fill="#991b1b" stroke="#450a0a" strokeWidth="1.2" />
            <path d="M 44 9 L 46 7 M 55 9 L 57 7" stroke="#000" strokeWidth="0.8" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      className="boss-custom-accessories-svg"
      viewBox="0 0 100 100"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9,
      }}
    >
      {renderAccessories()}
    </svg>
  );
};

export const MonsterVisual: React.FC<MonsterVisualProps> = ({
  state,
  shredProgress = 0,
  shrinkFactor = 1,
  bossHpPercent = 100,
  uploadedPhotoUrl,
  stickerScale = 1,
  stickerOffsetX = 0,
  stickerOffsetY = 0,
  punishmentPreset,
  artPreset = fallbackArt,
  villainPhase = 'arrogant',
  weaknessParts = [],
  playMode = 'turntable',
  activeWhackPart = null,
  activeQtePart = null,
  qteScale = 1,
  onWeaknessClick,
}) => {
  const isLowHp = bossHpPercent <= 35;
  const isKo = state === 'flat_dead' || state === 'flattened';
  const isBurning = state === 'shredding';
  const statusLabel = isKo
    ? '恶业归档'
    : isLowHp
      ? '破防掉皮'
      : bossHpPercent <= 70
        ? '假面开裂'
        : '笑面伪装';

  const match = artPreset.id.match(/_(\d+)$/);
  const levelNum = match ? parseInt(match[1]) : 1;

  const getMorphTransform = (lvl: number) => {
    if ([6, 10, 18].includes(lvl)) return 'scaleX(0.92) scaleY(1.08)';
    if ([5, 11, 17].includes(lvl)) return 'scaleX(1.15) scaleY(0.92)';
    if ([1, 2, 12].includes(lvl)) return 'skewX(-5deg) scaleY(0.96) translateY(2%)';
    if ([3, 7, 16].includes(lvl)) return 'rotate(1deg) scale(1.02) skewY(1deg)';
    return 'scale(1)';
  };

  const getStateTransform = (st: BossSpriteState) => {
    if (st === 'flat_dead' || st === 'flattened') return 'scaleY(0.12) translateY(360%)';
    if (st === 'kneeling' || st === 'apologizing' || st === 'crying') return 'scaleY(0.76) translateY(15%)';
    if (st === 'hit' || st === 'hit_heavy') return 'rotate(8deg) translate(6px, -6px)';
    if (st === 'dizzy') return 'rotate(-3deg) translate(-4px, 4px) skewX(4deg)';
    return '';
  };

  const baseScale = Math.max(0.45, shrinkFactor);
  const morph = getMorphTransform(levelNum);
  const stateTransform = getStateTransform(state);

  const spriteStyle: React.CSSProperties = {
    transform: `scale(${baseScale}) ${morph} ${stateTransform}`,
    opacity: Math.max(0.18, 1 - shredProgress * 0.72),
    filter: getBossFilter(levelNum, isLowHp, isKo, shredProgress),
    transformOrigin: '50% 88%',
    transition: 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
  };

  return (
    <div
      className={`boss-visual-root ${stateClassMap[state]}`}
      style={{
        '--boss-accent': artPreset.accentColor,
        '--boss-ghost': artPreset.ghostColor,
        '--boss-danger': artPreset.dangerColor,
      } as React.CSSProperties}
    >
      <div className="boss-aura" />
      <div className="boss-chain boss-chain-left" />
      <div className="boss-chain boss-chain-right" />

      <div className="boss-title-chip">
        <span>{artPreset.bossTitle}</span>
        <b>{statusLabel}</b>
      </div>

      <div className="boss-sprite-frame" style={spriteStyle}>
        <img
          className="boss-sprite-img"
          src={artPreset.boss.asset}
          alt={artPreset.bossTitle}
          draggable={false}
        />

        {!uploadedPhotoUrl && <GothicAccessoryOverlay level={levelNum} state={state} />}
        {!uploadedPhotoUrl && <AnnoyingFace level={levelNum} state={state} />}

        {uploadedPhotoUrl && (
          <div
            className="boss-photo-sticker"
            aria-label="本地上传的小人照片贴纸"
            style={{
              '--sticker-scale': stickerScale,
              '--sticker-offset-x': `${stickerOffsetX}px`,
              '--sticker-offset-y': `${stickerOffsetY}px`
            } as React.CSSProperties}
          >
            <img src={uploadedPhotoUrl} alt="小人照片贴纸" draggable={false} />
            <span>立案在审</span>
          </div>
        )}

        <div className="boss-crack boss-crack-a" />
        <div className="boss-crack boss-crack-b" />

        <div className="boss-mask-seal">
          <span>{artPreset.boss.maskLabel}</span>
        </div>

        <div className={`boss-phase-seal boss-phase-${villainPhase}`}>
          {villainPhase === 'condemned' ? '定罪' : villainPhase === 'judging' ? '终审' : villainPhase === 'weak' ? '破防' : villainPhase === 'breaking' ? '开裂' : '在审'}
        </div>

        {weaknessParts.map(part => {
          const coord = weaknessCoords[part];
          const isInteractive = (playMode === 'whack' && activeWhackPart === part) || (playMode === 'qte' && activeQtePart === part);
          return (
            <div
              key={part}
              className={`boss-weakness-pin weakness-hit-zone ${playMode === 'whack' && activeWhackPart === part ? 'whack-active' : ''} ${playMode === 'qte' && activeQtePart === part ? 'qte-active' : ''}`}
              style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              data-no-stage-fire="true"
              onClick={(event) => {
                if (!isInteractive || !onWeaknessClick) return;
                event.stopPropagation();
                onWeaknessClick(part);
              }}
            >
              <i />
              {playMode === 'qte' && activeQtePart === part && (
                <em className="qte-timing-ring" style={{ transform: `translate(-50%, -50%) scale(${qteScale})` }} />
              )}
              <span>{BODY_PART_LABELS[part]}</span>
            </div>
          );
        })}

        <div className="boss-paper-tag boss-paper-tag-left">{artPreset.boss.paperTags[0]}</div>
        <div className="boss-paper-tag boss-paper-tag-right">{punishmentPreset?.label || artPreset.boss.paperTags[1]}</div>
        <div className="boss-paper-tag boss-paper-tag-bottom">{artPreset.glyph}业</div>

        {/* Dizzy Stars overlay */}
        {(state === 'dizzy' || state === 'hit_heavy') && (
          <div className="boss-dizzy-stars-container" data-no-stage-fire="true">
            <span className="star-1">💫</span>
            <span className="star-2">⭐</span>
            <span className="star-3">💫</span>
          </div>
        )}

        {/* Crying Tears overlay */}
        {(state === 'crying' || state === 'kneeling' || state === 'apologizing') && (
          <div className="boss-crying-tears-container" data-no-stage-fire="true">
            <span className="tear-left">💧</span>
            <span className="tear-right">💧</span>
          </div>
        )}

        {/* Soul Ghost overlay */}
        {(state === 'flat_dead' || state === 'flattened') && (
          <div className="boss-soul-container" data-no-stage-fire="true">
            <span>👻</span>
          </div>
        )}
      </div>

      <div className="boss-ghost boss-ghost-left" />
      <div className="boss-ghost boss-ghost-right" />

      <div className={`punishment-layer punishment-${punishmentPreset?.theme || 'final_judgement'}`}>
        <span className="punishment-symbol">{punishmentPreset?.emoji || '判'}</span>
        <span className="punishment-stroke">{artPreset.hazard}</span>
      </div>

      {isBurning && (
        <div className="boss-burn-layer">
          <span>业火清算</span>
          <i />
          <i />
          <i />
        </div>
      )}
    </div>
  );
};
