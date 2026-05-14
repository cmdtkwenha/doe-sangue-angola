import { StyleSheet, Text, View } from "react-native";

export function NativeLoadingState({ label = "A carregar dados" }: { label?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{label}</Text>
      <View style={styles.line} />
      <View style={[styles.line, styles.short]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    gap: 12,
    padding: 18
  },
  line: {
    backgroundColor: "#edf0f4",
    borderRadius: 999,
    height: 12,
    width: "88%"
  },
  short: {
    width: "52%"
  },
  title: {
    color: "#151515",
    fontWeight: "900"
  }
});
