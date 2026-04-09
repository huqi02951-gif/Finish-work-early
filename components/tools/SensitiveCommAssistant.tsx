import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MessageSquare, 
  User, 
  Settings, 
  Sparkles, 
  Copy, 
  RefreshCcw, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Info,
  ShieldCheck,
  Zap,
  Phone,
  Mail,
  MessageCircle,
  LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../../src/components/layout/AppLayout';

// --- Types & Constants ---

type ScenarioId = 
  | 'fee-notice' 
  | 'subsidy-policy' 
  | 'unable-to-process' 
  | 'material-request' 
  | 'beneficiary-filing' 
  | 'counter-appointment' 
  | 'rate-adjustment' 
  | 'credit-status';

interface Scenario {
  id: ScenarioId;
  name: string;
  icon: React.ElementType;
  placeholder: string;
}

const SCENARIOS: Scenario[] = [
  { id: 'fee-notice', name: '收费通知', icon: Zap, placeholder: '收费事项、执行时间、规则简述...' },
  { id: 'subsidy-policy', name: '贴息政策说明', icon: Info, placeholder: '政策名称、适用对象、当前关注点...' },
  { id: 'unable-to-process', name: '无法办理/暂无法推进', icon: AlertCircle, placeholder: '事项名称、核心原因、替代建议...' },
  { id: 'material-request', name: '需客户配合提供材料', icon: MessageSquare, placeholder: '事项名称、所需材料、时间要求...' },
  { id: 'beneficiary-filing', name: '工商局受益所有人备案', icon: ShieldCheck, placeholder: '企业名称、联系人、备案要求...' },
  { id: 'counter-appointment', name: '柜面开户提前预约说明', icon: Phone, placeholder: '办理事项、建议时间、所需材料...' },
  { id: 'rate-adjustment', name: '利率调整通知', icon: Zap, placeholder: '业务类型、当前利率、调整后利率...' },
  { id: 'credit-status', name: '授信暂缓/补件/规则说明', icon: ShieldCheck, placeholder: '业务类型、推进状态、核心原因...' },
];

interface GeneratedOutput {
  direct: string;
  formal: string;
  soft: string;
  phone: string;
}

// --- Component ---

const SensitiveCommAssistant: React.FC = () => {
  const navigate = useNavigate();

  // --- State ---
  const [activeScenario, setActiveScenario] = useState<ScenarioId>('fee-notice');
  const [basicParams, setBasicParams] = useState({
    customerName: '',
    target: '老板',
    channel: '微信',
    tone: '标准专业',
    keepCooperation: '是',
    boundary: '中',
  });

  const [scenarioParams, setScenarioParams] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedOutput | null>(null);
  const [activeTab, setActiveTab] = useState<'direct' | 'formal' | 'soft' | 'phone'>('direct');

  // --- Handlers ---

  const handleBasicChange = (name: string, value: string) => {
    setBasicParams(prev => ({ ...prev, [name]: value }));
  };

  const handleScenarioChange = (name: string, value: any) => {
    setScenarioParams(prev => ({ ...prev, [name]: value }));
  };

  const generateContent = () => {
    setIsGenerating(true);
    
    // Simulate rule-based generation (Python logic equivalent)
    setTimeout(() => {
      const name = basicParams.customerName || '您';
      const scenario = SCENARIOS.find(s => s.id === activeScenario)?.name;
      
      let outputs: GeneratedOutput = {
        direct: '',
        formal: '',
        soft: '',
        phone: ''
      };

      // Rule Engine Logic
      switch (activeScenario) {
        case 'fee-notice': {
          const item = scenarioParams.feeItem || '对公账户转账手续费';
          const time = '4月1日';
          outputs = {
            direct: `${name}好，提前同步一下：从${time}开始，我行${item}将按现行标准执行。主要根据账户日均存款情况对应不同档次（如30万以内、30-500万、500万以上标准不同），系统会自动对应。建议您后续尽量多通过我行做结算和留存，日均和活跃度上来后标准更优。想了解具体哪一档可联系柜台573700确认。`,
            formal: `尊敬的客户：\n自${time}起，我行对公账户转账手续费将恢复按现行收费标准执行。收费标准将根据账户日均存款情况划分为三个档次：30万元以内、30万元至500万元、500万元以上。系统将根据账户实际情况自动匹配对应费率。建议贵司增加在我行的资金留存与结算往来，以获取更优费率。如需查询当前执行档次，请致电柜台573700咨询。`,
            soft: `${name}您好，和您说下手续费的事。从${time}起，对公转账手续费开始按现行标准走了，主要是看账户日均存款。像30万、500万这些节点对应的档次都不一样，系统会自动识别。所以建议您这边方便的话，尽量多把资金留在咱们行做结算，日均上来后收费会更划算。具体想查哪一档，拨打573700联系柜台就行。`,
            phone: `1. 告知${time}起恢复现行收费标准\n2. 说明“档次化收费”逻辑（日均30万/500万为界限）\n3. 强调系统自动对应，无需人工干预\n4. 建议增加资金留存以获取更优费率\n5. 提供柜台查询电话：573700`
          };
          break;
        }
        case 'subsidy-policy': {
          const policy = scenarioParams.policyName || '相关贴息政策';
          outputs = {
            direct: `${name}好，关于您关注的${policy}，目前最新口径是：主要面向符合条件的[适用对象]开展。具体贴息比例和申请流程我整理好发您，您可以先核对下准入条件。`,
            formal: `【政策说明】关于${policy}的最新通知：\n该政策旨在扶持[适用对象]，申请需满足[核心条件]。目前正处于申报窗口期，建议贵司尽快准备相关材料。`,
            soft: `${name}您好，您之前问到的那个贴息政策有新消息了。目前看准入要求比较明确，我先把核心条款发给您参考，看咱们公司是否能对得上。`,
            phone: `1. 告知政策已更新\n2. 明确适用对象与核心条件\n3. 提醒申报时效性\n4. 约定后续材料对接时间`
          };
          break;
        }
        case 'unable-to-process': {
          const item = scenarioParams.itemName || '该项业务';
          const reason = scenarioParams.reason || '暂不符合现行准入要求';
          outputs = {
            direct: `${name}好，关于您申请的${item}，这边和您确认一下目前情况。现阶段受[核心限制]影响，暂不具备推进条件，建议待相关条件补足后再行评估。`,
            formal: `【业务进度反馈】关于贵司申请的${item}，经多方评估，当前方案按现有条件暂难落地。主要原因为：${reason}。建议后续待相关经营数据完善后再行评估。`,
            soft: `${name}您好，关于${item}的进度先和您说明一下。结合目前政策和评估情况，仍需补足相关条件后再推进。我会持续帮您关注政策变化，一旦有转机立刻联系您。`,
            phone: `1. 缓冲开头（已尽力协调）\n2. 专业表述：暂不具备推进条件\n3. 给出补件或替代建议（如：其他产品）\n4. 保留后续合作空间，维护关系`
          };
          break;
        }
        case 'material-request': {
          const item = scenarioParams.itemName || '业务办理';
          const materials = scenarioParams.materials || '相关基础材料';
          outputs = {
            direct: `${name}好，办理${item}需要麻烦您配合提供以下材料：\n1. ${materials}\n麻烦近期准备好发我，我先预审一下，没问题再收原件。`,
            formal: `尊敬的客户：\n为确保${item}顺利推进，请贵司协助准备以下材料：\n${materials}\n请于[日期]前反馈电子版，以便我行及时开展后续流程。`,
            soft: `${name}您好，又要麻烦您了。为了把${item}的流程跑快一点，需要补几份材料：\n${materials}\n您可以先拍个照或发个扫描件给我，我帮您把关。`,
            phone: `1. 说明材料用途（为了提速）\n2. 逐项核对材料清单\n3. 确认获取材料的难易程度\n4. 约定反馈时间点`
          };
          break;
        }
        case 'beneficiary-filing': {
          outputs = {
            direct: `${name}好，根据《受益所有人信息管理办法》，自11月1日起需完成备案。操作建议：登录厦门市市场监督管理局系统（https://wssp.scjg.xm.gov.cn:4433/wssp/），用闽政通APP扫码登录最方便。进入“单独备案入口”选“自行填报”。提醒：如果公司有多个受益所有人，记得点击右上角“添加”全部备案。看到“上报成功”弹窗就完成了。`,
            formal: `【重要提醒】根据《受益所有人信息管理办法》，自2024年11月1日起，公司、合伙企业等主体应备案受益所有人信息。请登录：https://wssp.scjg.xm.gov.cn:4433/wssp/ -> 实名登录 -> 选择单位 -> 单独备案入口 -> 自行填报。提醒：需逐一对照标准识别，如有多个受益所有人均应予以备案（点击右上角“添加”）。看到“备案上报成功”弹窗即完成。`,
            soft: `${name}您好，有个配合事项和您说下。近期工商局要求受益所有人备案（24年11月1日起实施），为了不影响后续业务，建议您近期抽空在网上办一下。用闽政通APP扫码登录操作很快。如果公司受益人不止一个，记得都要填上。路径我发您，如有疑问随时找我。`,
            phone: `1. 政策背景（11月1日新规）\n2. 操作路径指引（推荐闽政通扫码登录）\n3. 提醒识别多个受益所有人的要求（点击“添加”）\n4. 强调合规重要性，避免影响后续业务`
          };
          break;
        }
        case 'counter-appointment': {
          const time = scenarioParams.suggestTime || '近期';
          outputs = {
            direct: `${name}好，关于开户的事，建议您预约在${time}。为了避免您白跑一趟，请务必带齐：1.营业执照原件 2.公章/财务章/法人章 3.法人及经办人身份证。到时找我即可。`,
            formal: `【开户预约确认】\n尊敬的客户，已为您预约${time}办理开户业务。请携带以下材料原件：营业执照、三章、相关人员身份证件。如需变更时间，请提前告知。`,
            soft: `${name}您好，开户的事我帮您排好了，建议${time}过来。材料清单我再发您核对一遍，咱们争取一次办好，节省您的时间。`,
            phone: `1. 确认预约时间\n2. 逐一核对必备材料（防止漏带）\n3. 告知行内具体位置及停车建议\n4. 确认联系人及电话`
          };
          break;
        }
        case 'rate-adjustment': {
          const type = scenarioParams.businessType || '存款业务';
          if (type === '协定存款') {
            outputs = {
              direct: `${name}好，根据协议约定及市场利率调整，您在我行的协定存款利率将于2025年4月28日起调整为1%。正式通知书我已通过邮件发您，麻烦核对一下。纸质版后续会通过EMS寄送，到时麻烦按协议原印章签收反馈。`,
              formal: `【利率调整通知】\n尊敬的客户：根据贵司与我行签署的协定存款协议兜底条款，自2025年4月28日起，贵司协定存款执行利率将调整为1%。我行已统一拟定《利率调整通知书》，请贵司确保签章与原协议一致并做好留档反馈。`,
              soft: `${name}您好，关于协定存款利率的事先和您同步下。根据协议里的兜底条款，自4月28日起利率将调整为1%。我先把通知书扫描件发您预审，后续纸质版寄到后麻烦配合签收一下，谢谢支持。`,
              phone: `1. 提及协议中的“兜底条款”背景\n2. 告知4月28日起利率调整为1%\n3. 提醒邮件查收扫描件，EMS寄送纸质版\n4. 强调签章需与原协议一致`
            };
          } else if (type === '通知存款') {
            outputs = {
              direct: `${name}好，根据人行最新要求，通知存款利率不得超过1.45%。建议您在4月25日前办理支取，可按原利率执行。若4月25日之后支取，超过1.45%的部分将统一按1.45%计息。支取后您可以按新利率续存。`,
              formal: `【通知存款整改通知】\n尊敬的客户：根据人民银行最新监管要求，存量通知存款利率需进行整改。贵司在我行办理的通知存款，请于2025年4月25日前办理支取，可按原利率执行。若逾期支取，超过1.45%的部分将自起存之日起按1.45%计息。`,
              soft: `${name}您好，关于通知存款利率整改的事和您沟通下。受监管新规影响，利率上限统一调至1.45%。建议您在4月25号前抽空办下支取，这样能保住之前的原利率收益，之后咱们再按新标准续存。`,
              phone: `1. 提及人行最新监管要求\n2. 明确4月25日为关键时点\n3. 说明逾期支取的计息规则变化\n4. 建议客户提前支取并按新利率续存`
            };
          } else {
            outputs = {
              direct: `${name}好，提前和您同步一下，根据市场利率定价自律机制要求，自[日期]起，${type}利率将调整为[利率]。这是全行业统一调整，建议您关注下资金安排。`,
              formal: `【利率调整通知】\n尊敬的客户：受市场利率环境变化影响，我行将于[日期]起对${type}执行新利率标准（[利率]）。感谢您的理解与支持。`,
              soft: `${name}您好，关于${type}利率的事先和您沟通下。近期全行业利率都在下行，行内也将于[日期]起做小幅调整。我帮您看了下，目前的方案在同业中仍具竞争力。`,
              phone: `1. 行业背景说明（全行业下调）\n2. 告知具体调整日期及新利率\n3. 强调我行方案的相对优势\n4. 引导客户进行长期资金规划`
            };
          }
          break;
        }
        case 'credit-status': {
          const reason = scenarioParams.reason || '暂不符合准入条件';
          outputs = {
            direct: `${name}好，关于您申请的业务，这边和您确认一下目前情况。现阶段暂不具备推进条件，建议待相关条件补足后再行评估。`,
            formal: `【业务进度反馈】\n关于贵司申请的授信业务，经评估，当前方案按现有条件暂难落地。建议后续待相关经营数据完善后再行评估。`,
            soft: `${name}您好，提前和您说明一下授信进度。结合目前情况，仍需补足相关条件后再评估，我会持续帮您关注政策变化。`,
            phone: `1. 缓冲开头（已尽力协调）\n2. 专业表述：暂不具备推进条件\n3. 给出补件或替代建议\n4. 保留后续合作空间`
          };
          break;
        }
        default:
          outputs = {
            direct: `${name}好，关于${scenario}事项，提前和您说明一下目前情况...`,
            formal: `尊敬的客户：\n关于${scenario}的正式说明...`,
            soft: `${name}您好，关于${scenario}的事项先和您沟通下...`,
            phone: `1. 沟通背景\n2. 核心事项说明\n3. 客户需配合动作\n4. 后续安排`
          };
      }

      setResult(outputs);
      setIsGenerating(false);
    }, 600);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // --- Render Helpers ---

  const renderScenarioInputs = () => {
    switch (activeScenario) {
      case 'fee-notice':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">收费事项</label>
              <select 
                className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark appearance-none"
                onChange={(e) => handleScenarioChange('feeItem', e.target.value)}
              >
                <option value="对公电子渠道转账手续费">对公电子渠道转账手续费</option>
                <option value="账户管理费">账户管理费</option>
                <option value="网银服务费">网银服务费</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">生效日期</label>
              <input 
                type="text" 
                defaultValue="2026年4月1日"
                className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark"
                onChange={(e) => handleScenarioChange('startTime', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">优惠策略</label>
              <div className="p-4 bg-brand-gold/5 border border-brand-gold/10 rounded-xl text-[10px] text-brand-dark/60 leading-relaxed">
                系统自动识别、自动减免。引导客户提升活期日均存款或加强网银使用频率。
              </div>
            </div>
          </div>
        );
      case 'subsidy-policy':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">政策名称</label>
              <input 
                type="text" 
                placeholder="例如：中小企业贷款贴息、科技型企业补助"
                className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark"
                onChange={(e) => handleScenarioChange('policyName', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">适用对象/核心条件</label>
              <textarea 
                placeholder="例如：年收入5000万以下、属于高新技术企业..."
                className="w-full h-24 px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark resize-none"
              />
            </div>
          </div>
        );
      case 'unable-to-process':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">事项名称</label>
              <input 
                type="text" 
                placeholder="例如：新增授信额度、贷款展期"
                className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark"
                onChange={(e) => handleScenarioChange('itemName', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">核心原因</label>
              <select 
                className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark appearance-none"
                onChange={(e) => handleScenarioChange('reason', e.target.value)}
              >
                <option>暂不符合现行准入要求</option>
                <option>受行业政策限制</option>
                <option>担保措施不充分</option>
                <option>经营数据未达标</option>
              </select>
            </div>
          </div>
        );
      case 'material-request':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">事项名称</label>
              <input 
                type="text" 
                placeholder="例如：授信年审、开户资料补全"
                className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark"
                onChange={(e) => handleScenarioChange('itemName', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">所需材料清单</label>
              <textarea 
                placeholder="1. 近半年流水\n2. 购销合同\n3. 财务报表..."
                className="w-full h-32 px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark resize-none"
                onChange={(e) => handleScenarioChange('materials', e.target.value)}
              />
            </div>
          </div>
        );
      case 'beneficiary-filing':
        return (
          <div className="p-8 bg-brand-light-gray/30 rounded-2xl border border-brand-border/5 space-y-4">
            <div className="flex items-center gap-3 text-brand-gold">
              <ShieldCheck size={18} />
              <span className="text-xs font-bold">2024年11月1日 监管新规指引</span>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-brand-dark font-bold uppercase tracking-widest">核心提示：</p>
              <ul className="text-[10px] text-brand-gray font-medium list-disc pl-4 space-y-1">
                <li>受益所有人可能不止1个，需全部备案。</li>
                <li>推荐使用“闽政通APP扫码登录”最便捷。</li>
                <li>如未显示企业，需先选择“去认领法人”。</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-xl border border-brand-border/5">
              <p className="text-[9px] text-brand-gold font-bold mb-1">操作路径：</p>
              <p className="text-[9px] text-brand-gray leading-relaxed">
                厦门市市场监督管理局系统 → 实名认证 → 选择单位 → 单独备案入口 → 自行填报 → 上报成功。
              </p>
            </div>
          </div>
        );
      case 'counter-appointment':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">建议办理时间</label>
              <input 
                type="text" 
                placeholder="例如：本周三下午 14:30"
                className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark"
                onChange={(e) => handleScenarioChange('suggestTime', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">必备材料提醒</label>
              <textarea 
                placeholder="默认已包含：营业执照、三章、身份证件..."
                className="w-full h-24 px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark resize-none"
              />
            </div>
          </div>
        );
      case 'rate-adjustment':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">业务类型</label>
              <select 
                className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark appearance-none"
                onChange={(e) => handleScenarioChange('businessType', e.target.value)}
              >
                <option>协定存款</option>
                <option>通知存款</option>
                <option>定期存款</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">生效日期</label>
              <input 
                type="text" 
                placeholder="例如：2024年4月25日"
                className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">新利率标准</label>
              <input 
                type="text" 
                placeholder="例如：1.00%"
                className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark"
              />
            </div>
          </div>
        );
      case 'credit-status':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">核心原因</label>
              <select 
                className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark appearance-none"
                onChange={(e) => handleScenarioChange('reason', e.target.value)}
              >
                <option value="暂不符合我行授信准入条件">暂不符合我行授信准入条件</option>
                <option value="现阶段暂不具备授信推进条件">现阶段暂不具备授信推进条件</option>
                <option value="当前授信方案按现有条件暂难落地">当前授信方案按现有条件暂难落地</option>
                <option value="需进一步补充资料后再作授信判断">需进一步补充资料后再作授信判断</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">补充建议/材料</label>
              <textarea 
                placeholder="例如：建议增加担保物、补充近半年流水..."
                className="w-full h-32 px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-brand-dark resize-none"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8 bg-brand-light-gray/30 rounded-2xl border border-dashed border-brand-border/20 text-center">
            <p className="text-sm text-brand-gray italic">当前场景字段正在根据 Python 规则引擎进行配置中...</p>
          </div>
        );
    }
  };

  return (
    <AppLayout title="敏感沟通助手" showBack>
      <div className="py-8 md:py-16 bg-brand-offwhite min-h-screen">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 md:mb-12 animate-fade-in-up">
              <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-dark text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shrink-0">
                  <ShieldCheck size={24} className="md:hidden" />
                  <ShieldCheck size={32} className="hidden md:block" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-serif text-brand-dark tracking-tight">敏感沟通助手</h1>
                  <p className="text-xs md:text-base text-brand-gray font-medium opacity-60 mt-1 md:mt-2">处理对客沟通中“必须说、但不好说”的敏感事项</p>
                </div>
              </div>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-7 space-y-8 md:space-y-10 animate-fade-in-up">
              {/* 1. Scenario Selection */}
              <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 md:mb-10 opacity-60 flex items-center gap-3">
                  <LayoutDashboard size={14} className="text-brand-gold md:w-4 md:h-4" /> 场景选择
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveScenario(s.id)}
                      className={cn(
                        "p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all flex flex-col items-center gap-2 md:gap-3 text-center group",
                        activeScenario === s.id 
                          ? "bg-brand-dark text-white border-brand-dark shadow-lg" 
                          : "bg-brand-light-gray/50 border-transparent hover:bg-brand-light-gray text-brand-gray"
                      )}
                    >
                      <s.icon size={18} className={cn("md:w-5 md:h-5", activeScenario === s.id ? "text-brand-gold" : "group-hover:text-brand-dark")} />
                      <span className="text-[9px] md:text-[10px] font-bold leading-tight">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Basic Parameters */}
              <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 md:mb-10 opacity-60 flex items-center gap-3">
                  <User size={14} className="text-brand-gold md:w-4 md:h-4" /> 基础参数
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">客户称呼</label>
                    <input 
                      type="text" 
                      placeholder="例如：张总、王经理"
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                      value={basicParams.customerName}
                      onChange={(e) => handleBasicChange('customerName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">客户对象</label>
                    <select 
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-sm md:text-base text-brand-dark appearance-none"
                      value={basicParams.target}
                      onChange={(e) => handleBasicChange('target', e.target.value)}
                    >
                      <option>老板</option>
                      <option>财务</option>
                      <option>经办人</option>
                      <option>其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">沟通渠道</label>
                    <div className="flex gap-2">
                      {['微信', '短信', '邮件', '电话'].map(c => (
                        <button 
                          key={c}
                          onClick={() => handleBasicChange('channel', c)}
                          className={cn(
                            "flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl border text-[9px] md:text-[10px] font-bold transition-all",
                            basicParams.channel === c ? "bg-brand-dark text-white border-brand-dark" : "bg-brand-light-gray/50 border-transparent text-brand-gray"
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">语气风格</label>
                    <select 
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-medium text-sm md:text-base text-brand-dark appearance-none"
                      value={basicParams.tone}
                      onChange={(e) => handleBasicChange('tone', e.target.value)}
                    >
                      <option>更柔和</option>
                      <option>标准专业</option>
                      <option>更明确</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Scenario Specific Inputs */}
              <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 md:mb-10 opacity-60 flex items-center gap-3">
                  <Zap size={14} className="text-brand-gold md:w-4 md:h-4" /> 场景专属输入
                </h2>
                {renderScenarioInputs()}
              </div>

              <button 
                onClick={generateContent}
                disabled={isGenerating}
                className={cn(
                  "w-full py-5 md:py-6 bg-brand-dark text-white rounded-2xl md:rounded-[2rem] font-bold text-lg md:text-xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95",
                  isGenerating ? "opacity-70 cursor-not-allowed" : "hover:bg-brand-dark/90"
                )}
              >
                {isGenerating ? <RefreshCcw size={20} className="md:w-6 md:h-6 animate-spin" /> : <MessageSquare size={20} className="md:w-6 md:h-6" />}
                {isGenerating ? '正在匹配规则生成...' : '生成沟通话术'}
              </button>
            </div>

            {/* Right Column: Outputs & AI Reserved */}
            <div className="lg:col-span-5 space-y-8 md:space-y-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {/* 4. Output Area */}
              <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-xl overflow-hidden flex flex-col min-h-[400px] md:min-h-[500px]">
                <div className="bg-brand-light-gray/50 px-6 md:px-8 py-4 md:py-6 border-b border-brand-border/5 flex items-center justify-between">
                  <h3 className="font-serif text-lg md:text-xl text-brand-dark flex items-center gap-2 md:gap-3">
                    <CheckCircle2 size={18} className="md:w-5 md:h-5 text-emerald-500" /> 建议话术
                  </h3>
                  <div className="flex gap-2">
                    <button className="p-1.5 md:p-2 bg-white text-brand-gray rounded-lg border border-brand-border/10 opacity-40 cursor-not-allowed" title="AI 优化 (后续开放)">
                      <Sparkles size={14} className="md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex border-b border-brand-border/5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'direct', name: '直接发送', icon: MessageCircle },
                    { id: 'formal', name: '更正式', icon: Mail },
                    { id: 'soft', name: '更柔和', icon: User },
                    { id: 'phone', name: '电话提纲', icon: Phone },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex-1 min-w-[80px] py-3 md:py-4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-1 transition-all border-b-2",
                        activeTab === tab.id ? "text-brand-gold border-brand-gold bg-brand-gold/5" : "text-brand-gray border-transparent hover:bg-brand-light-gray/30"
                      )}
                    >
                      <tab.icon size={12} className="md:w-3.5 md:h-3.5" />
                      {tab.name}
                    </button>
                  ))}
                </div>

                <div className="p-6 md:p-8 flex-grow relative">
                  <AnimatePresence mode="wait">
                    {result ? (
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4 md:space-y-6"
                      >
                        <div className="p-5 md:p-6 bg-brand-light-gray/30 rounded-xl md:rounded-2xl border border-brand-border/5 min-h-[180px] md:min-h-[200px]">
                          <p className="text-xs md:text-sm text-brand-dark leading-relaxed whitespace-pre-wrap font-medium">
                            {result[activeTab]}
                          </p>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(result[activeTab])}
                          className="w-full py-3.5 md:py-4 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <Copy size={14} className="md:w-4 md:h-4" /> 复制该版本
                        </button>
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12 text-center opacity-20">
                        <MessageSquare size={40} className="md:w-12 md:h-12 mb-4" />
                        <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest">等待生成内容</p>
                        <p className="text-[9px] md:text-xs mt-2">请在左侧选择场景并填写参数</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 5. AI Reserved Area */}
              <div className="bg-brand-dark p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles size={60} className="md:w-20 md:h-20" />
                </div>
                <h2 className="text-[10px] md:text-[11px] font-bold text-white/40 uppercase tracking-[0.3em] mb-6 md:mb-8 flex items-center gap-3">
                  <Settings size={14} className="text-brand-gold md:w-4 md:h-4" /> AI 增强预留 (后续开放)
                </h2>
                <div className="space-y-4 md:space-y-6 relative z-10">
                  <div className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl opacity-50">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/60">高级润色模式</span>
                      <div className="w-8 h-4 bg-white/10 rounded-full relative">
                        <div className="absolute left-1 top-1 w-2 h-2 bg-white/20 rounded-full"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      {['更自然', '更正式', '更简洁', '更稳妥'].map(m => (
                        <div key={m} className="px-2 md:px-3 py-1.5 md:py-2 bg-white/5 rounded-lg text-[8px] md:text-[9px] font-bold text-white/30 border border-white/5 text-center">
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-xl opacity-50">
                    <AlertCircle size={14} className="md:w-4 md:h-4 text-brand-gold" />
                    <span className="text-[9px] md:text-[10px] font-bold text-brand-gold/80 uppercase tracking-widest">API Key 已预留配置入口</span>
                  </div>

                  <button 
                    disabled
                    className="w-full py-3.5 md:py-4 bg-white/5 border border-white/10 text-white/30 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} className="md:w-4 md:h-4" /> 开启 AI 深度润色
                  </button>
                </div>
              </div>

              <button 
                onClick={() => navigate(-1)}
                className="w-full py-3.5 md:py-4 bg-white text-brand-gray border border-brand-border/10 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs hover:bg-brand-light-gray transition-all flex items-center justify-center gap-2"
              >
                返回场景中心 <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
);
};

export default SensitiveCommAssistant;
