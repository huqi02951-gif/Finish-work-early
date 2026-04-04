import React from 'react';
import { BookOpen, Globe, Terminal, Layout, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const UsageInstructions: React.FC = () => {
  const usageTypes = [
    {
      title: '在线网页工具',
      icon: Globe,
      desc: '直接在浏览器中使用的轻量化工具，无需安装，即开即用。',
      color: 'bg-blue-50 text-blue-600',
      steps: [
        '进入 Skills 工具库',
        '筛选“在线可用”状态的 Skill',
        '点击进入详情页，输入业务参数',
        '一键生成结果，支持复制或下载'
      ]
    },
    {
      title: '本地批量生成工具',
      icon: Terminal,
      desc: '针对大批量、高频次、涉及本地文件操作的场景，提供 Python GUI 或脚本。',
      color: 'bg-green-50 text-green-600',
      steps: [
        '在详情页下载对应的本地工具包',
        '确保本地已安装 Python 环境',
        '运行 main.exe 或 main.py',
        '导入 Excel 模板，批量生成成品文件'
      ]
    },
    {
      title: '可安装到大模型平台的 Skills',
      icon: Layout,
      desc: '将固化的经验与逻辑封装为标准 Skill 协议，可挂载到行内大模型 Agent 平台。',
      color: 'bg-purple-50 text-purple-600',
      steps: [
        '在大模型平台搜索对应的 Skill 名称',
        '授权 Agent 调用该 Skill',
        '通过自然语言对话触发业务逻辑',
        'Agent 自动调用 Skill 完成复杂任务'
      ]
    }
  ];

  return (
    <div className="py-24 bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-20 animate-fade-in-up">
          <h1 className="font-serif text-5xl md:text-6xl text-brand-dark mb-8">使用说明</h1>
          <p className="text-xl text-stone-500 leading-relaxed">
            区分三类使用方式，满足不同业务场景下的操作需求。
            无论是在线轻量化操作，还是本地大批量处理，都能找到最适合的工具。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {usageTypes.map((type, idx) => (
            <div key={type.title} className="bg-white p-8 rounded-xl border border-stone-100 shadow-sm hover:shadow-lg transition-all flex flex-col">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm", type.color)}>
                <type.icon size={32} />
              </div>
              <h2 className="font-serif text-2xl text-brand-dark mb-4">{type.title}</h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-8 flex-grow">
                {type.desc}
              </p>
              <div className="space-y-4 mb-8">
                {type.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-stone-600">
                    <span className="w-5 h-5 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-400 mt-0.5 flex-shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
              <button className="w-full py-3 bg-stone-50 text-brand-dark border border-stone-200 rounded-md text-sm font-bold hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-all flex items-center justify-center gap-2">
                查看相关 Skills <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-24 p-12 bg-white rounded-xl border border-stone-100 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="font-serif text-3xl text-brand-dark mb-6">注意事项</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-stone-600">
                  <CheckCircle2 size={20} className="text-brand-gold mt-1 flex-shrink-0" />
                  <span>所有工具仅限行内业务使用，请严格遵守数据安全与合规要求。</span>
                </li>
                <li className="flex items-start gap-3 text-stone-600">
                  <CheckCircle2 size={20} className="text-brand-gold mt-1 flex-shrink-0" />
                  <span>生成的结果请务必进行人工校对，Agent 仅作为辅助提效工具。</span>
                </li>
                <li className="flex items-start gap-3 text-stone-600">
                  <CheckCircle2 size={20} className="text-brand-gold mt-1 flex-shrink-0" />
                  <span>如遇工具运行异常，请通过“反馈/共创”页面提交错误日志。</span>
                </li>
              </ul>
            </div>
            <div className="bg-brand-offwhite p-8 rounded-xl border border-stone-100">
              <h4 className="font-serif text-xl text-brand-dark mb-4">需要技术支持？</h4>
              <p className="text-stone-500 text-sm mb-6 leading-relaxed">
                如果你在安装本地工具或配置 Python 环境时遇到困难，
                可以联系我们的技术支持团队或查阅内部 Wiki 文档。
              </p>
              <button className="px-6 py-2 bg-brand-dark text-white rounded-md text-sm font-bold hover:bg-brand-dark/90 transition-all">
                查看 Wiki 文档
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageInstructions;
