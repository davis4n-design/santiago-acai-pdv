import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-white">Ops, algo inesperado ocorreu</h1>
            <p className="text-xs text-slate-300">
              {this.state.error?.message || 'Ocorreu uma falha visual no terminal.'}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recarregar Terminal</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
