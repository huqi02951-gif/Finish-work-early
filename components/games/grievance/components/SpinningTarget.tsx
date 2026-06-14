import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { BodyPart, HellLevelMechanic, TargetHitResult } from '../types';
import { BODY_PART_LABELS, BODY_PART_ORDER } from '../levelMechanics';

interface SpinningTargetProps {
  mechanic: HellLevelMechanic;
  disabled?: boolean;
  accentColor: string;
  dangerColor: string;
  fireSignal?: number;
  showInlineButton?: boolean;
  onHit: (result: TargetHitResult) => void;
  ultimateActive?: boolean;
}

interface TargetNeedle {
  id: number;
  part: BodyPart;
  angle: number;
  critical: boolean;
  emoji: string;
  preset?: boolean;
}

interface BubbleBlocker {
  id: number;
  part: BodyPart;
  x: number;
  y: number;
  size: number;
}

const CENTER = 200;
const OUTER = 182;
const INNER = 84;
const SEQUENCE_LOCK: BodyPart[] = ['back', 'hands', 'heart'];
const FINAL_SEQUENCE_LOCK: BodyPart[] = ['mouth', 'shadow', 'heart', 'back'];
const FAKE_WEAK_PARTS: BodyPart[] = ['mouth', 'hands', 'heart'];
const PRESET_NEEDLE_PARTS: BodyPart[] = ['hands', 'feet', 'eyes'];

const obstacleLabels: Record<HellLevelMechanic['obstacleType'], string> = {
  none: '新手引导',
  presetNeedles: '旧针',
  blackLines: '离间红线',
  mirror: '假镜面',
  fog: '热雾',
  shield: '铜盾',
  blades: '刀网',
  ice: '冰封',
  bubbles: '油泡',
  drain: '吸气',
  pots: '甩锅',
  morphing: '变形',
  stains: '污点',
  fakeTargets: '假靶',
  sequence: '机关锁',
  eruption: '喷发',
  heavyArmor: '重甲',
  allCombined: '阿鼻总账'
};

const obstaclePartsByType: Record<HellLevelMechanic['obstacleType'], BodyPart[]> = {
  none: [],
  presetNeedles: ['hands', 'feet'],
  blackLines: ['heart', 'shadow'],
  mirror: ['mouth', 'belly'],
  fog: ['eyes'],
  shield: ['head', 'back'],
  blades: ['throat', 'heart'],
  ice: ['feet', 'hands'],
  bubbles: ['eyes', 'belly'],
  drain: ['shadow'],
  pots: ['back', 'belly'],
  morphing: ['mouth', 'feet'],
  stains: ['hands', 'belly'],
  fakeTargets: ['mouth', 'heart'],
  sequence: ['eyes', 'feet'],
  eruption: ['head', 'throat'],
  heavyArmor: ['mouth', 'back', 'hands'],
  allCombined: ['eyes', 'hands', 'belly', 'feet']
};

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: cx + (radius * Math.cos(angleInRadians)),
    y: cy + (radius * Math.sin(angleInRadians))
  };
}

function describeSector(index: number, total: number) {
  const pad = 1.4;
  const startAngle = (index * 360) / total + pad;
  const endAngle = ((index + 1) * 360) / total - pad;
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  const outerStart = polarToCartesian(CENTER, CENTER, OUTER, endAngle);
  const outerEnd = polarToCartesian(CENTER, CENTER, OUTER, startAngle);
  const innerStart = polarToCartesian(CENTER, CENTER, INNER, startAngle);
  const innerEnd = polarToCartesian(CENTER, CENTER, INNER, endAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${OUTER} ${OUTER} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${INNER} ${INNER} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    'Z'
  ].join(' ');
}

function partsToBubbles(parts: BodyPart[]): BubbleBlocker[] {
  return parts.map((part, index) => {
    const partIndex = BODY_PART_ORDER.indexOf(part);
    const point = polarToCartesian(CENTER, CENTER, 130, partIndex * (360 / BODY_PART_ORDER.length) + 18);
    return {
      id: index + 1,
      part,
      x: (point.x / 400) * 100,
      y: (point.y / 400) * 100,
      size: 34 + index * 4
    };
  });
}

export const SpinningTarget: React.FC<SpinningTargetProps> = ({
  mechanic,
  disabled = false,
  accentColor,
  dangerColor,
  fireSignal = 0,
  showInlineButton = true,
  onHit,
  ultimateActive = false
}) => {
  const [needles, setNeedles] = useState<TargetNeedle[]>([]);
  const [validHitCount, setValidHitCount] = useState(0);
  const [pulse, setPulse] = useState<'none' | 'hit' | 'bad'>('none');
  const [currentPart, setCurrentPart] = useState<BodyPart>('mouth');
  const [linesCut, setLinesCut] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [fogCleared, setFogCleared] = useState(false);
  const [shieldHp, setShieldHp] = useState(3);
  const [frozen, setFrozen] = useState(false);
  const [erupting, setErupting] = useState(false);
  const [bubbles, setBubbles] = useState<BubbleBlocker[]>([]);
  const [stainWipeCount, setStainWipeCount] = useState(0);
  const [truthRevealed, setTruthRevealed] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [chargedReady, setChargedReady] = useState(false);
  const [charging, setCharging] = useState(false);
  const [mechanicHint, setMechanicHint] = useState('');
  const [shotFlashId, setShotFlashId] = useState(0);

  useEffect(() => {
    if (ultimateActive) {
      setFogCleared(true);
      setShieldHp(0);
      setFrozen(false);
      setStainWipeCount(3);
      setTruthRevealed(true);
      setErupting(false);
    }
  }, [ultimateActive]);

  const startTimeRef = useRef(performance.now());
  const chargeStartRef = useRef(0);
  const duration = Math.max(1.9, 7.4 / mechanic.rotationSpeed);
  const sectorSize = 360 / BODY_PART_ORDER.length;
  const isFinalCombo = mechanic.obstacleType === 'allCombined';
  const sequenceParts = isFinalCombo ? FINAL_SEQUENCE_LOCK : SEQUENCE_LOCK;

  const obstacleParts = useMemo(() => {
    if (isFinalCombo) {
      return Array.from(new Set([
        ...obstaclePartsByType.pots,
        ...obstaclePartsByType.ice,
        ...obstaclePartsByType.sequence,
        ...obstaclePartsByType.allCombined
      ]));
    }
    return obstaclePartsByType[mechanic.obstacleType];
  }, [isFinalCombo, mechanic.obstacleType]);

  const needleParts = useMemo(() => new Set(needles.map(needle => needle.part)), [needles]);
  const stainsCleared = stainWipeCount >= 3;
  const guideHot = mechanic.obstacleType === 'none' && mechanic.weaknessParts.includes(currentPart);

  const getTimedTarget = () => {
    const elapsedSeconds = (performance.now() - startTimeRef.current) / 1000;
    const rotationDegrees = normalizeAngle((elapsedSeconds / duration) * 360);
    const morphOffset = (mechanic.obstacleType === 'morphing' || isFinalCombo)
      ? Math.sin(elapsedSeconds * 3.2) * 13
      : 0;
    const localAngle = normalizeAngle(0 - rotationDegrees + morphOffset);
    const index = Math.floor(localAngle / sectorSize) % BODY_PART_ORDER.length;
    const part = BODY_PART_ORDER[index];
    return { elapsedSeconds, rotationDegrees, localAngle, index, part };
  };

  const finishResult = (
    hitType: TargetHitResult['hitType'],
    part: BodyPart,
    rotationDegrees: number,
    message: string,
    nextCount = validHitCount,
    isWeakness = mechanic.weaknessParts.includes(part)
  ) => {
    setPulse(hitType === 'critical' || hitType === 'normal' ? 'hit' : 'bad');
    window.setTimeout(() => setPulse('none'), 220);
    onHit({
      hitType,
      part,
      partLabel: BODY_PART_LABELS[part],
      isWeakness,
      needleCount: nextCount,
      quotaComplete: nextCount >= mechanic.needleQuota,
      rotationDegrees,
      message: nextCount >= mechanic.needleQuota ? `${message} 本层指标完成，开庭终审！` : message
    });
  };

  const isBladeGateClosed = (elapsedSeconds: number) => {
    if (mechanic.obstacleType !== 'blades') return false;
    const bladeAngle = normalizeAngle(360 - elapsedSeconds * 210);
    return [0, 120, 240].some(base => {
      const delta = Math.abs(normalizeAngle(bladeAngle + base) - 0);
      return Math.min(delta, 360 - delta) < 18;
    });
  };

  const isPotGateClosed = (elapsedSeconds: number) => {
    if (mechanic.obstacleType !== 'pots' && !isFinalCombo) return false;
    return Math.abs(Math.sin(elapsedSeconds * 1.6)) < 0.38;
  };

  useEffect(() => {
    const presetNeedles = mechanic.obstacleType === 'presetNeedles'
      ? PRESET_NEEDLE_PARTS.map((part, index) => ({
        id: -index - 1,
        part,
        angle: BODY_PART_ORDER.indexOf(part) * sectorSize + sectorSize / 2,
        critical: false,
        emoji: '旧',
        preset: true
      }))
      : [];
    setNeedles(presetNeedles);
    setValidHitCount(0);
    startTimeRef.current = performance.now();
    setPulse('none');
    setCurrentPart('mouth');
    setLinesCut(false);
    setScanned(false);
    setFogCleared(false);
    setShieldHp(3);
    setFrozen(false);
    setErupting(false);
    setBubbles(mechanic.obstacleType === 'bubbles' ? partsToBubbles(['eyes', 'belly', 'hands', 'back']) : []);
    setStainWipeCount(0);
    setTruthRevealed(false);
    setSequenceIndex(0);
    setChargedReady(false);
    setCharging(false);
    setMechanicHint(mechanic.specialRule || mechanic.coreMechanic);
  }, [mechanic, sectorSize]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCurrentPart(getTimedTarget().part);
    }, 90);
    return () => window.clearInterval(id);
  }, [duration, mechanic.obstacleType]);

  useEffect(() => {
    if (mechanic.obstacleType !== 'ice' && !isFinalCombo) return;
    const id = window.setInterval(() => {
      setFrozen(true);
      window.setTimeout(() => setFrozen(false), isFinalCombo ? 1100 : 1500);
    }, isFinalCombo ? 5200 : 5000);
    return () => window.clearInterval(id);
  }, [isFinalCombo, mechanic.obstacleType]);

  useEffect(() => {
    if (mechanic.obstacleType !== 'eruption') return;
    const id = window.setInterval(() => {
      setErupting(true);
      window.setTimeout(() => setErupting(false), 2000);
    }, 8000);
    return () => window.clearInterval(id);
  }, [mechanic.obstacleType]);

  const revealMirror = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setScanned(true);
    setMechanicHint('孽镜已照开：4秒内假笑眼和画皮影会露出真相。');
    window.setTimeout(() => setScanned(false), 4000);
  };

  const clearFog = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setFogCleared(true);
    setMechanicHint('净气符已开：3.5秒内热雾退散，嘴门和话根可封。');
    window.setTimeout(() => setFogCleared(false), 3500);
  };

  const cutLines = (event: React.MouseEvent<SVGCircleElement | HTMLButtonElement>) => {
    event.stopPropagation();
    setLinesCut(true);
    setMechanicHint('红线剪断：现在可以专打背刺点和抢功手。');
  };

  const wipeStain = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setStainWipeCount(prev => {
      const next = Math.min(3, prev + 1);
      setMechanicHint(next >= 3 ? '污名擦净：真弱点重新露出来。' : `污名擦拭 ${next}/3，再抹几下。`);
      return next;
    });
  };

  const revealTruth = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setTruthRevealed(true);
    setMechanicHint('判笔验真：金边才是真弱点，绿色假证别扎。');
    window.setTimeout(() => setTruthRevealed(false), 3500);
  };

  const startCharge = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setCharging(true);
    chargeStartRef.current = performance.now();
    setMechanicHint('按住别松，蓄满 1.2 秒后磨盘破甲。');
  };

  const endCharge = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const chargedMs = performance.now() - chargeStartRef.current;
    setCharging(false);
    if (chargedMs >= 1200) {
      setChargedReady(true);
      setMechanicHint('蓄力完成：下一击归主磨盘穿透重甲。');
    } else {
      setChargedReady(false);
      setMechanicHint('蓄力不足：重甲还在，长按到红条满再放。');
    }
  };

  const popBubble = (event: React.MouseEvent<HTMLButtonElement>, id: number) => {
    event.stopPropagation();
    setBubbles(prev => prev.filter(bubble => bubble.id !== id));
    setMechanicHint('油泡戳破：飞针路线清了一块。');
  };

  const breakShieldTick = () => {
    setShieldHp(prev => {
      const next = Math.max(0, prev - 1);
      if (next === 0) {
        setMechanicHint('铜盾碎了：6秒破防窗口，抓紧锁黑心和贪坑。');
        window.setTimeout(() => {
          setShieldHp(3);
          setMechanicHint('铜盾复位：继续打碎它的靠山护盾。');
        }, 6000);
      } else {
        setMechanicHint(`铜盾裂开 ${3 - next}/3，再撞一次。`);
      }
      return next;
    });
  };

  const fireNeedle = () => {
    if (disabled) return;

    const { elapsedSeconds, rotationDegrees, index, part } = getTimedTarget();
    const partLabel = BODY_PART_LABELS[part];
    const realWeakness = mechanic.weaknessParts.includes(part);
    const fakeWeakness = mechanic.obstacleType === 'fakeTargets' && FAKE_WEAK_PARTS.includes(part) && !realWeakness;
    const isObstacle = obstacleParts.includes(part) && !realWeakness;

    if ((mechanic.obstacleType === 'ice' || isFinalCombo) && frozen) {
      finishResult('miss', part, rotationDegrees, `冰山冷暴力冻结中，${mechanic.toolName} 被冻住了。`, validHitCount, false);
      return;
    }

    if (mechanic.obstacleType === 'eruption' && erupting) {
      finishResult('miss', part, rotationDegrees, '火山喷发！飞针半路被怒火吞掉。', validHitCount, false);
      return;
    }

    if (mechanic.obstacleType === 'blackLines' && !linesCut) {
      finishResult('blocked', part, rotationDegrees, '红线还没剪断：先点线结，别被离间局牵着走。', validHitCount, false);
      return;
    }

    if (mechanic.obstacleType === 'mirror' && realWeakness && !scanned) {
      finishResult('blocked', part, rotationDegrees, '白莲假面未照破：先开孽镜，再打真弱点。', validHitCount, false);
      return;
    }

    if (mechanic.obstacleType === 'fog' && realWeakness && !fogCleared) {
      finishResult('blocked', part, rotationDegrees, '热雾盖住话根：先用净气符吹开。', validHitCount, false);
      return;
    }

    if (mechanic.obstacleType === 'shield' && shieldHp > 0 && !realWeakness) {
      breakShieldTick();
      finishResult('blocked', part, rotationDegrees, `铜盾弹开：${partLabel} 不是破绽。`, validHitCount, false);
      return;
    }

    if (isBladeGateClosed(elapsedSeconds)) {
      finishResult('blocked', part, rotationDegrees, '刀网封路！等刀缝让开再斩卡晋升脚。', validHitCount, false);
      return;
    }

    if (isPotGateClosed(elapsedSeconds)) {
      finishResult('blocked', part, rotationDegrees, '黑锅横飞挡针：锅没让开，先别背这个雷。', validHitCount, false);
      return;
    }

    if (mechanic.obstacleType === 'bubbles' && bubbles.some(bubble => bubble.part === part)) {
      finishResult('miss', part, rotationDegrees, `油泡弹开${mechanic.toolName}：先戳破泡泡。`, validHitCount, false);
      return;
    }

    if (mechanic.obstacleType === 'stains' && realWeakness && !stainsCleared) {
      finishResult('blocked', part, rotationDegrees, '污名糊住真相：先把血池脏水擦掉。', validHitCount, false);
      return;
    }

    if (fakeWeakness) {
      finishResult('collision', part, rotationDegrees, `假证词陷阱：${partLabel} 是冤案靶，功德被扣。`, validHitCount, false);
      return;
    }

    if ((mechanic.obstacleType === 'sequence' || isFinalCombo) && realWeakness) {
      const expected = sequenceParts[sequenceIndex];
      if (part !== expected) {
        setSequenceIndex(0);
        finishResult('blocked', part, rotationDegrees, `因果顺序错了：先破「${BODY_PART_LABELS[expected]}」。`, validHitCount, false);
        return;
      }
    }

    if (mechanic.obstacleType === 'heavyArmor' && !chargedReady) {
      finishResult('blocked', part, rotationDegrees, '重甲挡下轻击：先长按蓄力，让磨盘归主。', validHitCount, false);
      return;
    }

    const hitExistingNeedle = needleParts.has(part);
    if (hitExistingNeedle) {
      finishResult('collision', part, rotationDegrees, `撞针：${partLabel} 已经钉过，换个角度！`, validHitCount, false);
      return;
    }

    if (isObstacle) {
      finishResult('blocked', part, rotationDegrees, `误入${obstacleLabels[mechanic.obstacleType]}段，连击断一下。`, validHitCount, false);
      return;
    }

    let hitType: TargetHitResult['hitType'] = realWeakness ? 'critical' : 'normal';
    let hitValue = realWeakness ? 1 : 1;
    let hitEmoji = mechanic.toolIcon;
    let message = realWeakness
      ? `${mechanic.criticalVerb}：${partLabel}，小人破防！`
      : `${mechanic.hitVerb} ${partLabel}，审判值上升。`;

    if ((mechanic.obstacleType === 'sequence' || isFinalCombo) && realWeakness) {
      const nextSequenceIndex = sequenceIndex + 1;
      if (nextSequenceIndex >= sequenceParts.length) {
        setSequenceIndex(0);
        hitValue = isFinalCombo ? 4 : 3;
        message = `${mechanic.finishMove}：因果链全断，设局小人被反锁！`;
      } else {
        setSequenceIndex(nextSequenceIndex);
        message = `顺序锁 ${nextSequenceIndex}/${sequenceParts.length}：下一个打「${BODY_PART_LABELS[sequenceParts[nextSequenceIndex]]}」。`;
      }
    }

    if (mechanic.obstacleType === 'heavyArmor' && chargedReady) {
      hitType = realWeakness ? 'critical' : 'normal';
      hitValue = realWeakness ? 2 : 1;
      hitEmoji = '⚙️';
      message = `${mechanic.finishMove}：蓄力磨盘穿甲，烂摊子归主！`;
      setChargedReady(false);
    }

    const nextHitCount = Math.min(mechanic.needleQuota, validHitCount + hitValue);
    setValidHitCount(nextHitCount);
    setNeedles(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        part,
        angle: index * sectorSize + sectorSize / 2,
        critical: realWeakness,
        emoji: hitEmoji
      }
    ]);

    finishResult(hitType, part, rotationDegrees, message, nextHitCount, realWeakness);
  };

  useEffect(() => {
    if (fireSignal > 0) {
      setShotFlashId(fireSignal);
      window.setTimeout(() => setShotFlashId(current => current === fireSignal ? 0 : current), 420);
      fireNeedle();
    }
  }, [fireSignal]);

  const renderMechanicActions = () => {
    const actions: React.ReactNode[] = [];
    if (mechanic.obstacleType === 'blackLines') {
      actions.push(
        <button key="line" type="button" onClick={cutLines} disabled={linesCut}>
          {linesCut ? '红线已断' : '剪断线结'}
        </button>
      );
    }
    if (mechanic.obstacleType === 'mirror') {
      actions.push(<button key="mirror" type="button" onClick={revealMirror}>孽镜照伪</button>);
    }
    if (mechanic.obstacleType === 'fog') {
      actions.push(<button key="fog" type="button" onClick={clearFog}>净气符</button>);
    }
    if (mechanic.obstacleType === 'stains') {
      actions.push(
        <button key="stain" type="button" onPointerDown={wipeStain}>
          擦污名 {stainWipeCount}/3
        </button>
      );
    }
    if (mechanic.obstacleType === 'fakeTargets') {
      actions.push(<button key="truth" type="button" onClick={revealTruth}>判笔验真</button>);
    }
    if (mechanic.obstacleType === 'heavyArmor') {
      actions.push(
        <button
          key="charge"
          type="button"
          className={chargedReady ? 'is-ready' : charging ? 'is-charging' : ''}
          onPointerDown={startCharge}
          onPointerUp={endCharge}
          onPointerLeave={(event) => charging && endCharge(event)}
        >
          {chargedReady ? '磨盘已满' : charging ? '蓄力中...' : '长按蓄力'}
        </button>
      );
    }
    if (!actions.length) return null;
    return <div className="target-mechanic-actions">{actions}</div>;
  };

  return (
    <div
      className={`spinning-target spinning-target-${pulse} obstacle-${mechanic.obstacleType} ${frozen ? 'is-frozen' : ''} ${erupting ? 'is-erupting' : ''}`}
      style={{
        '--target-accent': accentColor,
        '--target-danger': dangerColor,
        '--target-duration': `${duration}s`
      } as React.CSSProperties}
    >
      <div className="target-title">
        <span>{mechanic.playName}</span>
        <b>{validHitCount}/{mechanic.needleQuota}</b>
      </div>

      <div className="target-disc-wrap">
        {shotFlashId > 0 && <span key={shotFlashId} className="target-impact-flash" />}
        <svg className="spinning-target-svg" viewBox="0 0 400 400" role="img" aria-label="旋转弱点盘">
          <defs>
            <radialGradient id="targetPaper" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#f2d99a" stopOpacity="0.96" />
              <stop offset="58%" stopColor="#6b3b1f" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#120706" stopOpacity="0.98" />
            </radialGradient>
          </defs>

          <g className="spinning-target-disc">
            <circle cx={CENTER} cy={CENTER} r={OUTER + 8} fill="rgba(0,0,0,0.56)" stroke="rgba(215,168,77,0.35)" strokeWidth="6" />
            {BODY_PART_ORDER.map((part, index) => {
              const realWeak = mechanic.weaknessParts.includes(part);
              const hiddenWeak = realWeak && (
                (mechanic.obstacleType === 'mirror' && !scanned)
                || (mechanic.obstacleType === 'fog' && !fogCleared)
                || (mechanic.obstacleType === 'stains' && !stainsCleared)
              );
              const fakeWeak = mechanic.obstacleType === 'fakeTargets' && FAKE_WEAK_PARTS.includes(part) && !realWeak;
              const isWeak = (realWeak && !hiddenWeak) || fakeWeak;
              const isObstacle = obstacleParts.includes(part) && !realWeak;
              const isNextSequence = (mechanic.obstacleType === 'sequence' || isFinalCombo) && part === sequenceParts[sequenceIndex];
              const labelPoint = polarToCartesian(CENTER, CENTER, 130, index * sectorSize + sectorSize / 2);
              return (
                <g key={part}>
                  <path
                    d={describeSector(index, BODY_PART_ORDER.length)}
                    className={[
                      'target-sector',
                      isWeak ? 'is-weak' : '',
                      hiddenWeak ? 'is-hidden-weak' : '',
                      fakeWeak ? 'is-fake-weak' : '',
                      isObstacle ? 'is-obstacle' : '',
                      currentPart === part ? 'is-under-pointer' : '',
                      isNextSequence ? 'is-next-seq' : '',
                      truthRevealed && realWeak ? 'is-truth' : ''
                    ].filter(Boolean).join(' ')}
                  />
                  <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="central" className="target-sector-label">
                    {BODY_PART_LABELS[part]}
                  </text>
                </g>
              );
            })}
            <circle cx={CENTER} cy={CENTER} r={INNER - 8} fill="url(#targetPaper)" stroke="rgba(250,204,21,0.46)" strokeWidth="4" />
            <text x={CENTER} y={CENTER - 18} textAnchor="middle" className="target-core-title">{mechanic.toolIcon}</text>
            <text x={CENTER} y={CENTER + 10} textAnchor="middle" className="target-core-subtitle">{mechanic.toolName}</text>
            <text x={CENTER} y={CENTER + 32} textAnchor="middle" className="target-core-mini">{obstacleLabels[mechanic.obstacleType]}</text>

            {needles.map(needle => {
              const start = polarToCartesian(CENTER, CENTER, 66, needle.angle);
              const end = polarToCartesian(CENTER, CENTER, 178, needle.angle);
              const textPoint = polarToCartesian(CENTER, CENTER, 192, needle.angle);
              return (
                <g key={needle.id} className={needle.critical ? 'target-needle is-critical' : needle.preset ? 'target-needle is-preset' : 'target-needle'}>
                  <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
                  <text x={textPoint.x} y={textPoint.y} textAnchor="middle" dominantBaseline="central">
                    {needle.emoji}
                  </text>
                </g>
              );
            })}
          </g>

          {mechanic.obstacleType === 'blackLines' && (
            <g className={`target-red-lines ${linesCut ? 'is-cut' : ''}`}>
              <path d="M42 214 C108 122 292 302 358 170" />
              <path d="M62 134 C134 248 254 82 336 254" />
              <circle cx={CENTER} cy={CENTER} r="18" onClick={cutLines} />
            </g>
          )}

          {(mechanic.obstacleType === 'shield' && shieldHp > 0) && (
            <g className={`target-shield-ring shield-hp-${shieldHp}`}>
              <circle cx={CENTER} cy={CENTER} r="194" />
              <text x={CENTER} y="22" textAnchor="middle">铜盾 {shieldHp}/3</text>
            </g>
          )}

          {mechanic.obstacleType === 'blades' && (
            <g className="target-blade-group">
              {[0, 120, 240].map(angle => (
                <path key={angle} className="target-blade" d="M200 14 L220 74 L200 56 L180 74 Z" transform={`rotate(${angle} 200 200)`} />
              ))}
            </g>
          )}

          {(mechanic.obstacleType === 'ice' || isFinalCombo) && (
            <g className={`target-ice-layer ${frozen ? 'is-on' : ''}`}>
              <path d="M78 82 L140 150 L112 174 L188 236" />
              <path d="M312 74 L252 144 L286 174 L216 252" />
              <path d="M108 306 L164 238 L192 280 L250 198" />
            </g>
          )}

          {mechanic.obstacleType === 'fog' && (
            <g className={`target-fog-layer ${fogCleared ? 'is-clear' : ''}`}>
              <circle cx={CENTER} cy={CENTER} r="190" />
              <path d="M54 150 C130 118 176 184 258 148 S350 158 374 124" />
              <path d="M34 252 C112 210 184 284 262 232 S338 238 378 214" />
            </g>
          )}

          {(mechanic.obstacleType === 'pots' || isFinalCombo) && (
            <g className="target-pot-layer">
              <g className="target-pot target-pot-left"><ellipse cx="116" cy="118" rx="40" ry="25" /><text x="116" y="122" textAnchor="middle">锅</text></g>
              <g className="target-pot target-pot-right"><ellipse cx="284" cy="284" rx="40" ry="25" /><text x="284" y="288" textAnchor="middle">锅</text></g>
            </g>
          )}

          {mechanic.obstacleType === 'eruption' && (
            <g className={`target-eruption-layer ${erupting ? 'is-on' : ''}`}>
              <path d="M95 330 C130 220 150 250 177 132 C202 244 234 196 256 314 C230 280 202 330 190 356 C164 306 126 356 95 330 Z" />
              <text x={CENTER} y="372" textAnchor="middle">{erupting ? '怒火喷发' : '火口蓄压'}</text>
            </g>
          )}

          {mechanic.obstacleType === 'stains' && !stainsCleared && (
            <g className="target-stain-layer">
              <ellipse cx="128" cy="162" rx="44" ry="28" />
              <ellipse cx="264" cy="130" rx="48" ry="30" />
              <ellipse cx="224" cy="274" rx="58" ry="35" />
            </g>
          )}

          <path className={`target-guide-line ${guideHot ? 'is-hot' : ''}`} d="M200 8 L200 200" />
          <path className="target-pointer" d="M200 6 L224 54 L200 42 L176 54 Z" />
          <circle className="target-pointer-dot" cx={CENTER} cy={CENTER} r="9" />
        </svg>

        {mechanic.obstacleType === 'bubbles' && (
          <div className="target-bubble-layer">
            {bubbles.map(bubble => (
              <button
                key={bubble.id}
                type="button"
                className="target-bubble"
                style={{ left: `${bubble.x}%`, top: `${bubble.y}%`, width: bubble.size, height: bubble.size }}
                onClick={(event) => popBubble(event, bubble.id)}
              >
                泡
              </button>
            ))}
          </div>
        )}
      </div>

      {showInlineButton && (
        <button type="button" className="target-fire-button" onClick={fireNeedle} disabled={disabled}>
          {mechanic.fireLabel}
        </button>
      )}

      {renderMechanicActions()}

      <div className="target-readout">
        <span>弱点：{mechanic.weaknessParts.map(part => BODY_PART_LABELS[part]).join(' / ')}</span>
        <b>{mechanicHint}</b>
      </div>
    </div>
  );
};
