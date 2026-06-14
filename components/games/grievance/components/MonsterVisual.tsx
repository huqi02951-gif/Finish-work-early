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

const ProceduralBody: React.FC<{ level: number; state: BossSpriteState }> = ({ level, state }) => {
  const isKo = state === 'flat_dead' || state === 'flattened';
  const isKneeling = state === 'kneeling' || state === 'apologizing' || state === 'crying';
  const isHit = state === 'hit' || state === 'hit_heavy';
  const isDizzy = state === 'dizzy';

  let bodyType: 'standard' | 'bulky' | 'tall' | 'hunched' | 'spiky' = 'standard';
  if ([1, 2, 12].includes(level)) bodyType = 'hunched';
  else if ([5, 11, 17].includes(level)) bodyType = 'bulky';
  else if ([6, 10, 18].includes(level)) bodyType = 'tall';
  else if ([3, 7, 16].includes(level)) bodyType = 'spiky';

  let hornStyle: 'short' | 'long' | 'broken' | 'crown' = 'short';
  if (level >= 15) hornStyle = 'crown';
  else if (level >= 9) hornStyle = 'long';
  else if (level >= 4) hornStyle = 'broken';

  if (isKo) {
    return (
      <svg
        viewBox="0 0 100 100"
        className="boss-sprite-img"
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <ellipse cx="50" cy="88" rx="36" ry="6" fill="#cbd5e1" stroke="#000" strokeWidth="1.8" />
        <ellipse cx="50" cy="88" rx="20" ry="3" fill="#1e293b" opacity="0.6" />
        <ellipse cx="50" cy="84" rx="14" ry="4" fill="#cbd5e1" stroke="#000" strokeWidth="1.5" />
        <path d="M 49 84 L 51 84 L 52 89 L 48 89 Z" fill="#991b1b" stroke="#000" strokeWidth="0.8" />
        <path d="M 22 88 L 32 87 M 68 88 L 78 87 M 42 85 L 45 84" stroke="#000" strokeWidth="1" />
      </svg>
    );
  }

  const hx = 50;
  const hy = isKneeling ? 32 : 22;
  const hr = 11.5;

  let sLy = isKneeling ? 46 : (bodyType === 'hunched' ? 36 : 42);
  let sRy = isKneeling ? 46 : (bodyType === 'hunched' ? 36 : 42);
  let sLx = bodyType === 'bulky' ? 30 : (bodyType === 'tall' ? 38 : 34);
  let sRx = bodyType === 'bulky' ? 70 : (bodyType === 'tall' ? 62 : 66);

  if (bodyType === 'spiky' && !isKneeling) {
    sLy -= 4;
    sRy -= 4;
  }

  const bLy = isKneeling ? 72 : 78;
  const bRy = isKneeling ? 72 : 78;
  const bLx = bodyType === 'bulky' ? 32 : (bodyType === 'tall' ? 39 : 36);
  const bRx = bodyType === 'bulky' ? 68 : (bodyType === 'tall' ? 61 : 64);

  let handLx = sLx - 14;
  let handLy = sLy + 10;
  let handRx = sRx + 14;
  let handRy = sRy + 10;

  if (isHit) {
    handLx = sLx - 18;
    handLy = sLy - 15;
    handRx = sRx + 18;
    handRy = sRy - 15;
  } else if (isDizzy) {
    handLx = sLx - 4;
    handLy = sLy + 18;
    handRx = sRx + 4;
    handRy = sRy + 18;
  } else if (isKneeling) {
    handLx = hx - 6;
    handLy = hy + 6;
    handRx = hx + 6;
    handRy = hy + 6;
  }

  const transform = isHit ? 'rotate(8 50 50) translate(2, -2)' : '';

  const renderHorns = () => {
    switch (hornStyle) {
      case 'crown':
        return (
          <g>
            <path d={`M ${hx - 8} ${hy - 8} L ${hx - 12} ${hy - 14} L ${hx - 4} ${hy - 11} L ${hx} ${hy - 18} L ${hx + 4} ${hy - 11} L ${hx + 12} ${hy - 14} L ${hx + 8} ${hy - 8} Z`} fill="#fbbf24" stroke="#000" strokeWidth="1.2" />
            <path d={`M ${hx - 10} ${hy - 8} Q ${hx} ${hy - 5} ${hx + 10} ${hy - 8}`} fill="none" stroke="#000" strokeWidth="1" />
          </g>
        );
      case 'long':
        return (
          <g stroke="#000" strokeWidth="1.8" fill="#cbd5e1" strokeLinejoin="round">
            <path d={`M ${hx - 5} ${hy - 8} C ${hx - 14} ${hy - 20}, ${hx - 20} ${hy - 12}, ${hx - 18} ${hy - 15} C ${hx - 14} ${hy - 10}, ${hx - 8} ${hy - 9}, ${hx - 2} ${hy - 8}`} />
            <path d={`M ${hx + 5} ${hy - 8} C ${hx + 14} ${hy - 20}, ${hx + 20} ${hy - 12}, ${hx + 18} ${hy - 15} C ${hx + 14} ${hy - 10}, ${hx + 8} ${hy - 9}, ${hx + 2} ${hy - 8}`} />
          </g>
        );
      case 'broken':
        return (
          <g stroke="#000" strokeWidth="1.8" fill="#cbd5e1" strokeLinejoin="round">
            <path d={`M ${hx - 5} ${hy - 8} Q ${hx - 10} ${hy - 16} ${hx - 12} ${hy - 14} Q ${hx - 8} ${hy - 10} ${hx - 2} ${hy - 8}`} />
            <path d={`M ${hx + 2} ${hy - 8} L ${hx + 7} ${hy - 10} L ${hx + 6} ${hy - 7} Z`} />
          </g>
        );
      case 'short':
      default:
        return (
          <g stroke="#000" strokeWidth="1.8" fill="#cbd5e1" strokeLinejoin="round">
            <path d={`M ${hx - 5} ${hy - 8} Q ${hx - 9} ${hy - 14} ${hx - 10} ${hy - 12} Q ${hx - 7} ${hy - 9} ${hx - 2} ${hy - 8}`} />
            <path d={`M ${hx + 5} ${hy - 8} Q ${hx + 9} ${hy - 14} ${hx + 10} ${hy - 12} Q ${hx + 7} ${hy - 9} ${hx + 2} ${hy - 8}`} />
          </g>
        );
    }
  };

  const renderArms = () => {
    let sleeveColor = '#cbd5e1';
    if (level === 2) sleeveColor = '#cbd5e1';
    else if (level === 3) sleeveColor = '#334155';
    else if (level === 4) sleeveColor = '#1e293b';
    else if (level === 6) sleeveColor = '#1e1b4b';
    else if (level === 7) sleeveColor = '#475569';
    else if (level === 10) sleeveColor = '#1e293b';
    else if (level === 11) sleeveColor = '#64748b';
    else if (level === 15) sleeveColor = '#1e293b';
    else if (level === 16) sleeveColor = '#7f1d1d';
    else if (level === 18) sleeveColor = '#1e293b';

    return (
      <g stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M ${sLx} ${sLy} Q ${(sLx + handLx) / 2} ${(sLy + handLy) / 2 - 3} ${handLx} ${handLy}`} fill="none" stroke={sleeveColor} strokeWidth="6" />
        <path d={`M ${sLx} ${sLy} Q ${(sLx + handLx) / 2} ${(sLy + handLy) / 2 - 3} ${handLx} ${handLy}`} fill="none" stroke="#000" strokeWidth="1.8" />
        <circle cx={handLx} cy={handLy} r="3" fill="#f1f5f9" stroke="#000" strokeWidth="1.5" />

        <path d={`M ${sRx} ${sRy} Q ${(sRx + handRx) / 2} ${(sRy + handRy) / 2 - 3} ${handRx} ${handRy}`} fill="none" stroke={level === 4 ? '#cbd5e1' : sleeveColor} strokeWidth="6" />
        <path d={`M ${sRx} ${sRy} Q ${(sRx + handRx) / 2} ${(sRy + handRy) / 2 - 3} ${handRx} ${handRy}`} fill="none" stroke="#000" strokeWidth="1.8" />
        <circle cx={handRx} cy={handRy} r="3" fill="#f1f5f9" stroke="#000" strokeWidth="1.5" />
      </g>
    );
  };

  const renderLegs = () => {
    let pantsColor = '#cbd5e1';
    if (level === 3 || level === 15 || level === 18) pantsColor = '#1e293b';
    else if (level === 6) pantsColor = '#1f2937';
    else if (level === 7) pantsColor = '#334155';
    else if (level === 10) pantsColor = '#0f172a';
    else if (level === 11) pantsColor = '#475569';

    if (isKneeling) {
      return (
        <g stroke="#000" strokeWidth="1.8" fill={pantsColor} strokeLinecap="round" strokeLinejoin="round">
          <path d={`M ${bLx + 3} ${bLy} Q ${bLx - 2} ${bLy + 6} ${bLx + 2} ${bLy + 8} L ${bLx + 12} ${bLy + 8}`} />
          <path d={`M ${bRx - 3} ${bRy} Q ${bRx + 2} ${bRy + 6} ${bRx - 2} ${bRy + 8} L ${bRx - 12} ${bLy + 8}`} />
          <path d={`M ${bLx - 1} ${bLy + 8} L ${bLx - 4} ${bLy + 7} L ${bLx - 3} ${bLy + 5} Z`} fill="#1e293b" stroke="#000" strokeWidth="1" />
          <path d={`M ${bRx + 1} ${bRy + 8} L ${bRx + 4} ${bRy + 7} L ${bRx + 3} ${bRy + 5} Z`} fill="#1e293b" stroke="#000" strokeWidth="1" />
        </g>
      );
    }

    return (
      <g stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1={bLx + 3} y1={bLy} x2={bLx + 3} y2={88} stroke={pantsColor} strokeWidth="5" />
        <line x1={bLx + 3} y1={bLy} x2={bLx + 3} y2={88} stroke="#000" strokeWidth="1.8" />
        <path d={`M ${bLx - 1} 88 L ${bLx + 6} 88 L ${bLx + 4} 91 L ${bLx - 3} 91 Z`} fill="#1e293b" stroke="#000" strokeWidth="1.5" />

        <line x1={bRx - 3} y1={bRy} x2={bRx - 3} y2={88} stroke={pantsColor} strokeWidth="5" />
        <line x1={bRx - 3} y1={bRy} x2={bRx - 3} y2={88} stroke="#000" strokeWidth="1.8" />
        <path d={`M ${bRx - 6} 88 L ${bRx + 1} 88 L ${bRx + 3} 91 L ${bRx - 4} 91 Z`} fill="#1e293b" stroke="#000" strokeWidth="1.5" />
      </g>
    );
  };

  const renderTorsoAndOutfit = () => {
    let baseFill = '#cbd5e1';
    let outlineStroke = '#000';

    const drawBaseTorso = (fillColor: string, strokeColor: string, strokeW: number) => {
      if (bodyType === 'bulky') {
        return (
          <path
            d={`M ${sLx} ${sLy} L ${sRx} ${sRy} C ${sRx + 10} ${sLy + 12}, ${sRx + 10} ${bLy - 6}, ${bRx} ${bLy} C ${(bRx+bLx)/2} ${bLy+2}, ${(bRx+bLx)/2} ${bLy+2}, ${bLx} ${bLy} C ${sLx - 10} ${bLy - 6}, ${sLx - 10} ${sLy + 12}, ${sLx} ${sLy} Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
        );
      }
      if (bodyType === 'hunched') {
        return (
          <path
            d={`M ${sLx} ${sLy} C ${(sLx+sRx)/2} ${sLy + 8}, ${(sLx+sRx)/2} ${sLy + 8}, ${sRx} ${sRy} L ${bRx} ${bLy} C ${(bRx+bLx)/2} ${bLy+2}, ${(bRx+bLx)/2} ${bLy+2}, ${bLx} ${bLy} Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
        );
      }
      return (
        <path
          d={`M ${sLx} ${sLy} L ${sRx} ${sRy} L ${bRx} ${bLy} L ${bLx} ${bLy} Z`}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeW}
          strokeLinejoin="round"
        />
      );
    };

    const renderOutfitDetails = () => {
      const items = [];
      const cx = 50;
      const cy = (sLy + bLy) / 2;

      const renderCollarAndTie = (tieColor = '#991b1b', collarColor = '#f1f5f9') => {
        return (
          <g key="collar-tie">
            <path d={`M ${cx - 5} ${sLy} L ${cx} ${sLy + 6} L ${cx + 5} ${sLy}`} fill={collarColor} stroke="#000" strokeWidth="1.2" />
            <path d={`M ${cx - 1.5} ${sLy + 4} L ${cx + 1.5} ${sLy + 4} L ${cx + 3} ${sLy + 18} L ${cx} ${sLy + 21} L ${cx - 3} ${sLy + 18} Z`} fill={tieColor} stroke="#000" strokeWidth="0.8" />
          </g>
        );
      };

      if (level === 1) {
        items.push(renderCollarAndTie('#64748b'));
        items.push(
          <g key="sticky-notes">
            <rect x="38" y="48" width="6" height="6" fill="#fef08a" stroke="#000" strokeWidth="0.8" transform="rotate(-10 41 51)" />
            <rect x="56" y="52" width="5" height="5" fill="#fef08a" stroke="#000" strokeWidth="0.8" transform="rotate(15 58 54)" />
            <rect x="42" y="62" width="6" height="5" fill="#fef08a" stroke="#000" strokeWidth="0.8" transform="rotate(5 45 64)" />
          </g>
        );
      } else if (level === 2) {
        items.push(
          <g key="vest">
            <path d={`M ${sLx} ${sLy} L ${cx} ${sLy + 8} L ${cx} ${bLy} L ${bLx} ${bLy} Z`} fill="#475569" stroke="#000" strokeWidth="1.2" />
            <path d={`M ${sRx} ${sRy} L ${cx} ${sLy + 8} L ${cx} ${bLy} L ${bRx} ${bLy} Z`} fill="#475569" stroke="#000" strokeWidth="1.2" />
            <path d={`M ${cx} ${sLy + 8} L ${cx} ${bLy}`} stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2,2" />
          </g>
        );
      } else if (level === 3) {
        items.push(renderCollarAndTie('#991b1b', '#cbd5e1'));
        items.push(
          <g key="spikes" stroke="#000" strokeWidth="1.2">
            <line x1={sLx + 4} y1={sLy + 8} x2={sLx - 2} y2={sLy + 6} />
            <line x1={sRx - 4} y1={sRy + 8} x2={sRx + 2} y2={sRy + 6} />
            <line x1={cx - 8} y1={cy} x2={cx - 12} y2={cy - 4} />
            <line x1={cx + 8} y1={cy} x2={cx + 12} y2={cy + 4} />
          </g>
        );
      } else if (level === 4) {
        items.push(
          <g key="yin-yang-lapels">
            <path d={`M 50 ${sLy} L 45 ${sLy + 8} L 50 ${sLy + 12} Z`} fill="#cbd5e1" stroke="#000" strokeWidth="1" />
            <path d={`M 50 ${sLy} L 55 ${sLy + 8} L 50 ${sLy + 12} Z`} fill="#1e293b" stroke="#000" strokeWidth="1" />
            <circle cx="46" cy="56" r="1.2" fill="#fff" />
            <circle cx="54" cy="56" r="1.2" fill="#000" />
          </g>
        );
      } else if (level === 5) {
        items.push(
          <g key="chef-buttons">
            <path d={`M 50 ${sLy} L 44 ${sLy + 6} L 48 ${sLy + 10} Z`} fill="#fff" stroke="#000" strokeWidth="1" />
            <circle cx="45" cy="53" r="1.5" fill="#000" />
            <circle cx="55" cy="53" r="1.5" fill="#000" />
            <circle cx="45" cy="62" r="1.5" fill="#000" />
            <circle cx="55" cy="62" r="1.5" fill="#000" />
          </g>
        );
      } else if (level === 6) {
        items.push(
          <g key="military-coat">
            <path d={`M ${sLx - 1} ${sLy - 2} L ${sLx + 6} ${sLy - 1} L ${sLx + 4} ${sLy + 3} L ${sLx - 2} ${sLy + 2} Z`} fill="#eab308" stroke="#000" strokeWidth="1" />
            <path d={`M ${sRx + 1} ${sRy - 2} L ${sRx - 6} ${sRy - 1} L ${sRx - 4} ${sRy + 3} L ${sRx + 2} ${sRy + 2} Z`} fill="#eab308" stroke="#000" strokeWidth="1" />
            <rect x="46" y="52" width="8" height="11" fill="#eab308" stroke="#000" strokeWidth="1.2" rx="0.5" />
            <rect x="48" y="54" width="4" height="4" fill="#fff" />
            <line x1="46" y1="52" x2="50" y2="45" stroke="#000" strokeWidth="1" />
          </g>
        );
      } else if (level === 7) {
        items.push(renderCollarAndTie('#ea580c', '#f1f5f9'));
        items.push(
          <g key="cuts" stroke="#000" strokeWidth="1">
            <path d="M 38 52 L 48 56 L 46 58 L 36 54 Z" fill="#ef4444" />
            <path d="M 52 64 L 62 60 L 61 62 L 53 66 Z" fill="#ef4444" />
          </g>
        );
      } else if (level === 8) {
        items.push(
          <g key="puffer-segs" stroke="#000" strokeWidth="1.2">
            <path d={`M ${sLx + 2} 50 Q 50 52 ${sRx - 2} 50`} fill="none" />
            <path d={`M ${bLx + 1} 60 Q 50 62 ${bRx - 1} 60`} fill="none" />
            <path d={`M ${bLx + 2} 70 Q 50 72 ${bRx - 2} 70`} fill="none" />
          </g>
        );
      } else if (level === 9) {
        items.push(
          <g key="apron">
            <path d="M 42 46 L 58 46 L 60 74 L 40 74 Z" fill="#b45309" stroke="#000" strokeWidth="1.2" />
            <line x1="42" y1="46" x2={sLx} y2={sLy} stroke="#000" strokeWidth="1.2" />
            <line x1="58" y1="46" x2={sRx} y2={sRy} stroke="#000" strokeWidth="1.2" />
            <circle cx="46" cy="56" r="3.5" fill="#78350f" opacity="0.6" />
          </g>
        );
      } else if (level === 10) {
        items.push(renderCollarAndTie('#ef4444', '#1e293b'));
      } else if (level === 11) {
        items.push(
          <g key="stone-crush">
            <ellipse cx="50" cy={sLy - 2} rx="22" ry="12" fill="#475569" stroke="#000" strokeWidth="1.5" />
            <text x="50" y={sLy + 2} fontFamily="sans-serif" fontWeight="bold" fontSize="9" fill="#000" textAnchor="middle" dominantBaseline="middle">锅</text>
          </g>
        );
      } else if (level === 12) {
        items.push(
          <g key="pj-stripes" stroke="#94a3b8" strokeWidth="1.5">
            <line x1="42" y1={sLy} x2="42" y2={bLy} />
            <line x1="48" y1={sLy} x2="48" y2={bLy} />
            <line x1="54" y1={sLy} x2="54" y2={bLy} />
            <line x1="60" y1={sLy} x2="60" y2={bLy} />
          </g>
        );
      } else if (level === 13) {
        items.push(
          <g key="ink-splats">
            <path d="M 42 52 Q 44 48 48 50 Q 52 54 46 58 Z" fill="#0f172a" />
            <circle cx="56" cy="62" r="3" fill="#0f172a" />
            <circle cx="38" cy="60" r="1.5" fill="#0f172a" />
          </g>
        );
      } else if (level === 14) {
        items.push(
          <g key="wok">
            <circle cx="50" cy="60" r="13" fill="#1e293b" stroke="#000" strokeWidth="1.5" />
            <circle cx="50" cy="60" r="11" fill="#0f172a" />
            <path d="M 37 60 Q 34 57 37 54" fill="none" stroke="#000" strokeWidth="1.2" />
            <path d="M 63 60 Q 66 57 63 54" fill="none" stroke="#000" strokeWidth="1.2" />
            <line x1="37" y1="60" x2={sLx} y2={sLy} stroke="#000" strokeWidth="1.5" />
            <line x1="63" y1="60" x2={sRx} y2={sRy} stroke="#000" strokeWidth="1.5" />
          </g>
        );
      } else if (level === 15) {
        items.push(renderCollarAndTie('#475569', '#1e293b'));
        items.push(
          <g key="cobweb" stroke="#475569" strokeWidth="0.8">
            <line x1="50" y1="60" x2="38" y2="48" />
            <line x1="50" y1="60" x2="62" y2="48" />
            <line x1="50" y1="60" x2="36" y2="72" />
            <line x1="50" y1="60" x2="64" y2="72" />
            <path d="M 45 56 C 47 54 53 54 55 56" fill="none" />
            <path d="M 42 52 C 45 49 55 49 58 52" fill="none" />
          </g>
        );
      } else if (level === 16) {
        items.push(
          <g key="fire-collar">
            <path d={`M ${cx - 6} ${sLy} L ${cx} ${sLy + 8} L ${cx + 6} ${sLy} Z`} fill="#f97316" stroke="#ef4444" strokeWidth="1" />
            <path d="M 44 44 L 46 36 L 48 42 L 50 34 L 52 42 L 54 36 L 56 44" fill="none" stroke="#f97316" strokeWidth="1.5" />
          </g>
        );
      } else if (level === 17) {
        items.push(
          <g key="patchwork">
            <rect x="38" y="52" width="10" height="10" fill="#b45309" stroke="#000" strokeWidth="0.8" strokeDasharray="2,2" />
            <rect x="52" y="62" width="8" height="8" fill="#475569" stroke="#000" strokeWidth="0.8" strokeDasharray="2,2" />
          </g>
        );
      } else if (level === 18) {
        items.push(
          <g key="torn-suit">
            <path d="M 36 60 L 44 64 L 42 66 L 36 62 Z" fill="#b91c1c" stroke="#000" strokeWidth="0.8" />
            <path d="M 64 56 L 56 60 L 58 62 L 64 58 Z" fill="#b91c1c" stroke="#000" strokeWidth="0.8" />
            <path d={`M ${cx - 5} ${sLy} L ${cx} ${sLy + 6} L ${cx + 5} ${sLy}`} fill="#cbd5e1" stroke="#000" strokeWidth="1.2" />
            <path d={`M ${cx - 1.5} ${sLy + 4} L ${cx + 1.5} ${sLy + 4} L ${cx + 2} ${sLy + 12} L ${cx - 2} ${sLy + 13} Z`} fill="#991b1b" stroke="#000" strokeWidth="1" />
          </g>
        );
      } else {
        items.push(renderCollarAndTie());
      }

      return items;
    };

    if (level === 4) {
      baseFill = '#cbd5e1';
    } else if (level === 3 || level === 15 || level === 18) {
      baseFill = '#334155';
    } else if (level === 6) {
      baseFill = '#1e1b4b';
    } else if (level === 7) {
      baseFill = '#475569';
    } else if (level === 10) {
      baseFill = '#1e293b';
    } else if (level === 11) {
      baseFill = '#64748b';
    } else if (level === 16) {
      baseFill = '#7f1d1d';
    }

    return (
      <g transform={transform}>
        {drawBaseTorso(baseFill, outlineStroke, 1.8)}
        {renderOutfitDetails()}
      </g>
    );
  };

  const renderHeadAndHorns = () => {
    return (
      <g transform={isHit ? 'rotate(8 50 50) translate(2, -2)' : ''}>
        {renderHorns()}
        <line x1="50" y1={hy} x2="50" y2={sLy + 4} stroke="#000" strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1={hy} x2="50" y2={sLy + 4} stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={hr} fill="#f1f5f9" stroke="#000" strokeWidth="1.8" />
        {level === 12 && (
          <path d={`M ${hx - 12} ${hy - 6} Q ${hx - 16} ${hy - 12} ${hx - 12} ${hy - 10} Q ${hx - 15} ${hy - 4} ${hx - 10} ${hy - 2}`} fill="none" stroke="#000" strokeWidth="1.5" />
        )}
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className="boss-sprite-img"
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {renderLegs()}
      {renderArms()}
      {renderTorsoAndOutfit()}
      {renderHeadAndHorns()}
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

  const spriteStyle: React.CSSProperties = {
    transform: `scale(${Math.max(0.45, shrinkFactor)})`,
    opacity: Math.max(0.18, 1 - shredProgress * 0.72),
    filter: getBossFilter(levelNum, isLowHp, isKo, shredProgress)
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
        {uploadedPhotoUrl ? (
          <img
            className="boss-sprite-img"
            src={artPreset.boss.asset}
            alt={artPreset.bossTitle}
            draggable={false}
          />
        ) : (
          <ProceduralBody level={levelNum} state={state} />
        )}

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
              className={`boss-weakness-pin ${playMode === 'whack' && activeWhackPart === part ? 'whack-active' : ''} ${playMode === 'qte' && activeQtePart === part ? 'qte-active' : ''}`}
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
