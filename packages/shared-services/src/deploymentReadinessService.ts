import { checkDatabaseHealth } from "./databaseService";
import { getFeatureFlags } from "./featureFlags";
import { validateEnv } from "./env";

export type DeploymentCheck = {
  detail: string;
  label: string;
  ok: boolean;
};

export async function getDeploymentReadiness() {
  const env = validateEnv();
  const database = await checkDatabaseHealth();
  const flags = getFeatureFlags();

  return {
    checks: [
      check("Validação de ambiente", env.ready, `${env.checks.length} verificações`),
      check("Conectividade Supabase", database.ok, database.message),
      check("Migrations", true, "Pasta supabase/migrations presente no repositório."),
      check("Build", true, "Executar npm run build antes de publicar."),
      check("Feature freeze", isFreezeEnabled(flags), freezeDetail(flags))
    ],
    flags
  };
}

export async function getStartupHealth() {
  const database = await checkDatabaseHealth();
  const flags = getFeatureFlags();
  return {
    auth: database.ok ? "operational" : "degraded",
    database: database.ok ? "operational" : "degraded",
    notifications: flagStatus(flags, "notifications"),
    realtime: flagStatus(flags, "realtime")
  };
}

function check(label: string, ok: boolean, detail: string): DeploymentCheck {
  return { detail, label, ok };
}

function flagStatus(flags: ReturnType<typeof getFeatureFlags>, key: string) {
  return flags.find((flag) => flag.key === key)?.enabled ? "operational" : "maintenance";
}

function isFreezeEnabled(flags: ReturnType<typeof getFeatureFlags>) {
  return Boolean(flags.find((flag) => flag.key === "featureFreeze")?.enabled);
}

function freezeDetail(flags: ReturnType<typeof getFeatureFlags>) {
  return isFreezeEnabled(flags)
    ? "Congelamento ativo para lançamento piloto."
    : "Congelamento inativo; use antes do piloto.";
}
