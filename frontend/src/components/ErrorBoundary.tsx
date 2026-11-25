import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center rounded-card border border-rose-200 bg-rose-50/50 p-6 text-center text-ink shadow-card">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-ink">
            {this.props.fallbackTitle || 'Terjadi Gangguan Komponen'}
          </h3>
          <p className="mt-1 max-w-md text-xs text-graphite">
            Komponen ini mengalami kesalahan sementara. Anda dapat memuat ulang komponen atau me-refresh peramban.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-4 flex items-center gap-1.5 rounded-btn bg-deep-teal px-4 py-2 text-xs font-semibold text-white shadow-subtle hover:bg-deep-teal-hover transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Coba Muat Ulang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
