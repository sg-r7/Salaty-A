import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Magnetometer } from "expo-sensors";
import * as Location from "expo-location";
import { Qibla, Coordinates } from "adhan";
import { useRouter } from "expo-router";

const EMA_ALPHA = 0.18;

export default function QiblaScreen() {
  const router = useRouter();

  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [cityName, setCityName] = useState("جاري تحديد موقعك...");
  const [loading, setLoading] = useState(true);
  const [sensorAvailable, setSensorAvailable] = useState<boolean | null>(null);

  const animatedRotation = useRef(new Animated.Value(0)).current;
  const rotationAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const currentAngleRef = useRef(0);
  const qiblaDirectionRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let subscription: { remove: () => void } | null = null;

    const filtered = { x: 0, y: 0, initialized: false };

    // 1. تهيئة الموقع وحساب زاوية القبلة
    const initializeLocationAndQibla = async () => {
      let lat = 33.3850;
      let lng = 43.9100;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            const nextLat = loc.coords.latitude;
            const nextLng = loc.coords.longitude;

            if (
              Number.isFinite(nextLat) &&
              Number.isFinite(nextLng) &&
              nextLat >= -90 &&
              nextLat <= 90 &&
              nextLng >= -180 &&
              nextLng <= 180
            ) {
              lat = nextLat;
              lng = nextLng;
            }

            const geocode = await Location.reverseGeocodeAsync({
              latitude: lat,
              longitude: lng,
            });

            if (!cancelled) {
              if (geocode && geocode.length > 0) {
                const place = geocode[0];
                setCityName(place.district || place.city || "الأنبار");
              } else {
                setCityName("الموقع الفعلي (GPS)");
              }
            }
          } catch {
            if (!cancelled) {
              setCityName("الكرمة / الفلوجة");
            }
          }
        } else if (!cancelled) {
          setCityName("الكرمة / الفلوجة");
        }

        const calculatedQiblaAngle = Qibla(new Coordinates(lat, lng));
        const qiblaAngle = Number.isFinite(calculatedQiblaAngle)
          ? ((Math.round(calculatedQiblaAngle) % 360) + 360) % 360
          : 0;
        if (!cancelled) {
          setQiblaDirection(qiblaAngle);
          qiblaDirectionRef.current = qiblaAngle;
        }
      } catch {
        if (!cancelled) {
          setCityName("الكرمة / الفلوجة");
          const fallbackAngle = Math.round(
            Qibla(new Coordinates(33.3850, 43.9100))
          );
          setQiblaDirection(fallbackAngle);
          qiblaDirectionRef.current = fallbackAngle;
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // 2. تشغيل وضبط حساس البوصلة المغناطيسي
    const initializeCompass = async () => {
      try {
        const available = await Magnetometer.isAvailableAsync();
        if (cancelled) return;

        setSensorAvailable(available);

        if (!available) {
          return;
        }

        Magnetometer.setUpdateInterval(32); // تحديث كل ~32ms (~30 إطار/ثانية)

        subscription = Magnetometer.addListener((data) => {
          if (!data) return;

          const { x, y } = data;
          if (!Number.isFinite(x) || !Number.isFinite(y)) {
            return;
          }

          const magnitude = Math.sqrt(x * x + y * y);

          // تجاهل القراءات غير الصالحة أو الشاذة
          if (!Number.isFinite(magnitude) || magnitude < 0.1) {
            return;
          }

          // تطبيق فلتر EMA على المحاور لتنعيم الارتعاش
          if (!filtered.initialized) {
            filtered.x = x;
            filtered.y = y;
            filtered.initialized = true;
          } else {
            filtered.x = filtered.x + EMA_ALPHA * (x - filtered.x);
            filtered.y = filtered.y + EMA_ALPHA * (y - filtered.y);
          }

          const matchAngle = Math.atan2(-filtered.x, filtered.y);
          let degrees = matchAngle * (180 / Math.PI);
          if (!Number.isFinite(degrees)) {
            return;
          }

          if (degrees < 0) {
            degrees += 360;
          }

          const smoothedHeading = Math.round(degrees);

          if (!cancelled) {
            setHeading(smoothedHeading);
          }

          // حساب زاوية دوران السهم مع أقصر مسار زاوية (Shortest Angular Path)
          const targetAngle =
            (qiblaDirectionRef.current - smoothedHeading + 360) % 360;

          let diff = (targetAngle - (currentAngleRef.current % 360)) % 360;
          if (diff < -180) diff += 360;
          if (diff > 180) diff -= 360;

          const nextAngle = currentAngleRef.current + diff;
          currentAngleRef.current = nextAngle;

          rotationAnimationRef.current?.stop();
          rotationAnimationRef.current = Animated.timing(animatedRotation, {
            toValue: nextAngle,
            duration: 40,
            useNativeDriver: true,
          });
          rotationAnimationRef.current.start();
        });
      } catch {
        if (!cancelled) {
          setSensorAvailable(false);
        }
      }
    };

    void initializeLocationAndQibla();
    void initializeCompass();

    return () => {
      cancelled = true;
      if (subscription) {
        subscription.remove();
      }
      rotationAnimationRef.current?.stop();
      rotationAnimationRef.current = null;
    };
  }, [animatedRotation]);

  const relativeAngle = (qiblaDirection - heading + 360) % 360;
  const isAligned =
    Math.abs(relativeAngle) <= 5 || Math.abs(relativeAngle) >= 355;

  const rotateInterpolate = animatedRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
    extrapolate: "extend",
  });

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

          {sensorAvailable === false ? (
            <Text style={styles.warningText}>
              حساس البوصلة غير متوفر في جهازك، يمكنك الاستدلال بالزاوية الرقمية أدناه.
            </Text>
          ) : (
            <Text style={[styles.statusText, isAligned && styles.alignedText]}>
              {isAligned
                ? "أنت تواجه القبلة بدقة! 🕋"
                : "حرّك الهاتف حتى يلتقي السهم بالأعلى"}
            </Text>
          )}

          <View
            style={[styles.compassCircle, isAligned && styles.alignedBorder]}
          >
            <Animated.View
              style={[
                styles.arrowContainer,
                { transform: [{ rotate: rotateInterpolate }] },
              ]}
            >
              <Text style={styles.arrowIcon}>▲</Text>
              <Text style={styles.kaabaIcon}>🕋</Text>
            </Animated.View>
          </View>

          <View style={styles.degreesBox}>
            <Text style={styles.degreeLabel}>
              زاوية القبلة: {qiblaDirection}°
            </Text>
            <Text style={styles.degreeLabel}>
              درجة البوصلة الحالية: {heading}°
            </Text>
          </View>

          <Text style={styles.calibrationHint}>
            إذا لاحظت عدم استقرار في التوجيه، حرّك الهاتف على شكل رقم 8 (∞) للمعايرة
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0b132b",
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    color: "#6fffe9",
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  body: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  locationTag: {
    color: "#48cae4",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  statusText: {
    color: "#a0aec0",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 25,
    textAlign: "center",
  },
  alignedText: {
    color: "#6fffe9",
    fontWeight: "bold",
  },
  warningText: {
    color: "#f6c667",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  compassCircle: {
    alignItems: "center",
    backgroundColor: "#162038",
    borderColor: "#1c2541",
    borderRadius: 125,
    borderWidth: 4,
    height: 250,
    justifyContent: "center",
    width: 250,
  },
  alignedBorder: {
    borderColor: "#6fffe9",
    borderWidth: 4,
  },
  arrowContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  arrowIcon: {
    color: "#6fffe9",
    fontSize: 44,
    marginBottom: 8,
  },
  kaabaIcon: {
    fontSize: 32,
  },
  degreesBox: {
    alignItems: "center",
    gap: 6,
    marginTop: 35,
  },
  degreeLabel: {
    color: "#cbd5e0",
    fontSize: 15,
  },
  calibrationHint: {
    color: "#6b7c93",
    fontSize: 12,
    marginTop: 20,
    textAlign: "center",
  },
});
