import React from 'react';
import { cn } from '../../../lib/utils';

interface InitialBadgeProps {
  label?: string;
  className?: string;
  tone?: 'light' | 'dark' | 'neutral' | 'cyber';
}

const getInitials = (label?: string) => {
  const value = (label || 'FW').trim();
  if (!value) return 'FW';

  const compact = value.replace(/\s+/g, '');
  if (compact.length <= 2) return compact.toUpperCase();
  return compact.slice(0, 2).toUpperCase();
};

const toneClassMap: Record<NonNullable<InitialBadgeProps['tone']>, string> = {
  light: 'bg-white text-brand-dark border border-brand-border/60',
  dark: 'bg-brand-dark text-white border border-brand-dark',
  neutral: 'bg-brand-light-gray text-brand-dark border border-brand-border/40',
  cyber: 'bg-[#08110d] text-[#8cffb0] border border-[#1e5d35]',
};

const InitialBadge: React.FC<InitialBadgeProps> = ({ label, className, tone = 'neutral' }) => {
  return (
    <div
      aria-hidden
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md text-[11px] font-semibold tracking-normal',
        toneClassMap[tone],
        className,
      )}
    >
      {getInitials(label)}
    </div>
  );
};

export default InitialBadge;
