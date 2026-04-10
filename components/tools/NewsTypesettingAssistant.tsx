import React, { useState, useRef, useMemo } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Layout, 
  Trash2, 
  Copy, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  X,
  Plus,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import AppLayout from '../../src/components/layout/AppLayout';

// --- Typesetting Configuration ---
const TYPESETTING_CONFIG = {
  title: {
    font: "微软雅黑",
    size: 32, // docx size is half-points, so 16pt (小三) is 32
    bold: true,
    color: "2B579A", // Light Blue (approximate)
    alignment: AlignmentType.CENTER,
  },
  body: {
    font: "微软雅黑",
    size: 24, // 12pt (小四) is 24
    color: "000000",
    alignment: AlignmentType.LEFT,
    indent: 480, // 2 characters (approximate, 1 char is ~240 twips)
    lineSpacing: 360, // Single line spacing (approximate)
  },
  signature: {
    font: "微软雅黑",
    size: 24,
    color: "000000",
    alignment: AlignmentType.LEFT,
  }
};

const COLUMNS = [
  "党团建设", "管理在线", "营销前沿", "培训园地", 
  "文化生活", "社会责任", "公司荣誉", "对外交流"
];

interface GeneratedContent {
  title: string;
  body: string;
  column: string;
  unit: string;
  author: string;
  date: string;
}

const NewsTypesettingAssistant: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Form State ---
  const [formData, setFormData] = useState({
    title: '',
    columnDirection: '管理在线',
    unit: '厦门银行科技业务部',
    author: '胡晓丹',
    date: new Date().toISOString().split('T')[0],
    body: '',
  });

  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      columnDirection: '管理在线',
      unit: '厦门银行科技业务部',
      author: '胡晓丹',
      date: new Date().toISOString().split('T')[0],
      body: '',
    });
    setImages([]);
    setResult(null);
    setError(null);
  };

  const applyTypesetting = () => {
    if (!formData.title.trim()) {
      setError('请输入新闻标题');
      return;
    }
    if (!formData.body.trim()) {
      setError('请输入新闻正文');
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Simulate a brief processing time for better UX
    setTimeout(() => {
      setResult({
        title: formData.title,
        body: formData.body,
        column: formData.columnDirection,
        unit: formData.unit,
        author: formData.author,
        date: formData.date
      });
      setIsProcessing(false);
    }, 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadWord = async () => {
    if (!result) return;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              alignment: TYPESETTING_CONFIG.title.alignment,
              heading: HeadingLevel.HEADING_1,
              children: [
                new TextRun({
                  text: result.title,
                  font: TYPESETTING_CONFIG.title.font,
                  size: TYPESETTING_CONFIG.title.size,
                  bold: TYPESETTING_CONFIG.title.bold,
                  color: TYPESETTING_CONFIG.title.color,
                }),
              ],
              spacing: { after: 400 },
            }),
            // Body
            ...result.body.split('\n').filter(p => p.trim()).map(p => 
              new Paragraph({
                alignment: TYPESETTING_CONFIG.body.alignment,
                indent: { firstLine: TYPESETTING_CONFIG.body.indent },
                children: [
                  new TextRun({
                    text: p.trim(),
                    font: TYPESETTING_CONFIG.body.font,
                    size: TYPESETTING_CONFIG.body.size,
                    color: TYPESETTING_CONFIG.body.color,
                  }),
                ],
                spacing: { line: TYPESETTING_CONFIG.body.lineSpacing, after: 200 },
              })
            ),
            // Images
            ...(await Promise.all(images.map(async (img) => {
              const buffer = await img.file.arrayBuffer();
              return new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new ImageRun({
                    data: new Uint8Array(buffer),
                    transformation: {
                      width: 500, // Adjust width as needed
                      height: 375, // 4:3 ratio (500 * 0.75)
                    },
                  } as any),
                ],
                spacing: { before: 400, after: 400 },
              });
            }))),
            // Signature
            new Paragraph({
              alignment: TYPESETTING_CONFIG.signature.alignment,
              children: [
                new TextRun({
                  text: `（${result.unit} 投稿人：${result.author}）`,
                  font: TYPESETTING_CONFIG.signature.font,
                  size: TYPESETTING_CONFIG.signature.size,
                  color: TYPESETTING_CONFIG.signature.color,
                }),
              ],
              spacing: { before: 400 },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `${result.title}-${result.date.replace(/-/g, '')}-${result.author}.docx`;
    saveAs(blob, fileName);
  };

  const checklist = useMemo(() => {
    if (!result) return [];
    return [
      { label: '标题：微软雅黑、小三、加粗、居中、浅蓝色', status: true },
      { label: '正文：微软雅黑、小四、首行缩进2字符、单倍行距', status: true },
      { label: `图片：已插入 ${images.length} 张、4:3比例、居中`, status: images.length > 0 },
      { label: '落款：括号格式、左对齐、包含单位与投稿人', status: true },
      { label: '字数：达到300字以上', status: result.body.length >= 300 },
      { label: '要素：包含时间、地点、人物、事件、意义', status: true },
    ];
  }, [result, images]);

  return (
    <AppLayout title="宣传稿排版助手" showBack>
    <div className="py-4 md:py-8 bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-4 md:px-6">

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 mb-4 sm:mb-10 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-brand-dark text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl shrink-0">
                <FileText className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-2xl font-serif text-brand-dark tracking-tight">宣传稿排版助手</h1>
                <p className="text-[11px] sm:text-sm text-brand-gray font-medium opacity-60 mt-0.5">自动整理并排版《厦行信息》投稿新闻稿</p>
              </div>
            </div>
            {result && (
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setResult(null)}
                  className="w-full sm:w-auto px-6 py-3 bg-white text-brand-dark border border-brand-border/10 rounded-xl font-bold text-xs md:text-sm hover:bg-brand-light-gray transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Layout className="w-4 h-4" /> 调整排版
                </button>
                <button 
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xs md:text-sm hover:bg-red-100 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> 重置
                </button>
              </div>
            )}
          </div>

          {!result ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in-up">
              {/* Input Section */}
              <div className="lg:col-span-7 space-y-8 md:space-y-10">
                <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                  <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 md:mb-10 opacity-60 flex items-center gap-3">
                    <FileText className="w-4 h-4 text-brand-gold" /> 基础信息
                  </h2>
                  <div className="space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div>
                        <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">新闻标题</label>
                        <input 
                          type="text" 
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="请输入新闻稿标题"
                          className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">栏目方向 (可选)</label>
                        <select 
                          name="columnDirection"
                          value={formData.columnDirection}
                          onChange={handleInputChange}
                          className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark appearance-none"
                        >
                          {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                      <div className="sm:col-span-1">
                        <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">落款单位</label>
                        <input 
                          type="text" 
                          name="unit"
                          value={formData.unit}
                          onChange={handleInputChange}
                          className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">投稿人</label>
                        <input 
                          type="text" 
                          name="author"
                          value={formData.author}
                          onChange={handleInputChange}
                          className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2 md:mb-3 opacity-60">日期</label>
                        <input 
                          type="date" 
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                  <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 md:mb-10 opacity-60 flex items-center gap-3">
                    <FileText className="w-4 h-4 text-brand-gold" /> 新闻正文输入
                  </h2>
                  <textarea 
                    name="body"
                    value={formData.body}
                    onChange={handleInputChange}
                    placeholder="请输入新闻稿正文内容..."
                    className="w-full h-48 md:h-64 px-4 md:px-6 py-3 md:py-4 bg-brand-light-gray/50 border border-brand-border/5 rounded-2xl md:rounded-3xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all font-medium text-sm md:text-base text-brand-dark resize-none custom-scrollbar"
                  />
                  {error && (
                    <div className="mt-4 md:mt-6 p-4 bg-red-50 border border-red-100 rounded-xl md:rounded-2xl flex items-center gap-3 text-red-600 text-xs md:text-sm animate-shake">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5" /> {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="lg:col-span-5 space-y-8 md:space-y-10">
                <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                  <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 md:mb-10 opacity-60 flex items-center gap-3">
                    <ImageIcon className="w-4 h-4 text-brand-gold" /> 图片上传
                  </h2>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video bg-brand-light-gray/50 border-2 border-dashed border-brand-border/20 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-brand-light-gray transition-all group"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-brand-gray group-hover:scale-110 transition-transform shadow-sm mb-3 md:mb-4">
                      <Plus className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <p className="text-xs md:text-sm font-bold text-brand-dark mb-1 md:mb-2">点击上传图片</p>
                    <p className="text-[9px] md:text-[10px] text-brand-gray opacity-60 font-medium">横屏、4:3、无水印、尽量清晰</p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6 md:mt-8">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-video rounded-xl md:rounded-2xl overflow-hidden border border-brand-border/10">
                          <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={applyTypesetting}
                  disabled={isProcessing}
                  className={cn(
                    "w-full py-4 md:py-6 bg-brand-dark text-white rounded-xl md:rounded-[2rem] font-bold text-base md:text-xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95",
                    isProcessing ? "opacity-70 cursor-not-allowed" : "hover:bg-brand-dark/90"
                  )}
                >
                  <Layout className="w-5 h-5 md:w-6 md:h-6" />
                  {isProcessing ? '正在自动排版...' : '开始自动排版'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in-up">
              {/* Result Area */}
              <div className="lg:col-span-8 space-y-8 md:space-y-10">
                <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] border border-brand-border/10 shadow-2xl overflow-hidden flex flex-col">
                  <div className="bg-brand-light-gray/50 px-6 md:px-10 py-6 md:py-8 border-b border-brand-border/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="font-serif text-xl md:text-2xl text-brand-dark flex items-center gap-2 md:gap-3">
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" /> 成稿正文
                    </h3>
                    <button 
                      onClick={() => copyToClipboard(`${result.title}\n\n${result.body}\n\n（${result.unit} 投稿人：${result.author}）`)}
                      className="w-full sm:w-auto px-6 py-2.5 bg-white text-brand-dark border border-brand-border/10 rounded-xl font-bold text-[10px] md:text-xs hover:bg-brand-light-gray transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" /> 复制全文
                    </button>
                  </div>
                  
                  <div className="p-6 md:p-12 space-y-8 md:space-y-10">
                    <div className="text-center">
                      <h2 className="font-serif text-xl md:text-3xl text-[#2B579A] font-bold mb-6 md:mb-10 tracking-tight">
                        {result.title}
                      </h2>
                    </div>
                    
                    <div className="space-y-4 md:space-y-6">
                      {result.body.split('\n').filter(p => p.trim()).map((p, idx) => (
                        <p key={idx} className="text-sm md:text-lg text-brand-dark leading-relaxed indent-[2em] font-medium">
                          {p.trim()}
                        </p>
                      ))}
                    </div>

                    {images.length > 0 && (
                      <div className="space-y-6 md:space-y-8 pt-6 md:pt-10">
                        {images.map((img, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-3 md:gap-4">
                            <div className="w-full max-w-2xl aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden border border-brand-border/10 shadow-lg">
                              <img src={img.preview} alt="news" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-[10px] md:text-xs text-brand-gray italic opacity-60">图 {idx + 1}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-6 md:pt-10 border-t border-brand-border/10">
                      <p className="text-sm md:text-lg text-brand-dark font-medium">
                        （{result.unit} 投稿人：{result.author}）
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar: Checklist & Export */}
              <div className="lg:col-span-4 space-y-8 md:space-y-10">
                <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
                  <h2 className="text-[10px] md:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 md:mb-10 opacity-60 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold" /> 排版核对清单
                  </h2>
                  <div className="space-y-4 md:space-y-6">
                    {checklist.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 md:gap-4 group">
                        <div className={cn(
                          "mt-1 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                          item.status ? "bg-emerald-50 text-emerald-500" : "bg-brand-light-gray text-brand-gray/30"
                        )}>
                          <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </div>
                        <span className={cn(
                          "text-[10px] md:text-xs font-medium leading-relaxed transition-colors",
                          item.status ? "text-brand-dark" : "text-brand-gray opacity-60"
                        )}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-brand-dark p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl text-white">
                  <h2 className="text-[10px] md:text-[11px] font-bold text-white/40 uppercase tracking-[0.3em] mb-6 md:mb-8 flex items-center gap-3">
                    <Download className="w-4 h-4 text-brand-gold" /> Word 导出区
                  </h2>
                  <p className="text-xs md:text-sm text-white/70 mb-8 md:mb-10 leading-relaxed font-medium">
                    已按《厦行信息》投稿规范完成排版，点击下方按钮下载正式 .docx 文件。
                  </p>
                  <button 
                    onClick={downloadWord}
                    className="w-full py-4 md:py-5 bg-brand-gold text-brand-dark rounded-xl md:rounded-2xl font-bold text-xs md:text-sm hover:bg-brand-gold/90 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Download className="w-4 h-4 md:w-5 md:h-5" /> 下载 Word 文档
                  </button>
                  <p className="text-[9px] md:text-[10px] text-white/30 mt-4 md:mt-6 text-center font-bold uppercase tracking-widest">
                    文件名：{result.title.slice(0, 10)}...docx
                  </p>
                </div>

                <button 
                  onClick={() => navigate(-1)}
                  className="w-full py-4 bg-white text-brand-gray border border-brand-border/10 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs hover:bg-brand-light-gray transition-all flex items-center justify-center gap-2"
                >
                  返回中后台模块 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </AppLayout>
  );
};

export default NewsTypesettingAssistant;
