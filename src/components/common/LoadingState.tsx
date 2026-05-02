import React from 'react';
import { Loader2 } from 'lucide-react';

type LoadingVariant = 'skeleton' | 'spinner' | 'inline';
type SkeletonShape = 'list' | 'card' | 'thread' | 'rows';

interface LoadingStateProps {
  variant?: LoadingVariant;
  shape?: SkeletonShape;
  rows?: number;
  label?: string;
  className?: string;
}

const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-brand-light-gray rounded-md ${className}`}
    aria-hidden
  />
);

const SkeletonList: React.FC<{ rows: number }> = ({ rows }) => (
  <ul className="flex flex-col gap-3">
    {Array.from({ length: rows }).map((_, i) => (
      <li
        key={i}
        className="apple-card p-4 flex flex-col gap-2"
      >
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-5/6" />
        <div className="flex items-center gap-2 mt-2">
          <SkeletonBlock className="h-6 w-6 rounded-full" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
      </li>
    ))}
  </ul>
);

const SkeletonCard: React.FC = () => (
  <div className="apple-card p-6 flex flex-col gap-4">
    <SkeletonBlock className="h-6 w-1/2" />
    <SkeletonBlock className="h-4 w-full" />
    <SkeletonBlock className="h-4 w-11/12" />
    <SkeletonBlock className="h-4 w-3/4" />
  </div>
);

const SkeletonThread: React.FC = () => (
  <div className="flex flex-col gap-5">
    <SkeletonCard />
    <SkeletonList rows={3} />
  </div>
);

const SkeletonRows: React.FC<{ rows: number }> = ({ rows }) => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonBlock key={i} className="h-4 w-full" />
    ))}
  </div>
);

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'skeleton',
  shape = 'list',
  rows = 3,
  label,
  className = '',
}) => {
  if (variant === 'spinner') {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 py-12 text-brand-gray ${className}`}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="w-6 h-6 animate-spin text-brand-gold" />
        {label && <span className="text-body-sm">{label}</span>}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <span
        className={`inline-flex items-center gap-2 text-body-sm text-brand-gray ${className}`}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        {label ?? '加载中…'}
      </span>
    );
  }

  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {shape === 'list' && <SkeletonList rows={rows} />}
      {shape === 'card' && <SkeletonCard />}
      {shape === 'thread' && <SkeletonThread />}
      {shape === 'rows' && <SkeletonRows rows={rows} />}
      <span className="sr-only">{label ?? '加载中'}</span>
    </div>
  );
};

export default LoadingState;
