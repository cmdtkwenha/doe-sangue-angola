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
    console.error("[ErrorBoundary] React render crash", {
      componentStack: info.componentStack,
      message: error.message,
      pathname: typeof window === "undefined" ? "server" : window.location.pathname
    });
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ padding: 24 }}>
          <ErrorState
            message="Perfil ainda não configurado."
            onRetry={() => this.setState({ error: null })}
            title="Não foi possível carregar esta área"
          />
        </main>
      );
    }

    return this.props.children;
  }
}
