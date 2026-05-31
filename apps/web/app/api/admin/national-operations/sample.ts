import type { NationalOperationsData } from "../../../components/admin/national/nationalTypes";

export function sampleNationalOperations(): NationalOperationsData {
  return {
    alerts: [
      { id: "a1", title: "Inventário baixo de O-", message: "Luanda precisa de reforço imediato.", severity: "critical" },
      { id: "a2", title: "Pedido sem resposta", message: "Hospital Provincial aguarda dadores A+.", severity: "warning" },
      { id: "a3", title: "Unidades a expirar", message: "Rever stock B+ nas próximas 48 horas.", severity: "warning" }
    ],
    auditTrail: [
      { id: "l1", actor: "Sistema", action: "Pedido crítico criado", time: "Hoje 09:42" },
      { id: "l2", actor: "Hospital", action: "PIN validado", time: "Hoje 09:36" },
      { id: "l3", actor: "Admin", action: "Hospital aprovado", time: "Hoje 09:20" }
    ],
    bloodTypes: [
      monitor("O-", 12, 30, 18, "critical"),
      monitor("O+", 44, 60, 16, "warning"),
      monitor("A-", 18, 20, 4, "stable"),
      monitor("A+", 70, 45, 7, "surplus"),
      monitor("B-", 9, 15, 6, "critical"),
      monitor("B+", 32, 28, 3, "stable"),
      monitor("AB-", 8, 8, 1, "stable"),
      monitor("AB+", 14, 10, 0, "surplus")
    ],
    metrics: [
      metric("Total de dadores", "1.250", "Amostra piloto", "green"),
      metric("Dadores ativos", "842", "Disponíveis", "green"),
      metric("Hospitais verificados", "25", "Lista aprovada", "black"),
      metric("Pedidos abertos", "18", "Em operação", "red"),
      metric("Pedidos críticos", "5", "Atenção nacional", "red"),
      metric("Doações hoje", "9", "Hoje", "gold"),
      metric("Doações no mês", "146", "Mês atual", "green")
    ],
    municipalities: [
      area("Luanda", "critical", 9, 3, 7, 1),
      area("Lobito", "warning", 4, 1, 3, 0),
      area("Huambo", "stable", 2, 0, 4, 2)
    ],
    provinces: [
      area("Luanda", "critical", 12, 4, 9, 0),
      area("Benguela", "warning", 5, 1, 5, 1),
      area("Huambo", "stable", 2, 0, 4, 2),
      area("Uíge", "surplus", 1, 0, 3, 2)
    ],
    rankings: [
      { province: "Luanda", donations: 72, activeDonors: 540, hospitals: 11 },
      { province: "Benguela", donations: 36, activeDonors: 188, hospitals: 5 },
      { province: "Huambo", donations: 22, activeDonors: 96, hospitals: 4 }
    ],
    sampleMode: true
  };
}

function metric(label: string, value: string, change: string, tone: "red" | "gold" | "black" | "green") {
  return { change, label, tone, value };
}

function monitor(bloodType: string, units: number, safeMinimum: number, demand: number, status: "critical" | "warning" | "stable" | "surplus") {
  return { bloodType, demand, safeMinimum, status, units };
}

function area(name: string, level: "critical" | "warning" | "stable" | "surplus", requests: number, critical: number, hospitals: number, surplus: number) {
  return { critical, donations: requests * 3, hospitals, level, name, requests, surplus };
}
