import type {
  Appointment,
  AuditLog,
  BloodRequest,
  Donor,
  Hospital
} from "@doe-sangue-angola/shared-types";
import type { MockNotification, NotificationType } from "../notificationService";

export type RepositoryCreateRequestInput = Omit<BloodRequest, "createdAt" | "id" | "status">;

export type RequestRepositoryInterface = {
  acceptRequest: (
    donorId: string,
    requestId: string
  ) => Promise<Appointment | undefined> | Appointment | undefined;
  createRequest: (input: RepositoryCreateRequestInput) => Promise<BloodRequest> | BloodRequest;
  completeRequest: (
    donorId: string,
    requestId: string
  ) => Promise<BloodRequest | undefined> | BloodRequest | undefined;
  listRequests: () => Promise<BloodRequest[]> | BloodRequest[];
  listRequestsForHospital: (hospitalId: string) => Promise<BloodRequest[]> | BloodRequest[];
  updateRequestStatus: (
    id: string,
    status: BloodRequest["status"]
  ) => Promise<BloodRequest | undefined> | BloodRequest | undefined;
  validatePin: (pin: string) => Promise<Appointment | undefined> | Appointment | undefined;
};

export type DonorRepositoryInterface = {
  addRewardPoints: (donorId: string, points: number) => Promise<Donor> | Donor;
  findDonor: (id: string) => Promise<Donor | undefined> | Donor | undefined;
  listDonors: () => Promise<Donor[]> | Donor[];
};

export type HospitalRepositoryInterface = {
  getHospital: (id: string) => Promise<Hospital | undefined> | Hospital | undefined;
  listHospitals: () => Promise<Hospital[]> | Hospital[];
};

export type NotificationRepositoryInterface = {
  createNotification: (input: {
    body: string;
    donorId: string;
    title: string;
    type: NotificationType;
  }) => Promise<MockNotification> | MockNotification;
  listNotifications: (donorId: string) => Promise<MockNotification[]> | MockNotification[];
};

export type AuditRepositoryInterface = {
  createAuditLog: (actor: string, action: string) => Promise<AuditLog> | AuditLog;
};

export type AppRepositories = {
  audit: AuditRepositoryInterface;
  donor: DonorRepositoryInterface;
  hospital: HospitalRepositoryInterface;
  notification: NotificationRepositoryInterface;
  request: RequestRepositoryInterface;
};
