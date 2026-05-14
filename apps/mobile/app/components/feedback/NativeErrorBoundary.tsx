import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { NativeErrorState } from "./NativeErrorState";

export class NativeErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state: { failed: boolean } = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro recuperável no app móvel", { error, info });
  }

  render() {
    if (this.state.failed) {
      return (
        <SafeAreaView style={styles.safe}>
          <NativeErrorState
            message="O app encontrou um problema temporário. Pode recuperar sem perder os seus dados."
            onRetry={() => this.setState({ failed: false })}
            title="Não foi possível abrir esta área"
          />
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#faf7f2",
    flex: 1,
    padding: 18
  }
});
