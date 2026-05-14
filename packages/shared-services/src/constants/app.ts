export const appConstants = {
  name: "Doe Sangue Angola",
  defaultLocale: "pt",
  supportedLocales: ["pt", "en", "fr"],
  supportPhone: "+244 923 456 789",
  supportEmail: "suporte@doesangue.ao"
} as const;

export const deploymentTargets = {
  web: "Vercel",
  mobile: "Expo Application Services",
  backend: "Supabase"
} as const;
