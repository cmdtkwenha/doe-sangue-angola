import { Pressable, StyleSheet, Text } from "react-native";

export function NativeRetryButton({
  label = "Tentar novamente",
  onRetry
}: {
  label?: string;
  onRetry?: () => void;
}) {
  return (
    <Pressable onPress={onRetry} style={styles.button}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#b10f1f",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11
  },
  text: {
    color: "white",
    fontWeight: "900"
  }
});
