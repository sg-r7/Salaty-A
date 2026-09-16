import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "../lib/theme-provider";
import { PrayerProvider } from "../src/context/PrayerContext";
import "../lib/notifications";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <PrayerProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </PrayerProvider>
    </ThemeProvider>
  );
}
