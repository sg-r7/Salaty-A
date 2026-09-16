import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
} from "adhan";
import {
  cancelAllNotifications,
  registerForPushNotificationsAsync,
  schedulePrayerNotification,
} from "../../lib/notifications";

interface PrayerCard {
  id: string;
  name: string;
  time: string;
  status: "الآن" | "التالي" | "";
  icon: string;
  date: Date;
}

type LocationMode = "local" | "makkah";

export default function HomeTab() {
  const [loading, setLoading] = useState(true);
  const [locationMode, setLocationMode] = useState<LocationMode>("local");
  const [localCityName, setLocalCityName] = useState("الكرمة، الأنبار");
  const [localCoords, setLocalCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 33.385,
    longitude: 43.91,
  });

  const [prayers, setPrayers] = useState<PrayerCard[]>([]);
  const [nextPrayerInfo, setNextPrayerInfo] = useState<{
    name: string;
    time: string;
    date: Date | null;
  }>({
    name: "--",
    time: "--:--",
    date: null,
  });
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");
  const [completedPrayers, setCompletedPrayers] = useState<Record<string, boolean>>({});

  // التاريخ اليومي الفعلي
  const today = new Date();
  const dateDay = today.getDate();
  const dateMonth = today.toLocaleDateString("ar-IQ", { month: "long" });

  // 1. جلب الموقع الجغرافي للجهاز مرة واحدة عند فتح التطبيق
  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      try {
        await registerForPushNotificationsAsync();
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;

          if (isMounted) {
            setLocalCoords({ latitude: lat, longitude: lng });
          }

          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lng,
          });

          if (reverseGeocode.length > 0 && isMounted) {
            const place = reverseGeocode[0];
            const city =
              place.district ||
              place.city ||
              place.subregion ||
              "الأنبار";
            setLocalCityName(`${city} (GPS)`);
          }
        }
      } catch (err) {
        console.warn("GPS lookup fallback to default", err);
      }
    };

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. حساب أوقات الصلاة بناءً على الوضع المختار (محلي أو مكة)
  useEffect(() => {
    let isMounted = true;

    const calculateTimes = async () => {
      setLoading(true);
      try {
        let coords: Coordinates;
        let params: any;

        if (locationMode === "makkah") {
          // إحداثيات مكة المكرمة وطريقة أم القرى
          coords = new Coordinates(21.4225, 39.8262);
          params = CalculationMethod.UmmAlQura();
        } else {
          // إحداثيات الموقع الحالي
          coords = new Coordinates(localCoords.latitude, localCoords.longitude);
          params = CalculationMethod.MuslimWorldLeague();
          params.madhab = Madhab.Shafi;
          params.adjustments.fajr = 0;
          params.adjustments.dhuhr = 1;
          params.adjustments.maghrib = 2;
        }

        const date = new Date();
        const prayerTimes = new PrayerTimes(coords, date, params);

        const formatTime = (t: Date): string =>
          t.toLocaleTimeString("ar-IQ", {
            hour: "2-digit",
            minute: "2-digit",
          });

        // حساب وقت صلاة القيام (الثلث الأخير من الليل)
        const tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowTimes = new PrayerTimes(coords, tomorrow, params);
        const nightDuration =
          tomorrowTimes.fajr.getTime() - prayerTimes.maghrib.getTime();
        const qiyamDate = new Date(
          tomorrowTimes.fajr.getTime() - nightDuration / 3
        );

        const currentPrayerKey = prayerTimes.currentPrayer();
        const nextPrayerKey = prayerTimes.nextPrayer();

        const prayerListConfig = [
          { id: "fajr", name: "الفجر", date: prayerTimes.fajr, icon: "☀" },
          { id: "dhuhr", name: "الظهر", date: prayerTimes.dhuhr, icon: "◉" },
          { id: "asr", name: "العصر", date: prayerTimes.asr, icon: "◒" },
          { id: "maghrib", name: "المغرب", date: prayerTimes.maghrib, icon: "☾" },
          { id: "isha", name: "العشاء", date: prayerTimes.isha, icon: "☽" },
          { id: "qiyam", name: "قيام الليل", date: qiyamDate, icon: "✦" },
        ];

        const calculatedPrayers: PrayerCard[] = prayerListConfig.map((p) => {
          let prayerStatus: "الآن" | "التالي" | "" = "";
          if (p.id === currentPrayerKey) prayerStatus = "الآن";
          else if (p.id === nextPrayerKey) prayerStatus = "التالي";

          return {
            id: p.id,
            name: p.name,
            time: formatTime(p.date),
            status: prayerStatus,
            icon: p.icon,
            date: p.date,
          };
        });

        let nextPName = "الفجر";
        let nextPTime = formatTime(prayerTimes.fajr);
        let nextPDate: Date | null = prayerTimes.fajr;

        const nextObj = calculatedPrayers.find((p) => p.id === nextPrayerKey);
        if (nextObj) {
          nextPName = nextObj.name;
          nextPTime = nextObj.time;
          nextPDate = nextObj.date;
        }

        // جدولة التنبيهات إذا كان على الوضع المحلي
        if (locationMode === "local") {
          await cancelAllNotifications();
          for (const p of calculatedPrayers) {
            await schedulePrayerNotification(p.name, p.date);
          }
        }

        if (isMounted) {
          setPrayers(calculatedPrayers);
          setNextPrayerInfo({
            name: nextPName,
            time: nextPTime,
            date: nextPDate,
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Calculation error:", error);
        if (isMounted) setLoading(false);
      }
    };

    calculateTimes();

    return () => {
      isMounted = false;
    };
  }, [locationMode, localCoords]);

  // 3. عداد تنازلي حي للصلاة القادمة بالثواني
  useEffect(() => {
    if (!nextPrayerInfo.date) return;

    const updateCountdown = () => {
      const diff = nextPrayerInfo.date!.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextPrayerInfo.date]);

  const completedCount = useMemo(
    () =>
      prayers.filter((prayer) => completedPrayers[prayer.id]).length,
    [completedPrayers, prayers]
  );

  const togglePrayer = (id: string) => {
    setCompletedPrayers((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* الترويسة والتاريخ */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>السلام عليكم</Text>
            <Text style={styles.subGreeting}>أهلاً بك في صلاتي</Text>
          </View>

          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{dateDay}</Text>
            <Text style={styles.dateMonth}>{dateMonth}</Text>
          </View>
        </View>

        {/* شريط اختيار الموقع (محلي / مكة المكرمة) */}
        <View style={styles.modeSelector}>
          <Pressable
            onPress={() => setLocationMode("local")}
            style={[
              styles.modeButton,
              locationMode === "local" && styles.modeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.modeButtonText,
                locationMode === "local" && styles.modeButtonTextActive,
              ]}
            >
              📍 {localCityName}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setLocationMode("makkah")}
            style={[
              styles.modeButton,
              locationMode === "makkah" && styles.modeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.modeButtonText,
                locationMode === "makkah" && styles.modeButtonTextActive,
              ]}
            >
              🕋 مكة المكرمة
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#72efdd"
            style={{ marginVertical: 40 }}
          />
        ) : (
          <>
            {/* كرت الصلاة القادمة الكبير */}
            <View style={styles.nextCard}>
              <View style={styles.nextCardTop}>
                <Text style={styles.nextLabel}>الصلاة القادمة</Text>
                <Text style={styles.nextStatus}>بعد {timeLeft}</Text>
              </View>

              <View style={styles.nextCardBottom}>
                <View>
                  <Text style={styles.nextPrayerName}>
                    {nextPrayerInfo.name}
                  </Text>
                  <Text style={styles.nextPrayerTime}>
                    {nextPrayerInfo.time}
                  </Text>
                </View>

                <View style={styles.moonCircle}>
                  <Text style={styles.moonIcon}>☾</Text>
                </View>
              </View>
            </View>

            {/* عنوان القسم وعدد المكتمل */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>مواقيت اليوم</Text>
              <Text style={styles.completedText}>
                {completedCount} / {prayers.length} مكتملة
              </Text>
            </View>

            {/* شريط الكروت المنزلق أفقياً */}
            <ScrollView
              horizontal
              inverted
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {prayers.map((prayer) => {
                const completed = Boolean(completedPrayers[prayer.id]);

                return (
                  <View
                    key={prayer.id}
                    style={[
                      styles.prayerCard,
                      prayer.status === "الآن" && styles.currentCard,
                      prayer.status === "التالي" && styles.nextPrayerCard,
                    ]}
                  >
                    <View style={styles.prayerCardHeader}>
                      <Text style={styles.prayerIcon}>{prayer.icon}</Text>

                      <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: completed }}
                        onPress={() => togglePrayer(prayer.id)}
                        style={[
                          styles.checkbox,
                          completed && styles.checkboxChecked,
                        ]}
                      >
                        {completed ? (
                          <Text style={styles.checkmark}>✓</Text>
                        ) : null}
                      </Pressable>
                    </View>

                    <Text style={styles.cardPrayerName}>{prayer.name}</Text>
                    <Text
                      style={[
                        styles.cardPrayerTime,
                        completed && styles.completedPrayerTime,
                      ]}
                    >
                      {prayer.time}
                    </Text>

                    {prayer.status ? (
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{prayer.status}</Text>
                      </View>
                    ) : (
                      <View style={styles.emptyStatus} />
                    )}
                  </View>
                );
              })}
            </ScrollView>

            {/* بطاقة الإنجاز اليومي */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>إنجازك اليوم</Text>
                <Text style={styles.progressPercentage}>
                  {prayers.length > 0
                    ? Math.round((completedCount / prayers.length) * 100)
                    : 0}
                  %
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        prayers.length > 0
                          ? (completedCount / prayers.length) * 100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressDescription}>
                سجّل صلواتك لتحافظ على استمراريتك اليومية
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1326",
  },
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  greeting: {
    color: "#f5f7fb",
    fontSize: 25,
    fontWeight: "800",
    textAlign: "right",
  },
  subGreeting: {
    color: "#8e9bb0",
    fontSize: 14,
    marginTop: 4,
    textAlign: "right",
  },
  dateBadge: {
    alignItems: "center",
    backgroundColor: "#1a2945",
    borderColor: "#2e466c",
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 58,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dateDay: {
    color: "#72efdd",
    fontSize: 20,
    fontWeight: "800",
  },
  dateMonth: {
    color: "#aebbd0",
    fontSize: 11,
    marginTop: 1,
  },
  modeSelector: {
    backgroundColor: "#111d35",
    borderRadius: 14,
    flexDirection: "row-reverse",
    marginBottom: 20,
    padding: 4,
  },
  modeButton: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 10,
  },
  modeButtonActive: {
    backgroundColor: "#1e3150",
  },
  modeButtonText: {
    color: "#75849c",
    fontSize: 12,
    fontWeight: "700",
  },
  modeButtonTextActive: {
    color: "#72efdd",
  },
  nextCard: {
    backgroundColor: "#183c52",
    borderColor: "#2b6e7d",
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 25,
    padding: 20,
  },
  nextCardTop: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  nextLabel: {
    color: "#b5dfe0",
    fontSize: 14,
    fontWeight: "700",
  },
  nextStatus: {
    color: "#72efdd",
    fontSize: 12,
    fontWeight: "700",
  },
  nextCardBottom: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 16,
  },
  nextPrayerName: {
    color: "#ffffff",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "right",
  },
  nextPrayerTime: {
    color: "#72efdd",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 3,
    textAlign: "right",
  },
  moonCircle: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.16)",
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  moonIcon: {
    color: "#72efdd",
    fontSize: 37,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionTitle: {
    color: "#f4f7fb",
    fontSize: 18,
    fontWeight: "800",
  },
  completedText: {
    color: "#72efdd",
    fontSize: 12,
    fontWeight: "700",
  },
  carousel: {
    gap: 12,
    paddingBottom: 8,
  },
  prayerCard: {
    backgroundColor: "#15223b",
    borderColor: "#263b5e",
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 172,
    padding: 15,
    width: 135,
  },
  currentCard: {
    backgroundColor: "#174958",
    borderColor: "#5acdc5",
  },
  nextPrayerCard: {
    borderColor: "#72efdd",
  },
  prayerCardHeader: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  prayerIcon: {
    color: "#72efdd",
    fontSize: 22,
  },
  checkbox: {
    alignItems: "center",
    borderColor: "#6d7d96",
    borderRadius: 6,
    borderWidth: 1.5,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  checkboxChecked: {
    backgroundColor: "#72efdd",
    borderColor: "#72efdd",
  },
  checkmark: {
    color: "#102337",
    fontSize: 15,
    fontWeight: "900",
  },
  cardPrayerName: {
    color: "#eaf0f8",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 18,
    textAlign: "right",
  },
  cardPrayerTime: {
    color: "#aebbd0",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 7,
    textAlign: "right",
  },
  completedPrayerTime: {
    color: "#72efdd",
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(114, 239, 221, 0.16)",
    borderRadius: 8,
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: "#72efdd",
    fontSize: 10,
    fontWeight: "800",
  },
  emptyStatus: {
    height: 22,
  },
  progressCard: {
    backgroundColor: "#121f36",
    borderColor: "#223552",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 20,
    padding: 17,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  progressTitle: {
    color: "#eaf0f8",
    fontSize: 15,
    fontWeight: "800",
  },
  progressPercentage: {
    color: "#72efdd",
    fontSize: 15,
    fontWeight: "800",
  },
  progressTrack: {
    backgroundColor: "#293952",
    borderRadius: 5,
    height: 8,
    marginTop: 13,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#72efdd",
    borderRadius: 5,
    height: "100%",
  },
  progressDescription: {
    color: "#8290a7",
    fontSize: 12,
    marginTop: 11,
    textAlign: "right",
  },
});

