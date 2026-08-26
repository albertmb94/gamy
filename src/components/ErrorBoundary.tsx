import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Error Boundary global: evita que un dato malformado (p. ej. una fila
 * remota corrupta) tumbe toda la PWA a pantalla blanca.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
        <div className="text-5xl mb-4">🃏</div>
        <h1 className="text-xl font-extrabold tracking-tight mb-2">Algo ha ido mal</h1>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          La app encontró un error inesperado. Recarga para continuar.
        </p>
        {this.state.message && (
          <pre className="text-[11px] text-muted-foreground bg-secondary rounded-lg p-3 mb-4 max-w-full overflow-auto">
            {this.state.message}
          </pre>
        )}
        <button onClick={this.handleReload} className="btn btn-primary px-6 py-3">
          Recargar
        </button>
      </div>
    );
  }
}
