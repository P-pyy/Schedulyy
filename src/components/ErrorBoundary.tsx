import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Scheduly app:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#e9edff] shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-[#fee2e2] text-[#991b1b] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-[#141b2b] mb-2">Something went wrong</h2>
            <p className="text-sm text-[#464555] mb-6">
              {this.state.error?.message || 'An unexpected error occurred while loading Scheduly.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-[#3525cd] hover:bg-[#281ca8] text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
