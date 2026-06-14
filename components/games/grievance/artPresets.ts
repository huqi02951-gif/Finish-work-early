import { LevelArtPreset, StressType } from './types';
import officePaperDemonAsset from './assets/bosses/office-paper-demon.png';
import karmaFurnaceAsset from './assets/effects/karma-furnace.png';
import officeHellStageAsset from './assets/ui/office-hell-stage.png';

export { karmaFurnaceAsset, officeHellStageAsset };

const palette = {
  cyan: '#36f3e6',
  red: '#ef2b24',
  gold: '#d7a84d',
  orange: '#ff6a1a',
  violet: '#a855f7',
  ice: '#67e8f9',
  green: '#67e8a5'
};

const bossNames = [
  ['嚼话根子鬼', '嘴上说随口，背后开小会'],
  ['剪线离间鬼', '一手红线一手小群截图'],
  ['铁树背刺鬼', '笑着递咖啡，背后插回形针'],
  ['孽镜笑面鬼', '白莲假面比工牌还厚'],
  ['蒸笼嘴碎鬼', '低频热雾全天开喷'],
  ['铜柱借势鬼', '拿上面意思当护身符'],
  ['刀山卡晋升鬼', '机会来了先给你铺刀路'],
  ['冰山已读鬼', '看见不回，吊着消耗'],
  ['油锅反咬鬼', '你帮它，它回头卖你'],
  ['牛坑吸血鬼', '把同事当永动牛马'],
  ['石压甩锅鬼', '锅甩出去，今天压回本位'],
  ['舂臼返工鬼', '一版又一版，折腾到天亮'],
  ['血池污名鬼', '污染名声，偷人清净'],
  ['枉死背锅鬼', '假证一开，清白受冤'],
  ['磔刑设局鬼', '笑面布网，专坑入局'],
  ['火山迁怒鬼', '自己爆炸，拉全组陪葬'],
  ['石磨烂摊鬼', '烂摊外包，拖人下水'],
  ['阿鼻终局鬼', '恶业总账，十八层合卷']
] as const;

const hazardByLevel = [
  '封口胶带、红舌符、闲话弹幕',
  '断裂红线、双面传话单、剪影刃光',
  '铁枝倒刺、回形针箭雨、背刺警报',
  '照罪镜光、假面裂纹、白莲脱皮',
  '热雾蒸笼、恶气回旋、口水雾墙',
  '铜柱锁链、权势烙印、福德漏气',
  '刀山路障、晋升门牌、标准漂移',
  '冰晶封屏、已读回执、冷气反扑',
  '油泡漫画、反咬锅铲、恩怨回锅',
  '牛马工牌、吸血账单、劳役回流',
  '巨石压锅、责任回执、锅盖坠落',
  '舂臼齿轮、返工循环、会议锤声',
  '污名黑墨、清白回流、谣言退潮',
  '枉死案牌、假证破裂、冤气照明',
  '机关红线、坑局反锁、蛛网裂隙',
  '火山怒焰、迁怒回弹、爆燃警报',
  '石磨旋盘、烂摊收据、拖累归主',
  '无间刀锯、总账合卷、业火满屏'
] as const;

const colorForLevel = (level: number) => {
  if (level === 8) return { accentColor: palette.ice, ghostColor: '#2dd4bf', dangerColor: '#38bdf8' };
  if (level === 16 || level === 18) return { accentColor: palette.red, ghostColor: '#fb7185', dangerColor: '#f97316' };
  if ([4, 14, 15].includes(level)) return { accentColor: palette.violet, ghostColor: '#c084fc', dangerColor: '#fb7185' };
  if ([9, 12, 17].includes(level)) return { accentColor: palette.orange, ghostColor: '#f97316', dangerColor: '#ef4444' };
  if ([6, 10, 11].includes(level)) return { accentColor: palette.gold, ghostColor: '#facc15', dangerColor: '#fb923c' };
  return { accentColor: palette.cyan, ghostColor: '#22d3ee', dangerColor: '#ef4444' };
};

const ultimateForLevel = (level: number): LevelArtPreset['ultimateSkin'] => {
  if ([4, 6, 11, 14].includes(level)) return 'seal';
  if ([8, 16, 18].includes(level)) return 'chime';
  return 'shred';
};

export const HELL_ART_PRESETS: LevelArtPreset[] = bossNames.map(([title, subtitle], index) => {
  const level = index + 1;
  const colors = colorForLevel(level);
  return {
    id: `art_hell_${level}`,
    levelId: '',
    bossTitle: title,
    bossSubtitle: subtitle,
    stageBackground: officeHellStageAsset,
    furnaceText: level === 18 ? '阿鼻总账炉' : ['口业焚尽', '恶缘剪断', '暗箭回枝', '假面照破', '恶气蒸干'][index % 5],
    comboTarget: Math.min(36, 8 + level + Math.floor(level / 3)),
    ultimateSkin: ultimateForLevel(level),
    glyph: ['口', '剪', '刺', '照', '蒸', '势', '刀', '冰', '油', '牛', '锅', '舂', '污', '冤', '局', '火', '磨', '终'][index],
    hazard: hazardByLevel[index],
    ...colors,
    boss: {
      id: `boss_paper_${level}`,
      title,
      subtitle,
      asset: officePaperDemonAsset,
      maskLabel: ['造谣', '离间', '背刺', '伪善', '恶口', '借势', '卡位', '冷暴', '反咬', '吸血', '甩锅', '返工', '污名', '诬陷', '设局', '迁怒', '拖累', '阿鼻'][index],
      paperTags: [title.slice(0, 4), '职场小人', '恶业在审'],
      horns: level >= 15 ? 'crown' : level >= 9 ? 'long' : level >= 4 ? 'broken' : 'short',
      ...colors
    }
  };
});

export const getLevelArtPreset = (stress: StressType): LevelArtPreset => {
  const byLevel = HELL_ART_PRESETS[Math.max(0, Math.min(HELL_ART_PRESETS.length - 1, stress.level - 1))];
  return {
    ...byLevel,
    id: stress.artPresetId || byLevel.id,
    levelId: stress.id,
    bossTitle: stress.bossTitle || byLevel.bossTitle,
    bossSubtitle: stress.bossSubtitle || byLevel.bossSubtitle,
    stageBackground: stress.stageBackground || byLevel.stageBackground,
    furnaceText: stress.furnaceText || byLevel.furnaceText,
    comboTarget: stress.comboTarget || byLevel.comboTarget,
    ultimateSkin: stress.ultimateSkin || byLevel.ultimateSkin
  };
};
