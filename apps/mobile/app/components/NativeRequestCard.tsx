import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton } from "./ActionButton";

export function NativeRequestCard({
  busy,
  onAccept,
  onReject,
  request
}: {
  busy?: boolean;
  onAccept?: (request: BloodRequest) => void;
  onReject?: (request: BloodRequest) => void;
  request: BloodRequest;
}) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.label}>{request.urgency}</Text>
        <Text style={styles.title}>{request.bloodType}</Text>
        <Text style={styles.copy}>
          {request.units} unidades necessarias · {request.patientCode}
        </Text>
      </View>
      <View style={styles.actions}>
        <ActionButton
          label={busy ? "A registar..." : "Aceitar"}
          onPress={() => onAccept?.(request)}
          tone="primary"
        />
        <ActionButton
          label="Recusar"
          onPress={() => onReject?.(request)}
          tone="light"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderColor: "#f1cfd3",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 17,
    shadowColor: "#111820",
    shadowOpacity: 0.08,
    shadowRadius: 16
  },
  copy: {
    color: "#6f737b",
    lineHeight: 20,
    marginVertical: 8
  },
  label: {
    color: "#b10f1f",
    fontSize: 12,
    fontWeight: "900"
  },
  actions: {
    gap: 10,
    marginTop: 6
  },
  title: {
    color: "#151515",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4
  }
});
