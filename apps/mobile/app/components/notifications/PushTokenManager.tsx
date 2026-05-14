import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePushNotifications } from "../../hooks/usePushNotifications";

export function PushTokenManager({ donorId }: { donorId: string }) {
  const push = usePushNotifications(donorId);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Notificações Push</Text>
      <Text style={styles.text}>Estado: {push.permissionStatus}</Text>
      {push.runningInExpoGo ? (
        <Text style={styles.mock}>Modo simulado ativo para Expo Go.</Text>
      ) : (
        <Text style={styles.token} numberOfLines={1}>
          {push.expoPushToken || "Token ainda não registado"}
        </Text>
      )}
      {push.error ? <Text style={styles.error}>{push.error}</Text> : null}
      <TouchableOpacity
        disabled={push.runningInExpoGo}
        style={[styles.button, push.runningInExpoGo && styles.buttonDisabled]}
        onPress={push.registerForPush}
      >
        <Text style={styles.buttonText}>Ativar notificações</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    gap: 8,
    padding: 16
  },
  title: { color: "#151515", fontSize: 18, fontWeight: "900" },
  text: { color: "#6f737b" },
  mock: { color: "#087443", fontSize: 12, fontWeight: "800" },
  token: { color: "#a90f18", fontSize: 12, fontWeight: "800" },
  error: { color: "#b10f1f", fontWeight: "800" },
  button: {
    alignItems: "center",
    backgroundColor: "#d71920",
    borderRadius: 12,
    minHeight: 44,
    justifyContent: "center"
  },
  buttonDisabled: { backgroundColor: "#c9ced6" },
  buttonText: { color: "white", fontWeight: "900" }
});
