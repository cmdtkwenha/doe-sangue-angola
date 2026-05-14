import { eligibilityAgent } from "@doe-sangue-angola/agents";
import { StyleSheet, Text, View } from "react-native";

export function EligibilityCard() {
  const result = eligibilityAgent({
    feelingSick: false,
    weightOk: true,
    recentTravel: false,
    medication: false,
    lastDonationOk: true
  });

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Triagem rapida</Text>
      <Text style={styles.title}>{result.message}</Text>
      <Text style={styles.copy}>Questionario preparado para validacao clinica.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff3f0",
    borderRadius: 18,
    padding: 16
  },
  label: {
    color: "#b10f1f",
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    color: "#151515",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 8
  },
  copy: {
    color: "#6f737b",
    marginTop: 6
  }
});
