import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
} from "adhan";

interface PrayerRow {
  id: string;
  name: string;
  time: string;
  icon: string;
  isNightPrayer?: boolean;
}

const MECCA_LATITUDE = 21.4225;
const MECCA_LONGITUDE = 39.8262;

function createPrayerRows(): PrayerRow[] {
  const coordinates = new Coordinates(
    MECCA_LATITUDE,
    MECCA_LONGITUDE
  );

  const parameters = CalculationMethod.UmmAlQura();
  parameters.madhab = Madhab.Shafi;

  const prayerTimes = new PrayerTimes(
    coordinates,
    new Date(),
    parameters
  );

  const formatTime = (date: Date): string =>
    date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return [
    {
      id: "fajr",
      name: "الفجر",
      time: formatTime(prayerTimes.fajr),
      icon: "☀",
    },
    {
      id: "sunrise",
      name: "الشروق",
      time: formatTime(prayerTimes.sunrise),
      icon: "◒",
    },
    {
      id: "dhuhr",
      name: "الظهر",
      time: formatTime(prayerTimes.dhuhr),
      icon: "◉",
    },
    {
      id: "asr",
      name: "العصر",
      time: formatTime(prayerTimes.asr),
      icon: "◐",
    },
    {
      id: "maghrib",
      name: "المغرب",
      time: formatTime(prayerTimes.maghrib),
      icon: "☾",
    },
    {
      id: "isha",
      name: "العشاء",
      time: formatTime(prayerTimes.isha),
      icon: "☽",
    },
    {
      id: "qiyam",
      name: "قيام الليل",
      time: "12:30 ص",
      icon: "✦",
      isNightPrayer: true,
    },
  ];
}

export default function PrayersTab() {
  const prayerRows = useMemo(() => createPrayerRows(), []);

  const [notifications, setNotifications] = useState<
    Record<string, boolean>
  >({
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    qiyam: false,
  });

  const toggleNotification = (id: string) => {
    setNotifications((current) => ({
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
        <View style={styles.header}>
          <Text style={styles.title}>أوقات الصلاة</Text>
          <Text style={styles.subtitle}>
            مكة المكرمة 🕋 · طريقة حساب أم القرى
          </Text>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationIconBox}>
            <Text style={styles.locationIcon}>🕋</Text>
          </View>

          <View style={styles.locationTextBox}>
            <Text style={styles.locationTitle}>
              مكة المكرمة 🕋
            </Text>
            <Text style={styles.locationSubtitle}>
              مواقيت اليوم حسب تقويم أم القرى
            </Text>
          </View>

          <Text style={styles.fixedText}>ثابت</Text>
        </View>

        <View style={styles.listCard}>
          {prayerRows.map((prayer, index) => (
            <View
              key={prayer.id}
              style={[
                styles.prayerRow,
                prayer.isNightPrayer && styles.qiyamRow,
                index === prayerRows.length - 1 &&
                  styles.lastRow,
              ]}
            >
              <View style={styles.prayerInfo}>
                <View
                  style={[
                    styles.prayerIconBox,
                    prayer.isNightPrayer &&
                      styles.qiyamIconBox,
                  ]}
                >
                  <Text style={styles.prayerIcon}>
                    {prayer.icon}
                  </Text>
                </View>

                <View>
                  <Text style={styles.prayerName}>
                    {prayer.name}
                  </Text>

                  {prayer.isNightPrayer ? (
                    <Text style={styles.prayerHint}>
                      وقت مستحب
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.prayerActions}>
                <Text style={styles.prayerTime}>
                  {prayer.time}
                </Text>

                {prayer.id !== "sunrise" ? (
                  <Switch
                    value={Boolean(notifications[prayer.id])}
                    onValueChange={() =>
                      toggleNotification(prayer.id)
                    }
                    trackColor={{
                      false: "#35445d",
                      true: "#327e82",
                    }}
                    thumbColor={
                      notifications[prayer.id]
                        ? "#72efdd"
                        : "#a8b4c7"
                    }
                  />
                ) : (
                  <View style={styles.emptySwitch} />
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ⓘ</Text>
          <Text style={styles.infoText}>
            تم تثبيت الموقع على مكة المكرمة بإحداثيات
            {" "}
            21.4225, 39.8262، وتستخدم المواقيت طريقة حساب أم
            القرى.
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
    color: "#72efdd",
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
    fontSize: 22,
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
  fixedText: {
    color: "#72efdd",
    fontSize: 11,
    fontWeight: "800",
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
