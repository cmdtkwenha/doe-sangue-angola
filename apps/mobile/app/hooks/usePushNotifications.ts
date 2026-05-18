import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { getPushMode } from "@doe-sangue-angola/shared-services";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { registerTokenWithBackend } from "./pushApi";
import {
  configureNotificationCategories,
  registerBackgroundNotificationTask
} from "./pushNotificationsSetup";

export function usePushNotifications(donorId: string) {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [permissionStatus, setPermissionStatus] = useState("A verificar");
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const runningInExpoGo = isExpoGo();
  const mockPush = getPushMode() !== "expo";

  useEffect(() => {
    if (mockPush || runningInExpoGo) {
      setPermissionStatus(
        runningInExpoGo
          ? "Notificações push reais precisam de uma development build. No Expo Go, usamos notificações simuladas."
          : "Notificações simuladas ativas neste ambiente."
      );
      return;
    }

    const received = Notifications.addNotificationReceivedListener(() => {
      void Notifications.setBadgeCountAsync(1).catch(() => undefined);
    });
    const response = Notifications.addNotificationResponseReceivedListener(() => {
      void Notifications.setBadgeCountAsync(0).catch(() => undefined);
    });

    void checkPermissionOnly();
    return () => {
      received.remove();
      response.remove();
    };
  }, [donorId, mockPush, runningInExpoGo]);

  async function registerForPush() {
    try {
      setRegistering(true);
      setError(null);
      if (runningInExpoGo) {
        setPermissionStatus(
          "Notificações push reais precisam de uma development build. No Expo Go, usamos notificações simuladas."
        );
        setExpoPushToken("");
        return;
      }
      if (mockPush) {
        setPermissionStatus("Notificações simuladas ativas neste ambiente.");
        return;
      }

      if (!Device.isDevice) {
        setPermissionStatus("Use um dispositivo físico para push real.");
        return;
      }

      const permission = await ensurePermission();
      setPermissionStatus(permission);
      if (permission !== "granted") return;

      await configureNotificationCategories();
      await registerBackgroundNotificationTask();

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("blood-alerts", {
          name: "Alertas de Sangue",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#d71920"
        });
      }

      const projectId = getProjectId();
      if (!projectId) {
        setPermissionStatus("Projeto EAS em falta. Push real fica desativado.");
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync(
        { projectId }
      )).data;
      setExpoPushToken(token);
      await registerTokenWithBackend({
        donorId,
        token,
        platform: Platform.OS === "ios" || Platform.OS === "android"
          ? Platform.OS
          : "unknown"
      });
    } catch {
      setError("Não foi possível ativar notificações push.");
    } finally {
      setRegistering(false);
    }
  }

  async function checkPermissionOnly() {
    try {
      const current = await Notifications.getPermissionsAsync();
      setPermissionStatus(current.status);
    } catch {
      setPermissionStatus("Notificações indisponíveis neste dispositivo.");
    }
  }

  return {
    error,
    expoPushToken,
    mockPush,
    permissionStatus,
    registerForPush,
    registering,
    runningInExpoGo
  };
}

async function ensurePermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return "granted";

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status;
}

function getProjectId() {
  const constants = Constants as unknown as {
    easConfig?: { projectId?: string };
    expoConfig?: { extra?: { eas?: { projectId?: string } } };
  };

  return constants.easConfig?.projectId ?? constants.expoConfig?.extra?.eas?.projectId;
}

function isExpoGo() {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient &&
    Constants.appOwnership === "expo";
}
