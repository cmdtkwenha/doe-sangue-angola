import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { dataProvider } from "@doe-sangue-angola/shared-services";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useState } from "react";
import { AppointmentCard } from "./components/AppointmentCard";
import { DigitalCard } from "./components/DigitalCard";
import { DonorHero } from "./components/DonorHero";
import { EligibilityCard } from "./components/EligibilityCard";
import {
  EmptyState,
  ErrorBoundary,
  ErrorState,
  LoadingState,
  OfflineBanner
} from "./components/feedback";
import { FeatureGrid } from "./components/FeatureGrid";
import { NotificationPreferences } from "./components/notifications/NotificationPreferences";
import { PushTokenManager } from "./components/notifications/PushTokenManager";
import { NativeRequestCard } from "./components/NativeRequestCard";
import { useMobileStartup } from "./hooks/useMobileStartup";
import "./hooks/pushNotificationsSetup";

export default function App() {
  return (
    <ErrorBoundary>
      <DonorApp />
    </ErrorBoundary>
  );
}

function DonorApp() {
  const { error, home, loading, offline, refresh } = useMobileStartup("d1");
  const [actionMessage, setActionMessage] = useState("");
  const [busyRequestId, setBusyRequestId] = useState("");

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.content}>
          <LoadingState label="A preparar o app Doe Sangue Angola" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !home) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.content}>
          <ErrorState message={error} title="Arranque interrompido" />
        </View>
      </SafeAreaView>
    );
  }

  if (!home?.donor?.id) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.content}>
          <EmptyState
            message="Complete o onboarding para criar o seu perfil de dador."
            title="Perfil ainda não configurado."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <OfflineBanner offline={offline} />
        {error ? <ErrorState message={error} title="Dados em modo seguro" /> : null}
        <DonorHero donor={home.donor} unreadCount={home.unreadCount} />
        {actionMessage ? <Text style={styles.notice}>{actionMessage}</Text> : null}
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
            <NativeRequestCard
              busy={busyRequestId === request.id}
              key={request.id}
              onAccept={() => acceptRequest(home.donor.id, request)}
              onReject={() => rejectRequest(home.donor.id, request)}
              request={request}
            />
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

  async function acceptRequest(donorId: string, request: BloodRequest) {
    setBusyRequestId(request.id);
    setActionMessage("");
    try {
      await dataProvider.acceptRequest(donorId, request.id);
      setActionMessage("Pedido aceite. O hospital já consegue ver o seu PIN.");
      refresh();
    } catch {
      setActionMessage("Não foi possível aceitar o pedido. Tente novamente.");
    } finally {
      setBusyRequestId("");
    }
  }

  async function rejectRequest(donorId: string, request: BloodRequest) {
    setBusyRequestId(request.id);
    try {
      await dataProvider.createAuditLog("Dador Mobile", `Recusou pedido ${request.id}`);
      setActionMessage("Pedido recusado. Continuaremos a mostrar pedidos compatíveis.");
      refresh();
    } catch {
      setActionMessage("Não foi possível registar a recusa.");
    } finally {
      setBusyRequestId("");
    }
  }
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
  notice: {
    backgroundColor: "#fff3f0",
    borderColor: "#f1cfd3",
    borderRadius: 14,
    borderWidth: 1,
    color: "#b10f1f",
    fontWeight: "800",
    padding: 12
  },
  sectionTitle: {
    color: "#151515",
    fontSize: 21,
    fontWeight: "900"
  }
});
