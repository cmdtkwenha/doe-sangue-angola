import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { mockRepositories } from "./repositories/mockRepositories";

// TODO(production): keep this provider for demos only; production reads must use repositories.
export type CreateRequestInput = Omit<BloodRequest, "createdAt" | "id" | "status">;
type MaybePromise<T> = T | Promise<T>;

export type DataProvider = {
  acceptRequest: (donorId: string, requestId: string) => MaybePromise<unknown>;
  createAuditLog: (actor: string, action: string) => MaybePromise<unknown>;
  createNotification: (
    donorId: string,
    title: string,
    body: string
  ) => MaybePromise<unknown>;
  createRequest: (input: CreateRequestInput) => MaybePromise<unknown>;
  completeRequest: (donorId: string, requestId: string) => MaybePromise<unknown>;
  listDonors: () => MaybePromise<unknown>;
  listHospitals: () => MaybePromise<unknown>;
  listNotifications: (donorId: string) => MaybePromise<unknown>;
  listRequests: () => MaybePromise<unknown>;
  validatePin: (pin: string) => MaybePromise<unknown>;
};

export const mockProvider: DataProvider = {
  acceptRequest: mockRepositories.request.acceptRequest,
  createAuditLog: mockRepositories.audit.createAuditLog,
  createNotification: (donorId, title, body) =>
    mockRepositories.notification.createNotification({
      donorId,
      title,
      body,
      type: "urgent"
    }),
  createRequest: mockRepositories.request.createRequest,
  completeRequest: mockRepositories.request.completeRequest,
  listDonors: mockRepositories.donor.listDonors,
  listHospitals: mockRepositories.hospital.listHospitals,
  listNotifications: mockRepositories.notification.listNotifications,
  listRequests: mockRepositories.request.listRequests,
  validatePin: mockRepositories.request.validatePin
};
