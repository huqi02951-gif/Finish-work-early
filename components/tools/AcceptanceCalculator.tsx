import React, { useState, useEffect } from 'react';
import { Calculator, Trash2, Copy, CheckCircle2, Info, ArrowRight, FileText, Sparkles, ArrowLeft, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import AppLayout from '../../src/components/layout/AppLayout';
import { ActionBar } from '../shared/ActionBar';
import { buildAcceptanceDocx } from '../../lib/exportDocx';

const AcceptanceCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    corp: '',
    billAmt: '',
    depositBudget: '',
    rate: '0.014',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    days: 0,
    discountStatus: '否',
    invoiceCount: '',
    invoiceTarget: '',
    needInvoice: '否',
  });

  const [calcState, setCalcState] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const start = new Date(formData.startDate);
    const end = new Date(start.getTime());
    end.setMonth(end.getMonth() + 6);
    const endDateStr = end.toISOString().split('T')[0];
    const diff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    setFormData(prev => ({ ...prev, endDate: endDateStr, days: diff }));
  }, [formData.startDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fmt = (num: number) => {
    if (num === null || num === undefined || Number.isNaN(num)) return '';
    return Number(num).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const fmtWanValue = (num: number, digits = 2) => {
    if (num === null || num === undefined || Number.isNaN(num)) return '';
    return (num / 10000).toFixed(digits);
  };

  const fmtPercent = (rate: number) => {
    if (rate === null || rate === undefined || Number.isNaN(rate)) return '—';
    return `${(rate * 100).toFixed(2)}%`;
  };

  const toChineseUpper = (amount: number) => {
    if (amount === null || amount === undefined || Number.isNaN(amount)) return '';
    const n = Math.round(Math.abs(amount));
    if (n === 0) return '零元整';
    
    const CN_NUMS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const CN_UNITS = ['仟', '佰', '拾', ''];
    const CN_GROUPS = ['', '万', '亿', '兆'];

    const groupToCn = (value: number) => {
      let result = '';
      let zero = false;
      for (let i = 0; i < 4; i++) {
        const digit = Math.floor(value / Math.pow(10, 3 - i)) % 10;
        if (digit === 0) {
          zero = true;
        } else {
          if (zero && result) result += CN_NUMS[0];
          result += CN_NUMS[digit] + CN_UNITS[i];
          zero = false;
        }
      }
      return result.replace(/零+$/g, '') || CN_NUMS[0];
    };

    let value = n;
    let groupIndex = 0;
    const parts = [];
    while (value > 0) {
      const groupVal = value % 10000;
      if (groupVal !== 0) {
        parts.push(`${groupToCn(groupVal)}${CN_GROUPS[groupIndex]}`);
      }
      value = Math.floor(value / 10000);
      groupIndex += 1;
    }
    return parts.reverse().join('').replace(/零+/g, '零').replace(/零(万|亿|兆)/g, '$1').replace(/零$/g, '') + '元整';
  };

  const runCalc = () => {
    const billInputWan = parseFloat(formData.billAmt);
    const depositInputWan = parseFloat(formData.depositBudget);
    const billInput = !Number.isNaN(billInputWan) ? billInputWan * 10000 : NaN;
    const depositInput = !Number.isNaN(depositInputWan) ? depositInputWan * 10000 : NaN;
    const rateInput = parseFloat(formData.rate);
    const daysInput = formData.days;

    if (Number.isNaN(billInput) && Number.isNaN(depositInput)) {
      alert('请至少填写拟开票金额或拟存定期中的一项（单位：万元）');
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      const source = !Number.isNaN(billInput) ? 'bill' : 'deposit';
      let state: any = { source, rate: rateInput, days: daysInput, startDate: formData.startDate, endDate: formData.endDate };

      if (source === 'bill') {
        const base365 = billInput / (1 + rateInput * (daysInput / 365));
        const base360 = billInput / (1 + rateInput * (daysInput / 360));
        const roundedWan = Math.ceil(base365 / 10000);
        state = {
          ...state,
          depositRequirement365: base365,
          depositRequirement360: base360,
          maxBill365: billInput,
          maxBill360: billInput,
          roundedDepositWan: roundedWan,
          roundedDepositYuan: roundedWan * 10000,
        };
      } else {
        const bill365 = depositInput * (1 + rateInput * (daysInput / 365));
        const bill360 = depositInput * (1 + rateInput * (daysInput / 360));
        const roundedWan = Math.ceil(depositInput / 10000);
        state = {
          ...state,
          depositBudget: depositInput,
          maxBill365: bill365,
          maxBill360: bill360,
          roundedDepositWan: roundedWan,
          roundedDepositYuan: roundedWan * 10000,
        };
      }

      // Generate texts
      const corp = formData.corp || '客户';
      const rateText = fmtPercent(state.rate);
      const daysText = state.days;
      const billWanText = fmtWanValue(state.maxBill365);
      const billYuanText = fmt(state.maxBill365);
      const depositWanText = source === 'bill' ? state.roundedDepositWan : fmtWanValue(state.depositBudget);
      const depositYuanText = source === 'bill' ? fmt(state.roundedDepositYuan) : fmt(state.depositBudget);
      const depositAmountYuan = source === 'bill' ? state.roundedDepositYuan : state.depositBudget;
      const pledgeAmountYuan = state.maxBill365 * 1.5; // Example logic from prompt

      const internalMail = `各位领导上午好！
科技业务部客户${corp}拟于${state.startDate}向我行申请开立银承${billWanText}万元，拟购买我行定期存单${depositWanText}万元，期限约 ${daysText} 天，年利率 ${rateText}。请领导批示。`;

      const contractLine = `- 系统担保合同期限：${state.startDate} 至 ${state.endDate}；开票金额 ${billYuanText}（${toChineseUpper(state.maxBill365)}）；存单金额 ${depositYuanText}（${toChineseUpper(depositAmountYuan)}）；担保金额 ${fmt(pledgeAmountYuan)}（${toChineseUpper(pledgeAmountYuan)}）。`;

      const clientText = `您好！关于本次业务，初步测算的方案如下：
【票据信息】
- 拟开票金额：${billWanText} 万元；
- 定期存单：${depositWanText} 万元，利率 ${rateText}，期限约 ${daysText} 天。

麻烦您在群里同步下相关材料：
- 购销合同、发票、发票清单、进款截图${formData.discountStatus === '是' ? '（如1周内已贴现，请同步下贴现流水）' : ''}。

另外，有几个细节也请您帮忙确认下：
1）是否缺发票？缺口大概多少？是否涉及2-6个月的发票？（暂不接受超6个月的）；
2）预计进款及提票的时间；
3）开票张数：${formData.invoiceCount || '（请确认）'} 张；
4）收款方：${formData.invoiceTarget || '（请补充）'} 。

您先核对下，有疑问随时沟通哈。`;

      setCalcState({ ...state, internalMail, contractLine, clientText });
      setIsCalculating(false);
    }, 600);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const loadExample = () => {
    setFormData(prev => ({
      ...prev,
      corp: '厦门某进出口贸易有限公司',
      billAmt: '500',
      depositBudget: '',
      rate: '0.014',
      discountStatus: '否',
      invoiceCount: '2',
      invoiceTarget: '上海某科技有限公司',
      needInvoice: '否',
    }));
  };

  return (
    <AppLayout title="银承/存单测算" showBack>
    <div className="py-4 md:py-8 bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-4 md:px-6">

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 mb-4 sm:mb-10 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-brand-gold/10 rounded-lg sm:rounded-xl flex items-center justify-center text-brand-gold shadow-sm border border-brand-gold/20 shrink-0">
                <Calculator className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-2xl font-serif text-brand-dark tracking-tight">银承/存单测算小助手</h1>
                <p className="text-[11px] sm:text-sm text-brand-gray font-medium opacity-60 mt-0.5">票据金额测算、资料确认与文案输出</p>
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
            <div className="lg:col-span-6 space-y-3 sm:space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-brand-border/10 shadow-sm">
                <h2 className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] mb-3 sm:mb-6 opacity-60 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> 核心测算
                </h2>
                
                <div className="space-y-3 sm:space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-1.5 sm:mb-2 opacity-60">企业名称</label>
                    <input 
                      type="text" 
                      name="corp"
                      value={formData.corp}
                      onChange={handleInputChange}
                      placeholder="如：厦门**实业有限公司"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-brand-light-gray/50 border border-brand-border/5 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-[13px] sm:text-sm text-brand-dark"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">拟开票金额 (万元)</label>
                      <input 
                        type="number" 
                        name="billAmt"
                        value={formData.billAmt}
                        onChange={handleInputChange}
                        placeholder="如 500"
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">拟存定期 (万元)</label>
                      <input 
                        type="number" 
                        name="depositBudget"
                        value={formData.depositBudget}
                        onChange={handleInputChange}
                        placeholder="客户只报存款时填写"
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">年利率 (如 1.4% 填 0.014)</label>
                      <input 
                        type="number" 
                        name="rate"
                        step="0.0001"
                        value={formData.rate}
                        onChange={handleInputChange}
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">开票日期</label>
                      <input 
                        type="date" 
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 md:mb-10 opacity-60 flex items-center gap-3">
                  <FileText className="w-4 h-4 text-brand-gold" /> 材料与票据
                </h2>
                <div className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">一周内是否已贴现</label>
                      <select 
                        name="discountStatus"
                        value={formData.discountStatus}
                        onChange={handleInputChange}
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark appearance-none"
                      >
                        <option value="否">否</option>
                        <option value="是">是</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">开票张数</label>
                      <input 
                        type="number" 
                        name="invoiceCount"
                        value={formData.invoiceCount}
                        onChange={handleInputChange}
                        placeholder="如：2"
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">收款方 / 交易对手</label>
                    <input 
                      type="text" 
                      name="invoiceTarget"
                      value={formData.invoiceTarget}
                      onChange={handleInputChange}
                      placeholder="如：上海某科技有限公司"
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-12">
                  <button 
                    onClick={runCalc}
                    disabled={isCalculating}
                    className={cn(
                      "flex-grow py-4 md:py-5 bg-brand-dark text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95",
                      isCalculating ? "opacity-70 cursor-not-allowed" : "hover:bg-brand-dark/90"
                    )}
                  >
                    {isCalculating ? (
                      <RefreshCcw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Calculator className="w-5 h-5" />
                    )}
                    {isCalculating ? '正在计算方案...' : '立即开始测算'}
                  </button>
                  <button 
                    onClick={() => setFormData({
                      corp: '',
                      billAmt: '',
                      depositBudget: '',
                      rate: '0.014',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: '',
                      days: 0,
                      discountStatus: '否',
                      invoiceCount: '',
                      invoiceTarget: '',
                      needInvoice: '否',
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
              {calcState ? (
                <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] border border-brand-border/10 shadow-2xl overflow-hidden flex flex-col h-full sticky top-24">
                  <div className="bg-brand-light-gray/50 px-6 md:px-10 py-6 md:py-8 border-b border-brand-border/5 flex items-center justify-between">
                    <h3 className="font-serif text-xl md:text-2xl text-brand-dark flex items-center gap-2 md:gap-3">
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" /> 测算结果
                    </h3>
                    <ActionBar
                      copyText={calcState.internalMail + '\n\n' + calcState.contractLine + '\n\n' + calcState.clientText}
                      buildDocx={() => buildAcceptanceDocx(
                        formData.corp || '客户',
                        calcState.internalMail,
                        calcState.contractLine,
                        calcState.clientText
                      )}
                      docxFilename={`${formData.corp || '银承'}_测算方案_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.docx`}
                      toolId="acceptance-calc"
                      historyTitle={`${formData.corp || '客户'} - ${formData.billAmt || formData.depositBudget}万`}
                      historyContent={calcState.internalMail + '\n\n' + calcState.contractLine + '\n\n' + calcState.clientText}
                      historyMetadata={{ formData }}
                    />
                  </div>
                  
                  <div className="p-6 md:p-10 space-y-8 md:space-y-12 overflow-y-auto flex-grow custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 animate-fade-in">
                      <div className="p-6 md:p-8 bg-brand-gold/5 rounded-2xl md:rounded-[2rem] border border-brand-gold/10">
                        <span className="text-[9px] md:text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] block mb-2 md:mb-3 opacity-60">拟开票金额</span>
                        <span className="text-2xl md:text-4xl font-serif text-brand-dark tracking-tight">{fmtWanValue(calcState.maxBill365)} <span className="text-xs md:text-sm font-sans text-brand-gray font-bold opacity-40 ml-1">万元</span></span>
                      </div>
                      <div className="p-6 md:p-8 bg-brand-gold/5 rounded-2xl md:rounded-[2rem] border border-brand-gold/10">
                        <span className="text-[9px] md:text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] block mb-2 md:mb-3 opacity-60">建议存单金额</span>
                        <span className="text-2xl md:text-4xl font-serif text-brand-dark tracking-tight">{calcState.roundedDepositWan} <span className="text-xs md:text-sm font-sans text-brand-gray font-bold opacity-40 ml-1">万元</span></span>
                      </div>
                    </div>

                    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <span className="text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] opacity-60">内部邮件 / OA 模板</span>
                        <button onClick={() => copyToClipboard(calcState.internalMail + '\n' + calcState.contractLine)} className="text-[10px] md:text-[11px] text-brand-gold font-bold hover:underline">复制模板</button>
                      </div>
                      <div className="p-6 md:p-8 bg-brand-light-gray/30 rounded-xl md:rounded-[2rem] border border-brand-border/5 text-sm md:text-[15px] text-brand-dark leading-relaxed whitespace-pre-wrap font-serif">
                        {calcState.internalMail}
                        {'\n'}
                        {calcState.contractLine}
                      </div>
                    </div>

                    <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <span className="text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] opacity-60">客户沟通话术</span>
                        <button onClick={() => copyToClipboard(calcState.clientText)} className="text-[10px] md:text-[11px] text-brand-gold font-bold hover:underline">复制话术</button>
                      </div>
                      <div className="p-6 md:p-8 bg-brand-light-gray/30 rounded-xl md:rounded-[2rem] border border-brand-border/5 text-sm md:text-[15px] text-brand-dark leading-relaxed whitespace-pre-wrap font-serif">
                        {calcState.clientText}
                      </div>
                    </div>

                    <div className="p-6 md:p-8 bg-emerald-50 rounded-xl md:rounded-[2rem] border border-emerald-100 flex flex-col sm:flex-row gap-4 md:gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                        <Info className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="text-xs md:text-[13px] text-emerald-900 leading-relaxed">
                        <p className="font-bold text-sm mb-2 md:mb-3">测算技术说明</p>
                        <ul className="space-y-1.5 md:space-y-2 opacity-80 font-medium">
                          <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> 360天口径最低存单：{fmt(calcState.depositRequirement360)} 元</li>
                          <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> 365天口径最低存单：{fmt(calcState.depositRequirement365)} 元</li>
                          <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> 测算期限：{calcState.days} 天 ({calcState.startDate} 至 {calcState.endDate})</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] border-2 border-dashed border-brand-border/20 h-full min-h-[400px] md:min-h-[600px] flex flex-col items-center justify-center text-center p-8 md:p-16 sticky top-24">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-brand-light-gray rounded-full flex items-center justify-center text-brand-gray opacity-20 mb-6 md:mb-8">
                    <Calculator className="w-8 h-8 md:w-12 md:h-12" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif text-brand-dark mb-3 md:mb-4 tracking-tight">等待测算</h3>
                  <p className="text-xs md:text-sm text-brand-gray font-medium opacity-60 max-w-xs leading-relaxed">
                    请输入开票金额或存单金额，系统将自动为您计算最优方案并生成沟通话术。
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

export default AcceptanceCalculator;
