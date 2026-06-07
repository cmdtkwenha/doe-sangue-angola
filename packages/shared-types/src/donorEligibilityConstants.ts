export const DONOR_ELIGIBILITY_STATUS = {
  ELEGIVEL: "Elegível",
  INELEGIVEL: "Inelegível",
  PENDENTE: "Pendente",
  REVISAO_NECESSARIA: "Revisão Necessária",
  TEMPORARIAMENTE_INELEGIVEL: "Temporariamente Inelegível"
} as const;

export const DONOR_ELIGIBILITY_STATUSES = Object.values(DONOR_ELIGIBILITY_STATUS);

export type DonorEligibilityStatus = (typeof DONOR_ELIGIBILITY_STATUSES)[number];

export function isDonorEligibilityStatus(value: unknown): value is DonorEligibilityStatus {
  return DONOR_ELIGIBILITY_STATUSES.includes(value as DonorEligibilityStatus);
}
