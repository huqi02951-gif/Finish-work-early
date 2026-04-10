import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Package, 
  ChevronRight, 
  CheckCircle2, 
  Info,
  AlertCircle,
  Plus,
  Trash2,
  FileCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import AppLayout from '../../src/components/layout/AppLayout';

interface BillingItem {
  id: string;
  payee: string;
  amount: string;
  date: string;
}

const BatchBillingTool: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '厦门某某贸易有限公司',
    accountNumber: '1290 8888 9999 0000',
    contractNumber: 'XM-2024-001',
    billingDate: new Date().toISOString().split('T')[0],
    totalAmount: '1,000,000.00',
    cdInfo: '存单号：CD998822',
  });

  const [items, setItems] = useState<BillingItem[]>([
    { id: '1', payee: '供应商A', amount: '500,000.00', date: '2024-04-08' },
    { id: '2', payee: '供应商B', amount: '500,000.00', date: '2024-04-08' },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    const newItem: BillingItem = {
      id: Math.random().toString(36).substr(2, 9),
      payee: '',
      amount: '',
      date: formData.billingDate,
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof BillingItem, value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleDownloadPackage = () => {
    // Placeholder for actual package download
    alert('正在准备本地工具包下载...\n包含：\n1. batch_billing.py (Python 脚本)\n2. template_billing.docx (Word 模板)\n3. config.json (配置文件)');
  };

  const handleGenerate = () => {
    alert('正在根据填写信息生成文档...\n(此功能后续将集成 Python 脚本能力，目前为演示状态)');
  };

  return (
    <AppLayout title="项下开票工具包" showBack>
    <div className="py-4 md:py-8 bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-4 md:px-6">

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 mb-4 sm:mb-10 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-brand-dark text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl shrink-0">
                <Package className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-2xl font-serif text-brand-dark tracking-tight">项下开票本地工具包</h1>
                <p className="text-[11px] sm:text-sm text-brand-gray font-medium opacity-60 mt-0.5">集成Python脚本与模板，支持大批量开票一键生成</p>
              </div>
            </div>
            <button 
              onClick={handleDownloadPackage}
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-brand-gold text-brand-dark rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs hover:bg-brand-gold/90 transition-all shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" /> 下载工具包
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 animate-fade-in-up">
            {/* Main Form */}
            <div className="lg:col-span-8 space-y-8 md:space-y-10">
              <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 md:mb-10 opacity-60 flex items-center gap-3">
                  <FileText className="w-4 h-4 text-brand-gold" /> 基础开票信息
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">开票主体名称</label>
                    <input 
                      type="text" 
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">账号</label>
                    <input 
                      type="text" 
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">合同编号</label>
                    <input 
                      type="text" 
                      name="contractNumber"
                      value={formData.contractNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">开票日期</label>
                    <input 
                      type="date" 
                      name="billingDate"
                      value={formData.billingDate}
                      onChange={handleInputChange}
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">总金额</label>
                    <input 
                      type="text" 
                      name="totalAmount"
                      value={formData.totalAmount}
                      onChange={handleInputChange}
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">存单/保证金信息</label>
                    <input 
                      type="text" 
                      name="cdInfo"
                      value={formData.cdInfo}
                      onChange={handleInputChange}
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <div className="flex items-center justify-between mb-6 md:mb-10">
                  <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] opacity-60 flex items-center gap-3">
                    <Plus className="w-4 h-4 text-brand-gold" /> 收款人明细 (多笔)
                  </h2>
                  <button 
                    onClick={addItem}
                    className="flex items-center gap-2 text-brand-gold hover:text-brand-dark transition-colors font-bold text-[10px] md:text-xs uppercase tracking-widest"
                  >
                    <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" /> 添加收款人
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 md:p-6 bg-brand-light-gray/30 rounded-xl md:rounded-2xl border border-brand-border/5 group transition-all hover:bg-brand-light-gray/50">
                      <div className="hidden md:flex md:col-span-1 items-center justify-center text-[10px] font-bold text-brand-gray opacity-40">
                        {index + 1}
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-2 opacity-50">收款人全称</label>
                        <input 
                          type="text" 
                          value={item.payee}
                          onChange={(e) => updateItem(item.id, 'payee', e.target.value)}
                          placeholder="请输入收款人名称"
                          className="w-full px-4 py-2.5 bg-white border border-brand-border/5 rounded-lg md:rounded-xl focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm font-medium"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-2 opacity-50">金额</label>
                        <input 
                          type="text" 
                          value={item.amount}
                          onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-2.5 bg-white border border-brand-border/5 rounded-lg md:rounded-xl focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm font-medium"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-2 opacity-50">日期</label>
                        <input 
                          type="date" 
                          value={item.date}
                          onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-brand-border/5 rounded-lg md:rounded-xl focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm font-medium"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-center justify-end md:justify-center">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-brand-gray hover:text-red-500 transition-colors md:opacity-0 md:group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8 md:space-y-10">
              <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 md:mb-10 opacity-60 flex items-center gap-3">
                  <Info className="w-4 h-4 text-brand-gold" /> 工具包说明
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-brand-light-gray rounded-xl flex items-center justify-center shrink-0">
                      <FileCode className="w-5 h-5 text-brand-dark" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark mb-1">Python 自动化脚本</p>
                      <p className="text-[10px] text-brand-gray leading-relaxed">基于 docxtpl 引擎，自动读取数据并填充至 Word 模板占位符中。</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-brand-light-gray rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-brand-dark" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark mb-1">标准化 Word 模板</p>
                      <p className="text-[10px] text-brand-gray leading-relaxed">已预设行内标准格式，包含所有必要字段的占位符（如：{"{{company_name}}"}）。</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 md:mt-10 p-5 md:p-6 bg-brand-light-gray/30 rounded-xl md:rounded-2xl border border-brand-border/5">
                  <p className="text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-4 opacity-60">使用步骤</p>
                  <ul className="space-y-3">
                    {[
                      '下载并解压本地工具包',
                      '在网页端填写客户开票信息',
                      '点击“生成”或使用本地脚本',
                      '检查生成的 .docx 文件并打印'
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-[10px] md:text-[11px] text-brand-dark font-medium">
                        <span className="w-4 h-4 bg-brand-dark text-white rounded-full flex items-center justify-center text-[8px] shrink-0 mt-0.5">{i+1}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-brand-dark p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl text-white">
                <h2 className="text-[10px] md:text-[11px] font-bold text-white/40 uppercase tracking-[0.3em] mb-6 md:mb-8 flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold" /> 快速生成
                </h2>
                <p className="text-xs md:text-sm text-white/70 mb-8 md:mb-10 leading-relaxed font-medium">
                  填写完左侧信息后，点击下方按钮尝试在线生成（或使用本地工具包进行更复杂的批量处理）。
                </p>
                <button 
                  onClick={handleGenerate}
                  className="w-full py-4 md:py-5 bg-brand-gold text-brand-dark rounded-xl md:rounded-2xl font-bold text-xs md:text-sm hover:bg-brand-gold/90 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                >
                  <FileText className="w-5 h-5" /> 一键生成开票文档
                </button>
              </div>

              <button 
                onClick={() => navigate(-1)}
                className="w-full py-3.5 md:py-4 bg-white text-brand-gray border border-brand-border/10 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs hover:bg-brand-light-gray transition-all flex items-center justify-center gap-2"
              >
                返回中后台模块 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AppLayout>
  );
};

export default BatchBillingTool;
