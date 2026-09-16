import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "../lib/theme-provider";
import { PrayerProvider } from "../src/context/PrayerContext";
import { checkAppUpdate } from "../src/services/updateService";
import "../lib/notifications";

export default function RootLayout() {
  useEffect(() => {
    checkAppUpdate();
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
