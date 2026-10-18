import { SCENARIOS } from './StoryChapters.js';

// M2's interactive workbench, bounded by the four owner-confirmed tasks.
// These samples never connect to production, sign documents or approve credit.
export const TASK_DEMOS=[
 {steps:['接收企业清单','查询工商异常、行政处罚、司法涉诉','汇总查询结果'],sample:[['工商异常','示例企业 A · 待核查'],['行政处罚','示例企业 A · 待核查'],['司法涉诉','示例企业 A · 待核查']],result:'外部风险查询结果 · 辅佐贷后批量查询'},
 {steps:['提取财报字段','匹配信贷系统科目','转换为 OCR 可识别的财报'],sample:[['企业原始财报','字段提取'],['财报字段','科目匹配'],['标准版式','OCR 识别 → 导入信贷系统']],result:'适配信贷系统 OCR 的财报 · 减少每月重复录入'},
 {steps:['整理股东信息','梳理股东结构与持股比例','形成企业分析所需的股权信息'],sample:[['示例企业 A','股东甲 · 60%'],['示例企业 A','股东乙 · 40%'],['股权结构','汇入授信报告企业分析']],result:'股权信息 · 用于授信报告中的企业分析'},
 {steps:['逐层穿透股权','自动带入持股比例','一键生成识别材料'],sample:[['示例路径','自然人甲 → 企业乙 → 企业 A'],['持股比例','60% × 50% = 30%（仅演示计算）'],['材料准备','受益所有人识别材料']],result:'受益所有人识别材料 · 交由客户经理核验'}
];
export function setupExperiencePanels({onOpen,onClose,onIsland,onPulse}) {
  const map=document.getElementById('ocean-map'),workbench=document.getElementById('task-demo');
  let timer=null,skill=0,step=-1;
  const stop=()=>{clearInterval(timer);timer=null;};
  function close(dialog){dialog.close();}
  function open(dialog){onOpen();dialog.showModal();}
  for(const dialog of [map,workbench]) {
    dialog.querySelector('[data-close]').addEventListener('click',()=>close(dialog));
    dialog.addEventListener('close',()=>{stop();onClose();});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close(dialog);}});
  }
  document.getElementById('open-map').addEventListener('click',()=>open(map));
  document.getElementById('map-enter').addEventListener('click',()=>{close(map);onIsland();});
  document.getElementById('conch-pulse').addEventListener('click',onPulse);
  const tabs=workbench.querySelector('.demo-tabs'),body=workbench.querySelector('.demo-body'),run=workbench.querySelector('[data-run]');
  tabs.innerHTML=SCENARIOS.map((ch,i)=>`<button type="button" data-demo="${i}" aria-pressed="false">0${i+1} ${ch.cn}</button>`).join('');
  function render(){
    const ch=SCENARIOS[skill],data=TASK_DEMOS[skill];
    tabs.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===skill)));
    body.innerHTML=`<span class="panel-eyebrow">TASK → EXECUTION → DELIVERY</span><h3>${ch.cn}</h3><p>${ch.desc}</p><ol class="demo-pipeline">${data.steps.map((s,i)=>`<li class="${i<=step?'is-complete':''}"><span>0${i+1}</span><strong>${s}</strong><small>${i<step?'已演示':i===step?'正在呈现':'等待演示'}</small></li>`).join('')}</ol><div class="demo-sample">${data.sample.map(([name,value])=>`<div><span>${name}</span><b>${value}</b></div>`).join('')}</div><p class="demo-result"><span>交付</span>${step>=data.steps.length?'演示完成 · ':''}${data.result}</p>`;
    run.textContent=timer?'正在演示…':step>=data.steps.length?'↺ 重看执行过程':'▶ 演示执行过程';
    run.disabled=Boolean(timer);
  }
  tabs.addEventListener('click',event=>{const button=event.target.closest('[data-demo]');if(!button)return;stop();skill=Number(button.dataset.demo);step=-1;render();});
  run.addEventListener('click',()=>{
    stop();step=0;timer=setInterval(()=>{step++;if(step>=TASK_DEMOS[skill].steps.length)stop();render();},1000);render();
  });
  document.getElementById('open-task-demo').addEventListener('click',()=>{
    skill=Math.max(0,Math.min(3,Number(document.getElementById('film').dataset.milestone)-1));step=-1;render();open(workbench);
  });
}
