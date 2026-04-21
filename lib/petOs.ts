import Dexie, { type EntityTable } from 'dexie';
import { loadPetOsResources, pickPetLine } from './petOsContent';
import { derivePetPosture } from './petOsState';
import type { PetOsEventName, PetPosture } from './petOsTypes';

export interface PetIdentityRecord {
  key: 'pet_identity';
  namespace: 'pet_os';
  version: 'v2.4.0';
  enabledAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface PetStateRecord {
  key: 'pet_state';
  lastEvent: PetOsEventName | null;
  lastEventId: string | null;
  lastEventAt: number | null;
  lastStatus: string | null;
  posture: PetPosture;
  resourceVersion: string;
  muted: boolean;
  lastLineId: string | null;
  lastLine: string | null;
  bubbleText: string | null;
  bubbleLineId: string | null;
  bubbleEvent: PetOsEventName | null;
  bubblePriority: number;
  bubbleExpiresAt: number | null;
  lastSeenAt: number | null;
  absenceHours: number;
  eventCounters: Partial<Record<PetOsEventName, number>>;
  updatedAt: number;
}

export interface PetCooldownRecord {
  key: 'pet_cooldown';
  eventCooldowns: Partial<Record<PetOsEventName, number>>;
  updatedAt: number;
}

const PET_STATE_CHANGE_EVENT = 'pet:state-change';
const PET_OS_ABSENCE_THRESHOLD_MS = 24 * 60 * 60 * 1000;
const PET_BUBBLE_DURATION_MS = 8_000;
const PET_EVENT_META: Record<PetOsEventName, { cooldownMs: number; priority: number }> = {
  daily_login: { cooldownMs: 0, priority: 4 },
  long_absence: { cooldownMs: 60_000, priority: 6 },
  life_critical: { cooldownMs: 5 * 60_000, priority: 6 },
  status_change_off_duty: { cooldownMs: 30_000, priority: 5 },
  status_change_overtime: { cooldownMs: 30_000, priority: 5 },
  touch_fish: { cooldownMs: 2_000, priority: 3 },
  drink_coffee: { cooldownMs: 2_000, priority: 3 },
  artifact_saved: { cooldownMs: 5_000, priority: 2 },
};

class PetOsDB extends Dexie {
  pet_identity!: EntityTable<PetIdentityRecord, 'key'>;
  pet_state!: EntityTable<PetStateRecord, 'key'>;
  pet_cooldown!: EntityTable<PetCooldownRecord, 'key'>;

  constructor() {
    super('PetOsDB');

    this.version(1).stores({
      pet_identity: 'key, updatedAt',
      pet_state: 'key, updatedAt, lastEventAt',
      pet_cooldown: 'key, updatedAt',
    });
  }
}

export const petOsDb = new PetOsDB();

function buildDefaultIdentity(now: number): PetIdentityRecord {
  return {
    key: 'pet_identity',
    namespace: 'pet_os',
    version: 'v2.4.0',
    enabledAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

function buildDefaultState(now: number): PetStateRecord {
  return {
    key: 'pet_state',
    lastEvent: null,
    lastEventId: null,
    lastEventAt: null,
    lastStatus: null,
    posture: 'idle',
    resourceVersion: loadPetOsResources().version,
    muted: false,
    lastLineId: null,
    lastLine: null,
    bubbleText: null,
    bubbleLineId: null,
    bubbleEvent: null,
    bubblePriority: 0,
    bubbleExpiresAt: null,
    lastSeenAt: null,
    absenceHours: 0,
    eventCounters: {},
    updatedAt: now,
  };
}

function buildDefaultCooldown(now: number): PetCooldownRecord {
  return {
    key: 'pet_cooldown',
    eventCooldowns: {},
    updatedAt: now,
  };
}

async function ensurePetOsRecords() {
  const now = Date.now();
  const [identity, state, cooldown] = await Promise.all([
    petOsDb.pet_identity.get('pet_identity'),
    petOsDb.pet_state.get('pet_state'),
    petOsDb.pet_cooldown.get('pet_cooldown'),
  ]);

  const nextIdentity = identity
    ? {
        ...buildDefaultIdentity(now),
        ...identity,
        enabledAt: identity.enabledAt ?? null,
      }
    : buildDefaultIdentity(now);
  const nextState = state ?? buildDefaultState(now);
  const nextCooldown = cooldown ?? buildDefaultCooldown(now);

  await Promise.all([
    identity ? Promise.resolve() : petOsDb.pet_identity.add(nextIdentity),
    state ? Promise.resolve() : petOsDb.pet_state.add(nextState),
    cooldown ? Promise.resolve() : petOsDb.pet_cooldown.add(nextCooldown),
  ]);

  return {
    identity: nextIdentity,
    state: nextState,
    cooldown: nextCooldown,
  };
}

function emitPetStateChange(state: PetStateRecord) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PET_STATE_CHANGE_EVENT, { detail: state }));
}

export async function getPetStateSnapshot() {
  const { state } = await ensurePetOsRecords();
  return state;
}

export async function getPetIdentitySnapshot() {
  const { identity } = await ensurePetOsRecords();
  return identity;
}

export async function enablePetCompanion() {
  const { identity } = await ensurePetOsRecords();
  if (identity.enabledAt) {
    return identity;
  }

  const nextIdentity: PetIdentityRecord = {
    ...identity,
    enabledAt: Date.now(),
    updatedAt: Date.now(),
  };

  await petOsDb.pet_identity.put(nextIdentity);
  return nextIdentity;
}

export async function dispatchPetEvent(
  eventName: PetOsEventName,
  payload?: { status?: string; timestamp?: number; absenceHours?: number },
) {
  const { state, cooldown } = await ensurePetOsRecords();
  const now = payload?.timestamp ?? Date.now();
  const nextStatus = payload?.status ?? state.lastStatus;
  const eventMeta = PET_EVENT_META[eventName];
  const nextCount = (state.eventCounters[eventName] ?? 0) + 1;
  const previousEventAt = cooldown.eventCooldowns[eventName] ?? 0;
  const isCoolingDown = eventMeta.cooldownMs > 0 && now - previousEventAt < eventMeta.cooldownMs;
  const nextPosture = derivePetPosture({
    eventName,
    status: nextStatus,
    previousPosture: state.posture,
  });
  const currentBubbleActive =
    !!state.bubbleText &&
    typeof state.bubbleExpiresAt === 'number' &&
    state.bubbleExpiresAt > now;
  const nextLine = state.muted || isCoolingDown
    ? null
    : pickPetLine({
        eventName,
        previousLineId: state.lastLineId,
        sequence: nextCount - 1,
      });
  const shouldReplaceBubble = (() => {
    if (!nextLine) return false;
    if (!currentBubbleActive) return true;
    if (eventMeta.priority > state.bubblePriority) return true;
    return false;
  })();
  const nextState: PetStateRecord = {
    ...state,
    lastEvent: eventName,
    lastEventId: `${eventName}:${now}`,
    lastEventAt: now,
    lastStatus: nextStatus,
    posture: nextPosture,
    resourceVersion: loadPetOsResources().version,
    lastLineId: nextLine?.id ?? state.lastLineId,
    lastLine: nextLine?.text ?? state.lastLine,
    bubbleText: shouldReplaceBubble ? nextLine?.text ?? null : state.bubbleText,
    bubbleLineId: shouldReplaceBubble ? nextLine?.id ?? null : state.bubbleLineId,
    bubbleEvent: shouldReplaceBubble ? eventName : state.bubbleEvent,
    bubblePriority: shouldReplaceBubble ? eventMeta.priority : state.bubblePriority,
    bubbleExpiresAt: shouldReplaceBubble ? now + PET_BUBBLE_DURATION_MS : state.bubbleExpiresAt,
    lastSeenAt: eventName === 'daily_login' || eventName === 'long_absence' ? now : state.lastSeenAt,
    absenceHours: payload?.absenceHours ?? state.absenceHours,
    eventCounters: {
      ...state.eventCounters,
      [eventName]: nextCount,
    },
    updatedAt: now,
  };
  const nextCooldown: PetCooldownRecord = {
    ...cooldown,
    eventCooldowns: {
      ...cooldown.eventCooldowns,
      [eventName]: now,
    },
    updatedAt: now,
  };

  await Promise.all([
    petOsDb.pet_state.put(nextState),
    petOsDb.pet_cooldown.put(nextCooldown),
  ]);
  emitPetStateChange(nextState);
  return nextState;
}

export async function initializePetOsSession() {
  const { identity, state, cooldown } = await ensurePetOsRecords();
  const now = Date.now();
  const previousSeenAt = state.lastSeenAt;
  let nextState: PetStateRecord = {
    ...state,
    lastSeenAt: now,
    absenceHours: previousSeenAt ? Math.max(0, Math.floor((now - previousSeenAt) / (60 * 60 * 1000))) : 0,
    updatedAt: now,
  };

  await petOsDb.pet_state.put(nextState);
  emitPetStateChange(nextState);

  const isNewDay =
    !previousSeenAt ||
    new Date(previousSeenAt).toDateString() !== new Date(now).toDateString();

  if (isNewDay) {
    nextState = await dispatchPetEvent('daily_login', { timestamp: now });
  }

  if (previousSeenAt && now - previousSeenAt >= PET_OS_ABSENCE_THRESHOLD_MS) {
    nextState = await dispatchPetEvent('long_absence', {
      timestamp: now,
      absenceHours: Math.max(0, Math.floor((now - previousSeenAt) / (60 * 60 * 1000))),
    });
  }

  return { identity, state: nextState, cooldown };
}

export async function syncPetStatus(status: string) {
  const { state } = await ensurePetOsRecords();
  if (state.lastStatus === status) {
    return state;
  }
  if (status === 'OFF_DUTY') {
    return dispatchPetEvent('status_change_off_duty', { status });
  }
  if (status === 'OVERTIME') {
    return dispatchPetEvent('status_change_overtime', { status });
  }

  const now = Date.now();
  const nextState: PetStateRecord = {
    ...state,
    lastStatus: status,
    posture: derivePetPosture({
      eventName: state.lastEvent ?? 'daily_login',
      status,
      previousPosture: state.posture,
    }),
    updatedAt: now,
  };

  await petOsDb.pet_state.put(nextState);
  emitPetStateChange(nextState);
  return nextState;
}

export async function setPetMuted(muted: boolean) {
  const { state } = await ensurePetOsRecords();
  const nextState: PetStateRecord = {
    ...state,
    muted,
    bubbleText: muted ? null : state.bubbleText,
    bubbleLineId: muted ? null : state.bubbleLineId,
    bubbleEvent: muted ? null : state.bubbleEvent,
    bubblePriority: muted ? 0 : state.bubblePriority,
    bubbleExpiresAt: muted ? null : state.bubbleExpiresAt,
    updatedAt: Date.now(),
  };
  await petOsDb.pet_state.put(nextState);
  emitPetStateChange(nextState);
  return nextState;
}

export function subscribePetState(callback: (state: PetStateRecord) => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const onStateChange = (event: Event) => {
    const detail = (event as CustomEvent<PetStateRecord>).detail;
    if (detail?.key === 'pet_state') {
      callback(detail);
    }
  };

  window.addEventListener(PET_STATE_CHANGE_EVENT, onStateChange as EventListener);
  return () => {
    window.removeEventListener(PET_STATE_CHANGE_EVENT, onStateChange as EventListener);
  };
}
