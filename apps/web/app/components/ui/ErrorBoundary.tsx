"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { ErrorState } from "./ErrorState";

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { componentStack: string; error: Error | null }
> {
  state: { componentStack: string; error: Error | null } = {
    componentStack: "",
    error: null
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ componentStack: info.componentStack ?? "" });
    console.error("[ErrorBoundary] React render crash", {
      componentStack: info.componentStack,
      message: error.message,
      pathname: typeof window === "undefined" ? "server" : window.location.pathname
    });
  }

  render() {
    if (this.state.error) {
      const isDevelopment = process.env.NODE_ENV !== "production";
      const error = this.state.error;

      return (
        <main style={{ padding: 24 }}>
          <ErrorState
            message="Perfil ainda não configurado."
            onRetry={() => this.setState({ error: null })}
            title="Não foi possível carregar esta área"
          />
          {isDevelopment ? (
            <pre style={{
              background: "#111827",
              borderRadius: 12,
              color: "#f8fafc",
              marginTop: 16,
              overflow: "auto",
              padding: 16,
              whiteSpace: "pre-wrap"
            }}>
              {[
                `Mensagem: ${error.message}`,
                this.state.componentStack ? `Component stack:\n${this.state.componentStack}` : "",
                error.stack ? `Stack:\n${error.stack}` : ""
              ].filter(Boolean).join("\n\n") || "Sem stack disponível."}
            </pre>
          ) : null}
        </main>
      );
    }

    return this.props.children;
  }
}
