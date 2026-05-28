import { monitoringService } from "./monitoringService";

export type AnalyticsEventName =
  | "donation_completed"
  | "onboarding_completed"
  | "pin_validated"
  | "request_accepted"
  | "signup";

export function trackAnalyticsEvent(
  name: AnalyticsEventName,
  metadata?: Record<string, string | number | boolean>
) {
  return monitoringService({
    message: `Evento analytics: ${name}`,
    metadata,
    status: "ok",
    type: "USER_ACTION"
  });
}

export const analyticsEvents = {
  donationCompleted: (requestId: string) =>
    trackAnalyticsEvent("donation_completed", { requestId }),
  onboardingCompleted: (role: string) =>
    trackAnalyticsEvent("onboarding_completed", { role }),
  pinValidated: (requestId: string) =>
    trackAnalyticsEvent("pin_validated", { requestId }),
  requestAccepted: (requestId: string) =>
    trackAnalyticsEvent("request_accepted", { requestId }),
  signup: (role: string) => trackAnalyticsEvent("signup", { role })
};
