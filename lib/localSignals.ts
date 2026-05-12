const LOCAL_CHANGE_EVENT = 'fwe:local-change';

export const LOCAL_NUMBER_KEYS = {
  salary: 'cl_monthly_salary',
  xp: 'cl_hacker_xp',
  trees: 'cl_hacker_trees',
  touchFishCounter: 'cl_touch_fish_counter',
  coffeeCounter: 'cl_coffee_counter',
  currentLife: 'cl_current_life_mirror',
  artifactSavedSignal: 'pet_artifact_saved_signal',
} as const;

export type LocalNumberKey = (typeof LOCAL_NUMBER_KEYS)[keyof typeof LOCAL_NUMBER_KEYS];

// ─── Work settings (used by Profile saveWageEditor) ─────────
export const LOCAL_STRING_KEYS = {
  workStart: 'cl_work_start',
  workEnd: 'cl_work_end',
  focusSessions: 'cl_focus_sessions',
} as const;

export type LocalStringKey = (typeof LOCAL_STRING_KEYS)[keyof typeof LOCAL_STRING_KEYS];

export function readLocalNumber(key: LocalNumberKey, fallback: number) {
  const raw = localStorage.getItem(key);
  const parsed = Number(raw);
  return raw !== null && !Number.isNaN(parsed) ? parsed : fallback;
}

export function writeLocalNumber(key: LocalNumberKey, value: number) {
  localStorage.setItem(key, String(value));
  window.dispatchEvent(new CustomEvent(LOCAL_CHANGE_EVENT, { detail: { key, value } }));
  return value;
}

export function incrementLocalNumber(key: LocalNumberKey, fallback = 0) {
  return writeLocalNumber(key, readLocalNumber(key, fallback) + 1);
}

export function subscribeLocalNumber(
  key: LocalNumberKey,
  fallback: number,
  callback: (value: number) => void,
) {
  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent<{ key: LocalNumberKey; value: number }>).detail;
    if (detail?.key === key) {
      callback(detail.value);
    }
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === key) {
      callback(readLocalNumber(key, fallback));
    }
  };

  window.addEventListener(LOCAL_CHANGE_EVENT, onCustom as EventListener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(LOCAL_CHANGE_EVENT, onCustom as EventListener);
    window.removeEventListener('storage', onStorage);
  };
}

// ─── String settings (workStart, workEnd, focusSessions) ────

export function writeLocalString(key: LocalStringKey, value: string) {
  localStorage.setItem(key, value);
  window.dispatchEvent(new CustomEvent(LOCAL_CHANGE_EVENT, { detail: { key, value } }));
  return value;
}

export function readLocalString(key: LocalStringKey, fallback: string) {
  return localStorage.getItem(key) ?? fallback;
}

export function subscribeLocalString(
  key: LocalStringKey,
  fallback: string,
  callback: (value: string) => void,
) {
  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent<{ key: LocalStringKey; value: string }>).detail;
    if (detail?.key === key) {
      callback(detail.value);
    }
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === key) {
      callback(readLocalString(key, fallback));
    }
  };

  window.addEventListener(LOCAL_CHANGE_EVENT, onCustom as EventListener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(LOCAL_CHANGE_EVENT, onCustom as EventListener);
    window.removeEventListener('storage', onStorage);
  };
}
