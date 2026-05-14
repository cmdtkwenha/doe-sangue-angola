import type { Donor } from "@doe-sangue-angola/shared-types";
import { StyleSheet, Text, View } from "react-native";

export function DigitalCard({ donor, pin }: { donor: Donor; pin?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Cartao digital</Text>
      <Text style={styles.name}>{donor.name}</Text>
      <View style={styles.row}>
        <Text style={styles.blood}>{donor.bloodType}</Text>
        <Text style={styles.pin}>PIN {pin ?? "----"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#151515",
    borderRadius: 22,
    padding: 18
  },
  label: {
    color: "#d7aa3f",
    fontWeight: "900",
    textTransform: "uppercase"
  },
  name: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 8
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18
  },
  blood: {
    color: "white",
    fontWeight: "900"
  },
  pin: {
    color: "#d7aa3f",
    fontWeight: "900"
  }
});
