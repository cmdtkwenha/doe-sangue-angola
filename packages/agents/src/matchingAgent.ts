import type {
  BloodRequest,
  BloodType,
  Donor,
  MatchResult
} from "@doe-sangue-angola/shared-types";

const compatible: Record<BloodType, BloodType[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
};

export function matchingAgent(request: BloodRequest, donors: Donor[]): MatchResult[] {
  return donors
    .map((donor) => scoreDonor(request, donor))
    .sort((a, b) => b.score - a.score);
}

function scoreDonor(request: BloodRequest, donor: Donor): MatchResult {
  const reasons: string[] = [];
  let score = 0;

  if (compatible[request.bloodType].includes(donor.bloodType)) {
    score += 55;
    reasons.push("Tipo sanguineo compativel");
  }

  if (donor.available) {
    score += 25;
    reasons.push("Disponivel para contacto");
  }

  if (request.urgency === "Critica") {
    score += 10;
    reasons.push("Prioridade nacional critica");
  }

  if (donor.preferredHospitalId === request.hospitalId) {
    score += 10;
    reasons.push("Preferencia pelo hospital");
  }

  return {
    donor,
    score,
    recommendation: getRecommendation(score),
    reasons
  };
}

function getRecommendation(score: number): MatchResult["recommendation"] {
  if (score >= 80) return "Notificar";
  if (score >= 55) return "Reserva";
  return "Aguardar";
}
