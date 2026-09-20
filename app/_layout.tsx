import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "../lib/theme-provider";
import { PrayerProvider } from "../src/context/PrayerContext";
import { checkAppUpdate } from "../src/services/updateService";

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      try {
        if (typeof checkAppUpdate !== "function") {
          console.warn("App update check is unavailable.");
          return;
        }

        await checkAppUpdate();
      } catch (error) {
        // Update checks are optional and must never prevent the app from launching.
        console.warn("App update check failed during launch.", error);
      }
    };

    void initializeApp();
  }, []);

  return (
    <ThemeProvider>
      <PrayerProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </PrayerProvider>
    </ThemeProvider>
  );
}
