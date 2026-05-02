import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { CustomerProvider } from '../lib/CustomerContext';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App crashed:', error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.hash = '#/';
    window.location.reload();
  };

  private handleCopyStack = async () => {
    const stack = this.state.error?.stack ?? this.state.error?.message ?? '';
    try {
      await navigator.clipboard.writeText(stack);
    } catch {
      // ignore — clipboard might be unavailable
    }
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      const message = this.state.error?.message || '未知错误';
      const stack = this.state.error?.stack ?? '';
      return (
        <div className="min-h-screen bg-brand-offwhite flex items-center justify-center px-6 py-12">
          <div className="apple-card w-full max-w-md p-8 flex flex-col items-center gap-5 text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center" aria-hidden>
              <span className="text-3xl">⚠️</span>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-h2 text-brand-dark">页面遇到了一点问题</h1>
              <p className="text-body-sm text-brand-gray">
                {message}
              </p>
              <p className="text-caption">刷新通常可以解决，多次失败请稍后再试。</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-brand-dark text-white text-sm font-medium hover:bg-brand-dark/90 active:scale-[0.97] transition"
              >
                重新加载
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-brand-light-gray text-brand-dark text-sm font-medium hover:bg-brand-border/60 active:scale-[0.97] transition"
              >
                返回首页
              </button>
            </div>
            {isDev && stack && (
              <details className="w-full text-left mt-2">
                <summary className="text-caption cursor-pointer select-none hover:text-brand-dark">
                  查看错误栈（仅开发态）
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-brand-light-gray p-3 text-[11px] leading-relaxed text-brand-dark/80 whitespace-pre-wrap break-all">
                  {stack}
                </pre>
                <button
                  type="button"
                  onClick={this.handleCopyStack}
                  className="mt-2 text-caption underline hover:text-brand-dark"
                >
                  复制错误信息
                </button>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <CustomerProvider>
        <App />
      </CustomerProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
