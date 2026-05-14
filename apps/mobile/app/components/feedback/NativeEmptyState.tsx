import { StyleSheet, Text, View } from "react-native";

export function NativeEmptyState({
  message,
  title
}: {
  message: string;
  title: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>0</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    gap: 8,
    padding: 18
  },
  icon: {
    color: "#d7aa3f",
    fontSize: 24,
    fontWeight: "900"
  },
  message: {
    color: "#6f737b"
  },
  title: {
    color: "#151515",
    fontSize: 18,
    fontWeight: "900"
  }
});
