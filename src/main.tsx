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

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#050505',
          color: '#00ff41',
          fontFamily: 'monospace',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💀</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>SYSTEM ERROR</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#ff4444' }}>
            {this.state.error?.message || '未知错误'}
          </div>
          <div style={{ fontSize: '0.7rem', opacity: 0.4, maxWidth: '600px', wordBreak: 'break-all', marginBottom: '2rem' }}>
            {this.state.error?.stack?.split('\n').slice(0, 3).join('\n')}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#00ff41',
              color: '#000',
              border: 'none',
              padding: '0.5rem 1.5rem',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: '0.8rem'
            }}
          >
            重新加载
          </button>
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
