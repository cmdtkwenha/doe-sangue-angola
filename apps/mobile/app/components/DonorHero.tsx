import type { Donor } from "@doe-sangue-angola/shared-types";
import { StyleSheet, Text, View } from "react-native";

export function DonorHero({
  donor,
  unreadCount = 0
}: {
  donor: Donor;
  unreadCount?: number;
}) {
  return (
    <View style={styles.hero}>
      <View>
        <Text style={styles.kicker}>Ola, {donor.name.split(" ")[0]}</Text>
        <Text style={styles.title}>Pronto para salvar vidas em Angola</Text>
      </View>
      <View style={styles.badgeRow}>
        <View style={styles.bloodBadge}>
          <Text style={styles.bloodText}>{donor.bloodType}</Text>
        </View>
        {unreadCount > 0 ? (
          <View style={styles.notifyBadge}>
            <Text style={styles.notifyText}>{unreadCount} novas</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#151515",
    borderRadius: 28,
    padding: 22,
    minHeight: 170,
    justifyContent: "space-between"
  },
  kicker: {
    color: "#d7aa3f",
    fontWeight: "800"
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
    marginTop: 10,
    maxWidth: 260
  },
  bloodBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#b10f1f",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  bloodText: {
    color: "white",
    fontWeight: "900"
  },
  badgeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  notifyBadge: {
    backgroundColor: "#d7aa3f",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  notifyText: {
    color: "#151515",
    fontSize: 12,
    fontWeight: "900"
  }
});
