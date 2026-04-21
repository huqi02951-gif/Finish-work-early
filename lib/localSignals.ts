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
