import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Copy, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { 
  COUNTER_BUSINESS, 
  CREDIT_BUSINESS, 
  BusinessCategory, 
  BusinessSubCategory,
  getDynamicDates
} from '../data/checklistData';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';

type Step = 'category' | 'business' | 'info' | 'preview';

interface CustomerInfo {
  customerName: string;
  managerName: string;
  phone: string;
  email: string;
  wechat: string;
  address: string;
  remark: string;
}

const MaterialChecklistCenter: React.FC = () => {
  const [step, setStep] = useState<Step>('category');
  const [mainType, setMainType] = useState<'counter' | 'credit' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<BusinessSubCategory | null>(null);
  const [info, setInfo] = useState<CustomerInfo & { specialRemark?: string }>({
    customerName: '',
    managerName: '',
    phone: '',
    email: '',
    wechat: '',
    address: '',
    remark: '',
    specialRemark: ''
  });

  const categories = mainType === 'counter' ? COUNTER_BUSINESS : CREDIT_BUSINESS;

  const handleReset = () => {
    setStep('category');
    setMainType(null);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setInfo({
      customerName: '',
      managerName: '',
      phone: '',
      email: '',
      wechat: '',
      address: '',
      remark: ''
    });
  };

  const handleBack = () => {
    if (step === 'business') setStep('category');
    else if (step === 'info') setStep('business');
    else if (step === 'preview') setStep('info');
  };

  const generatedScript = useMemo(() => {
    if (!selectedSubCategory) return '';
    return selectedSubCategory.scriptTemplate({
      customerName: info.customerName,
      managerName: info.managerName,
      phone: info.phone,
      wechat: info.wechat
    });
  }, [selectedSubCategory, info]);

  const checklistText = useMemo(() => {
    if (!selectedSubCategory) return '';
    return selectedSubCategory.checklist
      .map((item, idx) => `${idx + 1}. ${item.name} (${item.format}${item.note ? ' - ' + item.note : ''})`)
      .join('\n');
  }, [selectedSubCategory]);

  const managerRemindersText = useMemo(() => {
    if (!selectedSubCategory || !selectedSubCategory.managerReminders) return '';
    return selectedSubCategory.managerReminders
      .map((note, idx) => `· ${note}`)
      .join('\n');
  }, [selectedSubCategory]);

  const requiredInfoText = useMemo(() => {
    if (!selectedSubCategory || !selectedSubCategory.requiredInfo) return '';
    return selectedSubCategory.requiredInfo
      .map(section => {
        const items = section.items.map(item => {
          if (item.type === 'table') {
            const header = `| ${item.fields?.join(' | ')} |`;
            const separator = `| ${item.fields?.map(() => '---').join(' | ')} |`;
            const rows = Array(item.rows || 3).fill(0).map((_, i) => `| ${item.fields?.map(() => '      ').join(' | ')} |`).join('\n');
            return `${item.label}:\n${header}\n${separator}\n${rows}`;
          }
          return `${item.label}: ____________________`;
        }).join('\n\n');
        return `【${section.title}】\n${items}`;
      })
      .join('\n\n');
  }, [selectedSubCategory]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // Using a more subtle notification instead of alert if possible, but alert is fine for now as per instructions
    alert(`${label}已复制到剪贴板`);
  };

  const exportExcel = () => {
    if (!selectedSubCategory) return;
    
    const checklistData = [
      ['厦门银行材料清单 - 客户版'],
      [`客户名称: ${info.customerName || '未填写'}`],
      [`业务类型: ${selectedSubCategory.name}`],
      [`客户经理: ${info.managerName || '未填写'}`, `联系电话: ${info.phone || '未填写'}`],
      info.specialRemark ? [`特别说明: ${info.specialRemark}`] : [],
      [],
      ['序号', '材料名称', '格式要求', '备注说明'],
      ...selectedSubCategory.checklist.map((item, index) => [
        index + 1,
        item.name,
        item.format,
        item.note || ''
      ])
    ];

    const reminderData = [
      ['客户经理内部提醒 - 内部版'],
      [`业务类型: ${selectedSubCategory.name}`],
      [],
      ['序号', '提醒事项'],
      ...(selectedSubCategory.managerReminders || []).map((note, index) => [
        index + 1,
        note
      ])
    ];

    const requiredInfoData = [
      ['客户需补充填写的信息表'],
      [`客户名称: ${info.customerName || '未填写'}`],
      [`业务类型: ${selectedSubCategory.name}`],
      [],
      ... (selectedSubCategory.requiredInfo || []).flatMap(section => [
        [section.title],
        ...section.items.flatMap(item => {
          if (item.type === 'table') {
            return [
              [item.label],
              item.fields || [],
              ...Array(item.rows || 3).fill(0).map(() => item.fields?.map(() => '') || []),
              []
            ];
          }
          return [[item.label, '____________________'], []];
        })
      ])
    ];

    const wb = XLSX.utils.book_new();
    const wsChecklist = XLSX.utils.aoa_to_sheet(checklistData);
    const wsReminders = XLSX.utils.aoa_to_sheet(reminderData);
    const wsRequiredInfo = XLSX.utils.aoa_to_sheet(requiredInfoData);
    
    XLSX.utils.book_append_sheet(wb, wsChecklist, "材料清单");
    XLSX.utils.book_append_sheet(wb, wsRequiredInfo, "需填写信息");
    XLSX.utils.book_append_sheet(wb, wsReminders, "客户经理提醒");
    
    XLSX.writeFile(wb, `${info.customerName || '客户'}_${selectedSubCategory.name}_业务包.xlsx`);
  };

  const exportWord = async () => {
    if (!selectedSubCategory) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "厦门银行对公业务办理材料包", bold: true, size: 36 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          
          // Section 1: Customer Info
          new Paragraph({
            children: [new TextRun({ text: "一、 基础信息", bold: true, size: 28 })],
            spacing: { before: 200, after: 200 }
          }),
          new Paragraph({ children: [new TextRun({ text: `客户名称：${info.customerName || '未填写'}` })] }),
          new Paragraph({ children: [new TextRun({ text: `业务类型：${selectedSubCategory.name}` })] }),
          new Paragraph({ children: [new TextRun({ text: `客户经理：${info.managerName || '未填写'}    联系电话：${info.phone || '未填写'}` })] }),
          ...(info.specialRemark ? [new Paragraph({ children: [new TextRun({ text: `特别说明：${info.specialRemark}`, color: "B8860B", bold: true })] })] : []),
          
          // Section 2: Customer Script
          new Paragraph({
            children: [new TextRun({ text: "\n二、 对客沟通话术（微信/短信）", bold: true, size: 28 })],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: generatedScript, italics: true, color: "666666" })],
            spacing: { after: 200 }
          }),

          // Section 3: Checklist
          new Paragraph({
            children: [new TextRun({ text: "\n三、 材料清单明细", bold: true, size: 28 })],
            spacing: { before: 400, after: 200 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "序号", bold: true })] })] }),
                  new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "材料名称", bold: true })] })] }),
                  new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "格式要求/备注", bold: true })] })] }),
                ]
              }),
              ...selectedSubCategory.checklist.map((item, index) => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: (index + 1).toString() })] }),
                  new TableCell({ children: [new Paragraph({ text: item.name })] }),
                  new TableCell({ children: [new Paragraph({ text: `${item.format}${item.note ? ' (' + item.note + ')' : ''}` })] }),
                ]
              }))
            ]
          }),

          // Section 4: Required Info
          new Paragraph({
            children: [new TextRun({ text: "\n四、 客户需补充填写的信息表", bold: true, size: 28 })],
            spacing: { before: 400, after: 200 }
          }),
          ...(selectedSubCategory.requiredInfo || []).flatMap(section => [
            new Paragraph({
              children: [new TextRun({ text: section.title, bold: true, size: 24 })],
              spacing: { before: 200, after: 100 }
            }),
            ...section.items.flatMap(item => {
              if (item.type === 'table') {
                return [
                  new Paragraph({ children: [new TextRun({ text: item.label, bold: true })], spacing: { before: 100, after: 100 } }),
                  new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                      new TableRow({
                        children: (item.fields || []).map(f => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: f, bold: true, size: 20 })] })] }))
                      }),
                      ...Array(item.rows || 3).fill(0).map(() => new TableRow({
                        height: { value: 400, rule: "atLeast" },
                        children: (item.fields || []).map(() => new TableCell({ children: [new Paragraph({ text: "" })] }))
                      }))
                    ]
                  })
                ];
              }
              return [
                new Paragraph({
                  children: [
                    new TextRun({ text: `${item.label}: `, bold: true }),
                    new TextRun({ text: "________________________________________________" })
                  ],
                  spacing: { before: 100 }
                })
              ];
            })
          ]),

          // Section 5: Manager Reminders
          new Paragraph({
            children: [new TextRun({ text: "\n五、 客户经理内部提醒（不发客户）", bold: true, size: 28, color: "C00000" })],
            spacing: { before: 400, after: 200 }
          }),
          ...(selectedSubCategory.managerReminders || []).map(note => new Paragraph({
            children: [new TextRun({ text: `· ${note}`, color: "C00000" })],
            spacing: { before: 100 }
          }))
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${info.customerName || '客户'}_${selectedSubCategory.name}_办理指南.docx`);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-brand-border/10 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-8 border-b border-brand-border/10 bg-brand-light-gray/30 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-serif text-3xl text-brand-dark mb-2 tracking-tight">材料清单中心</h3>
            <p className="text-brand-gray text-sm font-medium opacity-60">快速生成对客业务材料清单与沟通话术</p>
          </div>
          <button 
            onClick={handleReset}
            className="p-3 text-brand-gray hover:text-brand-dark hover:bg-white rounded-2xl transition-all border border-transparent hover:border-brand-border/20"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center gap-4">
          {[
            { id: 'category', label: '选择大类' },
            { id: 'business', label: '选择业务' },
            { id: 'info', label: '填写信息' },
            { id: 'preview', label: '生成预览' }
          ].map((s, idx) => {
            const isActive = step === s.id;
            const isCompleted = ['category', 'business', 'info', 'preview'].indexOf(step) > idx;
            
            return (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    isActive ? "bg-brand-dark text-white shadow-lg scale-110" : 
                    isCompleted ? "bg-emerald-500 text-white" : "bg-brand-border/20 text-brand-gray"
                  )}>
                    {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span className={cn(
                    "text-xs font-bold tracking-widest uppercase",
                    isActive ? "text-brand-dark" : "text-brand-gray/40"
                  )}>{s.label}</span>
                </div>
                {idx < 3 && <div className="w-8 h-px bg-brand-border/20" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'category' && (
              <motion.div 
                key="step-category"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <button 
                  onClick={() => { setMainType('counter'); setStep('business'); }}
                  className="group p-10 rounded-[2.5rem] border-2 border-brand-border/10 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all text-left flex flex-col justify-between min-h-[300px]"
                >
                  <div>
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <Building2 size={32} />
                    </div>
                    <h4 className="font-serif text-2xl text-brand-dark mb-4">柜面业务类</h4>
                    <p className="text-brand-gray text-sm leading-relaxed opacity-80">包含开户、销户、变更户名/法人、久悬户返还等基础柜面业务。</p>
                  </div>
                  <div className="flex items-center gap-2 text-brand-gold font-bold text-sm mt-8">
                    进入选择 <ChevronRight size={18} />
                  </div>
                </button>

                <button 
                  onClick={() => { setMainType('credit'); setStep('business'); }}
                  className="group p-10 rounded-[2.5rem] border-2 border-brand-border/10 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all text-left flex flex-col justify-between min-h-[300px]"
                >
                  <div>
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <CreditCard size={32} />
                    </div>
                    <h4 className="font-serif text-2xl text-brand-dark mb-4">授信业务类</h4>
                    <p className="text-brand-gray text-sm leading-relaxed opacity-80">包含低风险、工商类通用版、小企业完整版授信资料清单。</p>
                  </div>
                  <div className="flex items-center gap-2 text-brand-gold font-bold text-sm mt-8">
                    进入选择 <ChevronRight size={18} />
                  </div>
                </button>
              </motion.div>
            )}

            {step === 'business' && (
              <motion.div 
                key="step-business"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={handleBack} className="p-2 hover:bg-brand-light-gray rounded-full transition-all">
                    <ChevronLeft size={24} />
                  </button>
                  <h4 className="font-serif text-2xl text-brand-dark">请选择具体业务场景</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-4">业务分类</p>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "w-full p-6 rounded-2xl border transition-all text-left flex items-center justify-between group",
                          selectedCategory?.id === cat.id 
                            ? "bg-brand-dark text-white border-brand-dark shadow-xl" 
                            : "bg-white border-brand-border/10 hover:border-brand-border/30"
                        )}
                      >
                        <span className="font-bold text-sm">{cat.name}</span>
                        <ChevronRight size={18} className={cn("transition-transform", selectedCategory?.id === cat.id ? "translate-x-1" : "opacity-0")} />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-4">具体细分</p>
                    {selectedCategory ? (
                      <div className="grid grid-cols-1 gap-4">
                        {selectedCategory.subCategories.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => { setSelectedSubCategory(sub); setStep('info'); }}
                            className="p-6 rounded-2xl border border-brand-border/10 bg-brand-light-gray/20 hover:bg-white hover:border-brand-gold/30 hover:shadow-lg transition-all text-left group"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-brand-dark">{sub.name}</span>
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-brand-gold opacity-0 group-hover:opacity-100 transition-all">
                                <ChevronRight size={16} />
                              </div>
                            </div>
                            <p className="text-xs text-brand-gray opacity-60">包含 {sub.checklist.length} 项必备材料</p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="h-40 border-2 border-dashed border-brand-border/20 rounded-[2rem] flex flex-col items-center justify-center text-brand-gray/40">
                        <AlertCircle size={32} className="mb-2 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">请先选择左侧分类</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'info' && (
              <motion.div 
                key="step-info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto"
              >
                <div className="flex items-center gap-4 mb-10">
                  <button onClick={handleBack} className="p-2 hover:bg-brand-light-gray rounded-full transition-all">
                    <ChevronLeft size={24} />
                  </button>
                  <div>
                    <h4 className="font-serif text-2xl text-brand-dark">填写基础信息</h4>
                    <p className="text-xs text-brand-gray mt-1">信息将自动带入话术与材料清单中</p>
                  </div>
                </div>

                <div className="bg-brand-light-gray/30 p-10 rounded-[2.5rem] border border-brand-border/10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest flex items-center gap-2">
                        <Building2 size={12} /> 客户名称 <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text"
                        value={info.customerName}
                        onChange={e => setInfo({...info, customerName: e.target.value})}
                        placeholder="请输入完整的企业名称"
                        className="w-full bg-white border border-brand-border/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest flex items-center gap-2">
                        <User size={12} /> 客户经理姓名
                      </label>
                      <input 
                        type="text"
                        value={info.managerName}
                        onChange={e => setInfo({...info, managerName: e.target.value})}
                        placeholder="请输入您的姓名"
                        className="w-full bg-white border border-brand-border/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest flex items-center gap-2">
                        <Phone size={12} /> 联系电话
                      </label>
                      <input 
                        type="text"
                        value={info.phone}
                        onChange={e => setInfo({...info, phone: e.target.value})}
                        placeholder="请输入您的联系电话"
                        className="w-full bg-white border border-brand-border/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={12} /> 联系微信
                      </label>
                      <input 
                        type="text"
                        value={info.wechat}
                        onChange={e => setInfo({...info, wechat: e.target.value})}
                        placeholder="请输入您的微信号"
                        className="w-full bg-white border border-brand-border/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest flex items-center gap-2">
                        <Mail size={12} /> 联系邮箱
                      </label>
                      <input 
                        type="email"
                        value={info.email}
                        onChange={e => setInfo({...info, email: e.target.value})}
                        placeholder="请输入您的联系邮箱"
                        className="w-full bg-white border border-brand-border/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} /> 邮寄地址 / 办公地址
                      </label>
                      <input 
                        type="text"
                        value={info.address}
                        onChange={e => setInfo({...info, address: e.target.value})}
                        placeholder="请输入详细的办公地址"
                        className="w-full bg-white border border-brand-border/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle size={12} /> 补充备注
                    </label>
                    <textarea 
                      value={info.remark}
                      onChange={e => setInfo({...info, remark: e.target.value})}
                      placeholder="如有特殊要求或补充说明，请在此输入"
                      className="w-full bg-white border border-brand-border/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all h-24 resize-none"
                    />
                  </div>

                  {selectedCategory?.id === 'industrial' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest flex items-center gap-2">
                        <FileText size={12} className="text-brand-gold" /> 特别说明 (工商类专用)
                      </label>
                      <textarea 
                        value={info.specialRemark}
                        onChange={e => setInfo({...info, specialRemark: e.target.value})}
                        placeholder="请输入针对该工商类客户的特别说明事项"
                        className="w-full bg-white border border-brand-border/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all h-24 resize-none"
                      />
                    </div>
                  )}

                  <button 
                    onClick={() => setStep('preview')}
                    disabled={!info.customerName}
                    className={cn(
                      "w-full py-5 rounded-2xl font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2",
                      info.customerName ? "bg-brand-dark text-white hover:bg-brand-dark/90" : "bg-brand-border/20 text-brand-gray cursor-not-allowed"
                    )}
                  >
                    生成预览 <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'preview' && selectedSubCategory && (
              <motion.div 
                key="step-preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-10"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 hover:bg-brand-light-gray rounded-full transition-all">
                      <ChevronLeft size={24} />
                    </button>
                    <h4 className="font-serif text-2xl text-brand-dark">生成结果预览</h4>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={exportWord}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg"
                    >
                      <FileText size={16} /> 下载 Word
                    </button>
                    <button 
                      onClick={exportExcel}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg"
                    >
                      <FileSpreadsheet size={16} /> 下载 Excel
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Block 1: Customer Script */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={12} className="text-brand-gold" /> 对客户的话术
                      </span>
                      <button 
                        onClick={() => copyToClipboard(generatedScript, '话术')}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-brand-gold hover:text-brand-dark transition-all bg-brand-gold/5 px-3 py-1.5 rounded-lg"
                      >
                        <Copy size={12} /> 复制话术
                      </button>
                    </div>
                    <div className="flex-grow bg-white p-6 rounded-3xl border border-brand-border/10 shadow-sm relative group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold rounded-l-3xl"></div>
                      <p className="text-sm leading-relaxed text-brand-dark font-medium whitespace-pre-wrap italic">
                        {generatedScript}
                      </p>
                    </div>
                  </div>

                  {/* Block 2: Required Info */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest flex items-center gap-2">
                        <FileSpreadsheet size={12} className="text-blue-600" /> 客户需补充填写的信息
                      </span>
                      <button 
                        onClick={() => copyToClipboard(requiredInfoText, '补充信息')}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-all bg-blue-50 px-3 py-1.5 rounded-lg"
                      >
                        <Copy size={12} /> 复制信息表
                      </button>
                    </div>
                    <div className="flex-grow bg-blue-50/20 p-6 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl"></div>
                      <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {selectedSubCategory.requiredInfo?.map((section, sIdx) => (
                          <div key={sIdx} className="space-y-3">
                            <h5 className="text-xs font-bold text-blue-900 border-b border-blue-100 pb-1">{section.title}</h5>
                            <div className="space-y-2">
                              {section.items.map((item, iIdx) => (
                                <div key={iIdx} className="text-[10px] text-blue-800">
                                  <span className="font-bold">• {item.label}</span>
                                  {item.type === 'table' && (
                                    <div className="mt-1 bg-white/50 p-2 rounded border border-blue-50 overflow-x-auto">
                                      <table className="w-full text-[8px] border-collapse">
                                        <thead>
                                          <tr>
                                            {item.fields?.map((f, fIdx) => (
                                              <th key={fIdx} className="border border-blue-100 p-1 bg-blue-50/50">{f}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {Array(2).fill(0).map((_, rIdx) => (
                                            <tr key={rIdx}>
                                              {item.fields?.map((_, cIdx) => (
                                                <td key={cIdx} className="border border-blue-100 p-1 h-4"></td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                      <p className="text-[8px] text-blue-400 mt-1 italic">... (共 {item.rows} 行)</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Block 3: Checklist Details */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest flex items-center gap-2">
                        <FileText size={12} className="text-brand-dark" /> 材料清单明细
                      </span>
                      <button 
                        onClick={() => copyToClipboard(checklistText, '材料清单')}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-brand-dark hover:text-black transition-all bg-brand-light-gray px-3 py-1.5 rounded-lg"
                      >
                        <Copy size={12} /> 复制清单
                      </button>
                    </div>
                    <div className="flex-grow bg-white p-6 rounded-3xl border border-brand-border/10 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-dark rounded-l-3xl"></div>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {selectedSubCategory.checklist.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 border-b border-brand-border/5 pb-3 last:border-0">
                            <span className="w-5 h-5 rounded-full bg-brand-light-gray flex items-center justify-center text-[10px] font-bold text-brand-gray shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-brand-dark">{item.name}</p>
                              <p className="text-[10px] text-brand-gold font-bold mt-0.5">{item.format}</p>
                              {item.note && <p className="text-[10px] text-brand-gray italic mt-0.5 opacity-60">({item.note})</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Block 4: Manager Reminders */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={12} className="text-red-500" /> 客户经理提醒 (内部)
                      </span>
                      <button 
                        onClick={() => copyToClipboard(managerRemindersText, '内部提醒')}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 hover:text-red-700 transition-all bg-red-50 px-3 py-1.5 rounded-lg"
                      >
                        <Copy size={12} /> 复制提醒
                      </button>
                    </div>
                    <div className="flex-grow bg-red-50/30 p-6 rounded-3xl border border-red-100 shadow-sm relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-3xl"></div>
                      <div className="space-y-3">
                        {selectedSubCategory.managerReminders?.map((note, idx) => (
                          <div key={idx} className="flex gap-2 text-xs text-red-900 font-medium leading-relaxed">
                            <span className="text-red-400 shrink-0">•</span>
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom: Action Footer */}
                <div className="flex justify-center pt-6">
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 px-10 py-4 border-2 border-brand-border/20 rounded-2xl text-brand-gray font-bold text-sm hover:bg-brand-light-gray transition-all"
                  >
                    <RotateCcw size={18} /> 重新选择业务
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MaterialChecklistCenter;
