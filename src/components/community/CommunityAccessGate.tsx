import React, { useEffect, useState } from 'react';

const SESSION_KEY = 'fwe:darkweb-access-granted';

interface CommunityAccessGateProps {
  forceOpen?: boolean;
  moduleName?: string;
}

const CommunityAccessGate: React.FC<CommunityAccessGateProps> = ({ forceOpen = false, moduleName = '地下系统' }) => {
  // Use session storage suffix to track access per module
  const accessKey = `${SESSION_KEY}-${moduleName}`;
  const [visible, setVisible] = useState(() => forceOpen || sessionStorage.getItem(accessKey) !== '1');
  const [step, setStep] = useState(0);

  const ACCESS_STEPS = [
    `正在建立与 [${moduleName}] 的加密连接...`,
    '窃取本地节点权限... (BYPASS OPAQUE)',
    '接入暗网节点成功。',
  ];

  useEffect(() => {
    if (!visible) return;

    const timers = [
      window.setTimeout(() => setStep(1), 500),
      window.setTimeout(() => setStep(2), 1200),
      window.setTimeout(() => {
        sessionStorage.setItem(accessKey, '1');
        setVisible(false);
      }, 1800),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [visible, accessKey]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 px-4 pointer-events-auto backdrop-blur-sm">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-40 z-0"></div>
      
      <div className="relative z-10 w-full max-w-md border border-[#00ff41]/50 bg-black p-6 font-mono text-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.2)]">
        <div className="mb-4 text-[10px] uppercase tracking-[0.18em] text-[#00ff41]/60 flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00ff41] animate-pulse"></span>
          ACCESSING SECURE NODE
        </div>
        <div className="space-y-3 text-[13px]">
          {ACCESS_STEPS.map((item, index) => (
            <div
              key={item}
              className={index <= step ? 'text-[#00ff41]' : 'text-[#00ff41]/30 opacity-70'}
            >
              <span className="text-[#00ff41] mr-2 block sm:inline">
                {index <= step ? '[OK]' : '[..]'}
              </span>
              <span className={index === step ? 'animate-pulse font-bold' : ''}>
                {item}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-[#00ff41]/30 pt-3 text-[10px] leading-relaxed text-[#00ff41]/50">
          * Warning: Unregistered local prototyping instance detected.
          <br/>
          * Protocol: Ghost Protocol Active.
        </div>
      </div>
    </div>
  );
};

export default CommunityAccessGate;
