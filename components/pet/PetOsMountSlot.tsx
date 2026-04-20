import React, { useEffect, useState } from 'react';
import { Bot, Clock3, HeartPulse, PlugZap } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  getPetStateSnapshot,
  initializePetOsSession,
  subscribePetState,
  type PetOsEventName,
  type PetStateRecord,
} from '../../lib/petOs';

const EVENT_LABELS: Record<PetOsEventName, string> = {
  daily_login: '每日登录',
  long_absence: '长时间离线',
  status_change: '状态切换',
  touch_fish: '带薪发呆',
  drink_coffee: '续命咖啡',
  artifact_saved: '保存物料',
};

const WIRED_EVENTS: PetOsEventName[] = [
  'daily_login',
  'long_absence',
  'status_change',
  'touch_fish',
  'drink_coffee',
  'artifact_saved',
];

function formatTime(timestamp: number | null) {
  if (!timestamp) return '尚未记录';
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const PetOsMountSlot: React.FC = () => {
  const [petState, setPetState] = useState<PetStateRecord | null>(null);
  const showDebug = import.meta.env.DEV;

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      await initializePetOsSession();
      const snapshot = await getPetStateSnapshot();
      if (!cancelled) {
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

  return (
    <section className="rounded-[24px] border border-brand-border/10 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-apple-pink/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-apple-pink">
            <Bot size={12} />
            PET_OS v2.4.0
          </div>
          <h3 className="mt-3 text-xl font-bold text-brand-dark">PET_OS 挂载位</h3>
          <p className="mt-2 text-sm leading-6 text-brand-gray">
            本轮只完成挂载位、本地命名空间和基础事件接线。宠物本体、成长与多宠物能力暂未启用。
          </p>
        </div>
        <div className="rounded-2xl border border-brand-border/10 bg-brand-offwhite px-4 py-3 text-right">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gray">监听状态</div>
          <div className="mt-1 text-sm font-bold text-brand-dark">
            {petState?.lastStatus || '等待接入'}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-brand-border/10 bg-brand-offwhite/80 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-dark">
            <PlugZap size={14} className="text-apple-blue" />
            已接通事件源
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {WIRED_EVENTS.map((eventName) => (
              <span
                key={eventName}
                className={cn(
                  'rounded-full border px-3 py-1 text-[11px] font-bold',
                  petState?.lastEvent === eventName
                    ? 'border-apple-blue/30 bg-apple-blue/10 text-apple-blue'
                    : 'border-brand-border/10 bg-white text-brand-gray'
                )}
              >
                {EVENT_LABELS[eventName]}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border/10 bg-brand-offwhite/80 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-dark">
            <Clock3 size={14} className="text-apple-purple" />
            最近一次记录
          </div>
          <div className="mt-3 text-sm font-bold text-brand-dark">
            {petState?.lastEvent ? EVENT_LABELS[petState.lastEvent] : '尚未产生事件'}
          </div>
          <div className="mt-1 text-xs text-brand-gray">
            {formatTime(petState?.lastEventAt ?? null)}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-brand-dark">
            <HeartPulse size={14} className="text-apple-pink" />
            离线时长
          </div>
          <div className="mt-1 text-xs text-brand-gray">
            {petState?.absenceHours ? `${petState.absenceHours} 小时` : '本次会话内未触发'}
          </div>
        </div>
      </div>

      {showDebug && petState ? (
        <div className="mt-3 rounded-2xl border border-dashed border-brand-border/20 bg-brand-offwhite/60 px-4 py-3 font-mono text-[11px] text-brand-gray">
          <div className="mb-2 font-bold tracking-[0.16em] text-brand-dark">开发调试</div>
          <div className="grid gap-1 sm:grid-cols-3">
            <div>eventId: {petState.lastEventId || 'none'}</div>
            <div>posture: {petState.posture}</div>
            <div>muted: {petState.muted ? 'true' : 'false'}</div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default PetOsMountSlot;
