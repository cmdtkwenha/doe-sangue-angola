import { StyleSheet, Text, View } from "react-native";
import { NativeRetryButton } from "./NativeRetryButton";

export function NativeErrorState({
  message,
  onRetry,
  title
}: {
  message: string;
  onRetry?: () => void;
  title: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>!</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <NativeRetryButton onRetry={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    gap: 10,
    padding: 18
  },
  icon: {
    color: "#b10f1f",
    fontSize: 26,
    fontWeight: "900"
  },
  message: {
    color: "#6f737b",
    lineHeight: 20
  },
  title: {
    color: "#151515",
    fontSize: 18,
    fontWeight: "900"
  }
});
