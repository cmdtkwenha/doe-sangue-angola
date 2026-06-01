import type { ExpoConfig } from "expo/config";

const easProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
  "1673a331-7f7e-4a57-af56-d59bc3850b27";
const androidVersionCode = Number(process.env.EXPO_PUBLIC_ANDROID_VERSION_CODE ?? 1);

const config: ExpoConfig = {
  owner: "kwenha",
  name: "Doe Sangue Angola",
  slug: "doe-sangue-angola",
  scheme: "doesangue",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  icon: "./assets/icon.png",
  splash: {
    backgroundColor: "#f8f9fb",
    image: "./assets/splash.png",
    resizeMode: "contain"
  },
  extra: {
    eas: {
      projectId: easProjectId
    }
  },
  plugins: [
    "expo-dev-client",
    [
      "expo-notifications",
      {
        color: "#d71920",
        defaultChannel: "blood-alerts",
        icon: "./assets/notification-icon.png"
      }
    ]
  ],
  ios: {
    bundleIdentifier: "ao.doesangue.app",
    supportsTablet: false,
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
      NSUserTrackingUsageDescription:
        "Usado apenas para melhorar notificações de doação."
    }
  },
  android: {
    package: "ao.doesangue.app",
    versionCode: androidVersionCode,
    permissions: ["POST_NOTIFICATIONS"],
    adaptiveIcon: {
      backgroundColor: "#d71920",
      foregroundImage: "./assets/adaptive-icon.png"
    }
  }
};

export default config;
