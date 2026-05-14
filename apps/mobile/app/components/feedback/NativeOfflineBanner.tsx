import { StyleSheet, Text, View } from "react-native";

export function NativeOfflineBanner({ offline = false }: { offline?: boolean }) {
  if (!offline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Está sem ligação. Os dados serão sincronizados quando a internet voltar.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#fff0f1",
    borderColor: "#f1cfd3",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12
  },
  text: {
    color: "#8f0d1a",
    fontWeight: "800"
  }
});
