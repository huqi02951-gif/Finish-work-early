import {
  PET_OS_COPY_VERSION,
  PET_OS_EVENT_LABELS,
  PET_OS_LINE_BANK,
  PET_OS_POSTURE_LABELS,
} from '../content/petOsResources';
import type { PetOsEventName, PetPosture } from './petOsTypes';

export function loadPetOsResources() {
  return {
    version: PET_OS_COPY_VERSION,
    eventLabels: PET_OS_EVENT_LABELS,
    postureLabels: PET_OS_POSTURE_LABELS,
  };
}

export function getPetEventLabel(eventName: PetOsEventName) {
  return PET_OS_EVENT_LABELS[eventName];
}

export function getPetPostureLabel(posture: PetPosture) {
  return PET_OS_POSTURE_LABELS[posture];
}

export function pickPetLine(input: {
  eventName: PetOsEventName;
  previousLineId: string | null;
  sequence: number;
}) {
  const lines = PET_OS_LINE_BANK[input.eventName];
  if (!lines.length) return null;

  const startIndex = input.sequence % lines.length;
  const preferred = lines[startIndex];
  if (preferred.id !== input.previousLineId || lines.length === 1) {
    return preferred;
  }

  return lines.find((line) => line.id !== input.previousLineId) ?? preferred;
}

export function getPetStatusSummary(input: {
  lastEvent: PetOsEventName | null;
  lastStatus: string | null;
  currentLife: number;
  muted: boolean;
}) {
  const { lastEvent, lastStatus, currentLife } = input;

  if (Number.isFinite(currentLife) && currentLife < 20) {
    return '它睡着了';
  }

  if (lastEvent === 'life_critical' || lastEvent === 'status_change_overtime' || lastStatus === 'OVERTIME') {
    return '它有点不放松';
  }

  if (Number.isFinite(currentLife) && currentLife < 40 && lastStatus === 'WORKING') {
    return '它有点蔫蔫的';
  }

  if (lastEvent === 'daily_login' || lastEvent === 'drink_coffee' || lastEvent === 'status_change_off_duty' || lastStatus === 'OFF_DUTY') {
    return '它看起来还不错';
  }

  return '它就安静坐着';
}
