import type { PetMoodTint, PetOsEventName, PetPosture } from './petOsTypes';

export function derivePetPosture(input: {
  eventName: PetOsEventName;
  status: string | null;
  previousPosture: PetPosture;
}): PetPosture {
  const { eventName, status, previousPosture } = input;

  if (eventName === 'touch_fish') return 'pause';
  if (eventName === 'drink_coffee') return 'recover';
  if (eventName === 'artifact_saved') return 'focused';
  if (eventName === 'daily_login') return 'awake';
  if (eventName === 'long_absence') return 'quiet';
  if (eventName === 'life_critical') return 'alert';
  if (eventName === 'status_change_overtime') return 'alert';
  if (eventName === 'status_change_off_duty') return 'rest';
  if (status === 'OVERTIME') return 'alert';
  if (status === 'WORKING') return 'working';
  if (status === 'OFF_DUTY') return 'rest';
  return previousPosture;
}

export function getPetMoodTint(posture: PetPosture): PetMoodTint {
  if (posture === 'alert') return 'amber';
  if (posture === 'recover') return 'pink';
  if (posture === 'focused' || posture === 'working') return 'blue';
  if (posture === 'awake' || posture === 'rest') return 'green';
  return 'slate';
}

/**
 * PetOsCard 对外姿态枚举（v1.2 冻结的 5 档中文姿态）
 */
export type PetCardPosture = '精神' | '平常' | '疲惫' | '担心' | '睡着';

/**
 * 将主链内部的 9 档 PetPosture 映射为 PetOsCard 接受的 5 档中文姿态。
 * 规则（判定顺序，首次命中即返回）：
 *   1. currentLife < 20           -> 睡着
 *   2. engine posture = alert     -> 担心
 *   3. currentLife < 40 且 WORKING -> 疲惫
 *   4. engine posture = awake/recover/rest -> 精神
 *   5. 兜底                        -> 平常
 *
 * 该函数为纯函数，不读 localStorage、不订阅、不写入。
 */
export function getCardPosture(
  enginePosture: PetPosture,
  currentLife: number,
  status: string | null,
): PetCardPosture {
  if (Number.isFinite(currentLife) && currentLife < 20) return '睡着';
  if (enginePosture === 'alert') return '担心';
  if (Number.isFinite(currentLife) && currentLife < 40 && status === 'WORKING') return '疲惫';
  if (enginePosture === 'awake' || enginePosture === 'recover' || enginePosture === 'rest') return '精神';
  return '平常';
}

/**
 * 将 STATUS 映射为 PetOsCard 的 moodTint Tailwind class 字符串。
 * 与 v1.2 的三色原则对齐：暖米白 / 中性浅灰 / 冷青灰。
 * 未知 status 返回空字符串，此时 PetOsCard 回退到 posture 自身底色。
 */
export function getCardMoodTint(status: string | null): string {
  if (status === 'OFF_DUTY') {
    return 'bg-[#fef9e7] border-[#fde68a]/40 text-[#78350f]';
  }
  if (status === 'OVERTIME') {
    return 'bg-[#eff6ff] border-[#bfdbfe]/40 text-[#1e3a8a]';
  }
  if (status === 'WORKING') {
    return 'bg-[#fafaf9] border-[#e7e5e4]/50 text-brand-dark';
  }
  return '';
}
