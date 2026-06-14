export type OfficePropId =
  | 'establishment_cage'
  | 'contract_brick'
  | 'paper_arrow_rain'
  | 'kpi_dagger_bomb'
  | 'shoe_sole_stamp'
  | 'attendance_mace'
  | 'paperwork_mountain';

export interface OfficeProp {
  id: OfficePropId;
  name: string;
  emoji: string;
  unlockLevel: number;
  damage: number;
  spGain: number;
  judgmentGain: number;
  breakGain: number;
  label: string;
  description: string;
  effectTone: string;
}

export const OFFICE_PROPS: OfficeProp[] = [
  {
    id: 'contract_brick',
    name: '合同板砖',
    emoji: '🧱',
    unlockLevel: 1,
    damage: 980,
    spGain: 18,
    judgmentGain: 12,
    breakGain: 10,
    label: '板砖拍脸',
    description: '把它拿来压人的合同条款拍回它自己脑门。',
    effectTone: '合同板砖：霸王条款碎成纸渣'
  },
  {
    id: 'shoe_sole_stamp',
    name: '鞋底封脸',
    emoji: '👞',
    unlockLevel: 2,
    damage: 1280,
    spGain: 20,
    judgmentGain: 13,
    breakGain: 12,
    label: '鞋底盖章',
    description: '专治阴阳怪气和当面一套背后一套。',
    effectTone: '鞋底盖章：假笑面具当场下线'
  },
  {
    id: 'paper_arrow_rain',
    name: '回形针万箭',
    emoji: '📎',
    unlockLevel: 3,
    damage: 1680,
    spGain: 26,
    judgmentGain: 16,
    breakGain: 14,
    label: '万箭穿话术',
    description: '不是血腥万箭，是回形针把所有甩锅话术钉成证据链。',
    effectTone: '万箭穿话术：聊天记录已钉入案卷'
  },
  {
    id: 'establishment_cage',
    name: '编制铁笼',
    emoji: '🏛️',
    unlockLevel: 5,
    damage: 2100,
    spGain: 18,
    judgmentGain: 18,
    breakGain: 18,
    label: '编制锁魂',
    description: '把靠身份压人的优越感关回笼子。',
    effectTone: '编制铁笼：身份光环不构成免责'
  },
  {
    id: 'kpi_dagger_bomb',
    name: 'KPI匕首雷',
    emoji: '💣',
    unlockLevel: 8,
    damage: 2550,
    spGain: 28,
    judgmentGain: 20,
    breakGain: 20,
    label: '绩效爆破',
    description: '把它画的饼、埋的雷和偷的功一起炸成废表。',
    effectTone: 'KPI匕首雷：画饼系统爆表'
  },
  {
    id: 'attendance_mace',
    name: '考勤狼牙棒',
    emoji: '🦴',
    unlockLevel: 11,
    damage: 3100,
    spGain: 30,
    judgmentGain: 22,
    breakGain: 24,
    label: '考勤重锤',
    description: '专打卡点催命、深夜甩活、周末装死。',
    effectTone: '考勤狼牙棒：加塞催命被打回未读'
  },
  {
    id: 'paperwork_mountain',
    name: '工作纸山',
    emoji: '📄',
    unlockLevel: 14,
    damage: 3800,
    spGain: 34,
    judgmentGain: 26,
    breakGain: 28,
    label: '文件糊头',
    description: '把烂摊子、返工单和伪造证据甩回小人头上。',
    effectTone: '工作纸山：烂摊归主，证据封存'
  }
];
