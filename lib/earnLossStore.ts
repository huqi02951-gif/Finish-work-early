export type EarnLossType =
  | 'paid_poop'
  | 'touch_fish'
  | 'drink_coffee'
  | 'overtime_loss';

export interface EarnLossRecord {
  id: string;
  type: EarnLossType;
  /** positive = 赚钱, negative = 损失 */
  amount: number;
  /** seconds duration (0 for point-click like touch_fish / drink_coffee) */
  duration: number;
  timestamp: number;
  dateKey: string;
}

export interface EarnLossSummary {
  earnTotal: number;
  lossTotal: number;
  overtimeLossTotal: number;
  /** 带薪拉屎: 累计赚到的钱 */
  paidPoopEarn: number;
  /** 带薪拉屎: 累计分钟数 */
  paidPoopMin: number;
  /** 带薪拉屎: 次数 */
  paidPoopCount: number;
  /** 摸鱼奖励: 累计赚到的钱 */
  touchFishEarn: number;
  /** 摸鱼奖励: 累计分钟数 */
  touchFishMin: number;
  /** 摸鱼奖励: 次数 */
  touchFishCount: number;
  /** 喝咖啡: 折算赚到的钱 */
  coffeeEarn: number;
  /** 喝咖啡: 杯数 */
  coffeeCount: number;
  /** 加班亏损: 累计分钟数 */
  otMin: number;
}

const KEY_PREFIX = 'cl_earn_loss';
const CHANGE_EVENT = 'fwe:earn-loss-change';

function todayKey() {
  return `${KEY_PREFIX}_${new Date().toDateString()}`;
}

function readRecords(): EarnLossRecord[] {
  try {
    const raw = localStorage.getItem(todayKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecords(records: EarnLossRecord[]) {
  localStorage.setItem(todayKey(), JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: records }));
}

/** 每分钟最大 overtime_loss 写入次数（防重复上限） */
const OVERTIME_MIN_INTERVAL_MS = 30_000;

function getLastOvertimeRecord(dateKey: string): EarnLossRecord | null {
  const records = readRecords();
  let last: EarnLossRecord | null = null;
  for (const r of records) {
    if (r.dateKey === dateKey && r.type === 'overtime_loss' && (!last || r.timestamp > last.timestamp)) {
      last = r;
    }
  }
  return last;
}

function summarize(records: EarnLossRecord[]): EarnLossSummary {
  const summary: EarnLossSummary = {
    earnTotal: 0,
    lossTotal: 0,
    overtimeLossTotal: 0,
    paidPoopEarn: 0,
    paidPoopMin: 0,
    paidPoopCount: 0,
    touchFishEarn: 0,
    touchFishMin: 0,
    touchFishCount: 0,
    coffeeEarn: 0,
    coffeeCount: 0,
    otMin: 0,
  };

  for (const r of records) {
    if (r.amount > 0) summary.earnTotal += r.amount;
    if (r.amount < 0) summary.lossTotal += Math.abs(r.amount);

    if (r.type === 'overtime_loss') {
      summary.overtimeLossTotal += Math.abs(r.amount);
      summary.otMin += Math.max(0, Math.round((r.duration || 0) / 60));
    } else if (r.type === 'paid_poop') {
      summary.paidPoopEarn += Math.max(0, r.amount);
      summary.paidPoopMin += Math.max(0, Math.round((r.duration || 0) / 60));
      summary.paidPoopCount += 1;
    } else if (r.type === 'touch_fish') {
      summary.touchFishEarn += Math.max(0, r.amount);
      summary.touchFishMin += Math.max(0, Math.round((r.duration || 0) / 60));
      summary.touchFishCount += 1;
    } else if (r.type === 'drink_coffee') {
      summary.coffeeEarn += Math.max(0, r.amount);
      summary.coffeeCount += 1;
    }
  }

  return summary;
}

export const earnLossStore = {
  append(rec: Omit<EarnLossRecord, 'id'>) {
    const records = readRecords();
    const entry: EarnLossRecord = { ...rec, id: `${rec.timestamp}_${rec.type}_${Math.random().toString(36).slice(2, 8)}` };
    records.push(entry);
    writeRecords(records);
    return entry;
  },

  /**
   * 记录加班损失，带防重复：同一分钟内最多写一次
   * 自动计算损失金额，写入负数
   */
  recordOvertimeLoss(params: {
    minuteRate: number;
    otMinutes: number;
    dateKey: string;
  }): EarnLossRecord | null {
    const lastRecord = getLastOvertimeRecord(params.dateKey);
    const now = Date.now();
    if (lastRecord && now - lastRecord.timestamp < OVERTIME_MIN_INTERVAL_MS) {
      return null; // 防重复：30 秒内不再写
    }
    const lastLoggedMinutes = lastRecord ? Math.floor(lastRecord.duration / 60) : 0;
    const deltaMinutes = params.otMinutes - lastLoggedMinutes;
    if (deltaMinutes <= 0) {
      return null;
    }
    const loss = -(params.minuteRate * deltaMinutes);
    return this.append({
      type: 'overtime_loss',
      amount: loss,
      duration: params.otMinutes * 60,
      timestamp: now,
      dateKey: params.dateKey,
    });
  },

  getToday() {
    return readRecords();
  },

  getTodaySummary() {
    return summarize(readRecords());
  },

  getTodayEarnTotal() {
    return this.getTodaySummary().earnTotal;
  },

  getTodayLossTotal() {
    return this.getTodaySummary().lossTotal;
  },

  /** 获取当天 overtime_loss 累计（不含其他损失） */
  getTodayOvertimeLossTotal() {
    return this.getTodaySummary().overtimeLossTotal;
  },

  subscribe(callback: (summary: EarnLossSummary) => void) {
    const emit = () => callback(this.getTodaySummary());
    const onCustom = () => emit();
    const onStorage = () => emit();
    window.addEventListener(CHANGE_EVENT, onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
    };
  },

  clearToday() {
    writeRecords([]);
  },
};
