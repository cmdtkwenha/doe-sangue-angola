import { StyleSheet, Text, View } from "react-native";

const features = [
  "Elegibilidade",
  "Recompensas",
  "Referencias",
  "Historico",
  "Partilhar",
  "Emergencia familiar"
];

export function FeatureGrid() {
  return (
    <View style={styles.grid}>
      {features.map((feature) => (
        <View style={styles.item} key={feature}>
          <Text style={styles.text}>{feature}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  item: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#efe6db"
  },
  text: {
    color: "#151515",
    fontWeight: "800"
  }
});
