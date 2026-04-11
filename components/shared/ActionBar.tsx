/**
 * 通用工具操作栏 — 复制 / 导出 Word / 保存历史
 * 所有业务工具共用此组件，实现统一的闭环体验。
 */
import React, { useState } from 'react';
import { Copy, Download, BookmarkPlus, CheckCircle2, Clock, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { saveArtifact, logExport, getRecentArtifacts, type GeneratedArtifact } from '../../lib/localDB';
import { motion, AnimatePresence } from 'framer-motion';

// ─── 复制按钮 ─────────────────────────────────

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  variant?: 'primary' | 'ghost';
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, label = '复制', className, variant = 'primary' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95",
        variant === 'primary'
          ? copied
            ? "bg-emerald-500 text-white"
            : "bg-brand-dark text-white hover:bg-brand-dark/90"
          : copied
            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
            : "bg-brand-light-gray/50 text-brand-gray hover:bg-brand-light-gray border border-brand-border/10",
        className
      )}
    >
      {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
      {copied ? '已复制' : label}
    </button>
  );
};

// ─── 导出 Word 按钮 ────────────────────────────

interface ExportDocxButtonProps {
  /** 返回 docx Blob 的异步函数 */
  buildDocx: () => Promise<Blob>;
  filename: string;
  toolId: string;
  className?: string;
}

export const ExportDocxButton: React.FC<ExportDocxButtonProps> = ({ buildDocx, filename, toolId, className }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await buildDocx();
      const { saveAs } = await import('file-saver');
      saveAs(blob, filename);
      await logExport(toolId, 'docx', filename);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className={cn(
        "px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95",
        "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100",
        exporting && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <Download size={14} className={exporting ? "animate-bounce" : ""} />
      {exporting ? '生成中...' : '下载 Word'}
    </button>
  );
};

// ─── 保存到历史 ────────────────────────────────

interface SaveHistoryButtonProps {
  toolId: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  className?: string;
}

export const SaveHistoryButton: React.FC<SaveHistoryButtonProps> = ({ toolId, title, content, metadata, className }) => {
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await saveArtifact(toolId, title, content, metadata);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <button
      onClick={handleSave}
      className={cn(
        "px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95",
        saved
          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
          : "bg-brand-light-gray/50 text-brand-gray hover:bg-brand-light-gray border border-brand-border/10",
        className
      )}
    >
      {saved ? <CheckCircle2 size={14} /> : <BookmarkPlus size={14} />}
      {saved ? '已保存' : '存入历史'}
    </button>
  );
};

// ─── 历史记录面板 ──────────────────────────────

interface HistoryPanelProps {
  toolId: string;
  onSelect?: (artifact: GeneratedArtifact) => void;
  className?: string;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ toolId, onSelect, className }) => {
  const [items, setItems] = useState<GeneratedArtifact[]>([]);
  const [open, setOpen] = useState(false);

  const loadHistory = async () => {
    const data = await getRecentArtifacts(toolId, 10);
    setItems(data);
    setOpen(true);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={loadHistory}
        className="px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 bg-brand-light-gray/50 text-brand-gray hover:bg-brand-light-gray border border-brand-border/10 active:scale-95"
      >
        <Clock size={14} />
        历史记录
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-x-4 bottom-4 top-auto max-h-[70vh] bg-white rounded-3xl shadow-2xl border border-brand-border/10 z-50 overflow-hidden flex flex-col md:inset-auto md:absolute md:bottom-auto md:top-full md:mt-2 md:right-0 md:w-[400px] md:max-h-[500px]"
            >
              <div className="px-6 py-4 border-b border-brand-border/5 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-brand-dark text-sm flex items-center gap-2">
                  <FileText size={16} className="text-brand-gold" /> 生成历史
                </h3>
                <button onClick={() => setOpen(false)} className="text-xs text-brand-gray hover:text-brand-dark font-bold">关闭</button>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-12 text-brand-gray opacity-40">
                    <Clock size={28} className="mx-auto mb-3" />
                    <p className="text-xs font-bold">暂无历史记录</p>
                    <p className="text-[10px] mt-1">生成内容后点击"存入历史"即可保存</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { onSelect?.(item); setOpen(false); }}
                      className="w-full text-left p-4 bg-brand-light-gray/30 rounded-2xl border border-brand-border/5 hover:bg-brand-light-gray/60 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-brand-dark">{item.title}</span>
                        <span className="text-[9px] text-brand-gray opacity-50">
                          {new Date(item.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-brand-gray line-clamp-2 leading-relaxed">{item.content.slice(0, 100)}...</p>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── 组合操作栏 ────────────────────────────────

interface ActionBarProps {
  copyText?: string;
  buildDocx?: () => Promise<Blob>;
  docxFilename?: string;
  toolId: string;
  historyTitle?: string;
  historyContent?: string;
  historyMetadata?: Record<string, any>;
  onHistorySelect?: (artifact: GeneratedArtifact) => void;
  className?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  copyText,
  buildDocx,
  docxFilename,
  toolId,
  historyTitle,
  historyContent,
  historyMetadata,
  onHistorySelect,
  className,
}) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {copyText && <CopyButton text={copyText} label="复制全部" />}
      {buildDocx && docxFilename && (
        <ExportDocxButton buildDocx={buildDocx} filename={docxFilename} toolId={toolId} />
      )}
      {historyContent && historyTitle && (
        <SaveHistoryButton toolId={toolId} title={historyTitle} content={historyContent} metadata={historyMetadata} />
      )}
      <HistoryPanel toolId={toolId} onSelect={onHistorySelect} />
    </div>
  );
};
