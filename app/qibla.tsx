import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Magnetometer } from "expo-sensors";
import * as Location from "expo-location";
import { Qibla, Coordinates } from "adhan";
import { useRouter } from "expo-router";

export default function QiblaScreen() {
  const router = useRouter();
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let lat = 33.3152;
      let lng = 44.3661;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        } catch {}
      }

      const qiblaAngle = Qibla(new Coordinates(lat, lng));
      setQiblaDirection(Math.round(qiblaAngle));
      setLoading(false);
    })();

    Magnetometer.setUpdateInterval(100);
    const subscription = Magnetometer.addListener((data) => {
      let angle = Math.atan2(-data.y, data.x) * (180 / Math.PI);
      angle = angle < 0 ? angle + 360 : angle;
      setHeading(Math.round(angle));
    });

    return () => subscription.remove();
  }, []);

  const relativeAngle = (qiblaDirection - heading + 360) % 360;
  const isAligned = Math.abs(relativeAngle) <= 4 || Math.abs(relativeAngle) >= 356;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← عودة</Text>
        </TouchableOpacity>
        <Text style={styles.title}>اتجاه القبلة</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6fffe9" style={{ flex: 1 }} />
      ) : (
        <View style={styles.body}>
          <Text style={[styles.statusText, isAligned && styles.alignedText]}>
            {isAligned ? "أنت تواجه القبلة بدقة! 🕋" : "حرّك الهاتف باتجاه السهم"}
          </Text>

          <View style={[styles.compassCircle, isAligned && styles.alignedBorder]}>
            <View
              style={[
                styles.arrowContainer,
                { transform: [{ rotate: `${relativeAngle}deg` }] },
              ]}
            >
              <Text style={styles.arrowIcon}>▲</Text>
              <Text style={styles.kaabaIcon}>🕋</Text>
            </View>
          </View>

          <View style={styles.degreesBox}>
            <Text style={styles.degreeLabel}>زاوية القبلة: {qiblaDirection}°</Text>
            <Text style={styles.degreeLabel}>اتجاه البوصلة: {heading}°</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b132b" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  backBtn: { padding: 8 },
  backText: { color: "#6fffe9", fontSize: 16, fontWeight: "bold" },
  title: { fontSize: 20, fontWeight: "bold", color: "#ffffff" },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 40 },
  statusText: { fontSize: 18, color: "#a0aec0", marginBottom: 30, fontWeight: "600" },
  alignedText: { color: "#48cae4", fontWeight: "bold" },
  compassCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 4,
    borderColor: "#1c2541",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#162038",
  },
  alignedBorder: { borderColor: "#48cae4" },
  arrowContainer: { alignItems: "center", justifyContent: "center" },
  arrowIcon: { fontSize: 44, color: "#6fffe9", marginBottom: 8 },
  kaabaIcon: { fontSize: 32 },
  degreesBox: { marginTop: 35, alignItems: "center", gap: 6 },
  degreeLabel: { color: "#cbd5e0", fontSize: 15 },
});

