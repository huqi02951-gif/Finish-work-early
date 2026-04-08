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
    <div className="py-24 bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-3 text-brand-gray hover:text-brand-dark transition-all mb-16 group font-bold text-sm uppercase tracking-widest opacity-60 hover:opacity-100"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 返回上一页
        </button>

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 animate-fade-in-up">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-brand-dark text-white rounded-2xl flex items-center justify-center shadow-xl">
                <Package size={32} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-serif text-brand-dark tracking-tight">项下开票本地下载工具包</h1>
                <p className="text-lg text-brand-gray font-medium opacity-60 mt-2">集成 Python 脚本与标准化模板，支持大批量开票一键生成</p>
              </div>
            </div>
            <button 
              onClick={handleDownloadPackage}
              className="px-8 py-4 bg-brand-gold text-brand-dark rounded-2xl font-bold text-sm hover:bg-brand-gold/90 transition-all shadow-xl flex items-center gap-3 active:scale-95"
            >
              <Download size={20} /> 下载本地工具包
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in-up">
            {/* Main Form */}
            <div className="lg:col-span-8 space-y-10">
              <div className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <h2 className="text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-10 opacity-60 flex items-center gap-3">
                  <FileText size={16} className="text-brand-gold" /> 基础开票信息
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">开票主体名称</label>
                    <input 
                      type="text" 
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">账号</label>
                    <input 
                      type="text" 
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">合同编号</label>
                    <input 
                      type="text" 
                      name="contractNumber"
                      value={formData.contractNumber}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">开票日期</label>
                    <input 
                      type="date" 
                      name="billingDate"
                      value={formData.billingDate}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">总金额</label>
                    <input 
                      type="text" 
                      name="totalAmount"
                      value={formData.totalAmount}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3 opacity-60">存单/保证金信息</label>
                    <input 
                      type="text" 
                      name="cdInfo"
                      value={formData.cdInfo}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-brand-dark"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] opacity-60 flex items-center gap-3">
                    <Plus size={16} className="text-brand-gold" /> 收款人明细 (多笔)
                  </h2>
                  <button 
                    onClick={addItem}
                    className="flex items-center gap-2 text-brand-gold hover:text-brand-dark transition-colors font-bold text-xs uppercase tracking-widest"
                  >
                    <Plus size={14} /> 添加收款人
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-brand-light-gray/30 rounded-2xl border border-brand-border/5 group transition-all hover:bg-brand-light-gray/50">
                      <div className="md:col-span-1 flex items-center justify-center text-[10px] font-bold text-brand-gray opacity-40">
                        {index + 1}
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-2 opacity-50">收款人全称</label>
                        <input 
                          type="text" 
                          value={item.payee}
                          onChange={(e) => updateItem(item.id, 'payee', e.target.value)}
                          placeholder="请输入收款人名称"
                          className="w-full px-4 py-2 bg-white border border-brand-border/5 rounded-xl focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm font-medium"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-2 opacity-50">金额</label>
                        <input 
                          type="text" 
                          value={item.amount}
                          onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-2 bg-white border border-brand-border/5 rounded-xl focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm font-medium"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-2 opacity-50">日期</label>
                        <input 
                          type="date" 
                          value={item.date}
                          onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-brand-border/5 rounded-xl focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm font-medium"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-center justify-center">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-brand-gray hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-10">
              <div className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                <h2 className="text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-10 opacity-60 flex items-center gap-3">
                  <Info size={16} className="text-brand-gold" /> 工具包说明
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-brand-light-gray rounded-xl flex items-center justify-center shrink-0">
                      <FileCode size={20} className="text-brand-dark" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark mb-1">Python 自动化脚本</p>
                      <p className="text-[10px] text-brand-gray leading-relaxed">基于 docxtpl 引擎，自动读取数据并填充至 Word 模板占位符中。</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-brand-light-gray rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-brand-dark" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark mb-1">标准化 Word 模板</p>
                      <p className="text-[10px] text-brand-gray leading-relaxed">已预设行内标准格式，包含所有必要字段的占位符（如：{"{{company_name}}"}）。</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 p-6 bg-brand-light-gray/30 rounded-2xl border border-brand-border/5">
                  <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-4 opacity-60">使用步骤</p>
                  <ul className="space-y-3">
                    {[
                      '下载并解压本地工具包',
                      '在网页端填写客户开票信息',
                      '点击“生成”或使用本地脚本',
                      '检查生成的 .docx 文件并打印'
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-[11px] text-brand-dark font-medium">
                        <span className="w-4 h-4 bg-brand-dark text-white rounded-full flex items-center justify-center text-[8px] shrink-0 mt-0.5">{i+1}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-brand-dark p-10 rounded-[2.5rem] shadow-2xl text-white">
                <h2 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-brand-gold" /> 快速生成
                </h2>
                <p className="text-sm text-white/70 mb-10 leading-relaxed font-medium">
                  填写完左侧信息后，点击下方按钮尝试在线生成（或使用本地工具包进行更复杂的批量处理）。
                </p>
                <button 
                  onClick={handleGenerate}
                  className="w-full py-5 bg-brand-gold text-brand-dark rounded-2xl font-bold text-sm hover:bg-brand-gold/90 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                >
                  <FileText size={20} /> 一键生成开票文档
                </button>
              </div>

              <button 
                onClick={() => navigate(-1)}
                className="w-full py-4 bg-white text-brand-gray border border-brand-border/10 rounded-2xl font-bold text-xs hover:bg-brand-light-gray transition-all flex items-center justify-center gap-2"
              >
                返回中后台模块 <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchBillingTool;
