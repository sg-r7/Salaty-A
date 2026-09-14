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
  const [cityName, setCityName] = useState("جاري تحديد موقعك...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // إحداثيات احتياطية لمنطقة الكرمة / الفلوجة
      let lat = 33.3850;
      let lng = 43.9100;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;

          const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
          if (geocode.length > 0) {
            const place = geocode[0];
            setCityName(place.district || place.city || "الأنبار");
          } else {
            setCityName("الموقع الفعلي (GPS)");
          }
        } catch {
          setCityName("الكرمة / الفلوجة");
        }
      } else {
        setCityName("الكرمة / الفلوجة");
      }

      // حساب زاوية القبلة الدقيقة من موقعك نحو الكعبة
      const qiblaAngle = Qibla(new Coordinates(lat, lng));
      setQiblaDirection(Math.round(qiblaAngle));
      setLoading(false);
    })();

    Magnetometer.setUpdateInterval(50);
    const subscription = Magnetometer.addListener((data) => {
      // حساب الزاوية بدقة مع مراعاة اتجاه الأجهزة
      let angle = 0;
      if (data) {
        let { x, y } = data;
        let matchAngle = Math.atan2(-x, y);
        let degrees = matchAngle * (180 / Math.PI);
        if (degrees < 0) {
          degrees += 360;
        }
        angle = degrees;
      }
      setHeading(Math.round(angle));
    });

    return () => subscription.remove();
  }, []);

  // حساب الفرق بين الشمال الجغرافي وزاوية الكعبة
  const relativeAngle = (qiblaDirection - heading + 360) % 360;
  const isAligned = Math.abs(relativeAngle) <= 5 || Math.abs(relativeAngle) >= 355;

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
          <Text style={styles.locationTag}>📍 {cityName}</Text>
          <Text style={[styles.statusText, isAligned && styles.alignedText]}>
            {isAligned ? "أنت تواجه القبلة بدقة! 🕋" : "حرّك الهاتف حتى يلتقي السهم بالأعلى"}
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
            <Text style={styles.degreeLabel}>درجة البوصلة الحالية: {heading}°</Text>
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
  locationTag: { color: "#48cae4", fontSize: 14, marginBottom: 8, fontWeight: "600" },
  statusText: { fontSize: 16, color: "#a0aec0", marginBottom: 25, fontWeight: "600" },
  alignedText: { color: "#6fffe9", fontWeight: "bold" },
  compassCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 4,
    borderColor: "#1c2541",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#162038",
  },
  alignedBorder: { borderColor: "#6fffe9", borderWidth: 4 },
  arrowContainer: { alignItems: "center", justifyContent: "center" },
  arrowIcon: { fontSize: 44, color: "#6fffe9", marginBottom: 8 },
  kaabaIcon: { fontSize: 32 },
  degreesBox: { marginTop: 35, alignItems: "center", gap: 6 },
  degreeLabel: { color: "#cbd5e0", fontSize: 15 },
});
