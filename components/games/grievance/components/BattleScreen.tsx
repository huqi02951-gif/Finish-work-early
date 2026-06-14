import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Award, Flame, Shield, Sparkles, Zap } from 'lucide-react';
import {
  BattleMetrics,
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
import { MONSTER_STYLES, STRESS_TYPES } from '../data';
import { getLevelMechanic } from '../levelMechanics';
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
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; text: string; kind: string; rotate: number }[]>([]);
  const [particles, setParticles] = useState<CoinParticle[]>([]);
  const [arenaShots, setArenaShots] = useState<ArenaShot[]>([]);

  const stageRef = useRef<HTMLDivElement>(null);
  const bossHpRef = useRef(currentBossHpMax);
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preserveRunOnBossChangeRef = useRef(false);
  const drainPausedUntilRef = useRef(0);

  const bossHpPercent = Math.max(0, Math.round((bossHp / currentBossHpMax) * 100));
  const comboTarget = selectedStress.comboTarget || artPreset.comboTarget;
  const currentLevelComboPeak = Math.max(levelMaxCombo, comboCount);
  const settlementReady = bossHp <= 0 && !furnaceActive;
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

  const spawnSpark = (x: number, y: number, text: string, kind: string) => {
    const spark = {
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      kind,
      rotate: Math.random() * 24 - 12
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
      if (nextHp <= 0 && prevHp > 0) window.setTimeout(markKo, 0);
      return nextHp;
    });
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
      spawnSpark(50, 46, result.message, 'pin');
      pushDialogue(result.message, 50, 74, 'toast');
      window.setTimeout(() => setMonsterState(bossHpRef.current <= 0 ? 'flat_dead' : 'idle'), 380);
      return;
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

    registerWeaponUse('pin');
    recordStrike();
    setSpGauge(prev => Math.min(100, prev + (isCritical ? 28 : 14)));
    setRelief(prev => Math.min(100, prev + (isCritical ? 8 : 4)));
    setBoundary(prev => Math.min(100, prev + (isCritical ? 5 : 2)));
    setMerits(prev => prev + (isCritical ? 20 : 10) + selectedStress.level);
    setMonsterState(isCritical ? 'hit_heavy' : 'hit');
    triggerShake(isCritical ? 'heavy' : 'light');
    applyDamage(totalDamage, isCritical ? 15 : 7, isCritical ? 14 : 6);
    spawnSpark(x, y, `${result.message} -${totalDamage.toLocaleString()}`, isCritical ? 'hammer' : 'pin');
    spawnBurst(x, y, isCritical ? 14 : 8, isCritical ? 'ticket' : 'confetti');

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
    registerWeaponUse('pin');
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
    spawnSpark(x, y, `撕碎：${tagText}`, 'pin');
    spawnBurst(x, y, 12, 'ticket');
    pushDialogue(`执念标签「${tagText}」已撕烂，${selectedStress.punishment.shortEffect}。`, 50, 16, 'xuanxue');
  };

  const handleArenaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, input, textarea, select, [data-no-stage-fire="true"]')) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
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
    setHighestBossHp(prev => preserveRun ? Math.max(prev, currentBossHpMax) : currentBossHpMax);

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
    return () => window.clearTimeout(introTimer);
  }, [selectedStress, selectedMonsterStyle, currentBossHpMax]);

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
            <span>点击战场任意位置发射 · 空格快捷打小人</span>
          </div>

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

            <AnimatePresence>
              {settlementReady && (
                <motion.section
                  className="settlement-modal"
                  data-no-stage-fire="true"
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
              )}
            </AnimatePresence>

            <div className="target-battle-stack">
              <SpinningTarget
                mechanic={levelMechanic}
                disabled={bossHp <= 0 || furnaceActive}
                accentColor={artPreset.accentColor}
                dangerColor={artPreset.dangerColor}
                fireSignal={fireSignal}
                showInlineButton={false}
                onHit={handleTargetHit}
              />

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
              initial={{ scale: 0.5, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: -18, opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ left: `${spark.x}%`, top: `${spark.y}%`, rotate: `${spark.rotate}deg` }}
            >
              {spark.text}
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
      ultimatesUsed: furnaceBurns,
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
