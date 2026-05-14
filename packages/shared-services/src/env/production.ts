import { isSupabaseConfigured, publicEnv } from "./publicEnv";

export type ReadinessCheck = {
  name: string;
  passed: boolean;
  help: string;
};

export const getProductionReadiness = (): ReadinessCheck[] => [
  {
    name: "Modo de dados",
    passed: publicEnv.dataMode === "mock" || isSupabaseConfigured(),
    help: "Use mock para demo ou configure Supabase antes de produção real."
  },
  {
    name: "Ambiente",
    passed: ["local", "preview", "production"].includes(publicEnv.appEnv),
    help: "Defina NEXT_PUBLIC_APP_ENV ou EXPO_PUBLIC_APP_ENV."
  }
];
