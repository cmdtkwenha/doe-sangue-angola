import { rewardAgent } from "@doe-sangue-angola/agents";
import type { AppRepositories } from "../interfaces";
import { acceptRequest, validatePin } from "../appointmentService";
import { recordAudit } from "../auditService";
import { createInAppNotification, listNotifications } from "../notificationService";
import {
  createBloodRequest,
  listRequests,
  listRequestsForHospital,
  updateRequestStatus
} from "../requestService";
import { donors, hospitals } from "../mockStore";

export const mockRepositories: AppRepositories = {
  audit: { createAuditLog: recordAudit },
  donor: {
    addRewardPoints: (donorId, points) => {
      const donor = donors.find((item) => item.id === donorId) ?? donors[0];
      const reward = rewardAgent(donor, true);
      donor.points = Math.max(donor.points + points, reward.currentPoints);
      return donor;
    },
    findDonor: (id) => donors.find((item) => item.id === id),
    listDonors: () => donors
  },
  hospital: {
    getHospital: (id) => hospitals.find((item) => item.id === id),
    listHospitals: () => hospitals
  },
  notification: {
    createNotification: (input) =>
      createInAppNotification(input.donorId, input.title, input.body, input.type),
    listNotifications
  },
  request: {
    acceptRequest: (donorId, requestId) => acceptRequest(donorId, requestId).appointment,
    completeRequest: (donorId, requestId) => {
      mockRepositories.donor.addRewardPoints(donorId, 120);
      return updateRequestStatus(requestId, "Concluído");
    },
    createRequest: (input) => createBloodRequest(input).request,
    listRequests,
    listRequestsForHospital,
    updateRequestStatus,
    validatePin: (pin) => validatePin(pin).appointment
  }
};
