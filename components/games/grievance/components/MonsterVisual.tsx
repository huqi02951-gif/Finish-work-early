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

  const spriteStyle: React.CSSProperties = {
    transform: `scale(${Math.max(0.45, shrinkFactor)})`,
    opacity: Math.max(0.18, 1 - shredProgress * 0.72),
    filter: [
      shredProgress > 0 ? `blur(${shredProgress * 7}px) grayscale(${shredProgress * 65}%)` : '',
      isLowHp ? 'contrast(1.12) saturate(1.12)' : '',
      isKo ? 'grayscale(0.35) brightness(0.85)' : ''
    ].filter(Boolean).join(' ')
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
          return (
            <div
              key={part}
              className="boss-weakness-pin"
              style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
            >
              <i />
              <span>{BODY_PART_LABELS[part]}</span>
            </div>
          );
        })}

        <div className="boss-paper-tag boss-paper-tag-left">{artPreset.boss.paperTags[0]}</div>
        <div className="boss-paper-tag boss-paper-tag-right">{punishmentPreset?.label || artPreset.boss.paperTags[1]}</div>
        <div className="boss-paper-tag boss-paper-tag-bottom">{artPreset.glyph}业</div>
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
