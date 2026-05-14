import type { Locale } from "@doe-sangue-angola/shared-types";

type CopyKey =
  | "appName"
  | "adminPortal"
  | "hospitalPortal"
  | "donorApp"
  | "urgentRequest";

export const copy: Record<Locale, Record<CopyKey, string>> = {
  pt: {
    appName: "Doe Sangue Angola",
    adminPortal: "Portal administrativo",
    hospitalPortal: "Portal hospitalar",
    donorApp: "Aplicacao do dador",
    urgentRequest: "Pedido urgente de sangue"
  },
  en: {
    appName: "Donate Blood Angola",
    adminPortal: "Admin portal",
    hospitalPortal: "Hospital portal",
    donorApp: "Donor app",
    urgentRequest: "Urgent blood request"
  },
  fr: {
    appName: "Don de Sang Angola",
    adminPortal: "Portail administratif",
    hospitalPortal: "Portail hospitalier",
    donorApp: "Application donneur",
    urgentRequest: "Demande de sang urgente"
  }
};

export function t(locale: Locale, key: CopyKey) {
  return copy[locale][key];
}
