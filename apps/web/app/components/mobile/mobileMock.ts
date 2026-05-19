import {
  getHospitalById,
  listAvailableRequestsForDonor
} from "@doe-sangue-angola/shared-services";

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
