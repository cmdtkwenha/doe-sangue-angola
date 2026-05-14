export const demandTrend = [28, 35, 31, 44, 52, 48, 61];
export const donationTrend = [18, 22, 26, 24, 31, 37, 42];
export const fulfilmentTrend = [62, 68, 71, 76, 81, 84, 89];
export const forecastTrend = [8, 10, 12, 16, 19, 24, 28];

export const provinceRankings = [
  ["Luanda", 1248],
  ["Benguela", 824],
  ["Huambo", 688],
  ["Huíla", 512],
  ["Uíge", 430]
] as const;

export const donorActivity = [
  ["Ativos", 68, "#087443"],
  ["Em espera", 22, "#d7aa3f"],
  ["Indisponíveis", 10, "#d01424"]
] as const;

export const bloodDemandShare = [
  ["O-", 34, "#d01424"],
  ["O+", 28, "#f08a24"],
  ["A+", 22, "#d7aa3f"],
  ["Outros", 16, "#087443"]
] as const;

export const adminTrends = [
  ["Procura O-", "61", "+18%", "Crítico"],
  ["Doações", "42", "+11%", "Estável"],
  ["Cumprimento", "89%", "+5%", "Bom"],
  ["Previsão escassez", "28", "+9%", "Atenção"]
] as const;

export const hospitalTrends = [
  ["Tempo resposta", "28 min", "-5 min", "Melhor"],
  ["Dadores recebidos", "368", "+22%", "Forte"],
  ["Pedidos concluídos", "142", "+18%", "Bom"],
  ["PIN validados", "96%", "+4%", "Seguro"]
] as const;
