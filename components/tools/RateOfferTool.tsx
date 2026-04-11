import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Download, FileText, Info, Sparkles, ChevronRight, CheckCircle2, ArrowLeft, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import AppLayout from '../../src/components/layout/AppLayout';
import { ActionBar } from '../shared/ActionBar';
import { buildRateOfferDocx } from '../../lib/exportDocx';

// --- Data from JSON ---
const CONFIG = {
  "titleTemplates": { "main": "{branch}关于{cust}贷款利率优惠的申请" },
  "summaryTemplate": "客户：{cust}；金额：{amt}万元；期限：{tenor}；拟执行利率：{rate}%；用途：{use}；担保：{gb}；审批：{apprPath}。",
  "THRESH": {
    "6个月": { "国企/总战/台商": 2.28, "科技/绿色": 2.28, "普惠": 2.28, "非上述客群": 2.28 },
    "1年":   { "国企/总战/台商": 2.31, "科技/绿色": 2.50, "普惠": 2.60, "非上述客群": 2.70 },
    "2年":   { "国企/总战/台商": 2.44, "科技/绿色": 2.50, "普惠": 2.60, "非上述客群": 2.70 },
    "3年":   { "国企/总战/台商": 2.54, "科技/绿色": 2.64, "普惠": 2.54, "非上述客群": 2.70 },
    "4年":   { "国企/总战/台商": 2.63, "科技/绿色": 2.63, "普惠": 2.63, "非上述客群": 2.70 }
  },
  "segGroupMap": { "普惠小微": "普惠", "科技": "科技/绿色", "绿色": "科技/绿色", "台商": "国企/总战/台商", "一般客群": "非上述客群", "上市公司": "非上述客群" },
  "products": ["税易贷", "成长伴侣", "科技贷", "流动资金贷款", "项目贷款", "抵押贷款", "信用贷款", "票据贴现", "银承"],
  "purposes": ["企业经营周转","采购备货","支付工资","设备购置","研发投入","项目建设"],
  "collateral": ["不动产抵押", "担保公司100%保证","知识产权质押","信用"],
  "industryTemplates": {
    "通用": { "talk": "营收稳定，企业经营前景较好；现金回笼节奏与采购/销售匹配，主要指标稳健。" },
    "制造业": { "talk": "以销定产、订单驱动；原材料与人工波动对毛利敏感；应收/存货周转保持在合理区间，现金流覆盖本息。" },
    "批发和零售业": { "talk": "轻资产、高周转；结算笔数大、资金回笼快；通过保理/票据对冲应收集中度，沉淀结算资金。" },
    "建筑业": { "talk": "项目制管理，回款受业主资质与进度影响；保函需求刚性，授信节奏与工程节点匹配。" },
    "信息传输、软件和信息技术服务业": { "talk": "轻资产、应收账期偏长；以知识产权/合同回款为信用补充；适配科技债资金，控制价格敏感度。" },
    "电力、热力、燃气及水生产和供应业": { "talk": "准公益属性，回款稳定；价格受政策边界约束；以保函与短期周转贷配套。" },
    "交通运输、仓储和邮政业": { "talk": "运力配置与油价/运价联动；以运单/货权质押及保理沉淀结算资金。" },
    "农、林、牧、渔业": { "talk": "季节性与政策性强；保险增信+仓单/订单融资；绿色属性可匹配绿债资金。" },
    "卫生和社会工作/医药": { "talk": "费用结算周期较长；医保/商保回款影响应收；可做应收质押并对接供应链平台。" }
  },
  "docExt": {
    "attachments": [
      "EVA测算截图",
      "审批通知书",
      "人行报备报告及表格（如申请自律加点豁免）"
    ]
  },
  "incomePlans": [
    {"id":"A","label":"主办结算","text":"以我行作为主办结算行，提升企业综合结算与产品使用频率。"},
    {"id":"B","label":"代发与代缴","text":"落地工资代发与代扣代缴，增加多业务合作。"},
    {"id":"C","label":"供应链拓展","text":"围绕上下游引入保理、票据、保函等产品，带动链式客户。"},
    {"id":"D","label":"票据与保函/国际","text":"开展票据与保函业务，叠加国际结算，形成中收增量。"},
    {"id":"E","label":"投融资协同","text":"配置结构性存款/理财，并对接投行产品，贡献中收。"},
    {"id":"F","label":"科技/绿色专属","text":"重点支持领域，企业发展前景较好，匹配科技债或绿债资金，获取政策性成本优势。"}
  ],
  "industryIncomePreset": {
    "制造业": ["A","C"],
    "批发和零售业": ["A","B","D"],
    "建筑业": ["D","A"],
    "信息传输、软件和信息技术服务业": ["A","B","F"],
    "电力、热力、燃气及水生产和供应业": ["D","A"],
    "交通运输、仓储和邮政业": ["A","C"],
    "农、林、牧、渔业": ["F","A"],
    "卫生和社会工作/医药": ["A","C"],
    "通用": ["A"]
  },
  "peerRange": { "default": [2.30, 2.50] },
  "styleTemplates": {
    "simple": {
      "preface": "各位领导好，现就本次利率优惠说明如下。",
      "pricing_intro": "审批权限口径：{layer}。{thrLine}",
      "pricing_refs": "参考基准：一年期LPR{lpr}% ，FTP{ftp}% 。",
      "pricing_diff": "利率对比：拟执行利率{rate}%；较LPR{dL}BP；与FTP利差{dF}BP。",
      "structure_line": "我行产品：以{prods}为主，期限{tenor}，与客户经营周期匹配。",
      "application_line": "拟新增/调整授信{amt}万元，期限{tenor}，品种为{prods}，拟执行利率{rate}% 。",
      "measures_hint": "配套以交易核验与现金管理为主。",
      "riskTone": "关注企业经营第一性、资金用途与回款落实情况，跟进落实企业贷后情况。",
      "conclusion": "综合评估，建议按上述方案办理。"
    },
    "full": {
      "preface": "基于客户经营情况、资金成本与权限口径，提出如下完整方案，供审阅。",
      "pricing_intro": "审批权限口径：{layer}。{thrLine}",
      "pricing_refs": "参考基准：一年期LPR{lpr}% ，FTP{ftp}% 。",
      "pricing_diff": "利率对比：拟执行利率{rate}%；较LPR{dL}BP；与FTP利差{dF}BP。",
      "structure_line": "结构安排：以{prods}为主，期限{tenor}，与客户经营周期匹配。担保方式：{gbLine}；资金用途：{useLine}。",
      "application_line": "拟新增/调整授信{amt}万元，期限{tenor}，品种为{prods}，拟执行利率{rate}% 。{stockLine}",
      "measures_hint": "配套措施：{measures}",
      "riskTone": "结合行业特征与授信结构，关注原材料波动、周转效率与现金流波动。",
      "conclusion": "按制度口径与收益测算，建议按本方案执行，配套措施同步落实。"
    },
    "compliance": {
      "preface": "本申请遵循现行授信与定价管理办法，严格执行监管及行内制度要求，具体如下。",
      "pricing_intro": "审批权限口径：{layer}。{thrLine}",
      "pricing_refs": "参考基准：一年期LPR{lpr}% ，FTP{ftp}% 。",
      "pricing_diff": "利率对比：拟执行利率{rate}%；较LPR{dL}BP；与FTP利差{dF}BP。",
      "structure_line": "结构安排：以{prods}为主，期限{tenor}；担保方式：{gbLine}；资金用途：{useLine}。",
      "application_line": "拟新增/调整授信{amt}万元，期限{tenor}，品种为{prods}，拟执行利率{rate}% 。{stockLine}",
      "measures_hint": "合规提示：严格核验交易真实性与回款闭环，资金不得流向限制性领域。",
      "riskTone": "强调真实性与合规性：用途真实可核、交易闭环可证、资金不流向限制领域；对低于分行权限的情形依法合规提请上级审批。",
      "conclusion": "本案在权限与收益底线内提出办理建议；如遇口径变化，将按流程及时调整。请予审阅并批准/按权限提请上级审批。"
    }
  }
};

const RateOfferTool: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    branch: '科技业务部',
    cust: '',
    amt: '',
    tenor: '1年',
    rate: '',
    use: '企业经营周转',
    gb: '信用',
    apprPath: '分行权限',
    lpr: '3.45',
    ftp: '2.15',
    industry: '通用',
    stock: '',
    style: 'full',
    selectedIncomePlans: [] as string[],
  });

  const [result, setResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIncomePlanToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedIncomePlans: prev.selectedIncomePlans.includes(id)
        ? prev.selectedIncomePlans.filter(item => item !== id)
        : [...prev.selectedIncomePlans, id]
    }));
  };

  const loadExample = () => {
    setFormData({
      branch: '科技业务部',
      cust: '厦门某智能制造有限公司',
      amt: '1000',
      tenor: '1年',
      rate: '2.85',
      use: '采购原材料',
      gb: '不动产抵押',
      apprPath: '分行权限',
      lpr: '3.45',
      ftp: '2.15',
      industry: '制造业',
      stock: '存量授信500万元已结清',
      style: 'full',
      selectedIncomePlans: ['A', 'C'],
    });
  };

  const generateResult = () => {
    if (!formData.cust || !formData.amt || !formData.rate) {
      alert('请填写客户名称、金额和利率');
      return;
    }

    setIsGenerating(true);
    
    // Simulate generation delay for premium feel
    setTimeout(() => {
      const { branch, cust, amt, tenor, rate, use, gb, apprPath, lpr, ftp, industry, stock, style, selectedIncomePlans } = formData;
      
      // Calculate diffs
      const dL = Math.round((parseFloat(rate) - parseFloat(lpr)) * 100);
      const dF = Math.round((parseFloat(rate) - parseFloat(ftp)) * 100);
      
      // Determine layer and threshold
      const layer = apprPath;
      const group = CONFIG.segGroupMap[industry as keyof typeof CONFIG.segGroupMap] || "非上述客群";
      const thr = (CONFIG.THRESH as any)[tenor]?.[group] || 2.70;
      const thrLine = parseFloat(rate) < thr ? `拟执行利率低于底线(${thr}%)，需提请上级审批。` : `拟执行利率高于底线(${thr}%)。`;

      const incomeTexts = CONFIG.incomePlans
        .filter(p => selectedIncomePlans.includes(p.id))
        .map(p => p.text)
        .join(' ');

      const industryTalk = (CONFIG.industryTemplates as any)[industry]?.talk || CONFIG.industryTemplates.通用.talk;

      const replaceTags = (template: string) => {
        return template
          .replace(/{branch}/g, branch)
          .replace(/{cust}/g, cust)
          .replace(/{amt}/g, amt)
          .replace(/{tenor}/g, tenor)
          .replace(/{rate}/g, rate)
          .replace(/{use}/g, use)
          .replace(/{gb}/g, gb)
          .replace(/{apprPath}/g, apprPath)
          .replace(/{lpr}/g, lpr)
          .replace(/{ftp}/g, ftp)
          .replace(/{dL}/g, dL.toString())
          .replace(/{dF}/g, dF.toString())
          .replace(/{layer}/g, layer)
          .replace(/{thrLine}/g, thrLine)
          .replace(/{prods}/g, "流动资金贷款") // Default for now
          .replace(/{gbLine}/g, gb)
          .replace(/{useLine}/g, use)
          .replace(/{stockLine}/g, stock ? `(${stock})` : '')
          .replace(/{measures}/g, incomeTexts || "加强日常结算监控。");
      };

      const styleTpl = (CONFIG.styleTemplates as any)[style];
      
      const title = replaceTags(CONFIG.titleTemplates.main);
      const summary = replaceTags(CONFIG.summaryTemplate);
      
      const body = [
        styleTpl.preface,
        replaceTags(styleTpl.pricing_intro),
        replaceTags(styleTpl.pricing_refs),
        replaceTags(styleTpl.pricing_diff),
        replaceTags(styleTpl.structure_line),
        replaceTags(styleTpl.application_line),
        `行业分析：${industryTalk}`,
        replaceTags(styleTpl.measures_hint),
        styleTpl.riskTone,
        styleTpl.conclusion
      ].join('\n\n');

      setResult({ title, summary, body });
      setIsGenerating(false);
    }, 800);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast here
  };

  const downloadTxt = () => {
    if (!result) return;
    const content = `标题：${result.title}\n\n摘要：${result.summary}\n\n正文：\n${result.body}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.cust}_利率优惠申请.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout title="利率优惠生成" showBack>
    <div className="py-4 md:py-8 bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-4 md:px-6">

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 mb-4 sm:mb-10 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-brand-gold/10 rounded-lg sm:rounded-xl flex items-center justify-center text-brand-gold shadow-sm border border-brand-gold/20 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-2xl font-serif text-brand-dark tracking-tight">利率优惠智能生成</h1>
                <p className="text-[11px] sm:text-sm text-brand-gray font-medium opacity-60 mt-0.5">自动生成规范化的利率优惠申请文案</p>
              </div>
            </div>
            <button 
              onClick={loadExample}
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-white text-brand-dark border border-brand-border/10 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs hover:bg-brand-light-gray transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> 加载示例
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
            {/* Input Section */}
            <div className="lg:col-span-6 space-y-8 md:space-y-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 md:mb-10 opacity-60 flex items-center gap-3">
                  <FileText className="w-4 h-4 text-brand-gold" /> 基础信息
                </h2>

                <div className="space-y-6 md:space-y-8">
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">客户名称 *</label>
                    <input 
                      type="text" 
                      name="cust"
                      value={formData.cust}
                      onChange={handleInputChange}
                      placeholder="请输入完整的企业名称"
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">申请机构</label>
                      <input 
                        type="text" 
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">金额 (万元) *</label>
                      <input 
                        type="number" 
                        name="amt"
                        value={formData.amt}
                        onChange={handleInputChange}
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">期限</label>
                      <select 
                        name="tenor"
                        value={formData.tenor}
                        onChange={handleInputChange}
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark appearance-none"
                      >
                        {Object.keys(CONFIG.THRESH).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">拟执行利率 (%) *</label>
                      <input 
                        type="number" 
                        name="rate"
                        step="0.01"
                        value={formData.rate}
                        onChange={handleInputChange}
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 md:mb-10 opacity-60 flex items-center gap-3">
                  <Info className="w-4 h-4 text-brand-gold" /> 业务详情
                </h2>
                <div className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">所属行业</label>
                      <select 
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark appearance-none"
                      >
                        {Object.keys(CONFIG.industryTemplates).map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">担保方式</label>
                      <select 
                        name="gb"
                        value={formData.gb}
                        onChange={handleInputChange}
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark appearance-none"
                      >
                        {CONFIG.collateral.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">资金用途</label>
                    <select 
                      name="use"
                      value={formData.use}
                      onChange={handleInputChange}
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark appearance-none"
                    >
                      {CONFIG.purposes.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 md:mb-4 opacity-60">中收/综合贡献计划</label>
                    <div className="grid grid-cols-2 gap-2 md:gap-3 mt-2">
                      {CONFIG.incomePlans.map(plan => (
                        <button
                          key={plan.id}
                          onClick={() => handleIncomePlanToggle(plan.id)}
                          className={cn(
                            "text-left px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs transition-all border font-bold",
                            formData.selectedIncomePlans.includes(plan.id)
                              ? "bg-brand-gold/10 border-brand-gold text-brand-gold shadow-sm"
                              : "bg-brand-light-gray/50 border-brand-border/5 text-brand-gray hover:bg-brand-light-gray"
                          )}
                        >
                          {plan.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 md:mb-10 opacity-60 flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-brand-gold" /> 生成选项
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">文案风格</label>
                    <select 
                      name="style"
                      value={formData.style}
                      onChange={handleInputChange}
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark appearance-none"
                    >
                      <option value="simple">精简版</option>
                      <option value="full">完整版</option>
                      <option value="compliance">合规版</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">审批权限</label>
                    <select 
                      name="apprPath"
                      value={formData.apprPath}
                      onChange={handleInputChange}
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark appearance-none"
                    >
                      <option value="分行权限">分行权限</option>
                      <option value="总行权限">总行权限</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={generateResult}
                    disabled={isGenerating}
                    className={cn(
                      "flex-grow py-4 md:py-5 bg-brand-dark text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95",
                      isGenerating ? "opacity-70 cursor-not-allowed" : "hover:bg-brand-dark/90"
                    )}
                  >
                    {isGenerating ? (
                      <RefreshCcw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    {isGenerating ? '正在构建方案...' : '立即生成文案'}
                  </button>
                  <button 
                    onClick={() => setFormData({
                      branch: '科技业务部',
                      cust: '',
                      amt: '',
                      tenor: '1年',
                      rate: '',
                      use: '企业经营周转',
                      gb: '信用',
                      apprPath: '分行权限',
                      lpr: '3.45',
                      ftp: '2.15',
                      industry: '通用',
                      stock: '',
                      style: 'full',
                      selectedIncomePlans: [],
                    })}
                    className="p-4 md:p-5 bg-brand-light-gray text-brand-gray rounded-xl md:rounded-2xl font-bold hover:bg-brand-border/10 transition-all active:scale-95 flex items-center justify-center"
                  >
                    <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Result Section */}
            <div className="lg:col-span-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {result ? (
                <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] border border-brand-border/10 shadow-2xl overflow-hidden flex flex-col h-full sticky top-24">
                  <div className="bg-brand-light-gray/50 px-6 md:px-10 py-6 md:py-8 border-b border-brand-border/5 flex items-center justify-between">
                    <h3 className="font-serif text-xl md:text-2xl text-brand-dark flex items-center gap-2 md:gap-3">
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" /> 生成结果
                    </h3>
                    <ActionBar
                      copyText={`标题：${result.title}\n\n摘要：${result.summary}\n\n正文：\n${result.body}`}
                      buildDocx={() => buildRateOfferDocx(result, formData.cust)}
                      docxFilename={`${formData.cust || '利率优惠'}_签报_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.docx`}
                      toolId="rate-offer"
                      historyTitle={`${formData.cust} - ${formData.amt}万 ${formData.rate}%`}
                      historyContent={`标题：${result.title}\n\n摘要：${result.summary}\n\n正文：\n${result.body}`}
                      historyMetadata={{ formData }}
                    />
                  </div>
                  
                  <div className="p-6 md:p-10 space-y-8 md:space-y-12 overflow-y-auto flex-grow custom-scrollbar">
                    <div className="animate-fade-in">
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <span className="text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] opacity-60">标题</span>
                        <button onClick={() => copyToClipboard(result.title)} className="text-[10px] md:text-[11px] text-brand-gold font-bold hover:underline">复制标题</button>
                      </div>
                      <div className="p-4 md:p-6 bg-brand-light-gray/30 rounded-xl md:rounded-2xl border border-brand-border/5 text-base md:text-lg font-bold text-brand-dark tracking-tight leading-relaxed">
                        {result.title}
                      </div>
                    </div>

                    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <span className="text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] opacity-60">摘要</span>
                        <button onClick={() => copyToClipboard(result.summary)} className="text-[10px] md:text-[11px] text-brand-gold font-bold hover:underline">复制摘要</button>
                      </div>
                      <div className="p-4 md:p-6 bg-brand-light-gray/30 rounded-xl md:rounded-2xl border border-brand-border/5 text-xs md:text-sm text-brand-gray leading-relaxed italic font-medium">
                        {result.summary}
                      </div>
                    </div>

                    <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <span className="text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] opacity-60">正文</span>
                        <button onClick={() => copyToClipboard(result.body)} className="text-[10px] md:text-[11px] text-brand-gold font-bold hover:underline">复制正文</button>
                      </div>
                      <div className="p-6 md:p-8 bg-brand-light-gray/30 rounded-[1.5rem] md:rounded-[2rem] border border-brand-border/5 text-sm md:text-[15px] text-brand-dark leading-relaxed whitespace-pre-wrap font-serif">
                        {result.body}
                      </div>
                    </div>

                    <div className="pt-8 md:pt-10 border-t border-brand-border/10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                      <span className="text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] mb-4 md:mb-6 block opacity-60">建议附件清单</span>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {CONFIG.docExt.attachments.map(a => (
                          <span key={a} className="px-4 md:px-5 py-1.5 md:py-2 bg-brand-light-gray text-brand-gray text-[10px] md:text-[11px] font-bold rounded-full border border-brand-border/10">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] border-2 border-dashed border-brand-border/20 h-full min-h-[400px] md:min-h-[600px] flex flex-col items-center justify-center text-center p-8 md:p-16 sticky top-24">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-brand-light-gray rounded-full flex items-center justify-center text-brand-gray opacity-20 mb-6 md:mb-8">
                    <FileText className="w-8 h-8 md:w-12 md:h-12" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif text-brand-dark mb-3 md:mb-4 tracking-tight">等待生成文案</h3>
                  <p className="text-xs md:text-sm text-brand-gray font-medium opacity-60 max-w-xs leading-relaxed">
                    请在左侧填写业务信息并点击“立即生成”按钮，系统将自动为您构建规范的报批文本。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </AppLayout>
  );
};

export default RateOfferTool;
