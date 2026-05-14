import {
  defaultPushPreferences,
  updatePushPreferences,
  type PushCategory
} from "@doe-sangue-angola/shared-services";
import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

const labels: Record<PushCategory, string> = {
  emergency_request: "Pedido urgente",
  reminder: "Lembretes",
  appointment_reminder: "Agendamento",
  reward_unlocked: "Recompensas",
  family_emergency_request: "Pedido familiar"
};

export function NotificationPreferences({ donorId }: { donorId: string }) {
  const [prefs, setPrefs] = useState(defaultPushPreferences);
  const update = (key: PushCategory, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    void updatePushPreferences(donorId, next);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Preferências</Text>
      {(Object.keys(labels) as PushCategory[]).map((key) => (
        <View style={styles.row} key={key}>
          <Text style={styles.label}>{labels[key]}</Text>
          <Switch
            onValueChange={(value) => update(key, value)}
            thumbColor={prefs[key] ? "#d71920" : "#f4f4f5"}
            value={prefs[key]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    gap: 10,
    padding: 16
  },
  title: { color: "#151515", fontSize: 18, fontWeight: "900" },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  label: { color: "#252525", fontWeight: "800" }
});
