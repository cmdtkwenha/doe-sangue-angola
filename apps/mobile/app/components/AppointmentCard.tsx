import type { Appointment } from "@doe-sangue-angola/shared-types";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton } from "./ActionButton";

export function AppointmentCard({ appointment }: { appointment?: Appointment }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Proxima doacao</Text>
      <Text style={styles.title}>
        {appointment ? `${appointment.date} · ${appointment.time}` : "Sem marcacao"}
      </Text>
      <Text style={styles.copy}>
        {appointment
          ? "Chegue 15 minutos antes para triagem clinica."
          : "Escolha um hospital e reserve um horario."}
      </Text>
      <ActionButton label={appointment ? "Ver detalhes" : "Marcar doacao"} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    gap: 10
  },
  label: {
    color: "#7a6a56",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
    color: "#151515",
    fontSize: 22,
    fontWeight: "900"
  },
  copy: {
    color: "#6f737b",
    lineHeight: 20
  }
});
