import { HellLevel, MonsterStyle, Weapon } from './types';

const makeApologies = (sin: string, behavior: string, repair: string) => [
  `我错了，我不该${behavior}，把自己的低频恶念甩到别人身上。`,
  `我错了，我的${sin}已经入了天曹功过簿，今天愿意原地认账。`,
  `我错了，我以后不再用职场话术包装坏心眼，所有责任回到我自己身上。`,
  `我错了，${repair}，该归还的机会、名声、边界和清净都归还原主。`
];

const WORKPLACE_LANGUAGE_PATCHES: Record<string, Partial<Pick<HellLevel, 'description' | 'workplaceSin' | 'bureauLine' | 'verdict' | 'realityReply' | 'nonSelfFriction' | 'tags' | 'apologies'>>> = {
  hell_tongue: {
    description: '“我不是造谣，我只是茶水间同步一下风向。”',
    workplaceSin: '嚼话根子、茶水间造谣、群聊阴阳、把别人的努力说成讨好',
    bureauLine: '司过之神记录：茶水间开炮 +3，嘴碎污染 KPI -99%。',
    verdict: '口业封存，茶水间谣言打回原形。今天把小人的麦克风塞进业火炉。',
    realityReply: '“如果是事实请拿出来源和时间线；如果只是猜测，就不要再用聊天八卦影响别人名声。”',
    tags: ['茶水间开炮', '嚼话根子', '群聊阴阳', '假装提醒', 'KPI造谣'],
    apologies: makeApologies('口业', '茶水间造谣、群聊阴阳、把同事努力说成讨好', '从此闭麦留德，不拿八卦污染别人名声')
  },
  hell_scissor: {
    description: '“我可没挑拨，我只是分别跟你们都真诚聊了聊。”',
    workplaceSin: '两边传话、拆团队关系、制造站队焦虑、把正常协作剪成小团体',
    bureauLine: '功过簿新增：关系红线乱剪，团队信任值扣到报警。',
    verdict: '离间剪断，站队剧本作废。小人的小群截图全部回炉。',
    realityReply: '“我不接受第三方情绪转述。涉及协作的问题，我们当面把事实、需求和边界说清楚。”',
    tags: ['两边传话', '小群站队', '挑拨离间', '拆台暗示', '关系剪线']
  },
  hell_iron_tree: {
    description: '“我只是向上反馈风险，没想到你会这么在意。”',
    workplaceSin: '背后打小报告、抢先汇报抹黑、卡流程、把同事推进背刺刺林',
    bureauLine: '三尸上奏：背刺邮件抄送暗处，冷箭回形针开始反扎。',
    verdict: '暗箭回枝，背刺工单自爆。它写在背后的“客观反馈”今天全部署名归还。',
    realityReply: '“涉及我的问题请同步给我本人。单向背后反馈会造成信息失真，我需要当面核对。”',
    tags: ['背后小报告', '暗中抄送', '流程卡你', '假客观反馈', '背刺回形针']
  },
  hell_mirror: {
    description: '“我一直都很善意啊，是你把我想复杂了。”',
    workplaceSin: '白莲装弱、笑面虎甩责、假装听不懂、用温柔包装算计',
    bureauLine: '孽镜调光：笑面虎皮肤脱落，装无辜滤镜破裂。',
    verdict: '照妖镜开，假面碎成纸屑。小人的“我没这个意思”不再免疫审判。',
    realityReply: '“为避免理解偏差，我们按文字记录、责任链路和最终动作来确认，不按表演情绪确认。”',
    tags: ['笑面虎', '白莲装弱', '假装没懂', '温柔算计', '甩责演技']
  },
  hell_steam: {
    description: '“我说话直，你要学会接受高压环境。”',
    workplaceSin: '情绪倒灌、压力外包、恶语蒸办公室、把低频焦虑甩给执行人',
    bureauLine: '灶神上奏：办公室空气污染，低频蒸汽浓度爆表。',
    verdict: '恶气自蒸，焦虑回锅。小人的情绪垃圾今天在蒸笼里自循环。',
    realityReply: '“可以讨论标准和动作，但人身攻击、阴阳语气和情绪输出不属于工作要求。”',
    tags: ['压力外包', '情绪倒灌', '高压话术', '恶语蒸笼', '低频污染']
  },
  hell_copper: {
    description: '“这是组织的安排，你不要问这么细。”',
    workplaceSin: '拿编制/头衔/关系压人、空降指令、用“上面意思”逃避负责',
    bureauLine: '北斗扣算：虚势铜柱上锁，拿身份压人的福德开始漏电。',
    verdict: '铜柱锁势，虚权反困。小人搬出来的靠山今天变成自己的笼子。',
    realityReply: '“我可以配合组织安排，但请同步目标、授权、责任人和验收口径，方便准确执行。”',
    tags: ['上面意思', '编制压人', '头衔PUA', '虚权铜柱', '不许细问']
  },
  hell_blade_mountain: {
    description: '“你还不够成熟，这个机会我先替你挡掉。”',
    workplaceSin: '卡晋升、吞机会、设置模糊标准、拿成熟度话术挡别人上升',
    bureauLine: '功过簿新增：阻人贵人运，刀山绩效路障启动。',
    verdict: '刀山开路，卡关回弹。小人挡掉的机会今天全部刻回它的工牌。',
    realityReply: '“如果暂不通过，请给出具体差距、量化标准、复盘节点和下一次评估时间。”',
    tags: ['卡晋升', '成熟度话术', '机会拦截', '标准漂移', '暗箱路障']
  },
  hell_ice: {
    description: '“消息我看到了，回不回看我心情。”',
    workplaceSin: 'OA不回、会议冷暴力、已读不回吊人、用沉默制造焦虑',
    bureauLine: '司过之神记录：OA 冷冻 12 小时，协作阴德扣到结冰。',
    verdict: '冰山反冻，冷脸卡死。小人的已读不回今天变成自己的冻结倒计时。',
    realityReply: '“我需要确认是否继续推进。若今天没有反馈，我将按当前版本留痕推进。”',
    tags: ['OA不回', '已读冰封', '会议冷脸', '吊着你', '沉默控制']
  },
  hell_oil: {
    description: '“当初可是你主动帮我的，现在出事你也有责任。”',
    workplaceSin: '反咬帮忙的人、报销恶心人、把支持记录改写成责任陷阱',
    bureauLine: '天曹归档：恩将仇报，油锅报销单开始冒泡。',
    verdict: '油锅回煎，反咬失效。小人端来的黑锅今天热腾腾扣回自己手里。',
    realityReply: '“我们把协助过程、决策节点和责任归属列出来，支持不等于接管责任。”',
    tags: ['反咬一口', '报销恶心人', '支持变背锅', '假帮忙', '责任陷阱']
  },
  hell_ox: {
    description: '“实习生也要有主人翁精神，先把活都接起来。”',
    workplaceSin: '把同事当牛马、压榨实习生、顺手外包、拿能者多劳白嫖资源',
    bureauLine: '功过簿新增：牛马套索乱甩，吸血工时进入反噬队列。',
    verdict: '牛坑回套，劳役归主。小人白嫖的工作量今天自动回到它自己的待办。',
    realityReply: '“这已经超出当前职责和排期。如果需要我承担，请同步资源、优先级和责任调整。”',
    tags: ['实习生压榨', '能者多劳', '顺手白嫖', '牛马套索', '资源黑洞']
  },
  hell_stone: {
    description: '“这个事情不是一直你负责的吗？我只是提醒大家。”',
    workplaceSin: '甩锅背雷、会议后改口、把决策责任压给执行人',
    bureauLine: '北斗扣算：甩锅脑过载，巨石责任单已回传。',
    verdict: '锅回本位，背雷解绑。小人甩出的锅今天带定位砸回原主。',
    realityReply: '“建议按任务来源、决策人、执行人和变更记录确认，避免责任口径混淆。”',
    tags: ['甩锅脑', '会后改口', '执行背雷', '责任压身', '锅体回传']
  },
  hell_mortar: {
    description: '“第一版最好，但第五版的感觉也要，再融合一下。”',
    workplaceSin: '报告重写五遍、需求反复横跳、半夜推翻、让执行人空转',
    bureauLine: '三尸上奏：返工舂臼开机，PPT 第 33 版进入碾压。',
    verdict: '舂臼捣乱，返工归主。小人横跳的需求今天全部捣成一页确认表。',
    realityReply: '“为避免重复返工，我们先冻结验收标准。标准外调整请另开排期。”',
    tags: ['重写五遍', 'PPT第33版', '需求横跳', '第一版最好', '半夜推翻']
  },
  hell_reputation: {
    description: '“我只是善意提醒大家，他这个人风评有点复杂。”',
    workplaceSin: '隐私八卦、给人贴标签、用风评污染名声、把清白说成瓜',
    bureauLine: '名誉池报警：隐私八卦外泄，污名红墨正在回流。',
    verdict: '污名自染，清白回流。小人泼出去的风评脏水今天染回自己的头像。',
    realityReply: '“如果有具体事实请明确场景和证据；抽象风评和隐私八卦不应继续传播。”',
    tags: ['隐私八卦', '风评污染', '乱贴标签', '善意提醒', '脏水回流']
  },
  hell_wronged: {
    description: '“证据不重要，我感觉就是他的问题。”',
    workplaceSin: '无证据定罪、PPT造谣、群里带节奏、让人莫名背黑锅',
    bureauLine: '孽镜重放：33 页 PPT 假证碎裂，冤锅从群聊弹回。',
    verdict: '冤业昭明，假证破裂。小人的“我感觉”今天不再算证据。',
    realityReply: '“感觉不能作为结论。我们按证据、时间线和具体动作复盘。”',
    tags: ['凭感觉定罪', 'PPT造谣', '群里带节奏', '假证词', '冤锅制造']
  },
  hell_scheme: {
    description: '“你先进这个项目，后面的坑我都替你想好了。”',
    workplaceSin: '设局挖坑、把风险塞给新人、群体孤立、让人进局背锅',
    bureauLine: '司过之神记录：机关局布网，风险合同反锁。',
    verdict: '恶局反锁，坑位归主。小人挖的坑今天自动翻成它自己的工位。',
    realityReply: '“这个安排涉及多方责任，我需要先确认目标、授权、风险承担人和退出条件。”',
    tags: ['设局挖坑', '新人背锅', '群体孤立', '风险塞人', '机关合同']
  },
  hell_volcano: {
    description: '“你最好别让我说第二遍，我现在火很大。”',
    workplaceSin: '暴怒迁怒、摔脸色、厕所/工位细节也能借题发火、用怒气压人',
    bureauLine: '北斗扣算：怒火喷发伤人，KPI 火山口反向点燃。',
    verdict: '恶火自焚，迁怒熄火。小人的脾气今天烧回自己的 KPI 达成率。',
    realityReply: '“我可以处理问题，但不接受情绪攻击。请把具体标准和动作说清楚。”',
    tags: ['迁怒火山', '摔脸色', '怒气压人', '借题发火', 'KPI自燃']
  },
  hell_millstone: {
    description: '“这个烂摊子你比较靠谱，最后还是你兜一下。”',
    workplaceSin: '强迫自我反思、末位淘汰恐吓、烂摊外包、狗腿转移绩效',
    bureauLine: '功过簿新增：狗腿绩效转移，石磨待办自动归主。',
    verdict: '石磨归主，兜底终止。小人外包的烂摊子今天自己推到下班。',
    realityReply: '“我可以协助收尾，但需要明确原始责任、剩余风险和补偿资源。”',
    tags: ['烂摊外包', '末位恐吓', '自我反思PUA', '狗腿绩效', '无限兜底']
  },
  hell_final: {
    description: '“我一直这样，规矩就是给别人守的。”',
    workplaceSin: '长期 PUA、抢功甩锅卡晋升全套、无悔作恶、把职场当个人小地府',
    bureauLine: '天曹总簿合卷：PUA、抢功、甩锅、造谣、压榨全部满格。',
    verdict: '无间总账，十八层合卷。小人的全部恶行入炉，灰都不许乱飞。',
    realityReply: '“这类长期模式已经影响协作边界。我会把事实、影响和诉求整理成书面记录，并按正式渠道处理。”',
    tags: ['终极PUA', '全套恶业', '无悔小人', '规矩双标', '总账合卷']
  }
};

// 民俗十八层地狱的职场转译版本。所有刑名只作为漫画化审判符号，不做写实血腥。
const RAW_HELL_LEVELS: HellLevel[] = [
  {
    id: 'hell_tongue',
    level: 1,
    name: '嚼话根子怪',
    hellName: '拔舌地狱',
    title: '口业封舌',
    description: '“我就随口一说，你别太敏感。”',
    workplaceSin: '造谣、阴阳怪气、背后中伤、嘴碎传播',
    sinCategory: '口业',
    judge: '宋帝王',
    tribunal: '三殿查口业',
    bossHp: 24000,
    difficulty: 1,
    disguiseLevel: 1,
    threatLabel: '话根子喷雾机',
    hexagram: '兑卦口业：恶言出口，福门自闭。',
    bureauLine: '司过之神记录：背后嚼舌 +3，口德 -9。',
    verdict: '口业反噬，恶言自返。今天封住小人的闲话麦克风。',
    realityReply: '“如果有具体事实我们可以当面核对。没有事实依据的评价，建议不要继续扩散，避免影响团队信任。”',
    nonSelfFriction: '别人的嘴碎不是你的身份标签，流言只会暴露说话人的层级。',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-400',
    textColor: 'text-rose-700',
    emoji: '👅',
    tags: ['嚼话根子', '阴阳怪气', '背后中伤', '恶意评价', '假装关心'],
    punishment: { theme: 'tongue_seal', emoji: '🤐', label: '封舌符', animationCue: '胶带封麦，闲话弹回', shortEffect: '口业封印' },
    apologies: makeApologies('口业', '背后嚼话根子、阴阳怪气', '从此有事当面说，不再散播低级评价')
  },
  {
    id: 'hell_scissor',
    level: 2,
    name: '离间拆台怪',
    hellName: '剪刀地狱',
    title: '恶缘剪断',
    description: '“我跟你说，他其实一直对你有意见。”',
    workplaceSin: '挑拨同事关系、拆台、制造小团体裂缝',
    sinCategory: '口业',
    judge: '宋帝王',
    tribunal: '口舌争讼复核处',
    bossHp: 28500,
    difficulty: 2,
    disguiseLevel: 2,
    threatLabel: '关系剪线师',
    hexagram: '睽卦示警：挑拨离间者，自失其群。',
    bureauLine: '功过簿新增：制造关系裂缝，善缘扣算一次。',
    verdict: '恶缘剪断，离间失效。剪掉小人手里的关系红线。',
    realityReply: '“这类转述容易产生误会。我们直接拉齐事实和边界，不通过第三方情绪传话。”',
    nonSelfFriction: '真正稳的关系不靠小人传话，挑拨只是他的精神贫瘠。',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-400',
    textColor: 'text-pink-700',
    emoji: '✂️',
    tags: ['挑拨离间', '两边传话', '拆台话术', '小群拉踩', '关系剪线'],
    punishment: { theme: 'scissor_fate', emoji: '✂️', label: '剪恶缘', animationCue: '红线咔嚓断裂', shortEffect: '离间断线' },
    apologies: makeApologies('两舌业', '两边传话挑拨关系', '以后不再制造办公室裂缝')
  },
  {
    id: 'hell_iron_tree',
    level: 3,
    name: '暗箭背刺怪',
    hellName: '铁树地狱',
    title: '暗箭回枝',
    description: '“我可没说你不好，我只是客观反馈。”',
    workplaceSin: '背后打小报告、暗中卡流程、表面友好背地捅刀',
    sinCategory: '行为',
    judge: '五官王',
    tribunal: '五官照罪处',
    bossHp: 33000,
    difficulty: 3,
    disguiseLevel: 3,
    threatLabel: '背刺回形针',
    hexagram: '旅卦浮萍：暗处使刀者，人心渐冷。',
    bureauLine: '三尸上奏：暗箭伤人，恶念反扎。',
    verdict: '暗箭回枝，恶念自缠。它扎出去的刺今天全部回到自己身上。',
    realityReply: '“涉及我的评价请同步给我，我愿意当面澄清和改进，也避免信息在背后变形。”',
    nonSelfFriction: '背刺者见不得光，你只需要把证据和边界放到台面。',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-800',
    emoji: '🌵',
    tags: ['背后放箭', '暗中卡你', '表面好人', '小报告精', '假客观'],
    punishment: { theme: 'iron_tree', emoji: '🌵', label: '铁树反扎', animationCue: '刺枝反向缠绕', shortEffect: '暗箭折返' },
    apologies: makeApologies('暗害业', '表面装好人背后打小报告', '所有评价以后当面说清')
  },
  {
    id: 'hell_mirror',
    level: 4,
    name: '白莲装弱怪',
    hellName: '孽镜地狱',
    title: '孽镜照罪',
    description: '“我真的什么都不知道，可能是你理解错了。”',
    workplaceSin: '装无辜、推卸动机、虚伪伪装、笑面虎式自保',
    sinCategory: '心术',
    judge: '秦广王',
    tribunal: '初殿照业镜',
    bossHp: 38000,
    difficulty: 4,
    disguiseLevel: 5,
    threatLabel: '白莲假面虎',
    hexagram: '离火照伪：假面无所遁形。',
    bureauLine: '天曹调档：装弱免责失败，伪善皮肤脱落。',
    verdict: '孽镜照罪，假面破裂。装无辜不再构成免罪金牌。',
    realityReply: '“为避免理解偏差，我们把当时的沟通记录和责任链路摊开看，按事实说话。”',
    nonSelfFriction: '越会装的人越怕记录，清醒的人不靠情绪对线。',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-700',
    emoji: '🪞',
    tags: ['装无辜', '白莲发言', '笑面虎', '假装没听懂', '甩动机'],
    punishment: { theme: 'karma_mirror', emoji: '🪞', label: '照妖镜', animationCue: '镜光扫脸，假面碎裂', shortEffect: '原形毕露' },
    apologies: makeApologies('虚伪业', '明知故犯还装无辜', '用事实记录代替表演')
  },
  {
    id: 'hell_steam',
    level: 5,
    name: '情绪污染怪',
    hellName: '蒸笼地狱',
    title: '恶气自蒸',
    description: '“我只是说话直，你怎么这么玻璃心。”',
    workplaceSin: '恶语扩散、情绪污染、长期释放低频焦虑',
    sinCategory: '口业',
    judge: '楚江王',
    tribunal: '二殿深查恶气',
    bossHp: 42000,
    difficulty: 4,
    disguiseLevel: 4,
    threatLabel: '低频蒸汽机',
    hexagram: '巽卦入骨：恶气久熏，反蒸其身。',
    bureauLine: '灶神上奏：情绪垃圾倾倒，办公室空气质量 -20。',
    verdict: '恶气自蒸，霉气退散。小人的低频蒸汽今天关进笼里自循环。',
    realityReply: '“具体问题可以直接说标准和修改点，人身评价和情绪输出不利于推进。”',
    nonSelfFriction: '他的情绪不是你的垃圾桶，坏空气到你这里自动隔离。',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-700',
    emoji: '♨️',
    tags: ['情绪倒灌', '说话很冲', '恶语扩散', '焦虑外包', '冷嘲热讽'],
    punishment: { theme: 'steam_cage', emoji: '♨️', label: '蒸笼关麦', animationCue: '热雾罩住低频脸', shortEffect: '恶气回蒸' },
    apologies: makeApologies('恶口业', '把情绪垃圾倒给同事', '只说问题不攻击人')
  },
  {
    id: 'hell_copper',
    level: 6,
    name: '借势压人怪',
    hellName: '铜柱地狱',
    title: '借势反困',
    description: '“这是上面的意思，你自己领会。”',
    workplaceSin: '借权势欺人、贪功贪利、拿身份压人',
    sinCategory: '心术',
    judge: '泰山王',
    tribunal: '权势滥用稽核处',
    bossHp: 47000,
    difficulty: 5,
    disguiseLevel: 4,
    threatLabel: '权势铜柱怪',
    hexagram: '乾卦亢龙：高而无德，必有悔。',
    bureauLine: '北斗扣算：借势欺人，福德自损。',
    verdict: '借势反困，福德自损。它拿来压人的柱子今天反过来卡住它。',
    realityReply: '“我理解要求来自上层。为了准确执行，请把目标、口径和责任边界同步成文字。”',
    nonSelfFriction: '权势话术不等于事实，你只认清晰指令和责任边界。',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-800',
    emoji: '🏛️',
    tags: ['上面意思', '借势压人', '身份碾压', '贪功贪利', '欺软怕硬'],
    punishment: { theme: 'copper_pillar', emoji: '🏛️', label: '铜柱锁势', animationCue: '铜柱落下，虚势卡壳', shortEffect: '借势反困' },
    apologies: makeApologies('贪势业', '拿身份和上级名义压人', '以后把要求说清楚并承担责任')
  },
  {
    id: 'hell_blade_mountain',
    level: 7,
    name: '卡晋升设障怪',
    hellName: '刀山地狱',
    title: '恶路自临',
    description: '“这个机会你还不够成熟，我先帮你挡一下。”',
    workplaceSin: '恶意设障、阻挡晋升、故意让别人走难路',
    sinCategory: '行为',
    judge: '卞城王',
    tribunal: '险阻设局审判处',
    bossHp: 52000,
    difficulty: 5,
    disguiseLevel: 5,
    threatLabel: '晋升卡关王',
    hexagram: '蹇卦险阻：设障者自陷难路。',
    bureauLine: '功过簿新增：阻人机会，断人贵人。',
    verdict: '恶路自临，步步受阻。它给别人铺的刀山，今天自己走。',
    realityReply: '“如果认为我暂不适合，请明确差距标准、下一次评估节点和可量化达成条件。”',
    nonSelfFriction: '真正的机会不会被一句模糊评价定义，你要的是标准，不是他的嘴脸。',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-700',
    emoji: '⛰️',
    tags: ['卡晋升', '机会拦截', '故意为难', '标准漂移', '你还不成熟'],
    punishment: { theme: 'blade_mountain', emoji: '⛰️', label: '刀山退路', animationCue: '刀光路障升起', shortEffect: '设障回弹' },
    apologies: makeApologies('设障业', '故意阻挡别人的机会和晋升', '以后公开标准不再暗箱设卡')
  },
  {
    id: 'hell_ice',
    level: 8,
    name: '冷暴力已读怪',
    hellName: '冰山地狱',
    title: '冷意回身',
    description: '“我看到了，但我就是不回，你自己体会。”',
    workplaceSin: '冷暴力、故意晾人、阴冷伤人、让人悬着',
    sinCategory: '行为',
    judge: '都市王',
    tribunal: '冷处理伤害审判处',
    bossHp: 56000,
    difficulty: 5,
    disguiseLevel: 5,
    threatLabel: '已读冰山怪',
    hexagram: '坎水困恶：冷意回流，自困冰层。',
    bureauLine: '司过之神记录：故意晾人，沟通阴德 -12。',
    verdict: '冷意回身，自困冰山。它给你的冷处理，今天冻住它自己的表情管理。',
    realityReply: '“我需要确认这个事项是否继续推进。若今天没有反馈，我将按当前版本留痕推进。”',
    nonSelfFriction: '没人回复不代表你低价值，沉默有时只是对方低水平控制。',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-400',
    textColor: 'text-sky-700',
    emoji: '🧊',
    tags: ['已读不回', '冷暴力', '吊着你', '故意晾人', '阴冷处理'],
    punishment: { theme: 'ice_prison', emoji: '🧊', label: '冰山封冻', animationCue: '冰晶封脸，冷气反噬', shortEffect: '冷暴力冻结' },
    apologies: makeApologies('冷害业', '故意已读不回消耗别人', '以后给出明确反馈和时间节点')
  },
  {
    id: 'hell_oil',
    level: 9,
    name: '反咬坑害怪',
    hellName: '油锅地狱',
    title: '因果自煎',
    description: '“我明明是在帮你，怎么最后变成我的问题？”',
    workplaceSin: '恩将仇报、反咬、恶意坑害、甩卖盟友',
    sinCategory: '行为',
    judge: '阎罗王',
    tribunal: '重大恶业主审庭',
    bossHp: 62000,
    difficulty: 6,
    disguiseLevel: 5,
    threatLabel: '反咬油锅王',
    hexagram: '坎险反困：坑人者自陷其坑。',
    bureauLine: '天曹归档：恩将仇报，承负启动。',
    verdict: '因果自煎，坑局回锅。它反咬你的锅今天热腾腾端回去。',
    realityReply: '“我们把协助过程和关键节点列出来复盘，哪些是支持、哪些是责任，按记录区分。”',
    nonSelfFriction: '善意帮忙也要留边界，帮人不是替人背命。',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-800',
    emoji: '🍲',
    tags: ['恩将仇报', '反咬一口', '坑害队友', '卖盟友', '假帮忙'],
    punishment: { theme: 'oil_cauldron', emoji: '🍲', label: '油锅回锅', animationCue: '漫画泡泡翻滚', shortEffect: '反咬自煎' },
    apologies: makeApologies('反咬业', '拿别人的帮忙反过来坑别人', '以后协作事项按记录分清')
  },
  {
    id: 'hell_ox',
    level: 10,
    name: '吸血牛马怪',
    hellName: '牛坑地狱',
    title: '消耗反噬',
    description: '“能者多劳嘛，这点小事你顺手也做了。”',
    workplaceSin: '把别人当牛马、索取无度、占便宜、不回馈',
    sinCategory: '气运',
    judge: '平等王',
    tribunal: '劳动边界清算处',
    bossHp: 66000,
    difficulty: 6,
    disguiseLevel: 4,
    threatLabel: '牛马吸血鬼',
    hexagram: '困卦消耗：耗人者自困。',
    bureauLine: '功过簿新增：长期索取，福报漏斗开启。',
    verdict: '消耗反噬，自背其劳。小人偷走的力气今天全部回到自己肩上。',
    realityReply: '“这部分已经超出我当前职责和排期。如果需要我承担，请同步调整优先级或资源。”',
    nonSelfFriction: '你的能干不是公共资源，边界感就是回血条。',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-500',
    textColor: 'text-lime-800',
    emoji: '🐂',
    tags: ['能者多劳', '顺手做了', '长期占便宜', '吸血索取', '不回馈'],
    punishment: { theme: 'ox_pit', emoji: '🐂', label: '牛坑劳役', animationCue: '牛铃震动，劳役回身', shortEffect: '吸血反噬' },
    apologies: makeApologies('贪索业', '把别人当牛马无止境索取', '以后超出职责就补资源补排期')
  },
  {
    id: 'hell_stone',
    level: 11,
    name: '甩锅背雷怪',
    hellName: '石压地狱',
    title: '锅回本位',
    description: '“这个一直是你跟的吧？我只是提醒一下。”',
    workplaceSin: '甩锅、推责、压责任、让别人背雷',
    sinCategory: '行为',
    judge: '五官王',
    tribunal: '责任链路核验处',
    bossHp: 72000,
    difficulty: 7,
    disguiseLevel: 5,
    threatLabel: '巨石甩锅王',
    hexagram: '艮山止损：不该背的锅，到此为止。',
    bureauLine: '北斗扣算：推责一次，锅体回传。',
    verdict: '锅回本位，责任压身。谁甩出的锅，今天砸回谁的头顶。',
    realityReply: '“这件事建议按任务来源、决策人、执行人三个维度确认，避免责任口径混淆。”',
    nonSelfFriction: '你不是职场避雷针，记录清楚，锅会自己认路。',
    bgColor: 'bg-stone-50',
    borderColor: 'border-stone-500',
    textColor: 'text-stone-800',
    emoji: '🪨',
    tags: ['甩锅', '推责', '背雷', '装不知情', '会后怪执行'],
    punishment: { theme: 'stone_crush', emoji: '🪨', label: '巨石回锅', animationCue: '黑锅变巨石压回', shortEffect: '责任回位' },
    apologies: makeApologies('推责业', '把自己的责任甩给执行人', '以后决策自己担')
  },
  {
    id: 'hell_mortar',
    level: 12,
    name: '返工折腾怪',
    hellName: '舂臼地狱',
    title: '混乱自碾',
    description: '“还是第一版好，但保留第五版的高级感。”',
    workplaceSin: '反复折腾、无效返工、需求横跳、消耗执行',
    sinCategory: '行为',
    judge: '楚江王',
    tribunal: '无效消耗复核处',
    bossHp: 76000,
    difficulty: 7,
    disguiseLevel: 4,
    threatLabel: '需求舂臼机',
    hexagram: '未济求变：积怨未清，反复横跳。',
    bureauLine: '三尸上奏：无效返工，执行阳气 -30。',
    verdict: '混乱自碾，折腾归主。它让你返工的次数，今天变成自己的舂臼循环。',
    realityReply: '“为避免反复返工，我们先冻结验收标准，超过标准外的调整另开排期。”',
    nonSelfFriction: '需求不清是上游问题，不是你专业不够。',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-500',
    textColor: 'text-violet-800',
    emoji: '🌀',
    tags: ['反复改需求', '第一版最好', '再微调一下', '连夜推翻', '标准漂移'],
    punishment: { theme: 'mortar_loop', emoji: '🌀', label: '舂臼循环', animationCue: '需求纸团被循环捶打', shortEffect: '返工归主' },
    apologies: makeApologies('折腾业', '需求横跳让别人反复返工', '以后先冻结标准再动手')
  },
  {
    id: 'hell_reputation',
    level: 13,
    name: '污名泼脏怪',
    hellName: '血池地狱',
    title: '污名自染',
    description: '“我只是提醒大家小心他这个人。”',
    workplaceSin: '污蔑、污染名声、标签化别人、吸人福气',
    sinCategory: '气运',
    judge: '都市王',
    tribunal: '名誉污染清理处',
    bossHp: 82000,
    difficulty: 8,
    disguiseLevel: 5,
    threatLabel: '污名红池怪',
    hexagram: '明夷隐光：清白暂暗，终会复明。',
    bureauLine: '天曹记录：污名外泼，清白回流程序启动。',
    verdict: '污名自染，清白回流。泼出去的脏水今天染回小人自己的工牌。',
    realityReply: '“如果对我有评价，请给出具体事实和场景。抽象标签会伤害协作，也不利于解决问题。”',
    nonSelfFriction: '标签不是事实，清白会沿着证据回到你身上。',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-800',
    emoji: '🧿',
    tags: ['污蔑名声', '乱贴标签', '泼脏水', '吸人福气', '恶意提醒'],
    punishment: { theme: 'reputation_pool', emoji: '🧿', label: '污名回流', animationCue: '红墨回卷，工牌洗净', shortEffect: '清白归位' },
    apologies: makeApologies('污名业', '乱给别人贴负面标签', '以后只讲事实不泼脏水')
  },
  {
    id: 'hell_wronged',
    level: 14,
    name: '诬陷冤锅怪',
    hellName: '枉死地狱',
    title: '冤业昭明',
    description: '“证据我没有，但我感觉就是他的问题。”',
    workplaceSin: '诬陷、造假证词、让人受冤、制造黑锅',
    sinCategory: '行为',
    judge: '秦广王',
    tribunal: '冤业昭明庭',
    bossHp: 88000,
    difficulty: 8,
    disguiseLevel: 5,
    threatLabel: '冤锅制造机',
    hexagram: '噬嗑断恶：是非已判，小人难逃。',
    bureauLine: '孽镜重放：假证破裂，冤业返身。',
    verdict: '冤业昭明，假证破裂。小人造出的黑锅今天当场碎成纸屑。',
    realityReply: '“感觉不能作为结论。我们按证据、时间线和责任动作来复盘。”',
    nonSelfFriction: '冤枉你的人最怕时间线，别急着自证情绪，先固定事实。',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-500',
    textColor: 'text-slate-800',
    emoji: '⚖️',
    tags: ['诬陷', '假证词', '凭感觉定罪', '黑锅制造', '冤枉人'],
    punishment: { theme: 'wronged_city', emoji: '⚖️', label: '枉城翻案', animationCue: '卷宗飞起，假证碎裂', shortEffect: '冤业昭明' },
    apologies: makeApologies('诬陷业', '没有证据就让别人背黑锅', '以后按时间线和证据说话')
  },
  {
    id: 'hell_scheme',
    level: 15,
    name: '挖坑设局怪',
    hellName: '磔刑地狱',
    title: '恶局反锁',
    description: '“这个局我早就安排好了，你进来就行。”',
    workplaceSin: '设局、挖坑、分裂关系、害人入局',
    sinCategory: '心术',
    judge: '卞城王',
    tribunal: '机关恶局拆解处',
    bossHp: 94000,
    difficulty: 9,
    disguiseLevel: 5,
    threatLabel: '机关设局师',
    hexagram: '坎水陷局：设局者自陷其局。',
    bureauLine: '司过之神记录：恶局布网，承负自锁。',
    verdict: '恶局反锁，自困其网。小人挖的坑今天自己掉进去。',
    realityReply: '“这个安排涉及多方责任，我需要先确认目标、边界、授权和风险承担人。”',
    nonSelfFriction: '看不懂的局先不入，要求写清就是最强护身符。',
    bgColor: 'bg-fuchsia-50',
    borderColor: 'border-fuchsia-500',
    textColor: 'text-fuchsia-800',
    emoji: '🕸️',
    tags: ['设局', '挖坑', '恶意入局', '关系撕裂', '机关话术'],
    punishment: { theme: 'scheme_rift', emoji: '🕸️', label: '恶网反锁', animationCue: '网格收紧，机关反噬', shortEffect: '设局自困' },
    apologies: makeApologies('设局业', '故意挖坑让别人入局', '以后先讲授权和风险')
  },
  {
    id: 'hell_volcano',
    level: 16,
    name: '迁怒火山怪',
    hellName: '火山地狱',
    title: '恶火自焚',
    description: '“我现在很烦，你最好别让我再说第二遍。”',
    workplaceSin: '暴怒迁怒、恶意发火、用情绪压迫别人',
    sinCategory: '心术',
    judge: '泰山王',
    tribunal: '嗔恚怒火审判处',
    bossHp: 101000,
    difficulty: 9,
    disguiseLevel: 4,
    threatLabel: '迁怒火山口',
    hexagram: '震卦动雷：怒火一动，反噬其身。',
    bureauLine: '北斗扣算：迁怒伤人，凶气随身。',
    verdict: '恶火自焚，怒气反噬。它喷出来的火今天全部烧回自己的 KPI。',
    realityReply: '“我可以处理问题，但不接受情绪攻击。请把具体标准和动作说清楚。”',
    nonSelfFriction: '别人发火不等于你有错，火山爆发只是他的系统故障。',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-600',
    textColor: 'text-red-800',
    emoji: '🌋',
    tags: ['迁怒', '恶意发火', '摔脸色', '情绪压迫', '暴怒管理'],
    punishment: { theme: 'volcano_rage', emoji: '🌋', label: '火山反喷', animationCue: '火焰回卷，怒气退散', shortEffect: '迁怒熄火' },
    apologies: makeApologies('嗔恚业', '把自己的怒气迁到别人身上', '以后只解决问题不攻击人')
  },
  {
    id: 'hell_millstone',
    level: 17,
    name: '烂摊拖累怪',
    hellName: '石磨地狱',
    title: '烂摊归主',
    description: '“我前面没管好，你帮我收一下尾。”',
    workplaceSin: '拖累别人、制造烂摊子、反复消耗、让别人兜底',
    sinCategory: '行为',
    judge: '平等王',
    tribunal: '烂摊归属判定处',
    bossHp: 108000,
    difficulty: 10,
    disguiseLevel: 5,
    threatLabel: '烂摊石磨怪',
    hexagram: '剥卦削运：虚势层层剥落，烂摊露底。',
    bureauLine: '功过簿新增：烂摊外包，劳役回传。',
    verdict: '烂摊归主，自推石磨。它留下的烂摊子今天自动回到原主人手里。',
    realityReply: '“我可以协助收尾，但需要明确原始责任、剩余风险和补偿资源。”',
    nonSelfFriction: '救火可以，替人长期填坑不行；你不是无限兜底系统。',
    bgColor: 'bg-neutral-100',
    borderColor: 'border-neutral-500',
    textColor: 'text-neutral-800',
    emoji: '🪬',
    tags: ['烂摊子', '让你兜底', '拖累别人', '救火外包', '长期消耗'],
    punishment: { theme: 'millstone_drag', emoji: '🪬', label: '石磨归主', animationCue: '石磨转动，烂摊回传', shortEffect: '消耗终止' },
    apologies: makeApologies('拖累业', '把烂摊子长期丢给别人兜底', '以后补资源补授权再求协助')
  },
  {
    id: 'hell_final',
    level: 18,
    name: '无悔终极小人',
    hellName: '刀锯地狱 / 阿鼻清算',
    title: '无间总账',
    description: '“我一直这样，也没人拿我怎么样。”',
    workplaceSin: '长期作恶、反复害人、无悔、恶业满格',
    sinCategory: '终局',
    judge: '转轮王',
    tribunal: '十八层终局分流庭',
    bossHp: 118000,
    difficulty: 10,
    disguiseLevel: 5,
    threatLabel: '阿鼻笑面总裁',
    hexagram: '鼎卦重立：功过归位，秩序重建。',
    bureauLine: '天曹总簿合卷：恶业满格，无间清算启动。',
    verdict: '无间清算，恶业总簿。十八层到此合卷，所有恶行一次性归档。',
    realityReply: '“这类长期模式已经影响协作边界。我会把事实、影响和诉求整理成书面记录，并按正式渠道处理。”',
    nonSelfFriction: '长期恶意不是你的修行题，是需要退出和留痕的现实问题。',
    bgColor: 'bg-zinc-100',
    borderColor: 'border-zinc-700',
    textColor: 'text-zinc-900',
    emoji: '⚔️',
    tags: ['长期作恶', '无悔小人', '反复害人', '恶业满格', '终极清算'],
    punishment: { theme: 'final_judgement', emoji: '⚔️', label: '终局刀锯光', animationCue: '审判光栅落下，恶业合卷', shortEffect: '无间总账' },
    apologies: makeApologies('终局恶业', '长期作恶还自以为没人能处理', '所有恶行今日入总簿')
  }
];

export const HELL_LEVELS: HellLevel[] = RAW_HELL_LEVELS.map(level => {
  const patch = WORKPLACE_LANGUAGE_PATCHES[level.id];
  if (!patch) return level;
  return {
    ...level,
    ...patch,
    tags: patch.tags || level.tags,
    apologies: patch.apologies || level.apologies
  };
});

export const STRESS_TYPES = HELL_LEVELS;

// 第二层老油条"丧"语录——谐音梗/冷笑话/消极怠工解构职场
export const LEVEL2_SANG_QUOTES: string[] = [
  '关关难过，那就哄哄关关。',
  '明知山有虎，那就别去明知山！',
  '不要总和别人比，比前十觉得自己差，如果比利时，那是欧洲的国家！',
  '你要稳稳的幸福，那稳稳怎么办？',
  '太空有空间站，太挤就没有空间站。',
  '你歇斯底里是崩溃，歇斯是美味。',
  '一人做事一人当，当当做事当当当。',
  '是金子总会花光的。',
  '水 100 度就是开，人 100 度就得癌。',
  '慢慢挤，不要来。'
];

// The 5 visual styles of monsters
export const MONSTER_STYLES: MonsterStyle[] = [
  {
    id: 'suit_monster',
    name: '西装笑面小人',
    description: '身穿皱巴巴西装、手里攥着打卡纸的文件夹，代表形式主义与虚伪官调，心术不正则难登大雅。',
    emoji: '👔',
    colorClass: 'from-slate-700 via-slate-800 to-slate-900',
    tintColor: '#475569',
    hpMultiplier: 1.08,
    archetype: '官腔硬壳'
  },
  {
    id: 'heels_monster',
    name: '高跟鞋挑刺小人',
    description: '戴着厚眼镜、手拿鸡毛掸、踩着12厘米高跟鞋、浑身散发着“重新改”墨香的书夹夹，尖刻且刻薄。',
    emoji: '👠',
    colorClass: 'from-pink-800 via-pink-900 to-slate-900',
    tintColor: '#db2777',
    hpMultiplier: 1.12,
    archetype: '尖刻审稿'
  },
  {
    id: 'office_goblin',
    name: '办公室小人怪',
    description: '长着眼睛和细手细脚的巨型回形针，最喜欢在背后搞小动作，打小报告、搬弄是非、离间因果。',
    emoji: '📎',
    colorClass: 'from-amber-700 via-yellow-800 to-yellow-950',
    tintColor: '#d97706',
    hpMultiplier: 1.18,
    archetype: '暗处使坏'
  },
  {
    id: 'fake_smile',
    name: '假笑开会怪',
    description: '长着一副虚伪职业露齿笑、头顶PPT饼图的陶瓷茶杯，擅长说好听话、行背地事。',
    emoji: '☕',
    colorClass: 'from-emerald-800 via-teal-900 to-slate-900',
    tintColor: '#0d9488',
    hpMultiplier: 1.28,
    archetype: '笑面虎伪装'
  },
  {
    id: 'oa_reddot',
    name: 'OA红点怪',
    description: '一个巨大的、带着刺痛眼球的99+未读红点的OA审批邮件怪物，时刻像紧箍咒一样震坏大脑。',
    emoji: '📮',
    colorClass: 'from-rose-800 via-red-950 to-neutral-900',
    tintColor: '#e11d48',
    hpMultiplier: 1.05,
    archetype: '红点压迫'
  }
];

// Unlocked weapons and items for interactive relief
export const WEAPONS: Weapon[] = [
  {
    id: 'pin',
    name: '玄机小针',
    emoji: '📌',
    description: '开局破防专用！优先戳爆红色执念标签，标签越早清空，后面大招越疯。',
    unlocked: true,
    unlockLevel: 1,
    damage: 420,
    spGain: 16,
    role: 'tag_breaker',
    feedbackTone: 'pierce'
  },
  {
    id: 'glove',
    name: '正气拳套',
    emoji: '🥊',
    description: '高速连击引擎！最适合疯狂点按堆 COMBO，越打越上头，护盾也靠它点燃。',
    unlocked: true,
    unlockLevel: 1,
    damage: 560,
    spGain: 22,
    role: 'combo',
    feedbackTone: 'punch'
  },
  {
    id: 'hammer',
    name: '发财金锤',
    emoji: '🔨',
    description: '重击处刑锤！一下砸掉一大截血条，震屏、爆币、脑壳嗡嗡，适合补刀。',
    unlocked: true,
    unlockLevel: 2,
    damage: 1150,
    spGain: 32,
    role: 'heavy',
    feedbackTone: 'smash'
  },
  {
    id: 'stamp',
    name: 'OA驳回印',
    emoji: '🉐',
    description: 'SP满格后开盖！把混乱需求、甩锅话术、KPI画饼全盖成废案。',
    unlocked: true,
    unlockLevel: 4,
    damage: 3900,
    spGain: 0,
    role: 'ultimate',
    ultimateCost: 100,
    feedbackTone: 'seal'
  },
  {
    id: 'shredder',
    name: '怨气碎纸机',
    emoji: '🌀',
    description: 'SP满格后启动黑洞！把绩效表、会议纪要和内耗报表绞到魂飞纸散。',
    unlocked: true,
    unlockLevel: 7,
    damage: 10000,
    spGain: 0,
    role: 'ultimate',
    ultimateCost: 100,
    feedbackTone: 'shred'
  },
  {
    id: 'chime',
    name: '18:00下班钟',
    emoji: '🔔',
    description: 'SP满格后敲响终局！直接宣布下班神权，所有加塞催命当场失效。',
    unlocked: true,
    unlockLevel: 11,
    damage: 10000,
    spGain: 0,
    role: 'ultimate',
    ultimateCost: 100,
    feedbackTone: 'freedom'
  }
];

// Hexagram warning database
export const HEXAGRAM_WARNINGS = [
  '【乾卦失位】刚而无德，狂妄自私，必失其势。',
  '【坤卦不载】福德微薄之人，纵有官身亦承不住运。',
  '【震卦动雷】暗室私怨，瞒天过海，惊破春雷！',
  '【巽卦入骨】背后嚼舌，挑拨挑衅，反遭群讽流言。',
  '// 坎卦险生 // 欲陷人于不义者，其人必先自坠困局。',
  '【离卦照影】虚伪谄媚之皮，烈烈天火之下荡然无存。',
  '// 艮卦止恶 // 邪念到此为止，重壁千仞巍然不动。',
  '【兑卦口业】恶由口出，谗言伤人，自惹唇枪舌剑。',
  '【剥卦削运】重利压榨，刻薄下属，阴德削落至底。',
  '【复卦归正】被剥夺的尊严和福报，此刻正在气旋中回流。',
  '// 否卦交恶 // 心术不端致使诸事不顺，气机死结已现。',
  '【泰卦开运】驱散污秽，今日起贵人扶手、正气归心。',
  '【噬嗑断恶】正义因果已定，罪恶邪念无处隐匿！',
  '【明夷隐光】藏锋蓄水退让非懦，天清地明终有期。',
  '【革卦易数】革除重重压迫与陈怨，主宰今日尊严。',
  '【鼎卦重立】重塑职场边界，德能相配，祸福各安其位。',
  '【丰卦普照】阳光之下不容一丝阴暗。',
  '// 旅卦浮萍 // 背后使刀之人，人心渐冷，失去立足根基。',
  '【中孚验心】真金不怕熔炼，心术歪邪纸包不住火。',
  '【未济求变】积怨未清，战斗未已，打工人请保持清醒。'
];

// Taoist causality guidelines
export const TAOIST_CAUSALITIES = [
  '天道无亲，常与善人。恶念一萌，大祸伏矣。',
  '天理昭昭，善恶有簿。今日不报，积累加倍。',
  '人负你，天还你。功德在身，百毒不侵。',
  '口业过深，舌根开裂，阴德耗尽，自掘坟茔。',
  '一念不善，运势浑浊。抢人之功者，天终夺其福。',
  '善言结善缘，冷语断生路。背后使坏，前路自断。',
  '巧取豪夺，纵得虚名，败落之日近在咫尺。',
  '人前假面，骗得了一时，骗不过天眼注视。',
  '耗人神气者，折损自身寿算，承负自理。',
  '欺善怕恶之人，实则外强中干，最易受邪祟反噬。',
  '不解决实质难点，只释放低频焦虑，气运自败。',
  '福报从来不是抢来的，是心胸与实力修出的。',
  '德不配位，必有灾殃；心术不正，气数已尽。',
  '少画无名之饼，多结真实之缘，天地不纳虚情。',
  '今日你行清剿，不为伤人，只为理顺己身气运，福禄回旋。'
];

// Curses from worker perspective
export const WORKER_CURSES = {
  yinYang: [
    '您这指手画脚的水平，主打一个隔空做法。',
    '您不是在安排工作，您是在给我们的血压抽盲盒。',
    '您的标准真稳定，稳定得像春天的天气一小时一换。',
    '您的“尽快”，大概是现代职场最搞笑的两个字。',
    '您的计划安排计划，完美证明了管理是玄学。',
    '您没发现您一走，整个办公室的空气质量都提升了吗？',
    '您的沟通能力，让全组同事每天经历十次自我怀疑。',
    '您一开口，我的下班时间就离家出走流浪去了。',
    '您的需求就像恋爱脑的想法，反复横跳。',
    '您的情绪管理，连路边的流浪猫看了都会叹气。'
  ],
  furious: [
    '催什么催！你自己把流程和数据看清楚了吗！',
    '别甩了！这口重锅都被你甩出量子纠缠态了！',
    '别画饼了！吃您的饼我已经消化不良进医院了！',
    '少在这里装不知情，拍胸脯交办时你的气势去哪了！',
    '把压榨美化成“锻炼”，那你为什么不去锻炼锻炼！',
    '口口声声“尽快”，尽快前先给你清醒的大脑洗洗！',
    '您的无能计划，凭什么让我们用自由时间去填补空缺！',
    '不要一边不给反馈、十天不回，一边催命狂轰滥炸！',
    '别把您自己的决策混乱，包装成什么“互联网敏捷迭代”！',
    '别把好说话当成你践踏边界、肆无忌惮的资本！'
  ],
  bitter: [
    '今天不扎你，我的乳腺和肺泡都想直接打包报警！',
    '您一召唤，我的血压就像直升机降落在OA屏幕上。',
    '您一句轻飘飘的“辛苦一下”，就把我一天的阳气和精魂全打散。',
    '您别当什么管理者了，您简直是移动的焦虑雾霾发生器！',
    '您每次在下班后发消息，我都想给我的智能手机申请全额工伤！',
    '您分派工作像节日里放烟花，炸得惊天动地，炸完直接失联。',
    '您主持的会议就像妖仙施法，直接让在场所有人吃了一个群体沉默。',
    '催活时雷霆万钧要急死，批材料分奖金时却突然得阿尔茨海默症。',
    '您给员工画的那些饼，比荒野生存的木渣面粉发酵出来的硬馒头还干。'
  ],
  villain: [
    '邀功夺彩冲在百米赛跑第一，担责排难时瞬间人间蒸发、屏蔽断网！',
    '捞油水分红永远在线，碰到纠纷和困难瞬间灰度展示、离线封顶！',
    '你根本不是好心协助，你只是擅长在我们的工位前空降手榴弹！',
    '你所谓的打配合，其实就是在项目平地上秘密挖战壕、埋地雷！',
    '你提出来的每一条“神级修改意见”，都在无声地释放职场毒气！',
    '你不是在协调沟通，你是在对别人的人生理想进行二次毁灭性打击！',
    '你整天吹嘘的高情商，不就是会踩着别人肩膀，把锅甩空吗！',
    '你那不是真的没听懂，你是用你惊人的厚脸皮在装睡装死！'
  ],
  combos: [
    '别催！', '别甩！', '别装！', '别画饼！', '别该换了！', '少开会！', '别PUA！', '别抢！',
    '别装傻！', '别双标！', '不加班！', '不要甩锅！', '尊重边界！', '少画无用饼！', '拒绝无效内耗！',
    '滚！', '别逼我开麦！', '少甩无稽锅！', '恶人自食其果！', '功德归于我！'
  ],
  victory: [
    '邪气已被回收，怨念无影踪，功德护国。',
    '职场小人当场作揖败北，打工人光速抢回神台。',
    '甩锅魔咒彻底裂开，正义因果重新对齐。',
    '画饼攻击当场化为灰烬，理智现实感大幅回潮。',
    '无效逼迫连环撞墙，下班尊严与边界全面保全。',
    '精神压迫妖雾退散，打工人神气回流200%！',
    '小人断绝前路，今天起福星照顶，不放微尘入眼。',
    '你做的对！你不是任性，你是忍耐得够久、气运得平。'
  ]
};

// Map each stress type to its apology responses (8 sentences per type)
export const LEADER_APOLOGIES: Record<string, string[]> = {
  after_hours: [
    '我错了，我不该一到下班点才想起这件事突然很急。',
    '我错了，我不该把我个人的时间管理失败，强行变成你的加班责任。',
    '我错了，我不该白天开会不落实，晚上火烧眉毛拼命催。',
    '我错了，我不该把一句“辛苦一下”当成免于尊重的万能通行证。',
    '我错了，我不该用两个字“尽快”来掩盖我根本没想清楚方案。',
    '我错了，我不该为了逃避我的计划漏洞，消耗你宝贵的个人生活。',
    '我错了，我以后一定提前定下明确的时限和对接标准，绝不加塞。',
    '我错了，我不该让能干老实的人永远多干、疲于奔命。'
  ],
  blame_shifter: [
    '我错了，我不该出了乱子就把脏水泼到你这个执行人头上。',
    '我错了，我不该分派任务摸棱两可，最后让出了力的你白白背黑状。',
    '我错了，我不该自己签字拍板，转头看到风险又装作一无所知。',
    '我错了，我不该把我想挑的锅强行包装成“锻炼你跨部门协调能力”。',
    '我错了，我不该把部门的决策性失误，通过开会定性为你的工作散漫。',
    '我错了，我不该在前期不闻不问不表态，出事后吹毛求疵说没做好。',
    '我错了，我以后肯定出了事自己撑，做决策自己担，绝不推诿员工。',
    '我错了，我不该只坐在空调房里分赃，砸锅需要当担时第一个装死。'
  ],
  pua_pie: [
    '我错了，我不该用“这是在对进行极速培养”来掩盖项目预算配额不足。',
    '我错了，我不该只会开空头支票不给资源，还怪你没有“创业热枕”。',
    '我错了，我不该把你的隐忍与任劳任怨，当成可以随意加码的台阶。',
    '我错了，我不该拿渺茫的晋升前景，剥夺你基本的薪酬回报。',
    '我错了，我不该说“年轻人要先付出少计较”来给你做廉价精神洗脑。',
    '我错了，我不该用那些虚幻的面子情绪，搪塞你理应得到的真实银两。',
    '我错了，我不该说你在外面找不到更好的，摧毁你的专业自信。',
    '我错了，我以后少灌毒鸡汤多发点奖金，绝不阻碍你正常休息了。'
  ],
  frequent_editor: [
    '我错了，我不该上午要大红，下午要高级灰，晚上又质疑为什么不炫彩。',
    '我错了，我不该任务说明模糊得像星盘，却要求你在执行时精准击中。',
    '我错了，我不该我自己没想明白就让你出几十个方案疯狂投石问路。',
    '我错了，我再也不说“感觉不对，还是用第一版，在第一版加第二版色吧”。',
    '我错了，我不该把我随口的一句灵光一现，强逼整个技术团队推平重做。',
    '我错了，我不该在你们全做完甚至上线了，才说整体方向和定位搞错了。',
    '我错了，我不该用我贫瘠的想象力去质疑你们专业的设计和辛苦。',
    '我错了，我向祖师爷保证：今后一旦定稿，雷打不动，绝不左右横跳。'
  ],
  deadline_pusher: [
    '我错了，我不该自己微信不回玩人间蒸发，反手又电话连环催进度。',
    '我错了，我不该任何辅助资料都没给你，却逼着你三分钟后交出大片。',
    '我错了，我不该一千字打一个“？”，硬生生把职场变成了催债修罗场。',
    '我错了，我不该不管芝麻还是西瓜，全部贴上“极度加急”折磨神经。',
    '我错了，我不该无视客观项目周期，为了显示我管理有方恶意压缩工期。',
    '我错了，我不该把我的焦虑和对无法交付的虚荣，变相碾压在你的清脑中。',
    '我错了，我以后自己去对接，少干这些天天点人看秒表的催命工作。',
    '我错了，我不该把人当耗材，以为拧冷气皮带就能像电脑一样产出。'
  ],
  credit_thief: [
    '我错了，我不该在PPT和高层汇报里把你的深夜代码，全抠到我的名义下。',
    '我错了，我不该汇报时狂说“我是如何英明指挥”，对你的名字一字不提。',
    '我错了，我不该拿你的原创成果，当成是我本季度吹牛邀功的核心闪光点。',
    '我错了，我不该出了阻滞把你晾在枪口，收割果实的时候神之降临。',
    '我错了，我不该你流血牺牲拿回山峰，我端着洋酒在上层宴会笑盈盈。',
    '我错了，我以后汇报功绩必大加炫耀你的名字，再也不独食功勋了。',
    '我错了，我不该窃取他人劳作来装点我的无能外衣，今天吐回。',
    '我错了，功德和汗水是你们的，荣誉也是你们的，我只是个摆设。'
  ],
  useless_meeting: [
    '我错了，我不该拉着二十个人，坐五个小时听我和几个关系户打屁扯皮。',
    '我错了，我不该明知一句话打个叉就能解决，非要走个两万句的空话例会。',
    '我错了，我不该用频繁召集人手开会，强行显示我很尽职、公司很繁荣。',
    '我错了，我不该会前零议题、会中瞎跑题、会后让老实人义务整理。',
    '我错了，我不该把能在十分钟内讲明白的，无限膨胀到整个下午听训。',
    '我错了，我不该让你们白天耗在座位上听废话，逼着你们晚上补完正经活。',
    '我错了，我今天决定每周取消90%的过场废会议，还你清宁空间。',
    '我错了，废文满天飞，不如闭上我废话连篇的嘴，放大家专心做事。'
  ],
  emotional_roller: [
    '我错了，我不该无能发狂摔桌子推砸物件，来威慑你们对我的管理屈服。',
    '我错了，我不该把我的家庭琐碎或上级指责的坏脸色，直接辐射给你们。',
    '我错了，我不该在谈工作时夹枪棒针，故意释放阴阳低俗的情绪噪音。',
    '我错了，我不该逼着你干着活还要跟个算命大师一样，全天琢磨我的阴晴。',
    '我错了，我不该对你辛勤交付的东西全盘黑化，只是为了显得我非常高端。',
    '我错了，我不该不给反馈直接冷暴力拉黑你三个星期，任由你心神消耗。',
    '我错了，我一定立地改正恶习，回归正常人的体温，再也不随便撒泼了。',
    '我错了，我自己心态有病，把毒气狂倒向别人，恶果我以后一定自吃。'
  ],
  no_resources: [
    '我错了，我不该一个人都不增配、一毛钱都不特批，还给你定最高额度的KPI。',
    '我错了，我不该总用一句“方法总比困难多”来搪塞资源供给，逃避我管理层职责。',
    '我错了，我不该强推你去单枪匹马攻城，回来却指责你为什么被打得满地找牙。',
    '我错了，我不该为了逃避采购批复扯太高理论阻挠，连个正版软件和好键盘都卡你。',
    '我错了，我不该只会用一万句激情高昂的口号去强行打发嗷嗷待哺的开发前线。',
    '我错了，我以后肯定全力跑资金批复和支持，要是不给过我替你辞职抱委屈。',
    '我错了，巧妇确实难为无米之炊，把没兵没马的任务甩下来，是我太黑心。',
    '我错了，我今天开始主动替你打报告挡阻碍，保证人马粮草给你配得齐齐！'
  ],
  weekend_troll: [
    '我错了，我不该周六早晨九点开个两千条未读的工作微信群突袭。',
    '我错了，我不该在周日休息晚上十点催文件，直接毁掉了你难得的充电夜。',
    '我错了，我不该自作多情以为打一句“周末抱歉打扰一下”就算在礼貌致意。',
    '我错了，我不该默认所有人手机都长在眼里、随时应该二十四小时回复。',
    '我错了，我不该剥夺你对平静周末生活的最脆弱的防线、折磨你的肠胃系统。',
    '我错了，我以后有急事我工作日安排好，如果周末脑抽我直接给自己扎上一百针。',
    '我错了，我不该打扰你的私人和解时光生活，神明保佑，我今天自断网线。',
    '我错了，周末神圣不可侵犯，你不用理我，我只是个自嗨的无赖。'
  ]
};

// Fallback apologies in case of missing index or direct click
export const GENERIC_APOLOGIES = [
  '我错了。',
  '我错了，真的对不起。',
  '对不起，我不该拿无理取闹折磨你。',
  '这锅本就是我的，我马上背回去。',
  '一万个错都是我的，求求阁下赐福放过。',
  '我错了，我马上滚去改。',
  '我不该搬弄是非、满心算计、因果难容。',
  '我有眼不识泰山，侵犯了您的清净磁场，我该打。',
  '恶业已结至我身，我知错悔悟，立刻反省。'
];

// Map of the 10 stress types to high-EQ professional response templates (to serve as the self-healing package)
export const HIGH_EQ_TEMPLATES: Record<string, { reply: string; reminder: string; nonSelfFriction: string }> = {
  after_hours: {
    reply: '“收到，我已看下此事项。由于任务涉及范围较广，如果今晚紧急处理可能会仓促、从而影响质量和严谨性。为确保对外产出质量，建议今晚我先花半小时整理好框架和所需材料。如果允许，我明早会全速推进并在上午 11 点完成交付，您看可行吗？”',
    reminder: '记住：他的规划失误不是你的工作紧急！学会用“保障质量边界”挡掉压榨。',
    nonSelfFriction: '“我的生命和精力非常昂贵，今晚属于我的生活配额不应该拿去堵别人的计划漏洞。”'
  },
  blame_shifter: {
    reply: '“这个事项我非常乐意配合执行，但为了防止后续项目边界和主导权混淆，我们可以先在群里或邮件里明确一下当前已完成的职责段，各自负责的内容，以及需要对接的补充材料，这样能让整个项目链路更高效和清晰，我随时发个简短备忘。”',
    reminder: '不争执情绪，只固定事实、用书面闭环让推锅魔咒无缝原路退回！',
    nonSelfFriction: '“锅砸了也砸不到我头上，因为每一步有理有据，留白存据，他推锅只能弹到他自己的脚背上。”'
  },
  pua_pie: {
    reply: '“特别感谢您愿意分工给我培养锻炼机会。对于项目的目标和难度挑战，我非常乐意扛起执行重担。只是为了稳固推进、拿到理想结果，目前核心的人手和预算额度缺口仍有30%，我们可以先讨论一下如何分配这些基础资源支持，这样我执行起来才能更有底气和空间。”',
    reminder: '吃饼之前，先提筷子要资源。拿实际需要击破空洞情怀，把幻觉还原成合同和筹码。',
    nonSelfFriction: '“少跟我谈天大的理想和格局。我只是在进行合法的劳动变现，该属于我劳动的酬劳少一分都不行，别拿画饼当米饭。”'
  },
  frequent_editor: {
    reply: '“收到微调建议。为了防止我们反复方向偏差消耗工期，同时也希望在效率上做到极致，我们可以坐下来用面谈十分钟形式，先把这一版本的具体衡量标准与定稿红线（包括视觉定位、核心文案）确定。一旦红线过审对齐，我们便封锁这一稿不作更改，全力直奔定案交付，这样您看好吗？”',
    reminder: '模糊输入只能得到垃圾输出，通过锁定验收红线（Frozen Base）让无聊的反复改道夭折！',
    nonSelfFriction: '“只要还没最终退稿，我每改一次都只在完成一次有酬劳动，我不伤神不生气，想怎么改，我跟着标准走，改到天荒地老也不影响我的底气。”'
  },
  deadline_pusher: {
    reply: '“明白您对进度的热切关注。我目前正在全神贯注攻坚第 2 模块的核心，为避免分神打断逻辑，我会把进度汇报时间固定在今天下午 3:00 和 5:30 两个节点，到时我会带上成果做简短演示，中途若没特急变化我先聚精会神冲锋，确保按时保质拿出来。”',
    reminder: '掌握进度主动权，通过设定“汇报钟”反噬夺命催促。把被动防守化为主动汇报。',
    nonSelfFriction: '“他每天催十次是因为他的心神焦虑脆弱，不是因为我交不出货。节奏稳在我手里，我的时间我来安排。”'
  },
  credit_thief: {
    reply: '“非常高兴整个项目的功绩受到了高层关注，也感谢在攻攻关中大家合力分工。在这个案子里，我前期负责了整个架构设计和最后的瓶颈排除（可列出123核心动作），在咱们团队的有力统领和协作下大获成功。一会儿我也同步把咱们执行团队的成果细节和具体贡献人明细列表发信备忘下，咱们部门脸上也有光。”',
    reminder: '先夸大局，再把自己的无可替代的“核心动作”在公开链条（邮件/大群）牢固固定，防盗印章立妥！',
    nonSelfFriction: '“做过的事必留痕，天地因果有迹，谁也抢不走我的原始积累。我的福报和专业功底会直接长在我身上。”'
  },
  useless_meeting: {
    reply: '“我非常理解对齐项目很关键。由于我今天有两项极为迫切的上线或定稿计划需要在下午5:00前交付，为不耽误部门核心项目的正常上线速度，我建议我只在下午3:20和我们会谈中‘关于我的那一模块’对焦五分钟。其余时间我想继续闭关推进工作，避免影响交付。”',
    reminder: '用“不耽误核心业务交付”作为金盾，优雅退出扯皮大联欢，把精力夺回自己。',
    nonSelfFriction: '“你们想通过开会假装忙碌是你们的事，不要拉上我当布景板。我的产出在实处，不在嘴碎上。”'
  },
  emotional_roller: {
    reply: '“理解大伙推进压力都比较重，大家都是为了把事情推妥。如果本方案有明确的不合格处或卡点，建议您随时指出具体的修改标准和核心要求，我立刻针对性进行数据矫正和文字微调。咱们还是集中在事上解决，这样对推进最有利。”',
    reminder: '将情绪噪音自动过载成空白，只摘取里面的有理信息，没有信息就当他在弹垃圾，用事本位打破势压！',
    nonSelfFriction: '“别人的脸色和狂吠是他自己低频能量的宣泄，不是我的责任。我的心灵坚不可摧，他的负能量不得入侵半分。”'
  },
  no_resources: {
    reply: '“我也觉得迎难而上是个历练机会。为了能完成这个指标，我特意给出了最省钱的最小人力和预算配比报告，目前只等您确认：若无额外帮手和外包预算，我们该不该对本季度KPI的宏伟目标同步做出相应的下浮对齐？或者您看能不能帮我内部引流和引荐合作部门？我正等着您指路。”',
    reminder: '经典太极：“你卡经费我就申请缩水KPI，你要KPI就请帮我当大牌跑人情卡。”把皮球踢给天道！',
    nonSelfFriction: '“空手绝不打仗。我有我的才学，但不当廉价被割的羊毛。没有钢材，我也不会用血肉盖摩天大楼。”'
  },
  weekend_troll: {
    reply: '“收到，周末休息期间信息已浏览。由于目前这套系统的开发环境、服务器或参考资料都在咱们周一办公室本局，为防在家盲目脑补细节导致上线失误，我已经把该事项特意列入周一晨会的最紧急第一推，周一早晨一到九点，我马上发个排期报告和落实细节给您。祝休假愉快。”',
    reminder: '周五下班断网是一种品德，也是守住个人能量不漏的黄金圣盾！明示物理硬件卡点，延迟处理。',
    nonSelfFriction: '“周末的太阳、空气、咖啡都属于本我，我不帮别人的星期六焦虑买一分钱的单。不自毁、不神经过敏，周末我最大。”'
  }
};

// 15 protective amulets (each can have custom talisman details)
export const PROTECTIVE_AMULETS = [
  {
    id: 'talisman_1',
    name: '【小人退散符】',
    description: '此符一出，周围十米内的阴阳怪气自动化为乌有，恶语不入门庭，保护周身气场不被污染。',
    effect: '阴阳怪气自动失效',
    emoji: '🧙',
    bgColor: 'from-amber-200 to-yellow-100',
    borderColor: 'border-amber-400'
  },
  {
    id: 'talisman_2',
    name: '【口业反弹符】',
    description: '恶言不入你心，口业原路返回其身。他造谣你的口舌罪恶，终将化为他自己的嘴痛和噩梦。',
    effect: '口水原路反弹',
    emoji: '☯️',
    bgColor: 'from-rose-200 to-orange-100',
    borderColor: 'border-rose-400'
  },
  {
    id: 'talisman_3',
    name: '【功劳归位符】',
    description: '夺人功劳者，终失其福。此符驱逐投机者，让项目核心闪光点和汗水在汇报中回归辛劳的你。',
    effect: '谁做的事，功得其名',
    emoji: '💮',
    bgColor: 'from-emerald-200 to-teal-100',
    borderColor: 'border-emerald-400'
  },
  {
    id: 'talisman_4',
    name: '【不背锅神符】',
    description: '黑锅无端落，天雷震邪妄。此符锁死因果，锅从哪里来，无缝重力回传砸向原始发起人。',
    effect: '锅原路极速跌回',
    emoji: '🛡️',
    bgColor: 'from-blue-200 to-indigo-100',
    borderColor: 'border-blue-400'
  },
  {
    id: 'talisman_5',
    name: '【贵人护身符】',
    description: '身在凡世难免暗箭。此符在最急迫关头，引导高管、同盟出面说句公道话，正缘聚合、驱退浑虫。',
    effect: '关键时刻，必有人发公道声',
    emoji: '🎖️',
    bgColor: 'from-purple-200 to-fuchsia-100',
    borderColor: 'border-purple-400'
  },
  {
    id: 'talisman_6',
    name: '【福报回流符】',
    description: '夺人福泽终必归还。曾被偷得项目提成、职级晋升、健康气色，今日顺着流盘，回落你身。',
    effect: '好运气旋正在回身',
    emoji: '🌊',
    bgColor: 'from-cyan-200 to-sky-100',
    borderColor: 'border-cyan-400'
  },
  {
    id: 'talisman_7',
    name: '【暗箭折返符】',
    description: '行事在暗，伤人在后，天眼早已记名。背后冷冷一枪，打在神木护盾上调头射回其老千屁股。',
    effect: '背后冷箭掉头回射',
    emoji: '🏹',
    bgColor: 'from-orange-200 to-amber-100',
    borderColor: 'border-orange-500'
  },
  {
    id: 'talisman_8',
    name: '【虚伪照破符】',
    description: '皮囊一包，内心藏阴。照破假面，让虚假的和颜悦色和背后告黑状的小嘴脸暴露在烈日下。',
    effect: '假人假面，原形毕露',
    emoji: '🪞',
    bgColor: 'from-teal-200 to-emerald-100',
    borderColor: 'border-teal-400'
  },
  {
    id: 'talisman_9',
    name: '【边界护法符】',
    description: '下班为界，天地不可侵。任何过载、加塞、空难级别的折腾和道德绑架无法打扰纯净假期。',
    effect: '无理消耗不得近身',
    emoji: '💎',
    bgColor: 'from-pink-200 to-rose-100',
    borderColor: 'border-pink-400'
  }
];

// List of fun merits the user unlocked during the combat
export const MERIT_GAIN_OPTIONS = [
  '你获得功德 +1：识破办公室假人。',
  '你获得功德 +3：及时退避口业，功德在口。',
  '你获得功德 +5：成功把持边界，未被情绪垃圾带飞。',
  '你获得功德 +8：拒绝反思怪引导，守住了自身高频气色。',
  '你获得功德 +10：没替蠢锅买一分钱的因果债。',
  '你获得功德 +12：慧眼如炬，辨识了甩锅链条，明哲保身。',
  '你获得功德 +15：断开恶劣消耗，理智气流回旋。',
  '你获得功德 +18：把怨气化解移交给天道记账，身心清宁。',
  '你获得功德 +20：不与低能量脏东西同频拉锯。',
  '你获得功德 +30：神清气爽，正气回流，福报满乾坤。',
  '你获得小人屏蔽值 +10。',
  '你获得福报回流速度 +8。',
  '你获得口业绝对免疫护盾 +100。',
  '你获得“天道护体”绝密金钟罩一把。'
];
