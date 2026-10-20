// Business scope confirmed by the project owner on 2026-10-14.
// Keep shipped tasks separate from research. See docs/LITTLE-CONCH-BUSINESS-TRUTH.md.
export const CHAPTERS=[
{start:0,kind:'origin',id:'YOUR PERSONAL AGENT',kicker:'ORIGIN / 00 — THE LITTLE CONCH',title:'把一件事，\n交给小海螺。',cn:'厦门银行对公客户经理的 Personal Agent。',desc:'从授信工作里的具体任务出发，查询、转换、梳理、生成材料。让重复的工作轻一点，让你的判断有更多时间。',label:'THE LITTLE CONCH',visual:'conch',holo:[],depth:18},
{start:.14,kind:'scenario',id:'EXTERNAL RISK QUERY',kicker:'SCENE / 01 — EXTERNAL RISK',title:'风险的线索，\n先一步看见。',cn:'外部风险信息查询',desc:'交给小海螺：批量查询贷后企业的外部风险信息。',steps:'查询工商异常、行政处罚、司法涉诉等信息。',deliverable:'企业外部风险查询结果，辅佐贷后批量查询。',label:'EXTERNAL RISK',visual:'query',atlasCell:0,depth:52,holo:[]},
{start:.33,kind:'scenario',id:'FINANCIAL CONVERSION',kicker:'SCENE / 02 — FINANCIAL CONVERSION',title:'每月的重复，\n少一道。',cn:'财报转换',desc:'交给小海螺：把财报转成信贷系统能识别的格式。',steps:'提取财报字段，匹配科目，生成适配信贷系统 OCR 的财报。',deliverable:'可供 OCR 一键识别、导入信贷系统的财报。',label:'FINANCIAL CONVERSION',visual:'finance',atlasCell:2,depth:118,holo:[]},
{start:.52,kind:'scenario',id:'ENTERPRISE EQUITY',kicker:'SCENE / 03 — ENTERPRISE EQUITY',title:'把股权，\n理成脉络。',cn:'企业股权分析',desc:'交给小海螺：梳理企业背后的股东与持股结构。',steps:'整理股东结构、持股比例等关键信息。',deliverable:'用于授信报告企业分析的股权信息。',label:'ENTERPRISE EQUITY',visual:'equity',atlasCell:3,depth:183,holo:[]},
{start:.71,kind:'scenario',id:'BENEFICIAL OWNER',kicker:'SCENE / 04 — BENEFICIAL OWNER',title:'穿过层层持股，\n找到那个人。',cn:'受益所有人一键识别',desc:'交给小海螺：识别受益所有人，准备所需材料。',steps:'穿透股权，自动带入持股比例，一键生成材料。',deliverable:'受益所有人识别材料。',label:'BENEFICIAL OWNER',visual:'ownership',atlasCell:1,depth:249,holo:[]},
{start:.9,kind:'research',id:'MORE IS GROWING',kicker:'NEXT / 正在研究 · 尚未作为已上线能力展示',title:'下一种可能，\n正在生长。',cn:'每一个真实任务，都可能长出新的能力。',desc:'经营模式、行业与上下游产业链分析，财报与流动资金分析、工商分析、授信报告底稿生成……我们继续研究，让小海螺走进更多授信场景。',label:'STILL GROWING',visual:'conch',holo:[],depth:310},
{start:.975,kind:'credits',id:'THE PEOPLE',kicker:'FINALE — APEX STUDIO',title:'海洋，\n还在展开。',cn:'小海螺继续生长。',desc:'',label:'CREDITS',visual:'credits',depth:320,holo:[]}
];
export const SCENARIOS=CHAPTERS.filter(ch=>ch.kind==='scenario');
export const SCENARIO_COUNT=SCENARIOS.length;
export const FINALE_INDEX=CHAPTERS.findIndex(ch=>ch.kind==='credits');
export function chapterKicker(ch,index){return ch.kind==='scenario'?`${String(index).padStart(2,'0')} / ${String(SCENARIO_COUNT).padStart(2,'0')} · ${ch.cn}`:ch.kicker;}
