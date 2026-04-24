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
  const overtimeLossTotal = records
    .filter((r) => r.type === 'overtime_loss')
    .reduce((sum, r) => sum + Math.abs(r.amount), 0);
  const lossTotal = records
    .filter((r) => r.amount < 0)
    .reduce((sum, r) => sum + Math.abs(r.amount), 0);

  return {
    earnTotal: records
      .filter((r) => r.amount > 0)
      .reduce((sum, r) => sum + r.amount, 0),
    lossTotal,
    overtimeLossTotal,
  };
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
