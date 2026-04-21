import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PetOsCard } from './PetOsCard';
import { getPetStatusSummary } from '../../lib/petOsContent';
import { getCardMoodTint, getCardPosture } from '../../lib/petOsState';
import { LOCAL_NUMBER_KEYS, readLocalNumber, subscribeLocalNumber } from '../../lib/localSignals';
import {
  dispatchPetEvent,
  enablePetCompanion,
  getPetStateSnapshot,
  initializePetOsSession,
  setPetMuted,
  subscribePetState,
  type PetIdentityRecord,
  type PetStateRecord,
} from '../../lib/petOs';

const PetOsMountSlot: React.FC = () => {
  const [petState, setPetState] = useState<PetStateRecord | null>(null);
  const [petIdentity, setPetIdentity] = useState<PetIdentityRecord | null>(null);
  const [currentLife, setCurrentLife] = useState<number>(() =>
    typeof window === 'undefined' ? 100 : readLocalNumber(LOCAL_NUMBER_KEYS.currentLife, 100),
  );
  const [clock, setClock] = useState<number>(() => Date.now());
  const [isAdopting, setIsAdopting] = useState(false);
  const criticalDebounceRef = useRef<number>(0);
  const showDebug = import.meta.env.DEV;

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const [{ identity }, snapshot] = await Promise.all([
        initializePetOsSession(),
        getPetStateSnapshot(),
      ]);

      if (!cancelled) {
        setPetIdentity(identity);
        setPetState(snapshot);
      }
    };

    void bootstrap();
    const unsubscribe = subscribePetState((state) => {
      if (!cancelled) {
        setPetState(state);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const maybeTriggerLifeCritical = (life: number) => {
      if (cancelled) return;
      setCurrentLife(life);
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      if (life >= 40) return;

      const now = Date.now();
      if (now - criticalDebounceRef.current < 5 * 60_000) return;
      criticalDebounceRef.current = now;
      void dispatchPetEvent('life_critical').catch(() => {});
    };

    const initialLife = readLocalNumber(LOCAL_NUMBER_KEYS.currentLife, 100);
    setCurrentLife(initialLife);
    maybeTriggerLifeCritical(initialLife);

    const unsubscribe = subscribeLocalNumber(
      LOCAL_NUMBER_KEYS.currentLife,
      100,
      maybeTriggerLifeCritical,
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeLocalNumber(
      LOCAL_NUMBER_KEYS.artifactSavedSignal,
      0,
      () => {
        void dispatchPetEvent('artifact_saved').catch(() => {});
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const isAdopted = !!petIdentity?.enabledAt;
  const cardPosture = useMemo(
    () => getCardPosture(petState?.posture ?? 'idle', currentLife, petState?.lastStatus ?? null),
    [petState?.posture, petState?.lastStatus, currentLife],
  );
  const cardMoodTint = useMemo(
    () => getCardMoodTint(petState?.lastStatus ?? null),
    [petState?.lastStatus],
  );
  const bubbleVisible = useMemo(() => {
    if (!petState?.bubbleText || !petState?.bubbleExpiresAt) return false;
    if (petState.muted) return false;
    return petState.bubbleExpiresAt > clock;
  }, [clock, petState]);
  const statusSummary = useMemo(
    () =>
      getPetStatusSummary({
        lastEvent: petState?.lastEvent ?? null,
        lastStatus: petState?.lastStatus ?? null,
        currentLife,
        muted: !!petState?.muted,
      }),
    [currentLife, petState?.lastEvent, petState?.lastStatus, petState?.muted],
  );

  const handleAdopt = async () => {
    if (isAdopting) return;
    setIsAdopting(true);
    try {
      const identity = await enablePetCompanion();
      const snapshot = await getPetStateSnapshot();
      setPetIdentity(identity);
      setPetState(snapshot);
    } finally {
      setIsAdopting(false);
    }
  };

  const handleToggleMute = () => {
    void setPetMuted(!petState?.muted).catch(() => {});
  };

  return (
    <div>
      {!isAdopted ? (
        <PetOsCard
          isAdopted={false}
          onAdopt={() => void handleAdopt()}
          adoptTitle="这里住着一只小东西"
          adoptDesc={
            isAdopting
              ? '它正在睁开眼睛'
              : '愿意让它陪你吗'
          }
        />
      ) : (
        <PetOsCard
          posture={cardPosture}
          moodTint={cardMoodTint || undefined}
          bubbleText={bubbleVisible ? petState?.bubbleText ?? '' : ''}
          statusDesc={statusSummary}
          muted={!!petState?.muted}
          onToggleMute={handleToggleMute}
        />
      )}

      {showDebug && petState ? (
        <details className="mt-2 rounded-xl border border-dashed border-brand-border/20 bg-brand-offwhite/40 px-3 py-2 text-[11px] text-brand-gray">
          <summary className="cursor-pointer font-mono font-bold tracking-[0.14em] text-brand-dark/70">
            本地附注
          </summary>
          <div className="mt-2 grid gap-1 font-mono sm:grid-cols-2">
            <div>引擎姿态: {petState.posture}</div>
            <div>卡片姿态: {cardPosture}</div>
            <div>当前状态: {petState.lastStatus ?? 'null'}</div>
            <div>当前数值: {currentLife}</div>
            <div>最近变化: {petState.lastEvent ?? 'none'}</div>
            <div>最近编号: {petState.lastEventId ?? 'none'}</div>
            <div>已静音: {petState.muted ? 'true' : 'false'}</div>
            <div>气泡显示: {bubbleVisible ? 'true' : 'false'}</div>
          </div>
        </details>
      ) : null}
    </div>
  );
};

export default PetOsMountSlot;
