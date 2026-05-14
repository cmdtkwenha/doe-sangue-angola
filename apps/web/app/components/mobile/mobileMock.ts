import {
  getHospitalById,
  listAvailableRequestsForDonor
} from "@doe-sangue-angola/shared-services";

export const donor = {
  name: "Maria João Santos",
  id: "SA-2024-000125",
  bloodType: "O+",
  phone: "+244 923 456 789",
  points: "1.250",
  level: "OURO",
  nextLevel: "Faltam 750 pontos para Platina",
  eligibility: "Elegível a partir de 12/06/2026",
  profileCompletion: 82
};

export const shortcuts = [
  ["Pedidos", "2"],
  ["Cartão", ""],
  ["Agenda", ""],
  ["Prêmios", ""]
];

export const requests = listAvailableRequestsForDonor("d1").map((request, index) => ({
  id: request.id,
  bloodType: request.bloodType,
  urgency: request.urgency === "Critica" ? "URGENTE" : request.urgency.toUpperCase(),
  hospital: getHospitalById(request.hospitalId)?.name ?? "Hospital",
  units: `Precisam de ${request.units} bolsas`,
  distance: ["2,3 km", "4,8 km", "6,1 km"][index] ?? "5,4 km",
  time: ["14:30", "18:00", "20:00"][index] ?? "19:30",
  tone: request.urgency === "Critica" ? "critical" : "warning"
}));

export const matchReasons = [
  "Tipo sanguíneo compatível",
  "Próximo ao hospital",
  "Última doação: 3 meses atrás",
  "Você está disponível"
];

export const donationSummary = [
  ["Total de doações", "6"],
  ["Este ano", "2"],
  ["Vidas impactadas", "18"],
  ["Litros doados", "3,600"]
];

export const donationHistory = [
  ["12/03/2026", "Hospital Geral de Luanda", "O+"],
  ["18/11/2025", "Clínica Girassol", "O+"],
  ["07/08/2025", "Centro Hemoterápico", "O+"]
];

export const emergencyContact = {
  name: "Manuel Santos",
  relation: "Contacto de emergência",
  phone: "+244 923 456 789"
};
