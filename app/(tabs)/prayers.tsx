import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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

interface PrayerRow {
  id: string;
  name: string;
  time: string;
  icon: string;
  isNightPrayer?: boolean;
  date: Date;
}

export default function PrayersTab() {
  const [loading, setLoading] = useState(true);
  const [locationTitle, setLocationTitle] = useState("الكرمة، الأنبار");
  const [dateString, setDateString] = useState("");
  const [prayerRows, setPrayerRows] = useState<PrayerRow[]>([]);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    qiyam: false,
  });

  const loadPrayerTimes = async () => {
    setLoading(true);
    try {
      await registerForPushNotificationsAsync();

      // التاريخ الحالي باللغة العربية
      const now = new Date();
      const formattedDate = now.toLocaleDateString("ar-IQ", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setDateString(formattedDate);

      let latitude = 33.385;
      let longitude = 43.91;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;

          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (reverseGeocode.length > 0) {
            const place = reverseGeocode[0];
            const city =
              place.district ||
              place.city ||
              place.subregion ||
              "الأنبار";
            setLocationTitle(`${city} (GPS)`);
          }
        } catch {
          setLocationTitle("الكرمة، الأنبار (افتراضي)");
        }
      }

      const coordinates = new Coordinates(latitude, longitude);
      const params = CalculationMethod.MuslimWorldLeague();
      params.madhab = Madhab.Shafi;
      params.adjustments.fajr = 0;
      params.adjustments.dhuhr = 1;
      params.adjustments.maghrib = 2;

      const prayerTimes = new PrayerTimes(coordinates, now, params);

      const formatTime = (t: Date): string =>
        t.toLocaleTimeString("ar-IQ", {
          hour: "2-digit",
          minute: "2-digit",
        });

      // حساب وقت قيام الليل فلكياً (الثلث الأخير من الليل)
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);
      const nightDuration =
        tomorrowTimes.fajr.getTime() - prayerTimes.maghrib.getTime();
      const qiyamDate = new Date(
        tomorrowTimes.fajr.getTime() - nightDuration / 3
      );

      const rows: PrayerRow[] = [
        {
          id: "fajr",
          name: "الفجر",
          time: formatTime(prayerTimes.fajr),
          icon: "☀",
          date: prayerTimes.fajr,
        },
        {
          id: "sunrise",
          name: "الشروق",
          time: formatTime(prayerTimes.sunrise),
          icon: "◒",
          date: prayerTimes.sunrise,
        },
        {
          id: "dhuhr",
          name: "الظهر",
          time: formatTime(prayerTimes.dhuhr),
          icon: "◉",
          date: prayerTimes.dhuhr,
        },
        {
          id: "asr",
          name: "العصر",
          time: formatTime(prayerTimes.asr),
          icon: "◐",
          date: prayerTimes.asr,
        },
        {
          id: "maghrib",
          name: "المغرب",
          time: formatTime(prayerTimes.maghrib),
          icon: "☾",
          date: prayerTimes.maghrib,
        },
        {
          id: "isha",
          name: "العشاء",
          time: formatTime(prayerTimes.isha),
          icon: "☽",
          date: prayerTimes.isha,
        },
        {
          id: "qiyam",
          name: "قيام الليل",
          time: formatTime(qiyamDate),
          icon: "✦",
          isNightPrayer: true,
          date: qiyamDate,
        },
      ];

      setPrayerRows(rows);
    } catch (error) {
      console.error("Error loading prayers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const toggleNotification = async (id: string) => {
    const updatedState = !notifications[id];
    setNotifications((current) => ({
      ...current,
      [id]: updatedState,
    }));

    // إعادة جدولة الإشعارات حسب حالة التبديل
    await cancelAllNotifications();
    for (const row of prayerRows) {
      const isEnabled = row.id === id ? updatedState : notifications[row.id];
      if (isEnabled && row.id !== "sunrise") {
        await schedulePrayerNotification(row.name, row.date);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>أوقات الصلاة</Text>
          <Text style={styles.subtitle}>{dateString || "جاري التحميل..."}</Text>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationIconBox}>
            <Text style={styles.locationIcon}>⌖</Text>
          </View>

          <View style={styles.locationTextBox}>
            <Text style={styles.locationTitle}>{locationTitle}</Text>
            <Text style={styles.locationSubtitle}>
              مواقيت اليوم حسب موقعك الجغرافي
            </Text>
          </View>

          <Pressable
            style={styles.refreshButton}
            onPress={loadPrayerTimes}
            disabled={loading}
          >
            <Text style={styles.refreshText}>↻</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#72efdd"
            style={{ marginVertical: 30 }}
          />
        ) : (
          <View style={styles.listCard}>
            {prayerRows.map((prayer, index) => (
              <View
                key={prayer.id}
                style={[
                  styles.prayerRow,
                  prayer.isNightPrayer && styles.qiyamRow,
                  index === prayerRows.length - 1 && styles.lastRow,
                ]}
              >
                <View style={styles.prayerInfo}>
                  <View
                    style={[
                      styles.prayerIconBox,
                      prayer.isNightPrayer && styles.qiyamIconBox,
                    ]}
                  >
                    <Text style={styles.prayerIcon}>{prayer.icon}</Text>
                  </View>

                  <View>
                    <Text style={styles.prayerName}>{prayer.name}</Text>
                    {prayer.isNightPrayer ? (
                      <Text style={styles.prayerHint}>وقت مستحب</Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.prayerActions}>
                  <Text style={styles.prayerTime}>{prayer.time}</Text>

                  {prayer.id !== "sunrise" ? (
                    <Switch
                      value={Boolean(notifications[prayer.id])}
                      onValueChange={() => toggleNotification(prayer.id)}
                      trackColor={{
                        false: "#35445d",
                        true: "#327e82",
                      }}
                      thumbColor={
                        notifications[prayer.id] ? "#72efdd" : "#a8b4c7"
                      }
                    />
                  ) : (
                    <View style={styles.emptySwitch} />
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ⓘ</Text>
          <Text style={styles.infoText}>
            يتم تحديث المواقيت تلقائياً حسب موقعك الجغرافي الدقيق وطريقة الحساب
            المعتمدة.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0b1326",
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 35,
  },
  header: {
    marginBottom: 22,
  },
  title: {
    color: "#f5f7fb",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "right",
  },
  subtitle: {
    color: "#8997ad",
    fontSize: 13,
    marginTop: 6,
    textAlign: "right",
  },
  locationCard: {
    alignItems: "center",
    backgroundColor: "#15243d",
    borderColor: "#263c5d",
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row-reverse",
    marginBottom: 20,
    padding: 13,
  },
  locationIconBox: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.14)",
    borderRadius: 12,
    height: 43,
    justifyContent: "center",
    width: 43,
  },
  locationIcon: {
    color: "#72efdd",
    fontSize: 23,
  },
  locationTextBox: {
    flex: 1,
    marginHorizontal: 11,
  },
  locationTitle: {
    color: "#f0f5fb",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },
  locationSubtitle: {
    color: "#8492a9",
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },
  refreshButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  refreshText: {
    color: "#72efdd",
    fontSize: 26,
  },
  listCard: {
    backgroundColor: "#121e35",
    borderColor: "#223654",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 15,
  },
  prayerRow: {
    alignItems: "center",
    borderBottomColor: "#263750",
    borderBottomWidth: 1,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    minHeight: 76,
  },
  qiyamRow: {
    backgroundColor: "rgba(114, 239, 221, 0.04)",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  prayerInfo: {
    alignItems: "center",
    flexDirection: "row-reverse",
  },
  prayerIconBox: {
    alignItems: "center",
    backgroundColor: "#1e3150",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    marginLeft: 11,
    width: 42,
  },
  qiyamIconBox: {
    backgroundColor: "#23434e",
  },
  prayerIcon: {
    color: "#72efdd",
    fontSize: 21,
  },
  prayerName: {
    color: "#edf2f8",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
  },
  prayerHint: {
    color: "#72efdd",
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },
  prayerActions: {
    alignItems: "center",
    flexDirection: "row-reverse",
    gap: 10,
  },
  prayerTime: {
    color: "#c3cede",
    fontSize: 15,
    fontWeight: "800",
  },
  emptySwitch: {
    height: 31,
    width: 51,
  },
  infoCard: {
    alignItems: "center",
    backgroundColor: "#10283a",
    borderRadius: 14,
    flexDirection: "row-reverse",
    marginTop: 18,
    padding: 14,
  },
  infoIcon: {
    color: "#72efdd",
    fontSize: 20,
    marginLeft: 9,
  },
  infoText: {
    color: "#a7b7c9",
    flex: 1,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "right",
  },
});

