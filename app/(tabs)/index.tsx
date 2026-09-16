import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
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

interface PrayerCard {
  id: string;
  name: string;
  time: string;
  date: Date;
  status: "الآن" | "التالي" | "";
  icon: string;
}

const MECCA_LATITUDE = 21.4225;
const MECCA_LONGITUDE = 39.8262;

function getPrayerTimes(): PrayerTimes {
  const coordinates = new Coordinates(
    MECCA_LATITUDE,
    MECCA_LONGITUDE
  );

  const parameters = CalculationMethod.UmmAlQura();
  parameters.madhab = Madhab.Shafi;

  return new PrayerTimes(
    coordinates,
    new Date(),
    parameters
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPrayerCards(): PrayerCard[] {
  const prayerTimes = getPrayerTimes();
  const now = new Date();

  const prayers: PrayerCard[] = [
    {
      id: "fajr",
      name: "الفجر",
      time: formatTime(prayerTimes.fajr),
      date: prayerTimes.fajr,
      status: "",
      icon: "☀",
    },
    {
      id: "dhuhr",
      name: "الظهر",
      time: formatTime(prayerTimes.dhuhr),
      date: prayerTimes.dhuhr,
      status: "",
      icon: "◉",
    },
    {
      id: "asr",
      name: "العصر",
      time: formatTime(prayerTimes.asr),
      date: prayerTimes.asr,
      status: "",
      icon: "◒",
    },
    {
      id: "maghrib",
      name: "المغرب",
      time: formatTime(prayerTimes.maghrib),
      date: prayerTimes.maghrib,
      status: "",
      icon: "☾",
    },
    {
      id: "isha",
      name: "العشاء",
      time: formatTime(prayerTimes.isha),
      date: prayerTimes.isha,
      status: "",
      icon: "☽",
    },
    {
      id: "qiyam",
      name: "قيام الليل",
      time: "12:30 ص",
      date: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        30,
        0
      ),
      status: "",
      icon: "✦",
    },
  ];

  const nextPrayer = prayerTimes.nextPrayer();

  if (nextPrayer) {
    const nextPrayerId = String(nextPrayer);

    return prayers.map((prayer) => ({
      ...prayer,
      status:
        prayer.id === nextPrayerId
          ? "التالي"
          : prayer.date.getTime() <= now.getTime() &&
            prayer.id !== "qiyam"
          ? "الآن"
          : "",
    }));
  }

  return prayers.map((prayer) => ({
    ...prayer,
    status: prayer.id === "fajr" ? "التالي" : "",
  }));
}

export default function HomeTab() {
  const [completedPrayers, setCompletedPrayers] = useState<
    Record<string, boolean>
  >({});

  const prayers = useMemo(() => getPrayerCards(), []);

  const completedCount = prayers.filter(
    (prayer) => completedPrayers[prayer.id]
  ).length;

  const togglePrayer = (id: string) => {
    setCompletedPrayers((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const nextPrayer =
    prayers.find((prayer) => prayer.status === "التالي") ||
    prayers[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>السلام عليكم</Text>
            <Text style={styles.subGreeting}>
              أهلاً بك في صلاتي
            </Text>
          </View>

          <View style={styles.dateBadge}>
            <Text style={styles.dateIcon}>🕋</Text>
            <Text style={styles.dateMonth}>مكة</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>🕋</Text>
          <Text style={styles.locationText}>مكة المكرمة 🕋</Text>
          <Text style={styles.locationHint}>توقيت أم القرى</Text>
        </View>

        <View style={styles.nextCard}>
          <View style={styles.nextCardTop}>
            <Text style={styles.nextLabel}>الصلاة القادمة</Text>
            <Text style={styles.nextStatus}>حسب توقيت مكة</Text>
          </View>

          <View style={styles.nextCardBottom}>
            <View>
              <Text style={styles.nextPrayerName}>
                {nextPrayer.name}
              </Text>
              <Text style={styles.nextPrayerTime}>
                {nextPrayer.time}
              </Text>
            </View>

            <View style={styles.moonCircle}>
              <Text style={styles.moonIcon}>☾</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>مواقيت اليوم</Text>
          <Text style={styles.completedText}>
            {completedCount} / {prayers.length} مكتملة
          </Text>
        </View>

        <ScrollView
          horizontal
          inverted
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {prayers.map((prayer) => {
            const completed = Boolean(
              completedPrayers[prayer.id]
            );

            return (
              <View
                key={prayer.id}
                style={[
                  styles.prayerCard,
                  prayer.status === "الآن" &&
                    styles.currentCard,
                  prayer.status === "التالي" &&
                    styles.nextPrayerCard,
                ]}
              >
                <View style={styles.prayerCardHeader}>
                  <Text style={styles.prayerIcon}>
                    {prayer.icon}
                  </Text>

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

                <Text style={styles.cardPrayerName}>
                  {prayer.name}
                </Text>

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
                    <Text style={styles.statusText}>
                      {prayer.status}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyStatus} />
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>إنجازك اليوم</Text>
            <Text style={styles.progressPercentage}>
              {Math.round(
                (completedCount / prayers.length) * 100
              )}
              %
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(
                    (completedCount / prayers.length) * 100
                  )}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.progressDescription}>
            سجّل صلواتك لتحافظ على استمراريتك اليومية
          </Text>
        </View>
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
    marginBottom: 18,
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
    marginTop: 5,
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
  dateIcon: {
    fontSize: 20,
  },
  dateMonth: {
    color: "#72efdd",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  locationRow: {
    alignItems: "center",
    backgroundColor: "#111d35",
    borderRadius: 12,
    flexDirection: "row-reverse",
    marginBottom: 18,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  locationIcon: {
    fontSize: 19,
    marginLeft: 8,
  },
  locationText: {
    color: "#e9eef7",
    fontSize: 13,
    fontWeight: "700",
  },
  locationHint: {
    color: "#75849c",
    fontSize: 11,
    marginRight: "auto",
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

