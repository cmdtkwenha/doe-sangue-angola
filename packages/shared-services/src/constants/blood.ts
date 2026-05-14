import type { BloodType } from "@doe-sangue-angola/shared-types";

export const bloodTypes: BloodType[] = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+"
];

export const criticalBloodTypes: BloodType[] = ["O-", "O+", "A-"];

export const minimumStockByType: Record<BloodType, number> = {
  "O-": 20,
  "O+": 40,
  "A-": 16,
  "A+": 32,
  "B-": 12,
  "B+": 24,
  "AB-": 8,
  "AB+": 12
};
