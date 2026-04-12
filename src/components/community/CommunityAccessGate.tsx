import React, { useEffect, useState } from 'react';

const SESSION_KEY = 'fwe:community-access-granted';

const ACCESS_STEPS = [
  '正在接入暗网节点...',
  '验证本地原型会话...',
  '启用匿名频道与临时贴板...',
];

interface CommunityAccessGateProps {
  forceOpen?: boolean;
}

const CommunityAccessGate: React.FC<CommunityAccessGateProps> = ({ forceOpen = false }) => {
  const [visible, setVisible] = useState(() => forceOpen || sessionStorage.getItem(SESSION_KEY) !== '1');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const timers = [
      window.setTimeout(() => setStep(1), 450),
      window.setTimeout(() => setStep(2), 950),
      window.setTimeout(() => {
        sessionStorage.setItem(SESSION_KEY, '1');
        setVisible(false);
      }, 1600),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#030705]/92 px-4">
      <div className="w-full max-w-md rounded-lg border border-[#21432f] bg-[#07110d] p-5 text-[#d7ffe3] shadow-[0_0_40px_rgba(34,197,94,0.12)]">
        <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#70a17f]">community access</div>
        <div className="space-y-2 text-sm">
          {ACCESS_STEPS.map((item, index) => (
            <div
              key={item}
              className={index <= step ? 'text-[#d7ffe3]' : 'text-[#4a7258]'}
            >
              [{index <= step ? 'ok' : '..'}] {item}
            </div>
          ))}
        </div>
        <div className="mt-4 text-[11px] leading-relaxed text-[#70a17f]">
          当前为浏览器本地社区原型，仅在当前设备可见。
        </div>
      </div>
    </div>
  );
};

export default CommunityAccessGate;
