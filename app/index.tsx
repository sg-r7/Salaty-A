import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from "adhan";
import {
  registerForPushNotificationsAsync,
  schedulePrayerNotification,
  cancelAllNotifications,
} from "../lib/notifications";

interface PrayerItem {
  name: string;
  time: string;
  isNext?: boolean;
}

export default function PrayerHomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("جاري تحديد الموقع بدقة...");
  const [prayersList, setPrayersList] = useState<PrayerItem[]>([]);
  const [nextPrayerInfo, setNextPrayerInfo] = useState<{ name: string; time: string }>({
    name: "...",
    time: "...",
  });

  useEffect(() => {
    (async () => {
      await registerForPushNotificationsAsync();

      // الإحداثيات الاحتياطية الدقيقة لقضاء الكرمة / الفلوجة
      let latitude = 33.3850;
      let longitude = 43.9100;

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        try {
          // جلب الموقع الفعلي عبر GPS بدقة عالية
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;

          // استخراج اسم المدينة والمنطقة تلقائياً
          const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (reverseGeocode.length > 0) {
            const place = reverseGeocode[0];
            const city = place.district || place.city || place.subregion || "الأنبار";
            setLocationName(`📍 ${city} (GPS)`);
          } else {
            setLocationName("📍 الموقع الحالي (GPS)");
          }
        } catch {
          setLocationName("📍 الكرمة / الفلوجة (افتراضي)");
        }
      } else {
        setLocationName("📍 الكرمة / الفلوجة (افتراضي)");
      }

      // حساب المواقيت الفلكية
      const coords = new Coordinates(latitude, longitude);
      
      // معايير متطابقة مع تقويم العراق (أم القرى / رابطة العالم الإسلامي مع مذهب الشافعي)
      const params = CalculationMethod.MuslimWorldLeague();
      params.madhab = Madhab.Shafi;
      // تعديل فارق الاحتياط لدقائق الإمساك والمغرب
      params.adjustments.fajr = 0;
      params.adjustments.dhuhr = 1;
      params.adjustments.maghrib = 2;

      const date = new Date();
      const prayerTimes = new PrayerTimes(coords, date, params);

      const formatTime = (d: Date) =>
        d.toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" });

      const list: PrayerItem[] = [
        { name: "الفجر", time: formatTime(prayerTimes.fajr) },
        { name: "الشروق", time: formatTime(prayerTimes.sunrise) },
        { name: "الظهر", time: formatTime(prayerTimes.dhuhr) },
        { name: "العصر", time: formatTime(prayerTimes.asr) },
        { name: "المغرب", time: formatTime(prayerTimes.maghrib) },
        { name: "العشاء", time: formatTime(prayerTimes.isha) },
      ];

      // تحديد الصلاة القادمة وجدولة التنبيهات
      await cancelAllNotifications();
      const next = prayerTimes.nextPrayer();
      let nextName = "الفجر";
      let nextTime = formatTime(prayerTimes.fajr);

      const prayerMap: Record<string, { name: string; date: Date }> = {
        fajr: { name: "الفجر", date: prayerTimes.fajr },
        sunrise: { name: "الشروق", date: prayerTimes.sunrise },
        dhuhr: { name: "الظهر", date: prayerTimes.dhuhr },
        asr: { name: "العصر", date: prayerTimes.asr },
        maghrib: { name: "المغرب", date: prayerTimes.maghrib },
        isha: { name: "العشاء", date: prayerTimes.isha },
      };

      if (next && prayerMap[next]) {
        nextName = prayerMap[next].name;
        nextTime = formatTime(prayerMap[next].date);
      }

      // جدولة إشعارات الصلوات
      for (const key of Object.keys(prayerMap)) {
        await schedulePrayerNotification(prayerMap[key].name, prayerMap[key].date);
      }

      const updatedList = list.map((item) => ({
        ...item,
        isNext: item.name === nextName,
      }));

      setPrayersList(updatedList);
      setNextPrayerInfo({ name: nextName, time: nextTime });
      setLoading(false);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>صلاتي | SALATY</Text>
          <Text style={styles.dateText}>{locationName}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#48cae4" style={{ marginVertical: 30 }} />
        ) : (
          <>
            <View style={styles.nextPrayerCard}>
              <Text style={styles.nextPrayerLabel}>الصلاة القادمة</Text>
              <Text style={styles.nextPrayerName}>صلاة {nextPrayerInfo.name}</Text>
              <Text style={styles.nextPrayerTime}>{nextPrayerInfo.time}</Text>
            </View>

            <View style={styles.listCard}>
              {prayersList.map((prayer, index) => (
                <View
                  key={index}
                  style={[
                    styles.prayerRow,
                    prayer.isNext && styles.activePrayerRow,
                    index === prayersList.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={[styles.prayerName, prayer.isNext && styles.activeText]}>
                    {prayer.name}
                  </Text>
                  <Text style={[styles.prayerTime, prayer.isNext && styles.activeText]}>
                    {prayer.time}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/qibla")}
          >
            <Text style={styles.navBtnText}>🧭 اتجاه القبلة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/tasbeeh")}
          >
            <Text style={styles.navBtnText}>📿 المسبحة والأذكار</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b132b" },
  content: { padding: 20 },
  header: { alignItems: "center", marginBottom: 15 },
  title: { fontSize: 24, fontWeight: "bold", color: "#6fffe9" },
  dateText: { fontSize: 13, color: "#a0aec0", marginTop: 4 },
  nextPrayerCard: {
    backgroundColor: "#1c2541",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#3a506b",
  },
  nextPrayerLabel: { color: "#a0aec0", fontSize: 13 },
  nextPrayerName: { color: "#ffffff", fontSize: 24, fontWeight: "bold", marginVertical: 4 },
  nextPrayerTime: { color: "#48cae4", fontSize: 28, fontWeight: "bold" },
  listCard: {
    backgroundColor: "#1c2541",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  prayerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2d3748",
  },
  activePrayerRow: {
    backgroundColor: "rgba(72, 202, 228, 0.12)",
    marginHorizontal: -10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  prayerName: { color: "#edf2f7", fontSize: 16, fontWeight: "600" },
  prayerTime: { color: "#cbd5e0", fontSize: 16 },
  activeText: { color: "#48cae4", fontWeight: "bold" },
  buttonRow: { flexDirection: "row", gap: 12 },
  navBtn: {
    flex: 1,
    backgroundColor: "#1f4068",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  navBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "bold" },
});
