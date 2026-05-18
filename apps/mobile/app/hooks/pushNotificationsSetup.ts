import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

export const BLOOD_PUSH_TASK = "DOE_SANGUE_BACKGROUND_PUSH";

export const notificationCategories = {
  appointment: "appointment_reminder",
  emergency: "emergency_request",
  family: "family_emergency_request",
  reward: "reward_unlocked"
} as const;

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true
    })
  });
} catch {
  // Development builds without native notification support keep in-app alerts.
}

if (!TaskManager.isTaskDefined(BLOOD_PUSH_TASK)) {
  TaskManager.defineTask<Notifications.NotificationTaskPayload>(
    BLOOD_PUSH_TASK,
    async ({ data, error }) => {
      if (error) return Notifications.BackgroundNotificationTaskResult.Failed;
      const raw = data as {
        category?: string;
        notification?: { request?: { content?: { data?: { category?: string } } } } | null;
      };
      const payload = raw.notification?.request?.content?.data ?? raw;

      if (payload?.category === notificationCategories.emergency) {
        return Notifications.BackgroundNotificationTaskResult.NewData;
      }

      return Notifications.BackgroundNotificationTaskResult.NoData;
    }
  );
}

export async function configureNotificationCategories() {
  try {
    await Notifications.setNotificationCategoryAsync(notificationCategories.emergency, [
      {
        buttonTitle: "Ver pedido",
        identifier: "VIEW_REQUEST",
        options: { opensAppToForeground: true }
      },
      {
        buttonTitle: "Aceitar",
        identifier: "ACCEPT_REQUEST",
        options: { opensAppToForeground: true }
      }
    ]);
    await Notifications.setNotificationCategoryAsync(notificationCategories.appointment, [
      {
        buttonTitle: "Ver PIN",
        identifier: "VIEW_PIN",
        options: { opensAppToForeground: true }
      }
    ]);
    await Notifications.setNotificationCategoryAsync(notificationCategories.reward, [
      {
        buttonTitle: "Ver recompensa",
        identifier: "VIEW_REWARD",
        options: { opensAppToForeground: true }
      }
    ]);
    await Notifications.setNotificationCategoryAsync(notificationCategories.family, [
      {
        buttonTitle: "Responder",
        identifier: "RESPOND_FAMILY",
        options: { opensAppToForeground: true }
      }
    ]);
  } catch {
    return;
  }
}

export async function registerBackgroundNotificationTask() {
  try {
    const registered = await TaskManager.isTaskRegisteredAsync(BLOOD_PUSH_TASK);
    if (!registered) await Notifications.registerTaskAsync(BLOOD_PUSH_TASK);
  } catch {
    return;
  }
}
