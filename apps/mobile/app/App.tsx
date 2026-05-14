import { getDonorHome } from "@doe-sangue-angola/shared-services";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { AppointmentCard } from "./components/AppointmentCard";
import { DigitalCard } from "./components/DigitalCard";
import { DonorHero } from "./components/DonorHero";
import { EligibilityCard } from "./components/EligibilityCard";
import { EmptyState, ErrorBoundary, OfflineBanner } from "./components/feedback";
import { FeatureGrid } from "./components/FeatureGrid";
import { NotificationPreferences } from "./components/notifications/NotificationPreferences";
import { PushTokenManager } from "./components/notifications/PushTokenManager";
import { NativeRequestCard } from "./components/NativeRequestCard";
import "./hooks/pushNotificationsSetup";

export default function App() {
  return (
    <ErrorBoundary>
      <DonorApp />
    </ErrorBoundary>
  );
}

function DonorApp() {
  const home = getDonorHome("d1");

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <OfflineBanner />
        <DonorHero donor={home.donor} />
        <View style={styles.stats}>
          <Stat label="Pontos" value={String(home.donor.points)} />
          <Stat label="Estado" value={home.donor.available ? "Disponivel" : "Pausa"} />
        </View>
        <AppointmentCard appointment={home.appointment} />
        <DigitalCard donor={home.donor} pin={home.appointment?.pin} />
        <PushTokenManager donorId={home.donor.id} />
        <NotificationPreferences donorId={home.donor.id} />
        <EligibilityCard />
        <FeatureGrid />
        <Text style={styles.sectionTitle}>Pedidos perto de si</Text>
        {home.nearbyRequests.length > 0 ? (
          home.nearbyRequests.map((request) => (
            <NativeRequestCard key={request.id} request={request} />
          ))
        ) : (
          <EmptyState
            message="Avisaremos assim que surgir um pedido compatível perto de si."
            title="Sem pedidos disponíveis"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7f8fb"
  },
  content: {
    padding: 20,
    gap: 18
  },
  stats: {
    flexDirection: "row",
    gap: 12
  },
  stat: {
    flex: 1,
    backgroundColor: "white",
    borderColor: "#edf0f4",
    borderRadius: 18,
    borderWidth: 1,
    padding: 17,
    shadowColor: "#111820",
    shadowOpacity: 0.07,
    shadowRadius: 16
  },
  statValue: {
    color: "#151515",
    fontSize: 22,
    fontWeight: "900"
  },
  statLabel: {
    color: "#6f737b",
    marginTop: 4
  },
  sectionTitle: {
    color: "#151515",
    fontSize: 21,
    fontWeight: "900"
  }
});
