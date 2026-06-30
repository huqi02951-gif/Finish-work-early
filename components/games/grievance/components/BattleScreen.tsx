import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Award, Flame, Shield, Sparkles, Zap } from 'lucide-react';
import {
  BattleMetrics,
  BodyPart,
  BossSpriteState,
  CoinParticle,
  DialogueBubble,
  GameSession,
  MonsterStyle,
  StressType,
  TargetHitResult,
  VillainPhase,
  VillainStats,
  Weapon,
} from '../types';
import { getLevelArtPreset, karmaFurnaceAsset } from '../artPresets';
import { LEVEL2_SANG_QUOTES, MONSTER_STYLES, STRESS_TYPES } from '../data';
import { BODY_PART_LABELS, getLevelMechanic } from '../levelMechanics';
import { MonsterVisual } from './MonsterVisual';
import { SpinningTarget } from './SpinningTarget';

interface BattleScreenProps {
  initialStress: StressType;
  initialMonsterStyle: MonsterStyle;
  initialMonsterName: string;
  initialSession: GameSession;
  maxLevelUnlocked: number;
  onUnlockLevel: (level: number) => void;
  onNext: (results: BattleMetrics & {
    finalStress: StressType;
    finalStyle: MonsterStyle;
    finalName: string;
  }) => void;
}

type WeaponId = Weapon['id'];
type ArenaShot = {
  id: number;
  x: number;
  y: number;
  angle: number;
  length: number;
  icon: string;
};

const TAG_DAMAGE = 1450;
const MAX_DIALOGUES = 5;
const MAX_FX = 42;

interface HitSpark {
  id: number;
  x: number;
  y: number;
  labelText: string;
  emoji: string;
  kind: string;
  rotate: number;
}

const HIT_EFFECTS = [
  { emoji: '👟', label: '飞鞋伺候' },
  { emoji: '🥚', label: '臭蛋暴击' },
  { emoji: '👅', label: '扯长舌头' },
  { emoji: '🔨', label: '正义大锤' },
  { emoji: '💩', label: '天降狗屎' },
  { emoji: '🧹', label: '扫地出门' },
  { emoji: '📌', label: '万针扎心' },
  { emoji: '🔥', label: '业火焚身' },
  { emoji: '⚡', label: '五雷轰顶' },
  { emoji: '🩴', label: '拖鞋抽脸' },
  { emoji: '🥊', label: '社会重拳' },
  { emoji: '🍳', label: '铁锅煎熬' },
] as const;

const getMechanicHelpText = (levelId: string) => {
  switch (levelId) {
    case 'hell_tongue':
      return '指针转到嘴门/话根弱点时发射，一针封口！【新手推荐：玄机小针】';
    case 'hell_scissor':
      return '离间红线阻挡！先点右侧「剪断线结」剪断红线，再扎弱点！';
    case 'hell_iron_tree':
      return '背刺点会在小人身上乱窜，看到红色发光点就直接点击，把暗箭钉回去！';
    case 'hell_mirror':
      return '小人带着白莲假面！先点下方「孽镜照伪」照出真容，再扎真弱点！';
    case 'hell_steam':
      return '热雾油烟遮挡！先点下方「净气符」吹散大雾，弱点才会显露！';
    case 'hell_copper':
      return '小人有铜盾护身！扎中非弱点会损耗铜盾，撞碎铜盾即可破防！';
    case 'hell_blade_mountain':
      return '轮盘上有旋转刀网！算好提前量，等刀刃转过去再扎！';
    case 'hell_ice':
      return '定期冰冻战场！在冰冻状态下无法射击，等冰融化再扎！';
    case 'hell_oil':
      return '油泡阻挡！先用鼠标/手指点破屏幕上的油泡，再发射飞针！';
    case 'hell_ox':
      return '牛坑吸血鬼会吸走功德！扎中弱点触发暴击可打断吸血！';
    case 'hell_stone':
      return '甩锅黑锅满屏飞！等锅子飞开、空挡露出来的时候再射击！';
    case 'hell_mortar':
      return '轮盘忽快忽慢、反向旋转并剧烈抖动！考验你的反应速度！';
    case 'hell_reputation':
      return '弱点被血池污水盖住！先点「擦污名」抹去脏水，再找破绽！';
    case 'hell_wronged':
      return '小心假证陷阱！先点「判笔验真」，有金边的才是真弱点！';
    case 'hell_scheme':
      return '弱点有因果顺序锁！必须按提示顺序依次扎中弱点才能破防！';
    case 'hell_volcano':
      return '火山定期喷发！喷火期间发射的针会被吞掉，等火熄灭再射！';
    case 'hell_millstone':
      return '重甲无法刺穿！长按「长按蓄力」按钮至满格，松开发射磨盘破甲！';
    case 'hell_final':
      return '【阿鼻总清算】终极挑战！所有障碍会交替出现，瞄准嘴/心/背/影！';
    default:
      return '看准指针对准弱点时发射，给小人应有的清算！';
  }
};

const createWeaponUsage = (): Record<WeaponId, number> => ({
  pin: 0,
  glove: 0,
  hammer: 0,
  stamp: 0,
  shredder: 0,
  chime: 0
});

export const BattleScreen: React.FC<BattleScreenProps> = ({
  initialStress,
  initialMonsterStyle,
  initialMonsterName,
  initialSession,
  maxLevelUnlocked,
  onUnlockLevel,
  onNext,
}) => {
  const [selectedStress, setSelectedStress] = useState<StressType>(initialStress);
  const [selectedMonsterStyle, setSelectedMonsterStyle] = useState<MonsterStyle>(initialMonsterStyle);
  const [monsterName] = useState<string>(initialMonsterName || initialSession.monsterName || '这个职场小人');

  const artPreset = useMemo(() => getLevelArtPreset(selectedStress), [selectedStress]);
  const levelMechanic = useMemo(() => getLevelMechanic(selectedStress), [selectedStress]);
  const currentBossHpMax = useMemo(
    () => Math.round(selectedStress.bossHp * selectedMonsterStyle.hpMultiplier),
    [selectedStress.bossHp, selectedMonsterStyle.hpMultiplier]
  );
  const selectedStressIndex = STRESS_TYPES.findIndex(stress => stress.id === selectedStress.id);
  const selectedStyleIndex = MONSTER_STYLES.findIndex(style => style.id === selectedMonsterStyle.id);
  const nextBossStress = STRESS_TYPES[Math.min(STRESS_TYPES.length - 1, (selectedStressIndex < 0 ? 0 : selectedStressIndex) + 1)];
  const isFinalHellLevel = selectedStress.level >= STRESS_TYPES.length;

  const [bossHp, setBossHp] = useState(currentBossHpMax);
  const [bossKo, setBossKo] = useState(false);
  const [villainStats, setVillainStats] = useState<VillainStats>({
    evilAura: 100,
    karmaSpeech: 100,
    fortune: 100,
    judgment: 0,
    breakLevel: 0
  });
  const [showKoStamp, setShowKoStamp] = useState(false);
  const [monsterState, setMonsterState] = useState<BossSpriteState>('idle');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [spGauge, setSpGauge] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [levelMaxCombo, setLevelMaxCombo] = useState(0);
  const [tagsDestroyed, setTagsDestroyed] = useState(0);
  const [stagesCleared, setStagesCleared] = useState(0);
  const [highestBossHp, setHighestBossHp] = useState(currentBossHpMax);
  const [relief, setRelief] = useState(0);
  const [innerFriction, setInnerFriction] = useState(100);
  const [boundary, setBoundary] = useState(30);
  const [merits, setMerits] = useState(100);
  const [weaponUsage, setWeaponUsage] = useState<Record<WeaponId, number>>(createWeaponUsage);
  const [furnaceActive, setFurnaceActive] = useState(false);
  const [furnaceBurns, setFurnaceBurns] = useState(0);
  const [arenaShake, setArenaShake] = useState<'none' | 'light' | 'heavy'>('none');
  const [superFlash, setSuperFlash] = useState<'none' | 'red' | 'cyan' | 'gold'>('none');
  const [shredProgress, setShredProgress] = useState(0);
  const [shrinkFactor, setShrinkFactor] = useState(1);
  const [targetNeedleCount, setTargetNeedleCount] = useState(0);
  const [fireSignal, setFireSignal] = useState(0);
  const [unlockBanner, setUnlockBanner] = useState<string | null>(null);
  const [lockedShakeLevel, setLockedShakeLevel] = useState<number | null>(null);
  const [dialogues, setDialogues] = useState<DialogueBubble[]>([]);
  const [sparks, setSparks] = useState<HitSpark[]>([]);
  const [particles, setParticles] = useState<CoinParticle[]>([]);
  const [arenaShots, setArenaShots] = useState<ArenaShot[]>([]);

  const stageRef = useRef<HTMLDivElement>(null);
  const bossHpRef = useRef(currentBossHpMax);
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preserveRunOnBossChangeRef = useRef(false);
  const drainPausedUntilRef = useRef(0);
  const slapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Slap Bonus & Alternative Modes states
  const [isSlapPhase, setIsSlapPhase] = useState(false);
  const [pinnedParts, setPinnedParts] = useState<BodyPart[]>([]);
  const [slapTimer, setSlapTimer] = useState(5.0);
  const [slapCount, setSlapCount] = useState(0);
  const [slapComplete, setSlapComplete] = useState(false);
  const [slapDone, setSlapDone] = useState(false);
  const [selectedSlapProp, setSelectedSlapProp] = useState('👋');
  
  const [activeWhackPart, setActiveWhackPart] = useState<BodyPart | null>(null);
  const [activeQtePart, setActiveQtePart] = useState<BodyPart | null>(null);
  const [qteScale, setQteScale] = useState(2.5);
  
  interface DeflectItem {
    id: number;
    emoji: string;
    label: string;
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    status: 'falling' | 'deflected' | 'hit_player';
  }
  const [deflectItems, setDeflectItems] = useState<DeflectItem[]>([]);
  const [ultimateActive, setUltimateActive] = useState<'none' | 'shred' | 'seal' | 'chime'>('none');
  const [ultimatesUsedState, setUltimatesUsedState] = useState(0);
  const [, setFogCleared] = useState(false);
  const [, setShieldHp] = useState(3);
  const [, setFrozen] = useState(false);
  const [, setErupting] = useState(false);
  const [, setStainWipeCount] = useState(0);
  const [, setTruthRevealed] = useState(false);

  const getPlayMode = (level: number): 'turntable' | 'whack' | 'qte' | 'clicker' | 'deflect' => {
    if ([1, 2, 6, 12, 18].includes(level)) return 'turntable';
    if ([3, 4, 9, 13, 15].includes(level)) return 'whack';
    if ([7, 8, 14].includes(level)) return 'qte';
    if ([5, 10, 16].includes(level)) return 'clicker';
    return 'deflect'; // levels 11, 17
  };

  const playMode = getPlayMode(selectedStress.level);

  const getSlapPropsForLevel = (lvl: number) => {
    const props = ['👋'];
    if (lvl >= 1) props.push('👟');
    if (lvl >= 2) props.push('🥚');
    if (lvl >= 3) props.push('🧱');
    return props;
  };

  const bossHpPercent = Math.max(0, Math.round((bossHp / currentBossHpMax) * 100));
  const comboTarget = selectedStress.comboTarget || artPreset.comboTarget;
  const currentLevelComboPeak = Math.max(levelMaxCombo, comboCount);
  const settlementReady = bossHp <= 0 && !furnaceActive && !isSlapPhase && !slapComplete && bossKo;
  const villainPhase = useMemo<VillainPhase>(() => {
    if (bossHp <= 0) return 'condemned';
    if (villainStats.judgment >= 92) return 'judging';
    if (bossHpPercent <= 38 || villainStats.breakLevel >= 68) return 'weak';
    if (bossHpPercent <= 72 || villainStats.breakLevel >= 30) return 'breaking';
    return 'arrogant';
  }, [bossHp, bossHpPercent, villainStats.breakLevel, villainStats.judgment]);

  useEffect(() => {
    bossHpRef.current = bossHp;
  }, [bossHp]);

  const pushDialogue = (text: string, x = 50, y = 20, type: DialogueBubble['type'] = 'toast') => {
    const safeX = Math.min(86, Math.max(14, x));
    const safeY = Math.min(86, Math.max(12, y));
    setDialogues(prev => [
      ...prev,
      { id: Date.now() + Math.random(), text, x: safeX, y: safeY, type }
    ].slice(-MAX_DIALOGUES));
  };

  const registerWeaponUse = (weapon: WeaponId) => {
    setWeaponUsage(prev => ({ ...prev, [weapon]: prev[weapon] + 1 }));
  };

  const triggerShake = (intensity: 'light' | 'heavy') => {
    setArenaShake(intensity);
    window.setTimeout(() => setArenaShake('none'), intensity === 'heavy' ? 280 : 160);
  };

  const spawnSpark = (x: number, y: number, labelText: string, kind: string, emoji: string) => {
    const spark = {
      id: Date.now() + Math.random(),
      x,
      y,
      labelText,
      emoji,
      kind,
      rotate: Math.random() * 32 - 16
    };
    setSparks(prev => [...prev, spark].slice(-MAX_FX));
    window.setTimeout(() => setSparks(prev => prev.filter(item => item.id !== spark.id)), 850);
  };

  const spawnBurst = (x: number, y: number, count: number, type: CoinParticle['type'] = 'confetti') => {
    const burst = Array.from({ length: count }, () => ({
      id: Date.now() + Math.random(),
      x: Math.min(92, Math.max(8, x + Math.random() * 14 - 7)),
      y: Math.min(88, Math.max(8, y + Math.random() * 10 - 5)),
      vx: 0,
      vy: 0,
      rotation: Math.random() * 360,
      type,
      color: ['#ef4444', '#f97316', '#facc15', '#34d399', '#38bdf8'][Math.floor(Math.random() * 5)]
    }));
    setParticles(prev => [...prev, ...burst].slice(-MAX_FX));
    window.setTimeout(() => {
      setParticles(prev => prev.filter(item => !burst.some(next => next.id === item.id)));
    }, 1200);
  };

  const fireFromStagePoint = (x: number, y: number) => {
    if (bossHpRef.current <= 0 || furnaceActive) {
      pushDialogue(
        furnaceBurns > 0
          ? '本层已 K.O. 且焚案完成：可以下一层，也可以本层宣判。'
          : '血条已空：先把罪状案卷推进业火炉焚案。',
        50,
        72,
        'toast'
      );
      return;
    }

    const rect = stageRef.current?.getBoundingClientRect();
    const targetX = rect && rect.width < 780 ? 50 : 31;
    const targetY = rect && rect.width < 780 ? 46 : 55;
    const dx = (targetX - x) * (rect?.width || 720) / 100;
    const dy = (targetY - y) * (rect?.height || 680) / 100;
    const shot: ArenaShot = {
      id: Date.now() + Math.random(),
      x,
      y,
      angle: Math.atan2(dy, dx) * 180 / Math.PI,
      length: Math.max(72, Math.min(560, Math.hypot(dx, dy))),
      icon: levelMechanic.toolIcon
    };
    setArenaShots(prev => [...prev, shot].slice(-8));
    window.setTimeout(() => setArenaShots(prev => prev.filter(item => item.id !== shot.id)), 620);
    setFireSignal(prev => prev + 1);
  };

  const showLockedFeedback = (level: number, label = `第 ${level} 层`) => {
    setLockedShakeLevel(level);
    triggerShake('light');
    pushDialogue(`${label} 尚未解封：先把当前层 K.O. 再开下一层案卷。`, 50, 76, 'toast');
    window.setTimeout(() => setLockedShakeLevel(null), 420);
  };

  const unlockNextLevelIfNeeded = () => {
    if (selectedStress.level >= maxLevelUnlocked && selectedStress.level < STRESS_TYPES.length) {
      const nextLevel = selectedStress.level + 1;
      onUnlockLevel(nextLevel);
      const nextName = STRESS_TYPES[nextLevel - 1]?.hellName || '下一层';
      const text = `【新案宗解封】第 ${nextLevel} 层 ${nextName}`;
      setUnlockBanner(text);
      window.setTimeout(() => setUnlockBanner(null), 2200);
    }
  };

  const markKo = () => {
    setBossKo(true);
    setShowKoStamp(true);
    setMonsterState('flat_dead');
    setRelief(100);
    setComboCount(0);
    setVillainStats(prev => ({ ...prev, evilAura: 0, fortune: 0, judgment: 100, breakLevel: 100 }));
    unlockNextLevelIfNeeded();
    pushDialogue('K.O.！小人血条打空，业火炉已解锁，准备焚案。', 52, 18, 'toast');
    window.setTimeout(() => setShowKoStamp(false), 1100);
  };

  const applyDamage = (damage: number, judgmentGain = 7, breakGain = 8) => {
    setVillainStats(prev => {
      const scaledDamage = Math.max(4, Math.round((damage / currentBossHpMax) * 42));
      return {
        evilAura: Math.max(0, prev.evilAura - scaledDamage),
        karmaSpeech: Math.max(0, prev.karmaSpeech - (selectedStress.sinCategory === '口业' ? judgmentGain + 4 : Math.max(3, Math.floor(judgmentGain / 2)))),
        fortune: Math.max(0, prev.fortune - Math.max(3, Math.round((damage / currentBossHpMax) * 30))),
        judgment: Math.min(100, prev.judgment + judgmentGain),
        breakLevel: Math.min(100, prev.breakLevel + breakGain)
      };
    });

    setBossHp(prevHp => {
      const nextHp = Math.max(0, prevHp - damage);
      setInnerFriction(Math.round((nextHp / currentBossHpMax) * 100));
      if (nextHp <= 0 && prevHp > 0) {
        if (!slapDone) {
          window.setTimeout(() => {
            setIsSlapPhase(true);
            setSlapTimer(5.0);
            setSlapCount(0);
            setSlapComplete(false);
            setMonsterState('kneeling');
            pushDialogue('小人血条已空！解锁暴打道具，进入5秒疯狂大巴掌暴打时间！', 50, 70, 'xuanxue');
          }, 200);
        } else {
          window.setTimeout(markKo, 0);
        }
      }
      return nextHp;
    });
  };

  const completeSlappingAndSettle = () => {
    setSlapComplete(false);
    setSlapDone(true);
    const extraMerits = slapCount * (12 + selectedStress.level);
    setMerits(prev => prev + extraMerits);
    pushDialogue(`暴打结算：共掌掴 ${slapCount} 次，额外功德 +${extraMerits.toLocaleString()}！`, 50, 76, 'xuanxue');
    markKo();
  };

  const handleSlapHit = (x: number, y: number) => {
    if (slapTimer <= 0) return;
    setSlapCount(prev => prev + 1);
    setRelief(prev => Math.min(100, prev + 2));
    setMonsterState(Math.random() > 0.5 ? 'hit' : 'hit_heavy');
    triggerShake('light');

    const prop = selectedSlapProp;
    let label = '啪！';
    if (prop === '👟') label = '板鞋抽脸！';
    if (prop === '🥚') label = '臭蛋砸脸！';
    if (prop === '🧱') label = '合同砸头！';

    const meritsEarned = 12 + selectedStress.level;
    spawnSpark(x, y, `${label} 爽感 +2 功德 +${meritsEarned}`, 'punch', prop);
    spawnBurst(x, y, 6, 'confetti');

    if (slapTimeoutRef.current) clearTimeout(slapTimeoutRef.current);
    slapTimeoutRef.current = setTimeout(() => {
      setMonsterState('kneeling');
    }, 180);
  };

  const triggerUltimateMove = () => {
    if (spGauge < 100 || bossHp <= 0 || furnaceActive || isSlapPhase) return;
    
    const ultType = artPreset.ultimateSkin || 'shred';
    setUltimateActive(ultType);
    setSpGauge(0);
    setUltimatesUsedState(prev => prev + 1);
    
    triggerShake('heavy');
    setSuperFlash(ultType === 'seal' ? 'gold' : ultType === 'shred' ? 'red' : 'cyan');
    
    const ultDamage = Math.round(currentBossHpMax * 0.4);
    
    let msg = '';
    if (ultType === 'shred') {
      msg = '释放大招【碎纸龙卷风】：全屏甩锅标签瞬间粉碎，小人心理防线彻底崩溃！';
    } else if (ultType === 'seal') {
      msg = '释放大招【太极因果判官印】：天道好轮回，巨大判章破除小人一切假面！';
    } else {
      msg = '释放大招【净心打工警钟】：警钟长鸣，震碎已读不回、深夜加班一切恶障！';
    }
    pushDialogue(msg, 50, 20, 'xuanxue');
    spawnBurst(50, 40, 25, 'freedom');

    // Wipe obstacles
    setFogCleared(true);
    setShieldHp(0);
    setFrozen(false);
    setErupting(false);
    setStainWipeCount(3);
    setTruthRevealed(true);

    applyDamage(ultDamage, 28, 25);
    setMonsterState('hit_heavy');

    window.setTimeout(() => {
      setUltimateActive('none');
      setSuperFlash('none');
      if (bossHpRef.current > 0) {
        setMonsterState('idle');
      }
    }, 2200);
  };

  const handleWhackClick = (part: BodyPart) => {
    if (bossHp <= 0 || isSlapPhase) return;
    
    const result: TargetHitResult = {
      hitType: 'critical',
      part,
      partLabel: BODY_PART_LABELS[part],
      isWeakness: true,
      needleCount: targetNeedleCount + 1,
      quotaComplete: targetNeedleCount + 1 >= comboTarget,
      rotationDegrees: 0,
      message: `戳破小人弱点【${BODY_PART_LABELS[part]}】！`
    };
    handleTargetHit(result);
    
    const parts = levelMechanic.weaknessParts;
    const filtered = parts.filter(p => p !== part);
    const nextPart = filtered[Math.floor(Math.random() * filtered.length)] || parts[0] || 'mouth';
    setActiveWhackPart(nextPart);
  };

  const handleQteClick = (part: BodyPart) => {
    if (bossHp <= 0 || isSlapPhase) return;
    
    const diff = Math.abs(qteScale - 1.0);
    let hitType: TargetHitResult['hitType'] = 'miss';
    let message = '';
    
    if (diff <= 0.16) {
      hitType = 'critical';
      message = 'PERFECT! 完美反击小人弱点！';
    } else if (diff <= 0.38) {
      hitType = 'normal';
      message = 'GREAT! 打中小人弱点！';
    } else {
      hitType = 'blocked';
      message = 'COOL! 错失节拍，被小人挡下了！';
    }
    
    const result: TargetHitResult = {
      hitType,
      part,
      partLabel: BODY_PART_LABELS[part],
      isWeakness: hitType !== 'blocked',
      needleCount: targetNeedleCount + 1,
      quotaComplete: targetNeedleCount + 1 >= comboTarget,
      rotationDegrees: 0,
      message
    };
    handleTargetHit(result);
    
    const parts = levelMechanic.weaknessParts;
    const filtered = parts.filter(p => p !== part);
    setActiveQtePart(filtered[Math.floor(Math.random() * filtered.length)] || parts[0] || 'mouth');
    setQteScale(2.5);
  };

  const handleDirectClickerHit = (x: number, y: number) => {
    if (bossHp <= 0 || isSlapPhase) return;
    
    const parts = levelMechanic.weaknessParts;
    const part = parts[Math.floor(Math.random() * parts.length)] || 'mouth';
    
    const result: TargetHitResult = {
      hitType: Math.random() > 0.75 ? 'critical' : 'normal',
      part,
      partLabel: BODY_PART_LABELS[part],
      isWeakness: true,
      needleCount: targetNeedleCount + 1,
      quotaComplete: targetNeedleCount + 1 >= comboTarget,
      rotationDegrees: 0,
      message: '暴打小人！'
    };
    handleTargetHit(result);
  };

  const handleDeflectClick = (id: number) => {
    setDeflectItems(prev => prev.map(item => {
      if (item.id === id && item.status === 'falling') {
        recordStrike();
        setSpGauge(s => Math.min(100, s + 15));
        setRelief(r => Math.min(100, r + 5));
        return { ...item, status: 'deflected' as const };
      }
      return item;
    }));
  };

  const recordStrike = () => {
    setComboCount(prev => {
      const next = prev + 1;
      setMaxCombo(current => Math.max(current, next));
      setLevelMaxCombo(current => Math.max(current, next));
      if (next >= comboTarget && next % 4 === 0) {
        setMerits(current => current + 18 + selectedStress.level);
        setBoundary(current => Math.min(100, current + 4));
        pushDialogue(`连击达标 +${next}：笑面话术崩盘，清算值暴涨。`, 50, 74, 'toast');
      }
      return next;
    });

    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => setComboCount(0), 1800);
  };

  const handleTargetHit = (result: TargetHitResult) => {
    setTargetNeedleCount(result.needleCount);

    if (result.hitType === 'collision' || result.hitType === 'blocked' || result.hitType === 'miss') {
      setComboCount(0);
      setMerits(prev => Math.max(0, prev - 4));
      setMonsterState('dizzy');
      triggerShake('light');
      const failEmoji = result.hitType === 'collision' ? '💥' : result.hitType === 'blocked' ? '🛡️' : '💨';
      spawnSpark(50, 46, result.message, 'pin', failEmoji);
      if (selectedStress.level === 2) {
        const sangQuote = LEVEL2_SANG_QUOTES[Math.floor(Math.random() * LEVEL2_SANG_QUOTES.length)];
        pushDialogue(`🧊 ${sangQuote}`, 50, 74, 'toast');
      } else {
        pushDialogue(result.message, 50, 74, 'toast');
      }
      window.setTimeout(() => setMonsterState(bossHpRef.current <= 0 ? 'flat_dead' : 'idle'), 380);
      return;
    }

    // Track pinned weaknesses for Level 1 and Level 2
    if ((selectedStress.level === 1 || selectedStress.level === 2) && result.isWeakness) {
      setPinnedParts(prev => prev.includes(result.part) ? prev : [...prev, result.part]);
    }

    const isCritical = result.hitType === 'critical';
    if (selectedStress.level === 10 && isCritical) {
      drainPausedUntilRef.current = Date.now() + 8000;
      pushDialogue('牛坑吸血被打断：8秒内小人吸不走你的功德。', 50, 70, 'toast');
    }

    const baseDamage = 760 + selectedStress.level * 118 + (comboCount >= 8 ? 320 : 0);
    const precisionDamage = Math.round(baseDamage * (isCritical ? levelMechanic.critMultiplier : 1));
    const quotaDamage = result.quotaComplete ? Math.max(bossHpRef.current, Math.round(currentBossHpMax * 0.2)) : 0;
    const totalDamage = precisionDamage + quotaDamage;
    const x = 24 + Math.random() * 52;
    const y = 24 + Math.random() * 42;

    registerWeaponUse(levelMechanic.recommendedWeapons[0] || 'pin');
    recordStrike();
    setSpGauge(prev => Math.min(100, prev + (isCritical ? 28 : 14)));
    setRelief(prev => Math.min(100, prev + (isCritical ? 8 : 4)));
    setBoundary(prev => Math.min(100, prev + (isCritical ? 5 : 2)));
    setMerits(prev => prev + (isCritical ? 20 : 10) + selectedStress.level);
    setMonsterState(isCritical ? 'hit_heavy' : 'hit');
    triggerShake(isCritical ? 'heavy' : 'light');
    applyDamage(totalDamage, isCritical ? 15 : 7, isCritical ? 14 : 6);
    
    const effect = HIT_EFFECTS[Math.floor(Math.random() * HIT_EFFECTS.length)];
    const sparkText = `${effect.label} -${totalDamage.toLocaleString()}`;
    spawnSpark(x, y, sparkText, isCritical ? 'hammer' : 'pin', effect.emoji);
    spawnBurst(x, y, isCritical ? 14 : 8, isCritical ? 'ticket' : 'confetti');

    // Level 2: inject 丧语录 on successful weakness hits
    if (selectedStress.level === 2 && result.isWeakness) {
      const sangQuote = LEVEL2_SANG_QUOTES[Math.floor(Math.random() * LEVEL2_SANG_QUOTES.length)];
      pushDialogue(`🧊 ${sangQuote}`, 50, 18, 'xuanxue');
    }

    if (result.quotaComplete) {
      setSuperFlash('gold');
      pushDialogue(`${levelMechanic.finishMove}：天曹案卷合页，Boss 进入终审窗口。`, 50, 18, 'xuanxue');
      window.setTimeout(() => setSuperFlash('none'), 680);
    }

    window.setTimeout(() => {
      if (bossHpRef.current <= 0) setMonsterState('flat_dead');
      else if (bossHpRef.current / currentBossHpMax <= 0.38) setMonsterState('kneeling');
      else setMonsterState('idle');
    }, isCritical ? 420 : 220);
  };

  const handleTagPoke = (tagText: string, index: number) => {
    registerWeaponUse(levelMechanic.recommendedWeapons[0] || 'pin');
    recordStrike();
    setActiveTags(prev => prev.filter(tag => tag !== tagText));
    setTagsDestroyed(prev => prev + 1);
    setSpGauge(prev => Math.min(100, prev + 38));
    setRelief(prev => Math.min(100, prev + 12));
    setBoundary(prev => Math.min(100, prev + 12));
    setMerits(prev => prev + 24 + selectedStress.level);
    setMonsterState('hit');
    applyDamage(TAG_DAMAGE + selectedStress.level * 55, 18, 16);
    const x = 24 + (index % 4) * 16;
    const y = 62 + Math.floor(index / 4) * 10;
    spawnSpark(x, y, `撕碎：${tagText}`, 'pin', '👋');
    spawnBurst(x, y, 12, 'ticket');
    pushDialogue(`执念标签「${tagText}」已撕烂，${selectedStress.punishment.shortEffect}。`, 50, 16, 'xuanxue');
  };

  const handleArenaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, input, textarea, select, [data-no-stage-fire="true"]')) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    if (isSlapPhase) {
      handleSlapHit(x, y);
      return;
    }

    if (playMode === 'clicker') {
      handleDirectClickerHit(x, y);
      return;
    }

    fireFromStagePoint(x, y);
  };

  const handleShieldActivation = () => {
    setBoundary(prev => Math.min(100, prev + 28));
    setMerits(prev => prev + 24);
    spawnBurst(50, 55, 12, 'heart');
    pushDialogue('正气护盾打开：不背锅、不接烂摊、不替它内耗。', 50, 76, 'toast');
  };

  const triggerFurnaceBurn = () => {
    if (bossHp > 0) {
      triggerShake('light');
      pushDialogue(`业火炉未开：先把 ${artPreset.bossTitle} 血条打空。`, 50, 76, 'toast');
      return;
    }
    if (furnaceActive) return;

    setFurnaceActive(true);
    setFurnaceBurns(prev => prev + 1);
    setMonsterState('shredding');
    setShredProgress(0.58);
    setShrinkFactor(0.62);
    setSuperFlash('gold');
    setMerits(prev => prev + 120 + selectedStress.level * 16);
    setBoundary(prev => Math.min(100, prev + 10));
    unlockNextLevelIfNeeded();
    triggerShake('heavy');
    spawnBurst(50, 64, 26, 'ticket');
    pushDialogue(`业火炉开：${monsterName} 的罪状案卷、PUA 话术、甩锅合同全部入炉。`, 50, 18, 'xuanxue');

    window.setTimeout(() => {
      setShredProgress(0.16);
      setShrinkFactor(0.8);
    }, 700);
    window.setTimeout(() => {
      setFurnaceActive(false);
      setShredProgress(0);
      setShrinkFactor(1);
      setSuperFlash('none');
      setMonsterState('flat_dead');
      pushDialogue('焚案完成：罪状变灰，判词可宣。', 50, 76, 'toast');
    }, 1650);
  };

  const startNextBoss = () => {
    if (isFinalHellLevel) {
      handleFinalSubmit();
      return;
    }
    if (selectedStress.level + 1 > maxLevelUnlocked && bossHp > 0) {
      showLockedFeedback(selectedStress.level + 1);
      return;
    }
    unlockNextLevelIfNeeded();
    const nextStyleIndex = ((selectedStyleIndex < 0 ? 0 : selectedStyleIndex) + 1) % MONSTER_STYLES.length;
    preserveRunOnBossChangeRef.current = true;
    setStagesCleared(prev => Math.max(prev + 1, selectedStress.level));
    setMerits(prev => prev + 70 + selectedStress.difficulty * 22);
    setBoundary(prev => Math.min(100, prev + 7));
    setSelectedMonsterStyle(MONSTER_STYLES[nextStyleIndex]);
    setSelectedStress(nextBossStress);
  };

  useEffect(() => {
    const preserveRun = preserveRunOnBossChangeRef.current;
    preserveRunOnBossChangeRef.current = false;
    drainPausedUntilRef.current = 0;

    setActiveTags([...selectedStress.tags]);
    setBossHp(currentBossHpMax);
    bossHpRef.current = currentBossHpMax;
    setBossKo(false);
    setVillainStats({
      evilAura: 100,
      karmaSpeech: 100,
      fortune: 100,
      judgment: 0,
      breakLevel: 0
    });
    setShowKoStamp(false);
    setMonsterState('idle');
    setSpGauge(0);
    setComboCount(0);
    setLevelMaxCombo(0);
    setTargetNeedleCount(0);
    setFireSignal(0);
    setUnlockBanner(null);
    setLockedShakeLevel(null);
    setDialogues([]);
    setSparks([]);
    setParticles([]);
    setArenaShots([]);
    setFurnaceActive(false);
    setFurnaceBurns(0);
    setSuperFlash('none');
    setShredProgress(0);
    setShrinkFactor(1);
    setPinnedParts([]);
    setHighestBossHp(prev => preserveRun ? Math.max(prev, currentBossHpMax) : currentBossHpMax);

    setSlapDone(false);
    setIsSlapPhase(false);
    setSlapComplete(false);
    setSlapCount(0);
    setDeflectItems([]);
    setActiveWhackPart(null);
    setActiveQtePart(null);
    setQteScale(2.5);
    setUltimateActive('none');

    if (!preserveRun) {
      setStagesCleared(Math.max(0, selectedStress.level - 1));
      setRelief(0);
      setInnerFriction(100);
      setBoundary(30);
      setMerits(100);
      setMaxCombo(0);
      setTagsDestroyed(0);
      setWeaponUsage(createWeaponUsage());
    }
    const introTimer = window.setTimeout(() => {
      pushDialogue(`第 ${selectedStress.level} 层开庭：${selectedStress.hellName}，Boss 血条 ${currentBossHpMax.toLocaleString()}。`, 50, 16, 'xuanxue');
    }, 0);
    return () => {
      window.clearTimeout(introTimer);
    };
  }, [selectedStress, selectedMonsterStyle, currentBossHpMax]);

  // 1. Slap Countdown Timer useEffect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSlapPhase && slapTimer > 0) {
      interval = setInterval(() => {
        setSlapTimer(prev => {
          if (prev <= 0.1) {
            clearInterval(interval!);
            setIsSlapPhase(false);
            setSlapComplete(true);
            return 0;
          }
          return Number((prev - 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSlapPhase, slapTimer]);

  // 2. Whack-A-Mole Mode Target rotation useEffect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (playMode === 'whack' && bossHp > 0 && !isSlapPhase && !furnaceActive) {
      if (!activeWhackPart) {
        const parts = levelMechanic.weaknessParts;
        const randomPart = parts[Math.floor(Math.random() * parts.length)] || 'mouth';
        setActiveWhackPart(randomPart);
      }

      interval = setInterval(() => {
        const parts = levelMechanic.weaknessParts;
        setActiveWhackPart(current => {
          const filtered = parts.filter(p => p !== current);
          const nextPart = filtered[Math.floor(Math.random() * filtered.length)] || parts[0] || 'mouth';
          pushDialogue('反应慢了！小人弱点已转移！', 50, 74, 'toast');
          setComboCount(0);
          return nextPart;
        });
      }, Math.max(1200, 2400 - selectedStress.level * 80));
    } else {
      setActiveWhackPart(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playMode, activeWhackPart, bossHp, isSlapPhase, furnaceActive, levelMechanic.weaknessParts]);

  // 3. QTE Shrinking Circle Loop useEffect
  useEffect(() => {
    let frameId: number;
    let startTime = performance.now();
    const duration = Math.max(1000, 1800 - selectedStress.level * 60);

    const tick = (now: number) => {
      if (playMode === 'qte' && bossHp > 0 && !isSlapPhase && !furnaceActive) {
        setActiveQtePart(currentPart => {
          if (!currentPart) {
            const parts = levelMechanic.weaknessParts;
            const randomPart = parts[Math.floor(Math.random() * parts.length)] || 'mouth';
            startTime = now;
            return randomPart;
          }
          return currentPart;
        });

        const elapsed = now - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
          setComboCount(0);
          pushDialogue('节拍漏掉！小人防线恢复！', 50, 74, 'toast');
          const parts = levelMechanic.weaknessParts;
          setActiveQtePart(parts[Math.floor(Math.random() * parts.length)] || 'mouth');
          startTime = now;
          setQteScale(2.5);
        } else {
          const currentScale = 2.5 - progress * 1.7;
          setQteScale(currentScale);
        }
        frameId = requestAnimationFrame(tick);
      }
    };

    if (playMode === 'qte' && bossHp > 0 && !isSlapPhase && !furnaceActive) {
      frameId = requestAnimationFrame(tick);
    } else {
      setActiveQtePart(null);
    }
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [playMode, activeQtePart, bossHp, isSlapPhase, furnaceActive, levelMechanic.weaknessParts]);

  // 4. Deflect Mode Projectiles Physics & Spawning useEffect
  useEffect(() => {
    let spawnTimer: NodeJS.Timeout | null = null;
    let animFrame: number;

    if (playMode === 'deflect' && bossHp > 0 && !isSlapPhase && !furnaceActive) {
      const spawn = () => {
        const itemTypes = [
          { emoji: '📄', label: '甩锅文件' },
          { emoji: '📁', label: '烂摊收据' },
          { emoji: '💣', label: 'KPI指标雷' },
          { emoji: '☕', label: '有毒咖啡' }
        ];
        const type = itemTypes[Math.floor(Math.random() * itemTypes.length)]!;
        const newItem: DeflectItem = {
          id: Date.now() + Math.random(),
          emoji: type.emoji,
          label: type.label,
          x: 25 + Math.random() * 50,
          y: 28,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: 0.8 + selectedStress.level * 0.08,
          status: 'falling'
        };
        setDeflectItems(prev => [...prev, newItem].slice(-10));
        spawnTimer = setTimeout(spawn, Math.max(1000, 2500 - selectedStress.level * 80));
      };

      spawnTimer = setTimeout(spawn, 800);

      const update = () => {
        setDeflectItems(prev => {
          return prev.map(item => {
            if (item.status === 'falling') {
              const nextY = item.y + item.speedY;
              if (nextY >= 90) {
                setBoundary(b => Math.max(0, b - 8));
                setComboCount(0);
                pushDialogue(`被「${item.label}」砸中！防线受损 -8！`, 50, 76, 'toast');
                return { ...item, y: nextY, status: 'hit_player' as const };
              }
              return { ...item, y: nextY, x: item.x + item.speedX };
            } else if (item.status === 'deflected') {
              const nextY = item.y - 4.5;
              if (nextY <= 26) {
                applyDamage(850 + selectedStress.level * 120, 10, 10);
                spawnSpark(item.x, item.y, `反弹！${item.label} -${(850 + selectedStress.level * 120).toLocaleString()}`, 'smash', item.emoji);
                setMonsterState('hit');
                setTimeout(() => setMonsterState('idle'), 220);
                return null;
              }
              return { ...item, y: nextY };
            }
            return item;
          }).filter(Boolean) as DeflectItem[];
        });
        animFrame = requestAnimationFrame(update);
      };
      animFrame = requestAnimationFrame(update);
    } else {
      setDeflectItems([]);
    }

    return () => {
      if (spawnTimer) clearTimeout(spawnTimer);
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [playMode, bossHp, isSlapPhase, furnaceActive]);

  useEffect(() => {
    if (selectedStress.level !== 10 || bossHp <= 0 || furnaceActive) return;
    const drainTimer = window.setInterval(() => {
      if (Date.now() < drainPausedUntilRef.current) return;
      setMerits(prev => Math.max(0, prev - 4));
      setVillainStats(prev => ({
        ...prev,
        fortune: Math.min(100, prev.fortune + 2),
        evilAura: Math.min(100, prev.evilAura + 1)
      }));
      pushDialogue('牛坑吸功德：小人又想把你当牛马消耗。', 50, 78, 'toast');
    }, 3000);
    return () => window.clearInterval(drainTimer);
  }, [selectedStress.level, bossHp, furnaceActive]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, button')) return;
      if (event.code !== 'Space') return;
      event.preventDefault();
      fireFromStagePoint(50, 82);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [furnaceActive, furnaceBurns, levelMechanic.toolIcon]);

  const trialTasks = [
    {
      label: '撕标签',
      value: activeTags.length === 0 ? '已撕烂' : `${selectedStress.tags.length - activeTags.length}/${selectedStress.tags.length}`,
      done: activeTags.length === 0
    },
    {
      label: '命中指标',
      value: `${Math.min(targetNeedleCount, levelMechanic.needleQuota)}/${levelMechanic.needleQuota}`,
      done: targetNeedleCount >= levelMechanic.needleQuota
    },
    {
      label: '审判值',
      value: `${villainStats.judgment}/100`,
      done: villainStats.judgment >= 82
    },
    {
      label: '业火焚案',
      value: furnaceBurns > 0 ? '已入炉' : bossHp <= 0 ? '待入炉' : '待KO',
      done: furnaceBurns > 0
    }
  ];
  const trialCharge = Math.round((trialTasks.filter(task => task.done).length / trialTasks.length) * 100);

  return (
    <div
      id="battle_screen_root"
      className="arcade-shell"
      style={{
        '--stage-bg': `url(${artPreset.stageBackground})`,
        '--level-accent': artPreset.accentColor,
        '--level-ghost': artPreset.ghostColor,
        '--level-danger': artPreset.dangerColor,
      } as React.CSSProperties}
    >
      <header className="arcade-topbar">
        <div className="player-plate">
          <div className="player-avatar">{initialSession.hasUploadedPhoto ? '照' : '工'}</div>
          <div>
            <span>打工人 · 自己</span>
            <b>战力 {merits.toLocaleString()}</b>
          </div>
        </div>

        <div className="arcade-title">
          <p>打小人 · 出恶气 · 清业障 · 护自己</p>
          <h1>职场十八层小人清算</h1>
        </div>

        <div className="top-stat-grid">
          <div><span>清算值</span><b>{merits.toLocaleString()}</b></div>
          <div><span>清算劲</span><b>{spGauge}/100</b></div>
        </div>

        {initialSession.trialMode && <div className="trial-mode-ribbon">试炼全开</div>}
      </header>

      <div className="arcade-grid">
        <aside className="hell-rail-panel">
          <div className="panel-kicker">地狱十八层</div>
          <div className="hell-rail-list">
            {STRESS_TYPES.map(level => {
              const isActive = level.id === selectedStress.id;
              const isCleared = level.level <= stagesCleared;
              const isLocked = level.level > maxLevelUnlocked;
              return (
                <button
                  key={level.id}
                  type="button"
                  id={`btn_hell_rail_${level.level}`}
                  onClick={() => {
                    if (isLocked) {
                      showLockedFeedback(level.level);
                      return;
                    }
                    preserveRunOnBossChangeRef.current = false;
                    setSelectedStress(level);
                    setSelectedMonsterStyle(MONSTER_STYLES[(level.level - 1) % MONSTER_STYLES.length]);
                  }}
                  className={`hell-rail-item ${isActive ? 'is-active' : ''} ${isCleared ? 'is-cleared' : ''} ${isLocked ? 'is-locked' : ''} ${lockedShakeLevel === level.level ? 'is-shaking' : ''}`}
                >
                  <span>{isLocked ? '锁' : level.level}</span>
                  <b>
                    {level.hellName}
                    <em>{isLocked ? `通关第 ${level.level - 1} 层` : isActive ? '当前' : isCleared ? '已清算' : '可挑战'}</em>
                  </b>
                </button>
              );
            })}
          </div>
          <div className="final-hell-card">
            <span>阿鼻终局</span>
            <b>{Math.max(stagesCleared, selectedStress.level - 1)}/18</b>
          </div>
        </aside>

        <main
          ref={stageRef}
          className={`battle-stage arena-screenshake-${arenaShake} super-flash-${superFlash}`}
          onClick={handleArenaClick}
          id="battle_stage"
        >
          <div className="stage-bg" />
          <div className="stage-vignette" />
          <div className="stage-fire-hint" data-no-stage-fire="true">
            <b>{levelMechanic.playName}</b>
            <span>{getMechanicHelpText(selectedStress.id)}</span>
          </div>

          {/* Deflect items falling overlay */}
          {playMode === 'deflect' && deflectItems.map(item => {
            if (item.status === 'hit_player') return null;
            return (
              <button
                key={item.id}
                type="button"
                className={`deflect-item-btn ${item.status}`}
                style={{
                  position: 'absolute',
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 40
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeflectClick(item.id);
                }}
              >
                <span className="deflect-emoji">{item.emoji}</span>
                <span className="deflect-label">{item.label}</span>
              </button>
            );
          })}



          {/* Slap Countdown overlay */}
          {isSlapPhase && (
            <div className="slap-countdown-overlay" data-no-stage-fire="true">
              <div className="slap-timer-container">
                <div className="slap-timer-glow" />
                <div className="slap-timer-glow-inner" />
                <span className="slap-title">疯狂大耳光时间！</span>
                <div className="slap-countdown-text">{slapTimer.toFixed(1)}s</div>
                <div className="slap-counter-pill">当前暴打：<b>{slapCount}</b> 次</div>
                <div className="slap-prop-hint">选择道具并在 Boss 脸上疯狂点击！</div>
                <div className="slap-props-dock">
                  {getSlapPropsForLevel(selectedStress.level).map(prop => (
                    <button
                      key={prop}
                      type="button"
                      className={`slap-prop-item ${selectedSlapProp === prop ? 'active' : ''}`}
                      onClick={() => setSelectedSlapProp(prop)}
                    >
                      <span className="prop-emoji">{prop}</span>
                      <span className="prop-label">
                        {prop === '👋' ? '大耳光' : prop === '👟' ? '臭板鞋' : prop === '🥚' ? '臭鸡蛋' : '霸王合同'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <section className="boss-hud">
            <div className="boss-title-row">
              <div>
                <span>第 {selectedStress.level} 层 · {selectedStress.hellName}</span>
                <h2>{artPreset.bossTitle} · {selectedStress.name}</h2>
              </div>
              <b className="threat-multiplier">x{Math.max(1, selectedStress.disguiseLevel)}</b>
            </div>
            <div className="hp-frame">
              <div className="hp-fill" style={{ width: `${bossHpPercent}%` }} />
              <span>{bossHp.toLocaleString()} / {currentBossHpMax.toLocaleString()}</span>
            </div>
            <div className="boss-stat-row" aria-label="小人审判状态">
              {[
                ['恶气', villainStats.evilAura],
                ['口业', villainStats.karmaSpeech],
                ['福报', villainStats.fortune],
                ['审判', villainStats.judgment]
              ].map(([label, value]) => (
                <div key={label} className={label === '审判' ? 'boss-stat is-judgment' : 'boss-stat'}>
                  <span>{label}</span>
                  <i style={{ width: `${value}%` }} />
                  <b>{value}</b>
                </div>
              ))}
            </div>
            <div className="sin-tags">
              {selectedStress.tags.slice(0, 4).map(tag => <span key={tag}>{tag}</span>)}
            </div>
          </section>

          <section className="stage-center">
            <AnimatePresence>
              {showKoStamp && (
                <motion.div
                  className="ko-stamp"
                  initial={{ scale: 2.4, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1, rotate: -6, opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                >
                  K.O. 清算！
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {unlockBanner && (
                <motion.div
                  className="unlock-banner"
                  initial={{ opacity: 0, y: -18, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.94 }}
                >
                  {unlockBanner}
                </motion.div>
              )}
            </AnimatePresence>



            <div className="target-battle-stack">
              {playMode === 'turntable' ? (
                <SpinningTarget
                  mechanic={levelMechanic}
                  disabled={bossHp <= 0 || furnaceActive}
                  accentColor={artPreset.accentColor}
                  dangerColor={artPreset.dangerColor}
                  fireSignal={fireSignal}
                  showInlineButton={false}
                  onHit={handleTargetHit}
                  ultimateActive={ultimateActive !== 'none'}
                />
              ) : (
                <div className="mode-control-panel" data-no-stage-fire="true">
                  <div className="mode-header">
                    <span className="mode-icon">
                      {playMode === 'whack' ? '🎯' : playMode === 'qte' ? '⏱️' : playMode === 'clicker' ? '🥊' : '🛡️'}
                    </span>
                    <div>
                      <h4>{levelMechanic.playName}</h4>
                      <p>{levelMechanic.coreMechanic}</p>
                    </div>
                  </div>

                  <div className="weapon-status-card">
                    <span>当前武器：{levelMechanic.toolName} {levelMechanic.toolIcon}</span>
                    <p>{levelMechanic.dockHint}</p>
                  </div>

                  {selectedStress.level >= 2 && (
                    <div className="ultimate-charge-section">
                      <div className="ult-label">
                        <span>清算大招 (SP)</span>
                        <b style={{ color: spGauge >= 100 ? 'var(--level-danger)' : 'var(--level-accent)' }}>
                          {spGauge}/100
                        </b>
                      </div>
                      <div className="ult-progress-bar">
                        <i style={{ width: `${spGauge}%`, background: spGauge >= 100 ? 'var(--level-danger)' : 'var(--level-accent)' }} />
                      </div>
                      <button
                        type="button"
                        className={`ult-release-btn ${spGauge >= 100 ? 'is-charged animate-pulse' : ''}`}
                        disabled={spGauge < 100 || bossHp <= 0}
                        onClick={triggerUltimateMove}
                      >
                        {spGauge >= 100 ? (
                          <>
                            <Zap className="h-4 w-4 mr-1 animate-bounce" />
                            释放大招！
                          </>
                        ) : (
                          `充能中 (${spGauge}%)`
                        )}
                      </button>
                    </div>
                  )}

                  <div className="mode-guide-alert">
                    <span>操作指南：</span>
                    <p>
                      {playMode === 'whack' && '在Boss身体上直接点击红色发光的弱点区域！'}
                      {playMode === 'qte' && '等金光外圈收缩到与弱点内圈重合时点击弱点！'}
                      {playMode === 'clicker' && '无需瞄准，高频疯狂点击小人即可疯狂殴打！'}
                      {playMode === 'deflect' && '点击天空中飞下来的红线文件/甩锅，反弹回去！'}
                    </p>
                  </div>
                </div>
              )}

              <MonsterVisual
                styleId={selectedMonsterStyle.id}
                state={monsterState}
                shredProgress={shredProgress}
                shrinkFactor={shrinkFactor}
                bossHpPercent={bossHpPercent}
                uploadedPhotoUrl={initialSession.uploadedPhotoUrl}
                stickerScale={initialSession.stickerScale}
                stickerOffsetX={initialSession.stickerOffsetX}
                stickerOffsetY={initialSession.stickerOffsetY}
                punishmentPreset={selectedStress.punishment}
                artPreset={artPreset}
                villainPhase={villainPhase}
                weaknessParts={levelMechanic.weaknessParts}
                playMode={playMode}
                activeWhackPart={activeWhackPart}
                activeQtePart={activeQtePart}
                qteScale={qteScale}
                pinnedParts={pinnedParts}
                onWeaknessClick={playMode === 'whack' ? handleWhackClick : playMode === 'qte' ? handleQteClick : undefined}
              />
            </div>
          </section>

          {activeTags.length > 0 && (
            <section className="active-tag-dock" aria-label="罪状标签">
              {activeTags.map((tag, index) => (
                <button
                  key={tag}
                  type="button"
                  id={`btn_tag_poke_${index}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleTagPoke(tag, index);
                  }}
                >
                  撕 {tag}
                </button>
              ))}
            </section>
          )}

          {sparks.map(spark => (
            <motion.div
              key={spark.id}
              className={`hit-spark hit-spark-${spark.kind}`}
              initial={{ scale: 0.3, y: 15, opacity: 0 }}
              animate={{ scale: [0.3, 1.4, 1], y: -25, opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ left: `${spark.x}%`, top: `${spark.y}%`, rotate: `${spark.rotate}deg` }}
            >
              <div className="flex flex-col items-center justify-center" style={{ pointerEvents: 'none' }}>
                <span className="text-5xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] mb-1 block select-none">
                  {spark.emoji}
                </span>
                <span className="text-xs bg-black/80 px-2 py-0.5 rounded border border-rose-500/40 text-[#ffefc5] font-black uppercase tracking-wide whitespace-nowrap shadow-lg">
                  {spark.labelText}
                </span>
              </div>
            </motion.div>
          ))}

          {arenaShots.map(shot => (
            <span
              key={shot.id}
              className="arena-shot"
              style={{
                left: `${shot.x}%`,
                top: `${shot.y}%`,
                width: `${shot.length}px`,
                rotate: `${shot.angle}deg`
              }}
            >
              <i>{shot.icon}</i>
            </span>
          ))}

          {particles.map(particle => (
            <span
              key={particle.id}
              className="paper-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                color: particle.color,
                rotate: `${particle.rotation}deg`
              }}
            >
              {particle.type === 'coin' ? '功' : particle.type === 'ticket' ? '符' : particle.type === 'heart' ? '护' : particle.type === 'freedom' ? '爽' : '碎'}
            </span>
          ))}

          {dialogues.map(dialogue => (
            <motion.div
              key={dialogue.id}
              className={`battle-bubble battle-bubble-${dialogue.type}`}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: -10, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ left: `${dialogue.x}%`, top: `${dialogue.y}%` }}
            >
              {dialogue.text}
            </motion.div>
          ))}
        </main>

        <aside className="furnace-panel">
          <div className="panel-kicker">小人清算炉</div>
          <div className={`furnace-box ${furnaceActive ? 'is-burning' : ''}`}>
            <img src={karmaFurnaceAsset} alt="业火炉" draggable={false} />
            <div className="furnace-flame-core" />
            <span>{artPreset.furnaceText}</span>
          </div>

          <div className="trial-meter">
            <div className="trial-meter-head">
              <span>本层审判</span>
              <b>{trialCharge}%</b>
            </div>
            <div className="trial-meter-bar"><i style={{ width: `${trialCharge}%` }} /></div>
          </div>

          <div className="trial-task-list">
            {trialTasks.map(task => (
              <div key={task.label} className={`trial-task ${task.done ? 'is-done' : ''}`}>
                <span>{task.done ? '✓' : '✦'}</span>
                <b>{task.label}</b>
                <em>{task.value}</em>
              </div>
            ))}
          </div>

          <div className="reality-script">
            <span>现实防御话术</span>
            <p>{selectedStress.realityReply}</p>
          </div>
        </aside>
      </div>

      <footer className="ritual-dock">
        <div className="ritual-tool-card">
          <div className="ritual-tool-icon">{levelMechanic.toolIcon}</div>
          <div>
            <span>本层玩法 · {levelMechanic.playName}</span>
            <b>{levelMechanic.toolName}</b>
            <p>{levelMechanic.dockHint}</p>
          </div>
        </div>

        <div className="ritual-action-panel">
          <button type="button" onClick={handleShieldActivation} className="ritual-secondary-action">
            <Shield className="h-4 w-4" />
            护自己
          </button>
          {selectedStress.level >= 2 && spGauge >= 100 && (
            <button type="button" onClick={triggerUltimateMove} className="ritual-ult-action animate-pulse">
              <Zap className="h-4 w-4" />
              释放大招
            </button>
          )}
          <button type="button" onClick={triggerFurnaceBurn} className="ritual-fire-action" disabled={bossHp > 0}>
            <Flame className="h-4 w-4" />
            业火炉焚案
          </button>
          <button type="button" onClick={handleFinalSubmit} className="ritual-secondary-action">
            本层宣判
          </button>
          <button type="button" onClick={startNextBoss} className="ritual-next-action" disabled={bossHp > 0}>
            {isFinalHellLevel ? '终局宣判' : '下一层'}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="ritual-stat-strip">
          <span><Award className="h-3.5 w-3.5" /> 清算值 {merits}</span>
          <span><Zap className="h-3.5 w-3.5" /> 命中 {targetNeedleCount}</span>
          <span><Shield className="h-3.5 w-3.5" /> 边界 {boundary}</span>
          <span><Sparkles className="h-3.5 w-3.5" /> 爽感 {relief}%</span>
        </div>
      </footer>

      {/* Fullscreen Ultimate Overlays */}
      {ultimateActive === 'shred' && (
        <div className="ultimate-overlay ult-shred-overlay" data-no-stage-fire="true">
          <div className="shred-vortex-container">
            <div className="vortex-core" />
            <span className="ult-paper paper-1">📄</span>
            <span className="ult-paper paper-2">📁</span>
            <span className="ult-paper paper-3">📄</span>
            <span className="ult-paper paper-4">📝</span>
            <h2 className="ult-txt-shred">碎纸清算风暴！</h2>
          </div>
        </div>
      )}

      {ultimateActive === 'seal' && (
        <div className="ultimate-overlay ult-seal-overlay" data-no-stage-fire="true">
          <div className="seal-container">
            <div className="yin-yang-glow" />
            <div className="massive-seal-stamp">判</div>
            <h2 className="ult-txt-seal">因果清算大印！</h2>
          </div>
        </div>
      )}

      {ultimateActive === 'chime' && (
        <div className="ultimate-overlay ult-chime-overlay" data-no-stage-fire="true">
          <div className="chime-container">
            <div className="bronze-bell">🔔</div>
            <div className="soundwave wave-1" />
            <div className="soundwave wave-2" />
            <div className="soundwave wave-3" />
            <h2 className="ult-txt-chime">净心警钟长鸣！</h2>
          </div>
        </div>
      )}

      {/* Fullscreen Settlement Overlays */}
      <AnimatePresence>
        {settlementReady && (
          <div className="settlement-overlay" data-no-stage-fire="true">
            <motion.section
              className="settlement-modal"
              initial={{ opacity: 0, y: 18, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.94 }}
            >
              <div className="settlement-seal">{isFinalHellLevel ? '终局' : '终审'}</div>
              <span>第 {selectedStress.level} 层已 K.O.</span>
              <h3>{furnaceBurns > 0 ? '罪状已入业火炉' : '血条已空，准备焚案'}</h3>
              <p>
                {furnaceBurns > 0
                  ? `${selectedStress.verdict} 清算值 +${merits.toLocaleString()}，可以继续推进。`
                  : `把「${selectedStress.tags.slice(0, 3).join(' / ')}」推进炉里，烧成灰再判。`}
              </p>
              <div className="settlement-actions">
                <button type="button" className="settlement-fire" onClick={triggerFurnaceBurn} disabled={furnaceBurns > 0}>
                  <Flame className="h-4 w-4" />
                  {furnaceBurns > 0 ? '已焚案' : '业火炉焚案'}
                </button>
                <button type="button" className="settlement-next" onClick={startNextBoss}>
                  {isFinalHellLevel ? '终局宣判' : '下一层'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="settlement-soft" onClick={handleFinalSubmit}>本层宣判</button>
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {slapComplete && (
          <div className="settlement-overlay" data-no-stage-fire="true">
            <motion.section
              className="settlement-modal slap-summary-modal"
              initial={{ opacity: 0, y: 18, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.94 }}
            >
              <div className="settlement-seal">清算</div>
              <span>第 {selectedStress.level} 层暴打完成！</span>
              <h3>共疯狂掌掴 Boss {slapCount} 次</h3>
              <p>获得额外功德奖励：<b>+{(slapCount * (12 + selectedStress.level)).toLocaleString()}</b></p>
              <button type="button" className="settlement-next" onClick={completeSlappingAndSettle}>
                录入清算案卷
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  function handleFinalSubmit() {
    const favoriteWeaponId = (Object.entries(weaponUsage) as [WeaponId, number][])
      .reduce<[WeaponId, number]>((best, entry) => entry[1] > best[1] ? entry : best, ['pin', 0])[0];
    const currentLevelCleared = bossHp <= 0;
    const reportedStagesCleared = Math.max(
      stagesCleared + (currentLevelCleared ? 1 : 0),
      currentLevelCleared ? selectedStress.level : Math.max(0, selectedStress.level - 1)
    );
    const finalDisplayName = monsterName.trim() || initialSession.monsterName || '这个职场小人';

    onNext({
      relief,
      innerFriction: Math.max(0, innerFriction),
      boundary,
      meritsEarned: merits,
      unlockedAmuletsCount: Math.min(5, 2 + tagsDestroyed + furnaceBurns),
      maxCombo: Math.max(maxCombo, comboCount),
      ultimatesUsed: furnaceBurns + ultimatesUsedState,
      favoriteWeaponId,
      tagsDestroyed,
      stagesCleared: reportedStagesCleared,
      highestBossHp,
      deepestLevel: selectedStress.level,
      finalHellName: selectedStress.hellName,
      finalVerdict: selectedStress.verdict,
      usedPhoto: initialSession.hasUploadedPhoto,
      finalStress: selectedStress,
      finalStyle: selectedMonsterStyle,
      finalName: finalDisplayName
    });
  }
};
