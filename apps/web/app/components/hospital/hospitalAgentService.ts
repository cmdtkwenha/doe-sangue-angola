import {
  auditAgent,
  fraudAgent,
  matchingAgent,
  schedulingAgent
} from "@doe-sangue-angola/agents";
import {
  communications,
  getHospitalById,
  getHospitalDashboard,
  inventory,
  listDonors,
  listRequests
} from "@doe-sangue-angola/shared-services";
import { currentHospitalId } from "./hospitalPortalData";
import type { Donor, Hospital } from "@doe-sangue-angola/shared-types";

const dashboard = getHospitalDashboard(currentHospitalId);
const fallbackHospital: Hospital = {
  id: currentHospitalId,
  name: "Hospital selecionado",
  province: "Luanda",
  municipality: "Luanda",
  verified: true,
  capacity: 0,
  contact: ""
};
const fallbackDonor: Donor = {
  id: "sem-dador",
  name: "Dador pendente",
  bloodType: "O-",
  province: "Luanda",
  municipality: "Luanda",
  available: false,
  lastDonation: "",
  points: 0
};
const hospital = dashboard.hospital ?? getHospitalById(currentHospitalId) ?? fallbackHospital;
const hospitalRequests = dashboard.requests;
const primaryRequest = hospitalRequests[0] ?? listRequests()[0];
const matches = dashboard.incomingDonors.length
  ? dashboard.incomingDonors
  : matchingAgent(primaryRequest, listDonors());
const primaryDonor = matches[0]?.donor ?? fallbackDonor;
const scheduled = schedulingAgent(primaryDonor, hospital);
const risk = fraudAgent(primaryRequest, primaryDonor);

export const pinValidation = {
  donor: primaryDonor.name,
  bloodType: primaryDonor.bloodType,
  pin: scheduled.pin,
  risk: risk.risk
};

export const donorArrivals = (matches.length ? matches : [{ donor: primaryDonor, score: 0 }]).slice(0, 3).map((match, index) => ({
  name: match.donor.name,
  bloodType: match.donor.bloodType,
  eta: `${15 + index * 4} min`,
  pin: index === 0 ? scheduled.pin : String(4821 + index * 631).slice(0, 4),
  score: match.score,
  status: index === 0 ? "Confirmar chegada" : "A caminho"
}));

export const performanceKpis = [
  ["Taxa de Conclusão", "92%", "+12%"],
  ["Resposta Média", "28 min", "-5 min"],
  ["Pedidos Concluídos", "142", "+18%"],
  ["Doações Recebidas", "368", "+22%"]
];

export const expiringUnits = [
  ["O+", "12 unidades", "Vence em 2 dias"],
  ["A+", "8 unidades", "Vence em 3 dias"],
  ["B-", "6 unidades", "Vence em 4 dias"]
];

export const regionAlerts = [
  ["Crítico", "Luanda com falta de O-", "Notificar dadores compatíveis"],
  ["Atenção", "Viana abaixo do mínimo A+", "Reservar 8 unidades"],
  ["Estável", "Kilamba Kiaxi com cobertura normal", "Monitorizar"]
];

export const hospitalMessages = communications.map((item) => ({
  title: item.channel,
  body: item.message,
  status: item.status,
  target: item.recipient
}));

export const auditHistory = [
  auditAgent("schedulingAgent", `Gerou PIN ${scheduled.pin}`, 0),
  auditAgent("matchingAgent", `Selecionou ${matches.length} dadores`, 1),
  auditAgent("fraudAgent", `Risco ${risk.risk} para ${primaryRequest.id}`, 2),
  auditAgent("Dr. João Mendes", "Confirmou fila de dadores", 3)
];

export const quickActions = [
  ["Novo Pedido de Sangue", "Criar pedido", "red"],
  ["Pedido Urgente", "Notificar dadores agora", "gold"],
  ["Confirmar Chegada", "Validar PIN do dador", "green"],
  ["Mensagem aos Dadores", "Enviar comunicação", "black"]
];

export const inventoryCoverage = inventory.map((item) => ({
  type: item.bloodType,
  units: item.units,
  low: item.units < item.safeMinimum
}));
