import { getDataMode } from "../config";
import { donorRepository } from "./donorRepository";
import { requestRepository } from "./requestRepository";
import { hospitalRepository } from "./hospitalRepository";
import { notificationRepository } from "./notificationRepository";
import { auditRepository } from "./auditRepository";
import { mockRepositories } from "./mockRepositories";
import type { AppRepositories } from "../interfaces";

const supabaseRepositories: AppRepositories = {
  audit: auditRepository,
  donor: donorRepository,
  hospital: hospitalRepository,
  notification: notificationRepository,
  request: requestRepository
};

export function getRepositories() {
  return getDataMode() === "supabase" ? supabaseRepositories : mockRepositories;
}
