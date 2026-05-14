import type { Appointment, BloodRequest, Donor, Hospital } from "@doe-sangue-angola/shared-types";
import type { MockNotification } from "./notificationService";

export type RealtimeEventName =
  | "REQUEST_CREATED"
  | "REQUEST_UPDATED"
  | "DONOR_MATCHED"
  | "DONOR_ACCEPTED"
  | "APPOINTMENT_CREATED"
  | "PIN_VALIDATED"
  | "REQUEST_COMPLETED"
  | "HOSPITAL_VERIFIED"
  | "FRAUD_FLAGGED"
  | "NOTIFICATION_SENT";

export type RealtimePayload = {
  APPOINTMENT_CREATED: { appointment: Appointment };
  DONOR_ACCEPTED: { donorId: string; requestId: string };
  DONOR_MATCHED: { donors: Donor[]; requestId: string };
  FRAUD_FLAGGED: { flags: string[]; requestId: string; risk: string };
  HOSPITAL_VERIFIED: { hospital: Hospital };
  NOTIFICATION_SENT: { donorId: string; notification: MockNotification };
  PIN_VALIDATED: { appointment: Appointment; pin: string };
  REQUEST_COMPLETED: { donorId: string; requestId: string; rewardPoints: number };
  REQUEST_CREATED: { request: BloodRequest };
  REQUEST_UPDATED: { request: BloodRequest };
};

export type RealtimeEvent<T extends RealtimeEventName = RealtimeEventName> = {
  id: string;
  name: T;
  payload: RealtimePayload[T];
  timestamp: string;
};

export type RealtimeHandler<T extends RealtimeEventName = RealtimeEventName> = (
  event: RealtimeEvent<T>
) => void;
