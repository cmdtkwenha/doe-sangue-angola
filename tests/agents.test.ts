import { eligibilityAgent } from "@doe-sangue-angola/agents";
import { fraudAgent } from "@doe-sangue-angola/agents";
import { matchingAgent } from "@doe-sangue-angola/agents";
import { rewardAgent } from "@doe-sangue-angola/agents";
import { schedulingAgent } from "@doe-sangue-angola/agents";
import { getRedirectForRole } from "@doe-sangue-angola/shared-services";
import type { BloodRequest, Donor, Hospital } from "@doe-sangue-angola/shared-types";

declare const assert: typeof import("node:assert/strict");
declare function test(name: string, fn: () => void): void;

const hospital: Hospital = {
  id: "h-luanda",
  name: "Hospital Geral de Luanda",
  province: "Luanda",
  municipality: "Kilamba Kiaxi",
  verified: true,
  capacity: 84,
  contact: "+244 923 000 118"
};

const maria: Donor = {
  id: "d-maria",
  name: "Maria João Santos",
  bloodType: "O-",
  province: "Luanda",
  municipality: "Talatona",
  available: true,
  lastDonation: "2026-01-18",
  points: 1280,
  preferredHospitalId: hospital.id
};

const paulo: Donor = {
  ...maria,
  id: "d-paulo",
  name: "Paulo Manuel",
  bloodType: "A+",
  preferredHospitalId: "h-outra"
};

const request: BloodRequest = {
  id: "r-o-negativo",
  hospitalId: hospital.id,
  patientCode: "PAC-4821",
  bloodType: "O-",
  units: 4,
  urgency: "Critica",
  status: "Aberto",
  createdAt: "2026-05-12T09:00:00Z"
};

test("compatibilidade sanguínea favorece dador O- para pedido O-", () => {
  const [best] = matchingAgent(request, [paulo, maria]);

  assert.equal(best.donor.name, "Maria João Santos");
  assert.ok(best.reasons.includes("Tipo sanguineo compativel"));
});

test("matchingAgent calcula pontuação máxima para Maria", () => {
  const [best] = matchingAgent(request, [maria]);

  assert.equal(best.score, 100);
  assert.equal(best.recommendation, "Notificar");
});

test("eligibilityAgent aprova dador saudável", () => {
  const result = eligibilityAgent({
    feelingSick: false,
    weightOk: true,
    recentTravel: false,
    medication: false,
    lastDonationOk: true
  });

  assert.equal(result.eligible, true);
  assert.equal(result.blockers.length, 0);
});

test("rewardAgent soma pontos e mantém nível Ouro", () => {
  const reward = rewardAgent(maria, true);

  assert.equal(reward.currentPoints, 1400);
  assert.equal(reward.earned, 120);
  assert.equal(reward.tier, "Ouro");
});

test("schedulingAgent gera PIN de 4 dígitos determinístico", () => {
  const first = schedulingAgent(maria, hospital);
  const second = schedulingAgent(maria, hospital);

  assert.match(first.pin, /^\d{4}$/);
  assert.equal(first.pin, second.pin);
});

test("fraudAgent marca risco alto quando há múltiplos sinais", () => {
  const result = fraudAgent({ ...request, patientCode: "P1", units: 10 }, maria);

  assert.equal(result.risk, "alto");
  assert.equal(result.flags.length, 2);
});

test("redirecionamento por função leva cada perfil ao portal correto", () => {
  assert.equal(getRedirectForRole("admin"), "/admin");
  assert.equal(getRedirectForRole("hospital"), "/hospital");
  assert.equal(getRedirectForRole("donor"), "/mobile");
});
