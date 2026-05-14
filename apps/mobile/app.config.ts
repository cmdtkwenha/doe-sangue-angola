import type { ExpoConfig } from "expo/config";

const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? "";

const config: ExpoConfig = {
  name: "Doe Sangue Angola",
  slug: "doe-sangue-angola",
  scheme: "doesangue",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  owner: "kwenha",
  plugins: [
    "expo-dev-client",
    [
      "expo-notifications",
      {
        color: "#d71920",
        defaultChannel: "blood-alerts"
      }
    ]
  ],
  
  ios: {
    bundleIdentifier: "ao.doesangue.app",
    supportsTablet: false,
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
      NSUserTrackingUsageDescription: "Usado apenas para melhorar notificações de doação."
    }
  },
  android: {
    package: "ao.doesangue.app",
    versionCode: 1,
    permissions: ["POST_NOTIFICATIONS"],
    adaptiveIcon: {
      backgroundColor: "#d71920"
    }
  }
};

export default config;
