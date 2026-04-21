import type { PetOsEventName, PetPosture } from '../lib/petOsTypes';

export const PET_OS_COPY_VERSION = 'v1.2.0' as const;

export const PET_OS_EVENT_LABELS: Record<PetOsEventName, string> = {
  daily_login: '每日登录',
  long_absence: '长时间离线',
  life_critical: '生命值过低',
  status_change_off_duty: '切回休整',
  status_change_overtime: '进入加班',
  touch_fish: '带薪发呆',
  drink_coffee: '续命咖啡',
  artifact_saved: '保存物料',
};

export const PET_OS_POSTURE_LABELS: Record<PetPosture, string> = {
  idle: '待机',
  awake: '唤醒',
  quiet: '静默',
  rest: '休整',
  working: '跟随中',
  alert: '告警',
  pause: '摸鱼',
  recover: '回温',
  focused: '专注',
};

/**
 * PET_OS 文案库 v1.2.0 冻结版。
 * 规则：
 *   - 每条 ≤ 20 个中文字符
 *   - 禁止英文、数字、emoji、感叹号
 *   - 克制、平静、旁观，不煽情、不说教、不夸赞
 *   - 每类 6 条
 */
export const PET_OS_LINE_BANK: Record<PetOsEventName, Array<{ id: string; text: string }>> = {
  daily_login: [
    { id: 'daily_login_01', text: '你来了' },
    { id: 'daily_login_02', text: '今天也坐一会儿吧' },
    { id: 'daily_login_03', text: '我在' },
    { id: 'daily_login_04', text: '嗯，开始了' },
    { id: 'daily_login_05', text: '一切如旧' },
    { id: 'daily_login_06', text: '今天也慢慢来' },
  ],
  long_absence: [
    { id: 'long_absence_01', text: '我以为你忘了这里' },
    { id: 'long_absence_02', text: '好久没见' },
    { id: 'long_absence_03', text: '你还在' },
    { id: 'long_absence_04', text: '不打招呼就走了一阵子' },
    { id: 'long_absence_05', text: '回来就好' },
    { id: 'long_absence_06', text: '我还在原地' },
  ],
  life_critical: [
    { id: 'life_critical_01', text: '你还好吗' },
    { id: 'life_critical_02', text: '要不要歇一下' },
    { id: 'life_critical_03', text: '不用撑着' },
    { id: 'life_critical_04', text: '我看到了' },
    { id: 'life_critical_05', text: '慢一点' },
    { id: 'life_critical_06', text: '这样下去不行' },
  ],
  status_change_off_duty: [
    { id: 'status_change_off_duty_01', text: '今天，可以了' },
    { id: 'status_change_off_duty_02', text: '合上电脑吧' },
    { id: 'status_change_off_duty_03', text: '到此为止' },
    { id: 'status_change_off_duty_04', text: '该走了' },
    { id: 'status_change_off_duty_05', text: '够了' },
    { id: 'status_change_off_duty_06', text: '今天就这样' },
  ],
  status_change_overtime: [
    { id: 'status_change_overtime_01', text: '又要加班啊' },
    { id: 'status_change_overtime_02', text: '别太用力' },
    { id: 'status_change_overtime_03', text: '早点回去' },
    { id: 'status_change_overtime_04', text: '你决定就好' },
    { id: 'status_change_overtime_05', text: '记得喝水' },
    { id: 'status_change_overtime_06', text: '我在这里' },
  ],
  touch_fish: [
    { id: 'touch_fish_01', text: '嗯，这个很重要' },
    { id: 'touch_fish_02', text: '摸鱼是你的权利' },
    { id: 'touch_fish_03', text: '偷点懒也行' },
    { id: 'touch_fish_04', text: '不用一直绷着' },
    { id: 'touch_fish_05', text: '我站你这边' },
    { id: 'touch_fish_06', text: '歇一会儿没事' },
  ],
  drink_coffee: [
    { id: 'drink_coffee_01', text: '慢点喝' },
    { id: 'drink_coffee_02', text: '小心烫' },
    { id: 'drink_coffee_03', text: '别空腹' },
    { id: 'drink_coffee_04', text: '这杯喝完再动' },
    { id: 'drink_coffee_05', text: '嗯，提神就好' },
    { id: 'drink_coffee_06', text: '不用喝太急' },
  ],
  artifact_saved: [
    { id: 'artifact_saved_01', text: '又做完一件' },
    { id: 'artifact_saved_02', text: '留下了一点什么' },
    { id: 'artifact_saved_03', text: '嗯，记下了' },
    { id: 'artifact_saved_04', text: '存好了' },
    { id: 'artifact_saved_05', text: '今天也有一点进展' },
    { id: 'artifact_saved_06', text: '这件事你做过了' },
  ],
};
