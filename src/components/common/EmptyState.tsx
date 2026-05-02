import React from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { padding: 'py-8', icon: 'w-10 h-10', iconBox: 'w-14 h-14' },
  md: { padding: 'py-12', icon: 'w-12 h-12', iconBox: 'w-20 h-20' },
  lg: { padding: 'py-16', icon: 'w-14 h-14', iconBox: 'w-24 h-24' },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  size = 'md',
}) => {
  const s = sizeMap[size];
  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-4 ${s.padding} px-6 animate-fade-in-up ${className}`}
      role="status"
    >
      <div
        className={`${s.iconBox} rounded-full bg-brand-gold/10 flex items-center justify-center`}
        aria-hidden
      >
        <Icon className={`${s.icon} text-brand-gold`} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1.5 max-w-sm">
        <h3 className="text-h3 text-brand-dark">{title}</h3>
        {description && (
          <p className="text-body-sm text-brand-gray">{description}</p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          {action && (
            <Button
              variant={action.variant ?? 'primary'}
              size="md"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant ?? 'ghost'}
              size="md"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
