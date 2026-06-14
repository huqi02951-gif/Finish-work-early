/**
 * Types and interfaces for the "Office Frustration Reclamation Station" game.
 */

export type GamePage = 'welcome' | 'select_stress' | 'generate_monster' | 'battle' | 'apology' | 'result';

export type PunishmentTheme =
  | 'tongue_seal'
  | 'scissor_fate'
  | 'iron_tree'
  | 'karma_mirror'
  | 'steam_cage'
  | 'copper_pillar'
  | 'blade_mountain'
  | 'ice_prison'
  | 'oil_cauldron'
  | 'ox_pit'
  | 'stone_crush'
  | 'mortar_loop'
  | 'reputation_pool'
  | 'wronged_city'
  | 'scheme_rift'
  | 'volcano_rage'
  | 'millstone_drag'
  | 'final_judgement';

export interface PunishmentPreset {
  theme: PunishmentTheme;
  emoji: string;
  label: string;
  animationCue: string;
  shortEffect: string;
}

export type UltimateSkin = 'seal' | 'shred' | 'chime';

export type BossSpriteState =
  | 'idle'
  | 'hit'
  | 'hit_heavy'
  | 'dizzy'
  | 'crying'
  | 'kneeling'
  | 'flattened'
  | 'flat_dead'
  | 'shredding'
  | 'apologizing';

export type VillainPhase = 'arrogant' | 'breaking' | 'weak' | 'judging' | 'condemned';

export interface VillainStats {
  evilAura: number;
  karmaSpeech: number;
  fortune: number;
  judgment: number;
  breakLevel: number;
}

export type BodyPart = 'mouth' | 'throat' | 'eyes' | 'hands' | 'back' | 'heart' | 'belly' | 'feet' | 'head' | 'shadow';

export type ObstacleType =
  | 'none'
  | 'presetNeedles'
  | 'blackLines'
  | 'mirror'
  | 'fog'
  | 'shield'
  | 'blades'
  | 'ice'
  | 'bubbles'
  | 'drain'
  | 'pots'
  | 'morphing'
  | 'stains'
  | 'fakeTargets'
  | 'sequence'
  | 'eruption'
  | 'heavyArmor'
  | 'allCombined';

export interface HellLevelMechanic {
  playName: string;
  toolName: string;
  toolIcon: string;
  fireLabel: string;
  hitVerb: string;
  criticalVerb: string;
  finishMove: string;
  dockHint: string;
  coreMechanic: string;
  rotationSpeed: number;
  needleQuota: number;
  weaknessParts: BodyPart[];
  obstacleType: ObstacleType;
  specialRule?: string;
  recommendedWeapons: Weapon['id'][];
  critMultiplier: number;
  timeLimit?: number;
}

export type TargetHitType = 'critical' | 'normal' | 'collision' | 'blocked' | 'miss';

export interface TargetHitResult {
  hitType: TargetHitType;
  part: BodyPart;
  partLabel: string;
  isWeakness: boolean;
  needleCount: number;
  quotaComplete: boolean;
  rotationDegrees: number;
  message: string;
}

export interface BossVisualProfile {
  id: string;
  title: string;
  subtitle: string;
  asset: string;
  accentColor: string;
  ghostColor: string;
  dangerColor: string;
  maskLabel: string;
  paperTags: string[];
  horns: 'short' | 'long' | 'broken' | 'crown';
}

export interface LevelArtPreset {
  id: string;
  levelId: string;
  bossTitle: string;
  bossSubtitle: string;
  stageBackground: string;
  furnaceText: string;
  comboTarget: number;
  ultimateSkin: UltimateSkin;
  accentColor: string;
  ghostColor: string;
  dangerColor: string;
  glyph: string;
  hazard: string;
  boss: BossVisualProfile;
}

export interface HellLevel {
  id: string;
  level: number;
  name: string;
  hellName: string;
  title: string;
  description: string;
  workplaceSin: string;
  sinCategory: '口业' | '心术' | '行为' | '气运' | '终局';
  judge: string;
  tribunal: string;
  bossHp: number;
  difficulty: number;
  disguiseLevel: number;
  threatLabel: string;
  hexagram: string;
  bureauLine: string;
  verdict: string;
  realityReply: string;
  nonSelfFriction: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  emoji: string;
  tags: string[];
  punishment: PunishmentPreset;
  apologies: string[];
  artPresetId?: string;
  bossTitle?: string;
  bossSubtitle?: string;
  stageBackground?: string;
  furnaceText?: string;
  comboTarget?: number;
  ultimateSkin?: UltimateSkin;
}

export interface GameSession {
  monsterName: string;
  uploadedPhotoUrl?: string;
  hasUploadedPhoto: boolean;
  trialMode?: boolean;
  stickerScale?: number;
  stickerOffsetX?: number;
  stickerOffsetY?: number;
}

export type StressType = HellLevel;

export interface MonsterStyle {
  id: string;
  name: string;
  description: string;
  emoji: string;
  colorClass: string;
  tintColor: string;
  hpMultiplier: number;
  archetype: string;
}

export interface Weapon {
  id: 'pin' | 'glove' | 'hammer' | 'stamp' | 'shredder' | 'chime';
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  unlockLevel?: number;
  cost?: number;
  damage: number;
  spGain: number;
  role: 'tag_breaker' | 'combo' | 'heavy' | 'ultimate';
  ultimateCost?: number;
  feedbackTone: 'pierce' | 'punch' | 'smash' | 'seal' | 'shred' | 'freedom';
}

export interface DialogueBubble {
  id: number;
  text: string;
  x: number;
  y: number;
  type: 'apology' | 'toast' | 'xuanxue' | 'attack';
}

export interface CoinParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  type: 'coin' | 'ticket' | 'heart' | 'confetti' | 'beer' | 'bed' | 'clock' | 'freedom';
  color?: string;
}

export interface HistoryRecord {
  id: string;
  monsterName: string;
  stressName: string;
  date: string;
  reliefGain: number;
  meritDelta: number;
  status: string;
  deepestLevel?: number;
  hellName?: string;
  usedPhoto?: boolean;
  sinSummary?: string;
}

export interface BattleMetrics {
  relief: number;
  innerFriction: number;
  boundary: number;
  meritsEarned: number;
  unlockedAmuletsCount: number;
  maxCombo: number;
  ultimatesUsed: number;
  favoriteWeaponId: Weapon['id'];
  tagsDestroyed: number;
  stagesCleared: number;
  highestBossHp: number;
  deepestLevel: number;
  finalHellName: string;
  finalVerdict: string;
  usedPhoto: boolean;
}
