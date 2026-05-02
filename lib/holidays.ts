export interface HolidayEntry {
  date: string;
  name: string;
  emoji: string;
  /** 给宠物 / hero 副标用的一句话 */
  vibe: string;
}

const TABLE: Record<string, Omit<HolidayEntry, 'date'>> = {
  '2026-01-01': { name: '元旦',     emoji: '🎉', vibe: '新的一年,先躺平 30 分钟。' },
  '2026-02-17': { name: '春节',     emoji: '🧧', vibe: '红包先收着,工作回来再说。' },
  '2026-02-18': { name: '春节',     emoji: '🧧', vibe: '吃饺子比 KPI 重要。' },
  '2026-02-19': { name: '春节',     emoji: '🧧', vibe: '亲戚问年终奖时,深呼吸。' },
  '2026-04-04': { name: '清明',     emoji: '🌸', vibe: '春风正好,别想代码。' },
  '2026-05-01': { name: '劳动节',   emoji: '✊', vibe: '今天最不该劳动的人就是你。' },
  '2026-06-19': { name: '端午',     emoji: '🛶', vibe: '咸甜粽子之争,比上班轻松多了。' },
  '2026-09-25': { name: '中秋',     emoji: '🌕', vibe: '月亮看你,你看摸鱼时长。' },
  '2026-10-01': { name: '国庆',     emoji: '🇨🇳', vibe: '七天假期开局,先睡到自然醒。' },
  '2026-10-02': { name: '国庆',     emoji: '🇨🇳', vibe: '日历翻一页,人生轻一寸。' },
  '2026-10-03': { name: '国庆',     emoji: '🇨🇳', vibe: '出门看人海,胜过看群消息。' },
  '2026-12-25': { name: '圣诞',     emoji: '🎄', vibe: '今天工资照领,礼物自买。' },
};

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getHolidayToday(now: Date = new Date()): HolidayEntry | null {
  const key = fmt(now);
  const hit = TABLE[key];
  if (!hit) return null;
  return { date: key, ...hit };
}

export type DayMode = 'workday' | 'weekend' | 'holiday';

export function getDayMode(now: Date = new Date()): DayMode {
  if (getHolidayToday(now)) return 'holiday';
  const day = now.getDay();
  if (day === 0 || day === 6) return 'weekend';
  return 'workday';
}
