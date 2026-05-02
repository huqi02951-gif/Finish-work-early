import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = '加载失败',
  message = '请检查网络后重试',
  onRetry,
  retryLabel = '重新加载',
  className = '',
  size = 'md',
}) => {
  const isSm = size === 'sm';
  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-3 ${isSm ? 'py-6' : 'py-10'} px-6 animate-fade-in ${className}`}
      role="alert"
    >
      <div
        className={`${isSm ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-red-50 flex items-center justify-center`}
        aria-hidden
      >
        <AlertCircle
          className={`${isSm ? 'w-6 h-6' : 'w-8 h-8'} text-red-500`}
          strokeWidth={1.6}
        />
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <h3 className={`${isSm ? 'text-body' : 'text-h3'} text-brand-dark font-semibold`}>
          {title}
        </h3>
        {message && (
          <p className="text-body-sm text-brand-gray">{message}</p>
        )}
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size={isSm ? 'sm' : 'md'}
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
