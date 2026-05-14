"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { ErrorState } from "./ErrorState";

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro recuperável na interface", { error, info });
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ padding: 24 }}>
          <ErrorState
            message="A interface encontrou um problema inesperado. Os dados estão protegidos."
            onRetry={() => this.setState({ error: null })}
            title="Não foi possível carregar esta área"
          />
        </main>
      );
    }

    return this.props.children;
  }
}
