import { Skill } from '../types';

export const SKILLS: Skill[] = [
  {
    id: 'rate-discount-report',
    name: "利率优惠签报智能生成",
    category: "审批文案生成 Skill",
    scene: "对中后台",
    audience: ["客户经理", "领导/审批"],
    input: ["客户名称", "优惠事项", "EVA/客户标签", "申请理由", "审批口径", "补充事实"],
    output: ["签报正文", "摘要", "可复制文本", "Word 文件"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/rate-offer",
    description: "针对银行利率优惠申请场景，自动生成符合中后台口径的结构化签报文案，减少手动转译时间。"
  },
  {
    id: 'cd-calculator',
    name: "银承/存单测算小助手",
    category: "测算类 Skill",
    scene: "对自己 + 对中后台 + 对客户",
    audience: ["客户经理", "中后台", "放款中心"],
    input: ["金额", "期限", "利率", "保证金/存单参数"],
    output: ["测算结果", "关键参数口径"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/acceptance-calculator",
    description: "快速测算银承、存单等业务的收益与成本，提供标准化的测算口径输出，方便与中后台沟通。"
  },
  {
    id: 'discount-credit-workflow',
    name: "贴现/专门授信工作流",
    category: "授信审批材料 Skill",
    scene: "对审查 + 对客户",
    audience: ["客户经理", "审查", "客户"],
    input: ["企业基础信息", "经营信息", "上下游信息", "营业收入", "净资产", "邮件地址"],
    output: ["字段确认单", "调查报告", "附件4", "操作规范", "客户盖章材料清单", "对内邮件", "对客邮件"],
    form: "Skill + Python + 调试网页",
    status: "需后端支持",
    description: "端到端的贴现及专门授信全流程辅助，涵盖从客户信息收集到内部报告生成的全套材料。"
  },
  {
    id: 'account-fee-discount',
    name: "账户业务费用优惠申请",
    category: "OA报批 Skill",
    scene: "对中后台 + 对客户",
    audience: ["客户经理", "领导审批", "客户"],
    input: ["申请机构", "联系方式", "客户名称", "申请日期", "EVA", "客户标签", "分行", "优惠项目选择"],
    output: ["年度优惠申请表 Excel", "OA申请文案", "对客话术"],
    form: "本地 Python GUI",
    status: "在线可用",
    toolRoute: "/fee-discount",
    description: "本地化工具，支持批量生成账户费用优惠申请所需的 Excel 表格及配套的 OA 审批文案。"
  },
  {
    id: 'batch-billing-generation',
    name: "项下开票批量生成",
    category: "模板批量生成 Skill",
    scene: "对中后台 + 对自己",
    audience: ["客户经理", "中后台", "柜台/放款中心"],
    input: ["开票主体信息", "账号", "合同编号", "日期", "金额", "存单信息", "多笔收款人明细"],
    output: ["多份 docx/xlsx 成品", "校对结果", "成品包", "zip"],
    form: "本地 Python + 模板批量生成",
    status: "开发中/能力介绍",
    description: "针对大批量开票需求，通过模板引擎一键生成多份标准化文档，大幅减少重复录入工作。"
  },
  {
    id: 'news-assistant',
    name: "宣传稿排版助手",
    category: "排版助手 Skill",
    scene: "对中后台",
    audience: ["客户经理", "中后台", "宣传员"],
    input: ["标题方向", "栏目方向", "落款单位", "投稿人", "日期", "原始材料", "图片"],
    output: ["成稿正文", "排版核对清单", "Word 文件"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/news-assistant",
    description: "自动整理并排版《厦行信息》投稿新闻稿，支持图片插入和 Word 导出。"
  }
];
