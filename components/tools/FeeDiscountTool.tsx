import React, { useState } from 'react';
import { FileSpreadsheet, Trash2, Download, Copy, CheckCircle2, Plus, X, FileText, Sparkles, ArrowLeft, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { cn } from '../../lib/utils';

const CATALOG: Record<string, any> = {
  "对公汇兑汇划费（免费）": { "业务种类": "对公汇兑汇划费", "原执行标准": "20万以下免费，20万以上每笔5元。", "具体优惠明细": "免费", "涉外": false, "默认分行": "厦门分行", "默认勾选": true, "简称": "转账手续费" },
  "企业网上银行电子汇兑交易费（免费）": { "业务种类": "企业网上银行电子汇兑交易费", "原执行标准": "跨行资金按柜面资金收费八折收取等", "具体优惠明细": "免费", "涉外": false, "默认分行": "厦门分行", "默认勾选": true, "简称": "网银电子汇兑交易费" },
  "企业网上银行电子汇兑交易费（5折）": { "业务种类": "企业网上银行电子汇兑交易费", "原执行标准": "跨行资金按柜面资金收费八折收取等", "具体优惠明细": "5折", "涉外": false, "默认分行": "厦门分行", "默认勾选": false, "简称": "网银电子汇兑交易费" },
  "账户管理费（免费）": { "业务种类": "账户管理费", "原执行标准": "按我行对外公布标准执行。", "具体优惠明细": "免费", "涉外": false, "默认分行": "厦门分行", "默认勾选": true, "简称": "账户管理费" },
  "网上银行账户年服务费（免费）": { "业务种类": "网上银行账户年服务费", "原执行标准": "10元/年", "具体优惠明细": "免费", "涉外": false, "默认分行": "厦门分行", "默认勾选": true, "简称": "网银账户年服务费" },
  "企业网上银行USB-KEY工本费（免费）": { "业务种类": "企业网上银行USB-KEY工本费", "原执行标准": "34元/个", "具体优惠明细": "免费", "涉外": false, "默认分行": "厦门分行", "默认勾选": false, "简称": "USB-KEY工本费" },
  "企业网上银行证书挂失费（免费）": { "业务种类": "企业网上银行证书挂失费", "原执行标准": "10元/笔", "具体优惠明细": "免费", "涉外": false, "默认分行": "厦门分行", "默认勾选": false, "简称": "证书挂失费" },
  "企业网上银行密码挂失费（免费）": { "业务种类": "企业网上银行密码挂失费", "原执行标准": "5元/笔", "具体优惠明细": "免费", "涉外": false, "默认分行": "厦门分行", "默认勾选": false, "简称": "密码挂失费" },
  "数字证书年服务费（免费）": { "业务种类": "数字证书年服务费", "原执行标准": "160元/年/张", "具体优惠明细": "免费", "涉外": false, "默认分行": "厦门分行", "默认勾选": false, "简称": "数字证书年服务费" },
  "单位存款证明（免费）": { "业务种类": "单位存款证明", "原执行标准": "100元/张", "具体优惠明细": "免费", "涉外": false, "默认分行": "厦门分行", "默认勾选": false, "简称": "单位存款证明" },
  "银行询证函、资信证明（免费）": { "业务种类": "银行询证函、资信证明", "原执行标准": "手续费200元/笔", "具体优惠明细": "免费", "涉外": false, "默认分行": "厦门分行", "默认勾选": false, "简称": "询证函/资信证明" },
  "银企直联年服务费（免费）": { "业务种类": "银企直联年服务费", "原执行标准": "10000元/年/户", "具体优惠明细": "免费", "涉外": false, "默认分行": "厦门分行", "默认勾选": false, "简称": "银企直联年服务费" },
  "现金支票、转账支票、结算业务申请书（免费）": { "业务种类": "现金支票、转账支票、结算业务申请书", "原执行标准": "每本/各25元", "具体优惠明细": "免费", "涉外": false, "默认分行": "厦门分行", "默认勾选": false, "简称": "结算凭证工本费" },
  "国际结算（免收）": { "业务种类": "国际结算", "原执行标准": "汇款（不含“两岸通”速汇）按转汇金额1‰收取，最低50元，最高1000元；电报费每笔90。“两岸通”速汇手续费50元/笔，电报费50元/笔。", "具体优惠明细": "免收", "涉外": true, "默认分行": "厦门业管总部", "默认勾选": false, "简称": "国际结算手续费" },
  "进口信用证（优惠）": { "业务种类": "进口信用证", "原执行标准": "开证手续费1.5‰；承兑费0.75‰/月。", "具体优惠明细": "国际信用证，给予即远期信用证按次收取开证手续费不低于0.05%，远期证按次收取承兑费不低于0.03%（改证增额部分同开证优惠）。", "涉外": true, "默认分行": "厦门业管总部", "默认勾选": false, "简称": "进口信用证手续费" },
  "国内证（优惠）": { "业务种类": "国内证", "原执行标准": "开证手续费1.5‰；承兑费0.75‰/月。", "具体优惠明细": "不低于开证手续费1‰。", "涉外": false, "默认分行": "厦门业管总部", "默认勾选": false, "简称": "国内证手续费" },
};

const FeeDiscountTool: React.FC = () => {
  const navigate = useNavigate();
  const [globalInfo, setGlobalInfo] = useState({
    dept: '科技业务部',
    contact: '13666069043',
  });

  const [companies, setCompanies] = useState<any[]>([
    {
      id: Date.now(),
      name: '',
      date: new Date().toISOString().split('T')[0],
      eva: '',
      tags: '',
      branch: '',
      reasonExtra: '',
      selectedItems: Object.keys(CATALOG).filter(k => CATALOG[k].默认勾选),
    }
  ]);

  const [results, setResults] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addCompany = () => {
    setCompanies(prev => [
      ...prev,
      {
        id: Date.now(),
        name: '',
        date: new Date().toISOString().split('T')[0],
        eva: '',
        tags: '',
        branch: '',
        reasonExtra: '',
        selectedItems: Object.keys(CATALOG).filter(k => CATALOG[k].默认勾选),
      }
    ]);
  };

  const removeCompany = (id: number) => {
    if (companies.length <= 1) return;
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  const handleCompanyChange = (id: number, field: string, value: any) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const toggleItem = (companyId: number, itemKey: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        const selectedItems = c.selectedItems.includes(itemKey)
          ? c.selectedItems.filter((k: string) => k !== itemKey)
          : [...c.selectedItems, itemKey];
        return { ...c, selectedItems };
      }
      return c;
    }));
  };

  const generate = () => {
    const validCompanies = companies.filter(c => c.name && c.eva);
    if (validCompanies.length === 0) {
      alert('请至少填写一家企业的名称和EVA');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const newResults = companies.map(company => {
        if (!company.name || !company.eva) {
          return null;
        }

        const items = company.selectedItems.map((k: string) => CATALOG[k]);
        const itemNames = items.map((x: any) => x.简称).join('、');
        const tagClause = company.tags ? `${company.tags}，` : "";
        
        let evaClause = "最新EVA情况详见附件";
        if (company.eva.trim()) {
          const evaNum = parseFloat(company.eva.replace(/,/g, ""));
          if (!isNaN(evaNum)) {
            evaClause = evaNum >= 0 ? `最新EVA为${company.eva}万元` : "最新EVA暂未转正";
          }
        }

        const extra = company.reasonExtra.trim();
        const tail = extra ? `；${extra}` : "";
        const reason = `${tagClause}非我行关联方，${evaClause}。为维护良好的银企关系，提升客户在我行账户留存、结算沉淀及电子渠道活跃度，参考同业优惠情况并结合客户当前合作基础，现申请对其${itemNames}等账户业务费用予以优惠。后续将持续推动客户增加在我行日常结算、跨行转账、国际业务（如适用）等业务量，并按制度要求做好优惠后检视与持续跟踪${tail}。`;

        const foreign = items.some((x: any) => x.涉外);
        const scope = foreign ? "，涉及部分国际业务相关收费" : "";
        const attachName = `分行中收优惠申请表-${new Date(company.date).getFullYear()}年度（${company.name}）.xlsx`;
        
        const applyMatter = `本次申请减免的客户为${company.name}。本次申请减免的项目主要包括${itemNames}${scope}。客户为${company.tags || "存量客户"}，非我行关联方，最新EVA情况详见附件。详细优惠项目请见附件《${attachName}》。优惠有效期至${new Date(new Date(company.date).setFullYear(new Date(company.date).getFullYear() + 1)).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}。`;

        const itemsText = items.map((x: any, i: number) => `${i + 1}. ${x.业务种类}：原执行标准为“${x.原执行标准}”，本次申请优惠为“${x.具体优惠明细}”。`).join('\n');
        
        const oaText = `标题：${globalInfo.dept}-${company.name}${new Date(company.date).getFullYear()}年度账户业务费用减免申请\n\n申请事项（明细申请理由栏）\n${applyMatter}\n\n建议处理意见\n非我行关联方，${evaClause}，按照厦门银行交易〔2023〕13号《关于印发〈厦门银行股份有限公司交易银行部对公中间业务收入优惠及关联定价审批操作规程（2023年修订）〉的通知》要求，建议同意。分行公司业务分管行领导权限，请领导审批！\n\n附件名称\n${attachName}\n\n附件内申请理由\n${reason}\n\n附件内优惠项目明细\n${itemsText}`;

        const clientText = `您好，贵司本次账户业务费用优惠申请我这边会继续尽力帮您向上沟通争取，本次拟申请的项目主要包括${itemNames}。为便于我行后续报批及持续维护，也想请贵司后续尽量将日常结算、资金归集、跨行转账及相关电子渠道业务更多留存在我行办理，${foreign ? "如后续有国际结算、信用证等业务，也请优先通过我行办理。" : ""}按我行现行管理要求，相关费用优惠获批后，后续也会结合账户留存、交易活跃度及综合贡献情况进行定期检视；如果贵司后续在我行走账、留存和业务合作进一步提升，我们这边后续也更方便继续为贵司争取相关支持。`;

        return {
          companyId: company.id,
          companyName: company.name,
          oaText,
          clientText,
          attachName,
          items,
          reason,
          branch: company.branch || (foreign ? "厦门业管总部" : "厦门分行"),
          date: company.date
        };
      }).filter(r => r !== null);

      setResults(newResults);
      setIsGenerating(false);
    }, 800);
  };

  const downloadExcel = (result: any) => {
    const headers = ["分行", "客户名称", "优惠业务种类", "原执行标准", "具体优惠明细", "批准日期", "到期日期", "检视日期", "申请理由"];
    const data = result.items.map((item: any, idx: number) => [
      idx === 0 ? result.branch : "",
      idx === 0 ? result.companyName : "",
      item.业务种类,
      item.原执行标准,
      item.具体优惠明细,
      idx === 0 ? result.date : "",
      idx === 0 ? new Date(new Date(result.date).setFullYear(new Date(result.date).getFullYear() + 1)).toISOString().split('T')[0] : "",
      idx === 0 ? new Date(new Date(result.date).setFullYear(new Date(result.date).getFullYear() + 1)).toISOString().split('T')[0] : "",
      idx === 0 ? result.reason : ""
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 30 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 40 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "优惠明细");
    XLSX.writeFile(wb, result.attachName);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const loadExample = () => {
    setCompanies([
      {
        id: Date.now(),
        name: '厦门某高新科技有限公司',
        date: new Date().toISOString().split('T')[0],
        eva: '12.5',
        tags: '国家级高新技术企业',
        branch: '厦门分行',
        reasonExtra: '客户近期有大额资金回笼计划。',
        selectedItems: ["对公汇兑汇划费（免费）", "企业网上银行电子汇兑交易费（免费）", "账户管理费（免费）", "网上银行账户年服务费（免费）"],
      }
    ]);
  };

  return (
    <div className="py-24 bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-3 text-brand-gray hover:text-brand-dark transition-all mb-16 group font-bold text-sm uppercase tracking-widest opacity-60 hover:opacity-100"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 返回上一页
        </button>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 animate-fade-in-up">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold shadow-sm border border-brand-gold/20">
                <FileSpreadsheet size={32} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-serif text-brand-dark tracking-tight">中收优惠生成器</h1>
                <p className="text-lg text-brand-gray font-medium opacity-60 mt-2">批量生成账户业务费用减免申请及OA附件</p>
              </div>
            </div>
            <button 
              onClick={loadExample}
              className="px-6 py-3 bg-white text-brand-dark border border-brand-border/10 rounded-xl font-bold text-sm hover:bg-brand-light-gray transition-all shadow-sm flex items-center gap-2"
            >
              <RefreshCcw size={16} /> 加载示例数据
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Input Section */}
            <div className="lg:col-span-6 space-y-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <h2 className="text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-10 opacity-60 flex items-center gap-3">
                  <Sparkles size={16} className="text-brand-gold" /> 全局信息
                </h2>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">申请机构</label>
                    <input 
                      type="text" 
                      value={globalInfo.dept}
                      onChange={(e) => setGlobalInfo(prev => ({ ...prev, dept: e.target.value }))}
                      className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">联系方式</label>
                    <input 
                      type="text" 
                      value={globalInfo.contact}
                      onChange={(e) => setGlobalInfo(prev => ({ ...prev, contact: e.target.value }))}
                      className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {companies.map((company, index) => (
                  <div key={company.id} className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm relative group animate-fade-in">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-xl font-serif text-brand-dark">企业 {index + 1}</h3>
                      {companies.length > 1 && (
                        <button onClick={() => removeCompany(company.id)} className="w-10 h-10 flex items-center justify-center text-brand-gray/40 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                          <X size={20} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-8">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">客户名称 *</label>
                        <input 
                          type="text" 
                          value={company.name}
                          onChange={(e) => handleCompanyChange(company.id, 'name', e.target.value)}
                          placeholder="请输入企业名称"
                          className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">申请日期</label>
                          <input 
                            type="date" 
                            value={company.date}
                            onChange={(e) => handleCompanyChange(company.id, 'date', e.target.value)}
                            className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">EVA (万元) *</label>
                          <input 
                            type="text" 
                            value={company.eva}
                            onChange={(e) => handleCompanyChange(company.id, 'eva', e.target.value)}
                            placeholder="如：10.5"
                            className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">客户标签</label>
                          <input 
                            type="text" 
                            value={company.tags}
                            onChange={(e) => handleCompanyChange(company.id, 'tags', e.target.value)}
                            placeholder="如：高新技术企业"
                            className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">分行</label>
                          <select 
                            value={company.branch}
                            onChange={(e) => handleCompanyChange(company.id, 'branch', e.target.value)}
                            className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark appearance-none"
                          >
                            <option value="">自动判断</option>
                            <option value="厦门分行">厦门分行</option>
                            <option value="厦门业管总部">厦门业管总部</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">补充说明</label>
                        <input 
                          type="text" 
                          value={company.reasonExtra}
                          onChange={(e) => handleCompanyChange(company.id, 'reasonExtra', e.target.value)}
                          placeholder="将加入申请理由末尾"
                          className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark"
                        />
                      </div>
                    </div>

                    <div className="mt-10">
                      <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-5 opacity-60">申请项目</label>
                      <div className="grid grid-cols-1 gap-3">
                        {Object.keys(CATALOG).map(key => (
                          <label key={key} className="flex items-center gap-4 p-4 bg-brand-light-gray/30 border border-brand-border/5 rounded-2xl cursor-pointer hover:bg-brand-light-gray/50 transition-all group/item">
                            <input 
                              type="checkbox" 
                              checked={company.selectedItems.includes(key)}
                              onChange={() => toggleItem(company.id, key)}
                              className="w-5 h-5 text-brand-gold border-brand-border/20 rounded-lg focus:ring-brand-gold/20 transition-all"
                            />
                            <span className="text-sm text-brand-dark font-medium group-hover/item:text-brand-gold transition-colors">{key}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addCompany}
                  className="w-full py-6 border-2 border-dashed border-brand-border/20 rounded-[2.5rem] text-brand-gray font-bold hover:border-brand-gold hover:text-brand-gold hover:bg-brand-gold/5 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <Plus size={20} /> 新增企业
                </button>
              </div>

              <div className="flex gap-6">
                <button 
                  onClick={generate}
                  disabled={isGenerating}
                  className={cn(
                    "flex-grow py-5 bg-brand-dark text-white rounded-2xl font-bold text-lg transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95",
                    isGenerating ? "opacity-70 cursor-not-allowed" : "hover:bg-brand-dark/90"
                  )}
                >
                  {isGenerating ? (
                    <RefreshCcw size={20} className="animate-spin" />
                  ) : (
                    <Sparkles size={20} />
                  )}
                  {isGenerating ? '正在生成方案...' : '一键生成 OA 附件/文案'}
                </button>
                <button 
                  onClick={() => {
                    setCompanies([{
                      id: Date.now(),
                      name: '',
                      date: new Date().toISOString().split('T')[0],
                      eva: '',
                      tags: '',
                      branch: '',
                      reasonExtra: '',
                      selectedItems: Object.keys(CATALOG).filter(k => CATALOG[k].默认勾选),
                    }]);
                    setResults([]);
                  }}
                  className="p-5 bg-brand-light-gray text-brand-gray rounded-2xl font-bold hover:bg-brand-border/10 transition-all active:scale-95"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>

            {/* Result Section */}
            <div className="lg:col-span-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {results.length > 0 ? (
                <div className="space-y-10 sticky top-24 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar pr-2">
                  {results.map((res, idx) => (
                    <div key={res.companyId} className="bg-white rounded-[3rem] border border-brand-border/10 shadow-2xl overflow-hidden animate-fade-in">
                      <div className="bg-brand-light-gray/50 px-10 py-8 border-b border-brand-border/5 flex items-center justify-between">
                        <h3 className="font-serif text-2xl text-brand-dark flex items-center gap-3">
                          <CheckCircle2 size={24} className="text-emerald-500" /> {res.companyName}
                        </h3>
                        <button 
                          onClick={() => downloadExcel(res)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-brand-dark text-xs font-bold rounded-xl hover:bg-brand-gold/90 transition-all shadow-sm active:scale-95"
                        >
                          <Download size={16} /> 下载 Excel 附件
                        </button>
                      </div>
                      
                      <div className="p-10 space-y-10">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] opacity-60">OA 申请文案</span>
                            <button onClick={() => copyToClipboard(res.oaText)} className="text-[11px] text-brand-gold font-bold hover:underline">复制文案</button>
                          </div>
                          <div className="p-8 bg-brand-light-gray/30 rounded-[2rem] border border-brand-border/5 text-[14px] text-brand-dark leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto font-mono custom-scrollbar">
                            {res.oaText}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] opacity-60">对客沟通话术</span>
                            <button onClick={() => copyToClipboard(res.clientText)} className="text-[11px] text-brand-gold font-bold hover:underline">复制话术</button>
                          </div>
                          <div className="p-8 bg-brand-light-gray/30 rounded-[2rem] border border-brand-border/5 text-[15px] text-brand-dark leading-relaxed italic font-serif">
                            {res.clientText}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] border-2 border-dashed border-brand-border/20 h-full min-h-[600px] flex flex-col items-center justify-center text-center p-16 sticky top-24">
                  <div className="w-24 h-24 bg-brand-light-gray rounded-full flex items-center justify-center text-brand-gray opacity-20 mb-8">
                    <FileSpreadsheet size={48} />
                  </div>
                  <h3 className="text-2xl font-serif text-brand-dark mb-4 tracking-tight">等待生成</h3>
                  <p className="text-brand-gray font-medium opacity-60 max-w-xs leading-relaxed">
                    请在左侧填写企业信息并勾选申请项目，系统将自动为您生成 OA 申请文本及标准 Excel 附件。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeDiscountTool;
