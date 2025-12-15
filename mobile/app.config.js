export default {
  expo: {
    name: "mobile",
    slug: "mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true
        }
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      usesCleartextTraffic: true,
      package: "com. onyinye23.localbook"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
   extra: {
      eas: {
        projectId: "0b50f5ad-0bfa-4d76-8187-26e91973f41f"
      },
      apiUrl: "http://13.222.56.139:8080/api",  // ← CLOUD IP
      environment: "production"
    },
    owner: "onyinye23"
  }
};