import { Pressable, Text, StyleSheet } from "react-native";

type ActionButtonProps = {
  label: string;
  onPress?: () => void;
  tone?: "primary" | "light";
};

export function ActionButton({ label, onPress, tone = "primary" }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.button, tone === "light" && styles.light]}
    >
      <Text style={[styles.text, tone === "light" && styles.lightText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#b10f1f",
    borderRadius: 14,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    shadowColor: "#b10f1f",
    shadowOpacity: 0.18,
    shadowRadius: 12
  },
  light: {
    backgroundColor: "#fff3f0"
  },
  text: {
    color: "white",
    fontWeight: "800",
    textAlign: "center"
  },
  lightText: {
    color: "#b10f1f"
  }
});
