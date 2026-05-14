import { isSupabaseReady, loadEnvironment, type EnvironmentConfig } from "./environment";

export type EnvCheckLevel = "ok" | "aviso" | "erro";

export type EnvCheck = {
  name: string;
  level: EnvCheckLevel;
  message: string;
  founderHelp: string;
};

export type EnvValidationResult = {
  ready: boolean;
  checks: EnvCheck[];
};

const check = (
  name: string,
  level: EnvCheckLevel,
  message: string,
  founderHelp: string
): EnvCheck => ({ name, level, message, founderHelp });

export function validateEnv(config: EnvironmentConfig = loadEnvironment()): EnvValidationResult {
  const checks: EnvCheck[] = [
    check("Ambiente", "ok", config.label, "Mostra se está em desenvolvimento, staging ou produção."),
    check(
      "Modo de dados",
      config.dataMode === "supabase" && !isSupabaseReady(config) ? "erro" : "ok",
      config.dataMode === "mock" ? "Mock seguro" : "Supabase",
      "Use mock para demos. Use Supabase apenas quando a base de dados estiver pronta."
    )
  ];

  if (config.authMode === "supabase" && !isSupabaseReady(config)) {
    checks.push(
      check("Autenticação", "erro", "Supabase Auth sem chaves", "Configure Supabase antes de usar auth real.")
    );
  }

  if (config.mode !== "development" && !config.appUrl.startsWith("https://")) {
    checks.push(
      check("URL pública", "erro", "URL sem HTTPS", "Staging e produção devem usar uma URL segura com HTTPS.")
    );
  }

  if (config.mode === "production" && config.dataMode === "mock") {
    checks.push(
      check("Dados de produção", "aviso", "Produção em mock", "Seguro para demo, mas não para operação real.")
    );
  }

  if (config.mode === "production" && config.pilotMode) {
    checks.push(
      check("Modo piloto", "aviso", "Piloto ativo", "Confirme se a produção deve estar limitada ao piloto.")
    );
  }

  if (!config.safeNotifications) {
    checks.push(
      check("Notificações", "aviso", "Notificações reais permitidas", "Use com cuidado e confirme consentimento.")
    );
  }

  return {
    ready: checks.every((item) => item.level !== "erro"),
    checks
  };
}

export const getEnvironmentStatus = (config: EnvironmentConfig = loadEnvironment()) => ({
  config,
  validation: validateEnv(config)
});
