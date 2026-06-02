export const currentHospitalId = "h1";

export const scopedRequests = [
  ["h1", "REQ-240524-001", "O-", "4 bolsas", "UTI Geral", "09:30", "Aberto"],
  ["h1", "REQ-240524-002", "A+", "2 bolsas", "Cirurgia", "11:00", "Em correspondência"],
  ["h1", "REQ-240524-003", "B+", "3 bolsas", "Pediatria", "14:00", "Dador a Caminho"],
  ["h1", "REQ-240524-004", "O+", "2 bolsas", "Maternidade", "16:30", "Concluído"]
];

export const scopedDonors = [
  ["h1", "Maria Luísa", "O-", "2.3 km", "15 min", "4821", "A caminho"],
  ["h1", "Paulo Manuel", "O-", "3.1 km", "18 min", "7483", "A caminho"],
  ["h1", "Helena Daniel", "O-", "4.7 km", "22 min", "1927", "Confirmada"],
  ["h1", "José Caetano", "O-", "5.2 km", "25 min", "6354", "A caminho"]
];

export const scopedAppointments = [
  ["h1", "09:30", "Maria Luísa", "O-", "Confirmado"],
  ["h1", "10:30", "Paulo Manuel", "O-", "Confirmado"],
  ["h1", "11:30", "Helena Daniel", "O-", "Pendente"],
  ["h1", "13:30", "José Caetano", "O-", "Confirmado"]
];

export const scopedInventory = [
  ["h1", "O-", "12", "5", "17", "Crítico"],
  ["h1", "O+", "38", "12", "50", "Adequado"],
  ["h1", "A-", "8", "3", "11", "Baixo"],
  ["h1", "A+", "42", "15", "57", "Adequado"],
  ["h1", "B-", "6", "2", "8", "Baixo"],
  ["h1", "AB+", "14", "4", "18", "Adequado"]
];

export function forHospital<T extends string[]>(rows: T[], hospitalId = currentHospitalId) {
  return rows.filter(([id]) => id === hospitalId);
}
