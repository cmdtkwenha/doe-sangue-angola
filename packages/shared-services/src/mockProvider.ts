import type { BloodRequest, UserRole } from "@doe-sangue-angola/shared-types";
import { appointments, auditLogs, donors, requests } from "./mockStore";
import { mockRepositories } from "./repositories/mockRepositories";

// TODO(production): keep this provider for demos only; production reads must use repositories.
export type CreateRequestInput = Omit<BloodRequest, "createdAt" | "id" | "status">;
type MaybePromise<T> = T | Promise<T>;
type CreateUserInput = {
  authUserId?: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
};

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
  createUser: (input: CreateUserInput) => MaybePromise<unknown>;
  findUserByEmail: (email: string) => MaybePromise<unknown>;
  listUsers: () => MaybePromise<unknown>;
  listAppointments: () => MaybePromise<unknown>;
  listAppointmentsForDonor: (donorId: string) => MaybePromise<unknown>;
  listAppointmentsForHospital: (hospitalId: string) => MaybePromise<unknown>;
  listAuditLogs: () => MaybePromise<unknown>;
  listDonors: () => MaybePromise<unknown>;
  listHospitals: () => MaybePromise<unknown>;
  listNotifications: (donorId: string) => MaybePromise<unknown>;
  listRequests: () => MaybePromise<unknown>;
  listRequestsForDonor: (donorId: string) => MaybePromise<unknown>;
  listRequestsForHospital: (hospitalId: string) => MaybePromise<unknown>;
  listRewards: () => MaybePromise<unknown>;
  listRewardsForDonor: (donorId: string) => MaybePromise<unknown>;
  updateRequestStatus: (
    requestId: string,
    status: BloodRequest["status"]
  ) => MaybePromise<unknown>;
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
  createUser: (input) => ({
    id: `user-${input.email}`,
    authUserId: input.authUserId,
    ...input,
    createdAt: new Date().toISOString()
  }),
  findUserByEmail: (email) => ({
    id: `user-${email}`,
    email,
    name: "Utilizador Demo",
    phone: "",
    role: "donor"
  }),
  listUsers: () => donors.map((donor) => ({
    id: `user-${donor.id}`,
    email: `${donor.id}@demo.sangueangola.ao`,
    name: donor.name,
    phone: "",
    role: "donor"
  })),
  listAppointments: () => appointments,
  listAppointmentsForDonor: (donorId) =>
    appointments.filter((item) => item.donorId === donorId),
  listAppointmentsForHospital: (hospitalId) =>
    appointments.filter((item) => item.hospitalId === hospitalId),
  listAuditLogs: () => auditLogs,
  listDonors: mockRepositories.donor.listDonors,
  listHospitals: mockRepositories.hospital.listHospitals,
  listNotifications: mockRepositories.notification.listNotifications,
  listRequests: mockRepositories.request.listRequests,
  listRequestsForDonor: (donorId) => {
    const donor = donors.find((item) => item.id === donorId) ?? donors[0];
    return requests.filter((request) =>
      request.bloodType === donor.bloodType || request.status === "Aberto"
    );
  },
  listRequestsForHospital: mockRepositories.request.listRequestsForHospital,
  listRewards: () => donors.map((donor) => ({
    id: `reward-${donor.id}`,
    donorId: donor.id,
    points: donor.points,
    reason: "Progresso mock",
    tier: "",
    createdAt: new Date().toISOString()
  })),
  listRewardsForDonor: (donorId) => [{
    id: `reward-${donorId}`,
    donorId,
    points: donors.find((item) => item.id === donorId)?.points ?? 0,
    reason: "Progresso mock",
    tier: "",
    createdAt: new Date().toISOString()
  }],
  updateRequestStatus: mockRepositories.request.updateRequestStatus,
  validatePin: mockRepositories.request.validatePin
};
