import Dexie, { type EntityTable } from 'dexie';

export type PetOsEventName =
  | 'daily_login'
  | 'long_absence'
  | 'status_change'
  | 'touch_fish'
  | 'drink_coffee'
  | 'artifact_saved';

export interface PetIdentityRecord {
  key: 'pet_identity';
  namespace: 'pet_os';
  version: 'v2.4.0';
  createdAt: number;
  updatedAt: number;
}

export interface PetStateRecord {
  key: 'pet_state';
  lastEvent: PetOsEventName | null;
  lastEventId: string | null;
  lastEventAt: number | null;
  lastStatus: string | null;
  posture: string;
  muted: boolean;
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
    muted: false,
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

  const nextIdentity = identity ?? buildDefaultIdentity(now);
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

export async function recordPetEvent(
  eventName: PetOsEventName,
  payload?: { status?: string; timestamp?: number; absenceHours?: number },
) {
  const { state, cooldown } = await ensurePetOsRecords();
  const now = payload?.timestamp ?? Date.now();
  const nextStatus = payload?.status ?? state.lastStatus;
  const nextPosture =
    eventName === 'touch_fish'
      ? 'pause'
      : eventName === 'drink_coffee'
        ? 'recover'
        : eventName === 'artifact_saved'
          ? 'focused'
          : eventName === 'daily_login'
            ? 'awake'
            : eventName === 'long_absence'
              ? 'quiet'
              : nextStatus === 'OVERTIME'
                ? 'alert'
                : nextStatus === 'WORKING'
                  ? 'working'
                  : nextStatus === 'OFF_DUTY'
                    ? 'rest'
                    : state.posture;
  const nextState: PetStateRecord = {
    ...state,
    lastEvent: eventName,
    lastEventId: `${eventName}:${now}`,
    lastEventAt: now,
    lastStatus: nextStatus,
    posture: nextPosture,
    lastSeenAt: eventName === 'daily_login' || eventName === 'long_absence' ? now : state.lastSeenAt,
    absenceHours: payload?.absenceHours ?? state.absenceHours,
    eventCounters: {
      ...state.eventCounters,
      [eventName]: (state.eventCounters[eventName] ?? 0) + 1,
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
    nextState = await recordPetEvent('daily_login', { timestamp: now });
  }

  if (previousSeenAt && now - previousSeenAt >= PET_OS_ABSENCE_THRESHOLD_MS) {
    nextState = await recordPetEvent('long_absence', {
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
  return recordPetEvent('status_change', { status });
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
